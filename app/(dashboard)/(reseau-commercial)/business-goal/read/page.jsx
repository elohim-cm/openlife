"use client";

import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import BusinessGoalRead from "@/components/BusinessGoal/BusinessGoalRead";
import UtilMethods from "@/utils/UtilMethods";
import BusinessGoalListing from "@/components/BusinessGoal/BusinessGoalListing";
import NotFound from "@/components/NotFound";

const BusinessGoalReadPage = () => {
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
    const context = useAppContext();

    useEffect(() => {
        context.togglePageLoading();
    }, []);

    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'business goals').canRead ? <BusinessGoalRead />
                : <NotFound />
        }
    </> ;
};

export default BusinessGoalReadPage;
