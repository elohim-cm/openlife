"use client";
import React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import {Button, TextField} from "@mui/material";
import styles from "@/styles/sysCompte.module.scss";
import SubscriptionService from "@/services/SubscriptionService";
import ActivityIndicator from "@/components/ActivityIndicator";
import DefaultSchema from "@/utils/DefaultSchema";
import {getAutocompleteValue, getUrlParams} from "@/utils";
import {onInputBlur} from "@/utils/api/validate";
import validate from "validate.js";
import Toast from "@/utils/toast";
import {canInterprateError, displayHttpError} from "@/utils/api";
import Autocomplete from "@mui/material/Autocomplete";
import {useRouter} from "next/navigation";
import IntlPhoneField from "@/components/IntlPhoneField";
import Constants from "@/utils/constants";
import {useTranslation} from "react-i18next";

const inputType = "filled";
const inputSize = "normal";

const SousPaymentForm = ({onContinue, token}) => {
  const [paymentSystem, setPaymentSystem] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState("");
  const [subscription, setSubscription] = React.useState("");
  const [prime, setPrime] = React.useState("");
  // const [nbEmission, setNbEmission] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [paymentMethods, setPaymentMethods] = React.useState([]);
  const [paymentSystems, setPaymentSystems] = React.useState([]);
  const [inProgress, setInProgress] = React.useState(false);
  const [providerCode, setProviderCode] = React.useState(null);
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const router = useRouter();
  const {t} = useTranslation();

  const validationSchema = {
    paymentMethod: {
      presence: {allowEmpty: false, message: `^${t("paymentMethodRequired")}`},
      length: {minimum: 4, message: `^${t("paymentMethodRequired")}`},
    },
    paymentSystem: {
      presence: {allowEmpty: false, message: `^${t("paymentSystemRequired")}`},
      length: {minimum: 4, message: `^${t("paymentSystemRequired")}`},
    },
    phone: DefaultSchema.phone(t),
    amount: {
      presence: {allowEmpty: false, message: `^${t("paymentAmountRequired")}`},
      numericality: {greaterThan: 0, message: `^${t("paymentAmountPositive")}`},
    },
  };

  const getMethods = React.useCallback(async () => {
    const result = await SubscriptionService.getPaymentMethods(token);
    if (!result.error) {
      setPaymentMethods(result.data.map(item => ({...item, value: item.uid})));
    }
  }, [token]);

  React.useEffect(() => {
    let params = getUrlParams();
    if (params.length) {
      params.forEach(item => {
        if (item.label === "subscription") setSubscription(item.value);
        if (item.label === "prime") {
          setPrime(item.value);
          setAmount(item.value);
        }
        if (item.label === "ref") setProviderCode(item.value);
      });
    }
    getMethods();
  }, [getMethods]);
  const handleInputBlur = _key => {
    const validatedErrors = onInputBlur(_key, getData(), validationSchema, errors);
    setErrors(validatedErrors);
    forceUpdate();
  };

  const validateForm = () => {
    const validation = validate(getData(), validationSchema);
    setErrors(validation ?? {});
    return !validation;
  };

  const getSystems = async _method => {
    setInProgress(true);
    const result = await SubscriptionService.getPaymentSystems(token, _method);
    if (!result.error) {
      setPaymentSystems(result.data.map(item => ({...item, value: item.uid})));
    }
    setInProgress(false);
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      setInProgress(true);
      const result = await SubscriptionService.payment(token, {
        uid: subscription,
        system: paymentSystem,
        phone,
        amount,
      }, providerCode);
      if (!result.error) {
        onContinue(getData());
        Toast.success(t("paymentRequestSubmitted"));
      } else {
        displayHttpError(result.error, router);
      }
      setInProgress(false);
    } else {
      Toast.error(t("pleaseCompleteTheFormCorrectly"));
    }
  };

  const getData = () => {
    return {
      paymentMethod,
      paymentSystem,
      phone,
      amount,
    };
  };

  const initForm = (_data = {}) => {
    setPaymentMethod(_data.paymentMethod ?? "");
    setPaymentSystem(_data.paymentSystem ?? "");
    setPhone(_data.phone ?? "");
  };

  const resetForm = () => {
    initForm();
  };

  const handleChangeSystem = _system => {
    if (_system.code === Constants.PAYMENT_SYSTEM.om) {
      validationSchema.phone = DefaultSchema.phoneOm(t);
    } else if (_system.code === Constants.PAYMENT_SYSTEM.momo) {
      validationSchema.phone = DefaultSchema.phoneMtn(t);
    } else {
      validationSchema.phone = DefaultSchema.phone(t);
    }
  };

  return (
    <div style={{width: "100%", position: "relative"}}>
      <ActivityIndicator visible={inProgress} />
      <Grid container spacing={2} sx={{mt: 0}}>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <Autocomplete
            onChange={(e, option) => {
              setPaymentMethod(option?.value ?? "");
              if (option?.value) getSystems(option.value);
            }}
            options={paymentMethods}
            value={getAutocompleteValue(paymentMethod, paymentMethods)}
            onBlur={() => handleInputBlur("paymentMethod")}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
            renderInput={params => (
              <TextField
                {...params}
                variant={inputType}
                label={t("paymentMethod")}
                error={!!errors.paymentMethod}
                helperText={errors.paymentMethod ? errors.paymentMethod : ""}
              />
            )}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <Autocomplete
            onChange={(e, option) => {
              setPaymentSystem(option?.value ?? "");
              if (option) handleChangeSystem(option);
            }}
            options={paymentSystems}
            value={getAutocompleteValue(paymentSystem, paymentSystems)}
            onBlur={() => handleInputBlur("paymentSystem")}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
            renderInput={params => (
              <TextField
                {...params}
                variant={inputType}
                label={t("paymentSystem")}
                error={!!errors.paymentSystem}
                helperText={errors.paymentSystem ? errors.paymentSystem : ""}
              />
            )}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <IntlPhoneField
            onChange={e => {
              setPhone(e);
            }}
            value={phone}
            onBlur={() => handleInputBlur("phone")}
            variant={inputType}
            type="tel"
            label={`${t("payerPhone")}*`}
            error={!!errors.phone}
            helperText={errors.phone ? errors.phone : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
            onChange={e => {
              setAmount(e.target.value);
            }}
            value={amount}
            onBlur={() => handleInputBlur("amount")}
            variant={inputType}
            type="number"
            label={`${t("totalAmountToPay")}*`}
            error={!!errors.amount}
            helperText={errors.amount ? errors.amount : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <div></div>
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <Button fullWidth variant="contained" size="large" onClick={handleSubmit}>
            {t("pay")}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default SousPaymentForm;
