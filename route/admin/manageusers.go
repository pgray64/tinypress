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
	"errors"
	"github.com/jackc/pgconn"
	"github.com/jackc/pgerrcode"
	"github.com/labstack/echo/v4"
	"github.com/pgray64/tinypress/authentication"
	"github.com/pgray64/tinypress/conf"
	"github.com/pgray64/tinypress/database"
	"github.com/pgray64/tinypress/enum/userrole"
	"github.com/pgray64/tinypress/service/user"
	"golang.org/x/crypto/bcrypt"
	"math"
	"net/http"
	"strings"
)

type addUserForm struct {
	DisplayName   string              `json:"displayName" validate:"required,max=100"`
	Email         string              `json:"email" validate:"required,email,max=255"`
	Username      string              `json:"username" validate:"required,alphanum,max=100"`
	Password      string              `json:"password" validate:"required"`
	SelectedRoles []userrole.UserRole `json:"selectedRoles" validate:"required"`
}
type AddUserResponse struct {
	UserId int
}

func AddUser(c echo.Context) error {
	formData := new(addUserForm)
	if err := c.Bind(formData); err != nil {
		return echo.ErrInternalServerError
	}
	if err := c.Validate(formData); err != nil {
		return echo.ErrBadRequest
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(formData.Password), conf.BcryptCost)
	if err != nil {
		return echo.ErrInternalServerError
	}

	newUser := user.User{
		DisplayName:  strings.TrimSpace(formData.DisplayName),
		Email:        strings.ToLower(strings.TrimSpace(formData.Email)),
		Username:     strings.ToLower(strings.TrimSpace(formData.Username)),
		PasswordHash: string(hashedPassword),
	}

	// Create the user
	isDup, err := newUser.Create()
	if err != nil {
		return echo.ErrInternalServerError
	}

	if isDup {
		return echo.NewHTTPError(http.StatusBadRequest, "Username is already in use")
	}

	// Set roles
	err = user.CreateOrUpdateRoleMappings(newUser.ID, formData.SelectedRoles)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "An error occurred saving user roles.")
	}

	return c.JSON(http.StatusOK, AddUserResponse{
		UserId: newUser.ID,
	})
}

type userResultItem struct {
	ID          int                 `json:"id"`
	DisplayName string              `json:"displayName"`
	Username    string              `json:"username"`
	Email       string              `json:"email"`
	UserRoles   []userrole.UserRole `json:"userRoles"`
}
type userListResult struct {
	UserList  []userResultItem `json:"userList"`
	PageCount int64            `json:"pageCount"`
}
type listUsersRequest struct {
	Page int `json:"page"`
}

const ListUsersPerPage = 10

func ListUsers(c echo.Context) error {
	paging := new(listUsersRequest)
	if err := c.Bind(paging); err != nil {
		return echo.ErrInternalServerError
	}

	var users, totalCount, err = user.ListUsersWithRoles(paging.Page, ListUsersPerPage)
	if err != nil {
		return echo.ErrInternalServerError
	}

	var userResults = make([]userResultItem, len(users))

	for i, row := range users {
		userResults[i] = userResultItem{
			ID:          row.ID,
			DisplayName: row.DisplayName,
			Username:    row.Username,
			Email:       row.Email,
			UserRoles:   user.GetRolesFromRoleMappings(row.RoleMappings),
		}
	}
	var result = userListResult{
		PageCount: int64(math.Ceil(float64(totalCount) / float64(ListUsersPerPage))),
		UserList:  userResults,
	}
	return c.JSON(http.StatusOK, result)
}

type getUserRequest struct {
	ID int `json:"id" validate:"required,min=1"`
}

func GetUser(c echo.Context) error {
	request := new(getUserRequest)
	if err := c.Bind(request); err != nil {
		return echo.ErrInternalServerError
	}
	if err := c.Validate(request); err != nil {
		return echo.ErrBadRequest
	}

	rawUser, err := user.GetUserWithRoles(request.ID)
	if err != nil {
		return echo.ErrInternalServerError
	}
	if rawUser == nil {
		return echo.ErrNotFound
	}

	var userResult = userResultItem{
		ID:          rawUser.ID,
		DisplayName: rawUser.DisplayName,
		Username:    rawUser.Username,
		Email:       rawUser.Email,
		UserRoles:   user.GetRolesFromRoleMappings(rawUser.RoleMappings),
	}

	return c.JSON(http.StatusOK, userResult)
}

type deleteUserRequest struct {
	ID int `json:"id" validate:"required,min=1"`
}

func DeleteUser(c echo.Context) error {
	authContext := c.(*authentication.AuthContext)
	request := new(deleteUserRequest)
	if err := c.Bind(request); err != nil {
		return echo.ErrInternalServerError
	}
	if err := c.Validate(request); err != nil {
		return echo.ErrBadRequest
	}

	if request.ID == authContext.UserId {
		return echo.NewHTTPError(http.StatusForbidden, "You can't delete the user you are logged in as.")
	}

	deleteRes := database.Database.Where(&user.User{ID: request.ID}).Delete(&user.User{})
	if deleteRes.Error != nil {
		return echo.ErrInternalServerError
	}
	return c.JSON(http.StatusOK, new(struct{}))
}

type updateUserForm struct {
	ID            int                 `json:"id" validate:"required,min=1"`
	DisplayName   string              `json:"displayName" validate:"required,max=100"`
	Email         string              `json:"email" validate:"required,email,max=255"`
	Username      string              `json:"username" validate:"required,alphanum,max=100"`
	SelectedRoles []userrole.UserRole `json:"selectedRoles" validate:"required"`
}

func UpdateUser(c echo.Context) error {
	formData := new(updateUserForm)
	if err := c.Bind(formData); err != nil {
		return echo.ErrInternalServerError
	}
	if err := c.Validate(formData); err != nil {
		return echo.ErrBadRequest
	}

	updateRes := database.Database.Where(&user.User{ID: formData.ID}).
		Updates(&user.User{DisplayName: formData.DisplayName, Username: formData.Username, Email: formData.Email})
	var pgErr *pgconn.PgError
	if updateRes.Error != nil {
		if errors.As(updateRes.Error, &pgErr) && pgErr.Code == pgerrcode.UniqueViolation {
			return echo.NewHTTPError(http.StatusInternalServerError, "Username is already in use.")
		}
		return echo.ErrInternalServerError
	}
	// Set roles
	// Ensure we have at least one admin
	isRemovingLastAdmin, err := user.IsRemovingLastAdmin(formData.ID, formData.SelectedRoles)
	if err != nil {
		return echo.ErrInternalServerError
	}
	if isRemovingLastAdmin {
		return echo.NewHTTPError(http.StatusForbidden, "You need at least one user with the admin role.")
	}
	err = user.CreateOrUpdateRoleMappings(formData.ID, formData.SelectedRoles)
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "An error occurred saving user roles.")
	}
	return c.JSON(http.StatusOK, new(struct{}))
}
