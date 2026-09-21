"use client";

import React from "react";
import {Controller} from "react-hook-form";
import {Button, Paper, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Autocomplete from "@mui/material/Autocomplete";
import BusinessGoal from "@/services/BusinessGoal";
import {DevTool} from "@hookform/devtools";
import {useTranslation} from "react-i18next";

const Step1Form = ({
    control,
    errors,
    isSubmitting,
    onSubmit,
    t
}) => {
    return (
        <Paper
            component="form"
            elevation={2}
            onSubmit={onSubmit}
            sx={{padding: "40px 24px", mb: 3}}
            className="brSm"
        >
            <Typography variant="h5" component="h5" mb={2}>
                {t("bulkCreateBusinessObjectives")} - {t("step")} 1/2
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
                {t("generalInformation")}
            </Typography>

            <Grid container spacing={4}>
                <Grid xs={12} md={6}>
                    <Controller
                        name="type"
                        control={control}
                        render={({field: {onChange, value}}) => (
                            <Autocomplete
                                id="type"
                                onChange={(_, item) => onChange(item)}
                                value={value}
                                options={BusinessGoal.types(t)}
                                getOptionLabel={option => option.label}
                                isOptionEqualToValue={(option, value) => option.name === value.name}
                                fullWidth
                                disabled={isSubmitting}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        label={t("objectiveType")}
                                        variant="filled"
                                        helperText={errors.type?.message}
                                        error={!!errors.type}
                                        required
                                    />
                                )}
                            />
                        )}
                    />
                </Grid>

                <Grid xs={12} md={6}>
                    <Controller
                        name="nature"
                        control={control}
                        render={({field: {onChange, value}}) => (
                            <Autocomplete
                                id="nature"
                                onChange={(_, item) => onChange(item)}
                                value={value}
                                options={BusinessGoal.natures(t)}
                                getOptionLabel={option => option.label}
                                isOptionEqualToValue={(option, value) => option.name === value.name}
                                fullWidth
                                disabled={isSubmitting}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        label={t("objectiveNature")}
                                        variant="filled"
                                        helperText={errors.nature?.message}
                                        error={!!errors.nature}
                                        required
                                    />
                                )}
                            />
                        )}
                    />
                </Grid>

                <Grid xs={12}>
                    <Controller
                        name="description"
                        control={control}
                        render={({field: {onChange, value}}) => (
                            <TextField
                                variant="filled"
                                id="description"
                                label={t("description")}
                                fullWidth
                                multiline
                                rows={3}
                                value={value}
                                onChange={onChange}
                                disabled={isSubmitting}
                            />
                        )}
                    />
                </Grid>

                <Grid xs={12}>
                    <div style={{display: "flex", justifyContent: "flex-end"}}>
                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            endIcon={<ArrowForwardIcon />}
                            disabled={isSubmitting}
                        >
                            {t("continue")}
                        </Button>
                    </div>
                </Grid>
            </Grid>
            <DevTool control={control} placement="top-right" />
        </Paper>
    );
};

export default Step1Form;
