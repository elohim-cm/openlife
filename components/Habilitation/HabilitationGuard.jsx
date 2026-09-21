"use client";

import React, { useState, useEffect } from 'react';
import UtilMethods from '@/utils/UtilMethods';
import NotFound from '@/components/NotFound';
import { useAppContext } from '@/contexts/appContext';

/**
 * HabilitationGuard
 * 
 * A wrapper component that handles SSR-safe authorization checks.
 * It prevents ReferenceErrors by deferring localStorage access to useEffect.
 * It also handles hydration by showing a loading spinner until the client is ready.
 * 
 * @param {string} label - The feature label to check (e.g., 'contract', 'provider')
 * @param {string|string[]} permission - The permission type or array of types (default: 'canRead')
 * @param {React.ReactNode} children - The content to render if authorized
 */
const HabilitationGuard = ({ label, permission = 'canRead', customCheck, children }) => {
    const { togglePageLoading } = useAppContext();
    const [isClient, setIsClient] = useState(false);
    const [hasPermission, setHasPermission] = useState(false);

    useEffect(() => {
        // Start loading spinner when hydration starts
        togglePageLoading(true);
        
        setIsClient(true);
        
        let authorized = false;

        if (customCheck !== undefined) {
            authorized = !!customCheck;
        } else {
            // Read authorizations safely on the client
            const storedValues = UtilMethods.getStoredValues();
            const authorizations = storedValues?.authorizations || [];
            
            // Determine if user has permission
            const perms = UtilMethods.getHabilitations(authorizations, label);
            
            if (Array.isArray(permission)) {
                authorized = permission.some(p => perms[p]);
            } else {
                authorized = perms[permission];
            }
            
            // Specific fallback for providers
            if (!authorized && label === 'provider' && UtilMethods.isProvider()) {
                authorized = true;
            }
        }
        
        setHasPermission(authorized);
        
        // Stop loading spinner after hydration and check
        togglePageLoading(false);
    }, [label, permission, customCheck, togglePageLoading]);

    // On server, render nothing
    if (!isClient) return null;

    // On client, render children if authorized, otherwise NotFound
    return hasPermission ? <>{children}</> : <NotFound />;
};

export default HabilitationGuard;
