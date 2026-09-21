"use client";
import AccountListing from "@/components/Account/AccountListing";
import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import UtilMethods from "@/utils/UtilMethods";
import AccountDetails from "@/components/Account/AccountDetails";
import NotFound from "@/components/NotFound";
import AccountList from "@/components/Account/AccountList";

const ListingPage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);

  return <>{UtilMethods.getHabilitations(authorizations, "account").canRead ? <AccountList /> : <NotFound />}</>;
};

export default ListingPage;
