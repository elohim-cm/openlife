"use client";

import {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import BusinessGoalCreate from "@/components/BusinessGoal/BusinessGoalCreate";
import UtilMethods from "@/utils/UtilMethods";
import BusinessGoalRead from "@/components/BusinessGoal/BusinessGoalRead";
import NotFound from "@/components/NotFound";

const BusinessGoalCreatePage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues"))  || {};

    useEffect(() => {
        context.togglePageLoading();
    }, []);

    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'business goals').canFit === true ? <BusinessGoalCreate />
                : <NotFound />
        }
    </>
};

export default BusinessGoalCreatePage;
