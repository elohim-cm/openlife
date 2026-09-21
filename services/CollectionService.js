import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import toast from "@/utils/toast";
import UtilMethods from "@/utils/UtilMethods";
import {getToken} from "@/utils";

class CollectionService {
  /**
   * get all providers
   *
   * @param token
   * @param _page
   * @param _search
   * @param _statut
   * @param _system
   * @param _perPage
   */
  static async getAll(token, _page = 1, _search = "", _statut = "", _perPage = 10, _system = "") {
    let response = {
      collections: [],
      links: {},
      pagination: [],
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/collection`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    if (_page) {
      url += `?page=${_page}`;
      if (_search) url += `&q=${_search}`;
      if (_statut) url += `&status=${_statut}`;
      if (_system) url += `&system=${_system}`;
    } else {
      if (_search) {
        url += `?q=${_search}`;
        if (_statut) url += `&status=${_statut}`;
        if (_system) url += `&system=${_system}`;
      } else {
        if (_statut) {
          url += `?status=${_statut}`;
          if (_system) url += `&system=${_system}`;
        } else {
          if (_system) url += `?system=${_system}`;
        }
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
        response.collections = result.data.data.collections;
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
   * get a single provider
   *
   * @param token
   * @param collectionUuid
   */
  static async getOne(token, collectionUuid) {
    let response = {
      collection: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/collection/${collectionUuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);

      if (result.status === 200) {
        response.collection = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * make a new collection
   *
   * @param token {string}
   * @param data {string}
   * @param contractUUID {string}
   * @param paymentSystemUUID {string}
   */
  static async new(token, data, contractUUID, paymentSystemUUID) {
    let result = {
      data: null,
      error: null,
    };

    let url = `${BASE_URL}/collection/contract/${contractUUID}/${paymentSystemUUID}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      let response = await axios.post(url, data, config);
      // console.log("Collection service -- new -- response ||| ", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (err) {
      // console.log("Collection service -- new -- response error ||| ", err);
      result.error = err;
    }
    return result;
  }

  /**
   * make a new collection
   *
   * @param token {string}
   * @param contractUUID {string}
   */
  static async clone(token, contractUUID) {
    let response = {
      data: null,
      error: null,
    };

    let url = `${BASE_URL}/collection/clone/${contractUUID}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      let result = await axios.post(url, {}, config);
      console.log("Collection service -- clone -- response ||| ", result);
      if (result.status === 200) {
        response.data = result.data.data;
      }
    } catch (err) {
      console.log("Collection service -- clone -- response error ||| ", err);
      response.error = err;
    }
    return response;
  }

  // get all payment methods
  static async paymentMethods(_subscription = true) {
    let result = {
      methods: null,
      error: null,
    };

    let url = `${BASE_URL}/payment-method`;
    if (_subscription) {
      url += "?subscription";
    }
    try {
      let response = await axios.get(url);
      if (response.status === 200) {
        result.methods = response.data.data.payment_methods;
      }
    } catch (err) {
      result.error = err;
    }
    return result;
  }

  // get all payment systems
  static async paymentSystems(_method) {
    let result = {
      systems: null,
      error: null,
    };

    let url = `${BASE_URL}/payment-system`;
    if (_method) {
      url += `/method/${_method}`;
    }
    try {
      let response = await axios.get(url);
      if (response.status === 200) {
        result.systems = response.data.data.payment_systems;
      }
    } catch (err) {
      result.error = err;
    }
    return result;
  }

  static async checkStatus(_token, _uid) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/collection/payment-status/${_uid}`;
      let response = await axios.post(url, {}, config);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Collection service : Check payment status error ::: ", e);
      result.error = e;
    }
    return result;
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
    let url = `${BASE_URL}/collection/${uid}/download`;

    try {
      let response = await axios.get(url, config);
      if (response.status === 200) {
        result.data = true;
        window.open(URL.createObjectURL(response.data));
      }
    } catch (err) {
      result.error = err;
    }
    return result;
  }

  static async getPaymentSystems() {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        Accept: "application/json",
      };
      let url = `${BASE_URL}/payment-system?q=MOBILE`;
      let response = await axios.get(url, config);

      if (response.status === 200) {
        if (!response.data.data.payment_systems) throw new Error("Response data don't match");
        result.data = response.data.data.payment_systems;
      }
    } catch (e) {
      result.error = e;
    }
    return result;
  }
  static columns = t => [
    {name: "status", label: t("status")},
    {name: "access", label: t("account")},
    {name: "comment", label: t("comment")},
    {name: "created_at", label: t("createdAt")},
    {name: "updated_at", label: t("updatedAt")},
    {name: "actions", label: "Actions", filter: false, sort: false},
  ];

  static async getHistories(token, collection, page) {
    token = getToken();
    const header = await fetch(`${BASE_URL}/collection/${collection}/history?page=${page}`, {
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

  static async regularize(token, collection, datas) {
    let response = {
      collection: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/collection/${collection}/regularization`;

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
        response.collection = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }
}

export default CollectionService;
