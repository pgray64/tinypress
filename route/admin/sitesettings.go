/*
Package admin is for routes related to admin actions

Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/
package admin

import (
	"github.com/labstack/echo/v4"
	"github.com/pgray64/tinypress/service/media"
	"github.com/pgray64/tinypress/service/settings"
	"net/http"
	"strings"
)

type updateSettingsForm struct {
	SiteName           string `json:"siteName" validate:"required,max=100"`
	SmtpServer         string `json:"smtpServer" validate:"required,max=255"`
	SmtpUsername       string `json:"smtpUsername" validate:"required,max=255"`
	SmtpPassword       string `json:"smtpPassword" validate:"required,max=255"`
	SmtpPort           string `json:"smtpPort" validate:"required,max=16"`
	ImageDirectoryPath string `json:"imageDirectoryPath" validate:"required,max=255"`
}

func UpdateSiteSettings(c echo.Context) error {
	formData := new(updateSettingsForm)
	if err := c.Bind(formData); err != nil {
		return echo.ErrInternalServerError
	}
	if err := c.Validate(formData); err != nil {
		return echo.ErrBadRequest
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

	// Create settings for new site
	err := settings.UpdateSettings(&newSettings)
	if err != nil {
		return echo.ErrInternalServerError
	}

	return c.JSON(http.StatusOK, new(struct{}))
}

type siteSettingsResult struct {
	SiteName           string `json:"siteName"`
	SmtpServer         string `json:"smtpServer"`
	SmtpUsername       string `json:"smtpUsername"`
	SmtpPassword       string `json:"smtpPassword"`
	SmtpPort           string `json:"smtpPort"`
	ImageDirectoryPath string `json:"imageDirectoryPath"`
}

func GetSiteSettings(c echo.Context) error {
	settings, err := settings.GetSettings()
	if err != nil {
		return echo.ErrInternalServerError
	}
	settingsResult := siteSettingsResult{
		SiteName:           settings.SiteName,
		SmtpServer:         settings.SmtpServer,
		SmtpUsername:       settings.SmtpUsername,
		SmtpPassword:       settings.SmtpPassword,
		SmtpPort:           settings.SmtpPort,
		ImageDirectoryPath: settings.ImageDirectoryPath,
	}
	return c.JSON(http.StatusOK, settingsResult)
}
