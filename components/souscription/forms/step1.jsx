"use client";
import React from "react";
import styles from "@/styles/sysCompte.module.scss";
import {Button, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, TextField} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import {compressImage, getAutocompleteValue, getFirstLetter, getRoleCode, getToken, getUrlParams} from "@/utils";
import DefaultSchema, {isPhoneValid} from "@/utils/DefaultSchema";
import {onInputBlur} from "@/utils/api/validate";
import validate from "validate.js";
import Toast from "@/utils/toast";
import SousTestData from "@/components/souscription/SousTestData";
import moment from "moment";
import Constants from "@/utils/constants";
import Autocomplete from "@mui/material/Autocomplete";
import IntlPhoneField from "@/components/IntlPhoneField";
import {useTranslation} from "react-i18next";
import UtilMethods from "@/utils/UtilMethods";
import {MomentAdapter} from "@mui/x-date-pickers/AdapterMoment";
import {DateTimePicker} from "@mui/x-date-pickers/DateTimePicker";
import {LocalizationProvider} from "@mui/x-date-pickers/LocalizationProvider";
import {DatePicker} from "@mui/lab";
import ContractModel from "@/models/Contract";

const inputType = "filled";
const inputSize = "normal";
const SousFormStep1 = ({
  onContinue,
  data = {},
  gendersTab = [],
  situationsTab = [],
  personsTab = [],
  updating = false,
  isContract = false,
  dueDate=null,
  onHandleChangeDueDate = () => {},
  ctr_status=null,
  onHandleChangeCtrStatus = () => {},
  __statuses = []
}) => {
  const [prime, setPrime] = React.useState(data.prime ?? "");
  const [duration, setDuration] = React.useState(data.duration ?? "");
  const [situation, setSituation] = React.useState(data.situation ?? "");
  const [sexe, setSexe] = React.useState(data.sexe ?? "");
  const [name, setName] = React.useState(data.name ?? "");
  const [firstname, setFirstname] = React.useState(data.firstname ?? "");
  const [phone1, setPone1] = React.useState(data.phone1 ?? "");
  const [phone2, setPhone2] = React.useState(data.phone2 ?? "");
  const [birthplace, setBirthplace] = React.useState(data.birthplace ?? "");
  const [birthdate, setBirthdate] = React.useState(data.birthdate ?? "");
  const [residence, setResidence] = React.useState(data.residence ?? "");
  const [email, setEmail] = React.useState(data.email ?? "");
  const [niu, setNIU] = React.useState(data.niu ?? "");
  const [cni, setCNI] = React.useState(data.cni ?? "");
  const [expirationCni, setExpirationCNI] = React.useState(data.expirationCni ?? "");
  const [scanCni1, setScanCNI1] = React.useState("");
  const [scanCni2, setScanCNI2] = React.useState("");
  const [cniFile1, setCniFile1] = React.useState(null);
  const [cniFile2, setCniFile2] = React.useState(null);
  const [person, setPerson] = React.useState("");
  const [firstRender, setFirstRender] = React.useState(true);
  const [showCni, setShowCni] = React.useState(true);
  const [errors, setErrors] = React.useState({});
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const {t, i18n} = useTranslation();

  let validationSchema = {
    prime: {
      numericality: {
        onlyInteger: true,
        greaterThan: 199,
        lessThanOrEqualTo: 100000,
        notInteger: `^${t("wholeNumberRequired")}`,
        notGreaterThan: `^${t("minimumPrimeAmount")}`,
        notLessThanOrEqualTo: `^${t("maximumPrimeAmount")}`,
      },
    },
    duration: {
      numericality: {
        onlyInteger: true,
        greaterThan: 0,
        notInteger: `^${t("wholeNumberRequired")}`,
        notGreaterThan: `^${t("positiveDurationRequired")}`,
        // lessThanOrEqualTo: 13,
      },
    },
    name: DefaultSchema.text(t),
    sexe: DefaultSchema.text(t),
    phone1: DefaultSchema.phone(t),
    birthdate: DefaultSchema.date(t),
    birthplace: DefaultSchema.text(t),
    residence: DefaultSchema.text(t),
    email: {email: {message: `^${t("invalidEmailAddress")}`}},
    cni: DefaultSchema.text(t),
    expirationCni: DefaultSchema.date(t),
    scanCni1: DefaultSchema.text(t),
  };

  React.useEffect(() => {
    if (firstRender) {
      let params = getUrlParams();
      console.log("First render params:: ", params, data);
      if (params.length) {
        params.forEach(item => {
          if (item.label === "prime") setPrime(item.value);
          if (item.label === "duration") setDuration(item.value);
          if (item.label === "test") {
            if (SousTestData[item.value]) initForm(SousTestData[item.value].step1);
          }
        });
      }
      setFirstRender(false);
    }
  }, []);

  React.useEffect(() => {
    if (data.email) initForm(data);
  }, [data]);

  const handleInputBlur = _key => {
    const validatedErrors = onInputBlur(_key, getData(), validationSchema, errors);
    setErrors(validatedErrors);
    forceUpdate();
  };

  const validateForm = () => {
    if (updating && !showCni) {
      delete validationSchema.scanCni1;
      delete validationSchema.scanCni2;
    }
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

  const handleSubmit = () => {
    const datasTest = getData()
    let __phone2 = getData().phone2

    if(!isPhoneValid(__phone2)){
      datasTest.phone2 = ""
    }

    if (validateForm()) onContinue(datasTest);
    else {
      Toast.errorKey("pleaseCompleteTheFormCorrectly");
    }
  };

  const editable = () => {
    return updating && (getRoleCode() === Constants.ROLES.sous || getRoleCode() === Constants.ROLES.admin || getRoleCode() === Constants.ROLES.scl);
  };

  const initForm = (_data = {}) => {
    console.log("Step 1 default datas::: ", _data, data);
    setPrime(_data.prime ?? "");
    setDuration(_data.duration ?? "");
    setSexe(_data.sexe ?? "");
    setSituation(_data.situation ?? "");
    setName(_data.name ?? "");
    setFirstname(_data.firstname ?? "");
    setPone1(_data.phone1 ?? "");
    setPhone2(_data.phone2 ?? "");
    setBirthplace(_data.birthplace ?? "");
    setBirthdate(_data.birthdate ?? "");
    setExpirationCNI(_data.expirationCni ?? "");
    setEmail(_data.email ?? "");
    setResidence(_data.residence ?? "");
    setNIU(_data.niu ?? "");
    setCNI(_data.cni ?? "");
    setScanCNI1(_data.scanCni1 ?? "");
    setScanCNI2(_data.scanCni2 ?? "");
    if (updating) {
      handleShowCni(false);
    }
  };

  const getData = () => {
    return {
      prime,
      situation,
      sexe,
      duration,
      name,
      firstname,
      phone1,
      phone2,
      birthplace,
      birthdate,
      residence,
      email,
      niu,
      cni,
      expirationCni,
      scanCni1,
      scanCni2,
      cniFile1,
      cniFile2
    };
  };

  const handleChangePerson = _person => {
    if (_person != null) {
      let values = _person;
      values.prime = prime;
      values.duration = duration;
      localStorage.setItem("personHasAcceptCondition", _person.has_accept_conditions);
      initForm(values);
    }
  };

  const handleShowCni = _val => {
    if (_val) {
      validationSchema.scanCni1 = DefaultSchema.text(t);
      setShowCni(true);
    } else {
      delete validationSchema.scanCni1;
      setShowCni(false);
    }
  };

  return (
    <div style={{width: "100%"}}>
      <Grid container spacing={2} sx={{mt: 0}}>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
            onChange={e => {
              setPrime(e.target.value);
            }}
            value={prime}
            onBlur={() => handleInputBlur("prime")}
            variant={inputType}
            type="number"
            label={`${t("primeAmount")} (FCFA)*`}
            error={!!errors.prime}
            helperText={errors.prime ? errors.prime : ""}
            sx={{width: "100%"}}
            size={inputSize}
            inputProps={{readOnly: !editable(), min: 200, step: 1}}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
            onChange={e => {
              setDuration(e.target.value);
            }}
            value={duration}
            onBlur={() => handleInputBlur("duration")}
            variant={inputType}
            type="number"
            label={`${t("duration")} (${t("yearUnit")})*`}
            error={!!errors.duration}
            helperText={errors.duration ? errors.duration : ""}
            sx={{width: "100%"}}
            size={inputSize}
            inputProps={{readOnly: !editable(), min: 1, step: 1}}
            className={styles.myInput}
            InputProps={{
              readOnly: true,
            }}
          />
        </Grid>
        {(isContract && updating && UtilMethods.isCustomerService()) && <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
              onChange={e => {
                onHandleChangeDueDate(e.target.value)
              }}
              value={dueDate}
              variant={inputType}
              type="date"
              label={`${t("dueDate")}*`}
              InputLabelProps={{shrink: true}}
              error={!!errors.dueDate}
              helperText={errors.dueDate ? t("fieldRequired") : ""}
              sx={{width: "100%"}}
              size={inputSize}
              className={styles.myInput}
          />

        </Grid>}
        {(isContract && (ContractModel.getStatus() && ['fence', 'expired'].includes(ContractModel.getStatus())) && updating && UtilMethods.isCustomerService()) && <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <Autocomplete
              value={ctr_status}
              onChange={(e, value) => {
                onHandleChangeCtrStatus(value);
              }}
              getOptionLabel={option => `${option.label}`}
              options={__statuses}
              sx={{width: "100%"}}
              renderInput={(params) =>
                  <TextField
                    variant={inputType}
                    {...params}
                    label={t("status")}
                  />
              }
          />

        </Grid>}
        {getToken() != null && personsTab.length > 0 && !updating ? (
          <Grid xs={12} md={12} lg={12} xl={12}>
            <Autocomplete
              onChange={(e, value) => {
                setPerson(value ? value.uid : null);
                handleChangePerson(value);
              }}
              options={personsTab ?? []}
              getOptionLabel={option => `${option.name} ${option.firstname}`}
              value={getAutocompleteValue(person, personsTab, "uid")}
              onBlur={() => handleInputBlur("person")}
              onInputChange={(e, value) => {
                if (String(value).trim() === "") {
                  if (localStorage.getItem('personHasAcceptCondition') !== null)
                    localStorage.removeItem('personHasAcceptCondition');
                }
              }}
              sx={{width: "100%"}}
              size={inputSize}
              className={styles.myInput}
              disabled={isContract && updating && UtilMethods.isSubscriber()}
              renderInput={params => (
                <TextField
                  {...params}
                  variant={inputType}
                  error={!!errors.person}
                  helperText={errors.person ? errors.person : ""}
                  label={t("selectAPerson")}
                />
              )}
            />
          </Grid>
        ) : (
          <></>
        )}
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <Autocomplete
            onChange={(e, value) => {
              setSituation(value.value);
            }}
            options={situationsTab ?? []}
            value={getAutocompleteValue(situation, situationsTab)}
            onBlur={() => handleInputBlur("situation")}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
            disabled={isContract && updating && UtilMethods.isSubscriber()}
            renderInput={params => (
              <TextField
                {...params}
                variant={inputType}
                error={!!errors.situation}
                helperText={errors.situation ? errors.situation : ""}
                label={t("maritalStatus")}
              />
            )}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <FormControl error={!!errors.sexe} disabled={isContract && updating && UtilMethods.isSubscriber()}>
            <FormLabel id="sexe-radio" sx={{color: "black", fontSize: "12px"}}>
              {t("gender")}*
            </FormLabel>
            <RadioGroup
              row
              aria-labelledby="sexe-radio"
              name="sexe"
              value={sexe}
              onBlur={() => handleInputBlur("sexe")}
              onChange={(e, value) => {
                setSexe(value);
              }}>
              {gendersTab.map((item, index) => (
                <FormControlLabel
                  key={index}
                  value={item.uid}
                  control={<Radio size="small" />}
                  label={getFirstLetter(item.label)}
                  title={item.label}
                />
              ))}
            </RadioGroup>
          </FormControl>
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
            disabled={isContract && updating && UtilMethods.isSubscriber()}
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
            disabled={isContract && updating && UtilMethods.isSubscriber()}
            helperText={errors.firstname ? errors.firstname : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <IntlPhoneField
            onChange={e => {
              setPone1(e);
            }}
            value={phone1}
            onBlur={() => handleInputBlur("phone1")}
            variant={inputType}
            type="tel"
            label={`${t("mainPhone")}*`}
            error={!!errors.phone1}
            disabled={isContract && updating && UtilMethods.isSubscriber()}
            helperText={errors.phone1 ? errors.phone1 : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <IntlPhoneField
            onChange={e => {
              setPhone2(e);
            }}
            value={phone2}
            onBlur={() => handleInputBlur("phone2")}
            variant={inputType}
            type="tel"
            label={`${t("secondaryPhone")}`}
            error={!!errors.phone2}
            disabled={isContract && updating && UtilMethods.isSubscriber()}
            helperText={errors.phone2 ? errors.phone2 : ""}
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
            disabled={isContract && updating && UtilMethods.isSubscriber()}
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
              console.log("Date::: ", e.target.value);
            }}
            value={birthdate}
            onBlur={() => handleInputBlur("birthdate")}
            variant={inputType}
            type="date"
            label={`${t("dateOfBirth")}*`}
            InputLabelProps={{shrink: true}}
            error={!!errors.birthdate}
            disabled={isContract && updating && UtilMethods.isSubscriber()}
            helperText={errors.birthdate ? errors.birthdate : ""}
            sx={{width: "100%"}}
            size={inputSize}
            inputProps={{
              max: moment().subtract(Constants.minAgeSubscription, "years").format("YYYY-MM-DD"),
            }}
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
            disabled={isContract && updating && UtilMethods.isSubscriber()}
            helperText={errors.residence ? errors.residence : ""}
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
            disabled={isContract && updating && UtilMethods.isSubscriber()}
            helperText={errors.email ? errors.email : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
            onChange={e => {
              setNIU(e.target.value);
            }}
            value={niu}
            onBlur={() => handleInputBlur("niu")}
            variant={inputType}
            type="text"
            label={t("NIUnumber")}
            error={!!errors.niu}
            disabled={isContract && updating && UtilMethods.isSubscriber()}
            helperText={errors.niu ? errors.niu : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
            onChange={e => {
              setCNI(e.target.value);
            }}
            value={cni}
            onBlur={() => handleInputBlur("cni")}
            variant={inputType}
            type="text"
            label={`${t("idCNIOrIdPassport")}*`}
            error={!!errors.cni}
            disabled={isContract && updating && UtilMethods.isSubscriber()}
            helperText={errors.cni ? errors.cni : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <TextField
            onChange={e => {
              setExpirationCNI(e.target.value);
            }}
            value={expirationCni}
            onBlur={() => handleInputBlur("expirationCni")}
            variant={inputType}
            type="date"
            label={`${t("nationalIDExpirationDate")}*`}
            InputLabelProps={{shrink: true}}
            error={!!errors.expirationCni}
            disabled={isContract && updating && UtilMethods.isSubscriber()}
            helperText={errors.expirationCni ? errors.expirationCni : ""}
            sx={{width: "100%"}}
            size={inputSize}
            inputProps={{
              min: moment().format("YYYY-MM-DD"),
            }}
            className={styles.myInput}
          />
        </Grid>
        {showCni ? (
          <>
            <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
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
                label={`${t("cniScan")} (${t("mainFace")})*`}
                InputLabelProps={{shrink: true}}
                error={!!errors.scanCni1}
                disabled={isContract && updating && UtilMethods.isSubscriber()}
                helperText={errors.scanCni1 ? errors.scanCni1 : ""}
                sx={{width: "100%"}}
                size={inputSize}
                className={styles.myInput}
              />
            </Grid>
            <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
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
                label={`${t("cniScan")} (${t("secondaryFace")})`}
                InputLabelProps={{shrink: true}}
                error={!!errors.scanCni2}
                disabled={isContract && updating && UtilMethods.isSubscriber()}
                helperText={errors.scanCni2 ? errors.scanCni2 : ""}
                sx={{width: "100%"}}
                size={inputSize}
                className={styles.myInput}
              />
            </Grid>
          </>
        ) : (
          <></>
        )}
        {updating ? (
          <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
            <Button
              fullWidth
              variant="text"
              onClick={() => {
                handleShowCni(!showCni);
              }}>
              {showCni ? "Ne pas modifier la CNI" : "Modifier la CNI"}
            </Button>
          </Grid>
        ) : (
          <></>
        )}
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <div></div>
        </Grid>
        <Grid xs={12} sm={12} md={12} lg={6} xl={6}>
          <div></div>
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

export default SousFormStep1;
