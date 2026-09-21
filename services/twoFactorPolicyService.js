import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";

/**
 * Administration de la politique d'obligation de 2FA : réglages globaux
 * (interrupteur, délai de grâce par défaut, méthodes autorisées) et règles
 * spécifiques par rôle/permission/utilisateur. Réservé aux comptes
 * disposant de la permission "manage_2fa_policy" (voir 2fa.admin côté API).
 */
export default class TwoFactorPolicy {
  static #headers(token) {
    return {headers: {Authorization: `Bearer ${token}`, Accept: "application/json"}};
  }

  static async get(token) {
    let result = {data: null, error: null};
    try {
      const response = await axios.get(`${BASE_URL}/security/2fa-policy`, this.#headers(token));
      result.data = response.data.data;
    } catch (e) {
      result.error = e;
    }
    return result;
  }

  static async update(token, payload) {
    let result = {data: null, error: null};
    try {
      const response = await axios.put(`${BASE_URL}/security/2fa-policy`, payload, this.#headers(token));
      result.data = response.data;
    } catch (e) {
      result.error = e;
    }
    return result;
  }

  static async createRule(token, payload) {
    let result = {data: null, error: null};
    try {
      const response = await axios.post(`${BASE_URL}/security/2fa-policy/rules`, payload, this.#headers(token));
      result.data = response.data.data;
    } catch (e) {
      result.error = e;
    }
    return result;
  }

  static async updateRule(token, uid, payload) {
    let result = {data: null, error: null};
    try {
      const response = await axios.put(`${BASE_URL}/security/2fa-policy/rules/${uid}`, payload, this.#headers(token));
      result.data = response.data.data;
    } catch (e) {
      result.error = e;
    }
    return result;
  }

  static async deleteRule(token, uid) {
    let result = {data: null, error: null};
    try {
      const response = await axios.delete(`${BASE_URL}/security/2fa-policy/rules/${uid}`, this.#headers(token));
      result.data = response.data;
    } catch (e) {
      result.error = e;
    }
    return result;
  }

  static async forceReset(token, accountUid) {
    let result = {data: null, error: null};
    try {
      const response = await axios.post(
        `${BASE_URL}/security/2fa-policy/accounts/${accountUid}/force-reset`,
        {},
        this.#headers(token)
      );
      result.data = response.data;
    } catch (e) {
      result.error = e;
    }
    return result;
  }
}
