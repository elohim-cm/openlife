"use client";

import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import ProviderRead from "@/components/Provider/ProviderRead";
import UtilMethods from "@/utils/UtilMethods";
import PaymentSubscritpiontListing from "@/components/souscription/PaymentSubscritpiontListing";
import NotFound from "@/components/NotFound";
import PaymentSubscriptionRead from "@/components/souscription/PaymentSubscriptionRead";

const PaymentSubscriptionReadPage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);

    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'collection payments').canRead ? <PaymentSubscriptionRead />
                : <NotFound />
        }
    </>
};

export default PaymentSubscriptionReadPage;
