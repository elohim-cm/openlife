"use client";

import React from "react";
import {Button, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import styles from "@/styles/sysCompte.module.scss";
import validate from "validate.js";
import "@/styles/flex.scss";
import ActivityIndicator from "@/components/ActivityIndicator";
import MDPaper from "@/material/components/MDPaper";
import {updateRole} from "@/services/roleService";
import Toast from "@/utils/toast";
import {useRouter} from "next/navigation";
import Routes from "@/utils/routes";
import DefaultSchema from "@/utils/DefaultSchema";
import {useAppContext} from "@/contexts/appContext";
import {onInputBlur} from "@/utils/api/validate";
import {displayHttpError} from "@/utils/api";
import {useTranslation} from "react-i18next";

const inputType = "filled";
const inputSize = "small";

/**
 *
 * @param token
 * @param data {{label: string, description: string, code: string, uid: string}}
 * @returns {Element}
 * @constructor
 */
const RoleUpdateForm = ({token, data}) => {
  const {t} = useTranslation();
  const [label, setLabel] = React.useState(data.label);
  const [description, setDescription] = React.useState(data.description);
  const [code, setCode] = React.useState(data.code);
  const [errors, setErrors] = React.useState({});
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const [inProgress, setInProgress] = React.useState(false);

  const validationSchema = {
    label: DefaultSchema.text(t),
    description: DefaultSchema.text(t),
    code: DefaultSchema.text(t),
  };

  const context = useAppContext();
  const router = useRouter();

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

  const getData = () => ({
    label,
    description,
    code,
  });

  const onSubmit = async _data => {
    setInProgress(true);
    let result = await updateRole(token, _data, data.uid);
    if (!result.error) {
      Toast.success(t("roleUpdatedSuccessfully"));
      context.togglePageLoading(true);
      router.push(Routes.ROLES);
    } else {
      displayHttpError(result.error, router);
    }
    setInProgress(false);
  };

  const handleSubmit = () => {
    if (validateForm()) onSubmit(getData());
    else {
      Toast.error(t("pleaseCompleteTheFormCorrectly"));
    }
  };

  return (
    <MDPaper className="__positionned" elevation={3} sx={{borderRadius: 2, padding: "40px 24px"}}>
      <ActivityIndicator visible={inProgress} />
      <Typography variant="h5" component="h5" sx={{mb: 3}}>
        {t("updateRole")}
      </Typography>
      <Grid container spacing={2}>
        <Grid xs={12} md={6} lg={4} xl={6}>
          <TextField
            onChange={e => {
              setLabel(e.target.value);
            }}
            value={label}
            onBlur={() => handleInputBlur("label")}
            id="label-role"
            variant={inputType}
            type="text"
            label={`${t("label")}*`}
            error={!!errors.label}
            helperText={errors.label ? errors.label : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
        <Grid xs={12} md={6} lg={4} xl={6}>
          <TextField
            onChange={e => {
              setCode(e.target.value);
            }}
            value={code}
            id="code-role"
            onBlur={() => handleInputBlur("code")}
            multiline={true}
            variant={inputType}
            type="text"
            label={`${t("code")}*`}
            error={!!errors.code}
            helperText={errors.code ? errors.code : ""}
            sx={{width: "100%"}}
            size={inputSize}
            className={styles.myInput}
          />
        </Grid>
      </Grid>
      <Grid container sx={{mt: 2, mb: 2}}>
        <TextField
          onChange={e => {
            setDescription(e.target.value);
          }}
          value={description}
          id="desc-role"
          onBlur={() => handleInputBlur("description")}
          multiline={true}
          variant={inputType}
          type="text"
          label={`${t("description")}*`}
          error={!!errors.description}
          helperText={errors.description ? errors.description : ""}
          sx={{width: "100%"}}
          size={inputSize}
          className={styles.myInput}
        />
      </Grid>
      <Grid container>
        <Grid xs={12} md={6} lg={4} xl={4}>
          <Button onClick={handleSubmit} type="submit" fullWidth variant="contained" size="large" sx={{mt: 3, mb: 2}}>
            {t("update")}
          </Button>
        </Grid>
      </Grid>
    </MDPaper>
  );
};

export default RoleUpdateForm;
