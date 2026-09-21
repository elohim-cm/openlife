"use client";
import React from "react";
import styles from "@/styles/sysCompte.module.scss";
import {Box, Button, Paper, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {Add, ClearOutlined} from "@mui/icons-material";
import DefaultSchema from "@/utils/DefaultSchema";
import {onInputBlur} from "@/utils/api/validate";
import validate from "validate.js";
import Toast from "@/utils/toast";
import Autocomplete from "@mui/material/Autocomplete";
import {getAutocompleteValue} from "@/utils";
import IconButton from "@mui/material/IconButton";
import {useTranslation} from "react-i18next";

const inputType = "filled";
const inputSize = "normal";

const SousFormStep2 = ({onContinue, onBack, data = [], souscriberData, filiationsTab = []}) => {
  const [filiation, setFiliation] = React.useState("");
  const [filiationLabel, setFiliationLabel] = React.useState("");
  const [name, setName] = React.useState("");
  const [firstname, setFirstname] = React.useState("");
  const [phone1, setPone1] = React.useState("");
  const [birthplace, setBirthplace] = React.useState("");
  const [birthdate, setBirthdate] = React.useState("");
  const [residence, setResidence] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [errors, setErrors] = React.useState({});
  const [liste, setListe] = React.useState(data);
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const {t, i18n} = useTranslation();

  const validationSchema = {
    name: DefaultSchema.text(t),
    filiation: DefaultSchema.text(t),
    firstname: DefaultSchema.text(t),
    phone1: DefaultSchema.telephone(t),
    birthdate: DefaultSchema.text(t),
    birthplace: DefaultSchema.text(t),
    residence: DefaultSchema.text(t),
    email: {email: {message: `^${t("invalidEmailAddress")}`}},
  };

  React.useEffect(() => {
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

  React.useEffect(() => {
    setErrors(currentErrors =>
      Object.keys(currentErrors).length ? (validate(getData(), validationSchema) ?? {}) : currentErrors,
    );
  }, [i18n.language]);

  const handleFiliationChange = _filiation => {
    if (_filiation.label === "Moi-même") {
      console.log("Subscriber data::: ", souscriberData);
      setFiliationLabel(_filiation.label);
      initForm({...souscriberData, filiation: _filiation.value});
    }
  };

  const handleSubmit = () => {
    if (liste.length === 0) {
      addItemToList(() => onContinue([getData()]));
    } else {
      onContinue(liste);
      setErrors({});
    }
  };

  const getData = () => {
    return {
      filiation,
      name,
      firstname,
      phone1,
      birthplace,
      birthdate,
      email,
      residence,
      filiationLabel,
    };
  };

  const initForm = (_data = {}) => {
    setFiliation(_data.filiation ?? "");
    setName(_data.name ?? "");
    setFirstname(_data.firstname ?? "");
    setPone1(_data.phone1 ?? "");
    setBirthplace(_data.birthplace ?? "");
    setBirthdate(_data.birthdate ?? "");
    setResidence(_data.residence ?? "");
    setEmail(_data.email ?? "");
  };

  const resetForm = () => {
    initForm();
  };

  const personAlreadyAdded = _data => {
    let element = liste.filter(item => {
      return item.email === _data.email || item.phone1 === _data.phone1;
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
            onChange={(e, option) => {
              setFiliation(option.value);
              const tab = filiationsTab.filter(item => item.value === option.value);
              if (tab.length) handleFiliationChange(tab[0]);
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
                label={`${t("affiliation")}*`}
                error={!!errors.filiation}
                helperText={errors.filiation ? errors.filiation : ""}
              />
            )}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
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
            onChange={e => {
              setFirstname(e.target.value);
            }}
            value={firstname}
            onBlur={() => handleInputBlur("firstname")}
            variant={inputType}
            type="text"
            label={`${t("firstName")}*`}
            error={!!errors.firstname}
            helperText={errors.firstname ? errors.firstname : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
            onChange={e => {
              setPone1(e.target.value);
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
            onChange={e => {
              setBirthplace(e.target.value);
            }}
            value={birthplace}
            onBlur={() => handleInputBlur("birthplace")}
            variant={inputType}
            type="text"
            label={`${t("placeOfBirth")}*`}
            error={!!errors.birthplace}
            helperText={errors.birthplace ? errors.birthplace : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
            onChange={e => {
              setBirthdate(e.target.value);
            }}
            value={birthdate}
            onBlur={() => handleInputBlur("birthdate")}
            variant={inputType}
            type="date"
            label={`${t("dateOfBirth")}*`}
            InputLabelProps={{shrink: true}}
            error={!!errors.birthdate}
            helperText={errors.birthdate ? errors.birthdate : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
            onChange={e => {
              setEmail(e.target.value);
            }}
            value={email}
            onBlur={() => handleInputBlur("email")}
            variant={inputType}
            type="email"
            label={`${t("emailAddress")}*`}
            error={!!errors.email}
            helperText={errors.email ? errors.email : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
            onChange={e => {
              setResidence(e.target.value);
            }}
            value={residence}
            onBlur={() => handleInputBlur("residence")}
            variant={inputType}
            type="text"
            label={`${t("residenceAddress")}*`}
            error={!!errors.residence}
            helperText={errors.residence ? errors.residence : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <div></div>
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <Button fullWidth variant="text" size="large" sx={{mt: 3, display: "flex"}} onClick={() => addItemToList()}>
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
                <Typography variant="h6" sx={{fontWeight: "600"}}>
                  {t("beneficiary")} :&nbsp;
                </Typography>
                <Typography variant="h6">{index + 1}</Typography>
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
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <Button fullWidth variant="contained" size="large" color="error" onClick={onBack}>
            {t("back")}
          </Button>
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <Button fullWidth variant="contained" size="large" onClick={handleSubmit}>
            {t("continue")}
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default SousFormStep2;
