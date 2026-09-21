import { BASE_URL } from "@/utils/api/api";
import Toast from "@/utils/toast";
import {LOGIN_PAGE} from "@/utils/routes/routes";
import {extractUidFromPath} from "@/utils/api";
import UtilMethods from "@/utils/UtilMethods";
import {getToken} from "@/utils";

class AuthService {
    static logout()
    {
        this.clearStore();
    }

  /**
   * @param {string} token
   * @returns {Promise<string>}
   */
    static async logoutWithToken(token, _context, uid='null')
    {
        if(uid === 'null') {
            _context.togglePageLoading(true);
        }
        const response = await fetch(`${BASE_URL}/auth/logout/${uid}`, this.#header(token, "POST"));
        const data = await response.json();

        if (response.status !== 200) {
            throw new Error('Une erreur est survenue.');
        }

        if(uid === 'null'){
            this.clearStore();
        }
        return data.message;
    }

    static clearStore()
    {
        localStorage.removeItem("storedValues");
        localStorage.removeItem("currentAccess");
        sessionStorage.removeItem("access-selection-reloaded");
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

    static formatFetchErrorMsgAndLogout(msg, context, router, forceRedirect = false)
    {
        let regex1=/token /i, regex2=/unauth/i
        if(msg.length >= 125) msg='Une Erreur est survenue.'
        
        // Ne rediriger que si explicitement demandé
        // Sinon, laisser le SessionManager gérer l'expiration
        if (regex1.test(msg) || regex2.test(msg)) {
            if (forceRedirect) {
                Toast.error(msg)
                this.logout()
                context.togglePageLoading(true);
                // Token expired, handle redirect and store last visited page
                if (localStorage.getItem('lastVisitedPage') === null)
                    localStorage.setItem('lastVisitedPage', window.location.href);
                router.push(LOGIN_PAGE)
            }
            // Sinon, ne rien faire - le SessionManager affichera le modal
        } else {
            // Pour les autres erreurs, afficher le message
            Toast.error(msg)
        }
    }
}

export default AuthService;
