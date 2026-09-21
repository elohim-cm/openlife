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
import validationSchema from "@/components/Distribution-area/validationSchema";
import {DevTool} from "@hookform/devtools"; 
import NetworkService from "@/services/NetworkService";
import Toast from "@/utils/toast";
import {AREA_LIST, NETWORK_LIST} from "@/utils/routes/routes";
import {canInterprateError, displayHttpError} from "@/utils/api";
import ProviderService from "@/services/ProviderService";
import toast from "@/utils/toast";
import Autocomplete from "@mui/material/Autocomplete";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import DistributionAreaService from "@/services/DistributionAreaService";
import UtilMethods from "@/utils/UtilMethods";
import {useTranslation} from "react-i18next";

const NetworkCreate = (callback, deps) => {
  const {t} = useTranslation();
  const [inProgress, setInProgress] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [providers, setProviders] = useState(undefined);
  const [networks, setNetworks] = useState(undefined);
  const [manager, setManager] = useState(null);
  const [network, setNetwork] = useState(null);
  const router = useRouter();
  const context = useAppContext();
  const token = getToken();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  //state for queryRequest
  const [qNetwork, setqNetwork] = useState('');
  const [qProvider, setqProvider] = useState('');

  // request all providers
  const getProviders = useCallback(
    async (page, qProvider) => {
      const response = await ProviderService.getAll(token, page, 'manager', qProvider);

      // if no errors
      if (response.error === null) {
        setProviders(response.providers);
      } else {
        if (canInterprateError(response.error, router)) {
          Toast.error(response.error.response.data.message);
        } else toast.error(t("anErrorHasOccurredPleaseRefreshThePage"), 3000);
      }
    },
    [token, router],
  );

  // get all networks
  const getNetworks = useCallback(
    async (page, qNetwork) => {
      const response = await NetworkService.getAll(token, page, qNetwork);

      // if no errors
      if (response.error !== null) {
        setNetworks(response.networks);
      } else {
        Toast.error(t("anErrorHasOccurredPleaseRefreshThePage"), 3000);
      }
    },
    [token, router],
  );

  const [ready, setReady] = useState(false);

  const getDatas = useCallback(async () => {
    await Promise.all([
      getProviders(1, ''),
      getNetworks(1, '')
    ]);
    setReady(true);
  }, [getProviders, getNetworks]);

  useEffect(() => {
    getDatas();
  }, [getDatas]);

  // Search effects - only run after initial data is loaded
  useEffect(() => {
    if (ready) {
      getProviders(1, qProvider);
    }
  }, [getProviders, qProvider, ready]);

  useEffect(() => {
    if (ready) {
      getNetworks(1, qNetwork);
    }
  }, [qNetwork, getNetworks, ready]);

  //  form hook
  const {
    register,
    formState: {errors, isSubmitting, isValid},
    handleSubmit,
    control,
    setValue,
  } = useForm({
    resolver: zodResolver(validationSchema(t)),
    defaultValues: {
      code: "",
      name: "",
      manager: null,
      reseau: null,
      description: "",
    },
    mode: "all",
  });

  // Auto-preselect reseau if only one network exists
  useEffect(() => {
    if (ready && networks && networks.length === 1) {
      setValue("reseau", networks[0]);
    }
  }, [networks, setValue, ready]);

  //  on form submission
  const onSubmit = async data => {
    console.log("area create response ||| ", data);

    //  show loading indicator
    setInProgress(true);

    // request api to add provider
    const response = await DistributionAreaService.create(token, data);

    if (response.error === null) {
      context.togglePageLoading(true);

      // show success message
      Toast.success(t("distributionZoneSuccessfullyCreated"));

      // redirect to areas list page
      router.push(AREA_LIST);
    } else {
      displayHttpError(response.error, router);
    }
    setInProgress(false);
  };

  return (
      <>
        {(providers === undefined || networks === undefined) ? (
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
                {t("back")}
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
                  {t("createNewDistributionZone")}
                </Typography>
                <Grid container spacing={4}>
                  <Grid xs={12} md={6} lg={6} xl={4}>
                    <TextField
                        variant="filled"
                        id="code"
                        label={`${t("zoneCode")}*`}
                        fullWidth
                        error={!!errors.code}
                        helperText={errors.code?.message}
                        {...register("code")}
                        disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={6} xl={4}>
                    <TextField
                        variant="filled"
                        id="name"
                        label={`${t("zoneName")}*`}
                        fullWidth
                        error={!!errors.name}
                        helperText={errors.name?.message}
                        {...register("name")}
                        disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={6} xl={4}>
                    <Controller
                        name="manager"
                        control={control}
                        render={({field: {onChange, value}}) => (
                            <Autocomplete
                                id="manager"
                                onChange={(_, item) => {
                                  onChange(item);
                                }}
                                onInputChange={(event, newInputValue) => {
                                  setqProvider(newInputValue.trim());
                                }}
                                value={value}
                                options={providers}
                                getOptionLabel={option => `${option.last_name || ''} ${option.first_name || ''}`}
                                isOptionEqualToValue={(option, value) => option.uid === value.uid}
                                fullWidth
                                disabled={isSubmitting}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        label={t("manager")}
                                        variant="filled"
                                        helperText={errors.manager?.message}
                                        error={!!errors.manager}
                                    />
                                )}
                            />
                        )}
                    />
                  </Grid>
                  <Grid xs={12} md={6} lg={6} xl={4}>
                    <Controller
                        name="reseau"
                        control={control}
                        render={({field: {onChange, value}}) => (
                            <Autocomplete
                                id="reseau"
                                onChange={(_, item) => {
                                  onChange(item);
                                }}
                                onInputChange={(event, newInputValue) => {
                                  setqNetwork(newInputValue.trim());
                                }}
                                value={value}
                                options={networks}
                                getOptionLabel={option => option.name}
                                isOptionEqualToValue={(option, value) => option.uid === value.uid}
                                fullWidth
                                disabled={isSubmitting}
                                renderInput={params => (
                                    <TextField
                                        {...params}
                                        label={t("network")}
                                        variant="filled"
                                        helperText={errors.reseau?.message}
                                        error={!!errors.reseau}
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
                  {UtilMethods.getHabilitations(authorizations, 'distribution area').canCreate && <Grid container xs={12} md={6} lg={12} xl={12}>
                    <Grid xs={12} md={12} lg={2} xl={2}>
                      <Button type="submit" fullWidth variant="contained" size="large" sx={{mt: 1}} className="brSm">
                        {t("create")}
                      </Button>
                    </Grid>
                  </Grid>}
                  <DevTool control={control} placement="top-right" />
                </Grid>
              </Paper>
            </>
        )}
      </>
  );
};

export default NetworkCreate;
