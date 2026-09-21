'use client'

import AccessCreate from "@/components/Access/AccessCreate";
import {useAppContext} from "@/contexts/appContext";
import React, {useEffect} from "react";
import UtilMethods from "@/utils/UtilMethods";
import AccessListing from "@/components/Access/AccessListing";
import NotFound from "@/components/NotFound";

const CreateAccessPage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);
    return <>{UtilMethods.getHabilitations(authorizations, "access").canCreate ? <AccessCreate /> : <NotFound />}</>;
};

export default CreateAccessPage;