"use client"
import PaymentSubscritpiontListing from "@/components/souscription/PaymentSubscritpiontListing";
import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import WalletListing from "@/components/Relationships/WalletListing";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";

const PaymentPage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, []);


    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'collection payments').canRead ?
                <PaymentSubscritpiontListing/>
                : <NotFound />
        }
    </>
};

export default PaymentPage;