import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import UtilMethods from "@/utils/UtilMethods";
import {getToken} from "@/utils";

// authorization = authorization

export const getAllAuthorizations = async token => {
  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`},
  };

  return await axios.get(`${BASE_URL}/authorization`, config);
};

// get authorizations per page
export const getNextAuthorizationsPageData = async (token, page) => {
  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`},
  };

  return await axios.get(`${BASE_URL}/authorization?page=${page}`, config);
};

// get a single authorization
export const getAuthorization = async (token, uid) => {
  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`},
  };

  return await axios.get(`${BASE_URL}/authorization/${uid}`, config);
};

// get role authorization
export const getRoleAuthorization = async (token, roleUid) => {
  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`},
  };

  return await axios.get(`${BASE_URL}/role/${roleUid}/authorizations`, config);
};

// create a new authorization
export const createAuthorization = async (token, data) => {
  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`},
  };

  return await axios.post(`${BASE_URL}/authorization`, data, config);
};

// update a menu
export const updateAuthorization = async (token, data, authorizationUid) => {
  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`},
  };

  return await axios.put(`${BASE_URL}/authorization/${authorizationUid}`, data, config);
};

// delete a menu
export const deleteAuthorization = async (token, authorizationUid) => {
  token = getToken();
  const header = await fetch(`${BASE_URL}/authorization/${authorizationUid}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "X-localization": UtilMethods.getLanguage(),
    },
  });

  const result = await header.json();
  if (header.status !== 200) {
    throw new Error(result.message || result.error || header.statusText);
  }
  return result.message;
};
