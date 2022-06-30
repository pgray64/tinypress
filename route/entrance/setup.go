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
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/pgray64/tinypress/conf"
	"github.com/pgray64/tinypress/service/settings"
	"github.com/pgray64/tinypress/service/user"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"strings"
)

type siteSetupForm struct {
	SiteName    string `json:"siteName" validate:"required"`
	DisplayName string `json:"displayName" validate:"required"`
	Email       string `json:"email" validate:"required,email"`
	Username    string `json:"username" validate:"required,alphanum"`
	Password    string `json:"password" validate:"required"`
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
		Active:   true,
		SiteName: strings.TrimSpace(formData.SiteName),
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
	err = newSettings.Create()
	if err != nil {
		return echo.ErrInternalServerError
	}
	isDup, err := newUser.Create()
	if err != nil {
		return echo.ErrInternalServerError
	}

	if isDup {
		// No way for this to happen unless installing over old install or someone ran manual SQL
		return echo.NewHTTPError(http.StatusBadRequest, "Username is already in use")
	}

	// Log in the user
	sess, err := session.Get(conf.SessionKey, c)
	if err != nil {
		return echo.ErrInternalServerError
	}
	sess.Values[conf.SessionUserIdKey] = newUser.ID
	err = sess.Save(c.Request(), c.Response())
	if err != nil {
		return echo.ErrInternalServerError
	}

	return c.JSON(http.StatusOK, new(struct{}))
}
