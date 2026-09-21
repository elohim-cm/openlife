'use client'

import {useDashboardContext} from "@/contexts/DashboardContext";
import PermissionCreate from "@/components/Permission/PermissionCreate";
import {useAppContext} from "@/contexts/appContext";
import {useEffect} from "react";


const CreatePermissionPage = () => {
    const context = useAppContext();

    useEffect(() => {
        context.togglePageLoading();
    }, []);
    // current user
    const currentUser = useDashboardContext()

    return (
        <>
            <PermissionCreate currentUser={currentUser}/>
        </>
    );
};

export default CreatePermissionPage;