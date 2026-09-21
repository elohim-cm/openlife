"use client";

import {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import AnimationTeamCreate from "@/components/AnimationTeam/AnimationTeamCreate";
import UtilMethods from "@/utils/UtilMethods";
import BusinessGoalCreate from "@/components/BusinessGoal/BusinessGoalCreate";
import NotFound from "@/components/NotFound";

const AnimationTeamCreatePage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);

  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'animation team').canCreate === true ? <AnimationTeamCreate />
          : <NotFound />
    }
  </>;
};

export default AnimationTeamCreatePage;
