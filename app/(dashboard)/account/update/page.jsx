'use client'

import AccountUpdate from "@/components/Account/AccountUpdate";
import React, {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";
import UtilMethods from "@/utils/UtilMethods";
import AccountCreate from "@/components/Account/AccountCreate";
import NotFound from "@/components/NotFound";

const UpdatePage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);

    return <AccountUpdate/>
};

export default UpdatePage;