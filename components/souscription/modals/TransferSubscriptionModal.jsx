import React, {useCallback, useEffect, useState} from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  TextField,
} from "@mui/material";
import ActivityIndicator from "@/components/ActivityIndicator";
import Account from "@/services/Account";
import {canInterprateError, displayHttpError} from "@/utils/api";
import Toast from "@/utils/toast";
import styles from "@/styles/sysCompte.module.scss";
import MenuItem from "@mui/material/MenuItem";
import DefaultSchema from "@/utils/DefaultSchema";
import validate from "validate.js";
import SubscriptionService from "@/services/SubscriptionService";
import Grid from "@mui/material/Unstable_Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import ProviderService from "@/services/ProviderService";
import {useRouter} from "next/navigation";
import {useTranslation} from "react-i18next";
import {useAppContext} from "@/contexts/appContext";

const inputType = "filled";
const inputSize = "medium";

/**
 *
 * @param token
 * @param record {SubscriptionModel}
 * @param ref
 * @returns {Element}
 * @constructor
 */
const TransferSubscriptionModal = ({token, record}, ref) => {
  const {t} = useTranslation();
  const [opened, setOpenend] = React.useState(false);
  const [providers, setProviders] = React.useState(null);
  const [provider, setProvider] = React.useState(null);
  const [inProgress, setInProgress] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [qProvider, setqProvider] = useState("");
  const router = useRouter();
  const context = useAppContext();

  const validationSchema = {
    provider: DefaultSchema.select(t),
  };

  React.useImperativeHandle(ref, () => ({
    open: () => {
      setOpenend(true);
      if (providers == null) getProviders();
    },
    close: () => {
      setOpenend(false);
    },
  }));

  const getProviders = useCallback(
    async (page, qProvider) => {
      const response = await ProviderService.getAll(token, page, "", qProvider);

      // if no errors
      if (response.error == null) {
        setProviders(response.providers);
      } else {
        displayHttpError(response.error, router);
      }
    },
    [token],
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      getProviders(1, qProvider);
    }, 300); // You can adjust the delay

    return () => clearTimeout(delayDebounceFn);
  }, [qProvider, getProviders, qProvider]);
  const validateForm = () => {
    const validation = validate({provider: provider ? provider.uid : ""}, validationSchema);
    setErrors(validation ?? {});
    console.log(validation);
    return !validation;
  };

  const handleTransfer = async () => {
    if (validateForm()) {
      setInProgress(true);
      let result = await SubscriptionService.transfer(token, record.uid, provider.uid);
      if (!result.error) {
        Toast.success(result.message);
        setOpenend(false);
        context.togglePageLoading(true);
        router.back();
      } else {
        if (canInterprateError(result.error)) {
          Toast.error(result.error.response.data.message);
        } else Toast.error(t("anErrorOccurred"));
      }
      setInProgress(false);
    } else {
      Toast.error(t("instructions"));
    }
  };

  return (
    <Dialog className="__positionned" open={opened} onClose={() => setOpenend(false)}>
      <ActivityIndicator visible={inProgress} />
      <DialogTitle>{"Confirmation"}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("youAreAboutToTransferThisSubscription")}</DialogContentText>
        <Box mt={2}>
          <Autocomplete
            onChange={(e, value) => {
              setProvider(value);
            }}
            onInputChange={(event, newInputValue) => {
              setqProvider(newInputValue.trim());
            }}
            options={providers ?? []}
            getOptionLabel={option => (option.last_name || "") + " " + (option.first_name || "")}
            value={provider}
            variant={inputType}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
            renderInput={params => (
              <TextField
                {...params}
                error={!!errors.provider}
                helperText={errors.provider ? errors.provider : ""}
                label={`${t("selectAProvider")}*`}
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenend(false)}>Annuler</Button>
        <Button color="error" onClick={handleTransfer} autoFocus>
          {t("mutted")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.forwardRef(TransferSubscriptionModal);
