/*
Package account is for routes related to user account management

Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/
package account

import (
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/pgray64/tinypress/authentication"
	"github.com/pgray64/tinypress/conf"
	"github.com/pgray64/tinypress/enum/productfeature"
	"net/http"
)

type checkSessionResult struct {
	UserId          int                             `json:"userId"`
	AllowedFeatures []productfeature.ProductFeature `json:"allowedFeatures"`
}

func CheckSession(c echo.Context) error {
	authContext := c.(*authentication.AuthContext)
	return c.JSON(http.StatusOK, checkSessionResult{
		UserId:          authContext.UserId,
		AllowedFeatures: authContext.AllowedFeatures,
	})
}

func SignOut(c echo.Context) error {
	sess, err := session.Get(conf.SessionKey, c)
	if err != nil {
		return echo.ErrInternalServerError
	}
	sess.Options.MaxAge = -1
	err = sess.Save(c.Request(), c.Response())
	if err != nil {
		return echo.ErrInternalServerError
	}
	return c.JSON(http.StatusOK, new(struct{}))
}
