import {BASE_URL} from "@/utils/api/api";
import axios from "./AxiosClient";
import UtilMethods from "@/utils/UtilMethods";
import {getToken} from "@/utils";

class CommissionService {
  static APPROVAL = "approval";
  static VALIDATION = "validation";
  static PAYMENT = "payment";
  static REJECTED = "rejected";
  static async get(_token, _page = 1, _q = "", _statut = "", _startDate, _endDate) {
    let result = {
      data: null,
      error: null,
      pagination: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/commission`;
      if (_page || _q || _statut) {
        url += `?page=${_page}&q=${_q}&status=${_statut}`;
        if (_startDate && _startDate !== "") {
          url += `&start_date=${_startDate}&end_date=${_endDate}`;
        }
      } else {
        if (_startDate && _startDate !== "") {
          url += `?start_date=${_startDate}&end_date=${_endDate}`;
        }
        config.headers["Without-Pagination"] = true;
      }
      let response = await axios.get(url, config);
      if (response.status === 200) {
        if (!response.data.data.commissions) {
          throw new Error("Response data don't match");
        }
        if (!response.data.data.pagination) {
          throw new Error("Response data don't match");
        }
        result.data = response.data.data.commissions;
        result.pagination = response.data.data.pagination;
      }
    } catch (e) {
      console.log("Commission service : Get error ::: ", e);
      result.error = e;
    }
    return result;
  }

  static async show(_token, commission) {
    let response = {
      commission: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/commission/${commission}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);

      if (result.status === 200) {
        response.commission = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  static async getHistories(token, commission, page = 1, q = "") {
    token = getToken();
    const header = await fetch(`${BASE_URL}/commission/${commission}/history?page=${page}&q=${q}`, {
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

  static columns = t => [
    {name: "status", label: t("status")},
    {name: "access", label: t("access")},
    {name: "comment", label: t("comment")},
    {name: "created_at", label: t("created_at")},
    {name: "updated_at", label: t("updated_at")},
  ];

  static async approve(_token, _datas, _system = "") {
    let response = {
      commission: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/commission/approval`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.post(url, _datas, config);

      if (result.status === 200) {
        response.commission = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  static async validate(_token, _datas, _system = "") {
    let response = {
      commission: {},
      error: null,
    };
    // endpoint url
    let url = `${BASE_URL}/commission/validation`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.post(url, _datas, config);

      if (result.status === 200) {
        response.commission = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }
  static async pay(_token, _datas, _system = "") {
    let response = {
      commission: {},
      error: null,
    };
    // endpoint url
    let url = `${BASE_URL}/commission/payment/${_system}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.post(url, _datas, config);

      if (result.status === 200) {
        response.commission = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }
  static async regularize(token, datas) {
    let response = {
      commission: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/regularization`;

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
        response.commission = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }
}

export default CommissionService;
