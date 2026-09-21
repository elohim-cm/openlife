"use client";

import React, {useCallback, useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Controller, useForm} from "react-hook-form";
import {Button, Paper, TextField, Typography, Chip} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import ActivityIndicator from "@/components/ActivityIndicator";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useAppContext} from "@/contexts/appContext";
import {getToken} from "@/utils";
import Toast from "@/utils/toast";
import {TEAM_LIST} from "@/utils/routes/routes";
import {displayHttpError} from "@/utils/api";
import ProviderService from "@/services/ProviderService";
import Autocomplete from "@mui/material/Autocomplete";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import AnimationTeamService from "@/services/AnimationTeamService";
import UtilMethods from "@/utils/UtilMethods";
import {useTranslation} from "react-i18next";
import Skeleton from "@mui/material/Skeleton";

const BulkAssignement = () => {
  const [inProgress, setInProgress] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [allProviders, setAllProviders] = useState([]);
  const [teamProviders, setTeamProviders] = useState([]);
  const [teams, setTeams] = useState([]);
  const [ready, setReady] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [providersLoading, setProvidersLoading] = useState(false);
  const [selectedTeamUid, setSelectedTeamUid] = useState(null);
  const router = useRouter();
  const context = useAppContext();
  const token = getToken();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const {t} = useTranslation();
  const searchParams = useSearchParams();
  const eqUidParam = searchParams.get('eq_uid');

  const [qProvider, setqProvider] = useState('');
  const [qTeam, setqTeam] = useState('');

  const getAllProviders = useCallback(
    async (page, qProvider) => {
      setProvidersLoading(true);
      const response = await ProviderService.getAll(token, page, '', qProvider, '', '', true);

      if (response.error == null) {
        setAllProviders(response.providers);
      } else {
        displayHttpError(response.error, router);
      }
      setProvidersLoading(false);
    },
    [token, router],
  );

  const getTeamProviders = useCallback(
    async (teamUid) => {
      if (!teamUid) {
        setTeamProviders([]);
        return;
      }
      
      setProvidersLoading(true);
      const response = await ProviderService.getTeamProviders(token, teamUid, 1, '', true);

      if (response.error == null) {
        setTeamProviders(response.providers || []);
      } else {
        displayHttpError(response.error, router);
      }
      setProvidersLoading(false);
    },
    [token, router],
  );

  const getTeams = useCallback(
    async (page, qTeam) => {
      setTeamsLoading(true);
      const response = await AnimationTeamService.getAll(token, page, qTeam, '', true);

      if (response.error == null) {
        setTeams(response.teams);
      } else {
        displayHttpError(response.error, router);
      }
      setTeamsLoading(false);
    },
    [token, router],
  );

  const {
    formState: {errors, isSubmitting, isValid},
    handleSubmit,
    control,
    setValue,
  } = useForm({
    defaultValues: {
      animation_team: null,
      providers: [],
    },
    mode: "all",
  });

  const getDatas = useCallback(async () => {
    setReady(true);
  }, []);

  useEffect(() => {
    getDatas();
  }, [getDatas]);

  useEffect(() => {
    getAllProviders(1, qProvider);
  }, [getAllProviders, qProvider]);

  useEffect(() => {
    getTeams(1, qTeam);
  }, [getTeams, qTeam]);

  useEffect(() => {
    if (eqUidParam && teams.length > 0) {
      const selectedTeam = teams.find(team => team.uid === eqUidParam);
      if (selectedTeam) {
        setValue('animation_team', selectedTeam, { shouldValidate: true });
        setSelectedTeamUid(selectedTeam.uid);
      }
    }
  }, [eqUidParam, teams, setValue]);

  useEffect(() => {
    if (selectedTeamUid) {
      getTeamProviders(selectedTeamUid);
    } else {
      setTeamProviders([]);
      setValue('providers', []);
    }
  }, [selectedTeamUid, getTeamProviders, setValue]);

  useEffect(() => {
    if (teamProviders.length > 0) {
      setValue('providers', teamProviders);
    }
  }, [teamProviders, setValue]);

  const onSubmit = async data => {
    setInProgress(true);

    const payload = {
      eq_uid: data.animation_team?.uid,
      app_uids: data.providers.map(provider => provider.uid),
    };

    const response = await AnimationTeamService.bulkAssignement(token, payload);

    if (response.error === null) {
      context.togglePageLoading(true);
      Toast.success(t('providersSuccessfullyAssignedToAnimationTeam'));
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
              {t('bulkAssignmentOfProviders')}
            </Typography>
            <Grid container spacing={4}>
              <Grid xs={12} md={6} lg={6} xl={6}>
                {teamsLoading ? (
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                ) : eqUidParam ? (
                  <Controller
                    name="animation_team"
                    control={control}
                    rules={{ required: t('animationTeamRequired') }}
                    render={({field: {value}}) => (
                      <TextField
                        label={t('animationTeam') + ' *'}
                        variant="filled"
                        value={value?.name || ''}
                        fullWidth
                        disabled
                        InputProps={{
                          readOnly: true,
                        }}
                      />
                    )}
                  />
                ) : (
                  <Controller
                    name="animation_team"
                    control={control}
                    rules={{ required: t('animationTeamRequired') }}
                    render={({field: {onChange, value}}) => (
                      <Autocomplete
                        id="animation_team"
                        onChange={(_, item) => {
                          onChange(item);
                          setSelectedTeamUid(item?.uid || null);
                        }}
                        onInputChange={(event, newInputValue) => {
                          setqTeam(newInputValue.trim())
                        }}
                        value={value}
                        options={teams}
                        getOptionLabel={option => option.name || ''}
                        isOptionEqualToValue={(option, value) => option.uid === value.uid}
                        fullWidth
                        disabled={isSubmitting}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label={t('animationTeam') + ' *'}
                            variant="filled"
                            helperText={errors.animation_team?.message}
                            error={!!errors.animation_team}
                          />
                        )}
                      />
                    )}
                  />
                )}
              </Grid>
              <Grid xs={12} md={12} lg={12} xl={12}>
                {providersLoading ? (
                  <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
                ) : (
                  <Controller
                    name="providers"
                    control={control}
                    rules={{ 
                      required: t('providersRequired'),
                      validate: value => value.length > 0 || t('providersRequired')
                    }}
                    render={({field: {onChange, value}}) => (
                      <Autocomplete
                        multiple
                        id="providers"
                        onChange={(_, items) => {
                          onChange(items);
                        }}
                        onInputChange={(event, newInputValue) => {
                          setqProvider(newInputValue.trim())
                        }}
                        value={value}
                        options={allProviders}
                        getOptionLabel={option => `${option.last_name || ''} ${option.first_name || ''} - ${option.code || ''} - ${option.professional_email || ''} `}
                        renderOption={(props, option) => (
                          <li {...props}>
                            <div>
                              <div style={{ fontWeight: 'bold' }}>
                                {option.last_name || ''} {option.first_name || ''}
                              </div>
                              <div style={{ fontSize: '0.85em', color: '#666' }}>
                                Code: {option.code || ''} | {option.professional_email || ''}
                              </div>
                            </div>
                          </li>
                        )}
                        isOptionEqualToValue={(option, value) => option.uid === value.uid}
                        fullWidth
                        disabled={isSubmitting}
                        renderTags={(tagValue, getTagProps) =>
                          tagValue.map((option, index) => (
                            <Chip
                              label={
                                <div>
                                  <div style={{ fontWeight: 'bold' }}>
                                    {option.last_name || ''} {option.first_name || ''}
                                  </div>
                                  <div style={{ fontSize: '0.75em', opacity: 0.8 }}>
                                    {option.professional_email || ''}
                                  </div>
                                </div>
                              }
                              {...getTagProps({ index })}
                              key={option.uid}
                            />
                          ))
                        }
                        renderInput={params => (
                          <TextField
                            {...params}
                            label={t('providers') + ' *'}
                            variant="filled"
                            helperText={errors.providers?.message}
                            error={!!errors.providers}
                            placeholder={t('searchProviders')}
                          />
                        )}
                      />
                    )}
                  />
                )}
              </Grid>
              {UtilMethods.getHabilitations(authorizations, 'animation team').canUpdate && (
                <Grid container xs={12} md={6} lg={12} xl={12}>
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
                      {t('assign')}
                    </Button>
                  </Grid>
                </Grid>
              )}
            </Grid>
          </Paper>
        </>
      )}
    </>
  );
};

export default BulkAssignement;
