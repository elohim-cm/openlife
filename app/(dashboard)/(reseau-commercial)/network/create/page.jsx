"use client";

import {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import NetworkCreate from "@/components/Network/NetworkCreate";
import UtilMethods from "@/utils/UtilMethods";
import BusinessGoalCreate from "@/components/BusinessGoal/BusinessGoalCreate";
import NotFound from "@/components/NotFound";

const NetworkCreatePage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues"))  || {};

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);

  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'network').canCreate ? <NetworkCreate />
          : <NotFound />
    }
  </>;
};

export default NetworkCreatePage;
