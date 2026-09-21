"use client"
import AccountListing from "@/components/Account/AccountListing";
import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import WalletListing from "@/components/Relationships/WalletListing";
import UtilMethods from "@/utils/UtilMethods";
import Situation from "@/components/situation/Situation";
import NotFound from "@/components/NotFound";

const WalletPage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, []);


    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'relationships').canRead ? <WalletListing/>
                : <NotFound />
        }
    </>
};

export default WalletPage;