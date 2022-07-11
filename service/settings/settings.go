/*
Package settings is for services related to settings

Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/
package settings

import (
	"errors"
	"github.com/pgray64/tinypress/database"
)

type Settings struct {
	Active             bool   `gorm:"primaryKey"`
	SiteName           string `gorm:"not null;size:100"`
	SmtpServer         string `gorm:"not null;size:255"`
	SmtpUsername       string `gorm:"not null;size:255"`
	SmtpPassword       string `gorm:"not null;size:255"`
	SmtpPort           string `gorm:"not null;size:16"`
	ImageDirectoryPath string `gorm:"not null;size:255"`
}

func (settings *Settings) Create() error {
	if !settings.Active {
		return errors.New("inserting an inactive setting entry is now allowed")
	}
	insertRes := database.Database.Create(&settings)
	return insertRes.Error
}

func SiteExists() (bool, error) {
	var count int64
	countRes := database.Database.Model(&Settings{}).Count(&count)
	return count > 0, countRes.Error
}

func GetSettings() (*Settings, error) {
	var settings Settings
	selectRes := database.Database.Where(map[string]interface{}{"active": true}).First(&settings)
	if selectRes.Error != nil {
		return nil, selectRes.Error
	}
	return &settings, nil
}

func UpdateGeneralSettings(settings *Settings) error {
	if !settings.Active {
		return errors.New("inserting an inactive setting entry is now allowed")
	}
	insertRes := database.Database.Where(map[string]interface{}{"active": true}).Updates(&Settings{
		SiteName:           settings.SiteName,
		ImageDirectoryPath: settings.ImageDirectoryPath,
	})
	return insertRes.Error
}

func UpdateSmtpSettings(settings *Settings) error {
	if !settings.Active {
		return errors.New("inserting an inactive setting entry is now allowed")
	}
	insertRes := database.Database.Where(map[string]interface{}{"active": true}).Updates(&Settings{
		SmtpServer:   settings.SmtpServer,
		SmtpUsername: settings.SmtpUsername,
		SmtpPassword: settings.SmtpPassword,
		SmtpPort:     settings.SmtpPort,
	})
	return insertRes.Error
}
