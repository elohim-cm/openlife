import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import UtilMethods from "@/utils/UtilMethods";

class AccountService {
  static ACTIVE = "active";
  static INACTIVE = "inactive";

  static equivalent = t => ({
    active: t("active"),
    inactive: t("inactive"),
  });
  /**
   *
   * @param _token
   * @param _page
   * @param _search {string|any}
   * @param _statut
   * @returns {Promise<{data: {pagination: {current_page: number}, accounts: {uid: string, image: string, updated_at: string, phone: string, last_name: string, token_expired_at: string, created_at: string, first_name: string, email: string, token: string, status: string}[]}|any, error: null}>}
   */
  static async get(_token, _page = 1, _search = "", _statut = "", _perPage = 10) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/account`;
      if (_page) {
        url += `?page=${_page}`;
        if (_search) url += `&q=${_search}`;
        if (_statut) url += `&statut=${_statut}`;
      } else {
        if (_search) {
          url += `?q=${_search}`;
          if (_statut) url += `&statut=${_statut}`;
        } else {
          if (_statut) url += `?statut=${_statut}`;
        }
        config.headers["Without-Pagination"] = true;
      }
      if (url.indexOf("?") > -1) {
        url += `&per_page=${_perPage}`;
      } else {
        url += `?per_page=${_perPage}`;
      }
      if (_search) url += `&q=${_search}`;
      let response = await axios.get(url, config);
      console.log("Account service : Get response :::", response);
      if (response.status === 200) {
        if (!response.data.data.accounts) throw new Error("Response data don't match");
        if (!response.data.data.pagination) throw new Error("Response data don't match");
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Account service : Get error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token {string}
   * @param _accountId {string}
   * @returns {Promise<{data: {uid: string, first_name: string, last_name: string, email: string, password: string, phone: string, picture: string}|null, error: AxiosError|null}>}
   */
  static async show(_token, _accountId) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/account/${_accountId}`;
      let response = await axios.get(url, config);
      console.log("Account service : Show response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Account service : Show error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token {string}
   * @param _data {string}
   * @returns {Promise<{data: {uid: string}|null, error: AxiosError|null}>}
   */
  static async create(_token, _data, setErrors) {
    setErrors([]);
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/account`;

      let response = await axios.post(url, _data, config);
      console.log("Account service : Create response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Account service : Create error ::: ", e);
      if (e.response.status === 422) {
        setErrors(Object.values(e.response.data.errors).flat());
      }
      result.error = e;
    }
    return result;
  }
  /**
   *
   * @param _token {string}
   * @param _AccountId {string}
   * @param _data {string}
   * @param _otp {string|number|null}
   * @param _trustDevice {boolean}
   * @returns {Promise<{data: {uid: string}|null, error: AxiosError|null}>}
   */
  static async update(_token, _AccountId, _data, _otp = null, _trustDevice = false) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const headers = {Authorization: `Bearer ${_token}`, Accept: "application/json"};
      if(_otp) {
        headers['2fa-Otp'] = _otp;
      }
      if(_trustDevice) {
        headers['X-Trust-Device'] = "1";
      }
      const config = {headers};
      let url = `${BASE_URL}/account/${_AccountId}`;
      let response = await axios.put(url, _data, config);
      console.log("Account service : Update response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Account service : Update error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token {string}
   * @param _AccountId {string}
   * @param _data {string}
   * @returns {Promise<{data: {uid: string}|null, error: AxiosError|null}>}
   */
  static async validateUpdate(_token, _AccountId, _data) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const headers = {Authorization: `Bearer ${_token}`, Accept: "application/json"};
      const config = {headers};
      let url = `${BASE_URL}/account/${_AccountId}/validate-update`;
      let response = await axios.post(url, _data, config);
      if (response.status === 200 || response.status === 204) {
        result.data = true;
      }
    } catch (e) {
      result.error = e;
    }
    return result;
  }

  static async mySituation(token, setMessage, setDeleteModal, t) {
    let result = {
      data: null,
      error: null,
    };
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "X-localization": UtilMethods.getLanguage(),
      },
      responseType: "blob",
    };
    let url = `${BASE_URL}/accounts/my-situation`;
    try {
      let response = await axios.get(url, config);
      if (response.status === 200) {
        result.data = true;
        window.open(URL.createObjectURL(response.data));

        setMessage(t("YourRequestHasBeenRegistered"));
        setDeleteModal(true);
      }
    } catch (err) {
      console.log("Download contract error::: ", err);
      result.error = err;
    }
    return result;
  }

  static async resend2faToken(_token, _accountId = null, _notif = null, _method = null) {
    let result = {
      data: null,
      error: null,
    };
    const config = {
      headers: {
        Authorization: `Bearer ${_token}`,
        Accept: "application/json",
        "X-localization": UtilMethods.getLanguage(),
      },
    };
    let url = new URL(`${BASE_URL}/request-2fa`);
    if(_accountId) {
      url.searchParams.set("cte", _accountId);
    }
    if(_notif) {
      url.searchParams.set("notif", _notif);
    }
    if(_method) {
      url.searchParams.set("method", _method);
    }
    try {
      let response = await axios.get(url.toString(), config);
      if (response.status === 200) {
        result.data = response.data;
      }
    } catch (err) {
      console.log("Request 2FA OTP error::: ", err);
      result.error = err;
    }
    return result;
  }
}

export default AccountService;
