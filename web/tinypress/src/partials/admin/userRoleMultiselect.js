/*
Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/

import {
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
} from "@mui/material";
import Box from "@mui/material/Box";
import UserRoles from "../../enums/userRoles/userRoles";
import * as React from "react";

export default function UserRoleMultiselect({
  selectedRoles,
  handleRolesChange,
  theme,
}) {
  const availableRoles = [
    {
      name: UserRoles.getDescription(UserRoles.Admin),
      value: UserRoles.Admin,
    },
    {
      name: UserRoles.getDescription(UserRoles.Editor),
      value: UserRoles.Editor,
    },
    {
      name: UserRoles.getDescription(UserRoles.User),
      value: UserRoles.User,
    },
  ];

  function getStyles(name, personName, theme) {
    return {
      fontWeight:
        personName.indexOf(name) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
  }
  return (
    <FormControl fullWidth>
      <InputLabel id="role-multiselect-label">Roles</InputLabel>
      <Select
        label="Roles"
        labelId="role-multiselect-label"
        id="role-multiselect"
        multiple
        value={selectedRoles}
        onChange={handleRolesChange}
        input={<OutlinedInput id="select-multiple-chip" label="Roles" />}
        renderValue={(selected) => (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
            {selected.map((role) => (
              <Chip key={role} label={UserRoles.getDescription(role)} />
            ))}
          </Box>
        )}
      >
        {availableRoles.map((role) => (
          <MenuItem
            key={role.name}
            value={role.value}
            style={getStyles(role.value, selectedRoles, theme)}
          >
            {role.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
