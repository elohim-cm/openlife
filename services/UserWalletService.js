import {BASE_URL} from "@/utils/api/api";
import axios from "./AxiosClient";

class UserWalletService {
  static async get(_token) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/wallet`;
      config.headers["Without-Pagination"] = true;
      let response = await axios.get(url, config);
      if (response.status === 200) {
        if (!response.data.data.person) throw new Error("Response data don't match");
        result.data = response.data.data.person;
      }
    } catch (e) {
      console.log("Wallet service : Get error ::: ", e);
      result.error = e;
    }
    return result;
  }
  static async getCustomers(_token, _page) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/wallet/customers`;
      if (_page) {
        url += `?page=${_page}`;
      } else {
        config.headers["Without-Pagination"] = true;
      }
      let response = await axios.get(url, config);
      if (response.status === 200) {
        if (!response.data.data.person) throw new Error("Response data don't match");
        result.data = response.data.data.person;
      }
    } catch (e) {
      console.log("Wallet service : Get customer error ::: ", e);
      result.error = e;
    }
    return result;
  }
  static async getCustomerContracts(_token, _personUid, _page) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/wallet/customers/${_personUid}/contracts`;
      if (_page) {
        url += `?page=${_page}`;
      } else {
        config.headers["Without-Pagination"] = true;
      }
      let response = await axios.get(url, config);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Wallet service : Get customer contracts error ::: ", e);
      result.error = e;
    }
    return result;
  }
}

export default UserWalletService;
