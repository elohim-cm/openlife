"use client";

import {Box, Button, Paper, TextField, Typography} from "@mui/material";
import {z} from "zod";
import {
  emptyEmailErrorMessage,
  emptyFirstNameErrorMessage,
  emptyLastNameErrorMessage,
} from "@/utils/literals/globalLiterals";
import {useRouter} from "next/navigation";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Grid from "@mui/material/Unstable_Grid2";
import styles from "@/styles/sysCompte.module.scss";
import {ACCOUNT_LISTING_PAGE} from "@/utils/routes/routes";
import React, {useCallback, useEffect, useRef, useState} from "react";
import Toast from "@/utils/toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import ActivityIndicator from "@/components/ActivityIndicator";
import {useAppContext} from "@/contexts/appContext";
import AccountService from "@/services/Account";
import {displayHttpError} from "@/utils/api";
import Skeleton from "@mui/material/Skeleton";
import ImageUpload from "@/components/Account/ImageUpload";
import {getUid} from "@/utils";
import IntlPhoneField from "@/components/IntlPhoneField";
import {useTranslation} from "react-i18next";
import Autocomplete from "@mui/material/Autocomplete";
import {DevTool} from "@hookform/devtools";
import UtilMethods from "@/utils/UtilMethods";
import TwoFAModal from "@/components/TwoFAModal";

