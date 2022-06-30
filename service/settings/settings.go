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
	Active   bool   `gorm:"primaryKey"`
	SiteName string `gorm:"not null;size:100" `
}

func (settings Settings) Create() error {
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
