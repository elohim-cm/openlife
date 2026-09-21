"use client";

import React from "react";
import {Autocomplete, Box, Card, CardContent, Chip, CircularProgress, IconButton, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import {formatBussinessLabel} from "../BusinessGoalListing";
import {useTranslation} from "react-i18next";

const TargetCard = ({
    card,
    index,
    totalCards,
    onUpdate,
    onRemove,
    getRemainingValue,
    isRootNetwork,
    t,
    gridSize = {xs: 12, sm: 12, md: 6, lg: 4, xl: 3},
    isLoading = false
}) => {
    const extractDatePart = (dateString) => {
        if (!dateString || typeof dateString !== 'string') return '';
        const trimmed = dateString.trim();
        if (trimmed.length === 10) return trimmed;
        if (trimmed.length > 10) {
            return trimmed.substring(0, 10);
        }
        return trimmed;
    };

    return (
        <Grid {...gridSize}>
            <div >
                <Card variant="outlined" sx={{bgcolor: 'background.default', position: 'relative'}}>
                    {isLoading && (
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            zIndex: 1,
                            borderRadius: 1
                        }}>
                            <CircularProgress />
                        </Box>
                    )}
                    <CardContent>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                            <Typography variant="h6">
                                {t("target")} {index + 1}/{totalCards}
                            </Typography>
                            <Box display="flex" gap={1} alignItems="center">
                                {isRootNetwork(card.target) && (
                                    <Chip 
                                        label={t("rootNetworkMother")}
                                        color="secondary"
                                        variant="filled"
                                        size="small"
                                    />
                                )}
                                <Chip 
                                    label={card.target.name || `${card.target.first_name} ${card.target.last_name}`}
                                    color="primary"
                                    variant="outlined"
                                />
                                <IconButton
                                    color="error"
                                    size="small"
                                    onClick={() => onRemove(index)}
                                    title={t("removeTarget")}
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </Box>
                        </Box>

                        <Grid container spacing={2}>
                            <Grid xs={12} md={6}>
                                <Autocomplete
                                    value={card.parent}
                                    onChange={(_, item) => onUpdate(index, 'parent', item)}
                                    options={card.businessGoals || []}
                                    disabled={true}
                                    getOptionLabel={(option) => {
                                        if (!option || typeof option !== 'object') return '';
                                        const targetName = option?.target?.name || option?.target?.code || '';
                                        const nature = option?.nature || '';
                                        const value = option?.value || '';
                                        const end_date = option?.end_date || '';
                                        const description = option?.description || '';
                                        return String(formatBussinessLabel(targetName, nature, value, end_date, description));
                                    }}
                                    renderOption={(props, option) => {
                                        const targetName = option?.target?.name || option?.target?.code || '';
                                        const nature = option?.nature || '';
                                        const value = option?.value || '';
                                        const end_date = option?.end_date || '';
                                        const description = option?.description || '';
                                        const label = String(formatBussinessLabel(targetName, nature, value, end_date, description));
                                        const remaining = getRemainingValue(option.uid, index);
                                        const parentValue = parseFloat(option.value) || 0;
                                        const isLow = remaining < parentValue * 0.2;
                                        
                                        return (
                                            <li {...props}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                    <Typography variant="body2">{label}</Typography>
                                                    <Chip 
                                                        size="small" 
                                                        label={`${remaining} / ${parentValue} ${t("remaining")}`}
                                                        color={remaining === 0 ? 'error' : isLow ? 'warning' : 'success'}
                                                        variant="outlined"
                                                    />
                                                </Box>
                                            </li>
                                        );
                                    }}
                                    isOptionEqualToValue={(option, value) => option?.uid === value?.uid}
                                    fullWidth
                                    renderInput={params => (
                                        <TextField
                                            {...params}
                                            label={t("parentObjective")}
                                            variant="filled"
                                            required={!isRootNetwork(card.target)}
                                            helperText={
                                                card.parent 
                                                    ? `${getRemainingValue(card.parent.uid, index)} / ${card.parent.value} ${t("remaining")}` 
                                                    : (isRootNetwork(card.target) ? t("optionalForRootNetwork") : '')
                                            }
                                        />
                                    )}
                                />
                            </Grid>

                            <Grid xs={12} md={6}>
                                <TextField
                                    variant="filled"
                                    label={t("value")}
                                    fullWidth
                                    type="number"
                                    value={card.value}
                                    onChange={(e) => onUpdate(index, 'value', e.target.value)}
                                    required
                                    inputProps={{min: 0}}
                                />
                            </Grid>

                            <Grid xs={12} md={6}>
                                <TextField
                                    variant="filled"
                                    label={t("startDate")}
                                    fullWidth
                                    type="date"
                                    value={card.begin_date}
                                    onChange={(e) => onUpdate(index, 'begin_date', e.target.value)}
                                    InputLabelProps={{shrink: true}}
                                    required
                                    inputProps={{
                                        min: card.parent ? extractDatePart(card.parent.begin_date) : undefined,
                                        max: card.parent ? extractDatePart(card.parent.end_date) : undefined
                                    }}
                                />
                            </Grid>

                            <Grid xs={12} md={6}>
                                <TextField
                                    variant="filled"
                                    label={t("endDate")}
                                    fullWidth
                                    type="date"
                                    value={card.end_date}
                                    onChange={(e) => onUpdate(index, 'end_date', e.target.value)}
                                    InputLabelProps={{shrink: true}}
                                    required
                                    inputProps={{
                                        min: card.parent ? extractDatePart(card.parent.begin_date) : undefined,
                                        max: card.parent ? extractDatePart(card.parent.end_date) : undefined
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </CardContent>
                </Card>
            </div>
        </Grid>
    );
};

export default TargetCard;
