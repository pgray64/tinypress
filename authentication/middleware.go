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
	"github.com/pgray64/tinypress/database"
	"github.com/pgray64/tinypress/enum/productfeature"
	"github.com/pgray64/tinypress/service/user"
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

		// Load user from DB
		var currentUser user.User

		selectRes := database.Database.Where(map[string]interface{}{"id": userId}).First(&currentUser)

		if selectRes.Error != nil {
			// AllTenantsDB issue or session exists for user that no longer exists
			sess.Options.MaxAge = -1
			sess.Save(c.Request(), c.Response())
			return echo.ErrInternalServerError
		}

		// Any authed route can grab the current user now
		authContext := &AuthContext{Context: c, UserId: userId}

		// Populate features user has access to
		allowedFeatures, err := user.GetFeaturesForUser(currentUser.ID)
		authContext.AllowedFeatures = allowedFeatures

		// Save updates cookie expiration to now + cookie duration
		err = sess.Save(c.Request(), c.Response())
		if err != nil {
			return echo.ErrInternalServerError
		}
		return next(authContext)
	}
}

func RequireProductFeatureMiddleware(feature productfeature.ProductFeature) func(next echo.HandlerFunc) echo.HandlerFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authContext := c.(*AuthContext)
			allowedFeatures, err := user.GetFeaturesForUser(authContext.UserId)
			if err != nil {
				return echo.ErrInternalServerError
			}
			for _, allowedFeature := range allowedFeatures {
				if feature == allowedFeature {
					return next(authContext)
				}
			}
			return echo.ErrForbidden
		}

	}
}
