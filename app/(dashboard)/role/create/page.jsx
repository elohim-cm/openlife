"use client";

import React, {useEffect} from "react";
import RoleCreateForm from "@/components/Roles/RoleCreateForm";
import {useAppContext} from "@/contexts/appContext";
import Constants from "@/utils/constants";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {Button} from "@mui/material";
import {useRouter} from "next/navigation";
import UtilMethods from "@/utils/UtilMethods";
import AccountCreate from "@/components/Account/AccountCreate";
import NotFound from "@/components/NotFound";
import {useTranslation} from "react-i18next";

const RoleCreate = () => {
  const [token, setToken] = React.useState("");
  const router = useRouter();
  const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const {t} = useTranslation();

  useEffect(() => {
    context.togglePageLoading();
  }, []);

  const {token: token_} = JSON.parse(localStorage.getItem("storedValues") ?? Constants.defaultStoredValue);

  React.useEffect(() => {
    setToken(token_);
  }, [token_]);

  return <>
      {
          UtilMethods.getHabilitations(authorizations, 'role').canCreate ?  <>
                  <Button
                      variant="outlined"
                      startIcon={<ArrowBackIcon />}
                      color="secondary"
                      onClick={() => {
                          context.togglePageLoading(true);
                          router.back();
                      }}
                      sx={{mb: 2}}>
                      {t("back")}
                  </Button>
                  <RoleCreateForm token={token} />
              </>
              : <NotFound />
      }
  </>
};

export default RoleCreate;
