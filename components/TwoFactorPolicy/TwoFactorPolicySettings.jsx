"use client";

import React, {useCallback, useEffect, useState} from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  FormGroup,
  IconButton,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockResetIcon from "@mui/icons-material/LockReset";
import {useTranslation} from "react-i18next";
import {getToken} from "@/utils";
import Toast from "@/utils/toast";
import ActivityIndicator from "@/components/ActivityIndicator";
import TwoFactorPolicy from "@/services/twoFactorPolicyService";
import TwoFactorRuleDialog from "@/components/TwoFactorPolicy/TwoFactorRuleDialog";

const RULE_TYPE_LABELS = {
  role: "Role",
  permission: "Permission",
  user: "Specific account",
};

const METHOD_LABELS = {
  email: "Email",
  sms: "SMS",
  whatsapp: "WhatsApp",
  totp: "Authenticator app",
};

export default function TwoFactorPolicySettings() {
  const {t} = useTranslation();
  const token = getToken();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [policy, setPolicy] = useState(null);
  const [ruleDialogOpen, setRuleDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [resetAccountUid, setResetAccountUid] = useState("");

  const loadPolicy = useCallback(async () => {
    setLoading(true);
    const result = await TwoFactorPolicy.get(token);
    setLoading(false);
    if (result.error == null) {
      setPolicy(result.data);
    } else {
      Toast.error(t("Unable to load the two-factor policy."));
    }
  }, [token, t]);

  useEffect(() => {
    loadPolicy();
  }, [loadPolicy]);

  const handleToggleAllowedMethod = (method, checked) => {
    const current = policy.allowed_methods ?? [];
    const next = checked ? [...current, method] : current.filter(m => m !== method);
    setPolicy({...policy, allowed_methods: next});
  };

  const handleSaveGlobalPolicy = async () => {
    setSaving(true);
    const result = await TwoFactorPolicy.update(token, {
      enabled: policy.enabled,
      default_grace_days: policy.default_grace_days,
      allowed_methods: policy.allowed_methods,
    });
    setSaving(false);
    if (result.error == null) {
      Toast.success(t("Two-factor policy updated successfully."));
    } else {
      Toast.error(result.error?.response?.data?.message ?? t("Unable to update the two-factor policy."));
    }
  };

  const handleSubmitRule = async payload => {
    const result = editingRule
      ? await TwoFactorPolicy.updateRule(token, editingRule.uid, payload)
      : await TwoFactorPolicy.createRule(token, payload);

    if (result.error == null) {
      Toast.success(editingRule ? t("Two-factor rule updated successfully.") : t("Two-factor rule created successfully."));
      setRuleDialogOpen(false);
      setEditingRule(null);
      loadPolicy();
    } else {
      Toast.error(result.error?.response?.data?.message ?? t("Unable to save this rule."));
      throw result.error;
    }
  };

  const handleDeleteRule = async rule => {
    const result = await TwoFactorPolicy.deleteRule(token, rule.uid);
    if (result.error == null) {
      Toast.success(t("Two-factor rule deleted successfully."));
      loadPolicy();
    } else {
      Toast.error(t("Unable to delete this rule."));
    }
  };

  const handleForceReset = async () => {
    if (!resetAccountUid) return;
    const result = await TwoFactorPolicy.forceReset(token, resetAccountUid);
    if (result.error == null) {
      Toast.success(t("Two-factor authentication reset requested for this account."));
      setResetAccountUid("");
    } else {
      Toast.error(result.error?.response?.data?.message ?? t("Unable to reset two-factor authentication for this account."));
    }
  };

  if (loading || !policy) {
    return (
      <Card sx={{mt: 3}}>
        <CardContent>
          <ActivityIndicator visible />
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{mt: 3, display: "flex", flexDirection: "column", gap: 3}}>
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t("Global two-factor policy")}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t("Applies to every account that isn't covered by a more specific role, permission, or account rule below.")}
          </Typography>

          <Stack spacing={2} sx={{mt: 2}}>
            <FormControlLabel
              control={
                <Switch
                  checked={policy.enabled}
                  onChange={e => setPolicy({...policy, enabled: e.target.checked})}
                />
              }
              label={t("Require two-factor authentication by default")}
            />

            <TextField
              variant="filled"
              size="small"
              type="number"
              label={t("Default grace period (days)")}
              value={policy.default_grace_days}
              onChange={e => setPolicy({...policy, default_grace_days: Number(e.target.value)})}
              sx={{maxWidth: 280}}
              inputProps={{min: 0, max: 365}}
            />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                {t("Allowed two-factor methods")}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {t("Methods left unchecked are hidden everywhere: profile settings, authenticator app setup, and the delivery channel picker in the code entry window.")}
              </Typography>
              <FormGroup row>
                {Object.keys(METHOD_LABELS).map(method => (
                  <FormControlLabel
                    key={method}
                    control={
                      <Checkbox
                        checked={(policy.allowed_methods ?? []).includes(method)}
                        onChange={e => handleToggleAllowedMethod(method, e.target.checked)}
                      />
                    }
                    label={t(METHOD_LABELS[method])}
                  />
                ))}
              </FormGroup>
            </Box>

            <Box>
              <Button variant="contained" onClick={handleSaveGlobalPolicy} disabled={saving}>
                {t("Save")}
              </Button>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{mb: 2}}>
            <Box>
              <Typography variant="h6">{t("Rules by role, permission, or account")}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t("Priority: a rule on a specific account always wins; otherwise, the strictest matching role/permission rule applies; otherwise, the global policy above applies.")}
              </Typography>
            </Box>
            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              onClick={() => {
                setEditingRule(null);
                setRuleDialogOpen(true);
              }}>
              {t("Add rule")}
            </Button>
          </Stack>

          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>{t("Type")}</TableCell>
                  <TableCell>{t("Target")}</TableCell>
                  <TableCell>{t("Requirement")}</TableCell>
                  <TableCell>{t("Grace period")}</TableCell>
                  <TableCell>{t("Description")}</TableCell>
                  <TableCell align="right">{t("Actions")}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(policy.rules ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      {t("No specific rule yet: the global policy applies to everyone.")}
                    </TableCell>
                  </TableRow>
                )}
                {(policy.rules ?? []).map(rule => (
                  <TableRow key={rule.uid}>
                    <TableCell>{t(RULE_TYPE_LABELS[rule.type])}</TableCell>
                    <TableCell>{rule.target_label ?? rule.target_uid}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={rule.required ? "warning" : "success"}
                        label={rule.required ? t("Required") : t("Exempted")}
                      />
                    </TableCell>
                    <TableCell>{rule.grace_days ?? t("Default")}</TableCell>
                    <TableCell>{rule.label ?? "-"}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setEditingRule(rule);
                          setRuleDialogOpen(true);
                        }}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDeleteRule(rule)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {t("Force a reconfiguration")}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {t("Immediately clears an account's two-factor method and trusted devices, and blocks it until it is reconfigured (e.g. suspected compromise).")}
          </Typography>
          <Divider sx={{my: 2}} />
          <Stack direction={{xs: "column", sm: "row"}} spacing={2} alignItems={{sm: "center"}}>
            <TextField
              variant="filled"
              size="small"
              label={t("Account UID")}
              value={resetAccountUid}
              onChange={e => setResetAccountUid(e.target.value)}
              sx={{minWidth: 320}}
            />
            <Button variant="contained" color="warning" startIcon={<LockResetIcon />} onClick={handleForceReset}>
              {t("Force reconfiguration")}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <TwoFactorRuleDialog
        open={ruleDialogOpen}
        onClose={() => {
          setRuleDialogOpen(false);
          setEditingRule(null);
        }}
        onSubmit={handleSubmitRule}
        rule={editingRule}
        roles={policy.available_roles}
        permissions={policy.available_permissions}
        defaultGraceDays={policy.default_grace_days}
      />
    </Box>
  );
}
