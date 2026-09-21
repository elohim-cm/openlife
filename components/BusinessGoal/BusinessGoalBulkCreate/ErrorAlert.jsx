"use client";

import React from "react";
import {Alert, IconButton} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {useTranslation} from "react-i18next";

const ErrorAlert = ({errors, onClose, t}) => {
    if (!errors || errors.length === 0) return null;

    return (
        <Alert 
            severity="error" 
            sx={{mb: 3, '& .MuiAlert-message': { width: '100%' }}}
            action={
                <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={onClose}
                >
                    <CloseIcon fontSize="inherit" />
                </IconButton>
            }
        >
            <strong style={{display: 'block', marginBottom: 8}}>
                {errors.length} {errors.length > 1 ? 'erreurs détectées' : 'erreur détectée'} :
            </strong>
            <ul style={{margin: 0, paddingLeft: 20, lineHeight: 1.8}}>
                {errors.map((error, key) => (
                    <li key={key} style={{marginBottom: 4}}>
                        {error}
                    </li>
                ))}
            </ul>
        </Alert>
    );
};

export default ErrorAlert;
