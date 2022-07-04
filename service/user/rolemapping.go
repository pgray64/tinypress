/*
Package user is for is for services related to user accounts

Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/
package user

import (
	"github.com/pgray64/tinypress/database"
	"github.com/pgray64/tinypress/enum/productfeature"
	"github.com/pgray64/tinypress/enum/userrole"
	"gorm.io/gorm"
)

type RoleMapping struct {
	ID       int               `gorm:"primaryKey;autoIncrement"`
	UserRole userrole.UserRole `gorm:"not null;uniqueIndex:idx_role_mappings_user_id_user_role"`
	UserID   int               `gorm:"not null;uniqueIndex:idx_role_mappings_user_id_user_role"`
}

func GetFeaturesForRole(role userrole.UserRole) []productfeature.ProductFeature {
	switch role {
	case userrole.Admin:
		return []productfeature.ProductFeature{
			productfeature.ManageUsers,
			productfeature.ManageSettings,
		}
	case userrole.Editor:
		return []productfeature.ProductFeature{
			productfeature.AddEditContent,
		}
	case userrole.User:
		return []productfeature.ProductFeature{}
	default:
		return []productfeature.ProductFeature{}
	}
}

func CreateOrUpdateRoleMappings(userID int, roles []userrole.UserRole) error {
	txErr := database.Database.Transaction(func(tx *gorm.DB) error {
		var currentRoles []RoleMapping
		currentRoleMap := make(map[userrole.UserRole]bool)

		// Find existing roles for user
		if res := tx.Where(&RoleMapping{UserID: userID}).
			Find(&currentRoles); res.Error != nil {
			return res.Error
		}
		for _, role := range currentRoles {
			currentRoleMap[role.UserRole] = true
		}
		// Delete roles no longer selected for user
		if res := tx.Where(&RoleMapping{UserID: userID}).
			Not(map[string]interface{}{"user_role": roles}).
			Delete(&RoleMapping{}); res.Error != nil {
			return res.Error
		}
		// Save new roles for user
		var newRoles = make([]RoleMapping, 0)
		for _, role := range roles {
			if !currentRoleMap[role] {
				newRoles = append(newRoles, RoleMapping{
					UserRole: role,
					UserID:   userID,
				})
			}
		}
		if len(newRoles) > 0 {
			if res := tx.Create(newRoles); res.Error != nil {
				return res.Error
			}
		}

		return nil
	})
	return txErr
}

func GetFeaturesForUser(userID int) ([]productfeature.ProductFeature, error) {
	var mappings []RoleMapping
	mappingsRes := database.Database.Where(&RoleMapping{UserID: userID}).
		Find(&mappings)
	if mappingsRes.Error != nil {
		return []productfeature.ProductFeature{}, mappingsRes.Error
	}
	var features = make([]productfeature.ProductFeature, 0)
	for _, mapping := range mappings {
		features = append(features, GetFeaturesForRole(mapping.UserRole)...)
	}
	return features, nil
}

func GetRolesFromRoleMappings(mappings []RoleMapping) []userrole.UserRole {
	var roles = make([]userrole.UserRole, len(mappings))
	for i, mapping := range mappings {
		roles[i] = mapping.UserRole
	}
	return roles
}
