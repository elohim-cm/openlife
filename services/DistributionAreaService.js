import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import toast from "@/utils/toast";

class NetworkService {
  /**
   * get all distributions area
   *
   * @param token
   * @param page
   */
  static async getAll(token, page = 1, _qArea = "", perPage = "") {
    let response = {
      areas: [],
      links: {},
      pagination: [],
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/distribution-area?q=${_qArea}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);

      // check if there are any data
      if (result.status === 200) {
        response.areas = result.data.data.distribution_areas;
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
   * get a single area
   *
   * @param token
   * @param areaUuid
   */
  static async getOne(token, areaUuid) {
    let response = {
      area: {},
      error: {},
    };

    // endpoint url
    let url = `${BASE_URL}/distribution-area/${areaUuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);

      if (result.status === 200) {
        response.area = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * create a new area
   *
   * @param token {string}
   * @param data {string}
   */
  static async create(token, data) {
    let response = {
      data: null,
      error: null,
      status: null,
    };

    let url = `${BASE_URL}/distribution-area`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      let result = await axios.post(url, data, config);
      console.log("Distribution Area service -- create -- response ||| ", result);
      if (result.status === 201) {
        response.data = result.data.data;
        response.status = result.status;
      }
    } catch (err) {
      console.log("Distribution Area service -- create -- response error ||| ", err);
      response.error = err;
    }
    return response;
  }

  /**
   * update a area
   *
   * @param token
   * @param areaUuid
   * @param data
   */
  static async update(token, areaUuid, data) {
    let response = {
      data: {},
      error: null,
      status: null,
    };

    // endpoint url
    let url = `${BASE_URL}/distribution-area/${areaUuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.put(url, data, config);

      console.log("area service -- update area response ||| ", result);

      if (result.status === 200) {
        response.data = response.data.data;
        response.status = result.status;
      }
    } catch (err) {
      console.log("area service -- update area response error ||| ", err);
      response.error = err;
      response.status = err.status;
    }

    return response;
  }

  static async deleteArea(token, areaUuid) {
    let response = {
      message: "",
      error: {},
      status: null,
    };

    // endpoint url
    let url = `${BASE_URL}/distribution-area/${areaUuid}`;

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
