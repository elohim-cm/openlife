"use client";
import {useAppContext} from "@/contexts/appContext";
import {useEffect} from "react";
import AnimationTeamUpdate from "@/components/AnimationTeam/AnimationTeamUpdate";
import UtilMethods from "@/utils/UtilMethods";

const AnimationTeamUpdatePage = () => {
  const context = useAppContext();
  const storedValues = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("storedValues")) : {};
  const authorizations = storedValues?.authorizations || [];

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);

  return <>
    {
      UtilMethods.getHabilitations(authorizations, 'animation team').canUpdate ? <AnimationTeamUpdate />
          : <NotFound />
    }
  </>
};

export default AnimationTeamUpdatePage;
