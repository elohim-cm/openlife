"use client";

import React, {useEffect, useState} from "react";
import {ArrowForward, EmailOutlined, PhoneOutlined} from "@mui/icons-material";
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Link,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from "@mui/material";
import NextLink from "next/link";
import {useRouter} from "next/navigation";
import {useTranslation} from "react-i18next";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import ActivityIndicator from "@/components/ActivityIndicator";
import IntlPhoneField from "@/components/IntlPhoneField";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import {useAppContext} from "@/contexts/appContext";
import {forgot} from "@/services/authServices";
import {LOGIN_PAGE, PASSWORD_RESET_PAGE} from "@/utils/routes/routes";
import Toast from "@/utils/toast";

const ResetPasswordPage = () => {
  const router = useRouter();
  const context = useAppContext();
  const {t} = useTranslation();
  const [inProgress, setInProgress] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [userNameType, setUserNameType] = useState("email");

  const validationSchema = z.object({
    username: z.string().nonempty({message: t("youMustEnterYourUsername")}),
  });

  const {
    register,
    setValue,
    formState: {errors},
    handleSubmit,
  } = useForm({resolver: zodResolver(validationSchema)});
  const {onChange, onBlur, name, ref} = register("username");

  useEffect(() => {
    sessionStorage.removeItem("access-selection-reloaded");
  }, []);

  const onSubmit = async data => {
    try {
      setInProgress(true);
      const result = await forgot(data, context);
      localStorage.setItem("username", data.username);
      Toast.success(result);
      setPageLoading(true);
      router.push(PASSWORD_RESET_PAGE(result));
    } catch (requestError) {
      Toast.error(requestError.message);
    } finally {
      setInProgress(false);
    }
  };

  return (
    <>
      <PageLoadingIndicator visible={pageLoading} />
      <ActivityIndicator visible={inProgress} />

      <Typography component="h1" className="login-card__title">
        {t("enterYourUsername")}
      </Typography>

      <Box component="form" onSubmit={handleSubmit(onSubmit)} className="login-form login-forgot-form">
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" id="forgot-username-type" className="login-mode__label">
            {t("connectionMode")}
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="forgot-username-type"
            name="forgotUsernameType"
            value={userNameType}
            className={`login-mode ${userNameType === "phone" ? "is-phone" : "is-email"}`}
            onChange={(event, value) => {
              setUserNameType(value);
              setValue("username", "");
            }}>
            <FormControlLabel
              value="email"
              className={userNameType === "email" ? "is-active" : ""}
              control={<Radio size="small" />}
              label={<><EmailOutlined fontSize="small" />{t("email")}</>}
              title={t("email")}
            />
            <FormControlLabel
              value="phone"
              className={userNameType === "phone" ? "is-active" : ""}
              control={<Radio size="small" />}
              label={<><PhoneOutlined fontSize="small" />{t("loginExperience.phone")}</>}
              title={t("loginExperience.phone")}
            />
          </RadioGroup>
        </FormControl>

        <Box key={userNameType} className="login-fields__identity">
          {userNameType === "email" ? (
            <TextField
              fullWidth
              id="username"
              label={`${t("emailAddress")}*`}
              onBlur={onBlur}
              name={name}
              inputRef={ref}
              onChange={onChange}
              error={Boolean(errors.username)}
              helperText={errors.username?.message || ""}
              autoComplete="username"
              autoFocus
            />
          ) : (
            <IntlPhoneField
              fullWidth
              id="username"
              label={`${t("phoneNumber")}*`}
              onChange={value => setValue("username", value)}
              onBlur={onBlur}
              name={name}
              ref={ref}
              error={Boolean(errors.username)}
              helperText={errors.username?.message || ""}
              autoComplete="tel"
            />
          )}
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          className="login-form__submit"
          endIcon={<ArrowForward />}>
          {t("receiveTheCode")}
        </Button>
        <Link
          component={NextLink}
          href={LOGIN_PAGE}
          underline="hover"
          className="login-forgot-form__back"
          onClick={() => setPageLoading(true)}>
          {t("backToLogin")}
        </Link>
      </Box>
    </>
  );
};

export default ResetPasswordPage;
