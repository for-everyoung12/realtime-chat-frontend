import { http } from "../../shared/api/http";
import { API } from "../../shared/api/endpoints";

export interface LoginPayload {
  email: string;
  password: string;
}

export const AuthService = {
  login: (payload: LoginPayload) =>
    http.post(API.auth.login, payload).then((res) => res.data),

    me: () => http.get(API.auth.me).then((res) => res.data),

  logout: () => http.post(API.auth.logout, {}).then((res) => res.data),
};
