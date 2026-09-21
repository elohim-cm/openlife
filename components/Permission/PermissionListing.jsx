'use client'

import Skeleton from '@mui/material/Skeleton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { Stack } from "@mui/material";
import { useEffect, useState } from "react";
import Link from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { deletePermission, getAllPermissions } from "@/services/permissionService";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
// import '@/styles/helpers.scss'
import { PERMISSION_LISTING_PAGE } from "@/utils/routes/routes";
import { deleteAuthorization, getAllAuthorizations } from "@/services/habilitationService";

// skeleton rows
const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const skeleton = () => {
  return (
    <TableContainer component={ Paper }>
      <Table sx={ { minWidth: 650 } } aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>
              <Skeleton animation="wave"/>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          { rows.map((row, index) => (
            <TableRow
              key={ index }
              sx={ { '&:last-child td, &:last-child th': { border: 0 } } }
            >
              <TableCell component="th" scope="row">
                <Skeleton animation="wave"/>
              </TableCell>
            </TableRow>
          )) }
        </TableBody>
      </Table>
    </TableContainer>
  )
}

const PermissionListing = ({ currentUser }) => {

  // permissions
  const [permissions, setPermissions] = useState(null)

  // router
  const router = useRouter()

  // theme
  const theme = useTheme()

  // get the permissions
  useEffect(() => {
    const getPermissions = async () => {

      // get the connected user token
      const token = localStorage.getItem('token')

      // fetch the permissions
      const response = await getAllPermissions(token)
      const { status } = response
      const { data: { data: { permissions } } } = response

      if (status === 200) {
        setPermissions(permissions)
      }
      else {
        throw new Error
      }
    }
    getPermissions()

  }, [])

  const onDelete = async permissionUid => {

    // current user token
    const token = currentUser.token


    // get all authorizations
    const { data: { data: { habilitations } } } = await getAllAuthorizations(token)

    // get all authorizations linked to the permission
    const authorizations = habilitations.filter(habilitation => habilitation.permission.uid === permissionUid)

    // delete all authorizations linked to the permission
    for (const authorization of authorizations) {
      await deleteAuthorization(token, authorization.uid);
    }

    // request the api to delete the permission
    const response = await deletePermission(token, permissionUid)

    // if deleted
    if (response.status === 200) {
      const newPermissions = permissions.filter(p => p.uid !== permissionUid)

      // set the new state
      setPermissions(newPermissions)
    }
    else {
      throw new Error()
    }
  }

  return (
    <>
      {
        permissions === null
          ? skeleton()
          : <TableContainer component={ Paper } elevation={ 1 } className="brSm">
            <Table aria-label="accounts listing">
              <TableHead sx={ { borderBottom: `2px solid ${ theme.palette.primary.main }` } }>
                <TableRow>
                  <TableCell>Label</TableCell>
                  <TableCell sx={ { width: "5%" } }>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                { permissions.map(permission => (
                  <TableRow
                    key={ permission.label }
                    sx={ { '&:last-child td, &:last-child th': { border: 0 } } }
                  >
                    <TableCell>{ permission.label }</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={ 1 }>
                        <Link href={ `/dashboard/permission/update/${ permission.label }` }>
                          <EditIcon color="primary"/>
                        </Link>
                        <DeleteIcon
                          className="clickableIcon"
                          color="error"
                          onClick={ () => onDelete(permission.uid) }/>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )) }
              </TableBody>
            </Table>
          </TableContainer>
      }
    </>
  );
};

export default PermissionListing;