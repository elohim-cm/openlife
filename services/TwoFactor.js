import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";

/**
 * Gestion du 2FA depuis le profil utilisateur : choix du canal (email/sms/
 * whatsapp/totp), configuration de l'application d'authentification, et
 * appareils de confiance (voir TWO_FACTOR_TRUSTED_DEVICE_DAYS côté backend).
 */
export default class TwoFactor {
  static #headers(token) {
    return {headers: {Authorization: `Bearer ${token}`, Accept: "application/json"}};
  }

  static async getSettings(token) {
    let result = {data: null, error: null};
    try {
      const response = await axios.get(`${BASE_URL}/account/2fa`, this.#headers(token));
      result.data = response.data.data;
    } catch (e) {
      result.error = e;
    }
    return result;
  }

  static async updateMethod(token, method, currentPassword) {
    let result = {data: null, error: null};
    try {
      const response = await axios.post(
        `${BASE_URL}/account/2fa/method`,
        {method, current_password: currentPassword},
        this.#headers(token)
      );
      result.data = response.data;
    } catch (e) {
      result.error = e;
    }
    return result;
  }

  static async setupTotp(token, currentPassword) {
    let result = {data: null, error: null};
    try {
      const response = await axios.post(
        `${BASE_URL}/account/2fa/totp/setup`,
        {current_password: currentPassword},
        this.#headers(token)
      );
      result.data = response.data.data;
    } catch (e) {
      result.error = e;
    }
    return result;
  }

  static async confirmTotp(token, code) {
    let result = {data: null, error: null};
    try {
      const response = await axios.post(`${BASE_URL}/account/2fa/totp/confirm`, {code}, this.#headers(token));
      result.data = response.data;
    } catch (e) {
      result.error = e;
    }
    return result;
  }

  static async disableTotp(token, currentPassword) {
    let result = {data: null, error: null};
    try {
      const response = await axios.post(
        `${BASE_URL}/account/2fa/totp/disable`,
        {current_password: currentPassword},
        this.#headers(token)
      );
      result.data = response.data;
    } catch (e) {
      result.error = e;
    }
    return result;
  }

  static async disable(token, currentPassword) {
    let result = {data: null, error: null};
    try {
      const response = await axios.post(
        `${BASE_URL}/account/2fa/disable`,
        {current_password: currentPassword},
        this.#headers(token)
      );
      result.data = response.data;
    } catch (e) {
      result.error = e;
    }
    return result;
  }

  static async revokeDevice(token, deviceUid) {
    let result = {data: null, error: null};
    try {
      const response = await axios.delete(`${BASE_URL}/account/2fa/trusted-devices/${deviceUid}`, this.#headers(token));
      result.data = response.data;
    } catch (e) {
      result.error = e;
    }
    return result;
  }

  static async revokeAllDevices(token) {
    let result = {data: null, error: null};
    try {
      const response = await axios.delete(`${BASE_URL}/account/2fa/trusted-devices`, this.#headers(token));
      result.data = response.data;
    } catch (e) {
      result.error = e;
    }
    return result;
  }
}
