"use client";

import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import NetworkListing from "@/components/Network/NetworkListing";
import UtilMethods from "@/utils/UtilMethods";
import DistributionAreaList from "@/components/Distribution-area/DistributionAreaList";
import NotFound from "@/components/NotFound";

const NetworkPage = () => {
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const context = useAppContext();

  useEffect(() => {
    context.togglePageLoading();
  }, []);

  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'network').canRead ? <NetworkListing />
        : <NotFound />
    }
  </>
};

export default NetworkPage;
