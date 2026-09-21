"use client";
import React from 'react';
import {useConnection} from "@/contexts/ConnectionContext";
import {useTranslation} from "react-i18next";

const AlertMessage = () => {
    const {t} = useTranslation();
    const { connectionStatus } = useConnection();

    let alertMessage = '';

    switch (connectionStatus) {
        case 'slow':
            alertMessage = t('slowConnection') ;
            break;
        case 'offline':
            alertMessage = t('noConnection');
            break;
        default:
            break;
    }

    return (
        <>
            {alertMessage && (
                <div className="alert alert-danger"
                     role="alert"
                     style={{
                         zIndex: 5000,
                         padding: '10px 0',
                         backgroundColor:'red',
                         color:'white',
                         textAlign: 'center',
                         position: 'relative'
                     }}
                >
                    {alertMessage}
                </div>
            )}
        </>
    );
};

export default AlertMessage;
