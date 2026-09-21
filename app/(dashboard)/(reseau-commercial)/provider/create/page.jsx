"use client";

import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import ProviderCreate from "@/components/Provider/ProviderCreate";
import UtilMethods from "@/utils/UtilMethods";
import NetworkCreate from "@/components/Network/NetworkCreate";
import NotFound from "@/components/NotFound";

const ProviderCreatePage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);

  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'provider').canCreate ? <ProviderCreate />
          : <NotFound />
    }
  </>
};

export default ProviderCreatePage;
