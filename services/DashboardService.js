import {BASE_URL} from "@/utils/api/api";
import axios from "./AxiosClient";

class DashboardService {
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
      let url = `${BASE_URL}/dashboard`;
      let response = await axios.get(url, config);
      if (response.status === 200) {
        if (!response.data.data) throw new Error("Response data don't match");
        result.data = response.data.data;
      }
    } catch (e) {
      console.error("Dashboard service : Get dashboard error ::: ", e.message || e);
      result.error = e;
    }
    return result;
  }

  static async subscription(_token) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/dashboard/subscription`;
      let response = await axios.get(url, config);
      if (response.status === 200) {
        if (!response.data.data) throw new Error("Response data don't match");
        result.data = response.data.data;
      }
    } catch (e) {
      console.error("Dashboard service : Get subscription error ::: ", e.message || e);
      result.error = e;
    }
    return result;
  }

  static async contract(_token) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/dashboard/contract`;
      let response = await axios.get(url, config);
      if (response.status === 200) {
        if (!response.data.data) throw new Error("Response data don't match");
        result.data = response.data.data;
      }
    } catch (e) {
      console.error("Dashboard service : Get contract error ::: ", e.message || e);
      result.error = e;
    }
    return result;
  }

  static async collection(_token, params = null) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      const searchParams = new URLSearchParams();
      if(params) {
        for (let paramKey in params) {
          const param = params[paramKey];
          const value = typeof param === "object" ? JSON.stringify(param) : param;
          searchParams.set(paramKey, value);
        }
      }

      let url = `${BASE_URL}/dashboard/collection${params ? '?' + searchParams.toString() : ''}`;
      let response = await axios.get(url, config);
      if (response.status === 200) {
        if (!response.data.data) throw new Error("Response data don't match");
        result.data = response.data.data;
      }
    } catch (e) {
      console.error("Dashboard service : Get collection error ::: ", e.message || e);
      result.error = e;
    }
    return result;
  }

  static async redemption(_token, params= null) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      const searchParams = new URLSearchParams();
      if(params) {
        for (let paramKey in params) {
          const param = params[paramKey];
          const value = typeof param === "object" ? JSON.stringify(param) : param;
          searchParams.set(paramKey, value);
        }
      }
      let url = `${BASE_URL}/dashboard/redemption${params ? '?' + searchParams.toString() : ''}`;
      let response = await axios.get(url, config);
      if (response.status === 200) {
        if (!response.data.data) throw new Error("Response data don't match");
        result.data = response.data.data;
      }
    } catch (e) {
      console.error("Dashboard service : Get redemption error ::: ", e.message || e);
      result.error = e;
    }
    return result;
  }

  static async unpaid(_token) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/dashboard/unpaid`;
      let response = await axios.get(url, config);
      if (response.status === 200) {
        if (!response.data.data) throw new Error("Response data don't match");
        result.data = response.data.data;
      }
    } catch (e) {
      console.error("Dashboard service : Get unpaid error ::: ", e.message || e);
      result.error = e;
    }
    return result;
  }

  static async commission(_token) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/dashboard/commission`;
      let response = await axios.get(url, config);
      if (response.status === 200) {
        if (!response.data.data) throw new Error("Response data don't match");
        result.data = response.data.data;
      }
    } catch (e) {
      console.error("Dashboard service : Get commission error ::: ", e.message || e);
      result.error = e;
    }
    return result;
  }

  static async account(_token) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/dashboard/account`;
      let response = await axios.get(url, config);
      if (response.status === 200) {
        if (!response.data.data) throw new Error("Response data don't match");
        result.data = response.data.data;
      }
    } catch (e) {
      console.error("Dashboard service : Get account error ::: ", e.message || e);
      result.error = e;
    }
    return result;
  }

  static async payment(_token) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/dashboard/payment`;
      let response = await axios.get(url, config);
      if (response.status === 200) {
        if (!response.data.data) throw new Error("Response data don't match");
        result.data = response.data.data;
      }
    } catch (e) {
      console.error("Dashboard service : Get payment error ::: ", e.message || e);
      result.error = e;
    }
    return result;
  }

  static async getForNetwork(_token, startDate, endDate) {
    let result = {
      data: null,
      error: null,
    };
    try {
      const config = {
        headers: {Authorization: `Bearer ${_token}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/dashboard/bussiness-goal`;
      const params = new URLSearchParams();
      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      
      const fullUrl = params.toString() ? `${url}?${params.toString()}` : url;
      
      const response = await axios.get(fullUrl, config);
      if (response && response.status === 200) {
        if (!response.data.data) throw new Error("Response data don't match");
        result.data = response.data.data;
      }
    } catch (e) {
      // CACHE BREAKER - FORCING RECOMPILE - 21:55
      console.error("DASHBOARD_SERVICE_DEBUG_LOG_V2 ::: ", e.message || e);
      result.error = e;
    }
    return result;
  }
}

export default DashboardService;
