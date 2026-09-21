import React, {useCallback, useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {getAccess, updateAccess} from "@/services/accessService";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import accessCreateValidationSchema from "@/validations/access/createAccessValidationSchema";
import {getAllAccounts} from "@/services/accountService";
import {
  ADMINCODE,
  ANIMATORCODE,
  DIRECTEUR_COMMERCIAL,
  getAllRoles,
  INSPECTORCODE,
  MANAGERCODE,
  PDG,
  PROVIDERCODE,
  REFERENT_TECHNIQUE,
  SERVICE_CLIENT,
  TRESORIER,
} from "@/services/roleService";
import {Button, Paper, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import ActivityIndicator from "@/components/ActivityIndicator";
import Toast from "@/utils/toast";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import {ACCESS_PAGE} from "@/utils/routes/routes";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useAppContext} from "@/contexts/appContext";
import {getToken, getUid, toCaptitalize} from "@/utils";
import AccessService from "@/services/Access";
import {canInterprateError, displayHttpError} from "@/utils/api";
import Account from "@/services/Account";
import DefaultSchema from "@/utils/DefaultSchema";
import {onInputBlur} from "@/utils/api/validate";
import validate from "validate.js";
import {useTranslation} from "react-i18next";

const AccessUpdate = () => {
  const {t} = useTranslation();
  const [accessUid, setAccessUid] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [roles, setRoles] = useState([]);
  const [account, setAccount] = useState(null);
  const [role, setRole] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [code, setCode] = useState("");
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const context = useAppContext();
  const [errors, setErrors] = React.useState({});
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);

  const validationSchema = {
    account: DefaultSchema.text(t),
    role: DefaultSchema.text(t),
    status: DefaultSchema.text(t),
    code: DefaultSchema.text(t),
  };

  const statuses = [{label: "active"}, {label: "inactive"}];

  //utils state for updation
  const [accountToUpdate, setAccountToUpdate] = useState();
  const [roleToUpdate, setRoleToUpdate] = useState();

  //  token
  const token = getToken();

  const getCurrentAccess = useCallback(async () => {
    const result = await AccessService.show(token, getUid());
    if (result.error == null && result.data != null) {
      setAccount(result.data.account.uid);
      setRole(result.data.role.uid);
      setSelectedStatus(result.data.status);
      setCode(result.data.code);
      //
      setAccountToUpdate(result.data.account);
      setRoleToUpdate(result.data.role);
      setReady(true);
    } else {
      displayHttpError(result.error, router);
    }
  }, [router, token]);

  const getAccount = useCallback(async () => {
    const result = await Account.get(token);
    if (result.error === null) {
      setAccounts(result.data.accounts);
    } else {
      if (canInterprateError(result.error, router)) {
        Toast.error(result.error.response.data.message);
      } else Toast.error(t("AnErrorOccurred"));
    }
  }, [token, router]);

  const getRoles = useCallback(async () => {
    const result = await getAllRoles(token, '', '', 10, 1);
    if (result.error === null) {
      setRoles(result.data.roles);
    } else {
      if (canInterprateError(result.error, router)) {
        Toast.error(result.error.response.data.message);
      } else Toast.error(t("AnErrorOccurred"));
    }
  }, [token, router]);

  const getDatas = useCallback(async () => {
    await getAccount();
    await getRoles();
    await getCurrentAccess();
  }, [getAccount, getRoles, getCurrentAccess]);

  useEffect(() => {
    setAccessUid(getUid());
    getDatas();
  }, [getDatas]);

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
    account,
    role,
    status: selectedStatus,
    code,
  });

  const roleCodes = [
    INSPECTORCODE,
    MANAGERCODE,
    ANIMATORCODE,
    DIRECTEUR_COMMERCIAL,
    SERVICE_CLIENT,
    REFERENT_TECHNIQUE,
    TRESORIER,
    PDG,
  ];
  //  create access
  const onSubmit = async data => {
    setInProgress(true);
    const result = await AccessService.update(token, getUid(), data);
    if (result.error == null) {
      Toast.success(t("AccessSuccessfullyModified"));
      context.togglePageLoading(true);
      router.push(ACCESS_PAGE);
    } else displayHttpError(result.error, router);
    setInProgress(false);
  };

  //  handle account uid change
  const handleAccountOptionChange = (e, newAccount) => {
    if (newAccount !== null) setAccount(newAccount.uid);
  };

  //  set the role uid
  const handleRoleOptionChange = (e, role) => {
    if (role !== null) setRole(role.uid);
  };

  const getAutoValue = (_uid, tab = []) => {
    const selected = tab.filter(item => item.uid === _uid);
    if (selected.length) return selected[0];
    return null;
  };

  const handleSubmit = () => {
    if (validateForm()) onSubmit(getData());
    else {
      Toast.error(t("PleaseFillTheFormCorrectly"));
    }
  };

  return (
    <>
      {!ready ? (
        <CreateFormSkeleton />
      ) : (
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
          <Paper elevation={2} sx={{padding: "40px 24px", mb: 3, position: "relative"}} className="brSm">
            <ActivityIndicator visible={inProgress} />
            <Typography variant="h5" component="h5" mb={2}>
              {t("ModifyAccess")}
            </Typography>
            <Grid container spacing={4}>
              <Grid xs={12} md={6} lg={6} xl={6}>
                <Autocomplete
                  id="account"
                  options={accounts}
                  value={getAutoValue(account, accounts)}
                  getOptionLabel={option => `${option.first_name} ${option.last_name}`}
                  onBlur={() => handleInputBlur("account")}
                  onChange={handleAccountOptionChange}
                  disabled={true}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t("selectAnAccount")}
                      variant="filled"
                      error={errors.account && true}
                      helperText={errors.account ? errors.account : ""}
                      disabled={true}
                    />
                  )}
                />
              </Grid>
              <Grid xs={12} md={6} lg={6} xl={6}>
                <Autocomplete
                  id="role"
                  options={roles}
                  value={getAutoValue(role, roles)}
                  onBlur={() => handleInputBlur("role")}
                  onChange={handleRoleOptionChange}
                  disabled={true}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t("role")}
                      variant="filled"
                      error={errors.role && true}
                      helperText={errors.role ? errors.role : ""}
                      disabled={true}
                    />
                  )}
                />
              </Grid>
              <Grid xs={12} md={6} lg={6} xl={6}>
                <Autocomplete
                  id="status"
                  value={{label: selectedStatus}}
                  getOptionLabel={option => toCaptitalize(option.label)}
                  onChange={(e, val) => {
                    setSelectedStatus(val.label);
                  }}
                  onBlur={() => handleInputBlur("status")}
                  options={statuses}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t("status")}
                      variant="filled"
                      error={errors.status && true}
                      helperText={errors.status ? errors.status : ""}
                    />
                  )}
                />
              </Grid>
              {roleToUpdate.code !== ADMINCODE && (
                <Grid xs={12} md={6} lg={6} xl={6}>
                  <TextField
                    variant="filled"
                    id="code"
                    label={t("code")}
                    value={code}
                    onChange={e => {
                      setCode(e.target.value);
                    }}
                    onBlur={() => handleInputBlur("code")}
                    fullWidth
                    error={errors.code && true}
                    helperText={errors.code ? errors.code : ""}
                    disabled={roleToUpdate.code !== PROVIDERCODE}
                  />
                </Grid>
              )}
              <Grid container xs={12} md={6} lg={12} xl={12}>
                <Grid xs={12} md={12} lg={2} xl={2}>
                  <Button
                    onClick={handleSubmit}
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{mt: 1}}
                    className="brSm">
                    {t("update")}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </>
  );
};

export default AccessUpdate;
