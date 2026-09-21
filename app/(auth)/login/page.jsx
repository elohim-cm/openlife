"use client";

import React, {useEffect, useState} from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormLabel,
  IconButton,
  InputAdornment,
  Link,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import {
  ArrowForward,
  EmailOutlined,
  HelpOutline,
  PhoneOutlined,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import NextLink from "next/link";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useTranslation} from "react-i18next";
import ActivityIndicator from "@/components/ActivityIndicator";
import IntlPhoneField from "@/components/IntlPhoneField";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import {useAppContext} from "@/contexts/appContext";
import AuthService from "@/services/AuthService";
import Habilitation from "@/services/Habilitation";
import {getUserAccess} from "@/services/accountService";
import {login} from "@/services/authServices";
import Routes from "@/utils/routes";
import {
  ACCESS_SELECTION_PAGE,
  DASHBOARD_PAGE,
  FORGOT,
  PASSWORD_RESET_PAGE,
} from "@/utils/routes/routes";

const LoginPage = () => {
  const router = useRouter();
  const context = useAppContext();
  const {t} = useTranslation();
  const [inProgress, setInProgress] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [userNameType, setUserNameType] = useState("email");
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginSchema = z.object({
    username: z.string().nonempty({message: t("youMustEnterYourUsername")}),
    password: z.string({invalid_type_error: t("enterACorrectPassword")}),
  });

  const {
    register,
    setValue,
    formState: {errors},
    handleSubmit,
  } = useForm({resolver: zodResolver(loginSchema)});
  const {onChange, onBlur, name, ref} = register("username");

  useEffect(() => {
    sessionStorage.removeItem("access-selection-reloaded");
  }, []);

  const ensurePhonePrefix = phone => {
    if (!phone.startsWith("+237")) return `+237${phone}`;
    return phone;
  };

  const handleResetDialogClose = () => {
    setInProgress(true);
    context.togglePageLoading(true);
    router.push(PASSWORD_RESET_PAGE(message));
    setResetDialogOpen(false);
  };

  const storeAuthenticatedUser = (responseData, username) => {
    const {
      access,
      email,
      first_name: firstName,
      image,
      last_name: lastName,
      phone,
      refresh_token: refreshToken,
      refresh_token_expired_at: refreshTokenExpiredAt,
      token,
      token_expired_at: tokenExpiredAt,
      uid,
    } = responseData;

    localStorage.setItem(
      "storedValues",
      JSON.stringify({
        firstName,
        lastName,
        uid,
        image,
        access,
        currentAccess: "",
        token,
        token_expired_at: tokenExpiredAt,
        refresh_token: refreshToken,
        refresh_token_expired_at: refreshTokenExpiredAt,
        language: "",
        authorizations: [],
        authCredentials: {email, phone},
      }),
    );

    if (username) localStorage.setItem("username", username);
  };

  const activateSingleAccess = async (access, token) => {
    const {uid: accessUid, role} = access;
    const accessData = await getUserAccess(accessUid, token);
    let storedValues = JSON.parse(localStorage.getItem("storedValues")) || {};

    localStorage.setItem("currentAccess", accessUid);
    storedValues = {
      ...storedValues,
      authorizations: accessData.authorizations,
      currentAccess: accessUid,
    };
    localStorage.setItem("storedValues", JSON.stringify(storedValues));

    const roleAuthorizations = await Habilitation.getHabilitationRole(token, role.uid, false);
    localStorage.setItem(
      "storedValues",
      JSON.stringify({...storedValues, role_authorizations: roleAuthorizations}),
    );

    setPageLoading(true);
    router.push(DASHBOARD_PAGE);
  };

  const onFormSubmit = async data => {
    setInProgress(true);
    setInvalidCredentials(false);

    try {
      const response = await login(data);
      const responseData = response.data.data;
      const {access, token} = responseData;

      storeAuthenticatedUser(responseData, data.username);

      if (responseData.first_connexion) {
        localStorage.setItem("username", responseData.email ?? ensurePhonePrefix(responseData.phone));
        setMessage(response.data.message);
        setResetDialogOpen(true);
        return;
      }

      if (access.length > 1) {
        setPageLoading(true);
        router.push(ACCESS_SELECTION_PAGE);
        return;
      }

      if (access.length === 1) {
        await activateSingleAccess(access[0], token);
        return;
      }

      setInvalidCredentials(true);
      setError(t("unAuthenticated"));
    } catch (requestError) {
      setInvalidCredentials(true);
      setError(requestError?.response?.data?.message || requestError.message);
    } finally {
      setInProgress(false);
      context.togglePageLoading(false);
    }
  };

  return (
    <>
      <Dialog
        open={resetDialogOpen}
        onClose={() => {}}
        aria-labelledby="password-reset-dialog-title"
        aria-describedby="password-reset-dialog-description">
        <DialogTitle id="password-reset-dialog-title">{t("passwordReset")}</DialogTitle>
        <DialogContent>
          <DialogContentText id="password-reset-dialog-description">
            {t("accountUpdatedSuccessfully")} <strong>{t("securityMessage")}</strong>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetDialogClose} autoFocus>
            {t("buttonText")}
          </Button>
        </DialogActions>
      </Dialog>

      <PageLoadingIndicator visible={pageLoading} />
      <ActivityIndicator visible={inProgress} />

      <Typography component="h1" className="login-card__title">
        {t("signToYourAccount")}
      </Typography>
      <Typography component="p" className="login-card__subtitle">
        {t("loginExperience.formSubtitle")}
      </Typography>

      {invalidCredentials && <Alert severity="error" className="login-card__alert">{error}</Alert>}

      <Box component="form" onSubmit={handleSubmit(onFormSubmit)} className="login-form">
        <FormControl component="fieldset" fullWidth>
          <FormLabel component="legend" id="utype-radio" className="login-mode__label">
            {t("connectionMode")}
          </FormLabel>
          <RadioGroup
            row
            aria-labelledby="utype-radio"
            name="usernameType"
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

        <Stack className="login-fields">
          <Box key={userNameType} className="login-fields__identity">
            {userNameType === "email" ? (
              <TextField
                id="username"
                label={`${t("emailAddress")}*`}
                onBlur={onBlur}
                name={name}
                inputRef={ref}
                onChange={onChange}
                autoComplete="username"
                error={Boolean(errors.username)}
                helperText={errors.username?.message || ""}
                fullWidth
              />
            ) : (
              <IntlPhoneField
                id="username"
                label={`${t("phoneNumber")}*`}
                onChange={value => setValue("username", value)}
                onBlur={onBlur}
                name={name}
                ref={ref}
                autoComplete="tel"
                error={Boolean(errors.username)}
                helperText={errors.username?.message || ""}
                fullWidth
              />
            )}
          </Box>

          <TextField
            id="password"
            label={`${t("password")}*`}
            {...register("password")}
            error={Boolean(errors.password)}
            helperText={errors.password?.message || ""}
            fullWidth
            autoComplete="current-password"
            type={showPassword ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? t("loginExperience.hidePassword") : t("loginExperience.showPassword")}
                    onClick={() => setShowPassword(current => !current)}
                    edge="end">
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        <Box className="login-form__forgot">
          <Link
            component={NextLink}
            href={FORGOT}
            variant="body2"
            underline="hover"
            onClick={() => setPageLoading(true)}>
            {t("forgotYourPassword")}
          </Link>
        </Box>

        <Button
          type="submit"
          fullWidth
          variant="contained"
          className="login-form__submit"
          endIcon={<ArrowForward />}>
          {t("signIn")}
        </Button>

        <Box className="login-card__footer">
          <Link href={Routes.SIMULER} underline="hover" className="login-card__simulation">
            {t("makeASimulation")}
          </Link>
          <Link href={Routes.FAQ} underline="hover" className="login-card__faq">
            <HelpOutline fontSize="small" />
            {t("loginExperience.consultFaq")}
          </Link>
        </Box>
      </Box>
    </>
  );
};

export default LoginPage;
