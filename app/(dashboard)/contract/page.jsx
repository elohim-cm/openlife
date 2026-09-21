"use client";

import React, {useAppContext} from "@/contexts/appContext";
import {useEffect} from "react";
import ContractList from "@/components/Contract/ContractList";
import UtilMethods from "@/utils/UtilMethods";
import AccountListing from "@/components/Account/AccountListing";
import NotFound from "@/components/NotFound";

const ContractPage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);

  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'contract').canRead ? <ContractList/>
        : <NotFound />
    }
  </>
};

export default ContractPage;
