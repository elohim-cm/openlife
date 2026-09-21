'use client'

import React, {useEffect} from 'react';
import AccessListing from "@/components/Access/AccessListing";
import {useAppContext} from "@/contexts/appContext";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";

const AccessPage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);

    return <>{UtilMethods.getHabilitations(authorizations, "access").canRead ? <AccessListing /> : <NotFound />}</>;
};

export default AccessPage;