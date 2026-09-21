"use client";

import React from "react";
import {Autocomplete, Box, Chip, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import {useTranslation} from "react-i18next";

export const getResponsible = (option) => {
    if (option.animator) {
        return option.animator;
    } else if (option.manager) {
        return option.manager;
    } else if (option.inspector) {
        return option.inspector;
    }
    return null;
};

const TargetSelector = ({
    availableTargets,
    targetCards,
    onAddTarget,
    isRootNetwork,
    hasRootNetworkSelected,
    globalActions,
    t,
    disabled = false,
    type=''
}) => {
    return (
        <Grid container spacing={2} alignItems='start' mb={2}>
            <Grid xs={12} md={8}>
                <Autocomplete
                    value={null}
                    onChange={(_, item) => {
                        if (item) {
                            onAddTarget(item);
                        }
                    }}
                    disabled={disabled}
                    options={availableTargets.filter(target =>
                        !targetCards.some(card => card.target?.uid === target?.uid)
                    )}
                    getOptionLabel={(option) => option.name || `${option.first_name} ${option.last_name}`}
                    isOptionEqualToValue={(option, value) => option?.uid === value?.uid}
                    fullWidth
                    renderOption={(props, option) => {
                        const { key, ...otherProps } = props;
                        const responsible = getResponsible(option);
                        return (
                            <li key={key} {...otherProps}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        {isRootNetwork(option) && (
                                            <Chip
                                                label={t("rootNetworkMother")}
                                                color="secondary"
                                                variant="filled"
                                                size="small"
                                                sx={{height: 20}}
                                            />
                                        )}
                                        <Typography variant="body2" fontWeight={600}>
                                            {option.name  || `${option.first_name} ${option.last_name}`}
                                        </Typography>
                                    </Box>
                                    {responsible && (
                                        <Typography variant="caption" color="text.secondary" sx={{ml: 0.5}}>
                                            {t("responsible")}: {responsible.last_name} {responsible.first_name} ({responsible.code})
                                        </Typography>
                                    )}
                                </Box>
                            </li>
                        );
                    }}
                    renderInput={params => (
                        <TextField
                            {...params}
                            label={`${t("youSelect")} ${String(t(type)).toLowerCase()} ${t("ToAdd")}`}
                            variant="filled"
                            placeholder={t("search")}
                            InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                    <>
                                        <AddCircleOutlineIcon sx={{mr: 1, color: 'primary.main'}} />
                                        {params.InputProps.startAdornment}
                                    </>
                                )
                            }}
                        />
                    )}
                />
            </Grid>
        </Grid>
    );
};

export default TargetSelector;
