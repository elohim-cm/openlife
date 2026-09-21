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
import validationSchema from "@/components/AnimationTeam/validationSchema";
import {DevTool} from "@hookform/devtools";
import NetworkService from "@/services/NetworkService";
import Toast from "@/utils/toast";
import {AREA_LIST, NETWORK_LIST, TEAM_LIST} from "@/utils/routes/routes";
import {canInterprateError, displayHttpError} from "@/utils/api";
import ProviderService from "@/services/ProviderService";
import toast from "@/utils/toast";
import Autocomplete from "@mui/material/Autocomplete";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import DistributionAreaService from "@/services/DistributionAreaService";
import AnimationTeamService from "@/services/AnimationTeamService";
import UtilMethods from "@/utils/UtilMethods";
import {useTranslation} from "react-i18next";

const AnimationTeamCreate = (callback, deps) => {
  const [inProgress, setInProgress] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [areas, setAreas] = useState([]);
  const [animator, setAnimator] = useState(null);
  const [ready, setReady] = useState(false);
  const [area, setArea] = useState(null);
  const router = useRouter();
  const context = useAppContext(); 
  const token = getToken();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const {t} = useTranslation();

  //state for queryRequest
  const [qProvider, setqProvider] = useState('');
  const [qArea, setqArea] = useState('');

  // request all providers
  const getProviders = useCallback(
    async (page, qProvider) => {
      const response = await ProviderService.getAll(token, page, 'animator', qProvider);

      // if no errors
      if (response.error == null) {
        setProviders(response.providers);
      } else {
        displayHttpError(response.error, router);
      }
    },
    [token, router],
  );

  // get all networks
  const getAreas = useCallback(
    async (page, qArea) => {
      const response = await DistributionAreaService.getAll(token, page, qArea);

      // if no errors
      if (response.error == null) {
        setAreas(response.areas);
      } else {
        displayHttpError(response.error, router);
      }
    },
    [token, router],
  );

  const getDatas = useCallback(async () => {
    await Promise.all([
      getProviders(1, ''),
      getAreas(1, '')
    ]);
    setReady(true);
  }, [getProviders, getAreas]);

  useEffect(() => {
    getDatas();
  }, [getDatas]);

  useEffect(() => {
    if (ready) {
      getProviders(1, qProvider);
    }
  }, [getProviders, qProvider, ready]);

  useEffect(() => {
    if (ready) {
      getAreas(1, qArea);
    }
  }, [getAreas, qArea, ready]);

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
      animator: null,
      distribution_area: null,
      description: "",
    },
    mode: "all",
  });

  // Auto-preselect distribution_area if only one area exists
  useEffect(() => {
    if (ready && areas && areas.length === 1) {
      setValue("distribution_area", areas[0]);
    }
  }, [areas, setValue, ready]);

  //  on form submission
  const onSubmit = async data => {
    setInProgress(true);
    const response = await AnimationTeamService.create(token, data);

    if (response.error === null) {
      context.togglePageLoading(true);
      Toast.success(t('newAnimationTeamSuccessfullyCreated'));

      router.push(TEAM_LIST);
    } else {
      displayHttpError(response.error, router);
    }
    setInProgress(false);
  };

  return (
    <>
      {!ready ? (
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
              {t('createANewAnimationTeam')}
            </Typography>
            <Grid container spacing={4}>
              <Grid xs={12} md={6} lg={6} xl={4}>
                <TextField
                  variant="filled"
                  id="code"
                  label={t('codeAnimationTeam') + '*'}
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
                  label={t('name') + '*'}
                  fullWidth
                  error={!!errors.name}
                  helperText={errors.name?.message}
                  {...register("name")}
                  disabled={isSubmitting}
                />
              </Grid>
              <Grid xs={12} md={6} lg={6} xl={4}>
                <Controller
                  name="animator"
                  control={control}
                  render={({field: {onChange, value}}) => (
                    <Autocomplete
                      id="animator"
                      onChange={(_, item) => {
                        onChange(item);
                      }}
                      onInputChange={(event, newInputValue) => {
                        setqProvider(newInputValue.trim())
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
                          label={t('animator')}
                          variant="filled"
                          helperText={errors.animator?.message}
                          error={!!errors.animator}
                        />
                      )}
                    />
                  )}
                />
              </Grid>
              <Grid xs={12} md={6} lg={6} xl={4}>
                <Controller
                  name="distribution_area"
                  control={control}
                  render={({field: {onChange, value}}) => (
                    <Autocomplete
                      id="distribution_area"
                      onChange={(_, item) => {
                        onChange(item);
                      }}
                      onInputChange={(event, newInputValue) => {
                        setqArea(newInputValue.trim())
                      }}
                      value={value}
                      options={areas}
                      getOptionLabel={option => option.name}
                      isOptionEqualToValue={(option, value) => option.uid === value.uid}
                      fullWidth
                      disabled={isSubmitting}
                      renderInput={params => (
                        <TextField
                          {...params}
                          label={t('distributionArea') + '*'}
                          variant="filled"
                          helperText={errors.distribution_area?.message}
                          error={!!errors.distribution_area}
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
                  label={t('description')}
                  fullWidth
                  error={!!errors.description}
                  helperText={errors.description ? errors.description.message : ""}
                  {...register("description")}
                  disabled={isSubmitting}
                />
              </Grid>
              {UtilMethods.getHabilitations(authorizations, 'animation team').canCreate && <Grid container xs={12} md={6} lg={12} xl={12}>
                <Grid xs={12} md={12} lg={2} xl={2}>
                  <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      sx={{mt: 1}}
                      className="brSm"
                      disabled={!isValid}
                  >
                    {t('create')}
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

export default AnimationTeamCreate;
