'use client'
import AccessUpdate from "@/components/Access/AccessUpdate";
import {useAppContext} from "@/contexts/appContext";
import React, {useEffect} from "react";
import UtilMethods from "@/utils/UtilMethods";
import AccessCreate from "@/components/Access/AccessCreate";
import NotFound from "@/components/NotFound";

const AccessUpdatePage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);
    return <>{UtilMethods.getHabilitations(authorizations, "access").canUpdate ? <AccessUpdate /> : <NotFound />}</>;
};

export default AccessUpdatePage;