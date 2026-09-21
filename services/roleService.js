import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import UtilMethods from "@/utils/UtilMethods";

export const ADMINCODE = "ADMIN";
export const PROVIDERCODE = "APP";
export const INSPECTORCODE = "INP";
export const MANAGERCODE = "MNG";
export const ANIMATORCODE = "ANM";
export const DIRECTEUR_COMMERCIAL = "DCOM";
export const SERVICE_CLIENT = "SCL";
export const REFERENT_TECHNIQUE = "TECH";
export const TRESORIER = "TRE";
export const PDG = "PDG";
export const SOUS = "SOUS";
export const PROVIDER = "APP";

export const SOUSCRIPTIONCODEROLE = [SOUS, PROVIDER];

// get all role
export const getAllRoles = async (token, _page = 1, _query = "", _perPage = 10, _withoutPagination = 0) => {
  let result = {
    data: null,
    error: null,
  };
  try {
    // header config
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "X-localization": UtilMethods.getLanguage(),
        "Without-Pagination": _withoutPagination,
      },
    };

    let response = await axios.get(`${BASE_URL}/role?page=${_page}&q=${_query}&per_page=${_perPage}`, config);
    console.log("Role service : getAll response :::", response);
    if (response.status === 200) {
      result.data = response.data.data;
    }
  } catch (e) {
    console.log("Role service : getAll error ::: ", e);
    result.error = e;
  }
  return result;
};

// get a single role
export const getRole = async (token, roleUid) => {
  let result = {
    data: null,
    error: null,
  };
  try {
    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`},
    };

    const response = await axios.get(`${BASE_URL}/role/${roleUid}`, config);
    console.log("Role service : get response :::", response);
    if (response.status === 200) {
      result.data = response.data.data;
    }
  } catch (e) {
    console.log("Role service : get error ::: ", e);
    result.error = e;
  }
  return result;
};

// create a new role
export const createRole = async (token, data) => {
  let result = {
    data: null,
    error: null,
  };
  try {
    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    const response = await axios.post(`${BASE_URL}/role`, data, config);
    console.log("Role service : create response :::", response);
    if (response.status === 201 || response.status === 200) {
      result.data = response.data.data;
    }
  } catch (e) {
    console.log("Role service : create error ::: ", e);
    result.error = e;
  }
  return result;
};

// update a role
export const updateRole = async (token, data, roleUid) => {
  let result = {
    data: null,
    error: null,
  };
  try {
    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`},
    };

    const response = await axios.put(`${BASE_URL}/role/${roleUid}`, data, config);
    if (response.status === 200) {
      result.data = response.data.data;
    }
  } catch (e) {
    console.log("Role service : update error ::: ", e);
    result.error = e;
  }
  return result;
};

// delete a role
export const deleteRole = async (token, roleUid) => {
  let result = {
    data: null,
    error: null,
  };
  try {
    // header config
    const config = {
      headers: {Authorization: `Bearer ${token}`},
    };

    const response = await axios.delete(`${BASE_URL}/role/${roleUid}`, config);
    console.log("Role service : delete response :::", response);
    if (response.status === 200) {
      result.data = response.data.data;
    }
  } catch (e) {
    console.log("Role service : delete error ::: ", e);
    result.error = e;
  }
  return result;
};
