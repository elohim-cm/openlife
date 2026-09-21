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
import validationSchema from "@/components/Network/validationSchema";
import {DevTool} from "@hookform/devtools";
import NetworkService from "@/services/NetworkService";
import Toast from "@/utils/toast";
import {NETWORK_LIST} from "@/utils/routes/routes";
import {canInterprateError, displayHttpError} from "@/utils/api";
import ProviderService from "@/services/ProviderService";
import toast from "@/utils/toast";
import Autocomplete from "@mui/material/Autocomplete";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import Skeleton from "@mui/material/Skeleton";
import UtilMethods from "@/utils/UtilMethods";
import {useTranslation} from "react-i18next";

const NetworkCreate = (callback, deps) => {
  const [inProgress, setInProgress] = useState(false);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [networks, setNetworks] = useState([]);
  const [providers, setProviders] = useState([]);
  const [allNetworks, setAllNetworks] = useState([]);
  const [network, setNetwork] = useState(null);
  const [parent, setParent] = useState(null);
  const router = useRouter();
  const context = useAppContext();
    const {t} = useTranslation();
  const token = getToken();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};


    //state for queryRequest
    const [qNetwork, setqNetwork] = useState('');
    const [qProvider, setqProvider] = useState('');

  // get all networks
  const getNetworks = useCallback(
    async (page, qNetwork) => {
      setIsLoading1(true)
      const response = await NetworkService.getAll(token, page, qNetwork, 10, 0);
      setIsLoading1(false)

      // if no errors
      if (response.error !== null) {
          if (UtilMethods.isAdmin()){
              setNetworks([]);
          } else{
            setValue('parent', response.networks[0])
              setNetworks(response.networks);
          }
      } else {
        Toast.error(t("anErrorHasOccurredPleaseRefreshThePage"), 3000);
      }
    },
    [token, router],
  );

  // get all providers
  const getProviders = useCallback(
    async (page, qProvider) => {
      setIsLoading2(true)
      const response = await ProviderService.getAll(token, page, UtilMethods.getProviderRoleSearch(), qProvider);
      setIsLoading2(false)
      // if no errors
      if (response.error === null) {
        setProviders(response.providers);
      } else {
        Toast.error(t("anErrorHasOccurredPleaseRefreshThePage"), 3000);
      }
    },
    [token, router],
  );

  useEffect(() => {
    getNetworks(1, qNetwork);
  }, [getNetworks, qNetwork]);
  useEffect(() => {
    getProviders(1, qProvider);
  }, [getProviders, qProvider]);

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
      code: "",
      name: "",
      parent: null,
      inspector: null,
      description: "",
    },
    mode: "all",
  });

  //  on form submission
  const onSubmit = async data => {
    //  show loading indicator
    setInProgress(true);

    // request api to add provider
    const response = await NetworkService.create(token, data);
    console.log("network create response ||| ", data);

    if (response.status === 201) {
      Toast.success(t("networkSuccessfullyCreated"));
      context.togglePageLoading(true);
      router.push(NETWORK_LIST);
    } else {
      displayHttpError(response.error, router);
    }
    setInProgress(false);
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
          className="brSm">
          <PageLoadingIndicator visible={pageLoading} />
          <ActivityIndicator visible={inProgress} />
          <Typography variant="h5" component="h5" mb={2}>
              {t("createNewBusinessNetwork")}
          </Typography>
          {(isLoading1 && isLoading2)? <CreateFormSkeleton />
            :<Grid container spacing={4}>
              <Grid xs={12} md={6} lg={6} xl={4}>
                <TextField
                    variant="filled"
                    id="code"
                    label={`${t("networkCode")}*`}
                    fullWidth
                    placeholder="Ex: CODE237 / code237"
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
                    label={`${t("networkName")}*`}
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
                              setParent(item)
                            }}
                            defaultValue={networks[0]}
                            value={networks[0]}
                            options={networks}
                            getOptionLabel={option => option.name}
                            isOptionEqualToValue={(option, value) => { 
                              return option.uid === value.uid
                            }}
                            fullWidth
                            disabled={true}
                            readOnly={true}
                            renderInput={params => (
                                <TextField
                                    {...params}
                                    disabled={true}
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
                            id="parent"
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
              {UtilMethods.getHabilitations(authorizations, 'network').canCreate && <Grid container xs={12} md={6} lg={12} xl={12}>
                  <Grid xs={12} md={12} lg={2} xl={2}>
                      <Button
                          type="submit"
                          fullWidth
                          variant="contained"
                          size="large"
                          sx={{mt: 1}}
                          className="brSm"
                          disabled={!isValid}>
                          {t("create")}
                      </Button>
                  </Grid>
              </Grid>}
              <DevTool control={control} placement="top-right"/>
          </Grid>}
        </Paper>
    </>
  );
};

export default NetworkCreate;
