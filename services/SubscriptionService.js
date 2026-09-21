import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import SubscriptionModel from "@/models/Subscription";
import UtilMethods from "@/utils/UtilMethods";
import {getToken} from "@/utils";

class SubscriptionService {
  static columns = t => [
    {name: "status", label: t("status")},
    {name: "access", label: t("account")},
    {name: "comment", label: t("comment")},
    {name: "created_at", label: t("createdAt")},
    {name: "updated_at", label: t("updatedAt")},
    {name: "actions", label: "Actions", filter: false, sort: false},
  ];

  /**
   *
   * @param _token
   * @param duration
   * @param prime
   * @returns {Promise<{data: any, error: null}>}
   */
  static async simuler(_token, {duration, prime}) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/subscription/simulation?`;
      url += `duration=${duration}`;
      url += `&prime=${prime}`;
      let response = await axios.get(url, config);
      console.log("Subscription service : Simulate response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Subscription service : Simulate error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token
   * @returns {Promise<{data: {uid: string, label: string}[]|any, error: null}>}
   */
  static async getFilitation(_token) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/affiliation`;
      let response = await axios.get(url, config);
      console.log("Subscription service : Filiation response :::", response);
      if (response.status === 200) {
        if (!response.data.data.affiliations) throw new Error("Response data don't match");
        result.data = response.data.data.affiliations;
      }
    } catch (e) {
      console.log("Subscription service : Filiation error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token
   * @returns {Promise<{data: {uid: string, label: string}[]|any, error: null}>}
   */
  static async getGender(_token) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/gender`;
      let response = await axios.get(url, config);
      console.log("Subscription service : Gender response :::", response);
      if (response.status === 200) {
        if (!response.data.data.modalities) throw new Error("Response data don't match");
        result.data = response.data.data.modalities;
      }
    } catch (e) {
      console.log("Subscription service : Gender error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token
   * @returns {Promise<{data: {uid: string, label: string}[]|any, error: any}>}
   */
  static async getSituation(_token) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/situation`;
      let response = await axios.get(url, config);
      console.log("Subscription service : Situation response :::", response);
      if (response.status === 200) {
        if (!response.data.data.modalities) throw new Error("Response data don't match");
        result.data = response.data.data.modalities;
      }
    } catch (e) {
      console.log("Subscription service : Situation error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token {string}
   * @param _subscription
   * @returns {Promise<{data: {uid: string, label: string}[]|any, error: any}>}
   */
  static async getPaymentMethods(_token, _subscription = true) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/payment-method`;
      if (_subscription) {
        url += "?subscription";
      }
      let response = await axios.get(url, config);
      console.log("Subscription service : Get payment method response :::", response);
      if (response.status === 200) {
        if (!response.data.data.payment_methods) throw new Error("Response data don't match");
        result.data = response.data.data.payment_methods;
      }
    } catch (e) {
      console.log("Subscription service : Get payment method error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token {string}
   * @param _method {string}
   * @returns {Promise<{data: {uid: string, label: string}[]|any, error: any}>}
   */
  static async getPaymentSystems(_token, _method) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/payment-system/method/${_method}`;
      let response = await axios.get(url, config);
      console.log("Subscription service : Get payment systems response :::", response);
      if (response.status === 200) {
        if (!response.data.data.payment_systems) throw new Error("Response data don't match");
        result.data = response.data.data.payment_systems;
      }
    } catch (e) {
      console.log("Subscription service : Get payment systems error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token
   * @param _data {any}
   * @param _providerCode {string|null}
   * @returns {Promise<{data: {uid: string, prime: string}, error: AxiosError|any}>}
   */
  static async create(_token, _data, _providerCode = null) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      if (!_token) delete config.headers.Authorization;
      if (_providerCode) {
        config.headers["X-Provider-Code"] = _providerCode;
      }
      let url = `${BASE_URL}/subscription`;
      let response = await axios.post(url, _data, config);
      console.log("Subscription service : Create response :::", response);
      if (response.status === 200 || response.status === 201) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Subscription service : Create error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token {string}
   * @param uid {string}
   * @param code {string}
   * @param accept_condition {boolean|null}
   * @returns {Promise<{data: any, error: AxiosError|any}>}
   */
  static async confirm(_token, {uid, code, accept_condition}, _providerCode = null) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      if (_providerCode) {
        config.headers["X-Provider-Code"] = _providerCode;
      }
      let url = `${BASE_URL}/subscription/confirmation/${uid}`;
      let response = await axios.post(url, {code, accept_condition}, config);
      console.log("Subscription service : Confirm response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Subscription service : Confirm error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token {string}
   * @param uid {string}
   * @param system {string}
   * @param phone {string}
   * @param amount {number}
   * @returns {Promise<{data: any, error: any|AxiosError}>}
   */
  static async payment(_token, {uid, system, phone, amount}, _providerCode = null) {
    let result = {
      data: null,
      error: null,
      message: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      if (_providerCode) {
        config.headers["X-Provider-Code"] = _providerCode;
      }
      let url = `${BASE_URL}/subscription/payment/${uid}/${system}`;
      let response = await axios.post(url, {phone, amount}, config);
      console.log("Subscription service : Payment response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
        result.message = response.data.message;
      }
    } catch (e) {
      console.log("Subscription service : Payment error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token
   * @param _uid
   * @param _data {any}
   * @returns {Promise<{data: null, error: null}>}
   */
  static async updateCni(_token, _uid, _data) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      if (!_token) delete config.headers.Authorization;
      let url = `${BASE_URL}/subscription/${_uid}/cni_update`;
      let response = await axios.post(url, _data, config);
      if (response.status === 200 || response.status === 201) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Subscription service : Update cni error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token
   * @param _page
   * @param _search
   * @param _statut
   * @param _perPage
   * @returns {Promise<{data: {uid: string, code: string}[]|any, error: any}>}
   */
  static async get(_token, _page = 1, _search = "", _statut, _perPage = 10) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/subscription`;
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
      let response = await axios.get(url, config);
      console.log("Subscription service : Get response :::", response);
      if (response.status === 200) {
        if (!response.data.data.subscriptions) throw new Error("Response data don't match");
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Subscription service : Get error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token
   * @param _search {string}
   * @returns {Promise<{data: any, error: null}>}
   */
  static async search(_token, _search) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/subscription?q=${_search}`;
      let response = await axios.get(url, config);
      console.log("Subscription service : Search response :::", response);
      if (response.status === 200) {
        if (!response.data.data.subscriptions) throw new Error("Response data don't match");
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Subscription service : Search error ::: ", e);
      result.error = e;
    }
    return result;
  }
  /**
   *
   * @param _token {string}
   * @param _uid {string}
   * @returns {Promise<{data: SubscriptionModel|any, error: any}>}
   */
  static async show(_token, _uid) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/subscription/${_uid}`;
      let response = await axios.get(url, config);
      console.log("Subscription service : Show response :::", response);
      if (response.status === 200) {
        if (!response.data.data) throw new Error("Response data don't match");
        let subcription = new SubscriptionModel();
        subcription.fromJson(response.data.data);
        result.data = subcription;
      }
    } catch (e) {
      console.log("Subscription service : Show error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token {string}
   * @param _uid {string}
   * @param _provider {string}
   * @returns {Promise<{data: {uid: string, code: string}|null, error: null}>}
   */
  static async transfer(_token, _uid, _provider) {
    let result = {
      data: null,
      message: "",
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/subscription/transfer/${_uid}/${_provider}`;
      let response = await axios.post(url, {}, config);
      console.log("Subscription service : Transfer response :::", response);
      if (response.status === 200) {
        if (!response.data.data) throw new Error("Response data don't match");
        result.data = {uid: response.data.data.uid, code: response.data.data.code};
        result.message = response.data.message;
      }
    } catch (e) {
      console.log("Subscription service : Transfer error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _uid {string}
   * @returns {Promise<{data: any, error: null}>}
   */
  static async sendCode(_uid) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Accept: "application/json"},
      };
      let url = `${BASE_URL}/subscription/send-code/${_uid}`;
      let response = await axios.post(url, {}, config);
      console.log("Subscription service : Send code response :::", response);
      if (response.status === 200) {
        result.data = _uid;
      }
    } catch (e) {
      console.log("Subscription service : Send code error ::: ", e);
      result.error = e;
    }
    return result;
  }
  /**
   *
   * @param _token {string}
   * @param _uid {string}
   * @returns {Promise<{data: any, error: null}>}
   */
  static async clone(_token, _uid) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/subscription/clone/${_uid}`;
      let response = await axios.post(url, {}, config);
      console.log("Subscription service : clone response :::", response);
      if (response.status === 200) {
        result.data = _uid;
      }
    } catch (e) {
      console.log("Subscription service : clone error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token {string}
   * @param _uid {string}
   * @param _data {any}
   * @returns {Promise<{data: {uid: string, prime: string}|any, error: AxiosError|any}>}
   */
  static async update(_token, _uid, _data) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      console.log(_data);
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json", "Content-Type": "application/json"},
      };
      if (!_token) delete config.headers.Authorization;
      let url = `${BASE_URL}/subscription/${_uid}`;
      let response = await axios.put(url, _data, config);
      console.log("Subscription service : Update response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Subscription service : Update error ::: ", e);
      result.error = e;
    }
    return result;
  }

  static async paymentStatus(_token, _uid) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/subscription/payment-status/${_uid}`;
      let response = await axios.post(url, {}, config);
      console.log("Subscription service : Check payment status response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Subscription service : Check payment status error ::: ", e);
      result.error = e;
    }
    return result;
  }

  static async getHistories(token, subscription, page) {
    token = getToken();
    const header = await fetch(`${BASE_URL}/subscription/${subscription}/history?page=${page}`, {
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

  static async deleteRecord(_token, _uid) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/subscription/${_uid}`;
      let response = await axios.delete(url, config);
      if (response.status === 200 || response.status === 204) {
        result.data = true;
      }
    } catch (e) {
      console.log("Subscription service : Delete error ::: ", e);
      result.error = e;
    }
    return result;
  }
}

export default SubscriptionService;
