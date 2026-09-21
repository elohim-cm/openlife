import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import toast from "@/utils/toast";

class NetworkService {
  static roleLabel = (t, _fromListing = false) => {
    const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
    const access = accesses?.find(access => access.uid === currentAccess);

    const code = access.role.code;

    switch (code) {
      case "ADMIN":
        if (_fromListing) {
          return t("owner");
        } else {
          return t("pdg");
        }
      case "PDG":
        return t("cormmercailDirector");
      case "DCOM":
        return t("inspector");
      default:
        break;
    }
  };
  /**
   * get all providers
   *
   * @param token
   * @param page
   */
  static async getAll(token, page = 1, qNetwork = "", perPage = "", _fromListing = 1, to_list = false) {
    let response = {
      networks: [],
      links: {},
      pagination: [],
      error: {},
    };

    // endpoint url
    let url = `${BASE_URL}/network?q=${qNetwork}&from_listing=${_fromListing}`;
    // if (to_list) {
    //   url += `&to_list=1`;
    // }

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);
      console.log("get all network response ||| ", result.data.data.networks);

      // check if there are any data
      if (result.status === 200) {
        response.networks = result.data.data.networks;
        response.links = result.data.data.links;
        response.pagination = result.data.data.pagination;
      }
    } catch (err) {
      // if any error
      response.error = err;
    }

    return response;
  }

  /**
   * get a single network
   *
   * @param token
   * @param networkUuid
   */
  static async getOne(token, networkUuid) {
    let response = {
      network: {},
      error: {},
    };

    // endpoint url
    let url = `${BASE_URL}/network/${networkUuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);
      console.log("Network Service -- get one network response ||| ", result);

      if (result.status === 200) {
        response.network = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * create a new provider
   *
   * @param token {string}
   * @param data {string}
   */
  static async create(token, data) {
    let result = {
      data: null,
      error: {},
      status: null,
    };

    let url = `${BASE_URL}/network`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      let response = await axios.post(url, data, config);
      console.log("Network service -- create -- response ||| ", response);
      if (response.status === 201) {
        result.data = response.data.data;
        result.status = response.status;
      }
    } catch (err) {
      console.log("Network service -- create -- response error ||| ", err);
      result.error = err;
    }
    return result;
  }

  /**
   * update a provider
   *
   * @param token
   * @param networkUuid
   * @param data
   */
  static async update(token, networkUuid, data) {
    let response = {
      data: {},
      error: {},
      status: null,
    };

    // endpoint url
    let url = `${BASE_URL}/network/${networkUuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.put(url, data, config);

      if (result.status === 200) {
        response.data = response.data.data;
        response.status = result.status;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  static async deleteNetwork(token, networkUuid) {
    let response = {
      message: "",
      error: {},
      status: null,
    };

    // endpoint url
    let url = `${BASE_URL}/network/${networkUuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.delete(url, config);

      if (result.status === 200) {
        response.message = result.data.message;
        response.status = result.status;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }
}

export default NetworkService;
