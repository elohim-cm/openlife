"use client";

import React from "react";
import ActivityIndicator from "@/components/ActivityIndicator";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  Link,
  MenuItem,
  Select,
} from "@mui/material";
import { MuiOtpInput } from 'mui-one-time-password-input'
import {useTranslation} from "react-i18next";
import Toast from "@/utils/toast";
import AccountService from "@/services/Account";

const CHANNEL_LABELS = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

/**
 * @param allowTrustDevice {boolean} Propose de ne plus redemander de code sur
 * cet appareil. Ne doit être activé QUE pour les flux de connexion/édition de
 * profil (Login2FA/UserAuth2FA côté backend) : la confirmation d'une action
 * financière (paiement, rachat...) exige toujours un code frais.
 */
const TwoFAModal = ({title, content, onContinue, onCancel, allowTrustDevice = false}, ref) => {
  const [account, setAccount] = React.useState(null);
  const [otp, setOtp] = React.useState("");
  const [notif, setNotif] = React.useState("notif_2fa");
  const [method, setMethod] = React.useState(null);
  const [availableMethods, setAvailableMethods] = React.useState([]);
  const [trustDevice, setTrustDevice] = React.useState(false);
  const [opened, setOpened] = React.useState(false);
  const [inProgress, setInProgress] = React.useState(false);
  const {t} = useTranslation();

  const isTotp = method === "totp";
  // "email_sms" = compte legacy sans canal choisi : le code part par email ET
  // sms, donc pas de canal "actif" unique à présélectionner dans le sélecteur.
  const canSwitchChannel = !isTotp && availableMethods.length > 1;

  React.useImperativeHandle(ref, () => ({
    open: (_cte = null, _notif = "notif_2fa", _method = null, _availableMethods = []) => {
      if(!opened) {
        setOtp("");
        setTrustDevice(false);
      }
      setOpened(true);
      setAccount(_cte);
      setNotif(_notif);
      setMethod(_method);
      setAvailableMethods(_availableMethods ?? []);
    },
    close: () => {
      setOpened(false);
    },
    toggleLoader: _value => setInProgress(_value),
    getOtp: () => otp,
    getTrustDevice: () => trustDevice
  }));

  const handleResendToken = async (_method = null) => {
    setInProgress(true);
    const {token} = JSON.parse(localStorage.getItem("storedValues")) || {};
    const result = await AccountService.resend2faToken(token, account, notif, _method);
    setInProgress(false);
    if(result.error == null) {
      Toast.success(result.data?.message ?? t("Two Factor OTP sent by mail/sms"));
    } else {
      Toast.error(result.error.response?.data?.message);
    }
  };

  const handleChannelChange = async newMethod => {
    if (newMethod === method) return;
    setMethod(newMethod);
    setOtp("");
    await handleResendToken(newMethod);
  };

  const handleContinue = () => {
    if(parseInt(otp) < 100000) {
      Toast.warn(t("Provide Two-Factor OTP"), Toast.TOAST_LONG);
      return;
    }
    onContinue(otp, trustDevice);
    setInProgress(true);
  };

  return (
    <Dialog className="__positionned" open={opened} onClose={() => setOpened(false)}>
      <ActivityIndicator visible={inProgress} />
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <i>{t('Your requested action need Two-Factor Authentication')}</i>
        <DialogContentText>
          {isTotp ? t("Enter the code from your authenticator app.") : content}
        </DialogContentText>
        <div style={{padding: "2rem 0"}}>
          <MuiOtpInput value={otp} onChange={value => setOtp(value)} length={6} />
        </div>
        {!isTotp && (
          <p>
            {t("Didn't receive a code?")}&nbsp;
            <Link
              component="button"
              variant="body2"
              onClick={() => handleResendToken(availableMethods.includes(method) ? method : null)}>
              {t("Resend code")}
            </Link>
          </p>
        )}
        {canSwitchChannel && (
          <FormControl fullWidth size="small" sx={{mt: 1}}>
            <InputLabel>{t("Receive the code by")}</InputLabel>
            <Select
              label={t("Receive the code by")}
              value={availableMethods.includes(method) ? method : ""}
              onChange={e => handleChannelChange(e.target.value)}>
              {availableMethods.map(channel => (
                <MenuItem key={channel} value={channel}>
                  {t(CHANNEL_LABELS[channel] ?? channel)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        {allowTrustDevice && (
          <FormControlLabel
            control={
              <Checkbox
                checked={trustDevice}
                onChange={e => setTrustDevice(e.target.checked)}
              />
            }
            label={t("Remember this device and don't ask me again for a few days")}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setOpened(false);
            onCancel();
          }}>
          {t("Cancel")}
        </Button>
        <Button color="error" onClick={handleContinue} autoFocus>
          {t("Continue")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.forwardRef(TwoFAModal);
