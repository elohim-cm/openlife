"use client";

import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import ProviderListing from "@/components/Provider/ProviderListing";
import UtilMethods from "@/utils/UtilMethods";
import NetworkListing from "@/components/Network/NetworkListing";
import NotFound from "@/components/NotFound";

const ApporteurPage = () => {
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const context = useAppContext();

  useEffect(() => {
    context.togglePageLoading();
  }, []);

  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'provider').canRead ? <ProviderListing />
        : <NotFound />
    }
  </>
};

export default ApporteurPage;
