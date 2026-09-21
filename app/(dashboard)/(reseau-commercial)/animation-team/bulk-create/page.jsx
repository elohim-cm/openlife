"use client";

import {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import BulkAssignement from "@/components/AnimationTeam/BulkAssignement";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";

const BulkAssignementPage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);

  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'animation team').canUpdate === true ? <BulkAssignement />
          : <NotFound />
    }
  </>;
};

export default BulkAssignementPage;
