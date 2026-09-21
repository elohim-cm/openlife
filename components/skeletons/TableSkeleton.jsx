import React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Skeleton from "@mui/material/Skeleton";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import {Box} from "@mui/material";

const TableSkeleton = ({rowsNumber}) => {
  //  table rows number
  const rows = Array.from({length: rowsNumber}, (_, index) => index);

  return (
    <>
      <TableContainer component={Paper}>
        <Table aria-label="simple table">
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
    </>
  );
};

export default TableSkeleton;
