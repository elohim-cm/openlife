import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";

class AuditService {
  static criterions = t => ({
    account: [
      {value: "email", label: t("email")},
      {value: "phone", label: t("phone")},
    ],
  });

  /**
   * get a single provider
   *
   * @param token
   * @param logUuid
   */
  static async show(token, logUuid) {
    let response = {
      log: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/log/${logUuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);

      if (result.status === 200) {
        response.log = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }
}

export default AuditService;
