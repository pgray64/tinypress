/*
Package user is for user account management

Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/
package user

import (
	"gorm.io/gorm"
	"time"
)

type User struct {
	ID           int64     `gorm:"primaryKey;autoIncrement"`
	DisplayName  string    `gorm:"not null;size:100"`
	Email        string    `gorm:"uniqueIndex:idx_users_email,where:deleted_at is null;not null;size:255"`
	Username     string    `gorm:"uniqueIndex:idx_users_username,where:deleted_at is null;not null;size:255"`
	PasswordHash string    `gorm:"not null"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime"`
	DeletedAt    gorm.DeletedAt
}
