"use client";
import MenuUpdate from "@/components/Menu/MenuUpdate";
import {useAppContext} from "@/contexts/appContext";
import {useEffect} from "react";
import NetworkUpdate from "@/components/Network/NetworkUpdate";
import UtilMethods from "@/utils/UtilMethods";
import NetworkCreate from "@/components/Network/NetworkCreate";
import NotFound from "@/components/NotFound";

const NetworkUpdatePage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);
  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'network').canUpdate === true ? <NetworkUpdate />
          : <NotFound />
    }
  </>;
};

export default NetworkUpdatePage;
