import axios from 'axios'
import { BASE_URL } from '@/utils/api/api'

// get all menu
export const getAllMenu = async (token, _page = 1, _query='', _perPage = 10,  _withoutPagination=0) => {
  let result = {
    data : null,
    error: null
  };
  try {
    // header config
    const config = {
      headers: {
        Authorization: `Bearer ${ token }` ,
        "Without-Pagination": _withoutPagination
      }
    };

    let response = await axios.get(`${ BASE_URL }/menu?page=${_page}&q=${_query}&per_page=${_perPage}`, config);
    console.log("Menu service : getAll response :::", response);
    if (response.status === 200) {
      result.data = response.data.data;
    }
  } catch (e) {
    console.log("Menu service : getAll error ::: ", e);
    result.error = e;
  }
  return result;
}

// next menu page
export const getNextMenuPage = async (token, page) => {
  // header config
  const config = {
    headers: { Authorization: `Bearer ${ token }` }
  };

  return await axios.get(`${ BASE_URL }/menu?page=${ page }`, config)
}

// get a single menu
export const getMenu = async (token, uid) => {

  // header config
  const config = {
    headers: { Authorization: `Bearer ${ token }` }
  };

  return await axios.get(`${ BASE_URL }/menu/${ uid }`, config)
}

// create a new menu
export const createMenu = async (token, data) => {

  // header config
  const config = {
    headers: { Authorization: `Bearer ${ token }` }
  };

  return await axios.post(`${ BASE_URL }/menu`, data, config)

}

// update a menu
export const updateMenu = async (token, data, uid) => {

  // header config
  const config = {
    headers: { Authorization: `Bearer ${ token }` }
  };

  return await axios.put(`${ BASE_URL }/menu/${ uid }`, data, config)

}

// delete a menu
export const deleteMenu = async (token, menu) => {

  // header config
  const config = {
    headers: { Authorization: `Bearer ${ token }` }
  };

  return await axios.delete(`${ BASE_URL }/menu/${ menu }`, config)

}