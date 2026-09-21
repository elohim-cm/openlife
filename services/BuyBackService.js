import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import UtilMethods from "@/utils/UtilMethods";
import Toast from "@/utils/toast";
import {getToken} from "@/utils";

class BuyBackService {
  static columns = t => [
    {name: "amount", label: t("amount")},
    {name: "status", label: t("status")},
    {name: "access", label: t("account")},
    {name: "date", label: t("date")},
    {name: "comment", label: t("comment")},
    {name: "created_at", label: t("createdAt")},
    {name: "updated_at", label: t("updatedAt")},
    {name: "actions", label: "Actions", filter: false, sort: false},
  ];
  /**
   * get all buybacks
   *
   * @param token
   * @param _page
   * @param _search
   * @param _statut
   * @param _perPage
   */
  static async getAll(token, _page = 1, _search = "", _statut = "", _perPage = 10) {
    let response = {
      buybacks: [],
      links: {},
      pagination: [],
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/redemption`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    if (_page) {
      url += `?page=${_page}`;
      if (_search) url += `&q=${_search}`;
      if (_statut) url += `&status=${_statut}`;
    } else {
      if (_search) {
        url += `?q=${_search}`;
        if (_statut) url += `&status=${_statut}`;
      } else {
        if (_statut) url += `?status=${_statut}`;
      }
      config.headers["Without-Pagination"] = true;
    }
    if (url.indexOf("?") > -1) {
      url += `&per_page=${_perPage}`;
    } else {
      url += `?per_page=${_perPage}`;
    }

    try {
      const result = await axios.get(url, config);
      // check if there are any data
      if (result.status === 200) {
        console.log("Redemption service -- get all -- response ||| ", result);
        response.buybacks = result.data.data.redemptions;
        response.links = result.data.data.links;
        response.pagination = result.data.data.pagination;
      }
    } catch (err) {
      // if any error
      console.log("Redemption service -- get all -- response error ||| ", err);
      response.error = err;
    }

    return response;
  }

  /**
   * get a single buybacks
   *
   * @param token
   * @param redemptionUUID
   */
  static async getOne(token, redemptionUUID) {
    let response = {
      buyback: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/redemption/${redemptionUUID}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);

      if (result.status === 200) {
        response.buyback = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * get buybacks types
   *
   * @param token
   */
  static async getBuybackTypes(token) {
    let response = {
      data: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/redemption-type`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);

      if (result.status === 200) {
        response.data = result.data.data.redemption_types;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * make a buybacks request
   *
   * @param token
   * @param data
   * @param typeUUID
   * @param contractUUID
   * @param systemUUID
   */
  static async makeBuyback(token, data, typeUUID, contractUUID, systemUUID) {
    let response = {
      buyback: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/redemption/redeem/${typeUUID}/${contractUUID}/${systemUUID}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.post(url, data, config);

      if (result.status === 200) {
        response.buyback = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * Confirm buybacks request
   *
   * @param token
   * @param data
   * @param buybackUUID
   */
  static async confirmBuyback(token, data, buybackUUID) {
    let response = {
      confirmedBuyback: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/redemption/confirmation/${buybackUUID}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.post(url, data, config);

      if (result.status === 200) {
        response.confirmedBuyback = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * cancel buybacks request
   *
   * @param token
   * @param data
   * @param buybackUUID
   */
  static async cancelBuyback(token, data, buybackUUID) {
    let response = {
      canceledBuyback: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/redemption/cancel/${buybackUUID}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.post(url, data, config);

      if (result.status === 200) {
        response.canceledBuyback = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * accept buybacks request
   *
   * @param token
   * @param data
   * @param buybackUUID
   */
  static async acceptBuyback(token, data, buybackUUID) {
    let response = {
      acceptedBuyback: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/redemption/acceptance/${buybackUUID}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.post(url, data, config);

      if (result.status === 200) {
        response.acceptedBuyback = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * approve buybacks request
   *
   * @param token
   * @param data
   * @param buybackUUID
   */
  static async approveBuyback(token, data, buybackUUID) {
    let response = {
      approvedBuyback: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/redemption/approval/${buybackUUID}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.post(url, data, config);

      if (result.status === 200) {
        response.approvedBuyback = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * reject buybacks request
   *
   * @param token
   * @param data
   * @param buybackUUID
   */
  static async rejectBuyback(token, data, buybackUUID) {
    let response = {
      rejectedBuyback: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/redemption/reject/${buybackUUID}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.post(url, data, config);

      if (result.status === 200) {
        response.rejectedBuyback = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * validate buybacks request
   *
   * @param token
   * @param data
   * @param buybackUUID
   */
  static async validateBuyback(token, data, buybackUUID) {
    let response = {
      validatedBuyback: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/redemption/validation/${buybackUUID}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.post(url, data, config);

      if (result.status === 200) {
        response.validatedBuyback = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * buybacks payment request
   *
   * @param token
   * @param data
   * @param buybackUUID
   * @param paymentSystemUUID
   * @param _sytem
   * @param _otp
   */
  static async payBuyback(token, data, buybackUUID, paymentSystemUUID, _sytem = false, _otp = null) {
    let response = {
      paidBuyback: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/redemption/payment/${buybackUUID}/${paymentSystemUUID}`;

    if (_sytem) {
      url += `?system`;
    }

    // header config
    const headers = {Authorization: `Bearer ${token}`, Accept: "application/json"};
    if(_otp) {
      headers['2fa-Otp'] = _otp;
    }
    const config = {headers};

    try {
      const result = await axios.post(url, data, config);

      if (result.status === 200) {
        response.paidBuyback = result.data.data;
      }
    } catch (err) {
      response.error = err;
      if(err.response.status > 500) {
        Toast.error("Server error. Try again later");
      }
    }

    return response;
  }

  /**
   * payment systems
   */
  static async getPaymentSystem() {
    let response = {
      paymentSystems: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/payment-system`;

    try {
      const result = await axios.get(url);

      if (result.status === 200) {
        response.paymentSystems = result.data.data.payment_systems;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }
  static async getHistories(token, redemption, page = 1, q = "") {
    token = getToken();
    const header = await fetch(`${BASE_URL}/redemption/${redemption}/history?page=${page}&q=${q}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + token,
        "X-localization": UtilMethods.getLanguage(),
      },
    });
    const response = await header.json();

    if (header.status !== 200) {
      throw new Error(response.message || response.error || header.statusText);
    }

    return response.data;
  }

  static async resendConde(token, redemption) {
    token = getToken();
    const url = `${BASE_URL}/redemption/send-code/${redemption}`;
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
        "X-localization": UtilMethods.getLanguage(),
      },
    };

    const header = await fetch(url, options);
    const response = await header.json();

    if (header.status !== 200) {
      throw new Error(response.message || response.error || header.statusText);
    }

    return response.message;
  }

  static async regularize(token, redemption, datas) {
    let response = {
      redemption: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/redemption/regularization/${redemption}`;

    // header config
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    };

    try {
      const result = await axios.post(url, datas, config);

      if (result.status === 200) {
        response.redemption = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  static async treatBuybackGroup(token, {reason = "", is_accepted = true}, recordUuids = [], _otp = null) {
    let response = {
      message: "",
      error: null,
    };

    let url = `${BASE_URL}/redemption/treatment-group`;

    // header config
    const headers = {Authorization: `Bearer ${token}`, Accept: "application/json"};
    if(_otp) {
      headers['2fa-Otp'] = _otp;
    }
    const config = {headers};

    try {
      const result = await axios.post(url, {reason, is_accepted, redemptions: recordUuids}, config);

      if (result.status === 200) {
        response.message = result.data.message;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }
}

export default BuyBackService;
