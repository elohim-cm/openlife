import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import toast from "@/utils/toast";
import {ADMINCODE, DIRECTEUR_COMMERCIAL, PROVIDERCODE} from "@/services/roleService";
import UtilMethods from "@/utils/UtilMethods";
import {getToken} from "@/utils";

class ProviderService {
  static ACTIVE = "active";
  static INACTIVE = "inactive";
  static SYSTEMCODE = "SYSTEM";

  static equivalent = {
    active: "activé",
    inactive: "désactivé",
  };
  static providerNature(t) {
    return {
      EMPLOYEE: t("employee"),
      UNEMPLOYED: t("nonEmployee"),
    };
  }
  static contractualStatus(t) {
    return {
      WORK_CONTRACT: t("workContract"),
      INTERNSHIP_LETTER: t("internshipLetter"),
      FREE_PROVIDER_CONTRACT: t("freeProviderContract"),
      OTHER: t("others"),
    };
  }

  /**
   * @typedef {Object} Permission
   * @property {string} uid
   * @property {string} label
   */

  /**
   * @typedef {Object} Menu
   * @property {string} uid
   * @property {string} label
   * @property {number} order
   */

  /**
   * @typedef {Object} Habilitation
   * @property {Permission} permission
   * @property {Menu} menu
   */

  /**
   * Gets an object with functions representing permissions based on the provided label.
   *
   * @param {Array<Habilitation>} habilitations
   * @param {string} label
   * @returns {Object}
   * @property {boolean} canRead
   * @property {boolean} canCreate
   * @property {boolean} canUpdate
   * @property {boolean} canDelete
   */
  static getHabilitations(habilitations, label) {
    const filteredHabilitations = habilitations.filter(
      authorization =>
        authorization.permission.label === "create " + label ||
        authorization.permission.label === "delete " + label ||
        authorization.permission.label === "read " + label ||
        authorization.permission.label === "update " + label ||
        authorization.permission.label === "fit " + label ||
        authorization.permission.label === "deactivate " + label,
    );

    return {
      canRead: !!filteredHabilitations.find(authorization => authorization.permission.label === "read " + label),
      canCreate: !!filteredHabilitations.find(authorization => authorization.permission.label === "create " + label),
      canUpdate: !!filteredHabilitations.find(authorization => authorization.permission.label === "update " + label),
      canDelete: !!filteredHabilitations.find(authorization => authorization.permission.label === "delete " + label),
      canFit: !!filteredHabilitations.find(authorization => authorization.permission.label === "fit " + label),
      canDeactivate: !!filteredHabilitations.find(
        authorization => authorization.permission.label === "deactivate " + label,
      ),
    };
  }

  static authProvider(provider) {
    const storedValues = JSON.parse(localStorage.getItem("storedValues")) || {authCredentials: {}, access: []};
    const {authCredentials, access: accesses} = storedValues;
    const currentAccess = localStorage.getItem("currentAccess");

    const currentAccessInfo = accesses.find(access => access.uid === currentAccess);
    const isProvider = currentAccessInfo?.role.code === PROVIDERCODE;
    const isAdmin = currentAccessInfo?.role.code === ADMINCODE;
    const isCommercialDirector = currentAccessInfo?.role.code === DIRECTEUR_COMMERCIAL;

    if (Object.keys(authCredentials).length > 0 && isProvider) {
      return provider.professional_email === authCredentials.email && provider.phone === authCredentials.phone;
    }

    return isAdmin || isCommercialDirector;
  }

