"use client";
import React, {useRef, useState} from "react";
import {Box, Button, Checkbox, TextField, Typography} from "@mui/material";
import styles from "@/styles/sysCompte.module.scss";
import ActivityIndicator from "@/components/ActivityIndicator";
import {onInputBlur} from "@/utils/api/validate";
import validate from "validate.js";
import Toast from "@/utils/toast";
import SubscriptionService from "@/services/SubscriptionService";
import {canInterprateError, displayHttpError} from "@/utils/api";
import {getRoleCode, getToken, getUid, getUrlParams, intToStr} from "@/utils";
import Routes from "@/utils/routes";
import Countdown from "react-countdown";
import Link from "next/link";
import Constants from "@/utils/constants";
import {useTranslation} from "react-i18next";
import UsageConditionModal from "@/components/UsageConditionModal";

const inputType = "filled";
const inputSize = "normal";

const SousConfirmForm = ({onContinue, token}) => {
  const {t} = useTranslation();
  const validationSchema = {
    code: {
      presence: {allowEmpty: false, message: `^${t("confirmationCodeRequired")}`},
      length: {minimum: 4, message: `^${t("confirmationCodeMinimumLength")}`},
    },
  };
  const [code, setCode] = React.useState("");
  // Add a state variable for the switch
  const [acceptCondition, setAcceptCondition] = React.useState(false);
  const [subscription, setSubscription] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [inProgress, setInprogress] = React.useState(false);
  const [canResendCode, setCanResendCode] = React.useState(false);
  const [showCountDownTimer, setShowCountDownTimer] = React.useState(true);
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const toAcceptCondition = localStorage.getItem('personHasAcceptCondition');
  const personHasAccept = toAcceptCondition? parseInt(toAcceptCondition) : 0
  const usageConditionRef = useRef();
  const [isBottom, setIsBottom] = useState(false);
  const [providerCode, setProviderCode] = React.useState(null);

  React.useEffect(() => {
    let params = getUrlParams();
    if (params.length) {
      params.forEach(item => {
        if (item.label === "subscription") setSubscription(item.value);
        if (item.label === "ref") setProviderCode(item.value);
      });
    }
  }, []);
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
  const isSubscriber = () => {
    return getToken() != null && getRoleCode() === Constants.ROLES.sous;
  };
  const handleSubmit = async () => {
    if (validateForm()) {
      setInprogress(true);
      await senderData()
      setInprogress(false);
    } else {
      Toast.error(t('pleaseCompleteTheFormCorrectly'));
    }
  };

  const senderData = async (_fromModal = false) => {
    const result = await SubscriptionService.confirm(token, {
      uid: subscription,
      code,
      accept_condition: true
    }, providerCode);
    if (!result.error) {
      onContinue();

      if (localStorage.getItem('personHasAcceptCondition') !== null)
        localStorage.removeItem('personHasAcceptCondition');

      if (_fromModal)
        usageConditionRef.current?.close();

      Toast.success(t('subscriptionConfirmedSuccessfully'));
    } else {
      if (canInterprateError(result.error)) {
        Toast.error(t("subscriptionConfirmationFailed"));
      } else {
        Toast.error(t('anErrorHasOccurred'));
      }
    }
  }

  const handleSubmitOnModal = async () => {
    usageConditionRef.current?.toggleLoader(true);
    await senderData(true)
    usageConditionRef.current?.toggleLoader(false);

  }

  const handleOpenCondition = async () => {
    if (validateForm()) {
      usageConditionRef.current?.open()
      setIsBottom(false)
    } else {
      Toast.error(t('pleaseCompleteTheFormCorrectly'));
    }
  }

  const handleResendCode = async () => {
    if (!inProgress) {
      setInprogress(true);
      const result = await SubscriptionService.sendCode(subscription);
      if (!result.error) {
        setShowCountDownTimer(true);
        Toast.success(t('codeHasBeenSentSuccessfully'));
      } else {
        displayHttpError(result.error);
      }
    }
    setInprogress(false);
  };

  const getData = () => {
    return {code};
  };

  const renderCheckboxAndText = () => (
      <Box sx={{mt: 3, mb: 2, display: "flex", alignItems: "center", cursor: "pointer"}} onClick={handleSwitchTextClick}>
        <Checkbox
            checked={acceptCondition}
            onChange={handleSwitchChange}
            name="accept_condition"
            inputProps={{'aria-label': t("acceptUsageConditions")}}
        />
        <Typography variant="body2">
          <Link href={Routes.CONDITIONTERM}>{t('accept')}</Link>{' '}
          {t('usageConditions')}{'*'}
        </Typography>
      </Box>
  );

  return (
    <div style={{width: "100%", position: "relative"}}>
      <ActivityIndicator visible={inProgress} />
      <Box sx={{mt: 3, mb: 2}}>
        <TextField
          onChange={e => {
            setCode(e.target.value);
          }}
          value={code}
          onBlur={() => handleInputBlur("code")}
          variant={inputType}
          type="number"
          label={`${t('enterConfirmationCode')}*`}
          error={!!errors.code}
          helperText={errors.code ? errors.code : ""}
          sx={{width: "100%"}}
          size={inputSize}
          className={styles.myInput}
        />
      </Box>
      {/*{
        !isSubscriber() && (!Boolean(personHasAccept)) ?
            renderCheckboxAndText()
            : null
      }*/}
      <div className="__center" style={{width: "100%", height: "72px"}}>
        {showCountDownTimer ? (
          <Countdown
            date={Date.now() + 120000}
            precision={0}
            onComplete={() => {
              setCanResendCode(true);
              setShowCountDownTimer(false);
            }}
            renderer={props => {
              console.log("Props::: ", props);
              return (
                <div>
                  {intToStr(props.minutes)}&nbsp;:&nbsp;{intToStr(props.seconds)}{" "}
                </div>
              );
            }}
          />
        ) : (
          <></>
        )}
      </div>
      <div className="__flex-row">
        <div className="__flex_item __right">
          <Button
            disabled={!canResendCode}
            fullWidth
            variant="contained"
            color="secondary"
            size="large"
            sx={{mt: 3}}
            onClick={handleResendCode}>
            {t('resendCode')}
          </Button>
          &nbsp;&nbsp;&nbsp;&nbsp;
          {!(!isSubscriber() && (!Boolean(personHasAccept))) ? <Button
            fullWidth
            variant="contained"
            size="large" sx={{mt: 3}}
            onClick={handleSubmit}
          >
            {t('confirmSubscription')}
          </Button>:
            <Button
            fullWidth
            variant="contained"
            size="large" sx={{mt: 3}}
            onClick={handleOpenCondition}
            >
          {t('confirmSubscription')}
            </Button>}
        </div>
      </div>
      <UsageConditionModal
        ref={usageConditionRef}
        title={t("usageConditionsTitle")}
        onConfirm={handleSubmitOnModal}
        onCancel={() => usageConditionRef.current?.close()}
        onHandleSetIsBottom={setIsBottom}
        isBottom={isBottom}
      />
    </div>
  );
};

export default SousConfirmForm;
