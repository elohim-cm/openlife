"use client";

import React, {useCallback, useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
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
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import ActivityIndicator from "@/components/ActivityIndicator";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useAppContext} from "@/contexts/appContext";
import {getToken, getUid} from "@/utils";
import validationSchema from "@/components/Provider/updateValidationSchema";
import Autocomplete from "@mui/material/Autocomplete";
import {DevTool} from "@hookform/devtools";
import ProviderService from "@/services/ProviderService";
import Toast from "@/utils/toast";
import Routes from "@/utils/routes";
import {displayHttpError} from "@/utils/api";
import {PROVIDER_LIST} from "@/utils/routes/routes";
import AnimationTeamService from "@/services/AnimationTeamService";
import providerService from "@/services/ProviderService";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import IntlPhoneField from "@/components/IntlPhoneField";
import {useTranslation} from "react-i18next";
import UtilMethods from "@/utils/UtilMethods";

const ProviderUpdate = () => {
  const {t} = useTranslation();
  const [currentProvider, setCurrentProvider] = useState(undefined);
  const [inProgress, setInProgress] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [providerNatures, setProviderNatures] = useState( undefined);
  const [providerNature, setProviderNature] = useState(null);
  const [animationTeams, setAnimationTeams] = useState(undefined);
  const [animationTeam, setAnimationTeam] = useState(undefined);
  const [genders, setGenders] = useState([]);
  const router = useRouter();
  const context = useAppContext();
  const token = getToken();
  const uuid = getUid();

  //state for queryRequest
  const [qAnimationTeam, setqAnimationTeam] = useState("");

  const getCurrentProvider = useCallback(async () => {
    const response = await ProviderService.getOne(token, uuid);
    console.log("Get current provider -- response ||| ", response);

    if (response.error === null) {
      setCurrentProvider(response.provider);
    } else {
      console.log("provider updated get current provider error ||| ", response.error);
    }
  }, [router]);

  // get all networks
  const getProviderNatures = useCallback(
    async page => {
      const response = await ProviderService.getProviderNatures(token, page);

      // if no errors
      if (response.error === null) {
        setProviderNatures(response.providerNatures);
      } else {
        Toast.error(t("anErrorHasOccurredPleaseRefreshThePage"), 3000);
      }
    },
    [token, router],
  );

  // get all animation teams
  const getAnimationTeams = useCallback(
    async (page, qAnimationTeam) => {
      const response = await AnimationTeamService.getAll(token, page, qAnimationTeam);

      // if no errors
      if (response.error === null) {
        setAnimationTeams(response.teams);
      } else {
        Toast.error(t("anErrorHasOccurredPleaseRefreshThePage"), 3000);
      }
    },
    [token, router],
  );

  // get genders
  const getGenders = useCallback(async () => {
    const response = await providerService.getGenders();

    if (response.error === null) {
      setGenders(response.genders);
    } else {
      Toast.error(t("anErrorHasOccurredPleaseRefreshThePage"), 3000);
    }
  }, [router]);

  useEffect(() => {
    getCurrentProvider();
    getProviderNatures(1);
    getGenders();
  }, [getProviderNatures, getGenders, getCurrentProvider]);

  useEffect(() => {
    getAnimationTeams(1, qAnimationTeam);
  }, [getAnimationTeams, qAnimationTeam]);

  const {
    register,
    formState: { errors, isSubmitting, isValid },
    handleSubmit,
    control,
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(validationSchema(t)),
    mode: "all",
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentProvider && currentProvider.animation_team_name) {
          const response = await AnimationTeamService.getAll(token, 1, currentProvider.animation_team_name);
          if (response.error === null && response.teams.length > 0) {
            const defaultAnimationTeam = response.teams[0];
            setAnimationTeam(defaultAnimationTeam);// Set the default value in the form after updating state
            setValue('animation_team', defaultAnimationTeam);
          }
        }
      } catch (error) {
        console.error("An unexpected error occurred while fetching default animation team:", error);
      }
    };

    fetchData();
  }, [currentProvider, setAnimationTeam, token, setValue]);

  useEffect(() => {
    if (currentProvider) {
      const defaultValues = {
        code: currentProvider.code,
        firstname: currentProvider.first_name,
        lastname: currentProvider.last_name,
        // phone: currentProvider.phone,
        professional_email: currentProvider.professional_email,
        adresse: currentProvider.address,
        gender: currentProvider.gender?.uid,
        personal_email: currentProvider.personal_email,
        provider_nature: currentProvider.provider_nature,
        contractual_status: currentProvider.contractual_status,
        animation_team: animationTeam || null,
      };

      // Log animationTeam after it's set
      console.log(animationTeam);

      Object.keys(defaultValues).forEach((key) => setValue(key, defaultValues[key]));

      const phone = UtilMethods.formatInternationalPhone(currentProvider.phone);
      setValue("phone", phone, {shouldValidate: true});
    }
  }, [currentProvider, setValue, animationTeam]);


  const providerNatureValue = watch("provider_nature");

  useEffect(() => {
    if (providerNatureValue) {
      if (providerNatureValue.label === "Salarié") {
        setValue("contractual_status", "WORK_CONTRACT", { shouldValidate: true });
      } else if (providerNatureValue.label === "Non salarié") {
        const currentStatus = watch("contractual_status");
        if (currentStatus === "WORK_CONTRACT") {
          setValue("contractual_status", "", { shouldValidate: true });
        }
      }
    }
  }, [providerNatureValue, setValue]);

  const getFilteredContractualStatus = () => {
    const allStatus = ProviderService.contractualStatus(t);
    if (providerNatureValue?.label === "Salarié") {
      return { WORK_CONTRACT: allStatus.WORK_CONTRACT };
    } else if (providerNatureValue?.label === "Non salarié") {
      const { WORK_CONTRACT, ...others } = allStatus;
      return others;
    }
    return allStatus;
  };

  //  on form submission
  const onSubmit = async data => {
    //  show loading indicator
    setInProgress(true);

    // request api to add provider
    const response = await ProviderService.update(token, uuid, data);

    if (response.error === null) {
      Toast.success(t("contributorSuccessfullyUpdated"));
      context.togglePageLoading(true);
      router.push(PROVIDER_LIST);
    } else {
      displayHttpError(response.error, router);
    }
    setInProgress(false);
  };

  const {onChange: onChangePhone, onBlur: onBlurPhone, name: namePhone, ref: refPhone} = register("phone");

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
          {t("updateContributor")}
        </Typography>

        {
          (animationTeams ===undefined || currentProvider === undefined || providerNatures === undefined || animationTeams === undefined) ? <CreateFormSkeleton />
              :
              <Grid container spacing={4}>
                <Grid xs={12} md={6} lg={6} xl={4}>
                  <TextField
                      variant="filled"
                      id="code"
                      label={t("contributorCode")}
                      fullWidth
                      error={!!errors.code}
                      helperText={errors.code ? errors.code.message : ""}
                      {...register("code")}
                      disabled={isSubmitting}
                  />
                </Grid>
                <Grid xs={12} md={6} lg={6} xl={4}>
                  <TextField
                      name='lastname'
                      variant="filled"
                      id="lastname"
                      label={t("lastName")}
                      fullWidth
                      error={!!errors.lastname}
                      helperText={errors.lastname ? errors.lastname.message : ""}
                      {...register("lastname")}
                      disabled={isSubmitting}
                  />
                </Grid>
                <Grid xs={12} md={6} lg={6} xl={4}>
                  <TextField
                      name='firstname'
                      variant="filled"
                      id="firstname"
                      label={t("firstName")}
                      fullWidth
                      error={!!errors.firstname}
                      helperText={errors.firstname ? errors.firstname.message : ""}
                      {...register("firstname")}
                      disabled={isSubmitting}
                  />
                </Grid>
                <Grid xs={12} md={6} lg={6} xl={4}>
                  <IntlPhoneField
                      variant="filled"
                      id="phone"
                      value = {watch("phone")}
                      label={t("phoneNumber")}
                      fullWidth
                      error={!!errors.phone}
                      helperText={errors.phone?.message}
                      onChange={value => {
                        setValue("phone", value, {shouldValidate: true});
                      }} // assign onChange event
                      onBlur={onBlurPhone} // assign onBlur event
                      name={namePhone} // assign name prop
                      ref={refPhone}
                  />
                </Grid>
                <Grid xs={12} md={6} lg={6} xl={4}>
                  <TextField
                      name='professional_email'
                      variant="filled"
                      id="professional_email"
                      label={t("professionalEmail")}
                      fullWidth
                      error={!!errors.professional_email}
                      helperText={errors.professional_email ? errors.professional_email.message : ""}
                      {...register("professional_email")}
                      disabled={isSubmitting}
                  />
                </Grid>
                <Grid xs={12} md={6} lg={6} xl={4}>
                  <TextField
                      variant="filled"
                      id="adresse"
                      label={t("address")}
                      fullWidth
                      error={!!errors.adresse}
                      helperText={errors.adresse ? errors.adresse.message : ""}
                      {...register("adresse")}
                      disabled={isSubmitting}
                  />
                </Grid>
                <Grid xs={12} md={6} lg={4} xl={4}>
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
                </Grid>
                <Grid xs={12} md={6} lg={6} xl={4}>
                  <TextField
                      variant="filled"
                      id="personal_email"
                      name="personal_email"
                      label={t("personalEmail")}
                      fullWidth
                      error={!!errors.personal_email}
                      helperText={errors.personal_email ? errors.personal_email.message : ""}
                      {...register("personal_email")}
                      disabled={isSubmitting}
                  />
                </Grid>
                <Grid xs={12} md={6} lg={6} xl={4}>
                  <Controller
                      name="provider_nature"
                      control={control}
                      render={({field: {onChange, value}}) => (
                          <Autocomplete
                              id="provider_nature"
                              onChange={(_, item) => {
                                onChange(item);
                              }}
                              value={value}
                              options={providerNatures}
                              // getOptionLabel={option => option.label}
                              getOptionLabel={option => UtilMethods.providerNature(t)[option.label] || ''}
                              isOptionEqualToValue={(option, value) => option.uid === value.uid}
                              fullWidth
                              disabled={isSubmitting}
                              renderInput={params => (
                                  <TextField
                                      {...params}
                                      label={`${t("contributorNature")}*`}
                                      variant="filled"
                                      helperText={errors.provider_nature?.message}
                                      error={!!errors.provider_nature}
                                  />
                              )}
                          />
                      )}
                  />
                </Grid>
                <Grid xs={12} md={6} lg={6} xl={4}>
                  <Controller
                      name="contractual_status"
                      control={control}
                      render={({ field: { onChange, value } }) => (
                          <Autocomplete
                              id="contractual_status"
                              options={Object.keys(getFilteredContractualStatus())}
                              getOptionLabel={(option) => getFilteredContractualStatus()[option] || ""}
                              value={value || null}
                              onChange={(_, newValue) => onChange(newValue)}
                              renderInput={(params) => (
                                  <TextField
                                      {...params}
                                      label={`${t("contractualStatus")}*`}
                                      variant="filled"
                                      error={!!errors.contractual_status}
                                      helperText={errors.contractual_status?.message}
                                  />
                              )}
                              fullWidth
                              disabled={isSubmitting || providerNatureValue?.label === "Salarié"}
                          />
                      )}
                  />
                </Grid>
                <Grid xs={12} md={6} lg={6} xl={4}>
                  <Controller
                      name="animation_team"
                      control={control}
                      render={({field: {onChange, value}}) => (
                          <Autocomplete
                              id="animation_team"
                              onChange={(_, item) => {
                                onChange(item);
                              }}
                              value={value || null}
                              onInputChange={(event, newInputValue) => {
                                setqAnimationTeam(newInputValue.trim())
                              }}
                              options={animationTeams}
                              getOptionLabel={option => option.name}
                              isOptionEqualToValue={(option, value) => option.uid === value.uid}
                              fullWidth
                              disabled={isSubmitting}
                              renderInput={params => (
                                  <TextField
                                      {...params}
                                      label={t("animationTeam")}
                                      variant="filled"
                                      helperText={errors.animation_team?.message}
                                      error={!!errors.animation_team}
                                  />
                              )}
                          />
                      )}
                  />
                </Grid>
                <Grid container xs={12} md={6} lg={12} xl={12}>
                  <Grid xs={12} md={12} lg={2} xl={2}>
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{ mt: 1 }}
                        className="brSm"
                    >
                      {t("update")}
                    </Button>
                  </Grid>
                </Grid>
                <DevTool control={control} placement="top-right" />
              </Grid>
        }

      </Paper>
    </>
  );
};

export default ProviderUpdate;
