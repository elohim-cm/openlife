import {Box, Button, Paper, TextField, Typography} from "@mui/material";
import React, {useCallback, useEffect, useState} from "react";
import Grid from "@mui/material/Unstable_Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import {useParams, useRouter} from "next/navigation";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import {getAllMenu} from "@/services/memuService";
import {getAllRoles} from "@/services/roleService";
import {getAllPermissions} from "@/services/permissionService";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Toast from "@/utils/toast";
import {AUTHORIZATION_LISTING_PAGE, NETWORK_LIST} from "@/utils/routes/routes";
import {useAppContext} from "@/contexts/appContext";
import DefaultSchema from "@/utils/DefaultSchema";
import {onInputBlur} from "@/utils/api/validate";
import validate from "validate.js";
import HabilitationService from "@/services/Habilitation";
import {displayHttpError} from "@/utils/api";
import ActivityIndicator from "@/components/ActivityIndicator";
import {getUid, toCaptitalize} from "@/utils";
import {Controller, useForm} from "react-hook-form";
import NetworkService from "@/services/NetworkService";
import {zodResolver} from "@hookform/resolvers/zod";
import validationSchemaToUpdate from "@/components/Network/updateValidationSchema";
import validationAuthToUpdate from "@/components/Authorization/validationAuthToUpdate";
import {DevTool} from "@hookform/devtools";
import {useTranslation} from "react-i18next";

