"use client";
import React, {useCallback, useEffect} from "react";
import ActivityIndicator from "@/components/ActivityIndicator";
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Stack,
    TextField
} from "@mui/material";
import toast from "@/utils/toast";
import {useTranslation} from "react-i18next";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import moment from 'moment';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";
import SubscriptionService from "@/services/SubscriptionService";
import {getToken} from "@/utils";

const RegularizeDepositModal = (
    {
        title,
        onConfirm = () => {},
        onCancel = () => {},
        required = true,
        inProgress = false,
        labels = {yes: "Oui", no: "Non", input: "Valeur"},
        inputProps = {},
        isRedemption = true,
        withPayment = false
    },
    ref,
) => {
    const {t} = useTranslation();
    const [opened, setOpenend] = React.useState(false);
    const [reference, setReference] = React.useState("");
    const [dateTime, setDateTime] = React.useState(moment());
    const [paymentMethod, setPaymentMethod] = React.useState(null);
    const [paymentSystem, setPaymentSystem] = React.useState(null);
    const [inputValue, setInputValue] = React.useState('');
    const [paymentMethods, setPaymentMethods] = React.useState([]);
    const [paymentSystems, setPaymentSystems] = React.useState([]);
    const [inprogress, setInprogress] = React.useState(false);

    const token = getToken()

    React.useImperativeHandle(ref, () => ({
        open: () => setOpenend(true),
        close: () => setOpenend(false),
    }));

    const handleConfirm = () => {
        if (!dateTime || reference.trim() === "") {
            toast.show(t("pleaseFillAllRequiredFields"), toast.TOAST_LONG);
        } else {
            const datas =  {
                reference: reference.trim(),
                payment_date: dateTime.format("YYYY-MM-DD HH:mm:ss")
            }

            if(withPayment){
                datas.payment_system = paymentSystem?.code
            }
            onConfirm(datas);
        }
    };

    const getPaymentModes = useCallback( async () => {
        const result = await SubscriptionService.getPaymentMethods(token);
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


    return (
        <Dialog className="__positionned" open={opened} onClose={() => setOpenend(false)}>
            <ActivityIndicator visible={inProgress} />
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{isRedemption? t("areYouSureWannaPayRedemption"): t("areYouSureWannaRegularizeResource")}</DialogContentText>
                <Stack spacing={2}>
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
                {withPayment && <Grid spacing={2} mt={2} display="flex" justifyContent="space-between" alignItems="center" container>
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
                                setInputValue(newInputValue);
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
                                setInputValue(newInputValue);
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
                </Grid>}

            </DialogContent>
            <DialogActions>
                <Button
                    color="error"
                    onClick={() => {
                        setOpenend(false);
                        onCancel();
                    }}>
                    {labels.no}
                </Button>
                <Button onClick={handleConfirm} autoFocus>
                    {labels.yes}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default React.forwardRef(RegularizeDepositModal);
