/*
Package conf is for the configuration of the Tinypress application

Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/
package conf

import "os"

type secrets struct {
	SessionSecret      string
	RedisConn          string
	PostgresConn       string
	SkipSchemaCreation string
	SendgridKey        string
	SiteUrl            string
	SitePort           string
	DebugSql           string
}

var Secrets secrets

const (
	SessionKey       = "tp_session"
	SessionUserIdKey = "user_id"
	BcryptCost       = 10
)

func InitSecrets() {
	Secrets = secrets{
		SessionSecret:      os.Getenv("TP_SESSION_SECRET"),
		RedisConn:          os.Getenv("TP_REDIS_CONN"),
		PostgresConn:       os.Getenv("TP_POSTGRES_CONN"),
		SkipSchemaCreation: os.Getenv("TP_SKIP_SCHEMA_CREATION"),
		SendgridKey:        os.Getenv("TP_SENDGRID_KEY"),
		SiteUrl:            os.Getenv("TP_SITE_URL"),
		SitePort:           os.Getenv("TP_SITE_PORT"),
		DebugSql:           os.Getenv("TP_DEBUG_SQL"),
	}
}
