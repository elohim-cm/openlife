'use client'

import React, {useEffect} from 'react';
import AccessListing from "@/components/Access/AccessListing";
import {useAppContext} from "@/contexts/appContext";
import NotificationListing from "@/components/Notification/NotificationListing";

const NotificationPage = () => {
    const context = useAppContext();

    useEffect(() => {
        context.togglePageLoading();
    }, [context]);
    return (
        <NotificationListing/>
    );
};

export default NotificationPage;