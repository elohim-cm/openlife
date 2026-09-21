import { useEffect, useState } from "react";
import {
  getAllAuthorizations,
  getRoleAuthorization,
  updateAuthorization
} from "@/services/habilitationService";
import { getAllMenu } from "@/services/memuService";
import { getAllRoles } from "@/services/roleService";
import { getAllPermissions } from "@/services/permissionService";


//  get authorizations
export const useGetAuthorizations = () => {

  // const { token } = useAppContext()

  const [authorizations, setAuthorizations] = useState([])

  //  token
  const { token } = JSON.parse(localStorage.getItem('storedValues'))

  useEffect(() => {

    //  get authorizations
    getAllAuthorizations(token).then(response => {
      //  habilitations
      const { data: { data: { habilitations } } } = response

      //  update authorizations state
      setAuthorizations(habilitations)
    }).catch(error => {
    })
  }, [])

  return { authorizations }
}

export const useCreateAuthorization = () => {
  //  token
  const { token } = JSON.parse(localStorage.getItem('storedValues'))
  //  menus state
  const [menus, setMenus] = useState(null)
  //  role state
  const [roles, setRoles] = useState(null)
  //  permissions state
  const [permissions, setPermissions] = useState(null)

  useEffect(() => {

    // get menus
    getAllMenu(token).then(response => {

      const { data: { menus } } = response

      // update menus state
      setMenus(menus)

    }).catch(error => {
    })

    // get role
    getAllRoles(token).then(response => {

      const { data: { roles } } = response

      //  update role state
      setRoles(roles)

    }).catch(error => {
    })

    // get permissions
    getAllPermissions(token).then(response => {

      const { data: { permissions } } = response

      //  update role state
      setPermissions(permissions)

    }).catch(error => {
    })
  }, [])

  return { menus, roles, permissions }
}
