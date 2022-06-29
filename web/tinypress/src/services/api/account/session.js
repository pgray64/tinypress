import api from "../api";

const baseUrl = "/api/authed/v1/";

export function session() {
  return api.get(baseUrl + "check-session", {});
}
export function signOut() {
  return api.post(baseUrl + "sign-out", {});
}
