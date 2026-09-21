"use client";
import {useAppContext} from "@/contexts/appContext";
import {useEffect} from "react";
import DistributionAreaUpdate from "@/components/Distribution-area/DistributionAreaUpdate";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";
import BusinessGoalUpdate from "@/components/BusinessGoal/BusinessGoalUpdate";

const BusinessGoalUpdatePage = () => {
    const context = useAppContext();
    const storedValues = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("storedValues")) : {};
    const authorizations = storedValues?.authorizations || [];

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);

    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'business goals').canUpdate ? <BusinessGoalUpdate />
                : <NotFound />
        }
    </>
};

export default BusinessGoalUpdatePage;
