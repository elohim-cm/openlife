import { getUserAccess } from "@/services/accountService";

const useHabilitation = () => {

  const { authorizations } = JSON.parse(localStorage.getItem('storedValues'))

  // can read accounts
  const canRead = menu => {
    if (authorizations.find(authorization => authorization.permission.label === `Read ${ menu }`)) {
      return true
    }
    else {
      return false
    }
  }

  // can read accounts
  const canCreate = menu => {
    if (authorizations.find(authorization => authorization.permission.label === `Create ${ menu }`)) {
      return true
    }
    else {
      return false
    }
  }

  // can read accounts
  const canUpdate = menu => {
    if (authorizations.find(authorization => authorization.permission.label === `Update ${ menu }`)) {
      return true
    }
    else {
      return false
    }
  }

  // can read accounts
  const canDelete = menu => {
    if (authorizations.find(authorization => authorization.permission.label === `Delete ${ menu }`)) {
      return true
    }
    else {
      return false
    }
  }

  return { canCreate, canRead, canUpdate, canDelete }
}

export default useHabilitation