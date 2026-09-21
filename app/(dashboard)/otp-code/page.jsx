"use client";
import OtpCodeList from "@/components/OtpCode/OtpCodeList";
import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";

const OtpCodePage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);

  return <>{UtilMethods.getHabilitations(authorizations, "otp code").canRead ? <OtpCodeList /> : <NotFound />}</>;
};

export default OtpCodePage;