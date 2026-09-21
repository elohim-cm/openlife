"use client";
import {useAppContext} from "@/contexts/appContext";
import {useEffect} from "react";
import BuyBackNew from "@/components/buyback/BuyBackNew";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";

const NewBuybackPage = () => {
  const context = useAppContext();
  const {
    authorizations,
  } = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, []);
  return <>
    {UtilMethods.getHabilitations(authorizations, "redemption").canCreate?<BuyBackNew />
      :<NotFound />
    }
  </> ;
};

export default NewBuybackPage;
