"use client";

import React, { useCallback, useEffect, useState } from "react";
import styles from "@/styles/sysCompte.module.scss";
import { Box, Button, Paper, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import { Add, ClearOutlined } from "@mui/icons-material";
import { h7 } from "@/utils/style";
import DefaultSchema from "@/utils/DefaultSchema";
import { onInputBlur } from "@/utils/api/validate";
import validate from "validate.js";
import Toast from "@/utils/toast";
import { getAutocompleteValue, getToken, getUrlParams } from "@/utils";
import SousTestData from "@/components/souscription/SousTestData";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";
import IntlPhoneField from "@/components/IntlPhoneField";
import { useTranslation } from "react-i18next";
import UtilMethods from "@/utils/UtilMethods";

const inputType = "filled";
const inputSize = "normal";

const SousFormStep4 = ({
                         onContinue,
                         onBack,
                         onSaveAsDraft,
                         data = [],
                         filiationsTab = [],
                         editing = false,
                         isDraft = false,
                         updating = false,
                         isContract = false,
                       }) => {
  const [filiation, setFiliation] = useState("");
  const [name, setName] = useState("");
  const [firstname, setFirstname] = useState("");
  const [phone1, setPhone1] = useState("");
  const [email, setEmail] = useState("");
  const [uid, setUid] = useState(""); // New state for UID
  const [errors, setErrors] = useState({});
  const [liste, setListe] = useState(data);
  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  const token = getToken();
  const { t, i18n } = useTranslation();

  const validationSchema = {
    name: DefaultSchema.text(t),
    phone1: DefaultSchema.phone(t),
    email: {email: {message: `^${t("invalidEmailAddress")}`}},
  };

  useEffect(() => {
    let params = getUrlParams();
    if (params.length) {
      params.forEach(item => {
        if (item.label === "test") {
          if (SousTestData[item.value]) initForm(SousTestData[item.value].step4);
        }
      });
    }
    setListe(data);
  }, [data]);

  const handleInputBlur = _key => {
    const validatedErrors = onInputBlur(_key, getData(), validationSchema, errors);
    setErrors(validatedErrors);
    forceUpdate();
  };

  const validateForm = () => {
    const validation = validate(getData(), validationSchema);
    setErrors(validation ?? {});
    console.log(validation);
    return !validation;
  };

  useEffect(() => {
    setErrors(currentErrors =>
      Object.keys(currentErrors).length ? (validate(getData(), validationSchema) ?? {}) : currentErrors,
    );
  }, [i18n.language]);

  const handleSubmit = (_onSubscribe = false) => {
    if (liste.length === 0) {
      addItemToList(() => onContinue([getData()], _onSubscribe));
    } else {
      onContinue(liste, _onSubscribe);
      setErrors({});
    }
  };

  const handleDraft = () => {
    if (liste.length === 0) {
      addItemToList(() => onSaveAsDraft([getData()]));
    } else {
      onSaveAsDraft(liste);
      setErrors({});
    }
  };

  const getData = () => {
    return {
      filiation,
      name,
      firstname,
      phone1,
      email,
      uid, // Include UID in the data
    };
  };

  const initForm = (_data = {}) => {
    setFiliation(_data.filiation ?? "");
    setName(_data.name ?? "");
    setFirstname(_data.firstname ?? "");
    setPhone1(_data.phone1 ?? "");
    setEmail(_data.email ?? "");
    setUid(_data.uid ?? ""); // Initialize UID
  };

  const resetForm = () => {
    initForm();
  };

  const personAlreadyAdded = _data => {
    let element = liste.filter(item => {
      return (item.email === _data.email && _data.email !== "") || (item.phone1 === _data.phone1 && _data.phone1 !== "") || (item.uid === _data.uid && _data.uid !== "");
    });
    return element.length;
  };

  const addItemToList = _callback => {
    if (validateForm()) {
      const currentList = liste;
      if (personAlreadyAdded(getData())) {
        Toast.errorKey("thePersonHasAlreadyBeenAdded");
      } else {
        currentList.push(getData());
        console.log(currentList)
        setListe(currentList);
        resetForm();
        if (_callback) _callback();
      }
    } else {
      Toast.errorKey("pleaseCompleteTheFormCorrectly");
    }
  };

  return (
    <div style={{width: "100%"}}>
      <Grid container spacing={2} sx={{mt: 0}}>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <Autocomplete
            disabled={(UtilMethods.isAdmin() || UtilMethods.isSubscriber()) && isContract}
            onChange={(e, option) => {
              setFiliation(option.value);
            }}
            options={filiationsTab}
            value={getAutocompleteValue(filiation, filiationsTab)}
            onBlur={() => handleInputBlur("filiation")}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
            renderInput={params => (
              <TextField
                {...params}
                variant={inputType}
                label={t("affiliation")}
                error={!!errors.filiation}
                helperText={errors.filiation ? errors.filiation : ""}
              />
            )}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
            disabled={(UtilMethods.isAdmin() || UtilMethods.isSubscriber()) && isContract}
            onChange={e => {
              setName(e.target.value);
            }}
            value={name}
            onBlur={() => handleInputBlur("name")}
            variant={inputType}
            type="text"
            label={`${t("lastName")}*`}
            error={!!errors.name}
            helperText={errors.name ? errors.name : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
            disabled={(UtilMethods.isAdmin() || UtilMethods.isSubscriber()) && isContract}
            onChange={e => {
              setFirstname(e.target.value);
            }}
            value={firstname}
            onBlur={() => handleInputBlur("firstname")}
            variant={inputType}
            type="text"
            label={`${t("firstName")}`}
            error={!!errors.firstname}
            helperText={errors.firstname ? errors.firstname : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <IntlPhoneField
            disabled={(UtilMethods.isAdmin() || UtilMethods.isSubscriber()) && isContract}
            onChange={e => {
              setPhone1(e);
            }}
            value={phone1}
            onBlur={() => handleInputBlur("phone1")}
            variant={inputType}
            type="tel"
            label={`${t("mainPhone")}*`}
            error={!!errors.phone1}
            helperText={errors.phone1 ? errors.phone1 : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
            disabled={(UtilMethods.isAdmin() || UtilMethods.isSubscriber()) && isContract}
            onChange={e => {
              setEmail(e.target.value);
            }}
            value={email}
            onBlur={() => handleInputBlur("email")}
            variant={inputType}
            type="email"
            label={t("emailAddress")}
            error={!!errors.email}
            helperText={errors.email ? errors.email : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6} sx={{display: 'none!important'}}>
          <TextField
            disabled={(UtilMethods.isAdmin() || UtilMethods.isSubscriber()) && isContract}
            onChange={e => {
              setUid(e.target.value);
            }}
            value={uid}
            onBlur={() => handleInputBlur("uid")}
            variant={inputType}
            type="text"
            label={t("uid")}
            error={!!errors.uid}
            helperText={errors.uid ? errors.uid : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <Button fullWidth variant="text" size="large" sx={{mt: 3}} onClick={() => addItemToList()}>
            <Add />
            &nbsp;{t("add")}
          </Button>
        </Grid>
      </Grid>
      <Box>
        {liste.map((item, index) => (
          <Paper
            key={index}
            sx={{mt: 2, mb: 2, cursor: "pointer", padding: "10px 16px"}}
            elevation={2}
            className="__positionned">
            <div
              onClick={() => {
                initForm(item);
                const currentList = liste;
                currentList.splice(index, 1);
                setListe(currentList);
              }}>
              <div className="__flex-row">
                <Typography sx={h7}>{t("beneficiary")} :&nbsp;</Typography>
                <Typography sx={{...h7, fontWeight: "normal"}}>{index + 1}</Typography>
              </div>
              <div className="__flex-row">
                <Typography variant="subtitle1" sx={{fontWeight: "600"}}>
                  {t("affiliation")} :&nbsp;
                </Typography>
                <Typography variant="subtitle1">
                  {filiationsTab.filter(elem => elem.value === item.filiation).map(elem => elem.label)}
                </Typography>
              </div>
              <div className="__flex-row">
                <Typography variant="subtitle1" sx={{fontWeight: "600"}}>
                  {t("names")} :&nbsp;
                </Typography>
                <Typography variant="subtitle1">
                  {item.firstname} {item.name}
                </Typography>
              </div>
              <div className="__flex-row">
                <Typography variant="subtitle1" sx={{fontWeight: "600"}}>
                  {t("phoneNumber")} :&nbsp;
                </Typography>
                <Typography variant="subtitle1">{item.phone1}</Typography>
              </div>
              {item.uid && (
                <div className="__flex-row">
                  <Typography variant="subtitle1" sx={{fontWeight: "600"}}>
                    {t("uid")} :&nbsp;
                  </Typography>
                  <Typography variant="subtitle1">{item.uid}</Typography>
                </div>
              )}
            </div>
            <IconButton
              className="__clear-close"
              onClick={() => {
                const currentList = liste;
                currentList.splice(index, 1);
                setListe(currentList);
                forceUpdate();
              }}>
              <ClearOutlined />
            </IconButton>
          </Paper>
        ))}
      </Box>
      <Grid container spacing={2} sx={{mt: 0}}>
        <Grid xs={12} md={4} lg={4} xl={4}>
          <Button fullWidth variant="contained" size="large" color="error" onClick={onBack}>
            {t("back")}
          </Button>
        </Grid>
        <Grid xs={12} md={4} lg={4} xl={4}>
          {!editing && token != null && token !== "" ? (
            <Button fullWidth variant="contained" size="large" color="secondary" onClick={handleDraft}>
              {t("draft")}
            </Button>
          ) : isDraft ? (
            <Button fullWidth variant="contained" size="large" onClick={() => handleSubmit(false)}>
              {t("save")}
            </Button>
          ) : (
            <></>
          )}
        </Grid>
        <Grid xs={12} md={4} lg={4} xl={4}>
          <Button fullWidth variant="contained" size="large" onClick={() => handleSubmit(true)}>
            {updating && isContract ? t("save") : t("subscribe")}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default SousFormStep4;
