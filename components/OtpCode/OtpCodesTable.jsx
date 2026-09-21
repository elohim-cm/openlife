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
  Typography,
} from "@mui/material";
import { useTranslation } from "react-i18next";

const OtpCodesTable = ({ data, pagination, onPageChange }) => {
  const { t } = useTranslation();

  const handleChangePage = (event, newPage) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    // Note: pour l'instant on garde 100 par page comme demandé
    onPageChange(1);
  };

  return (
    <Box>
      <TableContainer component={Paper} sx={{ borderRadius: "8px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("fullName")}</TableCell>
              <TableCell>{t("email")}</TableCell>
              <TableCell>{t("phoneNumber")}</TableCell>
              <TableCell>{t("twoFactorCode")}</TableCell>
              <TableCell>{t("twoFactorExpiresAt")}</TableCell>
              <TableCell>{t("resetToken")}</TableCell>
              <TableCell>{t("resetTokenExpiresAt")}</TableCell>
              <TableCell>{t("created_at")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {Array.isArray(data) && data.map((row) => (
              <TableRow key={row.uid}>
                <TableCell>{`${row.last_name} ${row.first_name}`}</TableCell>
                <TableCell>{row.email}</TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.two_factor_code}</TableCell>
                <TableCell>{row.two_factor_expires_at}</TableCell>
                <TableCell>{row.reset_token}</TableCell>
                <TableCell>{row.reset_token_expires_at}</TableCell>
                <TableCell>{row.created_at}</TableCell>
              </TableRow>
            ))}
            {(!Array.isArray(data) || data.length === 0) && (
              <TableRow>
                <TableCell colSpan={9} align="center">
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

export default OtpCodesTable;