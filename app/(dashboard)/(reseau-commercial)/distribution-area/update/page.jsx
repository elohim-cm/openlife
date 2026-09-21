"use client";
import {useAppContext} from "@/contexts/appContext";
import {useEffect} from "react";
import DistributionAreaUpdate from "@/components/Distribution-area/DistributionAreaUpdate";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";

const DistributionAreaUpdatePage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);

  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'distribution area').canUpdate ? <DistributionAreaUpdate />
          : <NotFound />
    }
    </>
};

export default DistributionAreaUpdatePage;
