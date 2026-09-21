"use client";

import React, {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button, Paper, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import ActivityIndicator from "@/components/ActivityIndicator";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useAppContext} from "@/contexts/appContext";
import {getToken} from "@/utils";
import validationSchema from "@/components/BusinessGoal/schemas/businessGoals";
import {DevTool} from "@hookform/devtools";
import {BUSINESS_GOAL_LIST, LOGIN_PAGE} from "@/utils/routes/routes";
import Autocomplete from "@mui/material/Autocomplete";
import BusinessGoal from "@/services/BusinessGoal";
import "@/styles/businessGoal.css";
import Alert from "@mui/material/Alert";
import AuthService from "@/services/AuthService";
import UtilMethods from "@/utils/UtilMethods";
import {useTranslation} from "react-i18next";
import Toast from "@/utils/toast"
import {formatBussinessLabel} from "@/components/BusinessGoal/BusinessGoalListing";

const BusinessGoalCreate = (callback, deps) => {
    const {t} = useTranslation();
    const [inProgress, setInProgress] = useState(false);
    const [inLoading, setInLoading] = useState(false);
    const [targetIsNull, setTargetIsNull] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [selectedBusinessGoal, setSelectedBusinessGoal] = useState(null);
    const [_nature, setNature] = useState(null);
    const [hasType, setHasType] = useState(null);
    const [selectedType, setSelectedType] = useState({});
    const [queryTag, setQueryTag] = useState('');
    const [resourceUid, setResourceUid] = useState('');
    const [targets, setTargets] = useState([]);
    const [businessGoals, setBusinessGoals] = useState([]);
    const [queryBus, setQueryBus] = useState('');
    const router = useRouter();
    const context = useAppContext();
    const token = getToken();
    const {authorizations, access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
    const access = accesses?.find(access => access.uid === currentAccess);
    const isPDG = ['PDG', 'ADMIN'].includes(access?.role?.code);

    const [beginDate, setBeginDate] = React.useState(null);
    const [_errors, setErrors] = React.useState([]);


    // get all networks
    const getResources = useCallback(  
        async (page, queryTag, selectedType, resourceUid, queryBus) => {
            try {
                setInLoading(queryTag === '')
                // setValue('parent', null)
                const {data1, data2}  = await BusinessGoal.resources(token, page='', queryTag, selectedType, resourceUid, queryBus);
                setTargets(data1.datas)
                if(data2 !== undefined)
                    setBusinessGoals(data2.datas?.business_goals)
                /*if (resourceUid === '')
                    setBusinessGoals([])*/
            }catch (e) {
                AuthService.formatFetchErrorMsgAndLogout(e.message, context, router)
            }finally {
                setInLoading(false)
            }
        },
        [token, router, queryTag, selectedType],
    );

    useEffect(() => {
        const {name: valType} = selectedType || {};
        if (valType===undefined){
            setResourceUid('')
        }
        setHasType(valType)
        if (valType !== undefined) {
            getResources('', queryTag, valType, resourceUid, queryBus)
        }
        // console.log(valType, targets)
    }, [token, selectedType, queryTag, getResources, resourceUid, queryBus]);

    //  form hook
    const {
        register,
        formState: {errors, isSubmitting, isValid},
        handleSubmit,
        control,
        setValue
    } = useForm({
        resolver: zodResolver(validationSchema(t)),
        defaultValues: {
            type: null,
            target: null,
            value: null,
            nature: null,
            description: "",
            parent: null,
            begin_date: null,
            end_date: null
        },
        mode: "all",
    });

    useEffect(() => {
        if (targetIsNull){
            setValue('parent', null)
            setSelectedBusinessGoal(null)
        }
    }, [targetIsNull, setValue, setSelectedBusinessGoal]);

    // Auto-preselect nature if only one option
    useEffect(() => {
        const natures = BusinessGoal.natures(t);
        if (natures && natures.length === 1) {
            setValue('nature', natures[0]);
            setNature(natures[0]);
        }
    }, [setValue, t]);

    // Auto-preselect type if only one option
    useEffect(() => {
        const types = BusinessGoal.types(t);
        if (types && types.length === 1) {
            setValue('type', types[0]);
            setSelectedType(types[0]);
        }
    }, [setValue, t]);

    // Auto-preselect target if only one option available
    useEffect(() => {
        if (targets && targets.length === 1 && hasType !== undefined) {
            setValue('target', targets[0]);
            setResourceUid(targets[0].uid);
        }
    }, [targets, setValue, hasType]);

    // Auto-preselect parent business goal if only one option available
    useEffect(() => {
        if (businessGoals && businessGoals.length === 1 && resourceUid) {
            setValue('parent', businessGoals[0]);
            setSelectedBusinessGoal(businessGoals[0]);
        }
    }, [businessGoals, setValue, resourceUid]);

    const dateRangesOverlap = (oldDateBegin, oldDateEnd, newDateBegin, newDateEnd) => {
        const start1 = new Date(oldDateBegin).setHours(0, 0, 0, 0);
        const end1 = new Date(oldDateEnd).setHours(0, 0, 0, 0);
        const start2 = new Date(newDateBegin).setHours(0, 0, 0, 0);
        const end2 = new Date(newDateEnd).setHours(0, 0, 0, 0);

        return (start2 >= start1 && start2 < end1) && (end2 > start1 && end2 <= end1);
    };


    //  on form submission
    const onSubmit = async data => {
        const date = new Date()
        const datas = {...data, parent: ''}
        try{

            if(selectedBusinessGoal !== null){
                datas.parent = selectedBusinessGoal?.uid
                console.log(selectedBusinessGoal)
                if(!dateRangesOverlap(selectedBusinessGoal?.begin_date,selectedBusinessGoal?.end_date,data.begin_date,data.end_date)){
                    throw new Error(t("datesMustBeWithinParent"))
                }
            }
            setInProgress(true)
            setErrors([])

            if (new Date(data.begin_date) >= new Date(data.end_date)){
                throw new Error(t("startDateCannotBeAfterOrEqualEndDate"))
            }
            const result = await BusinessGoal.store(token, datas, setErrors)

            Toast.success(result);
            context.togglePageLoading(true);

            const url = new URL(`${window.location.origin}${BUSINESS_GOAL_LIST}`);
            const params = new URLSearchParams(url.search);
            params.set("value", "obj");
            url.search = params.toString();
            router.push(url.toString());
            /*router.push(BUSINESS_GOAL_LIST);*/
        }catch (e) {
            AuthService.formatFetchErrorMsgAndLogout(e.message, context, router)
        }finally {
            setInProgress(false)
        }
    };

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<ArrowBackIcon />}
                color="secondary"
                onClick={e => {
                    context.togglePageLoading(true);
                    router.back();
                }}
                sx={{mb: 2}}>
                {t("back")}
            </Button>
            <Paper
                component="form"
                elevation={2}
                onSubmit={handleSubmit(onSubmit)}
                sx={{padding: "40px 24px", mb: 3}}
                className="brSm"
            >
                <PageLoadingIndicator visible={pageLoading} />
                <ActivityIndicator visible={inProgress} />
                <Typography variant="h5" component="h5" mb={2}>
                    {t("createNewBusinessObjective")}
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12}>
                        {
                            _errors.length >0 && <Alert
                                severity="error"
                            >
                                <ul>
                                    {
                                        _errors.map((error, key) => <li key={key}>{error}</li>)
                                    }
                                </ul>
                            </Alert>
                        }
                    </Grid>
                    <Grid  xs={12} md={6} lg={6} xl={4}>
                        <TextField
                            variant="filled"
                            id="begin_date"
                            label={t("startDate")}
                            fullWidth
                            type="date"
                            onChange={(e) => {
                                const inputValue = e.target.value;
                                console.log(inputValue);
                            }}
                            inputProps={{
                                min: "2024-01-01" // Définir la date minimale directement ici
                            }}
                            error={!!errors.begin_date}
                            helperText={errors.begin_date?.message}
                            {...register("begin_date")}
                            disabled={isSubmitting}
                            required
                        />

                    </Grid>
                    <Grid  xs={12} md={6} lg={6} xl={4}>
                        <TextField
                            variant="filled"
                            id="end_date"
                            label={t("endDate")}
                            fullWidth
                            type='date'

                            inputProps={{ min: new Date().toISOString().split('T')[0] }}
                            error={!!errors.end_date}
                            helperText={errors.end_date?.message}
                            {...register("end_date")}
                            disabled={isSubmitting}
                            required
                        />
                    </Grid>
                    <Grid xs={12} md={6} lg={6} xl={4}>
                        <Controller
                            name="nature"
                            control={control}
                            render={({field: {onChange, value}}) => (
                                <Autocomplete
                                    id="nature"
                                    onChange={(_, item) => {
                                        onChange(item);
                                        setNature(item)
                                        console.log(item)
                                    }}
                                    value={value}
                                    options={BusinessGoal.natures(t)}
                                    getOptionLabel={option => option.label}
                                    isOptionEqualToValue={(option, value) => option.label === value.label}
                                    fullWidth
                                    disabled={isSubmitting}
                                    renderInput={params => (
                                        <TextField
                                            {...params}
                                            label={t("objectiveNature")}
                                            variant="filled"
                                            helperText={errors.nature?.message}
                                            error={!!errors.nature}
                                        />
                                    )}
                                />
                            )}
                        />
                    </Grid>
                    <Grid xs={12} md={6} lg={6} xl={4}>
                        <Controller
                            name="type"
                            control={control}
                            render={({field: {onChange, value}}) => (
                                <Autocomplete
                                    id="type"
                                    onChange={(_, item) => {
                                        onChange(item);
                                        // console.log(item)
                                        setSelectedType(item)
                                        setQueryTag('')
                                        setValue('target', null)
                                        if(item === null) {
                                            setTargets([])
                                        }
                                    }}
                                    value={value}
                                    options={BusinessGoal.types(t)}
                                    getOptionLabel={option => option.label}
                                    isOptionEqualToValue={(option, value) => option.label === value.label}
                                    fullWidth
                                    disabled={!isPDG}
                                    renderInput={params => (
                                        <TextField
                                            {...params}
                                            label={t("objectiveType")}
                                            variant="filled"
                                            helperText={errors.type?.message}
                                            error={!!errors.type}
                                        />
                                    )}
                                />
                            )}
                        />
                    </Grid>
                    {/*{inLoading && <Grid xs={12} md={6} lg={6} xl={4}>
                        <Skeleton variant="rounded" width='100%' height={35} />
                    </Grid>}*/}
                    {/*{((targets.length >0 && !inLoading) || (hasType !== undefined))&&*/}
                        <Grid xs={12} md={6} lg={6} xl={4}>
                            <Controller
                                name="target"
                                control={control}
                                render={({field: {onChange, value}}) => (
                                    <Autocomplete
                                        id="target"
                                        onInputChange={(event, newInputValue) => {
                                            setQueryTag(newInputValue);
                                        }}
                                        onChange={(_, item) => {
                                            setResourceUid(item?.uid)
                                            console.log(item)
                                            onChange(item);
                                            if(item === null){
                                                console.log('Setting "parent" field to null');
                                                setTargetIsNull(true)
                                            }
                                        }}
                                        value={value}
                                        options={targets}
                                        getOptionLabel={option => `${option.name || `${option.first_name || ''} ${option.last_name || ''}`}`}
                                        isOptionEqualToValue={(option, value) => option.uid === value.uid}
                                        fullWidth
                                        disabled={isSubmitting || (targets.length === 0 && inLoading) || (hasType === undefined)}
                                        renderInput={params => (
                                            <TextField
                                                {...params}
                                                label={t("objectiveTarget")}
                                                variant="filled"
                                                helperText={errors.target?.message}
                                                error={!!errors.target}
                                            />
                                        )}
                                    />
                                )}
                            />
                        </Grid>
                    {/*}*/}
                    <Grid xs={12} md={6} lg={6} xl={4}>
                        <TextField
                            variant="filled"
                            id="value"
                            label={`${t("value")} (${_nature?(_nature.name === 'subscription'? t("numberOfSubsriptions"): t("turnOver")): ''})`}
                            fullWidth
                            placeholder="100"
                            error={!!errors.value}
                            helperText={errors.value?.message}
                            {...register("value")}
                            disabled={isSubmitting}
                            required
                        />
                    </Grid>
                    <Grid xs={12} md={6} lg={6} xl={4}>
                        <Controller
                            name="parent"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                                <Autocomplete
                                    id="parent"
                                    onInputChange={(event, newInputValue) => {
                                        setQueryBus(newInputValue.trim());
                                    }}
                                    onChange={(_, item) => {
                                        setSelectedBusinessGoal(item)
                                        console.log(item)
                                        onChange(item); // This line updates the form state
                                    }}
                                    value={selectedBusinessGoal} // Ensure to use the value from field
                                    options={businessGoals}
                                    getOptionLabel={(option) => {
                                        if (!option || typeof option !== 'object') return '';
                                        const targetName = option?.target?.name || option?.target?.code || '';
                                        const nature = option?.nature || '';
                                        const value = option?.value || '';
                                        const end_date = option?.end_date || '';
                                        const description = option?.description || '';
                                        return String(formatBussinessLabel(targetName, nature, value, end_date, description));
                                    }}
                                    isOptionEqualToValue={(option, value) => option.uid === value.uid}
                                    fullWidth
                                    disabled={isSubmitting}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label={t("parentObjective")}
                                            variant="filled"
                                            helperText={errors.parent?.message}
                                            error={!!errors.parent}
                                        />
                                    )}
                                />
                            )}
                        />

                    </Grid>
                    <Grid xs={12} md={6} lg={6} xl={4}>
                        <TextField
                            variant="filled"
                            id="description"
                            label={t("description")}
                            fullWidth
                            error={!!errors.description}
                            helperText={errors.description ? errors.description.message : ""}
                            {...register("description")}
                            disabled={isSubmitting}
                        />
                    </Grid>
                    {UtilMethods.getHabilitations(authorizations, 'business goals').canFit && <Grid container xs={12} md={6} lg={12} xl={12}>
                        <Grid xs={12} md={12} lg={2} xl={2}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                                sx={{mt: 1}}
                                className="brSm"
                            >
                                {t('set')}
                            </Button>
                        </Grid>
                    </Grid>}
                    <DevTool control={control} placement="top-right" />
                </Grid>
            </Paper>
        </>
    );
};

export default BusinessGoalCreate;
