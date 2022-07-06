/*
Copyright 2022 Philippe Gray

This file is part of Tinypress.

Tinypress is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

Tinypress is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with Tinypress. If not, see <https://www.gnu.org/licenses/>.
*/

import api from "../api";

const baseUrl = "/api/authed/v1/admin/users/";

export function listUsers({ page }) {
  return api.post(baseUrl + "list-users", { page });
}

export function addUser({
  displayName,
  username,
  email,
  password,
  selectedRoles,
}) {
  return api.post(baseUrl + "add-user", {
    displayName,
    username,
    email,
    password,
    selectedRoles,
  });
}
export function getUser({ id }) {
  return api.post(baseUrl + "get-user", { id });
}
export function updateUser({
  id,
  displayName,
  username,
  email,
  selectedRoles,
}) {
  return api.post(baseUrl + "update-user", {
    id,
    displayName,
    username,
    email,
    selectedRoles,
  });
}
export function deleteUser({ id }) {
  return api.post(baseUrl + "delete-user", {
    id,
  });
}
