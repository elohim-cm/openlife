import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import toast from "@/utils/toast";

class NetworkService {
  /**
   * get all animation teams
   *
   * @param token
   * @param page
   */
  static async getAll(token, page = 1, _query = "", perPage = "", withoutPagination = false) {
    let response = {
      teams: [],
      links: {},
      pagination: [],
      error: null,
      status: 0,
    };

    // endpoint url
    let url = `${BASE_URL}/animation-team?&q=${_query}`;

    // header config
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    };

    if (withoutPagination) {
      headers["Without-Pagination"] = "true";
    }

    const config = {
      headers: headers,
    };

    try {
      const result = await axios.get(url, config);

      // check if there are any data
      if (result.status === 200) {
        response.teams = result.data.data.animation_teams;
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
   * get a single animation team
   *
   * @param token
   * @param teamUuid
   */
  static async getOne(token, teamUuid) {
    let response = {
      team: {},
      error: null,
      status: 0,
    };

    // endpoint url
    let url = `${BASE_URL}/animation-team/${teamUuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);
      console.log("Animation team service -- get one -- response ||| ", result);

      if (result.status === 200) {
        response.team = result.data.data;
      }
    } catch (err) {
      response.error = err;
      console.log("Animation team service -- get one -- response error ||| ", err);
    }

    return response;
  }

  /**
   * create a new team
   *
   * @param token {string}
   * @param data {string}
   */
  static async create(token, data) {
    let response = {
      data: null,
      error: null,
      status: 0,
    };

    let url = `${BASE_URL}/animation-team`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      let result = await axios.post(url, data, config);
      console.log("Animation team service -- create -- response ||| ", result);
      if (result.status === 201) {
        response.data = result.data.data;
        response.status = result.status;
      }
    } catch (err) {
      console.log("Animation team service -- create -- response error ||| ", err);
      response.error = err;
    }

    return response;
  }

  /**
   * update a team
   *
   * @param token
   * @param teamUuid
   * @param data
   */
  static async update(token, teamUuid, data) {
    let response = {
      data: {},
      error: null,
      status: 0,
    };

    // endpoint url
    let url = `${BASE_URL}/animation-team/${teamUuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.put(url, data, config);

      console.log("Animation team service -- update team response ||| ", result);

      if (result.status === 201) {
        response.data = response.data.data;
        response.status = result.status;
      }
    } catch (err) {
      console.log("Animation team service -- update team response error ||| ", err);
      response.error = err;
      response.status = err.status;
    }

    return response;
  }

  static async deleteArea(token, teamUuid) {
    let response = {
      data: {},
      error: null,
      status: 0,
    };

    // endpoint url
    let url = `${BASE_URL}/animation-team/${teamUuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.delete(url, config);

      if (result.status === 200) {
        response.data = response.data.data;
        response.status = result.status;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * bulk assignment of providers to animation team
   *
   * @param token
   * @param data
   */
  static async bulkAssignement(token, data) {
    let response = {
      data: null,
      error: null,
      status: 0,
    };

    let url = `${BASE_URL}/animation-team/bulk-assignement`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      let result = await axios.post(url, data, config);
      console.log("Animation team service -- bulk assignement -- response ||| ", result);
      if (result.status === 200) {
        response.data = result.data.data;
        response.status = result.status;
      }
    } catch (err) {
      console.log("Animation team service -- bulk assignement -- response error ||| ", err);
      response.error = err;
    }

    return response;
  }
}

export default NetworkService;
