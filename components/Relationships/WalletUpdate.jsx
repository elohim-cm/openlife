'use client'

import React, {useCallback, useEffect, useState} from 'react'
import {useParams, useRouter} from "next/navigation";
import {useAppContext} from "@/contexts/appContext";
import {getToken, getUid, getUrlParams} from "@/utils";
import WalletService from "@/services/WalletService";
import AuthService from "@/services/AuthService";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import {
    Button,
    FormControl,
    FormControlLabel,
    FormHelperText,
    FormLabel,
    Paper,
    Radio,
    RadioGroup,
    TextField,
    Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import ActivityIndicator from "@/components/ActivityIndicator";
import Grid from "@mui/material/Unstable_Grid2";
import {Controller, useForm} from "react-hook-form";
import Autocomplete from "@mui/material/Autocomplete";
import {DevTool} from "@hookform/devtools";
import Toast from "@/utils/toast";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import providerService from "@/services/ProviderService";
import Skeleton from "@mui/material/Skeleton";
import moment from "moment"
import schema from "@/components/Relationships/schema";
import {WALLET_LIST} from "@/utils/routes/routes";
import {useTranslation} from "react-i18next";
import AnimationTeamService from "@/services/AnimationTeamService";
import IntlPhoneField from "@/components/IntlPhoneField";
import UtilMethods from '@/utils/UtilMethods';

export default function WalletUpdate() {
    const {t} = useTranslation();
    const [inProgress, setInProgress] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [prospect, setProspect] = useState(undefined);
    const [genders, setGenders] = useState(undefined);
    const [situations, setSituations] = useState(undefined);
    const router = useRouter();
    const context = useAppContext();
    const token = getToken();
    const uid = getUid();
    const [contextTitle, setContextTilte] = useState('');

    // get current network
    const getPerson = useCallback(async () => {
        try {
            setIsLoading(true);
            const queryString  = window.location.search;
            const params = new URLSearchParams(queryString);
        
            const indice = params.get("indicator");
            setContextTilte(indice)
            const fetcherOperator = {
                customers: WalletService.client.bind(WalletService),
                prospects: WalletService.prospect.bind(WalletService)
            };
            
            if (!fetcherOperator[indice]) {
                throw new Error(`Invalid index: ${indice}`);
            }
    
            const result = await fetcherOperator[indice](token, uid);
            setProspect(result);
        } catch (e) {
            const errorMsg = e.message || 'Unknown error occurred';
            AuthService.formatFetchErrorMsgAndLogout(errorMsg, context, router);
        } finally {
            setIsLoading(false);
        }
    }, [token, uid, context, router]);
    

    const getResources = useCallback(async () =>{
        try {
            const resources = await Promise.allSettled([providerService.getGenders(), providerService.situations()])
            setGenders(resources[0].value.genders ?? [])
            setSituations(resources[1].value.situations ?? [])
        }catch (e) {
            Toast.error(e.message, 3000);
        }
    }, [token])

    useEffect(() => {
        getPerson()
        getResources()
    }, [getPerson, getResources]);

    const {
        register,
        formState: {errors, isSubmitting, isValid},
        handleSubmit,
        control,
        setValue,
    } = useForm({
        resolver: zodResolver(schema(t)),
        mode: "onSubmit",
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
            const queryString  = window.location.search;
            const params = new URLSearchParams(queryString);
        
            const indice = params.get("indicator");
            const fetcherOperator = {
                customers: WalletService.client.bind(WalletService),
                prospects: WalletService.prospect.bind(WalletService)
            };
                const result = await fetcherOperator[indice](token, uid);
                setValue('marital_status', result.marital_status)
            } catch (error) {
                console.log("can't set default values ||| ", e.message);
            }
        };

        fetchData();
    }, [token, setValue]);

    useEffect(() => {
        if (prospect) {
            const defaultValues = {
                first_name: prospect.first_name,
                last_name: prospect.last_name,
                email: prospect.email,
                birth_place: prospect.birth_place,
                address: prospect.address,
                cni_number: prospect.cni_number,
                niu_number: prospect.nui_number,
                gender: prospect.gender?.uid,
            };

            Object.keys(defaultValues).forEach((key) => setValue(key, defaultValues[key]));

            setValue("main_phone", prospect.main_phone, {shouldValidate: true});
            setValue("secondary_phone", prospect.secondary_phone, {shouldValidate: true});

            // Set current date for birth_date and cni_expired_date
            const currentDate = new Date().toISOString().split("T")[0];
            setValue("birth_day", prospect.birth_date, { shouldValidate: true });
            setValue("cni_expired_date", prospect.cni_expired_at, { shouldValidate: true });

        }
    }, [prospect, setValue])
    const onSubmit = async data => {
        try {
            setInProgress(true);
            const queryString  = window.location.search;
            const params = new URLSearchParams(queryString);
        
            const indice = params.get("indicator");
            
            const fetcherOperator = {
                customers: WalletService.updateClient.bind(WalletService),
                prospects: WalletService.update.bind(WalletService)
            };
            
            const result = await fetcherOperator[indice](token, uid, data)
            
            Toast.success(result.message);
            context.togglePageLoading(true)
            
            router.push(WALLET_LIST);
        }catch (e) {
            AuthService.formatFetchErrorMsgAndLogout(e.message, context, router)
        } finally {
            setInProgress(false);
        }
    };

    const {onChange: onChangePhone, onBlur: onBlurPhone, name: namePhone, ref: refPhone} = register("main_phone");
    const {onChange: _onChangePhone, onBlur: _onBlurPhone, name: _namePhone, ref: _refPhone} = register("secondary_phone");
    return (
        <>
            {(prospect === undefined) ? (
                <CreateFormSkeleton />
            ) : (
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
                        {t('back')}
                    </Button>
                    <Paper
                        component="form"
                        elevation={2}
                        onSubmit={handleSubmit(onSubmit)}
                        sx={{padding: "40px 24px", mb: 3}}
                        className="brSm">
                        <PageLoadingIndicator visible={pageLoading} />
                        <ActivityIndicator visible={inProgress} />
                        <Typography variant="h5" component="h5" mb={2}>
                            {t('updateThe')} {t(`${contextTitle}_`)}
                        </Typography>
                        <Grid container spacing={4}>
                            <Grid xs={12} md={6} lg={6} xl={4}>
                                <TextField
                                    variant="filled"
                                    id="first_name"
                                    label="First Name"
                                    fullWidth
                                    {...register("first_name")}
                                    disabled={isSubmitting}
                                />
                            </Grid>

                            <Grid xs={12} md={6} lg={6} xl={4}>
                                {(situations === undefined) ? (
                                    <Skeleton width='100%' height='20px' />
                                ) : (
                                    <Controller
                                        name="marital_status"
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <Autocomplete
                                                id="marital_status"
                                                onChange={(_, item) => {
                                                    onChange(item);
                                                }}
                                                value={value}
                                                defaultValue={situations.find(option => option.uid === prospect?.marital_status?.uid) || null}
                                                options={situations}
                                                getOptionLabel={(option) => option.label}
                                                isOptionEqualToValue={(option, value) => option.uid === value.uid}
                                                fullWidth
                                                disabled={isSubmitting}
                                                renderInput={(params) => (
                                                    <TextField
                                                        {...params}
                                                        label="Situation matrimoniale"
                                                        variant="filled"
                                                        helperText={errors.marital_status?.message}
                                                        error={!!errors.marital_status}
                                                    />
                                                )}
                                            />
                                        )}
                                    />
                                )}
                            </Grid>

                            <Grid xs={12} md={6} lg={6} xl={4}>
                                {(genders === undefined) ? <Skeleton width='100%' height='20px' />
                                    :
                                    <FormControl component="fieldset">
                                        <FormLabel id="gender">{t("gender")}</FormLabel>
                                        <Controller
                                            name="gender"
                                            control={control}
                                            {...register("gender")}
                                            render={({ field: { onChange, value } }) => (
                                                <RadioGroup
                                                    row
                                                    aria-labelledby="gender"
                                                    value={value}
                                                    onChange={(e) => {
                                                        onChange(e.target.value);
                                                    }}
                                                >
                                                    {genders.map((gender) => (
                                                        <FormControlLabel
                                                            key={gender.uid}
                                                            value={gender.uid}
                                                            control={<Radio />}
                                                            label={gender.label}
                                                        />
                                                    ))}
                                                </RadioGroup>
                                            )}
                                        />
                                        {errors.gender && (
                                            <FormHelperText sx={{ mt: 1 }} error>
                                                {errors.gender.message}
                                            </FormHelperText>
                                        )}
                                    </FormControl>

                                }
                            </Grid>
                            <Grid xs={12} md={6} lg={6} xl={4}>
                                <TextField
                                    variant="filled"
                                    id="last_name"
                                    label="Last Name"
                                    fullWidth
                                    {...register("last_name")}
                                    disabled={isSubmitting}
                                />
                            </Grid>
                            <Grid xs={12} md={6} lg={4} xl={4}>
                                <TextField
                                    id="birth_date"
                                    variant="filled"
                                    label="Date de naissance"
                                    disabled={isSubmitting}
                                    type="date"
                                    fullWidth
                                    {...register("birth_day")}
                                    error={!!errors.birth_day}
                                    helperText={errors.birth_day?.message}
                                />
                            </Grid>
                            <Grid xs={12} md={6} lg={6} xl={4}>
                                <TextField
                                    variant="filled"
                                    id="Date d'expiration de la cni"
                                    label="CNI Expired Date"
                                    type='date'
                                    fullWidth
                                    {...register("cni_expired_date")}
                                    disabled={isSubmitting}
                                    error={!!errors.cni_expired_date}
                                    helperText={errors.cni_expired_date?.message}
                                />
                            </Grid>
                            <Grid xs={12} md={6} lg={6} xl={4}>
                                <TextField
                                    variant="filled"
                                    id="email"
                                    label="Email"
                                    type='email'
                                    fullWidth
                                    {...register("email")}
                                    disabled={isSubmitting}
                                />
                            </Grid>
                            <Grid xs={12} md={6} lg={6} xl={4}>
                                <IntlPhoneField
                                    variant="filled"
                                    id="main_phone"
                                    value = {prospect.main_phone ?? ""}
                                    label="Main Phone"
                                    fullWidth
                                    error={!!errors.main_phone}
                                    helperText={errors.main_phone?.message}
                                    onChange={value => {
                                        setValue("main_phone", value, {shouldValidate: true});
                                    }} // assign onChange event
                                    onBlur={onBlurPhone} // assign onBlur event
                                    name={namePhone} // assign name prop
                                    ref={refPhone}
                                />
                            </Grid>
                            <Grid xs={12} md={6} lg={6} xl={4}>
                                <IntlPhoneField
                                    variant="filled"
                                    id="secondary_phone"
                                    value = {prospect.secondary_phone ?? ""}
                                    label="Secondary Phone"
                                    fullWidth
                                    error={!!errors.secondary_phone}
                                    helperText={errors.secondary_phone?.message}
                                    onChange={value => {
                                        if(value === "+237")
                                            value =''
                                        setValue("secondary_phone", value, {shouldValidate: true});
                                    }} // assign onChange event
                                    onBlur={_onBlurPhone} // assign onBlur event
                                    name={_namePhone} // assign name prop
                                    ref={_refPhone}
                                />
                            </Grid>
                            <Grid xs={12} md={6} lg={6} xl={4}>
                                <TextField
                                    variant="filled"
                                    id="birth_place"
                                    label="Birth Place"
                                    fullWidth
                                    {...register("birth_place")}
                                    disabled={isSubmitting}
                                />
                            </Grid>
                            <Grid xs={12} md={6} lg={6} xl={4}>
                                <TextField
                                    variant="filled"
                                    id="address"
                                    label="Address"
                                    fullWidth
                                    {...register("address")}
                                    disabled={isSubmitting}
                                />
                            </Grid>
                            <Grid xs={12} md={6} lg={6} xl={4}>
                                <TextField
                                    variant="filled"
                                    id="cni_number"
                                    label="CNI Number"
                                    fullWidth
                                    {...register("cni_number")}
                                    disabled={isSubmitting}
                                />
                            </Grid>
                            <Grid xs={12} md={6} lg={6} xl={4}>
                                <TextField
                                    variant="filled"
                                    id="niu_number"
                                    label="NUI Number"
                                    fullWidth
                                    {...register("niu_number")}
                                    disabled={isSubmitting}
                                />
                            </Grid>
                            <Grid container xs={12} md={6} lg={12} xl={12}>
                                <Grid xs={12} md={12} lg={2} xl={2}>
                                    <Button
                                        type="submit"

                                        variant="contained"
                                        size="large"
                                        sx={{mt: 1}}
                                        className="brSm"
                                    >
                                        {t('update')}
                                    </Button>
                                </Grid>
                            </Grid>
                            <DevTool control={control} placement="top-right" />
                        </Grid>
                    </Paper>
                </>
            )}
        </>
    )
}
