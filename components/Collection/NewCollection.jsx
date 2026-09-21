import React, {useCallback, useEffect, useState} from "react";
import ActivityIndicator from "@/components/ActivityIndicator";
import {Button, Paper, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import {DevTool} from "@hookform/devtools";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import schema from "@/components/Collection/schema";
import CollectionService from "@/services/CollectionService";
import {getToken, isSubscriber} from "@/utils";
import Toast from "@/utils/toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useAppContext} from "@/contexts/appContext";
import {useRouter} from "next/navigation";
import ContractService from "@/services/ContractService";
import {COLLECTION_LIST} from "@/utils/routes/routes";
import {displayHttpError} from "@/utils/api";
import UserWalletService from "@/services/UserWalletService";
import IntlPhoneField from "@/components/IntlPhoneField";
import {useTranslation} from "react-i18next";

const NewCollection = () => {
  const {t} = useTranslation();
  const token = getToken();
  const [customers, setCustomers] = useState([]);
  const [customer, setCustomer] = useState(null);
  const [paymentSystems, setPaymentSystems] = useState([]);
  const [paymentSystem, setPaymentSystem] = useState(null);
  const [contract, setContract] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [contractUid, setContractUid] = useState("");
  const [paymentSystemUUID, setPaymentSystemUUID] = useState("");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [paymentMethodUUID, setPaymentMethodUUID] = useState("");
  const [qContract, setqContract] = useState("");
  const [qCustomer, setqCustomer] = useState("");
  const [inProgress, setInProgress] = useState(false);
  const context = useAppContext();
  const router = useRouter();

  const getContracts = useCallback(async () => {
    const response = await ContractService.getAll(token, "", qContract);
    if (response.error === null) {
      setContracts(response.contracts);
    } else {
      displayHttpError(response.error, router);
    }
  }, [token]);

  const getPaymentMethods = useCallback(async () => {
    const response = await CollectionService.paymentMethods();

    if (response.error === null) {
      setPaymentMethods(response.methods);
    } else {
      displayHttpError(response.error, router);
    }
  }, [token]);

  const getPaymentSystems = useCallback(
    async _method => {
      const response = await CollectionService.paymentSystems(_method);

      if (response.error === null) {
        setPaymentSystems(response.systems);
      } else {
        displayHttpError(response.error, router);
      }
    },
    [token],
  );

  const getCustomers = useCallback(async () => {
    const response = await UserWalletService.getCustomers(token);
    if (response.error == null) {
      setCustomers(response.data);
    } else {
      displayHttpError(response.error, router);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (isSubscriber()) {
      await getContracts();
    } else await getCustomers();
    await getPaymentMethods();
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangeMethod = async _methodUid => {
    setInProgress(true);
    await getPaymentSystems(_methodUid);
    setInProgress(false);
  };

  const handleChangeCustomer = async _personUid => {
    setInProgress(true);
    const response = await UserWalletService.getCustomerContracts(token, _personUid);
    setInProgress(false);
    if (response.error === null) {
      setContracts(response.data);
    } else {
      displayHttpError(response.error, router);
    }
  };

  // validation schema
  const {
    register,
    setValue,
    formState: {errors},
    handleSubmit,
    trigger,
    control,
  } = useForm({
    resolver: zodResolver(schema(t)),
    defaultValues: {phone: "", amount: 200, payment_method: null},
  });

  // on form submission
  const onSubmit = async (data, e) => {
    console.log("Error::: ", e);
    // set progress
    setInProgress(true);

    // submit data to api
    data = {phone: data.phone, amount: data.amount};

    const response = await CollectionService.new(token, data, contractUid + "", paymentSystemUUID);

    if (response.error === null) {
      Toast.success(t("collectionBeingProcessed"));
      router.push(COLLECTION_LIST);
      context.togglePageLoading(true);
    } else {
      displayHttpError(response.error, router);
    }

    // set progress
    setInProgress(false);
  };

  const {onChange: onChangePhone, onBlur: onBlurPhone, name: namePhone, ref: refPhone} = register("phone");

  const onError = (errors, e) => console.log(errors, e);

  return (
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
        component="form"
        elevation={2}
        onSubmit={handleSubmit(onSubmit, onError)}
        sx={{padding: "40px 24px", mb: 3}}
        className="brSm">
        <Typography variant="h5" component="h5" mb={2}>
          {t("performCollection")}
        </Typography>
        <Grid container spacing={4}>
          <ActivityIndicator visible={inProgress} />
          {!isSubscriber() ? (
            <Grid xs={12} md={6} lg={4} xl={4}>
              <Controller
                name="customer"
                control={control}
                render={({field: {onChange, onBlur}}) => (
                  <Autocomplete
                    onChange={(event, item) => {
                      onChange(item?.uid);
                      setCustomer(item);
                      handleChangeCustomer(item?.uid);
                    }}
                    onBlur={() =>
                      onBlur(() => {
                        trigger("customer");
                      })
                    }
                    id="collectionCustomer"
                    options={customers}
                    getOptionLabel={option => `${option.first_name} ${option.last_name}`}
                    onInputChange={(event, newInputValue) => {
                      setqCustomer(newInputValue.trim());
                    }}
                    value={customer}
                    fullWidth
                    renderInput={params => (
                      <TextField
                        {...params}
                        label={`${t("client")}*`}
                        variant="filled"
                        helperText={errors.customer?.message}
                        error={!!errors.customer}
                      />
                    )}
                  />
                )}
              />
            </Grid>
          ) : (
            <></>
          )}
          <Grid xs={12} md={6} lg={4} xl={4}>
            <Controller
              name="contract"
              control={control}
              render={({field: {onChange, onBlur}}) => (
                <Autocomplete
                  onChange={(event, item) => {
                    onChange(item?.uid);
                    setContractUid(item?.uid);
                    setContract(item);
                  }}
                  onBlur={() =>
                    onBlur(() => {
                      trigger("contract");
                    })
                  }
                  id="collectionContract"
                  options={contracts}
                  getOptionLabel={option => option.code}
                  onInputChange={(event, newInputValue) => {
                    setqContract(newInputValue.trim());
                  }}
                  value={contract}
                  fullWidth
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={`${t("contract")}*`}
                      variant="filled"
                      helperText={errors.contract?.message}
                      error={!!errors.contract}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <Controller
              name="payment_method"
              control={control}
              render={({field: {onChange, onBlur}}) => (
                <Autocomplete
                  onChange={(event, item) => {
                    onChange(item.uid);
                    setPaymentMethod(item);
                    setPaymentMethodUUID(item?.uid);
                    handleChangeMethod(item?.uid);
                  }}
                  onBlur={() =>
                    onBlur(() => {
                      trigger("payment_method");
                    })
                  }
                  id="providerNature"
                  options={paymentMethods}
                  value={paymentMethod}
                  fullWidth
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={`${t("paymentMethod")}*`}
                      variant="filled"
                      helperText={errors.payment_method?.message}
                      error={!!errors.payment_method}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <Controller
              name="payment_system"
              control={control}
              render={({field: {onChange, onBlur}}) => (
                <Autocomplete
                  onChange={(event, item) => {
                    onChange(JSON.stringify(item));
                    setPaymentSystem(item);
                    setPaymentSystemUUID(item?.uid);
                  }}
                  onBlur={() =>
                    onBlur(() => {
                      trigger("payment_system");
                    })
                  }
                  id="providerNature"
                  options={paymentSystems}
                  value={paymentSystem}
                  fullWidth
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={`${t("paymentSystem")}*`}
                      variant="filled"
                      helperText={errors.payment_system?.message}
                      error={!!errors.payment_system}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <IntlPhoneField
              variant="filled"
              id="phone"
              label={`${t("phoneNumber")}*`}
              fullWidth
              error={!!errors.phone}
              helperText={errors.phone?.message}
              onChange={value => {
                setValue("phone", value, {shouldValidate: true});
              }} // assign onChange event
              onBlur={onBlurPhone} // assign onBlur event
              name={namePhone} // assign name prop
              ref={refPhone}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={4}>
            <TextField
              variant="filled"
              id="amount"
              label={`${t("amount")}*`}
              type="number"
              fullWidth
              error={!!errors.amount}
              helperText={errors.amount?.message}
              {...register("amount")}
            />
          </Grid>
          <Grid container xs={12} md={6} lg={12} xl={12}>
            <Grid xs={12} md={12} lg={2} xl={2}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{mt: 1}}
                className="brSm no-text-transform"
                disabled={inProgress}>
                {t("collect")}
              </Button>
            </Grid>
          </Grid>
          <DevTool control={control} placement="top-right" />
        </Grid>
      </Paper>
    </>
  );
};

export default NewCollection;
