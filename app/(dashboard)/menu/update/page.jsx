'use client'
import MenuUpdate from "@/components/Menu/MenuUpdate";
import {useAppContext} from "@/contexts/appContext";
import React, {useEffect} from "react";
import UtilMethods from "@/utils/UtilMethods";
import {Button} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RoleUpdateForm from "@/components/Roles/RoleUpdateForm";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import Error404 from "@/components/errors/404";
import NotFound from "@/components/NotFound";

const MenuUpdatePage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, []);
    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'menu').canUpdate ? <MenuUpdate/>
                : <NotFound />
        }
    </>
};

export default MenuUpdatePage;