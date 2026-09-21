import {BASE_URL} from "@/utils/api/api";
import AuthService from "@/services/AuthService";
import Routes from "@/utils/routes";
import Toast from "@/utils/toast";
import UtilMethods from "@/utils/UtilMethods";
import {getToken} from "@/utils";

export default class Profil{
    static async me(token, _router) {
        const response = await fetch(`${BASE_URL}/auth/profile`, this.#header(token, "GET"));
        const data = await response.json();

        if(response.status=== 401) {
            AuthService.logout()
            Toast.error(data.message)
            _router.push(Routes.LOGIN)
        }else{
            if(response.status !== 200)
                throw new Error(data.message || data.error || header.statusText)

            return data;
        }
    }

    static #header(_token, _method)
    {
        _token = getToken();
        return {
            method: _method,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${_token}`,
                'X-localization': UtilMethods.getLanguage()
            }
        };
    }
}