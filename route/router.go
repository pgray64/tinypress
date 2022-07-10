/*
Package route is for api endpoint routing in the Tinypress application

Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/
package route

import (
	"github.com/go-playground/validator/v10"
	"github.com/gorilla/sessions"
	"github.com/labstack/echo-contrib/session"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/pgray64/tinypress/authentication"
	"github.com/pgray64/tinypress/conf"
	"github.com/pgray64/tinypress/database"
	"github.com/pgray64/tinypress/enum/productfeature"
	"github.com/pgray64/tinypress/route/account"
	"github.com/pgray64/tinypress/route/admin"
	"github.com/pgray64/tinypress/route/entrance"
	"net/http"
	"strings"
)

type CustomValidator struct {
	validator *validator.Validate
}

func (cv *CustomValidator) Validate(i interface{}) error {
	if err := cv.validator.Struct(i); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	return nil
}

func InitRoutes() *echo.Echo {
	e := echo.New()

	// Enable a bunch of security headers
	e.Use(middleware.Secure())

	// Set up cookie-store for sessions
	if len(conf.Secrets.SessionSecret) < 32 {
		e.Logger.Fatal("Specify a secure, random session secret of at least 32 bytes")
	}
	sessionStore := sessions.NewCookieStore([]byte(conf.Secrets.SessionSecret))
	e.Use(session.Middleware(sessionStore))

	// Set up database for models
	var debugSql = conf.Secrets.DebugSql == "1" || strings.ToLower(conf.Secrets.DebugSql) == "true"
	if err := database.InitDatabase(conf.Secrets.PostgresConn, debugSql); err != nil {
		e.Logger.Fatal("Failed to connect to database: ", err)
	}

	// Register validator
	e.Validator = &CustomValidator{validator: validator.New()}

	// CSRF protection
	e.Use(middleware.CSRFWithConfig(middleware.CSRFConfig{
		TokenLookup:    "header:X-XSRF-TOKEN",
		CookieName:     "_csrf",
		CookieSecure:   false,
		CookieHTTPOnly: false,
	}))
	// Static content
	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Root:   "web/tinypress/build",
		Index:  "index.html",
		Browse: false,
		HTML5:  true,
	}))

	/***************************************** AUTHENTICATED ROUTES ***************************************************/
	authenticatedRoutes := e.Group("/api/authed/v1/")
	authenticatedRoutes.Use(authentication.AuthenticatedSessionMiddleware)

	authenticatedRoutes.GET("account/check-session", account.CheckSession)
	authenticatedRoutes.POST("account/sign-out", account.SignOut)

	/***** ADMIN ROUTES *****/
	authenticatedRoutes.POST("admin/users/add-user", admin.AddUser, authentication.RequireProductFeatureMiddleware(productfeature.ManageUsers))
	authenticatedRoutes.POST("admin/users/list-users", admin.ListUsers, authentication.RequireProductFeatureMiddleware(productfeature.ManageUsers))
	authenticatedRoutes.POST("admin/users/get-user", admin.GetUser, authentication.RequireProductFeatureMiddleware(productfeature.ManageUsers))
	authenticatedRoutes.POST("admin/users/delete-user", admin.DeleteUser, authentication.RequireProductFeatureMiddleware(productfeature.ManageUsers))
	authenticatedRoutes.POST("admin/users/update-user", admin.UpdateUser, authentication.RequireProductFeatureMiddleware(productfeature.ManageUsers))

	authenticatedRoutes.GET("admin/site-settings/list", admin.GetSiteSettings, authentication.RequireProductFeatureMiddleware(productfeature.ManageSettings))
	authenticatedRoutes.POST("admin/site-settings/update", admin.UpdateSiteSettings, authentication.RequireProductFeatureMiddleware(productfeature.ManageSettings))

	/********************************************* PUBLIC ROUTES ******************************************************/
	publicRoutes := e.Group("/api/public/v1/")

	publicRoutes.POST("site-setup", entrance.SiteSetup)
	publicRoutes.POST("sign-in", entrance.SignIn)

	return e
}
