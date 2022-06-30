/*
Package main is for the entrypoint of the Tinypress application

Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/
package main

import (
	"github.com/pgray64/tinypress/conf"
	database "github.com/pgray64/tinypress/database"
	route "github.com/pgray64/tinypress/route"
	"strconv"
	"strings"
)

func main() {
	conf.InitSecrets()
	e := route.InitRoutes()

	// Perform migration if specified to do so
	if conf.Secrets.SkipSchemaCreation == "1" || strings.ToLower(conf.Secrets.SkipSchemaCreation) == "true" {
		e.Logger.Info("Skipping database schema creation due to ENV variable setting")
	} else {
		if err := database.MigrateDatabase(); err != nil {
			e.Logger.Fatal("Database schema creation failed: ", err)
		}
	}

	port := ":1323"
	if len(conf.Secrets.SitePort) > 0 {
		_, err := strconv.Atoi(conf.Secrets.SitePort)
		if err != nil {
			e.Logger.Fatal("Invalid port specified - it should be a number ")
		}
		port = ":" + conf.Secrets.SitePort
	}
	e.Logger.Fatal(e.Start(port))
}
