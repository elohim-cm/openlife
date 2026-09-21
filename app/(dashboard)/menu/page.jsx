'use client'

import React, {useEffect} from 'react';
import MenuListing from "@/components/Menu/MenuListing";
import {useAppContext} from "@/contexts/appContext";
import UtilMethods from "@/utils/UtilMethods";
import RolesListing from "@/components/Roles/RolesListing";
import NotFound from "@/components/NotFound";

const MenuPage = () => {
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    useEffect(() => {
        context.togglePageLoading();
    }, []);
    return <>
        {
            UtilMethods.getHabilitations(authorizations, 'menu').canRead ? <MenuListing/>
                : <NotFound />
        }
    </>
};

export default MenuPage;