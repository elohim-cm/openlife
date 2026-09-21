"use client";

import {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import DistributionAreaCreate from "@/components/Distribution-area/DistribuationAreaCreate";
import UtilMethods from "@/utils/UtilMethods";
import BusinessGoalCreate from "@/components/BusinessGoal/BusinessGoalCreate";
import NotFound from "@/components/NotFound";

const AreaCreatePage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);

  return <>
      {
        UtilMethods.getHabilitations(authorizations, 'distribution area').canCreate === true ? <DistributionAreaCreate />
            : <NotFound />
      }
    </>
};

export default AreaCreatePage;
