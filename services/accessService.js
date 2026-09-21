import axios from "./AxiosClient";
import {BASE_URL} from "@/utils/api/api";

// get all access
export const getAccesses = async token => {
  let response = {
    accesses: [],
    links: {},
    pagination: {},
    error: {},
  };

  // endpoint url
  let url = `${BASE_URL}/access`;

  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
  };

  try {
    const result = await axios.get(url, config);

    if (result.status === 200) {
      response.accesses = result.data.data.accesses;
      response.links = result.data.data.links;
      response.pagination = result.data.data.pagination;
    }
  } catch (err) {
    response.error = err;
  }

  return response;
};

// get a single access
export const getAccess = async (token, accessUid) => {
  let response = {
    access: {},
    error: {},
  };

  let url = `${BASE_URL}/access/${accessUid}`;

  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
  };

  try {
    const result = await axios.get(url, config);

    if (result.status === 200) {
      response.access = result.data.data;
    }
  } catch (err) {
    response.error = err;
  }

  return response;
};

// create a new access
export const createAccess = async (token, data) => {
  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`},
  };

  return await axios.post(`${BASE_URL}/access`, data, config);
};

// update a menu
export const updateAccess = async (token, data, access) => {
  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`},
  };

  return await axios.put(`${BASE_URL}/access/${access}`, data, config);
};

// delete a access
export const deleteAccess = async (token, access) => {
  // header config
  const config = {
    headers: {Authorization: `Bearer ${token}`},
  };

  return await axios.delete(`${BASE_URL}/access/${access}`, config);
};

/*
export async function getUserAccesses(token, Uuid){
  const header = await fetch(`${BASE_URL}/account/`,)
}*/
