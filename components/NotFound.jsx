"use client";

import {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import MDBox from "@/material/components/MDBox";
import MDTypography from "@/material/components/MDTypography";
import MDButton from "@/material/components/MDButton";
import {ArrowBack} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import {useTranslation} from "react-i18next";
import Routes from "@/utils/routes";

const BusinessGoalCreatePage = () => {
    const {t} = useTranslation();
  const context = useAppContext();
  const router = useRouter();
  useEffect(() => {
    context.togglePageLoading();
  }, []);

  return (
    <MDBox
      sx={{
        width: "100%",
        height: "calc(100vh - 100px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}>
      <MDTypography sx={{fontSize: {xs: "32px", md: "72px"}}} mb={3} variant="h1">
        403
      </MDTypography>
      <MDTypography variant="h1">{t("unauthorized")}</MDTypography>
      <MDButton
        color="secondary"
        sx={{display: "flex", alignItems: "center", marginTop: "24px", padding: " 16px 24px"}}>
        <ArrowBack />
        <MDBox sx={{color: "white!important"}} onClick={() => router.push(Routes.DASHBOARD)}>
            {t("backToHome")}
        </MDBox>
      </MDButton>
    </MDBox>
  );
};

export default BusinessGoalCreatePage;
