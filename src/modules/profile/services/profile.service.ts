import { http } from "../../shared/api/http";
import { API } from "../../shared/api/endpoints";

export const ProfileService = {
    me: () => http.get(API.auth.ME).then((res) => res.data),
}