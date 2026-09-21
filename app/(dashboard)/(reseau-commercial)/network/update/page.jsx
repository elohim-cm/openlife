"use client";
import {useAppContext} from "@/contexts/appContext";
import {useEffect} from "react";
import NetworkUpdate from "@/components/Network/NetworkUpdate";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";

const NetworkUpdatePage = () => {
  const context = useAppContext();
  const storedValues = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("storedValues")) : {};
  const authorizations = storedValues?.authorizations || [];

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
