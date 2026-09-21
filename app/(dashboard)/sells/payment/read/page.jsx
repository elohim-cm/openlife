"use client";

import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";
import PaymentSubscriptionRead from "@/components/souscription/PaymentSubscriptionRead";

const PaymentSubscriptionReadPage = () => {
    const context = useAppContext();
    const storedValues = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("storedValues")) : {};
    const authorizations = storedValues?.authorizations || [];

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
