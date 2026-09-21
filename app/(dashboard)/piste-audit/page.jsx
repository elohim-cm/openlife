'use client'

import React, {useEffect} from 'react';
import {useDashboardContext} from "@/contexts/DashboardContext";
import {useAppContext} from "@/contexts/appContext";
import AuditTrackListing from '@/components/AuditTrack/AuditTrackListing';

const AuditTrackPage = () => {
    const context = useAppContext();

    useEffect(() => {
        context.togglePageLoading();
    }, []); 
    return (
        <>
            <AuditTrackListing/>
        </>
    );
};

export default AuditTrackPage;