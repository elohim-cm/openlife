"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Box, Tabs, Tab, Typography, CircularProgress, MenuItem, Grid, Button, Card } from "@mui/material";
import { useTranslation } from "react-i18next";
import { getToken } from "@/utils";
import OtpCodeService from "@/services/OtpCodeService";
import OtpCodesTable from "./OtpCodesTable";
import ConfirmationCodesTable from "./ConfirmationCodesTable";
import Toast from "@/utils/toast";
import { Search, FilterList } from "@mui/icons-material";
import MDInput from "@/material/components/MDInput";

const OtpCodeList = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpCodes, setOtpCodes] = useState([]);
  const [confirmationCodes, setConfirmationCodes] = useState([]);
  const [otpPagination, setOtpPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 100 });
  const [confirmationPagination, setConfirmationPagination] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 100 });
  const [operationType, setOperationType] = useState("Subscription");
  const [codeFilter, setCodeFilter] = useState("");
  const [phoneFilter, setPhoneFilter] = useState("");
  const [otpPhoneFilter, setOtpPhoneFilter] = useState("");
  const [otpEmailFilter, setOtpEmailFilter] = useState("");

  const token = getToken();

  // Charger les codes OTP
  const fetchOtpCodes = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        phone: otpPhoneFilter,
        email: otpEmailFilter,
      };
      const result = await OtpCodeService.get(token, "otp", page, 100, filters);
      if (result.error) {
        setError(result.error.message);
        Toast.error(result.error.message);
      } else if (result.data) {
        setOtpCodes(result.data.otp_codes || []);
        setOtpPagination(result.data.pagination || otpPagination);
      }
    } catch (err) {
      setError(err.message);
      Toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, otpPhoneFilter, otpEmailFilter]);

  // Charger les codes de confirmation
  const fetchConfirmationCodes = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const filters = {
        operation_type: operationType,
        code: codeFilter,
        phone: phoneFilter,
      };
      const result = await OtpCodeService.get(token, "confirmation", page, 100, filters);
      if (result.error) {
        setError(result.error.message);
        Toast.error(result.error.message);
      } else if (result.data) {
        setConfirmationCodes(result.data.otp_codes || []);
        setConfirmationPagination(result.data.pagination || confirmationPagination);
      }
    } catch (err) {
      setError(err.message);
      Toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [token, operationType, codeFilter, phoneFilter]);

  // Charger au changement d'onglet
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    if (newValue === 0) {
      fetchOtpCodes(1);
    } else {
      fetchConfirmationCodes(1);
    }
  };

  // Recharger les codes de confirmation au changement de filtre
  const handleFilterChange = () => {
    if (tabValue === 0) {
      fetchOtpCodes(1);
    } else {
      fetchConfirmationCodes(1);
    }
  };

  const handleOperationTypeChange = (e) => {
    setOperationType(e.target.value);
  };

  const handleCodeFilterChange = (e) => {
    setCodeFilter(e.target.value);
  };

  const handlePhoneFilterChange = (e) => {
    setPhoneFilter(e.target.value);
  };

  const handleOtpPhoneFilterChange = (e) => {
    setOtpPhoneFilter(e.target.value);
  };

  const handleOtpEmailFilterChange = (e) => {
    setOtpEmailFilter(e.target.value);
  };

  const handleClearFilters = () => {
    setCodeFilter("");
    setPhoneFilter("");
    setOperationType("Subscription");
    setOtpPhoneFilter("");
    setOtpEmailFilter("");
  };

  // Charger le premier onglet au montage
  useEffect(() => {
    fetchOtpCodes(1);
  }, [fetchOtpCodes]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        {t("otpCodeList")}
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3}}>
        <Tab label={t("otpCodeTab")} />
        <Tab label={t("confirmationCodeTab")} />
      </Tabs>

      {tabValue === 0 && (
        <Card sx={{ p: 3, mb: 3, boxShadow: 2 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <FilterList color="primary" />
            <Typography variant="h6">{t("filters")}</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <MDInput
                fullWidth
                label={t("phoneNumberFilter")}
                value={otpPhoneFilter}
                onChange={handleOtpPhoneFilterChange}
                size="small"
                placeholder={t("phoneNumber")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <MDInput
                fullWidth
                label={t("emailFilter")}
                value={otpEmailFilter}
                onChange={handleOtpEmailFilterChange}
                size="small"
                placeholder={t("email")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={4} display="flex" alignItems="center" gap={2}>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleFilterChange}
                size="medium"
                fullWidth
              >
                {t("search")}
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                size="medium"
              >
                {t("clear")}
              </Button>
            </Grid>
          </Grid>
        </Card>
      )}

      {tabValue === 1 && (
        <Card sx={{ p: 3, mb: 3, boxShadow: 2 }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            <FilterList color="primary" />
            <Typography variant="h6">{t("filters")}</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <MDInput
                select
                fullWidth
                label={t("operationType")}
                value={operationType}
                onChange={handleOperationTypeChange}
                size="small"
                sx={{
                  '& .MuiInputBase-root': {
                    height: '38px',
                  },
                  '& .MuiInputBase-input': {
                    height: '38px',
                  },
                }}
              >
                <MenuItem value="Subscription">{t("subscription")}</MenuItem>
                <MenuItem value="Redemption">{t("redemption")}</MenuItem>
              </MDInput>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MDInput
                fullWidth
                label={t("codeFilter")}
                value={codeFilter}
                onChange={handleCodeFilterChange}
                size="small"
                placeholder={t("code")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <MDInput
                fullWidth
                label={t("phoneNumberFilter")}
                value={phoneFilter}
                onChange={handlePhoneFilterChange}
                size="small"
                placeholder={t("phoneNumber")}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3} display="flex" alignItems="center" gap={2}>
              <Button
                variant="contained"
                startIcon={<Search />}
                onClick={handleFilterChange}
                size="medium"
                fullWidth
              >
                {t("search")}
              </Button>
              <Button
                variant="outlined"
                onClick={handleClearFilters}
                size="medium"
              >
                {t("clear")}
              </Button>
            </Grid>
          </Grid>
        </Card>
      )}

      <Box>
        {loading && (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Typography color="error" align="center">
            {error}
          </Typography>
        )}

        {!loading && !error && (
          <>
            {tabValue === 0 && (
              <OtpCodesTable
                data={otpCodes}
                pagination={otpPagination}
                onPageChange={fetchOtpCodes}
              />
            )}
            {tabValue === 1 && (
              <ConfirmationCodesTable
                data={confirmationCodes}
                pagination={confirmationPagination}
                onPageChange={fetchConfirmationCodes}
              />
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default OtpCodeList;