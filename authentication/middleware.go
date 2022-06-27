/*
Package authentication is for authentication of users in Tinypress

Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/
package authentication

import (
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/pgray64/tinypress/conf"
)

func AuthenticatedSessionMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		sess, err := session.Get(conf.SessionKey, c)
		if err != nil {
			return echo.ErrInternalServerError
		}
		userId, ok := sess.Values[conf.SessionUserIdKey].(int)

		if !ok || userId < 1 {
			// If not logged in, expire the session
			sess.Options.MaxAge = -1
			err = sess.Save(c.Request(), c.Response())
			if err != nil {
				return echo.ErrInternalServerError
			}
			return echo.ErrUnauthorized
		}

		// TODO Load user from DB

		// Any authed route can grab the current user now
		authContext := &AuthContext{Context: c, UserId: userId}

		// TODO Load roles or access level into session

		// Save updates cookie expiration to now + cookie duration
		err = sess.Save(c.Request(), c.Response())
		if err != nil {
			return echo.ErrInternalServerError
		}
		return next(authContext)
	}
}
