"use client";

import React from "react";
import {
    Autocomplete,
    Box,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Divider,
    IconButton,
    TextField,
    Typography
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import DeleteIcon from "@mui/icons-material/Delete";
import {formatBussinessLabel} from "../BusinessGoalListing";
import { getResponsible } from "./TargetSelector";
import { formatNumber, formatNumberStr } from "@/utils";

const businessGoalNature = {
    subscription: 'subscription',
    collection: 'collection'
}

const TargetCardMultiNature = ({
    card,
    index,
    totalCards,
    onUpdate,
    onRemove,
    parentGoalsByNature,
    getRemainingValue,
    isRootNetwork,
    t,
    gridSize = {xs: 12, sm: 12, md: 6, lg: 6, xl: 4},
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
    const formatOfValue = (value, nature = 'subscription') => {
        if(nature === businessGoalNature['collection']) {
            return formatNumberStr(value);
        }
        return value;
    };

    const renderNatureSection = (nature, label) => {
        const natureData = card.natures[nature];
        const parentGoals = parentGoalsByNature[nature] || [];
        const isDisabled = parentGoals.length === 1;

        return (
            <Box mb={3}>
                <Typography variant="subtitle2" fontWeight={600} mb={2} color="primary" sx={{display: 'flex', alignItems: 'center', gap: 1}}>
                    <Box sx={{width: 4, height: 16, backgroundColor: 'primary.main', borderRadius: 1}} />
                    {label}
                </Typography>
                <Grid container spacing={2}>
                    <Grid xs={12}>
                        <Autocomplete
                            value={natureData.parent}
                            onChange={(_, item) => onUpdate(index, nature, 'parent', item)}
                            options={parentGoals}
                            disabled={isDisabled}
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
                                const remaining = getRemainingValue ? getRemainingValue(option.uid, index, nature) : 0;
                                const parentValue = parseFloat(option.value) || 0;
                                const isLow = remaining < parentValue * 0.2;
                                const beginDate = option?.begin_date || '';
                                const endDate = option?.end_date || '';

                                return (
                                    <li {...props}>
                                        <Box sx={{display: 'flex', flexDirection: 'column', gap: 0.5, py: 0.5}}>
                                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%'}}>
                                                <Typography variant="body2">{label}</Typography>
                                                {/* <Chip
                                                    size="small"
                                                    label={`${remaining} / ${parentValue} ${t("remaining")}`}
                                                    color={remaining === 0 ? 'error' : isLow ? 'warning' : 'success'}
                                                    variant="outlined"
                                                    sx={{height: 20}}
                                                /> */}
                                            </Box>
                                            {(beginDate || endDate) && (
                                                <Typography variant="caption" color="text.secondary" sx={{ml: 0.5}}>
                                                    {beginDate && endDate ? `${beginDate} → ${endDate}` : beginDate || endDate}
                                                </Typography>
                                            )}
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
                                        natureData.parent && getRemainingValue
                                            ? `${formatOfValue(getRemainingValue(natureData.parent.uid, index, nature), nature)} / ${formatOfValue(natureData.parent.value, nature)} ${t("remaining")}` 
                                            : (isRootNetwork(card.target) ? t("optionalForRootNetwork") : '')
                                    }
                                />
                            )}
                        />
                    </Grid>

                    <Grid xs={12} md={4}>
                        <TextField
                            variant="filled"
                            label={`${nature === 'subscription'? t("numberOfSubsriptions"): t('turnOver')}`}
                            fullWidth
                            type="number"
                            value={natureData.value}
                            onChange={(e) => onUpdate(index, nature, 'value', e.target.value)}
                            required
                            inputProps={{min: 0}}
                        />
                    </Grid>

                    <Grid xs={12} md={4}>
                        <TextField
                            variant="filled"
                            label={t("startDate")}
                            fullWidth
                            type="date"
                            value={natureData.begin_date}
                            onChange={(e) => onUpdate(index, nature, 'begin_date', e.target.value)}
                            InputLabelProps={{shrink: true}}
                            required
                            inputProps={{
                                min: natureData.parent ? extractDatePart(natureData.parent.begin_date) : undefined,
                                max: natureData.parent ? extractDatePart(natureData.parent.end_date) : undefined
                            }}
                        />
                    </Grid>

                    <Grid xs={12} md={4}>
                        <TextField
                            variant="filled"
                            label={t("endDate")}
                            fullWidth
                            type="date"
                            value={natureData.end_date}
                            onChange={(e) => onUpdate(index, nature, 'end_date', e.target.value)}
                            InputLabelProps={{shrink: true}}
                            required
                            inputProps={{
                                min: natureData.parent ? extractDatePart(natureData.parent.begin_date) : undefined,
                                max: natureData.parent ? extractDatePart(natureData.parent.end_date) : undefined
                            }}
                        />
                    </Grid>
                </Grid>
            </Box>
        );
    };

    if (!card || !card.target) {
        return null;
    }

    return (
        <Grid {...gridSize}>
            <Card variant="outlined" sx={{bgcolor: 'background.paper', borderRadius: 2, height: '100%', display: 'flex', flexDirection: 'column', boxShadow: 1}}>
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
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        zIndex: 1,
                        borderRadius: 2
                    }}>
                        <CircularProgress />
                    </Box>
                )}
                <CardContent sx={{flex: 1}}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Box>
                            <div>
                                <Typography  variant="h5" fontWeight={600} color="primary" >
                                    {t('Objective')}{" - "}{card.target.name || card.target.RES_NOM || `${card.target.first_name || ''} ${card.target.last_name || ''}`}
                                </Typography>
                                {getResponsible(card.target) && (
                                    <Typography variant="caption" color="text.secondary" sx={{ml: 0.5}}>
                                        {t("responsible")}: {getResponsible(card.target).last_name} {getResponsible(card.target).first_name} ({getResponsible(card.target).code})
                                    </Typography>
                                )}
                            </div>
                        </Box>
                        <Box display="flex" gap={1} alignItems="center">
                            {isRootNetwork(card.target) && (
                                <Chip
                                    label={t("rootNetworkMother")}
                                    color="secondary"
                                    variant="filled"
                                    size="small"
                                    sx={{height: 20}}
                                />
                            )}
                            <IconButton
                                color="error"
                                size="small"
                                onClick={() => onRemove(index)}
                                title={t("removeTarget")}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    </Box>

                    <Divider sx={{mb: 3}} />

                    {renderNatureSection(businessGoalNature['subscription'], t('subscription'))}
                    {renderNatureSection(businessGoalNature['collection'], t('collection'))}
                </CardContent>
            </Card>
        </Grid>
    );
};

export default TargetCardMultiNature;