const AuthorizationUpdate = () => {
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [authorization, setAuthorization] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const [ready, setReady] = useState(false);
  const [isLoading1, setIsloading1] = useState(false);
  const [isLoading2, setIsloading2] = useState(false);
  const [isLoading3, setIsloading3] = useState(false);
  const [, updateState] = React.useState();
  const forceUpdate = React.useCallback(() => updateState({}), []);
  const {token} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const router = useRouter();
  const uid = getUid();
  const context = useAppContext();
  const {t} = useTranslation();

  const validationSchema = {
    menu: DefaultSchema.text(t),
    role: DefaultSchema.text(t),
    permission: DefaultSchema.text(t),
  };

  //state for queryRequest
  const [qMenu, setqMenu] = useState("");
  const [qRole, setqRole] = useState("");
  const [qPermission, setqPermission] = useState("");

  const getRecord = useCallback(
    async _uid => {
      const result = await HabilitationService.show(token, _uid);
      if (result.error == null && result.data != null) {
        setAuthorization(result.data);
        setReady(true);
      } else displayHttpError(result.error, router);
    },
    [token, router],
  );

  const getMenus = useCallback(
    async qMenu => {
      setIsloading1(true);
      const result = await getAllMenu(token, "", qMenu, 10, 1);
      setIsloading1(false);
      if (result.error == null) setMenus(result.data.menus);
      else displayHttpError(result.error, router);
    },
    [token, router],
  );

  const getRoles = useCallback(
    async qRole => {
      setIsloading2(true);
      const result = await getAllRoles(token, "", qRole, 10, 1);
      setIsloading2(false);
      if (result.error == null) setRoles(result.data.roles);
      else displayHttpError(result.error, router);
    },
    [token, router],
  );

  const getPermissions = useCallback(
    async qPermission => {
      setIsloading3(true);
      const result = await getAllPermissions(token, "", qPermission, 1);
      setIsloading3(false);
      if (result.error == null) setPermissions(result.data.permissions);
      else displayHttpError(result.error, router);
    },
    [token, router],
  );

  const fetchDatas = useCallback(async () => {
    await getRecord(getUid());
  }, [token, router]);

  useEffect(() => {
    getRoles(qRole);
  }, [getRoles, qRole]);
  useEffect(() => {
    getMenus(qMenu);
  }, [getMenus, qMenu]);
  useEffect(() => {
    getPermissions(qPermission);
  }, [getPermissions, qPermission]);
  useEffect(() => {
    fetchDatas();
  }, [fetchDatas]);

  const {
    register,
    formState: {errors, isSubmitting, isValid},
    handleSubmit,
    control,
    setValue,
  } = useForm({
    resolver: zodResolver(validationAuthToUpdate),
    mode: "all",
  });

  useEffect(() => {
    // Set default values for the form based on the current network
    if (authorization) {
      console.log(authorization);
      const defaultValues = {
        menu: authorization.menu || null,
        role: authorization.role || null,
        permission: authorization.permission || null,
      };
      // Update the form with default values using setValue
      Object.keys(defaultValues).forEach(key => setValue(key, defaultValues[key]));
    }
  }, [authorization, setValue]);
  const onSubmit = async data => {
    //  show loading indicator
    setInProgress(true);

    // request api to add provider
    const response = await HabilitationService.update(token, getUid(), data);
    console.log(response);
    if (response.error === null) {
      Toast.success(t("authorizationSuccessfullyModified"));
      context.togglePageLoading(true);
      router.push(AUTHORIZATION_LISTING_PAGE);
    } else {
      displayHttpError(response.error, router);
    }
    setInProgress(false);
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
          <Paper
            elevation={2}
            component="form"
            onSubmit={handleSubmit(onSubmit)}
            sx={{padding: "40px 24px", position: "relative"}}
            className="brSm">
            <ActivityIndicator visible={inProgress} />
            <Typography variant="h5" component="h5" sx={{mb: 3}}>
              {t("editAuthorization")}
            </Typography>
            <Box>
              <Grid container spacing={4}>
                <Grid xs={12} md={6} lg={6} xl={4}>
                  <Controller
                    name="menu"
                    control={control}
                    render={({field: {onChange, value}}) => (
                      <Autocomplete
                        id="menu"
                        onChange={(_, item) => {
                          onChange(item);
                        }}
                        /*onInputChange={(event, newInputValue) => {
                          setqMenu(newInputValue.split(" ")[0].trim());
                        }}*/
                        value={value || null}
                        options={menus}
                        isOptionEqualToValue={(option, value) => option.uid === value.uid}
                        getOptionLabel={option => toCaptitalize(option.menu_label)}
                        fullWidth
                        disabled={isSubmitting}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label={t("menus")}
                            variant="filled"
                            helperText={errors.menu?.message}
                            error={!!errors.menu}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid xs={12} md={6} lg={6} xl={4}>
                  <Controller
                    name="role"
                    control={control}
                    render={({field: {onChange, value}}) => (
                      <Autocomplete
                        id="role"
                        onChange={(_, item) => {
                          onChange(item);
                        }}
                        /*onInputChange={(event, newInputValue) => {
                          setqRole(newInputValue.split(" ")[0].trim());
                        }}*/
                        value={value || null}
                        options={roles}
                        isOptionEqualToValue={(option, value) => option.uid === value.uid}
                        getOptionLabel={option => toCaptitalize(option.role_label)}
                        fullWidth
                        disabled={isSubmitting}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label={t("roles")}
                            variant="filled"
                            helperText={errors.role?.message}
                            error={!!errors.role}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
                <Grid xs={12} md={6} lg={6} xl={4}>
                  <Controller
                    name="permission"
                    control={control}
                    render={({field: {onChange, value}}) => (
                      <Autocomplete
                        id="permission"
                        onChange={(_, item) => {
                          onChange(item);
                        }}
                        /*onInputChange={(event, newInputValue) => {
                          setqPermission(newInputValue);
                        }}*/
                        value={value || null}
                        options={permissions}
                        isOptionEqualToValue={(option, value) => option.uid === value.uid}
                        getOptionLabel={option => toCaptitalize(option.permission_label)}
                        fullWidth
                        disabled={isSubmitting}
                        renderInput={params => (
                          <TextField
                            {...params}
                            label={t("permissions")}
                            variant="filled"
                            helperText={errors.permission?.message}
                            error={!!errors.permission}
                          />
                        )}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container>
                <Grid xs={12} md={3} lg={2} xl={2}>
                  <Button
                    onClick={handleSubmit}
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{mt: 5, mb: 2}}
                    className="brSm">
                    {t("update")}
                  </Button>
                </Grid>
              </Grid>
              <DevTool control={control} placement="top-right" />
            </Box>
          </Paper>
        </>
      )}
    </>
  );
};

export default AuthorizationUpdate;
