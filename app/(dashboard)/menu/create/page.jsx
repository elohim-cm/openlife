'use client'

import MenuCreate from "@/components/Menu/MenuCreate";
import {useAppContext} from "@/contexts/appContext";
import React, {useEffect} from "react";
import UtilMethods from "@/utils/UtilMethods";
import {Button} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RoleCreateForm from "@/components/Roles/RoleCreateForm";
import NotFound from "@/components/NotFound";

const CreateMenuPage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, []);
    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'menu').canCreate ?  <MenuCreate />
                : <NotFound />
        }
    </>
};

export default CreateMenuPage;