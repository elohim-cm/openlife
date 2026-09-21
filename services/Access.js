import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";

class AccessService {
  static ACTIVE = "active";
  static INACTIVE = "inactive";
  static SYSTEMCODE = "SYSTEM";

  static equivalent = {
    active: "activé",
    inactive: "désactivé",
  };
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
      let url = `${BASE_URL}/access`;
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
      console.log("Access service : Get response :::", response);
      if (response.status === 200) {
        if (!response.data.data.accesses) {
          throw new Error("Response data don't match");
        }
        if (!response.data.data.pagination) {
          throw new Error("Response data don't match");
        }
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Access service : Get error ::: ", e);
      result.error = e;
    }
    return result;
  }
  /**
   *
   * @param _token
   * @param _search {string|any}
   * @returns {Promise<{data: {pagination: {current_page: number}, accounts: {uid: string, image: string, updated_at: string, phone: string, last_name: string, token_expired_at: string, created_at: string, first_name: string, email: string, token: string, status: string}[]}|any, error: null}>}
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
      let url = `${BASE_URL}/access?q=${_search}`;
      let response = await axios.get(url, config);
      console.log("Access service : Get response :::", response);
      if (response.status === 200) {
        if (!response.data.data.accesses) {
          throw new Error("Response data don't match");
        }
        if (!response.data.data.pagination) {
          throw new Error("Response data don't match");
        }
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Access service : Get error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token {string}
   * @param _accessUid {string}
   * @returns {Promise<{data: {uid: string, role: object, status: object, code: string, account: {uid: string}}|null, error: AxiosError|null}>}
   */
  static async show(_token, _accessUid) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/access/${_accessUid}`;
      let response = await axios.get(url, config);
      console.log("Access service : Show response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Access service : Show error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token {string}
   * @param _data {string}
   * @returns {Promise<{data: {}|null, error: AxiosError|null}>}
   */
  static async create(_token, _data) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/access`;
      let response = await axios.post(url, _data, config);
      console.log("Access => ", response);
      if (response.status === 201) {
        result.data = response.data;
      }
    } catch (e) {
      console.log("Access service : Create error ::: ", e);
      result.error = e;
    }
    return result;
  }
  /**
   *
   * @param _token {string}
   * @param accessId {string}
   * @param _data {string}
   * @returns {Promise<{data: {uid: string}|null, error: AxiosError|null}>}
   */
  static async update(_token, accessId, _data) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/access/${accessId}`;
      let response = await axios.put(url, _data, config);
      console.log("Access service : Update response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Access service : Update error ::: ", e);
      result.error = e;
    }
    return result;
  }
}

export default AccessService;
