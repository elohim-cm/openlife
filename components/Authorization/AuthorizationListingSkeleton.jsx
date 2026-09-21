import React, {Suspense} from "react";
import useAuthorization from "@/hooks/useAuthorization";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {Stack} from "@mui/material";
import Link from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import TableContainer from "@mui/material/TableContainer";
import styles from "@/styles/accountListing.module.scss";
import Skeleton from "@mui/material/Skeleton";

// skeleton rows
const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

const AuthorizationListingSkeleton = () => {
  return (
    <TableContainer component={Paper}>
      <Table sx={{minWidth: 650}} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>
              <Skeleton sx={{bgcolor: "#cdcdcd"}} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index} sx={{"&:last-child td, &:last-child th": {border: 0}}}>
              <TableCell component="th" scope="row">
                <Skeleton sx={{bgcolor: "#cdcdcd"}} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default AuthorizationListingSkeleton;
