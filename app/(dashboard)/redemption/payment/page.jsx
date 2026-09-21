"use client"
import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";
import PaymentRedemptionListing from "@/components/buyback/PaymentRedemptionListing";

const PaymentPage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, []);


    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'redemption payments').canRead ?
                <PaymentRedemptionListing />
                : <NotFound />
        }
    </>
};

export default PaymentPage;