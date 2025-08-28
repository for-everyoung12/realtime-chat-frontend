import { http } from "../../shared/api/http";
import { API } from "../../shared/api/endpoints";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export const AuthService = {
  login: (payload: LoginPayload) =>
    http.post(API.auth.LOGIN, payload).then((res) => res.data),

  me: () => http.get(API.auth.ME).then((res) => res.data),

  register: (payload: RegisterPayload) =>
    http.post(API.auth.REGISTER, payload).then((res) => res.data),

  logout: () => http.post(API.auth.LOGOUT, {}).then((res) => res.data),
};
