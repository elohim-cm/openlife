import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import UtilMethods from "@/utils/UtilMethods";
import {getToken} from "@/utils";

class HabilitationService {
  /**
   *
   * @param _token
   * @param _page
   * @param _query
   * @param _perPage
   * @returns {Promise<{data: {pagination: {current_page: number}, accounts: {uid: string, image: string, updated_at: string, phone: string, last_name: string, token_expired_at: string, created_at: string, first_name: string, email: string, token: string, status: string}[]}|any, error: AxiosError|null}>}
   */
  static async get(_token, _page, _query, _perPage = 10) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {
          Authorization: `Bearer ${_token}`,
          Accept: "application/json",
        },
      };
      let url = `${BASE_URL}/authorization`;
      if (_page) {
        url += `?page=${_page}`;
        if (_query) {
          url += `&q=${_query}`;
        }
      } else {
        if (_query) {
          url += `?q=${_query}`;
        }
        config.headers["Without-Pagination"] = true;
      }

      if (url.indexOf("?") > -1) {
        url += `&per_page=${_perPage}`;
      } else {
        url += `?per_page=${_perPage}`;
      }
      let response = await axios.get(url, config);
      console.log("Habilitation service : Get response :::", response);
      if (response.status === 200) {
        if (_page) {
          if (!response.data.data.authorizations) throw new Error("Response data don't match");
          if (!response.data.data.pagination) throw new Error("Response data don't match");
        }
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Habilitation service : Get error ::: ", e);
      result.error = e;
    }
    return result;
  }
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
      let url = `${BASE_URL}/authorization?q=${_search}`;
      let response = await axios.get(url, config);
      console.log("Habilitation service : Get response :::", response);
      if (response.status === 200) {
        if (!response.data.data.authorizations) throw new Error("Response data don't match");
        if (!response.data.data.pagination) throw new Error("Response data don't match");
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Habilitation service : Get error ::: ", e);
      result.error = e;
    }
    return result;
  }

  /**
   *
   * @param _token {string}
   * @param recordId {string}
   * @returns {Promise<{data: {uid: string, role: {uid: string}, menu: {uid: string}, permission: {uid: string}}|null, error: AxiosError|null}>}
   */
  static async show(_token, recordId) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/authorization/${recordId}`;
      let response = await axios.get(url, config);
      console.log("Habilitation service : Show response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Habilitation service : Show error ::: ", e);
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
      let url = `${BASE_URL}/authorization`;
      let response = await axios.post(url, _data, config);
      console.log("Habilitation service : Create response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Habilitation service : Create error ::: ", e);
      result.error = e;
    }
    return result;
  }
  /**
   *
   * @param _token {string}
   * @param recordId {string}
   * @param _data {string}
   * @returns {Promise<{data: {uid: string}|null, error: AxiosError|null}>}
   */
  static async update(_token, recordId, _data) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/authorization/${recordId}`;
      let response = await axios.put(url, _data, config);
      console.log("Habilitation service : Update response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Habilitation service : Update error ::: ", e);
      result.error = e;
    }
    return result;
  }
  static async getHabilitationRole(token, role, without_page = false) {
    token = getToken();
    const header = await fetch(`${BASE_URL}/role/${role}/authorizations`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "Without-Pages": without_page ? 1 : 0,
        "X-localization": UtilMethods.getLanguage(),
      },
    });

    const {data, message} = await header.json();
    if (header.status !== 200) {
      throw new Error(message || header.statusText);
    }
    console.log("franck --- test ::: " + data.authorizations);
    return data.authorizations;
  }
}

export default HabilitationService;
