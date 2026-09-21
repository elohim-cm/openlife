"use client";

import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import AnimationTeamList from "@/components/AnimationTeam/AnimationTeamList";
import UtilMethods from "@/utils/UtilMethods";
import BusinessGoalRead from "@/components/BusinessGoal/BusinessGoalRead";
import NotFound from "@/components/NotFound";

const AnimationTeamPage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues"))  || {};

  useEffect(() => {
    context.togglePageLoading();
  }, []);

  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'business goals').canRead ? <AnimationTeamList />
        : <NotFound />
    }
  </> ;
};

export default AnimationTeamPage;
