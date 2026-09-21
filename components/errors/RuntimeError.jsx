"use client";

import {ArrowBack, RefreshOutlined} from "@mui/icons-material";
import {useTranslation} from "react-i18next";
import {Box, Button, Typography} from "@mui/material";

const RuntimeError = ({reset}) => {
  const {t} = useTranslation();

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100svh",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        px: {xs: 2.5, sm: 4, md: 6},
        py: {xs: 4, sm: 6},
      }}>
      <Typography
        component="p"
        sx={{fontSize: {xs: "2rem", sm: "2.5rem", md: "3rem"}, lineHeight: 1, mb: {xs: 2, sm: 3}}}>
        500
      </Typography>
      <Typography
        variant="h1"
        sx={{
          width: "100%",
          maxWidth: "900px",
          fontSize: {xs: "clamp(2.25rem, 12vw, 3.5rem)", sm: "4rem", md: "5.5rem", lg: "6.5rem"},
          lineHeight: {xs: 1.08, md: 1.05},
          textAlign: "center",
          overflowWrap: "anywhere",
        }}>
        {t("anErrorHasOccurred")}
      </Typography>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: {xs: "column", sm: "row"},
          gap: {xs: 1.5, sm: 2},
          width: "100%",
          maxWidth: "560px",
          mt: {xs: 3, sm: 4},
        }}>
        <Button
          onClick={() => reset()}
          variant="contained"
          sx={{width: {xs: "100%", sm: "auto"}, minHeight: "48px", px: 3}}>
          <RefreshOutlined />
          &nbsp;&nbsp;
          {t("refreshThePage")}
        </Button>
        <Button
          onClick={() => (window.location.href = "/dashboard")}
          variant="outlined"
          sx={{width: {xs: "100%", sm: "auto"}, minHeight: "48px", px: 3}}>
          <ArrowBack />
          &nbsp;&nbsp;
          {t("goToHome")}
        </Button>
      </Box>
    </Box>
  );
};

export default RuntimeError;
