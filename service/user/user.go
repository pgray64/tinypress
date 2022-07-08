/*
Package user is for services related to user accounts

Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/
package user

import (
	"errors"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgerrcode"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/pgray64/tinypress/conf"
	"github.com/pgray64/tinypress/database"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"time"
)

type User struct {
	ID           int       `gorm:"primaryKey;autoIncrement"`
	DisplayName  string    `gorm:"not null;size:100"`
	Email        string    `gorm:"not null;size:255"`
	Username     string    `gorm:"uniqueIndex:idx_users_username,where:deleted_at is null;not null;size:100"`
	PasswordHash string    `gorm:"not null"`
	CreatedAt    time.Time `gorm:"autoCreateTime"`
	UpdatedAt    time.Time `gorm:"autoUpdateTime"`
	DeletedAt    gorm.DeletedAt
	RoleMappings []RoleMapping
}

func (user *User) Create() (isDup bool, err error) {
	insertRes := database.Database.Create(&user)
	var pgErr *pgconn.PgError

	if insertRes.Error != nil && errors.As(insertRes.Error, &pgErr) && pgErr.Code == pgerrcode.UniqueViolation {
		return true, nil
	}
	return false, insertRes.Error
}

func ListUsersWithRoles(page int, perPage int) (users []User, totalCount int64, err error) {
	countRes := database.Database.Find(&User{}).Count(&totalCount)
	if countRes.Error != nil {
		return users, totalCount, countRes.Error
	}

	offset := perPage * page
	selectRes := database.Database.
		Model(&User{}).
		Preload("RoleMappings").
		Order("id desc").
		Offset(offset).
		Limit(perPage).
		Find(&users)

	return users, totalCount, selectRes.Error
}

func GetUserWithRoles(userId int) (*User, error) {
	var users []User
	selectRes := database.Database.
		Where(map[string]interface{}{"id": userId}).
		Preload("RoleMappings").
		Order("id desc").
		Limit(1).
		Find(&users)
	if selectRes.Error != nil {
		return nil, selectRes.Error
	}
	if len(users) < 1 {
		return nil, nil
	}
	return &users[0], nil
}

// CheckCredentials returns the user if credentials are valid
func CheckCredentials(username string, password string) (*User, error) {
	var user User
	selectRes := database.Database.Where(map[string]interface{}{"username": username}).First(&user)

	if selectRes.Error != nil {
		if errors.Is(selectRes.Error, gorm.ErrRecordNotFound) {
			// Don't allow enumeration of existing users
			return nil, nil
		} else {
			return nil, selectRes.Error
		}
	}
	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)) != nil {
		// Password didn't match - abort
		return nil, nil
	}

	return &user, nil
}
func CreateUserSession(userId int, c echo.Context) error {
	sess, err := session.Get(conf.SessionKey, c)
	if err != nil {
		return err
	}
	sess.Values[conf.SessionUserIdKey] = userId
	err = sess.Save(c.Request(), c.Response())
	return err
}
