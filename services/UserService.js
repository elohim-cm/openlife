import {BASE_URL} from "@/utils/api/api";
import axios from "./AxiosClient";
import {getToken} from "@/utils";

class UserService {
  static async get() {
    let result = {
      data: null,
      error: null,
    };
    try {
      // header config
      const config = {
        headers: {Authorization: `Bearer ${getToken()}`, Accept: "application/json"},
      };
      let url = `${BASE_URL}/subscriptions/person`;
      let response = await axios.get(url, config);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (e) {
      console.log("User service : Get person error ::: ", e);
      result.error = e;
    }
    return result;
  }
}

export default UserService;
