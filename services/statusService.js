import axios from 'axios'
import { BASE_URL } from '@/utils/api/api'

// get all statuses
export const getAllStatuses = async token => {

  // header config
  const config = {
    headers: { Authorization: `Bearer ${ token }` }
  };

  return await axios.get(`${ BASE_URL }/statut`, config)
}

// get a single status
export const getStatus = async (token, uid) => {

  // header config
  const config = {
    headers: { Authorization: `Bearer ${ token }` }
  };

  return await axios.get(`${ BASE_URL }/statut/${ uid }`, config)
}

// create a new status
export const createStatus = async (token, data) => {

  // header config
  const config = {
    headers: { Authorization: `Bearer ${ token }` }
  };

  return await axios.post(`${ BASE_URL }/statut`, data, config)

}

// modify a status
export const updateStatus = async (token, data, uid) => {

  // header config
  const config = {
    headers: { Authorization: `Bearer ${ token }` }
  };

  return await axios.put(`${ BASE_URL }/statut/${ uid }`, data, config)

}

// delete a status
export const deleteStatus = async (token, status) => {

  // header config
  const config = {
    headers: { Authorization: `Bearer ${ token }` }
  };

  return await axios.delete(`${ BASE_URL }/statut/${ status }`, config)

}