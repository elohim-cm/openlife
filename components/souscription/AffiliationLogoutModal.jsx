"use client";

import React from "react";
import {Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useTranslation} from "react-i18next";
import {useRouter} from "next/navigation";
import AuthService from "@/services/AuthService";
import Toast from "@/utils/toast";

const AffiliationLogoutModal = ({open, onClose}) => {
  const {t} = useTranslation();
  const router = useRouter();

  const handleLogout = () => {
    AuthService.logout();
    Toast.success(t("loggedOutSuccessfully"));
    onClose();
    window.location.reload();
  };

  const handleGoBack = () => {
    onClose();
    router.back();
  };

  return (
    <Dialog open={open} onClose={handleGoBack} maxWidth="sm" fullWidth>
      <DialogTitle sx={{fontWeight: 600, color: "primary.main"}}>
        {t("affiliationLogoutTitle")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText component="div">
          <Typography variant="body1" sx={{mb: 2}}>
            {t("affiliationLogoutMessage")}
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{px: 3, pb: 3, gap: 1}}>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={handleGoBack}
        >
          {t("goBack")}
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          {t("logout")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AffiliationLogoutModal;
