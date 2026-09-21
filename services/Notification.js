import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import UtilMethods from "@/utils/UtilMethods";
import {getToken} from "@/utils";

class NotificationService {
  static READ = "read";
  static UNREAD = "unread";
  static async count(_token, _uid) {
    try {
      const header = await fetch(`${BASE_URL}/notification/count`, this.init(_token));
      const response = await header.json();

      if (header.status !== 200) {
        throw new Error(response.message || header.statusText);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.message || "An error occurred while fetching data");
    }
  }

  static init(token, method = "GET", lg = "fr") {
    token = getToken();
    const header = {
      method,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + token,
        "X-localization": UtilMethods.getLanguage(),
      },
    };
    return header;
  }

  static async get(_token, _page = 1, _uid = "", _statut = "", _perPage = 10) {
    try {
      const header = await fetch(
        `${BASE_URL}/notification?page=${_page}&status=${_statut}&per_page=${_perPage}`,
        this.init(_token),
      );
      const response = await header.json();

      if (header.status !== 200) {
        throw new Error(response.message || header.statusText);
      }

      return response.data;
    } catch (error) {
      throw new Error(error.message || "An error occurred while fetching data");
    }
  }
  static async maskAsRead(_token, _notification) {
    try {
      const header = await fetch(`${BASE_URL}/notification/mark-as-read/${_notification}`, this.init(_token));
      const response = await header.json();

      if (header.status !== 200) {
        throw new Error(response.message || header.statusText);
      }

      return response;
    } catch (error) {
      throw new Error(error.message || "An error occurred while fetching data");
    }
  }

  static equivalent = t => ({
    read: t("read"),
    unread: t("unread"),
  });

  static async delete(_token, _uid) {
    try {
      const header = await fetch(`${BASE_URL}/notification/${_uid}`, this.init(_token, "DELETE"));
      const response = await header.json();

      if (header.status !== 200) {
        throw new Error(response.message || header.statusText);
      }

      return response;
    } catch (error) {
      throw new Error(error.message || "An error occurred while fetching data");
    }
  }
}

export default NotificationService;
