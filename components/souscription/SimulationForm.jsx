"use client";

import React from "react";
import moment from "moment";
import {Box, Button, TextField, Typography} from "@mui/material";
import styles from "@/styles/sysCompte.module.scss";
import ActivityIndicator from "@/components/ActivityIndicator";
import {h7} from "@/utils/style";
import validate from "validate.js";
import {onInputBlur} from "@/utils/api/validate";
import Toast from "@/utils/toast";
import SubscriptionService from "@/services/SubscriptionService";
import {displayHttpError} from "@/utils/api";
import {useRouter} from "next/navigation";
import {useTranslation} from "react-i18next";

const inputType = "filled";
const inputSize = "small";

const DATA = [
  {id: 1, annee: "2023", amount: 200000, rachat_value: 300000, taux: 5},
  {id: 1, annee: "2023", amount: 200000, rachat_value: 300000, taux: 5},
  {id: 1, annee: "2023", amount: 200000, rachat_value: 300000, taux: 5},
  {id: 1, annee: "2023", amount: 200000, rachat_value: 300000, taux: 5},
  {id: 1, annee: "2023", amount: 200000, rachat_value: 300000, taux: 5},
];
const SimulationForm = ({onSubmit, token}) => {
  const [prime, setPrime] = React.useState("");
  const [duree, setDuree] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [inProgress, setInProgress] = React.useState(false);
  const [pageLoading, setPageLoading] = React.useState(false);
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const router = useRouter();
  const {t} = useTranslation();

  const validationSchema = {
    prime: {
      numericality: {
        onlyInteger: true,
        strict: true,
        greaterThan: 199,
        notGreaterThan: `^${t("minimumPrimeAmount")}`,
      },
    },
    duree: {
      numericality: {
        onlyInteger: true,
        strict: true,
        greaterThan: 0,
        notGreaterThan: `^${t("positiveDurationRequired")}`,
      },
    },
  };

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

  const handleSubmit = async () => {
    setInProgress(true);
    if (validateForm()) {
      /**
       *
       * @type {{data: {evolutions: {ordre: number, date: string, prime: number, rachat: number, valorisation: number}[]}, error: null}}
       */
      const result = await SubscriptionService.simuler(token, {duration: parseInt(duree), prime: parseInt(prime)});
      if (!result.error) {
        const tab = result.data?.evolutions
          .sort((a, b) => {
            return a.ordre < b.ordre;
          })
          .map((item, index) => ({
            id: index + 1,
            annee: moment(item.date).format("DD/MM/YYYY"),
            amount: item.prime,
            rachat_value: item.rachat,
            taux: item.valorisation,
          }));
        onSubmit(tab, {prime: parseInt(prime), duree: parseInt(duree)});
      } else {
        displayHttpError(result.error, router);
      }
    } else {
      Toast.error(t("pleaseCompleteTheFormCorrectly"));
    }
    setInProgress(false);
  };

  const getData = () => {
    return {prime, duree};
  };

  return (
    <div>
      <Box>
        <ActivityIndicator visible={inProgress} />
        <div align="center">
          <Typography sx={{mb: 3, ...h7}}>{t("subscriptionInformation")}</Typography>
        </div>
        <TextField
          onChange={e => {
            setPrime(e.target.value);
          }}
          onBlur={() => handleInputBlur("prime")}
          variant={inputType}
          type="number"
          label={`${t("primeAmount")} (FCFA)*`}
          error={!!errors.prime}
          helperText={errors.prime ?? ""}
          sx={{width: "100%"}}
          size={inputSize}
          inputProps={{min: 200, step: 1}}
          className={styles.myInput}
        />
        <TextField
          onChange={e => {
            setDuree(parseInt(e.target.value));
          }}
          onBlur={() => handleInputBlur("duree")}
          variant={inputType}
          type="number"
          label={`${t("contractDuration")} (${t("year")})*`}
          error={!!errors.duree}
          helperText={errors.duree ?? ""}
          sx={{width: "100%", mt: 2}}
          size={inputSize}
          inputProps={{min: 1, step: 1}}
          className={styles.myInput}
        />
        <Button fullWidth variant="contained" size="large" sx={{mt: 3}} onClick={handleSubmit}>
          {t("simulate")}
        </Button>
      </Box>
    </div>
  );
};

export default SimulationForm;
