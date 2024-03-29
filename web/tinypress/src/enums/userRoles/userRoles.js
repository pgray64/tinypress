/*
Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/

const UserRoles = Object.freeze({
  Admin: 1,
  Editor: 2,
  User: 3,
  getDescription(role) {
    switch (role) {
      case UserRoles.Admin:
        return "Admin";
      case UserRoles.Editor:
        return "Editor";
      case UserRoles.User:
        return "User";
      default:
        throw new Error("Invalid role");
    }
  },
});
export default UserRoles;
