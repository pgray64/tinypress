/*
Package entrance is for routes that are unauthenticated

Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/
package entrance

import (
	"github.com/labstack/echo/v4"
	"github.com/pgray64/tinypress/conf"
	"github.com/pgray64/tinypress/enum/userrole"
	"github.com/pgray64/tinypress/service/media"
	"github.com/pgray64/tinypress/service/settings"
	"github.com/pgray64/tinypress/service/user"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"strings"
)

type siteSetupForm struct {
	SiteName           string `json:"siteName" validate:"required,max=100"`
	DisplayName        string `json:"displayName" validate:"required,max=100"`
	Email              string `json:"email" validate:"required,email,max=255"`
	Username           string `json:"username" validate:"required,alphanum,max=100"`
	Password           string `json:"password" validate:"required"`
	SmtpServer         string `json:"smtpServer" validate:"required,max=255"`
	SmtpUsername       string `json:"smtpUsername" validate:"required,max=255"`
	SmtpPassword       string `json:"smtpPassword" validate:"required,max=255"`
	SmtpPort           string `json:"smtpPort" validate:"required,max=16"`
	ImageDirectoryPath string `json:"imageDirectoryPath" validate:"required,max=255"`
}

func SiteSetup(c echo.Context) error {
	formData := new(siteSetupForm)
	if err := c.Bind(formData); err != nil {
		return echo.ErrInternalServerError
	}
	if err := c.Validate(formData); err != nil {
		return echo.ErrBadRequest
	}

	// Ensure this is the first run
	siteExists, err := settings.SiteExists()
	if err != nil {
		return echo.ErrInternalServerError
	}
	if siteExists {
		return echo.ErrForbidden
	}

	var newSettings = settings.Settings{
		Active:             true,
		SiteName:           strings.TrimSpace(formData.SiteName),
		ImageDirectoryPath: strings.TrimRight(formData.ImageDirectoryPath, "/\\"),
		SmtpServer:         formData.SmtpServer,
		SmtpUsername:       formData.SmtpUsername,
		SmtpPassword:       formData.SmtpPassword,
		SmtpPort:           formData.SmtpPort,
	}

	// Abort setup if image directory is unwritable
	if !media.TestImageDirectoryPath(newSettings.ImageDirectoryPath) {
		return echo.NewHTTPError(http.StatusBadRequest, "Image directory test failed - ensure it exists and allows read and write access")
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(formData.Password), conf.BcryptCost)
	if err != nil {
		return echo.ErrInternalServerError
	}

	var newUser = user.User{
		DisplayName:  strings.TrimSpace(formData.DisplayName),
		Email:        strings.ToLower(strings.TrimSpace(formData.Email)),
		Username:     strings.ToLower(strings.TrimSpace(formData.Username)),
		PasswordHash: string(hashedPassword),
	}
	// Create settings for new site
	err = newSettings.Create()
	if err != nil {
		return echo.ErrInternalServerError
	}

	// Create the first user
	isDup, err := newUser.Create()
	if err != nil {
		return echo.ErrInternalServerError
	}

	if isDup {
		// No way for this to happen unless installing over old install or someone ran manual SQL
		return echo.NewHTTPError(http.StatusBadRequest, "Username is already in use")
	}

	// First user for new customer gets all roles
	err = user.CreateOrUpdateRoleMappings(newUser.ID, []userrole.UserRole{
		userrole.Admin, userrole.Editor, userrole.User,
	})
	if err != nil {
		return echo.ErrInternalServerError
	}

	// Log in the user
	err = user.CreateUserSession(newUser.ID, c)
	if err != nil {
		return echo.ErrInternalServerError
	}

	return c.JSON(http.StatusOK, new(struct{}))
}
