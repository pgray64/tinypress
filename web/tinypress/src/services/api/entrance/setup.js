import api from "../api";

const baseUrl = "/api/public/v1/";

export function setup({ websiteName, displayName, username, email, password }) {
  return api.post(baseUrl + "setup", {
    websiteName,
    displayName,
    username,
    email,
    password,
  });
}
