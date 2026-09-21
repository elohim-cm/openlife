"use client";

import React, {useCallback, useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button, Paper, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import ActivityIndicator from "@/components/ActivityIndicator";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useAppContext} from "@/contexts/appContext";
import {getToken, getUid} from "@/utils";
import {DevTool} from "@hookform/devtools";
import NetworkService from "@/services/NetworkService";
import Toast from "@/utils/toast";
import {NETWORK_LIST} from "@/utils/routes/routes";
import {canInterprateError, displayHttpError} from "@/utils/api";
import ProviderService from "@/services/ProviderService";
import toast from "@/utils/toast";
import Autocomplete from "@mui/material/Autocomplete";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import validationSchemaToUpdate from "@/components/Network/updateValidationSchema";
import {useTranslation} from "react-i18next";
import UtilMethods from "@/utils/UtilMethods";

const NetworkCreate = (callback, deps) => {
  const {t} = useTranslation();
  const [inProgress, setInProgress] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [network, setNetwork] = useState(null);
  const [providers, setProviders] = useState([]);
  const router = useRouter();
  const context = useAppContext();
  const token = getToken();
  const uuid = getUid();

  //state for queryRequest
  const [qProvider, setqProvider] = useState('');
  const [qNetwork, setqNetwork] = useState('');

  // get current network
  const getCurrentNetwork = useCallback(async () => {
    const {error, network} = await NetworkService.getOne(token, uuid);

    if (Object.keys(error).length === 0) {
      setNetwork(network);
    } else {
      displayHttpError(error, router);
    }
  }, [token, uuid]);

  // request all providers
  const getProviders = useCallback(
    async (page, qProvider) => {
      setIsLoading2(true)
      const response = await ProviderService.getAll(token, page, UtilMethods.getProviderRoleSearch(), qProvider);
      setIsLoading2(false)

      // if no errors
      if (response.error === null) {
        setProviders(response.providers);
      } else {
        displayHttpError(response.error, router);
      }
    },
    [token, router],
  );

  // get all networks
  const getNetworks = useCallback(
    async (page, qNetwork) => {
      setIsLoading1(true)
      const {error, networks} = await NetworkService.getAll(token, page, qNetwork, 10, 0);
      setIsLoading1(false)

      // if no errors
      if (Object.values(error).length === 0) {
        if (UtilMethods.isAdmin()){
          setNetworks([]);
        } else{
          setNetworks(networks);
        }
      } else {
        displayHttpError(error, router);
      }
    },
    [token, router],
  );

  useEffect(() => {
    getCurrentNetwork();
  }, [getCurrentNetwork]);
  useEffect(() => {
    getProviders(1, qProvider);
  }, [getProviders,qProvider]);
  useEffect(() => {
    getNetworks(1, qNetwork);
  }, [getNetworks,qNetwork]);

  //  form hook
  const {
    register,
    formState: {errors, isSubmitting, isValid},
    handleSubmit,
    control,
    setValue,
  } = useForm({
    resolver: zodResolver(validationSchemaToUpdate),
    mode: "all",
  });

  useEffect(() => {
    // Set default values for the form based on the current network
    if (network) {
      const defaultValues = {
        code: network.code,
        name: network.name,
        parent: network.parent,
        inspector: network.inspector,
        description: network.description,
      };
      // Update the form with default values using setValue
      Object.keys(defaultValues).forEach((key) => setValue(key, defaultValues[key]));
    }
  }, [network, setValue]);
  //  on form submission
  const onSubmit = async data => {
    //  show loading indicator
    setInProgress(true);

    // request api to add provider
    const response = await NetworkService.update(token, uuid, data);

    if (response.status === 200) {
      Toast.success(t("networkSuccessfullyUpdated"));
      context.togglePageLoading(true);
      router.push(NETWORK_LIST);
    } else {
      displayHttpError(response.error, router);
    }
    setInProgress(false);
  };

  return (
    <>
      {((networks.length <=0 || isLoading1) && (providers.length <=0 || isLoading2))? <CreateFormSkeleton /> : (
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
              {t("updateBusinessNetwork")}
            </Typography>
            <Grid container spacing={4}>
              <Grid xs={12} md={6} lg={6} xl={4}>
                <TextField
                  variant="filled"
                  id="code"
                  label={t("networkCode")}
                  fullWidth
                  placeholder="Ex: CODE237 ou code237"
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
                  label={t("networkName")}
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  {...register("name")}
                  disabled={isSubmitting}
                />
              </Grid>
              <Grid xs={12} md={6} lg={6} xl={4}>
                <Controller
                  name="parent"
                  control={control}
                  render={({field: {onChange, value}}) => (
                    <Autocomplete
                      id="parent"
                      onChange={(_, item) => {
                        onChange(item);
                      }}
                      onInputChange={(event, newInputValue) => {
                        setqNetwork(newInputValue.trim())
                      }}
                      value={value}
                      options={networks}
                      getOptionLabel={option => option.name}
                      isOptionEqualToValue={(option, value) => option.uid === value.uid}
                      getOptionDisabled={option => option.uid === uuid}
                      fullWidth
                      disabled={isSubmitting}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label={t("parentNetwork")}
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
                <Controller
                  name="inspector"
                  control={control}
                  render={({field: {onChange, value}}) => (
                    <Autocomplete
                      id="inspector"
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
                      getOptionDisabled={option => option.code === "SYSTEM"}
                      fullWidth
                      disabled={isSubmitting}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label={NetworkService.roleLabel(t)}
                          variant="filled"
                          helperText={errors.inspector?.message}
                          error={!!errors.inspector}
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
              <Grid container xs={12} md={6} lg={12} xl={12}>
                <Grid xs={12} md={12} lg={2} xl={2}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{mt: 1}}
                    className="brSm"
                  >
                    {t("update")}
                  </Button>
                </Grid>
              </Grid>
              <DevTool control={control} placement="top-right" />
            </Grid>
          </Paper>
        </>
      )}
    </>
  );
};

export default NetworkCreate;
