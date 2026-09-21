"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography,
  Skeleton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ChatIcon from "@mui/icons-material/Chat";
import EmailIcon from "@mui/icons-material/Email";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import SecurityIcon from "@mui/icons-material/Security";
import {MuiOtpInput} from "mui-one-time-password-input";
import {useTranslation} from "react-i18next";
import moment from "moment";
import {getToken} from "@/utils";
import Toast from "@/utils/toast";
import TwoFactor from "@/services/TwoFactor";
import PasswordConfirmDialog from "@/components/TwoFactor/PasswordConfirmDialog";
import {useTwoFactorCompliance} from "@/contexts/TwoFactorComplianceContext";

const METHOD_LABELS = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
  totp: "Authenticator app",
};

const METHOD_ICONS = {
  email: EmailIcon,
  sms: PhoneAndroidIcon,
  whatsapp: ChatIcon,
  totp: SecurityIcon,
};

export default function TwoFactorSettings() {
  const {t} = useTranslation();
  const token = getToken();
  const {compliance, refresh: refreshCompliance} = useTwoFactorCompliance();
  const passwordConfirmRef = useRef(null);
  // Conserve brièvement le mot de passe déjà confirmé pour le setup TOTP en
  // cours, afin de ne pas le redemander lors du nettoyage automatique d'un
  // secret non confirmé (annulation) qui fait partie de la même action.
  const pendingSetupPasswordRef = useRef(null);

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [setupOpen, setSetupOpen] = useState(false);
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [confirmCode, setConfirmCode] = useState("");

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const result = await TwoFactor.getSettings(token);
      if (result.error == null) {
        setSettings(result.data);
      } else {
        Toast.error(t("Unable to load your two-factor settings."));
      }
    } catch (error) {
      Toast.error(t("Unable to load your two-factor settings."));
    } finally {
      setLoading(false);
    }
  }, [token, t]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleMethodChange = method => {
    // Toute activation/modification de la 2FA doit être précédée d'une
    // confirmation du mot de passe actuel.
    passwordConfirmRef.current.open(async currentPassword => {
      if (method === "totp") {
        // Le TOTP ne peut être activé qu'après avoir scanné le QR code et confirmé un code.
        setSaving(true);
        const result = await TwoFactor.setupTotp(token, currentPassword);
        setSaving(false);
        if (result.error == null) {
          pendingSetupPasswordRef.current = currentPassword;
          setSecret(result.data.secret);
          setQrCode(result.data.qr_code_svg);
          setConfirmCode("");
          setSetupOpen(true);
        } else {
          throw result.error;
        }
        return;
      }

      setSaving(true);
      const result = await TwoFactor.updateMethod(token, method, currentPassword);
      setSaving(false);
      if (result.error == null) {
        Toast.success(t("Two factor method updated successfully."));
        loadSettings();
        refreshCompliance();
      } else {
        throw result.error;
      }
    });
  };

  const handleConfirmTotp = async () => {
    if (confirmCode.length < 6) {
      Toast.warn(t("Provide Two-Factor OTP"));
      return;
    }
    setSaving(true);
    const result = await TwoFactor.confirmTotp(token, confirmCode);
    setSaving(false);
    if (result.error == null) {
      Toast.success(t("Two factor authentication app enabled successfully."));
      pendingSetupPasswordRef.current = null;
      setSetupOpen(false);
      loadSettings();
      refreshCompliance();
    } else {
      Toast.error(result.error?.response?.data?.message ?? t("Invalid code."));
    }
  };

  const handleCancelSetup = async () => {
    setSetupOpen(false);
    // Le secret non confirmé reste enregistré tant qu'on ne relance pas un setup
    // ou qu'on ne choisit pas explicitement un autre canal ; ça n'active rien tant
    // que confirmTotp n'a pas été appelé. Ce nettoyage réutilise le mot de passe
    // déjà confirmé pour le setup en cours plutôt que de le redemander.
    if (pendingSetupPasswordRef.current) {
      await TwoFactor.disableTotp(token, pendingSetupPasswordRef.current);
      pendingSetupPasswordRef.current = null;
    }
    loadSettings();
  };

  const handleDisable = () => {
    // La 2FA obligatoire (règle utilisateur/rôle/permission ou politique
    // globale) ne doit pas pouvoir être désengagée par l'utilisateur
    // lui-même — sans quoi l'obligation n'aurait aucune portée réelle. Le
    // backend applique déjà ce refus (voir disableBlockedReason côté API),
    // mais on l'anticipe ici pour ne pas faire redemander le mot de passe
    // pour rien, et pour ne pas afficher l'erreur comme si c'était le mot
    // de passe qui était en cause.
    if (compliance?.required) {
      Toast.error(t("You can't disable two-factor authentication: it has been made mandatory for your account."));
      return;
    }

    passwordConfirmRef.current.open(async currentPassword => {
      setSaving(true);
      const result = await TwoFactor.disable(token, currentPassword);
      setSaving(false);
      if (result.error == null) {
        Toast.success(t("Two-factor authentication disabled successfully."));
        loadSettings();
        refreshCompliance();
      } else {
        throw result.error;
      }
    });
  };

  const handleRevokeDevice = async uid => {
    setSaving(true);
    const result = await TwoFactor.revokeDevice(token, uid);
    setSaving(false);
    if (result.error == null) {
      Toast.success(t("Trusted device revoked successfully."));
      loadSettings();
    } else {
      Toast.error(t("Unable to revoke this device."));
    }
  };

  const handleRevokeAllDevices = async () => {
    setSaving(true);
    const result = await TwoFactor.revokeAllDevices(token);
    setSaving(false);
    if (result.error == null) {
      Toast.success(t("All trusted devices revoked successfully."));
      loadSettings();
    } else {
      Toast.error(t("Unable to revoke your trusted devices."));
    }
  };

  const availableMethods = settings?.available_methods ?? [];
  const trustedDevices = settings?.trusted_devices ?? [];

  if (loading || !settings) {
    return (
      <Card sx={{mt: 3}}>
        <CardContent>
          <Stack spacing={2}>
            <Skeleton variant="text" width="45%" height={34} />
            <Skeleton variant="text" width="75%" />
            <Stack spacing={1} sx={{mt: 1}}>
              {[1, 2, 3, 4].map(item => (
                <Skeleton key={item} variant="rounded" width="70%" height={42} />
              ))}
            </Stack>
            <Skeleton variant="rectangular" height={1} sx={{my: 2}} />
            <Skeleton variant="text" width="35%" height={30} />
            <Skeleton variant="text" width="80%" />
            <Skeleton variant="rounded" width="100%" height={48} />
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{mt: 3}}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {t("Two-factor authentication")}
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {t("Choose how you want to receive your verification code.")}
        </Typography>

        <Stack
          direction={{xs: "column", sm: "row"}}
          spacing={2}
          sx={{mt: 2, flexWrap: "wrap"}}
        >
          {availableMethods.map(method => {
            const Icon = METHOD_ICONS[method] ?? SecurityIcon;
            const isTotpUnconfigured = method === "totp" && !settings.totp_confirmed;
            const isSelected = settings.method === method && !isTotpUnconfigured;
            const label = t(METHOD_LABELS[method] ?? method);

            return (
              <Card
                key={method}
                variant="outlined"
                sx={{
                  flex: {sm: "1 1 0"},
                  minWidth: {sm: 170},
                  borderRadius: 3,
                  borderWidth: 1,
                  borderColor: isSelected ? "text.primary" : "divider",
                  backgroundColor: isSelected ? "grey.50" : "background.paper",
                  boxShadow: isSelected ? "0 2px 10px rgba(15, 23, 42, 0.08)" : "none",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
                  opacity: saving ? 0.65 : 1,
                  "&:hover": saving ? {} : {
                    borderColor: "text.secondary",
                    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)",
                    transform: "translateY(-1px)",
                  },
                }}
              >
                <CardActionArea onClick={() => !saving && handleMethodChange(method)} disabled={saving}>
                  <CardContent sx={{position: "relative", minHeight: 118, p: 2.5}}>
                    {isSelected && (
                      <CheckCircleIcon
                        sx={{position: "absolute", top: 14, right: 14, color: "text.primary", fontSize: 20}}
                      />
                    )}
                    <Icon
                      sx={{
                        fontSize: 30,
                        mb: 1.5,
                        color: isSelected ? "text.primary" : "text.secondary",
                      }}
                    />
                    <Typography fontWeight={600} color="text.primary">
                      {label}
                    </Typography>
                    {isTotpUnconfigured && (
                      <Typography variant="caption" color="text.secondary">
                        {t("not configured")}
                      </Typography>
                    )}
                  </CardContent>
                </CardActionArea>
              </Card>
            );
          })}
        </Stack>

        {!settings.method && (
          <Alert severity="info" sx={{mt: 2}}>
            {t("No method selected yet: a code will be sent by both email and SMS.")}
          </Alert>
        )}

        {(settings.method || settings.totp_confirmed) && (
          <Box sx={{mt: 2}}>
            {compliance?.required ? (
              <Alert severity="info">
                {t("Two-factor authentication has been made mandatory for your account by an administrator — you can't disable it yourself.")}
              </Alert>
            ) : (
              <Button size="small" color="error" variant="outlined" onClick={handleDisable} disabled={saving}>
                {t("Disable two-factor authentication")}
              </Button>
            )}
          </Box>
        )}

        <Divider sx={{my: 3}} />

        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 1}}>
          <Typography variant="h6">{t("Trusted devices")}</Typography>
          {trustedDevices.length > 0 && (
            <Button size="small" color="error" onClick={handleRevokeAllDevices} disabled={saving}>
              {t("Revoke all")}
            </Button>
          )}
        </Stack>
        <Alert severity="info" sx={{mb: 2}}>
          {t("A device you mark as trusted won't ask for a code again for {{days}} days.", {
            days: settings.trusted_device_days,
          })}
        </Alert>

        {trustedDevices.length === 0 ? (
          <Alert severity="info" variant="outlined" sx={{mt: 1}}>
            {t("No trusted device yet.")}
          </Alert>
        ) : (
          <List dense>
            {trustedDevices.map(device => (
              <ListItem key={device.uid} divider>
                <ListItemText
                  primary={device.label || t("Unknown device")}
                  secondary={t("Last used: {{date}} · Expires: {{expiry}}", {
                    date: device.last_used_at ? moment(device.last_used_at).format("DD/MM/YYYY HH:mm") : "-",
                    expiry: moment(device.expires_at).format("DD/MM/YYYY HH:mm"),
                  })}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" onClick={() => handleRevokeDevice(device.uid)} disabled={saving}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        )}
      </CardContent>

      <Dialog open={setupOpen} onClose={handleCancelSetup} maxWidth="xs" fullWidth>
        <DialogTitle>{t("Set up your authenticator app")}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t("Scan this QR code with Google Authenticator, Authy or any compatible app, then enter the 6-digit code it generates.")}
          </DialogContentText>
          {qrCode && (
            <Box sx={{display: "flex", justifyContent: "center", my: 2}}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCode} alt="QR code TOTP" width={200} height={200} />
            </Box>
          )}
          {secret && (
            <Typography variant="caption" display="block" textAlign="center" sx={{mb: 2}}>
              {t("Can't scan the code? Enter this key manually:")} <Chip label={secret} size="small" />
            </Typography>
          )}
          <MuiOtpInput value={confirmCode} onChange={setConfirmCode} length={6} />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelSetup}>{t("Cancel")}</Button>
          <Button variant="contained" onClick={handleConfirmTotp} disabled={saving}>
            {t("Confirm")}
          </Button>
        </DialogActions>
      </Dialog>

      <PasswordConfirmDialog ref={passwordConfirmRef} />
    </Card>
  );
}
