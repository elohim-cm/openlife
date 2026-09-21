"use client";

import Situation from "@/components/situation/Situation";
import {useAppContext} from "@/contexts/appContext";
import React, {useEffect} from "react";
import UtilMethods from "@/utils/UtilMethods";
import AccountListing from "@/components/Account/AccountListing";
import NotFound from "@/components/NotFound";

const SituationPage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, []);
  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'my situation').canRead ? <Situation />
          : <NotFound />
    }
  </>
};

export default SituationPage;
