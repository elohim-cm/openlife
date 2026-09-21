"use client";

import AuthorizationUpdate from "@/components/Authorization/AuthorizationUpdate";
import {useAppContext} from "@/contexts/appContext";
import React, {useEffect} from "react";
import {getUid} from "@/utils";
import UtilMethods from "@/utils/UtilMethods";
import AuthorizationListing from "@/components/Authorization/AuthorizationListing";
import NotFound from "@/components/NotFound";

const UpdateAuthorizationPage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);
  //  authorization uid param
  const uid = getUid();

  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'authorization').canUpdate ? <AuthorizationUpdate authorizationUid={uid}  />
          : <NotFound />
    }
  </>
};

export default UpdateAuthorizationPage;
