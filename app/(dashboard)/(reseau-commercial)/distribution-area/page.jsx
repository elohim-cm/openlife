"use client";

import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import DistributionAreaList from "@/components/Distribution-area/DistributionAreaList";
import UtilMethods from "@/utils/UtilMethods";
import BusinessGoalListing from "@/components/BusinessGoal/BusinessGoalListing";
import NotFound from "@/components/NotFound";

const DistributionAreaPage = () => {
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const context = useAppContext();

  useEffect(() => {
    context.togglePageLoading();
  }, []);

  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'distribution area').canRead ? <DistributionAreaList />
        : <NotFound />
    }
  </>
};

export default DistributionAreaPage;
