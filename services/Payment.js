import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";

class PaymentService {
  static COLLECTION = "Collection";
  static SUBSCRIPTION = "Subscription";
  static INITIATED = "initiated";
  static PENDING = "pending";
  static REJECTED = "rejected";
  static VALIDATED = "validated";

  static getType = t => ({
    Subscription: t("subscription"),
    Collection: t("collection"),
  });

  static async getPaymentCollection(token, _page = 1, _search = "", _statut = "", _perPage = 10) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
      };

      let url = `${BASE_URL}/payment/collection`;

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
      console.log("Payment service : Get response :::", response);
      if (response.status === 200) {
        if (!response.data.data.payment_collection) {
          throw new Error("Response data don't match");
        }
        if (!response.data.data.pagination) {
          throw new Error("Response data don't match");
        }
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Payment service : Get error ::: ", e);
      result.error = e;
    }
    return result;
  }

  static async show(token, collection) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
      };

      let url = `${BASE_URL}/payment/collection/${collection}`;
      let response = await axios.get(url, config);

      console.log("Payment service : Get response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Payment service : Get error ::: ", e);
      result.error = e;
    }
    return result;
  }

  static async getPaymentRedemption(token, _page = 1, _search = "", _statut = "", _perPage = 10) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
      };

      let url = `${BASE_URL}/payment/redemption?page=${_page}&q=${_search}&status=${_statut}&per_page=${_perPage}`;
      let response = await axios.get(url, config);
      console.log("Payment service : Get response :::", response);
      if (response.status === 200) {
        if (!response.data.data.payment_redemption) {
          throw new Error("Response data don't match");
        }
        if (!response.data.data.pagination) {
          throw new Error("Response data don't match");
        }
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Payment service : Get error ::: ", e);
      result.error = e;
    }
    return result;
  }

  static async showRedemption(token, redemption) {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
      };

      let url = `${BASE_URL}/payment/redemption/${redemption}`;
      let response = await axios.get(url, config);

      console.log("Payment service : Get response :::", response);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("Payment service : Get error ::: ", e);
      result.error = e;
    }
    return result;
  }
}

export default PaymentService;
