'use client'

import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import WalletDetails from "@/components/Relationships/WalletDetails";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";

const DetailsPage = () => {
    const context = useAppContext();
    const storedValues = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("storedValues")) : {};
    const authorizations = storedValues?.authorizations || [];

    useEffect(() => {
        context.togglePageLoading();
    }, []);

    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'relationships').canRead ? <WalletDetails/>
                : <NotFound />
        }
    </>
};

export default DetailsPage;
