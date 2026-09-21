"use client";

import React, {useEffect, useState} from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
} from "@mui/material";
import {useTranslation} from "react-i18next";

const TYPE_ROLE = "role";
const TYPE_PERMISSION = "permission";
const TYPE_USER = "user";

/**
 * Création/édition d'une règle d'obligation de 2FA ciblant un rôle, une
 * permission, ou un compte précis (par UID, faute d'un composant de
 * recherche de compte dédié à ce jour).
 */
export default function TwoFactorRuleDialog({open, onClose, onSubmit, rule, roles, permissions, defaultGraceDays}) {
  const {t} = useTranslation();
  const [type, setType] = useState(TYPE_ROLE);
  const [targetUid, setTargetUid] = useState("");
  const [required, setRequired] = useState(true);
  const [useCustomGrace, setUseCustomGrace] = useState(false);
  const [graceDays, setGraceDays] = useState(defaultGraceDays ?? 7);
  const [label, setLabel] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setType(rule?.type ?? TYPE_ROLE);
    setTargetUid(rule?.target_uid ?? "");
    setRequired(rule ? rule.required : true);
    setUseCustomGrace(rule ? rule.grace_days !== null : false);
    setGraceDays(rule?.grace_days ?? defaultGraceDays ?? 7);
    setLabel(rule?.label ?? "");
  }, [open, rule, defaultGraceDays]);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await onSubmit({
        type,
        target_uid: targetUid,
        required,
        grace_days: useCustomGrace ? Number(graceDays) : null,
        label: label || null,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{display: "flex", flexDirection: "column", gap: 2, pt: 2}}>
        <FormControl fullWidth variant="filled" size="small">
          <FormLabel sx={{fontSize: 12, mb: 0.5}}>{t("Rule type")}</FormLabel>
          <Select
            value={type}
            onChange={e => {
              setType(e.target.value);
              setTargetUid("");
            }}
            disabled={Boolean(rule)}>
            <MenuItem value={TYPE_ROLE}>{t("Role")}</MenuItem>
            <MenuItem value={TYPE_PERMISSION}>{t("Permission")}</MenuItem>
            <MenuItem value={TYPE_USER}>{t("Specific account")}</MenuItem>
          </Select>
        </FormControl>

        {type === TYPE_ROLE && (
          <FormControl fullWidth variant="filled" size="small">
            <FormLabel sx={{fontSize: 12, mb: 0.5}}>{t("Role")}</FormLabel>
            <Select value={targetUid} onChange={e => setTargetUid(e.target.value)}>
              {(roles ?? []).map(role => (
                <MenuItem key={role.ROL_UID} value={role.ROL_UID}>
                  {role.ROL_LIBELLE}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {type === TYPE_PERMISSION && (
          <FormControl fullWidth variant="filled" size="small">
            <FormLabel sx={{fontSize: 12, mb: 0.5}}>{t("Permission")}</FormLabel>
            <Select value={targetUid} onChange={e => setTargetUid(e.target.value)}>
              {(permissions ?? []).map(permission => (
                <MenuItem key={permission.PMS_UID} value={permission.PMS_UID}>
                  {permission.PMS_LIBELLE}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {type === TYPE_USER && (
          <TextField
            fullWidth
            variant="filled"
            size="small"
            label={t("Account UID")}
            helperText={t("Copy the account identifier from the Accounts page.")}
            value={targetUid}
            onChange={e => setTargetUid(e.target.value)}
          />
        )}

        <FormControlLabel
          sx={{alignItems: "center", ml: 0}}
          control={<Switch checked={required} onChange={e => setRequired(e.target.checked)} />}
          label={required ? t("Two-factor authentication is required") : t("Two-factor authentication is exempted")}
        />

        <FormControlLabel
          sx={{alignItems: "center", ml: 0}}
          control={<Switch checked={useCustomGrace} onChange={e => setUseCustomGrace(e.target.checked)} />}
          label={t("Use a specific grace period for this rule")}
        />

        {useCustomGrace && (
          <TextField
            fullWidth
            variant="filled"
            size="small"
            type="number"
            label={t("Grace period (days)")}
            value={graceDays}
            onChange={e => setGraceDays(e.target.value)}
            inputProps={{min: 0, max: 365}}
          />
        )}

        <TextField
          fullWidth
          variant="filled"
          size="small"
          label={t("Description (optional)")}
          value={label}
          onChange={e => setLabel(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          {t("Cancel")}
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving || !targetUid}>
          {t("Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
