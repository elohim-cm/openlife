"use client";

import React, {useCallback, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {Button, Paper, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import ActivityIndicator from "@/components/ActivityIndicator";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useAppContext} from "@/contexts/appContext";
import {compressImage, formatNumberStr, getAutocompleteValue, getToken, jsonToFormData, sleep} from "@/utils";
import Autocomplete from "@mui/material/Autocomplete";
import Toast from "@/utils/toast";
import {displayHttpError} from "@/utils/api";
import BuyBackService from "@/services/BuyBackService";
import DefaultSchema from "@/utils/DefaultSchema";
import SubscriptionService from "@/services/SubscriptionService";
import ContractService from "@/services/ContractService";
import {onInputBlur} from "@/utils/api/validate";
import validate from "validate.js";
import styles from "@/styles/sysCompte.module.scss";
import Constants from "@/utils/constants";
import IntlPhoneField from "@/components/IntlPhoneField";
import {useTranslation} from "react-i18next";
import Alert from "@mui/material/Alert";
import UtilMethods from "@/utils/UtilMethods";

const inputType = "filled";
const inputSize = "normal";

let validationSchema = t => ({
  contract: DefaultSchema.required,
  type: DefaultSchema.required,
  payment_method: DefaultSchema.required,
  payment_system: DefaultSchema.required,
  scan_cni: DefaultSchema.required,
  first_name: DefaultSchema.required,
  last_name: DefaultSchema.required,
  phone_benef: DefaultSchema.phone(t),
  address: DefaultSchema.required,
});

const BuybackNew = () => {
  const {t} = useTranslation();
  const [inProgress, setInProgress] = useState(false);
  const [isBankMode, setIsBankMode] = useState(false);
  const [allPaymentMethods, setAllPaymentMethods] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentSystems, setPaymentSystems] = useState([]);
  const [types, setTypes] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [type, setType] = useState("");
  const [contract, setContract] = useState("");
  const [amount, setAmount] = useState("");
  const [redemptionValue, setRedemptionValue] = useState("");
  const [motivation, setMotivation] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentSystem, setPaymentSystem] = useState("");
  const [scanCni1, setScanCNI1] = React.useState("");
  const [scanCni2, setScanCNI2] = React.useState("");
  const [cniFile1, setCniFile1] = React.useState(null);
  const [cniFile2, setCniFile2] = React.useState(null);
  const [selectedBenef, setSelectedBenef] = React.useState(null);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [phoneBenef, setPhoneBenef] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [bankCode, setBankCode] = React.useState("");
  const [agencyCode, setAgencyCode] = React.useState("");
  const [bankAccount, setBankAccount] = React.useState("");
  const [bankKey, setBankKey] = React.useState("");
  const [ready, setReady] = React.useState(false);
  const [isMeBeneficiary, setIsMeBeneficiary] = React.useState(true);
  const [canProvideAmount, setCanProvideAmount] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const router = useRouter();
  const context = useAppContext();
  const token = getToken();
  const [showAlert, setShowAlert] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedContract, setSelectedContract] = React.useState(null);

  const getPaymentSystems = useCallback(
    async _method => {
      const response = await SubscriptionService.getPaymentSystems(token, _method);
      if (response.error == null) {
        setPaymentSystems(response.data);
      } else {
        displayHttpError(response.error, router);
      }
    },
    [token, router],
  );

  const getPaymentMethods = useCallback(async () => {
    const response = await SubscriptionService.getPaymentMethods(token, false);
    if (response.error == null) {
      setPaymentMethods(response.data);
      setAllPaymentMethods(response.data);
    } else {
      displayHttpError(response.error, router);
    }
  }, [token, router]);

  const getTypes = useCallback(async () => {
    const response = await BuyBackService.getBuybackTypes(token);
    if (response.error == null) {
      setTypes(response.data);
    } else {
      displayHttpError(response.error, router);
    }
  }, [token, router]);

  const getContracts = useCallback(async () => {
    const response = await ContractService.getAll(token);
    if (response.error == null) {
      setContracts(response.contracts);
    } else {
      displayHttpError(response.error, router);
    }
  }, [token, router]);

  const fetchData = useCallback(async () => {
    await getPaymentMethods();
    await getContracts();
    await getTypes();
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatData = () => {
    return {
      phone: "",
      amount: amount,
      raison: motivation,
      scan_cni: [cniFile1, cniFile2],
      bank_code: bankCode,
      branch_code: agencyCode,
      account_number: bankAccount,
      account_key: bankKey,
      beneficiary: [
        {
          first_name: firstName,
          last_name: lastName,
          address: address,
          phone: phoneBenef,
        },
      ],
    };
  };

  const getData = () => {
    return {
      contract: contract,
      type: type,
      payment_method: paymentMode,
      payment_system: paymentSystem,
      scan_cni: scanCni1,
      scan_cni2: scanCni2,
      first_name: firstName,
      last_name: lastName,
      phone_benef: phoneBenef,
      address: address,
    };
  };

  const handleInputBlur = _key => {
    const validatedErrors = onInputBlur(_key, getData(), validationSchema(t), errors);
    setErrors(validatedErrors);
    forceUpdate();
  };

  const validateForm = () => {
    const validation = validate(getData(), validationSchema(t));
    setErrors(validation ?? {});
    console.log(validation);
    return !validation;
  };

  const handleSelectContract = async ctr => {
    setInProgress(true);
    setRedemptionValue(ctr?.redemption_value);
    const result = await SubscriptionService.show(token, ctr?.subscription.uid);
    setInProgress(false);
    if (result.error == null) {
      let data = result.data.life_beneficiaries.map(e => e.person);
      data = [{first_name: "", last_name: "", main_phone: "", address: "", uid: ""}].concat(data);
      setBeneficiaries(data);
    } else {
      displayHttpError(result.error, router);
    }
  };

  const handleSelectBenef = _person => {
    setFirstName(_person?.first_name);
    setLastName(_person?.last_name);
    setPhoneBenef(_person?.main_phone);
    setAddress(_person?.address);
  };

  const handleSelectMethod = async _methodUid => {
    setInProgress(true);
    await getPaymentSystems(_methodUid);
    const mode = allPaymentMethods.filter(item => item.uid === _methodUid)[0];
    setIsBankMode(mode.code === Constants.PAYMENT_METHOD.virement);
    await sleep(2000);
    if (paymentSystems.length === 1) {
      setPaymentSystem(paymentSystems[0].uid);
    }
    setInProgress(false);
  };

  const handleChangeType = _type => {
    if (_type.label.toLowerCase().indexOf("part") > -1) {
      setCanProvideAmount(true);
      setAmount("");
    } else {
      setCanProvideAmount(false);
      setAmount(redemptionValue);
    }
  };

  const handleChangeAmount = _amount => {
    try {
      const montant = parseInt(_amount);
      let tab = [];
      if (montant <= 500000) {
        tab = allPaymentMethods.filter(element => element.code === Constants.PAYMENT_METHOD.mobile);
        delete validationSchema(t).scan_cni;
      } else if (montant > 500000 && montant <= 1000000) {
        tab = allPaymentMethods.filter(element => element.code !== Constants.PAYMENT_METHOD.mobile);
        validationSchema(t).scan_cni = DefaultSchema.required;
      } else if (montant > 1000000) {
        tab = allPaymentMethods.filter(element => element.code === Constants.PAYMENT_METHOD.virement);
        validationSchema(t).scan_cni = DefaultSchema.required;
      }
      setPaymentMethods(tab);
    } catch (e) {
      console.log("Error ::: ", e);
      setPaymentMethods(allPaymentMethods);
    }
  };

  const validateBankInfo = () => {
    return true;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      if (isBankMode) {
        if (!validateBankInfo()) {
          Toast.error(t("fillBankingInformation"), Toast.TOAST_SHORT);
          return;
        }
      }
      if (!inProgress) {
        setInProgress(true);
        const data = jsonToFormData(formatData());
        const result = await BuyBackService.makeBuyback(token, data, type, contract, paymentSystem);
        setInProgress(false);
        if (result.error == null) {
          Toast.success(t("requestSuccessfullyCompleted"), Toast.TOAST_SHORT);
          setMessage(t("HelloMr/Mrs") +
              selectedBenef.last_name +" "+ selectedBenef.first_name + t("messageRedemptionOne") + selectedContract.code +
              t("messageRedeptionTwo") + formatNumberStr(amount ?? '', UtilMethods.getLanguage()) + t("messageRedemtionThree"))
          setShowAlert(true)
          await sleep(5000)
          router.back();
          context.togglePageLoading(true);
        } else {
          displayHttpError(result.error, router);
        }
      }
    } else {
      Toast.error(t("fillFormCorrectly"), Toast.TOAST_SHORT);
    }
  };

  return (
    <> 
      <Button
        variant="outlined"
        startIcon={<ArrowBackIcon />}
        color="secondary"
        onClick={e => {
          context.togglePageLoading(true);
          router.back();
        }}
        sx={{mb: 2}}>
        {t("back")}
      </Button>
      <Paper elevation={2} sx={{padding: "40px 24px", mb: 3}} className="brSm">
        <ActivityIndicator visible={inProgress} />
        {showAlert && (
            <Alert severity="info" onClose={() => setShowAlert(false)} sx={{ mb: 2 }}>
              {message}
            </Alert>
        )}
        <Typography variant="h5" component="h5" mb={2}>
          {t("performNewRedemption")}
        </Typography>
        <Grid container spacing={4}>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <Autocomplete
              onChange={(e, value) => {
                setContract(value?.uid);
                setSelectedContract(value)
                handleSelectContract(value);
              }}
              options={contracts ?? []}
              getOptionLabel={option => `${option.code} : ${formatNumberStr(option.prime)} - ${option.duration} ans`}
              value={getAutocompleteValue(contract, contracts, "uid")}
              onBlur={() => handleInputBlur("contract")}
              sx={{width: "100%"}}
              size={inputSize}
              className={styles.myInput}
              renderInput={params => (
                <TextField
                  {...params}
                  variant={inputType}
                  error={!!errors.contract}
                  helperText={errors.contract ? errors.contract : ""}
                  label={`${t("contract")}`}
                />
              )} 
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <TextField
              value={redemptionValue}
              variant={inputType}
              type="text"
              label={`${t("redemptionValue")}`}
              sx={{width: "100%"}}
              size={inputSize}
              className={styles.myInput}
              inputProps={{readOnly: true}}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <Autocomplete
              onChange={(e, value) => {
                setType(value.uid);
                handleChangeType(value);
              }}
              options={types ?? []}
              value={getAutocompleteValue(type, types, "uid")}
              onBlur={() => handleInputBlur("type")}
              sx={{width: "100%"}}
              size={inputSize}
              className={styles.myInput}
              renderInput={params => (
                <TextField
                  {...params}
                  variant={inputType}
                  error={!!errors.type}
                  helperText={errors.type ? errors.type : ""}
                  label={`${t("type")}*`}
                />
              )}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <TextField
              onChange={e => {
                setAmount(e.target.value);
                handleChangeAmount(e.target.value);
              }}
              value={amount}
              onBlur={() => handleInputBlur("amount")}
              variant={inputType}
              type="number"
              label={`${t("amount")}*`}
              error={!!errors.amount}
              helperText={errors.amount ? errors.amount : ""}
              sx={{width: "100%"}}
              size={inputSize}
              className={styles.myInput}
              inputProps={{readOnly: !canProvideAmount}}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <Autocomplete
              onChange={(e, value) => {
                setPaymentMode(value.uid);
                handleSelectMethod(value.uid);
              }}
              options={paymentMethods ?? []}
              value={getAutocompleteValue(paymentMode, paymentMethods, "uid")}
              onBlur={() => handleInputBlur("payment_method")}
              sx={{width: "100%"}}
              size={inputSize}
              className={styles.myInput}
              renderInput={params => (
                <TextField
                  {...params}
                  variant={inputType}
                  error={!!errors.payment_method}
                  helperText={errors.payment_method ? errors.payment_method : ""}
                  label={`${t("paymentMode")}*`}
                />
              )}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <Autocomplete
              onChange={(e, value) => {
                setPaymentSystem(value.uid);
              }}
              options={paymentSystems ?? []}
              value={getAutocompleteValue(paymentSystem, paymentSystems, "uid")}
              onBlur={() => handleInputBlur("payment_system")}
              sx={{width: "100%"}}
              size={inputSize}
              className={styles.myInput}
              renderInput={params => (
                <TextField
                  {...params}
                  variant={inputType}
                  error={!!errors.payment_system}
                  helperText={errors.payment_system ? errors.payment_system : ""}
                  label={`${t("paymentSystem")}*`}
                />
              )}
            />
          </Grid>
          {isBankMode ? (
            <>
              <Grid xs={12} md={6} lg={6} xl={4}>
                <TextField
                  onChange={e => {
                    setBankCode(e.target.value);
                  }}
                  value={bankCode}
                  onBlur={() => handleInputBlur("bank_code")}
                  variant={inputType}
                  type="text"
                  label={t("bankCode")}
                  error={!!errors.bank_code}
                  helperText={errors.bank_code ? errors.bank_code : ""}
                  sx={{width: "100%"}}
                  size={inputSize}
                  className={styles.myInput}
                />
              </Grid>
              <Grid xs={12} md={6} lg={6} xl={4}>
                <TextField
                  onChange={e => {
                    setAgencyCode(e.target.value);
                  }}
                  value={agencyCode}
                  onBlur={() => handleInputBlur("agency_code")}
                  variant={inputType}
                  type="text"
                  label={t("branchCode")}
                  error={!!errors.agency_code}
                  helperText={errors.agency_code ? errors.agency_code : ""}
                  sx={{width: "100%"}}
                  size={inputSize}
                  className={styles.myInput}
                />
              </Grid>
              <Grid xs={12} md={6} lg={6} xl={4}>
                <TextField
                  onChange={e => {
                    setBankAccount(e.target.value);
                  }}
                  value={bankAccount}
                  onBlur={() => handleInputBlur("bank_account")}
                  variant={inputType}
                  type="text"
                  label={t("accountNumber")}
                  error={!!errors.bank_account}
                  helperText={errors.bank_account ? errors.bank_account : ""}
                  sx={{width: "100%"}}
                  size={inputSize}
                  className={styles.myInput}
                />
              </Grid>
              <Grid xs={12} md={6} lg={6} xl={4}>
                <TextField
                  onChange={e => {
                    setBankKey(e.target.value);
                  }}
                  value={bankKey}
                  onBlur={() => handleInputBlur("bank_key")}
                  variant={inputType}
                  type="text"
                  label={t("key")}
                  error={!!errors.bank_key}
                  helperText={errors.bank_key ? errors.bank_key : ""}
                  sx={{width: "100%"}}
                  size={inputSize}
                  className={styles.myInput}
                />
              </Grid>
            </>
          ) : (
            <></>
          )}
          <Grid xs={12} md={6} lg={6} xl={4}>
            <TextField
              onChange={e => {
                setMotivation(e.target.value);
              }}
              value={motivation}
              onBlur={() => handleInputBlur("motivation")}
              variant={inputType}
              type="text"
              label={t("motivation")}
              error={!!errors.motivation}
              helperText={errors.motivation ? errors.motivation : ""}
              sx={{width: "100%"}}
              size={inputSize}
              className={styles.myInput}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <TextField
              onChange={async e => {
                setScanCNI1(e.target.value);
                const _files = e.target.files;
                if (_files.length) {
                  const _file = await compressImage(_files.item(0));
                  console.log("Compressed file::: ", _file);
                  setCniFile1(_file);
                }
              }}
              value={scanCni1}
              onBlur={() => handleInputBlur("scanCni1")}
              variant={inputType}
              type="file"
              inputProps={{accept: "image/*"}}
              label={t("idCardFrontScan")}
              InputLabelProps={{shrink: true}}
              error={!!errors.scanCni1}
              helperText={errors.scanCni1 ? errors.scanCni1 : ""}
              sx={{width: "100%"}}
              size={inputSize}
              className={styles.myInput}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <TextField
              onChange={async e => {
                setScanCNI2(e.target.value);
                const _files = e.target.files;
                if (_files.length) {
                  const _file = await compressImage(_files.item(0));
                  setCniFile2(_file);
                }
              }}
              onBlur={() => handleInputBlur("scanCni2")}
              variant={inputType}
              type="file"
              inputProps={{accept: "image/*"}}
              label={t("idCardBackScan")}
              InputLabelProps={{shrink: true}}
              error={!!errors.scanCni2}
              helperText={errors.scanCni2 ? errors.scanCni2 : ""}
              sx={{width: "100%"}}
              size={inputSize}
              className={styles.myInput}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <Autocomplete
              onChange={(e, value) => {
                setSelectedBenef(value);
                handleSelectBenef(value);
              }}
              options={beneficiaries ?? []}
              value={selectedBenef}
              getOptionLabel={option => {
                if (option.uid !== "") return `${option.last_name} ${option.first_name}`;
                else return "Nouveau";
              }}
              onBlur={() => handleInputBlur("selected_benef")}
              sx={{width: "100%"}}
              size={inputSize}
              className={styles.myInput}
              renderInput={params => (
                <TextField
                  {...params}
                  variant={inputType}
                  error={!!errors.selected_benef}
                  helperText={errors.selected_benef ? errors.selected_benef : ""}
                  label={t("selectBeneficiary")}
                />
              )}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <IntlPhoneField
              onChange={e => {
                setPhoneBenef(e);
              }}
              value={phoneBenef}
              onBlur={() => handleInputBlur("phone_benef")}
              variant={inputType}
              type="tel"
              label={t("beneficiaryPhone")}
              error={!!errors.phone_benef}
              helperText={errors.phone_benef ? errors.phone_benef : ""}
              sx={{width: "100%"}}
              size={inputSize}
              className={styles.myInput}
            />
          </Grid>
          <>
            <Grid xs={12} md={6} lg={6} xl={4}>
              <TextField
                onChange={e => {
                  setLastName(e.target.value);
                }}
                value={lastName}
                onBlur={() => handleInputBlur("last_name")}
                variant={inputType}
                type="text"
                label={`${t("lastName")}*`}
                error={!!errors.last_name}
                helperText={errors.last_name ? errors.last_name : ""}
                sx={{width: "100%"}}
                size={inputSize}
                className={styles.myInput}
              />
            </Grid>
            <Grid xs={12} md={6} lg={6} xl={4}>
              <TextField
                onChange={e => {
                  setFirstName(e.target.value);
                }}
                value={firstName}
                onBlur={() => handleInputBlur("first_name")}
                variant={inputType}
                type="text"
                label={t("firstName")}
                error={!!errors.first_name}
                helperText={errors.first_name ? errors.first_name : ""}
                sx={{width: "100%"}}
                size={inputSize}
                className={styles.myInput}
              />
            </Grid>
            <Grid xs={12} md={6} lg={6} xl={4}>
              <TextField
                onChange={e => {
                  setAddress(e.target.value);
                }}
                value={address}
                onBlur={() => handleInputBlur("address")}
                variant={inputType}
                type="text"
                label={`${t("address")}*`}
                error={!!errors.address}
                helperText={errors.address ? errors.address : ""}
                sx={{width: "100%"}}
                size={inputSize}
                className={styles.myInput}
              />
            </Grid>
          </>
          <Grid container xs={12} md={6} lg={12} xl={12}>
            <Grid xs={12} md={12} lg={2} xl={2}>
              <Button
                type="submit"
                onClick={handleSubmit}
                fullWidth
                variant="contained"
                size="large"
                sx={{mt: 1}}
                className="brSm">
                {t("create")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default BuybackNew;
