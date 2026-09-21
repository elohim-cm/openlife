import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import {createAccess} from "@/services/accessService";
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
  MANAGERCODE, PDG,
  PROVIDERCODE, REFERENT_TECHNIQUE, SERVICE_CLIENT, SOUS, TRESORIER
} from "@/services/roleService";
import {
  Button,
  Paper,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  CircularProgress
} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import ActivityIndicator from "@/components/ActivityIndicator";
import Toast from "@/utils/toast";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import {ACCESS_PAGE, PROVIDER_CREATE} from "@/utils/routes/routes";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useAppContext} from "@/contexts/appContext";
import AccessService from "@/services/Access";
import {canInterprateError, displayHttpError} from "@/utils/api";
import UtilMethods from "@/utils/UtilMethods";
import {useTranslation} from "react-i18next";
import {useHabilitations} from "@/contexts/UtilsContext";

const statuses = [{label: "active"}, {label: "inactive"}];

const AccessCreate = () => {
  const {t} = useTranslation();
  const {setSharedProviderData} = useHabilitations();
  const [inProgress, setInProgress] = useState(false);
  const [accounts, setAccounts] = useState(undefined);
  const [accountsInLoading, setAccountsInLoading] = useState(false);
  const [roles, setRoles] = useState(undefined);
  const [rolesInLoading, setRolesInLoading] = useState(false);
  const [accountUid, setAccountUid] = useState("");
  const [roleUid, setRoleUid] = useState("");
  const [isAlreadyProvider, setIsAlreadyProvider] = useState(false);
  const [isProviderForCustormRole, setIsProviderForCustormRole] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isAdminRole, setIsAdminRole] = useState(false);
  const [isAppRole, setIsAppRole] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [providerCode, setProviderCode] = useState('');
  const router = useRouter();
  const context = useAppContext();

  //state for queryRequest
  const [qAccount, setqAccount] = useState('');
  const [qRole, setqRole] = useState('');
  //  token
  const {token} = JSON.parse(localStorage.getItem("storedValues"))  || {};

  //  get accounts
  useEffect(() => {
    (async ()=>{
      const response = await getAllAccounts(token, '', qAccount)
      if(Object.keys(response.error).length >0){
        displayHttpError(response.error, router)
      }else{
        setAccountsInLoading(true)
        setAccounts(response.accounts);
      }

      //  request accounts
      /*getAllAccounts(token, '', qAccount)
          .then(response => {
            setAccountsInLoading(true)
            //  update accounts state
            setAccounts(response.accounts);
          })
          .catch(errorResponse => {
            console.log(errorResponse)
          }).finally(() => {});*/
    })()

  },[token, qAccount])

  //  get role, statuses
  useEffect(() => {
    (async () => {
      //  request role api
      const response = await  getAllRoles(token, '', qRole, 10, 1)
      if (response.error !== null){
        console.log(response.error)
        displayHttpError(response.error, router)
      }else{
        setRolesInLoading(true)
        console.log('hello')
        //  update role state
        const filteredRoles = response.data.roles.filter(role => role.code !== SOUS)
        setRoles(filteredRoles);
        console.log(response.error)
      }
    })()
  }, [token, qRole]);
  //  form hook
  const {
    register,
    formState: {errors},
    handleSubmit,
    setValue, // Add setValue from react-hook-form
    watch,
  } = useForm({resolver: zodResolver(accessCreateValidationSchema(isAdminRole, t))});

  useEffect(() => {
    // Update the defaultValue when dependencies change
    setValue('code', isAlreadyProvider || isProviderForCustormRole ? providerCode : '');
  }, [isAlreadyProvider, isProviderForCustormRole, providerCode]);


  //  create access
  const onSubmit = async data => {
    //  update the data value
    data.account = accountUid;
    data.role = roleUid;

    setInProgress(true);
    const {data: _response, error} = await AccessService.create(token, data);
    if (error === null) {
      Toast.success(_response.message);
      console.log(UtilMethods.check(selectedAccount));
      if(UtilMethods.check(selectedAccount)){
        const oldDatas= JSON.parse(localStorage.getItem('storedValues')),
            oldAccesses = oldDatas?.access,
            newAccesses = [...oldAccesses, _response.data]
        localStorage.setItem('storedValues', JSON.stringify({
          ...oldDatas,
          access : newAccesses
        }))
      }
      context.togglePageLoading(true);
      router.push(ACCESS_PAGE);
    } else {
      if (canInterprateError(error, router)) {
        Toast.error(error.response.data.message);
      } else Toast.error(t("AnErrorOccurred"));
    }
    setInProgress(false);
  };

  const roleCodes = [DIRECTEUR_COMMERCIAL, INSPECTORCODE, MANAGERCODE, ANIMATORCODE]
  const otherRoleCodes = [SERVICE_CLIENT, REFERENT_TECHNIQUE, TRESORIER, PDG]
  //  handle account uid change
  const handleAccountOptionChange = (e, newAccount) => {
    if(newAccount !== null){
      if (selectedRole !== null){
        console.log(selectedRole);
        if(roleCodes.includes(selectedRole.code)) {
          //check if the selected role is (manager, inspector or animator)
          //check if the selected account has the provider access
          if(newAccount?.reference_codes?.includes(PROVIDERCODE)){
            setIsAlreadyProvider(true)
            setProviderCode(prev => prev = newAccount.provider_code)
            console.log(newAccount.provider_code)
          }
        }
        if (otherRoleCodes.includes(selectedRole.code)){
          if(newAccount?.reference_codes?.includes(PROVIDERCODE)){
            setIsProviderForCustormRole(true)
            setProviderCode(prev => prev = newAccount.provider_code)
            console.log(newAccount.provider_code)
          }
        }
        if (selectedRole.code === PROVIDERCODE) {
          setShowAppModal(true);
        }
      }
      setSelectedAccount(newAccount)
      setAccountUid(newAccount?.uid)
    }else{
      setSelectedAccount(newAccount)
      setIsAlreadyProvider(false)
      setIsProviderForCustormRole(false)
      setProviderCode('')
    }
  };

  //  set the role uid
  const handleRoleOptionChange = (e, role) => {
    if (role !== null){
      if(roleCodes.includes(role.code)) {//check if the selected role is (manager, inspector or animator)
        //check if the selected account has the provider access
        if(selectedAccount?.reference_codes?.includes(PROVIDERCODE)){
          setIsAlreadyProvider(true)
          setProviderCode(prev => prev = selectedAccount.provider_code)
          console.log(selectedAccount.provider_code)
        }
      }
      if (otherRoleCodes.includes(role.code)){
        //check if the selected account has the provider access
        if(selectedAccount?.reference_codes?.includes(PROVIDERCODE)){
          setIsProviderForCustormRole(true)
          setProviderCode(prev => prev = selectedAccount.provider_code)
          console.log(selectedAccount.provider_code)
        }
      }
      setIsAdminRole(prev => prev  = (role.code === ADMINCODE))
      setIsAppRole(prev => prev = (role.code === PROVIDERCODE))
      if (role.code === PROVIDERCODE && selectedAccount !== null) {
        setShowAppModal(true);
      }
      setSelectedRole(role)
      setRoleUid(role?.uid);
    }else{
      setSelectedRole(role)
      setIsAlreadyProvider(false)
      setIsProviderForCustormRole(false)
      setIsAdminRole(prev => prev  = false)
      setIsAppRole(false)
      setProviderCode('')
    }
  };

  const handleCancelModal = () => {
    setShowAppModal(false);
    setSelectedRole(null);
    setRoleUid("");
    setIsAppRole(false);
    setIsAdminRole(false);
    setValue("role", null); // Clear react-hook-form value
  };

  return (
    <>
      {(accounts === undefined && roles === undefined) ? (
        <CreateFormSkeleton />
      ) : (
        <>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            color="secondary"
            sx={{mb: 2}}
            onClick={e => {
              context.togglePageLoading(true);
              router.back();
            }}>
            {t("back")}
          </Button>
          <Paper
            component="form"
            elevation={2}
            onSubmit={handleSubmit(onSubmit)}
            sx={{padding: "40px 24px", mb: 3, position: "relative"}}
            className="brSm">
            <ActivityIndicator visible={inProgress} />
            <Typography variant="h5" component="h5" mb={2}>
              {t("createNewAccess")}
            </Typography>
            <Grid container spacing={4}>
              <Grid xs={12} md={6} lg={6} xl={6}>
                <Autocomplete
                  disablePortal
                  id="account"
                  onInputChange={(event, newInputValue) => {
                    setqAccount(newInputValue.trim())
                  }}
                  options={accounts ?? []}
                  getOptionLabel={option => `${option.last_name || ''} ${option.first_name || ''}`}
                  onChange={handleAccountOptionChange}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={`${t("selectAnAccount")}*`}
                      variant="filled"
                      {...register("account")}
                      error={errors.account && true}
                      helperText={errors.account ? errors.account.message : ""}
                    />
                  )}
                />
              </Grid>
              <Grid xs={12} md={6} lg={6} xl={6}>
                <Autocomplete
                  disablePortal
                  id="role"
                  value={selectedRole}
                  /*onInputChange={(event, newInputValue) => {
                    setqRole(newInputValue)
                  }}*/
                    getOptionLabel={(val) => val.role_label || ''}
                  options={roles ?? []}
                  onChange={handleRoleOptionChange}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={`${t("role")}*`}
                      variant="filled"
                      {...register("role")}
                      error={errors.role && true}
                      helperText={errors.role ? errors.role.message : ""}
                    />
                  )}
                />
              </Grid>
              <Grid xs={12} md={6} lg={6} xl={6}>
                <Autocomplete
                  disablePortal
                  id="status"
                  options={statuses ?? []}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={`${t("status")}*`}
                      variant="filled"
                      {...register("status")}
                      error={errors.status && true}
                      helperText={errors.status ? errors.status.message : ""}
                    />
                  )}
                />
              </Grid>
              {!isAdminRole && (
                  <Grid xs={12} md={6} lg={6} xl={6}>
                    <TextField
                        variant="filled"
                        id="code"
                        label={`${t("code")}*`}
                        defaultValue={watch('code')}
                        fullWidth
                        {...register("code", { required: !isAdminRole })}
                        error={errors.code && true}
                        helperText={errors.code ? errors.code.message : ""}
                        // disabled={isAdminRole}
                        InputProps={{ readOnly: isAlreadyProvider || isProviderForCustormRole }}
                    />
                  </Grid>
              )}


              <Grid container xs={12} md={6} lg={12} xl={12}>
                <Grid xs={12} md={12} lg={2} xl={2}>
                  {!isAppRole && (
                    <Button type="submit" fullWidth variant="contained" size="large" sx={{mt: 1}} className="brSm">
                      {t("create")}
                    </Button>
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          <Dialog
            open={showAppModal}
            onClose={(event, reason) => {
              if (reason !== 'backdropClick' && reason !== 'escapeKeyDown') {
                setShowAppModal(false);
              }
            }}
            disableEscapeKeyDown
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">
              {t("apporteurAccessCreation")}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {t("apporteurAccessMessage")}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCancelModal} color="secondary" disabled={inProgress}>
                {t("cancel")}
              </Button>
              <Button
                onClick={() => {
                  setInProgress(true);
                  setSharedProviderData(selectedAccount);
                  context.togglePageLoading(true);
                  router.push(PROVIDER_CREATE);
                }}
                variant="contained"
                color="primary"
                disabled={inProgress}
                startIcon={inProgress ? <CircularProgress size={20} color="inherit" /> : null}
                autoFocus
              >
                {t("createApporteurAccount")}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default AccessCreate;
