"use client"
import AccountCreate from "@/components/Account/AccountCreate";
import {useAppContext} from "@/contexts/appContext";
import React, {useEffect} from "react";
import UtilMethods from "@/utils/UtilMethods";
import ProviderCreate from "@/components/Provider/ProviderCreate";
import NotFound from "@/components/NotFound";

const CreateAccountPage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);
    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'account').canCreate ? <AccountCreate/>
                : <NotFound />
        }
    </>
};

export default CreateAccountPage;