"use client";

import React, {useEffect, useState} from "react";
import {Alert, Box, Button, IconButton, InputAdornment, Link, TextField, Typography} from "@mui/material";
import {ArrowForward, ReplayRounded, Visibility, VisibilityOff} from "@mui/icons-material";
import NextLink from "next/link";
import {useRouter} from "next/navigation";
import {useTranslation} from "react-i18next";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import ActivityIndicator from "@/components/ActivityIndicator";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import {useAppContext} from "@/contexts/appContext";
import AuthService from "@/services/AuthService";
import {passwordReset, resendTokenCode} from "@/services/authServices";
import {
  emptyConfirmPasswordMessage,
  emptyPasswordMessage,
  emptyPasswordResetTokenMessage,
  incorrectPasswordMessage,
  minPassworLengthdMessage,
  passwordDontMatchMessage,
} from "@/utils/literals/globalLiterals";
import {LOGIN_PAGE} from "@/utils/routes/routes";
import Toast from "@/utils/toast";

const NewPasswordPage = () => {
  const router = useRouter();
  const context = useAppContext();
  const {t} = useTranslation();
  const [inProgress, setInProgress] = useState(false);
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);

  const validationSchema = z.object({
    token: z.string().nonempty({message: emptyPasswordResetTokenMessage(t)}),
    password: z.string()
      .nonempty({message: emptyPasswordMessage(t)})
      .min(6, minPassworLengthdMessage(t))
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/, incorrectPasswordMessage(t)),
    confirmPassword: z.string()
      .nonempty({message: emptyConfirmPasswordMessage(t)})
      .min(6, minPassworLengthdMessage(t))
      .regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{6,}$/, incorrectPasswordMessage(t)),
  }).refine(data => data.password === data.confirmPassword, {
    message: passwordDontMatchMessage(t),
    path: ["confirmPassword"],
  });

  useEffect(() => {
    sessionStorage.removeItem("access-selection-reloaded");
    const queryMessage = new URLSearchParams(window.location.search).get("msg");
    setMessage(queryMessage || "");
    setUsername(localStorage.getItem("username") || "");
  }, []);

  const {register, formState: {errors}, handleSubmit} = useForm({resolver: zodResolver(validationSchema)});

  const onSubmit = async data => {
    try {
      setInProgress(true);
      const result = await passwordReset(data);
      Toast.success(result);
      setPageLoading(true);
      router.push(LOGIN_PAGE);
    } catch (requestError) {
      AuthService.formatFetchErrorMsgAndLogout(requestError.message, context, router);
    } finally {
      setInProgress(false);
    }
  };

  const handleResendCode = async event => {
    event.preventDefault();
    try {
      setPageLoading(true);
      const result = await resendTokenCode(username, context);
      Toast.success(result);
    } catch (requestError) {
      AuthService.formatFetchErrorMsgAndLogout(requestError.message, context, router);
    } finally {
      setPageLoading(false);
    }
  };

  return (
    <>
      <PageLoadingIndicator visible={pageLoading} />
      <ActivityIndicator visible={inProgress} />

      <Typography component="h1" className="login-card__title">{t("changePassword")}</Typography>
      {message && <Alert severity="info" className="login-card__alert">{message}</Alert>}

      <Box component="form" onSubmit={handleSubmit(onSubmit)} className="login-form login-reset-form">
        <TextField
          fullWidth
          id="token"
          label={`${t("resetCode")} *`}
          {...register("token")}
          error={Boolean(errors.token)}
          helperText={errors.token?.message || ""}
          autoComplete="one-time-code"
          autoFocus
        />
        <TextField
          fullWidth
          id="password"
          label={`${t("newPassword")} *`}
          {...register("password")}
          error={Boolean(errors.password)}
          helperText={errors.password?.message || ""}
          autoComplete="new-password"
          type={showPassword ? "text" : "password"}
          InputProps={{endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={showPassword ? t("loginExperience.hidePassword") : t("loginExperience.showPassword")}
                onClick={() => setShowPassword(current => !current)}>
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          )}}
        />
        <TextField
          fullWidth
          id="confirm_password"
          label={`${t("confirmNewPassword")} *`}
          {...register("confirmPassword")}
          error={Boolean(errors.confirmPassword)}
          helperText={errors.confirmPassword?.message || ""}
          autoComplete="new-password"
          type={showConfirmPassword ? "text" : "password"}
          InputProps={{endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={showConfirmPassword ? t("loginExperience.hidePassword") : t("loginExperience.showPassword")}
                onClick={() => setShowConfirmPassword(current => !current)}>
                {showConfirmPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          )}}
        />

        <Button type="submit" fullWidth variant="contained" className="login-form__submit" endIcon={<ArrowForward />}>
          {t("changeMyPassword")}
        </Button>
        <Button
          type="button"
          fullWidth
          variant="contained"
          className="login-reset-form__resend"
          startIcon={<ReplayRounded />}
          disabled={inProgress || pageLoading}
          onClick={handleResendCode}>
          {t("sendResetCode")}
        </Button>
        <Link
          component={NextLink}
          href={LOGIN_PAGE}
          underline="hover"
          className="login-reset-form__back"
          onClick={() => setPageLoading(true)}>
          {t("returnToLogin")}
        </Link>
      </Box>
    </>
  );
};

export default NewPasswordPage;
