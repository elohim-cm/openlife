'use client'

import RolesListing from "@/components/Roles/RolesListing";
import {useAppContext} from "@/contexts/appContext";
import React, {useEffect} from "react";
import UtilMethods from "@/utils/UtilMethods";
import AccountListing from "@/components/Account/AccountListing";
import NotFound from "@/components/NotFound";

const RolePage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, []);

    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'role').canRead ? <RolesListing/>
                : <NotFound />
        }
    </>
};

export default RolePage;