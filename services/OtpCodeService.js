import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";

class OtpCodeService {
  /**
   * Récupère la liste des codes OTP (2FA / reset) ou des codes de confirmation.
   *
   * @param {string} token - Token d'authentification
   * @param {string} type - "otp" ou "confirmation"
   * @param {number} page - Numéro de page (défaut 1)
   * @param {number} perPage - Éléments par page (défaut 100)
   * @param {object} filters - Filtres optionnels
   * @returns {Promise<{data: {otp_codes: array, pagination: object}|null, error: Error|null}>}
   */
  static async get(token, type = "otp", page = 1, perPage = 100, filters = {}) {
    const result = {
      data: null,
      error: null,
    };

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      };

      const url = new URL(`${BASE_URL}/otp-code`);
      url.searchParams.set("type", type);
      url.searchParams.set("page", page);
      url.searchParams.set("per_page", perPage);

      // Filtres OTP
      if (type === "otp") {
        if (filters.q) url.searchParams.set("q", filters.q);
        if (filters.status) url.searchParams.set("status", filters.status);
        if (filters.code_type) url.searchParams.set("code_type", filters.code_type);
        if (filters.phone) url.searchParams.set("phone", filters.phone);
        if (filters.email) url.searchParams.set("email", filters.email);
      }

      // Filtres Confirmation
      if (type === "confirmation") {
        if (filters.operation_type) url.searchParams.set("operation_type", filters.operation_type);
        if (filters.status !== undefined) url.searchParams.set("status", filters.status);
        if (filters.code) url.searchParams.set("code", filters.code);
        if (filters.phone) url.searchParams.set("phone", filters.phone);
      }

      const response = await axios.get(url.toString(), config);

      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.error("OtpCodeService get error:", e);
      result.error = e;
    }

    return result;
  }
}

export default OtpCodeService;