import {Alert, AlertTitle, Box, Button, Paper, Stack, TextField, Typography} from "@mui/material";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import Grid from "@mui/material/Unstable_Grid2";
import authorizationCreateValidationSchema from "@/validations/authorization/authorizationCreateFormValidation";
import {createAuthorization} from "@/services/habilitationService";
import React, {useEffect, useState} from "react";
import {AUTHORIZATION_CREATE_PAGE, AUTHORIZATION_LISTING_PAGE} from "@/utils/routes/routes";
import Autocomplete from "@mui/material/Autocomplete";
import Toast from "@/utils/toast";
import {getAllMenu} from "@/services/memuService";
import {getAllRoles} from "@/services/roleService";
import {getAllPermissions} from "@/services/permissionService";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import ActivityIndicator from "@/components/ActivityIndicator";
import {useAppContext} from "@/contexts/appContext";
import {useTranslation} from "react-i18next";
import {displayHttpError} from "@/utils/api";

const AuthorizationCreate = () => {
  const [menus, setMenus] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [menuUid, setMenuUid] = useState("");
  const [roleUid, setRoleUid] = useState("");
  const [permissionUid, setPermissionUid] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const router = useRouter();
  const {token} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const context = useAppContext();
  const {t} = useTranslation();

  //state for queryRequest
  const [qMenu, setqMenu] = useState("");
  const [qRole, setqRole] = useState("");
  const [qPermission, setqPermission] = useState("");

  useEffect(() => {
    // get role
    getAllRoles(token, "", qRole, 10, 1).then(response => {
      setRoles(response.data.roles);
    });
  }, [token, qRole]);

  useEffect(() => {
    //  get menus
    getAllMenu(token, "", qMenu, 10, 1).then(response => {
      setMenus(response.data.menus);
    });
  }, [token, qMenu]);
  useEffect(() => {
    // get permissions
    getAllPermissions(token, "", qPermission, 1).then(response => {
      setPermissions(response.data.permissions);
    });
  }, [token, qPermission]);

  // form hook
  const {
    register,
    formState: {errors},
    handleSubmit,
  } = useForm({
    resolver: zodResolver(authorizationCreateValidationSchema(t)),
  });

  // on form submission
  const onSubmit = async data => {
    // update data to be sent
    data.menu = menuUid;
    data.role = roleUid;
    data.permission = permissionUid;

    // request the api
    createAuthorization(token, data)
      .then(response => {
        Toast.success(t("authorizationCreatedSuccessfully"));
        console.log();

        const oldDatas = JSON.parse(localStorage.getItem("storedValues")) || {};

        localStorage.setItem('storedValues', JSON.stringify({
          ...oldDatas,
          authorizations : [...oldDatas.authorizations, response.data.data]
        }))

        // redirect to authorizations list page
        router.push(AUTHORIZATION_LISTING_PAGE);
      })
      .catch(error => {
        // stop progress indicator
        setInProgress(false);

        displayHttpError(error, router)
      });
  };

  //  update menu uid on input change
  const handleMenuOptionChange = (e, newMenu) => {
    if(newMenu){
      setMenuUid(newMenu.uid);
    }
  };

  //  update role uid on input change
  const handleRoleOptionChange = (e, newRole) => {
    if(newRole){
      setRoleUid(newRole.uid);
    }
  };

  //  update permission uid on input change
  const handlePermissionOptionChange = (e, newPermission) => {
    if(newPermission){
      setPermissionUid(newPermission.uid);
    }
  };

  return (
    <>
      {permissions === null ? (
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
          <Paper elevation={2} sx={{padding: "40px 24px"}} className="brSm">
            <Typography variant="h5" component="h5" sx={{mb: 3}}>
              {t("createANewAuthorization")}
            </Typography>
            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
              <ActivityIndicator visible={inProgress} />
              <Grid container spacing={4}>
                <Grid xs={12} md={6} lg={4} xl={4}>
                  <Autocomplete
                    disablePortal
                    id="menus"
                    /*onInputChange={(event, newInputValue) => {
                      console.log(newInputValue.split(" ")[0].trim());
                      setqMenu(newInputValue.split(" ")[0].trim());
                    }}*/
                    getOptionLabel={(option) => option.menu_label || ''}
                    options={menus}
                    fullWidth
                    onChange={handleMenuOptionChange}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label={t("menus")}
                        variant="filled"
                        error={!!errors.menu}
                        helperText={errors.menu ? errors.menu.message : ""}
                        {...register("menu")}
                      />
                    )}
                  />
                </Grid>
                <Grid xs={12} md={6} lg={4} xl={4}>
                  <Autocomplete
                    disablePortal
                    id="roles"
                    /*onInputChange={(event, newInputValue) => {
                      setqRole(newInputValue.split(" ")[0].trim());
                    }}*/
                    getOptionLabel={(option) => option.role_label || ''}
                    options={roles}
                    fullWidth
                    onChange={handleRoleOptionChange}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label={t("roles")}
                        variant="filled"
                        error={!!errors.role}
                        helperText={errors.role ? errors.role.message : ""}
                        {...register("role")}
                      />
                    )}
                  />
                </Grid>
                <Grid xs={12} md={6} lg={4} xl={4}>
                  <Autocomplete
                    disablePortal
                    id="permissions"
                    /*onInputChange={(event, newInputValue) => {
                      setqPermission(newInputValue.trim());
                    }}*/
                    getOptionLabel={(option) => option.permission_label || ''}
                    options={permissions}
                    fullWidth
                    onChange={handlePermissionOptionChange}
                    renderInput={params => (
                      <TextField
                        {...params}
                        label={t("permissions")}
                        variant="filled"
                        aria-readonly={true}
                        error={!!errors.permission}
                        helperText={errors.permission ? errors.permission.message : ""}
                        {...register("permission")}
                      />
                    )}
                  />
                </Grid>
              </Grid>
              <Grid container>
                <Grid xs={12} md={3} lg={2} xl={2}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    sx={{mt: 5, mb: 2}}
                    className="brSm"
                    onClick={e => setInProgress(true)}>
                    {t("create")}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </>
      )}
    </>
  );
};

export default AuthorizationCreate;
