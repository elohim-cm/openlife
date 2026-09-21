import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";
import UtilMethods from "@/utils/UtilMethods";
import {formatTableFilters, formatTableSorting, getToken} from "@/utils";

// account create
export const createAccount = async (data, token) => {
  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`},
  };

  // body config
  return await axios.post(`${BASE_URL}/account`, data, config);
};

// account index. list all accounts
export const getAllAccounts = async (token, _page = 1, _query = "") => {
  let response = {
    accounts: [],
    links: {},
    pagination: {},
    error: {},
  };

  const url = new URL(`${BASE_URL}/account`);
  url.searchParams.set("q", _query ?? "");

  // endpoint url
  // let url = `${BASE_URL}/account?q=${_query}&page=${_page}`;

  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
  };

  try {
    const result = await axios.get(url, config);
    if (result.status === 200) {
      response.accounts = result.data.data.accounts;
      response.pagination = result.data.data.pagination;
      response.links = result.data.data.links;
    }
  } catch (err) {
    response.error = err;
  }

  return response;
};

// get authorizations per page
export const getNextAccountsPage = async (token, page) => {
  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`},
  };

  return await axios.get(`${BASE_URL}/account?page=${page}`, config);
};

// get user access
export const getUserAccess = async (accessUid, token, otp = null, trustDevice = false) => {
  let response = {
    authorizations: [],
    error: null,
  };

  // endpoint url
  let url = `${BASE_URL}/auth/user-access`;

  // header config
  const headers = {Authorization: `Bearer ${token}`, Accept: "application/json"};
  if(otp) {
    headers['2fa-Otp'] = otp;
  }
  if(trustDevice) {
    headers['X-Trust-Device'] = "1";
  }
  const config = {headers};

  try {
    const result = await axios.post(url, {access: accessUid}, config);

    if (result.status === 200) {
      console.log("Account service -- get user access -- response ||| ", result);
      response.authorizations = result.data.data;
    }
  } catch (err) {
    console.log("Account service -- get user access -- response ||| ", err);
    response.error = err;
  }

  return response;
};

// account details
export const getAccount = async (token, uid) => {
  let response = {
    account: {},
    error: {},
  };
  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`},
  };

  return await axios.get(`${BASE_URL}/account/${uid}`, config);
};

export const deleteAccount = async (token, uid) => {
  token = getToken();
  const header = await fetch(`${BASE_URL}/account/${uid}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
      "X-localization": UtilMethods.getLanguage(),
    },
  });

  const response = await header.json();

  if (header.status !== 200) {
    throw new Error(response.message || header.statusText);
  }

  return response;
};

// account update
export const updateAccount = async (token, uid, data) => {
  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`},
  };

  return await axios.put(`${BASE_URL}/account/${uid}`, data, config);
};
