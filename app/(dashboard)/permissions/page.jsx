'use client'

import React, {useEffect} from 'react';
import PermissionListing from "@/components/Permission/PermissionListing";
import {useDashboardContext} from "@/contexts/DashboardContext";
import {useAppContext} from "@/contexts/appContext";

const PermissionPage = () => {
    const context = useAppContext();

    useEffect(() => {
        context.togglePageLoading();
    }, []);
    // logged-in user
    const currentUser = useDashboardContext()
    return (
        <>
            <PermissionListing currentUser={currentUser}/>
        </>
    );
};

export default PermissionPage;