'use client'
import AuthorizationCreate from "@/components/Authorization/AuthorizationCreate";
import {useAppContext} from "@/contexts/appContext";
import React, {useEffect} from "react";
import UtilMethods from "@/utils/UtilMethods";
import AuthorizationListing from "@/components/Authorization/AuthorizationListing";
import NotFound from "@/components/NotFound";

const AuthorizationCreatePage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);
    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'authorization').canCreate ? <AuthorizationCreate />
                : <NotFound />
        }
    </>
};

export default AuthorizationCreatePage;