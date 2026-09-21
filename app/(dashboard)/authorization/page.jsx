'use client'

import React, {useEffect} from 'react';
import AuthorizationListing from "@/components/Authorization/AuthorizationListing";
import {useAppContext} from "@/contexts/appContext";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";

const AuthorizationPage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, []);
    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'authorization').canRead ? <AuthorizationListing />
              : <NotFound />
        }
    </>
};

export default AuthorizationPage;