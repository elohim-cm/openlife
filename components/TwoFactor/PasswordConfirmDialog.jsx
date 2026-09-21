"use client";

import React, {forwardRef, useImperativeHandle, useState} from "react";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, InputAdornment, TextField} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import {useTranslation} from "react-i18next";

/**
 * Dialog de ré-authentification par mot de passe, exigée avant toute
 * activation ou modification de la 2FA. Usage impératif (comme TwoFAModal) :
 *   passwordConfirmRef.current.open(async (password) => { ...appelle l'API... });
 */
const PasswordConfirmDialog = forwardRef((props, ref) => {
  const {t} = useTranslation();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [onConfirmCallback, setOnConfirmCallback] = useState(null);

  useImperativeHandle(ref, () => ({
    open: onConfirm => {
      setPassword("");
      setError("");
      setOnConfirmCallback(() => onConfirm);
      setOpen(true);
    },
    close: () => setOpen(false),
    toggleLoader: (_val = false) => setLoading(_val),
  }));

  const handleClose = () => {
    if (loading) return;
    setOpen(false);
  };

  const handleConfirm = async () => {
    if (!password) {
      setError(t("Please enter your current password."));
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onConfirmCallback?.(password);
      setOpen(false);
    } catch (e) {
      setError(e?.response?.data?.message ?? t("Incorrect password."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>{t("Confirm your password")}</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{mb: 2}}>
          {t("For your security, please confirm your current password before changing your two-factor authentication settings.")}
        </DialogContentText>
        <TextField
          autoFocus
          fullWidth
          variant="filled"
          size="small"
          label={t("Current password")}
          type={showPassword ? "text" : "password"}
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") handleConfirm();
          }}
          error={Boolean(error)}
          helperText={error}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(v => !v)} edge="end" tabIndex={-1}>
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          {t("Cancel")}
        </Button>
        <Button variant="contained" onClick={handleConfirm} disabled={loading}>
          {t("Confirm")}
        </Button>
      </DialogActions>
    </Dialog>
  );
});

PasswordConfirmDialog.displayName = "PasswordConfirmDialog";

export default PasswordConfirmDialog;
