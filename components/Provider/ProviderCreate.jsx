"use client";

import React, {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
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
import {getToken} from "@/utils";
import validationSchema from "@/components/Provider/validationSchema";
import Autocomplete from "@mui/material/Autocomplete";
import {DevTool} from "@hookform/devtools";
import ProviderService from "@/services/ProviderService";
import Toast from "@/utils/toast";
import Routes from "@/utils/routes";
import {displayHttpError} from "@/utils/api";
import {PROVIDER_LIST} from "@/utils/routes/routes";
import DistributionAreaService from "@/services/DistributionAreaService";
import AnimationTeamService from "@/services/AnimationTeamService";
import providerService from "@/services/ProviderService";
import IntlPhoneField from "@/components/IntlPhoneField";
import {useTranslation} from "react-i18next";
import UtilMethods from "@/utils/UtilMethods";
import {useHabilitations} from "@/contexts/UtilsContext";

const ProviderCreate = () => {
  const {t} = useTranslation();
  const {sharedProviderData, setSharedProviderData} = useHabilitations();
  const [inProgress, setInProgress] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [providerNatures, setProviderNatures] = useState([]);
  const [providerNature, setProviderNature] = useState(null);
  const [animationTeams, setAnimationTeams] = useState([]);
  const [animationTeam, setAnimationTeam] = useState(null);
  const [genders, setGenders] = useState([]);
  const router = useRouter();
  const context = useAppContext();
  const token = getToken();

  //state for queryRequest
  const [qAnimationTeam, setqAnimationTeam] = useState("");

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
    getProviderNatures(1);
    getGenders();
  }, [getProviderNatures, getGenders]);
  useEffect(() => {
    getAnimationTeams(1, qAnimationTeam);
  }, [getAnimationTeams,qAnimationTeam]);

  const defaultValues = {
    code: "",
    firstname: "",
    lastname: "",
    phone: "",
    professional_email: "",
    adresse: "",
    gender: "",
    personal_email: "",
    provider_nature: "",
    contractual_status: "",
    animation_team: null,
  };

  //  form hook
  const {
    register,
    setValue,
    formState: {errors, isSubmitting, isValid},
    handleSubmit,
    control,
    watch,
  } = useForm({
    resolver: zodResolver(validationSchema(t)),
    defaultValues: defaultValues,
    mode: "all",
  });
  const {onChange: onChangePhone, onBlur: onBlurPhone, name: namePhone, ref: refPhone} = register("phone");

  useEffect(() => {
    if (sharedProviderData) {
      setValue("last_name", sharedProviderData.last_name || "");
      setValue("first_name", sharedProviderData.first_name || "");
      setValue("professional_email", sharedProviderData.email || "");

      const phone = UtilMethods.formatInternationalPhone(sharedProviderData.phone);
      console.log('[providercode] phone --> ', phone)
      setValue("phone", phone);
      
      setSharedProviderData(null);
    }
  }, [sharedProviderData, setValue, setSharedProviderData]);

  const providerNatureValue = watch("provider_nature");

  useEffect(() => {
    if (providerNatureValue) {
      if (providerNatureValue.label === "Salarié") {
        setValue("contractual_status", "WORK_CONTRACT", { shouldValidate: true });
      } else if (providerNatureValue.label === "Non salarié") {
          // If switching from Salarié to Non salarié, clear if it was WORK_CONTRACT or keep it if it's one of the non-salaried options
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

  const onSubmit = async data => {
    setInProgress(true);
    const postData = {
      ...data,
      firstname: data.first_name,
      lastname: data.last_name,
      providerNature: data.provider_nature,
    };
    const response = await ProviderService.create(token, postData);

    if (response.error === null) {
      Toast.success(t("contributorSuccessfullyCreated"));
      context.togglePageLoading(true);
      router.push(PROVIDER_LIST);
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
          {t("createNewContributor")}
        </Typography>
        <Grid container spacing={4}>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <TextField
              variant="filled"
              id="code"
              label={`${t("contributorCode")}*`}
              fullWidth
              error={!!errors.code}
              helperText={errors.code ? errors.code.message : ""}
              {...register("code")}
              disabled={isSubmitting}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <TextField
                variant="filled"
                id="url"
                label={`${t("lastName")}*`}
                fullWidth
                error={!!errors.last_name}
                helperText={errors.last_name ? errors.last_name.message : ""}
                {...register("last_name")}
                disabled={isSubmitting}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <TextField
              variant="filled"
              id="lable"
              label={`${t("firstName")}`}
              fullWidth
              error={!!errors.first_name}
              helperText={errors.first_name ? errors.first_name.message : ""}
              {...register("first_name")}
              disabled={isSubmitting}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <IntlPhoneField
                variant="filled"
                id="phone"
                value={watch("phone")}
                label={`${t("phoneNumber")}*`}
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
              variant="filled"
              id="professional_email"
              label={`${t("professionalEmail")}*`}
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
              <FormLabel id="gender">{t("gender")}*</FormLabel>
              <Controller
                name="gender"
                control={control}
                render={({field, fieldState}) => (
                  <RadioGroup row {...field}>
                    {genders.map(gender => {
                      return (
                        <FormControlLabel
                          key={gender.uid}
                          value={gender.uid}
                          control={<Radio />}
                          label={UtilMethods.gender(t)[gender.label]}
                        />
                      );
                    })}
                    {fieldState.error && <FormHelperText error>{fieldState.error.message}</FormHelperText>}
                  </RadioGroup>
                )}
              />
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
                  value={value}
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
                sx={{mt: 1}}
                className="brSm"
                disabled={!isValid}>
                {t("create")}
              </Button>
            </Grid>
          </Grid>
          <DevTool control={control} placement="top-right" />
        </Grid>
      </Paper>
    </>
  );
};

export default ProviderCreate;
