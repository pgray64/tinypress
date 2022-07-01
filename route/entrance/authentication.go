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
	"github.com/pgray64/tinypress/service/user"
	"net/http"
	"strings"
)

type signInForm struct {
	Username string `json:"username" validate:"required"`
	Password string `json:"password" validate:"required"`
}

func SignIn(c echo.Context) error {
	formData := new(signInForm)
	if err := c.Bind(formData); err != nil {
		return echo.ErrInternalServerError
	}
	if err := c.Validate(formData); err != nil {
		return echo.ErrBadRequest
	}

	username := strings.ToLower(strings.TrimSpace(formData.Username))
	password := formData.Password

	authedUser, err := user.CheckCredentials(username, password)
	if err != nil {
		return echo.ErrInternalServerError
	}
	if authedUser != nil {
		err = user.CreateUserSession(authedUser.ID, c)
		if err != nil {
			return echo.ErrInternalServerError
		}
	} else {
		return echo.NewHTTPError(http.StatusInternalServerError, "Incorrect username or password.")
	}
	return c.JSON(http.StatusOK, new(struct{}))
}
