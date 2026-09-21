"use client";

import {Box, Button, FormControl, FormHelperText, Input, InputLabel, Paper, TextField, Typography} from "@mui/material";
import {z} from "zod";
import {
  emptyEmailErrorMessage,
  emptyFirstNameErrorMessage,
  emptyLastNameErrorMessage,
  emptyPhoneNumberErrorMessage,
  invalidPhoneNumberErrorMessage,
  maxPhoneNumberErrorMessage,
  minPhoneNumberErrorMessage,
} from "@/utils/literals/globalLiterals";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Grid from "@mui/material/Unstable_Grid2";
import {createAccount} from "@/services/accountService";
import styles from "@/styles/sysCompte.module.scss";
import {ACCOUNT_LISTING_PAGE} from "@/utils/routes/routes";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import React, {useState} from "react";
import Toast from "@/utils/toast";
import {useAppContext} from "@/contexts/appContext";
import ActivityIndicator from "@/components/ActivityIndicator";
import Patterns from "@/utils/Patterns";
import AccountService from "@/services/Account";
import {canInterprateError, displayHttpError} from "@/utils/api";
import Alert from "@mui/material/Alert";
import {useTranslation} from "react-i18next";
import IntlPhoneField from "@/components/IntlPhoneField";

const AccountCreate = () => {
  const [inProgress, setInProgress] = React.useState(false);
  const [_errors, setErrors] = useState([]);
  const {t} = useTranslation();
  //  token
  const {token} = JSON.parse(localStorage.getItem("storedValues") || {})  || {};

  const validationSchema = z.object({
    first_name: z
      .string({
        required_error: emptyFirstNameErrorMessage(t),
        invalid_type_error: t("firstNameMustBeACharacterString"),
      })
      .nullable(),

    last_name: z
      .string({
        required_error: emptyLastNameErrorMessage(t),
        invalid_type_error: t("nameMustBeAString"),
      })
      .nonempty({
        message: emptyLastNameErrorMessage(t),
      }),

    email: z
      .string({
        required_error: emptyEmailErrorMessage(t),
        invalid_type_error: t("emailAddressMustBeString"),
      })
      .nonempty({
        message: emptyEmailErrorMessage(t),
      })
      .email({
        message: t("enterACorrectEmailAddress"),
      }),

    phone: z.string().nonempty("Le champ Numéro de téléphone ne peut pas être vide"),
  });

  // router
  const router = useRouter();
  const context = useAppContext();

  // form hook
  const {
    register,
      setValue,
    formState: {errors},
    handleSubmit,
    watch,
  } = useForm({
    resolver: zodResolver(validationSchema),
  });
  const {onChange: onChangePhone, onBlur: onBlurPhone, name: namePhone, ref: refPhone} = register("phone");

  const [previewImage, setPreviewImage] = React.useState(null);
  const [file, setFile] = React.useState(undefined);

  const handlePictureChange = e => {
    const _file = e.target.files[0];
    setFile(_file);
    if (_file) {
      setPreviewImage(URL.createObjectURL(_file));
    }
  };

  const onSubmit = async data => {
    setInProgress(true);

    try {
      const formData = new FormData();
      formData.append("first_name", data.first_name);
      formData.append("last_name", data.last_name);
      formData.append("email", data.email);
      formData.append("phone", data.phone);

      console.log(file);
      // Check if the "picture" field is present and append it to FormData
      if (file !== undefined) {
        formData.append("picture", file);
      }
      const result = await AccountService.create(token, formData, setErrors);

      if (result.error == null) {
        Toast.success(t("accountCreatedSuccessfully"));
        context.togglePageLoading(true);
        router.push(ACCOUNT_LISTING_PAGE);
      } else {
        displayHttpError(result.error, router);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setInProgress(false);
    }
  };

  return (
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
      <Paper elevation={3} sx={{borderRadius: 2, padding: "40px 24px", mb: 4, position: "relative"}}>
        <ActivityIndicator visible={inProgress} />
        <Typography variant="h5" component="h5" sx={{mb: 3}}>
          {t("createANewAccount")}
        </Typography>
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              {_errors.length > 0 && (
                <Alert severity="error">
                  <ul>
                    {_errors.map((error, key) => (
                      <li key={key}>{error}</li>
                    ))}
                  </ul>
                </Alert>
              )}
            </Grid>
            <Grid xs={12} md={6} lg={4} xl={4}>
              <TextField
                variant="filled"
                type="text"
                id="last_name"
                label={`${t("lastName")}*`}
                {...register("last_name")}
                error={errors.last_name && true}
                helperText={errors.last_name ? errors.last_name.message : ""}
                sx={{width: "100%"}}
                className={styles.myInput}
              />
            </Grid>
            <Grid xs={12} md={6} lg={4} xl={4}>
              <TextField
                variant="filled"
                type="text"
                id="first_name"
                label={`${t("firstName")}`}
                {...register("first_name")}
                error={errors.first_name && true}
                helperText={errors.first_name ? errors.first_name.message : ""}
                sx={{width: "100%"}}
                className={styles.myInput}
              />
            </Grid>
            <Grid xs={12} md={6} lg={4} xl={4}>
              <TextField
                variant="filled"
                type="email"
                id="email"
                label={`${t("emailAddress")}*`}
                {...register("email")}
                error={errors.email && true}
                helperText={errors.email ? errors.email.message : ""}
                sx={{width: "100%"}}
                className={styles.myInput}
              />
            </Grid>
            <Grid xs={12} md={6} lg={4} xl={4}>
              {/*<TextField
                variant="filled"
                type="number"
                id="phone"
                label={`${t("phoneNumber")}*`}
                {...register("phone")}
                error={errors.phone && true}
                helperText={errors.phone ? errors.phone.message : ""}
                sx={{width: "100%"}}
                className={styles.myInput}
              />*/}
              <IntlPhoneField
                  variant="filled"
                  id="phone"
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
            <Grid item xs={12} md={6} lg={4} xl={4}>
              <TextField
                variant="filled"
                type="file"
                id="picture"
                label={`${t("chooseAPhoto")}`}
                {...register("picture")}
                onChange={e => {
                  handlePictureChange(e);
                }}
                error={errors.picture && true}
                helperText={errors.picture ? errors.picture.message : ""}
                InputLabelProps={{shrink: true}}
                className={styles.myInput}
                sx={{width: "100%"}}
                inputProps={{ accept: "image/jpeg, image/jpg, image/png" }}
              />
            </Grid>
            {previewImage && (
              <Grid item xs={12} md={6} lg={4} xl={4}>
                <img
                  src={previewImage}
                  alt="Selected Preview"
                  style={{
                    width: "100%",
                    marginTop: "10px",
                    height: "200px",
                    objectPosition: "center",
                    objectFit: "cover",
                  }}
                />
              </Grid>
            )}
          </Grid>
          <Grid container>
            <Grid xs={12} md={3} lg={2} xl={2}>
              <Button type="submit" fullWidth variant="contained" size="large" sx={{mt: 3, mb: 2}}>
                {t("create")}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </>
  );
};

export default AccountCreate;