const AccountUpdate = () => {
  const [account, setAccount] = useState({});
  const [accountUid, setAccountUid] = useState("");
  const [accountFirstName, setAccountFirstName] = useState("");
  const [accountLastName, setAccountLastName] = useState("");
  const [accountEmail, setAccountEmail] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const {token, authCredentials, image, email} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const [previewImg, setPreviewImg] = useState(undefined);
  const [imageFile, setImageFile] = useState(undefined);
  const [pendingData, setPendingData] = useState(null);
  const {t} = useTranslation();

  const twoFaRef = useRef(null);

  const statuses = [{label: "active"}, {label: "inactive"}];

// validation schema
  const validationSchema = z
      .object({
        first_name: z
            .string({
              required_error: emptyFirstNameErrorMessage,
              invalid_type_error: t("theNameMustBeAString"),
            })
            .nonempty({
              message: emptyFirstNameErrorMessage,
            }),

        last_name: z
            .string({
              required_error: emptyLastNameErrorMessage,
              invalid_type_error: t("theFirstNameMustBeAString"),
            })
            .nonempty({
              message: emptyLastNameErrorMessage,
            }),

        email: z
            .string({
              required_error: emptyEmailErrorMessage,
              invalid_type_error: t("theEmailMustBeAString"),
            })
            .nonempty({
              message: emptyEmailErrorMessage,
            })
            .email({
              message: t("provideAValidEmail"),
            }),
        phone:  z.string().optional().nullable(),
        status: z.preprocess((val) => (val !== undefined && val !== null ? val.label : ''), z.string().optional()),
      })

  const context = useAppContext();
    const [record, setRecord] = useState(undefined);


    const getAccount = useCallback(async () => {
    const result = await AccountService.show(token, getUid());
    if (!result.error) {
      setAccount(result.data);
      setAccountUid(result.data.uid);
      setAccountFirstName(result.data.first_name);
      setAccountLastName(result.data.last_name);
      setAccountEmail(result.data.email);
      setAccountPhone(result.data.phone);
      setImageFile(result.data.image);
      setPreviewImg(result.data.image);
      setRecord(result.data)
      // setSelectedStatus(result.data.status);
        const status = statuses.find(status => status.label === result.data.status)
      setValue('status', status)
      /*if(result.data.email === email){
        setImageFile(image)
        setPreviewImg(image)
      }*/
      setReady(true);
    } else {
      displayHttpError(result.error, router);
    }
  }, [token, router]);

  useEffect(() => {
    getAccount();
  }, [getAccount]);

  // form hook
  const {
    register,
    formState: {errors, isSubmitting, isValid},
    setValue,
    handleSubmit,
    control,
  } = useForm({
    resolver: zodResolver(validationSchema),
  });
  const {onChange: onChangePhone, onBlur: onBlurPhone, name: namePhone, ref: refPhone} = register("phone");

  // on form submission
  const onSubmit = async (data, otp = null, trustDevice = false) => {
    setInProgress(true);

    const validated = await validateForm(data);
    if (!validated) {
      return;
    }

    const result = await AccountService.update(token, getUid(), data, otp, trustDevice);

    twoFaRef.current.toggleLoader(false);
    if(result.error && result.error.response.status === 403 && result.error.response.data.two_step) {
      Toast.warn(result.error.response.data.message);
      setPendingData(data);
      twoFaRef.current.open(result.error.response.data.data, "notif_infos", result.error.response.data.method, result.error.response.data.available_methods);
      return;
    }

    twoFaRef.current.close();
    if (result.error == null) {
      Toast.success(t("accountUpdatedSuccessfully"));
      context.togglePageLoading(true);
      router.push(ACCOUNT_LISTING_PAGE);
    } else {
      displayHttpError(result.error, router);
    }
    setInProgress(false);
  };

  const validateForm = async (data) => {
    const result = await AccountService.validateUpdate(token, getUid(), data);
    if (result.error == null) {
      return true;
    } else {
      displayHttpError(result.error, router);
    }
    setInProgress(false);
    return false;
  };

  return (
    <>
      {account === undefined ? (
        <CreateFormSkeleton />
      ) : (
        <>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            color="secondary"
            onClick={() => {
              context.togglePageLoading(true);
              router.back();
            }}
            sx={{mb: 2}}>
            {t("back")}
          </Button>
          <Paper elevation={3} sx={{borderRadius: 2, padding: "40px 24px", mb: 3, position: "relative"}}>
            <ActivityIndicator visible={inProgress} />
            <Typography variant="h5" component="h5" sx={{mb: 3}}>
              {t("accountUpdate")}
            </Typography>
            {ready ? (
              <Box component="form" onSubmit={handleSubmit(data => onSubmit(data))}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}  style={{display:'flex', justifyContent:'center'}}>
                    <ImageUpload
                        account={account}
                        previewImage={previewImg}
                        onPreviewImage={(preview) => setPreviewImg(preview)}
                        onChangeFile={(file) =>setImageFile(file)}
                        authEmail={accountEmail}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                      <Grid item xs={12} md={12} lg={12} xl={12}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} md={6}>
                            <TextField
                                variant="filled"
                                type="text"
                                id="last_name"
                                label={`${t("lastName")}`}
                                {...register("last_name")}
                                error={errors.last_name && true}
                                helperText={errors.last_name ? errors.last_name.message : ""}
                                sx={{width: "100%"}}
                                InputLabelProps={{shrink: true}}
                                className={styles.myInput}
                                defaultValue={account.last_name}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                                variant="filled"
                                type="text"
                                id="first_name"
                                label={`${t("firstName")}`}
                                {...register("first_name")}
                                error={errors.first_name && true}
                                helperText={errors.first_name ? errors.first_name.message : ""}
                                sx={{width: "100%"}}
                                InputLabelProps={{shrink: true}}
                                className={styles.myInput}
                                value={accountFirstName}
                                onChange={e => setAccountFirstName(e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <TextField
                                variant="filled"
                                type="email"
                                id="email"
                                label={`${t("emailAddress")}`}
                                {...register("email")}
                                error={errors.email && true}
                                helperText={errors.email ? errors.email.message : ""}
                                sx={{width: "100%"}}
                                InputLabelProps={{shrink: true}}
                                className={styles.myInput}
                                defaultValue={account.email}
                            />
                          </Grid>
                          <Grid item xs={12} md={6}>
                            <IntlPhoneField
                                variant="filled"
                                id="phone"
                                label={`${t("phoneNumber")}`}
                                fullWidth
                                value={accountPhone ?? ""}
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
                            {!UtilMethods.check(record) && <Grid item xs={12} md={6} style={{width: "300px"}}>
                                <Controller
                                    style={{width: "100%"}}
                                    name="status"
                                    control={control}
                                    render={({field: {onChange, value}}) => (
                                        <Autocomplete
                                            id="status"
                                            onChange={(_, item) => {
                                                onChange(item);
                                            }}
                                            value={value}
                                            options={statuses}
                                            getOptionLabel={option => `${option.label || ''}`}
                                            isOptionEqualToValue={(option, value) => option.label === value.label}
                                            fullWidth
                                            disabled={isSubmitting}
                                            renderInput={params => (
                                                <TextField
                                                    {...params}
                                                    label={t("status")}
                                                    variant="filled"
                                                    helperText={errors.status?.message}
                                                    error={!!errors.status}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </Grid>}
                        </Grid>
                      </Grid>

                    <Grid item xs={12} md={12} lg={12} xl={12}>
                        <Grid container spacing={4} style={{display: "flex", justifyContent: "flex-start"}}>
                          <Grid item xs={12} md={3} lg={2} xl={2}>
                            <Button type="submit" fullWidth variant="contained" size="large" sx={{mt: 3, mb: 2}}>
                              {t('update')}
                            </Button>
                          </Grid>
                        </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              <Box>
                <Grid container spacing={2}>
                  <Grid xs={12} md={6} lg={4} xl={4}>
                    <Skeleton variant="rectangular" height={69} />
                  </Grid>
                  <Grid xs={12} md={6} lg={4} xl={4}>
                    <Skeleton variant="rectangular" height={69} />
                  </Grid>
                  <Grid xs={12} md={6} lg={4} xl={4}>
                    <Skeleton variant="rectangular" height={69} />
                  </Grid>
                  <Grid xs={12} md={6} lg={4} xl={4}>
                    <Skeleton variant="rectangular" height={69} />
                  </Grid>
                  <Grid xs={12} md={6} lg={4} xl={4}>
                    <Skeleton variant="rectangular" height={69} />
                  </Grid>
                </Grid>
                <Grid container>
                  <Grid xs={12} md={3} lg={2} xl={2}>
                    <Skeleton variant="rectangular" height={38} sx={{mt: 3, mb: 2}} />
                  </Grid>
                </Grid>
              </Box>
            )}

            <DevTool control={control} placement="top-right" />
            <TwoFAModal
              ref={twoFaRef}
              title={t("Two-Factor Authentification")}
              content={t("A Two-Factor OTP has been sent to the user by email/sms.")}
              allowTrustDevice
              onCancel={() => setInProgress(false)}
              onContinue={(otp, trustDevice) => onSubmit(pendingData, otp, trustDevice)}/>
          </Paper>
        </>
      )}
    </>
  );
};

export default AccountUpdate;
