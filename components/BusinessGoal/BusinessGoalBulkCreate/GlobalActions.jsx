"use client";

import React from "react";
import {Box, Button, Typography} from "@mui/material";
import {useTranslation} from "react-i18next";

const GlobalActions = ({onReset, t}) => {
    return (
        <Box sx={{p: 2, bgcolor: 'action.hover', borderRadius: 1}}>
            <Typography variant="subtitle2" gutterBottom>
                {t("globalActions")}
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
                <Button
                    size="small"
                    variant="outlined"
                    onClick={onReset}
                >
                    {t("resetAll")}
                </Button>
            </Box>
        </Box>
    );
};

export default GlobalActions;
