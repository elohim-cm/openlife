"use client";
import React, { useCallback, useEffect } from "react";
import ActivityIndicator from "@/components/ActivityIndicator";
import {Autocomplete, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Grid, Stack, TextField} from "@mui/material";
import toast from "@/utils/toast";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import moment from 'moment';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import {useTranslation} from "react-i18next";
import { fabClasses } from "@mui/material";
import SubscriptionService from "@/services/SubscriptionService";
import { getToken } from "@/utils";

const PromptModal = (
  {
    title,
    content,
    onConfirm = () => {},
    onCancel = () => {},
    required = true,
    inputProps = {},
    inProgress = false,
    labels = {yes: "Oui", no: "Non", input: "Valeur"},
    otherPayments = false,
    hasPayment = true,
    isPaymentProcess = false
  },
  ref,
) => {
  const {t} = useTranslation();
  const [opened, setOpenend] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [dateTime, setDateTime] = React.useState(moment());
  const [reference, setReference] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState(null);
  const [paymentSystem, setPaymentSystem] = React.useState(null);

  const [paymentMethods, setPaymentMethods] = React.useState([]);
  const [paymentSystems, setPaymentSystems] = React.useState([]);
  const [inprogress, setInprogress] = React.useState(false);

  const token = getToken()

  React.useImperativeHandle(ref, () => ({
    open: () => {
      setOpenend(true);
    },
    close: () => {
      setOpenend(false);
    },
  })); 

  const getPaymentModes = useCallback( async () => {
    const result = await SubscriptionService.getPaymentMethods(token, false);
      if (!result.error) {
          setPaymentMethods(result.data);
      }
  }, [])

  const handleGetSystems = useCallback( async _method => {
      setInprogress(true);
      const result = await SubscriptionService.getPaymentSystems(token, _method);
      if (!result.error) {
          setPaymentSystems(result.data);
      }
      setInprogress(false);
  }, [])

  useEffect(() => {
      getPaymentModes()
  }, [getPaymentModes]);

  const handleConfirm = () => {
    if (otherPayments || (!hasPayment && paymentMethod?.code !== 'MOBILE')) {
      if (!dateTime || reference.trim() === "") {
        toast.show(t("pleaseFillAllRequiredFields"), toast.TOAST_LONG);
      }else{
        const datas =  {
            raison: inputValue.trim(),
            reference: reference.trim(),
            payment_date: dateTime.format("YYYY-MM-DD HH:mm:ss"),
            ...!hasPayment && {payment_system : paymentSystem?.code}
        }
        onConfirm(isPaymentProcess? datas: inputValue.trim());
      }
    } else{
      if (inputValue.trim() === "") {
        if (required) {
          toast.show("Veuillez remplir le formulaire", toast.TOAST_LONG);
        } else {
          onConfirm("");
        }
      } else {
        const datas =  {
          raison: inputValue.trim(),
          ...!hasPayment && {payment_system : paymentSystem?.code}
        }
        onConfirm(isPaymentProcess? datas: inputValue.trim());
      }
    }
  };

  return (
    <Dialog className="__positionned" open={opened} onClose={() => setOpenend(false)}>
      <ActivityIndicator visible={inProgress} />
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
        {(otherPayments  || (!hasPayment && paymentMethod && paymentMethod?.code !== 'MOBILE'))? 
          <Stack spacing={2}>
            <TextField
              autoFocus
              margin="dense"
              label={`${labels.input}*`}
              type="text"
              fullWidth
              variant="standard"
              onChange={e => {
                setInputValue(e.target.value);
              }}
              {...inputProps}
            />
            <Stack direction="row" spacing={2}>
                <TextField
                    autoFocus
                    margin="dense"
                    label={`${t("reference")}${required ? "*" : ""}`}
                    type="text"
                    fullWidth
                    variant="standard"
                    onChange={e => {
                        setReference(e.target.value);
                    }}
                    {...inputProps}
                />
                <LocalizationProvider dateAdapter={AdapterMoment}>
                  <DateTimePicker
                      renderInput={(props) => <TextField {...props} />}
                      label={`${t("paymentDate")}${required ? "*" : ""}`}
                      value={dateTime}
                      onChange={setDateTime}
                      ampm={false}
                      inputFormat="YYYY-MM-DD HH:mm:ss"
                      views={['year', 'month', 'day', 'hours', 'minutes', 'seconds']}
                      maxDateTime={moment()}
                  />
                </LocalizationProvider>
            </Stack>
          </Stack>
          :
          <TextField
            autoFocus
            margin="dense"
            label={`${labels.input}${required ? "*" : ""}`}
            type="text"
            fullWidth
            variant="standard"
            onChange={e => {
              setInputValue(e.target.value);
            }}
            {...inputProps}
          />
        }
        
        {(!hasPayment) && 
          <Grid spacing={2} mt={2} display="flex" justifyContent="space-between" alignItems="center" container>
                <Grid item xs={12} md={6}>
                    <Autocomplete
                        value={paymentMethod ?? {}}
                        onChange={(event, newValue) => {
                            setPaymentMethod(newValue);
                            if (newValue) {
                                handleGetSystems(newValue?.uid)
                            }
                        }}
                        getOptionLabel={(val) => val.label || ''}
                        onInputChange={(event, newInputValue) => {
                            // setInputValue(newInputValue);
                        }}
                        id="controllable-states-demo"
                        options={paymentMethods}
                        renderInput={(params) => <TextField variant="standard"  {...params}
                                                            label={`${t("paymentMethod")}*`}/>}
                    />
                </Grid>
                <Grid item xs={12} md={6}>
                    <Autocomplete
                        disabled={!paymentMethod}
                        value={paymentSystem ?? {}}
                        onChange={(event, newValue) => {
                            setPaymentSystem(newValue);
                        }}
                        getOptionLabel={(val) => val.label || ''}
                        onInputChange={(event, newInputValue) => {
                            // setInputValue(newInputValue);
                        }}
                        id="controllable-states-demo"
                        options={paymentSystems}
                        renderInput={(params) => <TextField
                            variant="filled"
                            {...params}
                            label={`${t("paymentSystem")}*`}
                            helperText={!paymentSystem ? t('paymentSystemIsRequired') : ''}
                            error={!paymentSystem}/>
                        }
                    />
                </Grid>
          </Grid>
        }
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setOpenend(false);
            onCancel();
          }}>
          {labels.no}
        </Button>
        <Button color="error" onClick={handleConfirm} autoFocus>
          {labels.yes}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.forwardRef(PromptModal);
