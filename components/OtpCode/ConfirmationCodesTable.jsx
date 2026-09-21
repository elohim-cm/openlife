"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Chip,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const ConfirmationCodesTable = ({ data, pagination, onPageChange }) => {
  const { t } = useTranslation();

  const handleChangePage = (event, newPage) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    onPageChange(1);
  };

  return (
    <Box>
      <TableContainer component={Paper} sx={{ borderRadius: "8px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("confirmationCode")}</TableCell>
              <TableCell>{t("operationType")}</TableCell>
              <TableCell>{t("operationCode")}</TableCell>
              <TableCell>{t("phoneNumber")}</TableCell>
              <TableCell>{t("subscriber")}</TableCell>
              <TableCell>{t("created_at")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(data) && data.map((row) => (
              <TableRow key={row.uid}>
                <TableCell>{row.code}</TableCell>
                <TableCell>
                  <Chip
                    label={row.operation_type === "Subscription" ? t("subscription") : t("redemption")}
                    color={row.operation_type === "Subscription" ? "primary" : "secondary"}
                    size="small"
                  />
                </TableCell>
                <TableCell>{row.operation_code}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.subscriber}</TableCell>
                <TableCell>{row.created_at}</TableCell>
              </TableRow>
            ))}
            {(!Array.isArray(data) || data.length === 0) && (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  {t("noData")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPage={pagination?.per_page || 100}
          rowsPerPageOptions={[100]}
          page={pagination?.current_page ? pagination.current_page - 1 : 0}
          count={pagination?.total || 0}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default ConfirmationCodesTable;