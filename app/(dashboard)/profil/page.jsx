'use client'

import ProfilDetails from "@/components/Profil/ProfilDetails";
import {useAppContext} from "@/contexts/appContext";
import {useEffect} from "react";

const ProfilPage = () => {
    const context = useAppContext();

    useEffect(() => {
        context.togglePageLoading();
    }, []);

    return (
        <>
            <ProfilDetails/>
        </>
    );
};

export default ProfilPage;