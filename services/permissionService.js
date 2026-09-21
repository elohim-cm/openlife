import axios from 'axios'
import { BASE_URL } from '@/utils/api/api'

// get all permissions
export const getAllPermissions = async (token, _page = 1, _query='', _withoutPagination=0) => {
  console.log(_query)
  let result  = {
    data: null,
    error: null
  };
  try {
    // header config
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Without-Pagination": _withoutPagination
      }
    };

    let response = await axios.get(`${BASE_URL}/permission?page=${_page}&q=${_query}`, config);
    console.log("Perms service : getAll response :::", response);
    if (response.status === 200) {
      result.data = response.data.data;
    }
  } catch (e) {
    console.log("Perms service : getAll error ::: ", e);
    result.error = e;
  }
  return result;
}

// get a single permission
export const getPermission = async (token, uid) => {

  // header config
  const config = {
    headers: { Authorization: `Bearer ${ token }` }
  };

  return await axios.get(`${ BASE_URL }/permission/${ uid }`, config)
}

// create a new permission
export const createPermission = async (token, data) => {

  // header config
  const config = {
    headers: { Authorization: `Bearer ${ token }` }
  };

  return await axios.post(`${ BASE_URL }/permission`, data, config)

}

// update a permission
export const updatePermission = async (token, data, uid) => {

  // header config
  const config = {
    headers: { Authorization: `Bearer ${ token }` }
  };

  return await axios.put(`${ BASE_URL }/permission/${ uid }`, data, config)

}

// delete a permission
export const deletePermission = async (token, permission) => {

  // header config
  const config = {
    headers: { Authorization: `Bearer ${ token }` }
  };

  return await axios.delete(`${ BASE_URL }/permission/${ permission }`, config)

}