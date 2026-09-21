import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import UtilMethods from "@/utils/UtilMethods";
import {getToken} from "@/utils";

class ContractService {
  static columns = t => [
    {name: "old_value", label: t("oldValue")},
    {name: "new_value", label: t("newValue")},
    {name: "amendment", label: t("amendment")},
    {name: "download_limit", label: t("downloadLimit")},
    {name: "access", label: t("account")},
    {name: "actions", label: "Actions", filter: false, sort: false},
  ];

  /**
   * get all Contracts
   *
   * @param token
   * @param _page
   * @param _search
   * @param _statut
   * @param _perPage
   */
  static async getAll(token, _page = 1, _search = "", _statut = "", _perPage = 10) {
    let response = {
      contracts: [],
      links: {},
      pagination: [],
      error: null,
    };

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };
    // endpoint url
    let url = `${BASE_URL}/contract`;
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
        console.log("Contract service -- get all -- response ||| ", result);
        response.contracts = result.data.data.contracts;
        response.links = result.data.data.links;
        response.pagination = result.data.data.pagination;
      }
    } catch (err) {
      // if any error
      console.log("Contract service -- get all -- response error ||| ", err);
      response.error = err;
    }

    return response;
  }

  /**
   * get a single contract
   *
   * @param token
   * @param contractUuid
   */
  static async getOne(token, contractUuid) {
    let response = {
      contract: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/contract/${contractUuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);

      if (result.status === 200) {
        response.contract = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * update a contract
   *
   * @param token
   * @param contractUuid
   * @param data
   * @param otp
   */
  static async update(token, contractUuid, data, otp = null) {
    let response = {
      data: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/contract/${contractUuid}`;

    // header config
    const headers = {Authorization: `Bearer ${token}`, Accept: "application/json"};
    if(otp) {
      headers['2fa-Otp'] = otp;
    }
    const config = {headers};

    try {
      const result = await axios.put(url, data, config);

      if (result.status === 200) {
        response.data = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   *
   * @param _token {string}
   * @param contractUuid {string}
   * @param _data {string}
   * @returns {Promise<{data: {uid: string}|null, error: AxiosError|null}>}
   */
  static async validateUpdate(_token, contractUuid, _data) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const headers = {Authorization: `Bearer ${_token}`, Accept: "application/json"};
      const config = {headers};
      let url = `${BASE_URL}/contract/${contractUuid}/validate-update`;
      let response = await axios.post(url, _data, config);
      if (response.status === 200 || response.status === 204) {
        result.data = true;
      }
    } catch (e) {
      result.error = e;
    }
    return result;
  }

  static async amendment(token, contractUuid, data) {
    let response = {
      data: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/contract/my-contract/${contractUuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.put(url, data, config);

      if (result.status === 200) {
        response.data = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * suspend a contract
   *
   * @param token
   * @param contract
   */
  static async suspend(token, contract) {
    token = getToken();
    const url = `${BASE_URL}/contract/${contract}/suspend`;
    const header = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    const data = await header.json();
    if (header.status !== 200) {
      throw new Error(data.message || data.error || header.statusText);
    }

    return data;
  }

  /**
   * reactivate a contract
   *
   * @param token
   * @param contractUuid
   */
  static async reactivate(token, contractUuid) {
    let response = {
      data: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/contract/${contractUuid}/reactivate`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.post(url, JSON.stringify({}), config);

      if (result.status === 200) {
        console.log("Contract service -- reactivate -- response ||| ", result);
        response.data = result.data.data;
      }
    } catch (err) {
      console.log("Contract service -- reactivate -- response error ||| ", err);
      response.error = err;
    }

    return response;
  }

  /**
   * affect a contract to a provider
   *
   * @param token
   * @param providerUUID
   * @param contracts
   */
  static async affect(token, providerUUID, contracts) {
    let response = {
      data: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/contract/${providerUUID}/affect`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.post(url, contracts, config);

      if (result.status === 200) {
        console.log("Contract service -- affect -- response ||| ", result);
        response.data = result.data.data;
      }
    } catch (err) {
      console.log("Contract service -- affect -- response error ||| ", err);
      response.error = err;
    }

    return response;
  }

  // get affiliations
  static async getAffiliations() {
    let response = {
      affiliations: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/affiliation`;

    try {
      const result = await axios.get(url);

      if (result.status === 200) {
        response.affiliations = result.data.data.affiliations;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  // get marital statuses
  static async getMaritalStatuses() {
    let response = {
      situations: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/situation`;

    try {
      const result = await axios.get(url);

      if (result.status === 200) {
        response.situations = result.data.data.modalities;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  // get marital genders
  static async getGenders() {
    let response = {
      genders: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/gender`;

    try {
      const result = await axios.get(url);

      if (result.status === 200) {
        response.genders = result.data.data.modalities;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  static async download(token, uid) {
    let result = {
      data: null,
      error: null,
    };
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
      responseType: "blob",
    };
    let url = `${BASE_URL}/contract/${uid}/download`;
    try {
      let response = await axios.get(url, config);
      if (response.status === 200) {
        result.data = true;
        window.open(URL.createObjectURL(response.data));
      }
    } catch (err) {
      console.log("Download contract error::: ", err);
      result.error = err;
    }
    return result;
  }

  static async downloadAmendment(token, uid) {
    let result = {
      data: null,
      error: null,
    };
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
      responseType: "blob",
    };
    let url = `${BASE_URL}/contract/${uid}/download-amendment`;
    try {
      let response = await axios.get(url, config);
      if (response.status === 200) {
        result.data = true;
        window.open(URL.createObjectURL(response.data));
      }
    } catch (err) {
      console.log("Download contract error::: ", err);
      result.error = err;
    }
    return result;
  }

  static async getHistories(token, contract, page) {
    token = getToken();
    const header = await fetch(`${BASE_URL}/contract/${contract}/history?page=${page}`, {
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

  /**
   * get a single contract
   *
   * @param token
   * @param contractUuid
   */
  static async redemption(token, contractUuid) {
    let response = {
      data: null,
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/contract/${contractUuid}/redemption`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);

      if (result.status === 200) {
        response.data = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  static async redemptions(token, contractUuid, _page = 1, _status = "") {
    let response = {
      datas: null,
      pagination: null,
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/contract/${contractUuid}/redemptions?page=${_page}&status=${_status}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);

      if (result.status === 200) {
        console.log(result);
        response.datas = result.data.data.redemptions;
        response.pagination = result.data.data.pagination;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }
}

export default ContractService;
