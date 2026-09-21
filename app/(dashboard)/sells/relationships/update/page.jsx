'use client'

import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import WalletUpdate from "@/components/Relationships/WalletUpdate";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";

const UpdatePage = () => {
    const context = useAppContext();
    const storedValues = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("storedValues")) : {};
    const authorizations = storedValues?.authorizations || [];

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);

    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'relationships').canUpdate ? <WalletUpdate/>
                : <NotFound />
        }
    </>
};

export default UpdatePage;
