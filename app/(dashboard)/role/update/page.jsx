"use client";

import React, {useCallback, useEffect, useState} from "react";
import {getRole} from "@/services/roleService";
import Error404 from "@/components/errors/404";
import RoleUpdateForm from "@/components/Roles/RoleUpdateForm";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import {getToken, getUid} from "@/utils";
import {useAppContext} from "@/contexts/appContext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {Button} from "@mui/material";
import {useRouter} from "next/navigation";
import {displayHttpError} from "@/utils/api";
import {result} from "validate.js";
import UtilMethods from "@/utils/UtilMethods";
import AccountUpdate from "@/components/Account/AccountUpdate";
import NotFound from "@/components/NotFound";
import {useTranslation} from "react-i18next";

const RoleUpdatePage = () => {
  const {t} = useTranslation();
  const [notFound, setNotFound] = useState(false);
  const [role, setRole] = useState(null);
  const token = getToken();
  const router = useRouter();
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, []);

  const getCurrentRole = useCallback(async _uid => {
    let response = await getRole(token, _uid);
    if (!response.error) {
      setRole(response.data);
    } else {
      displayHttpError(response.error, router);
      // TODO : redirect to 404 not found
      console.log("User not found !");
      setNotFound(true);
    }
  }, []);

  useEffect(() => {
    const uid = getUid();
    getCurrentRole(uid);
  }, [getCurrentRole]);

  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'role').canUpdate ?
          <>
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                color="secondary"
                onClick={() => {
                  context.togglePageLoading(true);
                  router.back();
                }}
                sx={{mb: 2}}>
              Retour
            </Button>
            {!notFound ? (
                role != null ? (
                    <RoleUpdateForm token={token} data={role} />
                ) : (
                    <PageLoadingIndicator visible={true} />
                )
            ) : (
                <Error404 />
            )}
          </>
          : <NotFound />
    }
  </>
};

export default RoleUpdatePage;
