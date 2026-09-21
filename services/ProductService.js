import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import UtilMethods from "@/utils/UtilMethods";

class ProductService {
  /**
   * get a single contract
   *
   * @param token
   * @param contractUuid
   */
  static async show(token, Uuid) {
    let response = {
      product: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/product/${Uuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);

      if (result.status === 200) {
        response.product = result.data.data;
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
   */
  static async update(token, Uuid, data) {
    let response = {
      product: {},
      error: null,
      message: "",
    };

    // endpoint url
    let url = `${BASE_URL}/product/${Uuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.put(url, data, config);

      if (result.status === 200) {
        response.product = result.data.data;
        response.message = result.data.message;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }
}

export default ProductService;
