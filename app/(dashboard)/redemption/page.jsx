"use client";
import {useAppContext} from "@/contexts/appContext";
import React, {useEffect} from "react";
import BuyBackList from "@/components/buyback/BuyBackList";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";

const BuyBackListPage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);

  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'redemption').canRead ? <BuyBackList/>
        : <NotFound />
    }
  </>
};

export default BuyBackListPage;
