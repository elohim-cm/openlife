import UtilMethods from "@/utils/UtilMethods";
import {BASE_URL} from "@/utils/api/api";
import AuthService from "@/services/AuthService";
import axios from "./AxiosClient";
import {getToken} from "@/utils";

const axiosInstance = axios.create({
  timeout: 1200000, // Set timeout to 10 minutes (600000 milliseconds)
  responseType: "blob", // Important for handling binary data
});

export default class Export {
  static AuthApi;

  /**
   *
   * @param type {string}
   * @param nature {string}
   * @param token {string}
   * @param context
   * @param navigate
   * @param startDate
   * @param endDate
   * @param commission_query
   */
  static async download(
      token,
      context,
      navigate,
      type,
      nature = "",
      startDate = null,
      endDate = null,
      commission_query = null
  ) {
    let url = `${BASE_URL}/export?type=${type}&nature=${nature}`;

    token = getToken();
    if (startDate && endDate) {
      url += `&start_date=${startDate}&end_date=${endDate}`;
    }
    if (commission_query){
      url += `&filters=${commission_query.filters}&q=${commission_query.q}`;
    }
    const options = {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        "X-localization": UtilMethods.getLanguage(),
      },
    };

    try {
      context.togglePageLoading(true);
      const response = await fetch(url, options);

      if (response.status !== 200) {
        throw new Error(response.statusText);
      }
      const blob = await response.blob();

      // Crée un objet URL pour le blob
      const _url = window.URL.createObjectURL(blob);

      // Crée un lien pour télécharger le fichier
      const link = document.createElement("a");
      link.href = _url;
      link.setAttribute("download", `${type}.csv`);
      document.body.appendChild(link);
      link.click();

      // Nettoie l'URL de l'objet une fois le téléchargement terminé
      window.URL.revokeObjectURL(url);
    } catch (e) {
      AuthService.formatFetchErrorMsgAndLogout(e.message, context, navigate);
    } finally {
      context.togglePageLoading();
    }
  }

  static async stream(token, context, navigate, type, nature = "", startDate = null, endDate = null) {
    try {
      // Toujours récupérer un token frais pour éviter les erreurs d'authentification
      const freshToken = getToken();
      
      let route = `${BASE_URL}/export?type=${type}&nature=${nature}`;
      if (startDate && endDate) {
        route += `&start_date=${startDate}&end_date=${endDate}`;
      }
      context.togglePageLoading(true);
      const response = await axiosInstance.get(route, {
        headers: {
          Authorization: "Bearer " + freshToken,
          "X-localization": UtilMethods.getLanguage(),
        },
        onDownloadProgress: progressEvent => {
          // Calculate the progress percentage
          if (progressEvent.total) {
            let percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log("Download Progress:", percentCompleted, "%");
          } else {
            console.log("Download in Progress:");
          }
          // Update progress indicator in UI (optional)
        },
      });

      // Handle the file download
      const blob = new Blob([response.data], {type: "text/csv;charset=utf-8;"});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${type}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading the file:", error);
      AuthService.formatFetchErrorMsgAndLogout(error.message, context, navigate);
    } finally {
      context.togglePageLoading();
    }
  }
}
