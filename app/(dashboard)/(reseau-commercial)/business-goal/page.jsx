"use client";

import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import BusinessGoalListing from "@/components/BusinessGoal/BusinessGoalListing";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";

const BusinessGoalPage = () => {
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
    const context = useAppContext();

    useEffect(() => {
        context.togglePageLoading();
    }, []);

    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'business goals').canRead ? <BusinessGoalListing />
            : <NotFound />
        }
    </>
};

export default BusinessGoalPage;