  /**
   * get all providers
   *
   * @param token
   * @param page
   */
  static async getAll(token, page = 1, role = "", q = "", status = "", perPage = "", withoutPagination = false) {
    let response = {
      providers: [],
      links: {},
      pagination: [],
      error: null,
    };

    const queryString = UtilMethods.buildQueryString({
      page,
      role,
      q,
      status,
      per_page: perPage,
    });

    let url = `${BASE_URL}/provider`;

    if (queryString !== "") {
      url += `?${queryString}`;
    }
    // let url = `${BASE_URL}/provider?page=${page}&role=${role}&q=${q}&status=${status}&per_page=${perPage}`;

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
        response.providers = result.data.data.providers;
        response.links = result.data.data.links;
        response.pagination = result.data.data.pagination;
      }
    } catch (err) {
      // if any error
      response.error = err;
    }

    return response;
  }
  static async getGenders() {
    let response = {
      genders: null,
      error: null,
      status: 0,
    };

    // endpoint url
    let url = `${BASE_URL}/gender`;

    try {
      const result = await axios.get(url);

      // check if there are any data
      if (result.status === 200) {
        response.genders = result.data.data.modalities;
        response.status = result.status;
      }
    } catch (err) {
      // if any error
      response.error = err;
      response.status = err.status;
    }

    return response;
  }
  static async situations() {
    let response = {
      situations: null,
      error: null,
      status: 0,
    };

    // endpoint url
    let url = `${BASE_URL}/situation`;

    try {
      const result = await axios.get(url);

      // check if there are any data
      if (result.status === 200) {
        response.situations = result.data.data.modalities;
        response.status = result.status;
      }
    } catch (err) {
      // if any error
      response.error = err;
      response.status = err.status;
    }

    return response;
  }

  /**
   * get all providers
   *
   * @param token
   * @param page
   */
  static async getProviderNatures(token, page = 1) {
    let response = {
      providerNatures: [],
      links: {},
      pagination: [],
      error: null,
      status: 0,
    };

    // endpoint url
    let url = `${BASE_URL}/provider-nature?page=${page}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);

      // check if there are any data
      if (result.status === 200) {
        response.providerNatures = result.data.data.provider_nature;
        response.links = result.data.data.links;
        response.pagination = result.data.data.pagination;
        response.status = result.status;
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
   * @param providerUuid
   */
  static async getOne(token, providerUuid) {
    let response = {
      provider: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/provider/${providerUuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.get(url, config);

      if (result.status === 200) {
        response.provider = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  /**
   * create a new provider
   *
   * @param token {string}
   * @param data {string}
   */
  static async create(token, data) {
    let result = {
      data: null,
      error: null,
    };

    let url = `${BASE_URL}/provider`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      let response = await axios.post(url, data, config);
      if (response.status === 200) {
        result.data = response.data.data;
      }
    } catch (err) {
      result.error = err;
    }
    return result;
  }

  /**
   * update a provider
   *
   * @param token
   * @param providerUuid
   * @param data
   */
  static async update(token, providerUuid, data) {
    let response = {
      provider: {},
      error: null,
    };

    // endpoint url
    let url = `${BASE_URL}/provider/${providerUuid}`;

    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    try {
      const result = await axios.put(url, data, config);

      if (result.status === 200) {
        response.provider = result.data.data;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }

  static async deleteProvider(token, uuid) {
    token = getToken();
    const header = await fetch(`${BASE_URL}/provider/${uuid}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
        "X-localization": UtilMethods.getLanguage(),
      },
    });

    const result = await header.json();
    if (header.status !== 200) {
      throw new Error(result.message || header.statusText);
    }

    return result.message;
  }

  static async show(token, uuid) {
    token = getToken();
    const header = await fetch(`${BASE_URL}/provider/${uuid}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
        "X-localization": UtilMethods.getLanguage(),
      },
    });

    const result = await header.json();
    if (header.status !== 200) {
      throw new Error(result.message || header.statusText);
    }

    return result;
  }

  static async deactivate(token, uuid) {
    token = getToken();
    const header = await fetch(`${BASE_URL}/provider/${uuid}/deactivate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + token,
        "X-localization": UtilMethods.getLanguage(),
      },
    });

    const result = await header.json();
    if (header.status !== 200) {
      throw new Error(result.message || header.statusText);
    }
    return result.message;
  }

  /**
   * Get providers by animation team UID
   *
   * @param token
   * @param teamUid - Animation team UID to filter providers
   * @param page
   * @param q - Search query
   * @param withoutPagination
   */
  static async getTeamProviders(token, teamUid, page = 1, q = "", withoutPagination = false) {
    let response = {
      providers: [],
      links: {},
      pagination: [],
      error: null,
    };

    const filters = {
      animation_team_uid: teamUid,
    };

    const queryString = UtilMethods.buildQueryString({
      page,
      q,
      filters: JSON.stringify(filters),
    });

    let url = `${BASE_URL}/provider`;

    if (queryString !== "") {
      url += `?${queryString}`;
    }

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
      if (result.status === 200) {
        response.providers = result.data.data.providers;
        response.links = result.data.data.links;
        response.pagination = result.data.data.pagination;
      }
    } catch (err) {
      response.error = err;
    }

    return response;
  }
}

export default ProviderService;
