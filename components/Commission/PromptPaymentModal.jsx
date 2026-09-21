"use client";
import React, {useCallback, useEffect, useState} from "react";
import ActivityIndicator from "@/components/ActivityIndicator";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    TextField
} from "@mui/material";
import toast from "@/utils/toast";
import {useTranslation} from "react-i18next";
import Grid from "@mui/material/Grid";
import SubscriptionService from "@/services/SubscriptionService";
import {getToken} from "@/utils";
import Autocomplete from "@mui/material/Autocomplete";
import {Controller} from "react-hook-form";


const PromptPaymentModal = (
    {
        onSendRequest = () => {},
        onCancel = () => {},
        required = true,
        inputProps = {},
        labels = {},
        parentRef = null,
        opened,
        onHandleOpening,
        forCommission = false,
        title = "PaymentDialogBox",
        isLoading = false,
    }
) => {
    const {t} = useTranslation();
    const token = getToken()
    const [inProgress, setInProgress] = React.useState(false);
    const [paymentMethod, setPaymentMethod] = React.useState(null);
    const [paymentSystem, setPaymentSystem] = React.useState(null);
    const [date, setDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [payRef, setPaymentRef] = React.useState("");
    const [comment, setComment] = React.useState("");
    const [isNotMobileMoney, setIsNotModalMoney] =  useState(false);
    const [paymentMethods, setPaymentMethods] = React.useState([]);
    const [paymentSystems, setPaymentSystems] = React.useState([]);

    const [inputValue, setInputValue] = React.useState('');

    const getPaymentModes = useCallback( async () => {
        const result = await SubscriptionService.getPaymentMethods(token, false);
        if (!result.error) {
            setPaymentMethods(result.data);
        }
    }, [])

    const handleGetSystems = useCallback( async _method => {
        setInProgress(true);
        const result = await SubscriptionService.getPaymentSystems(token, _method);
        if (!result.error) {
            setPaymentSystems(result.data);
        }
        setInProgress(false);
    }, [])

    useEffect(() => {
        getPaymentModes()
    }, [getPaymentModes]);

    const handleConfirm = () => {
        console.log('Data ::: ', isNotMobileMoney, payRef)
        if (inputValue.trim() === "") {
            if (required) {
                toast.show(t('youShouldFillForm'), toast.TOAST_LONG);
            } else {
                onSendRequest("");
            }
        } else {
            if (isNotMobileMoney && payRef === ""){
                toast.show(t('youShouldFillForm'), toast.TOAST_LONG);
            }else{
                const data = {
                    payment_date: date,
                    payment_reference: payRef,
                    system: paymentSystem.uid,
                    comment,
                    is_accepted: true
                }
                onSendRequest(data);
            }
        }
    };

    return (
        <Dialog className="__positionned" open={opened} onClose={() => onHandleOpening(false)}>
            <ActivityIndicator visible={inProgress || isLoading} />
            <DialogTitle>{t(title)}</DialogTitle>
            <DialogContent>
                <Grid  container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label={`${t("comment")}`}
                            type="text"
                            fullWidth
                            variant="standard"
                            onChange={e => {
                                setComment(e.target.value);
                            }}
                        />
                    </Grid>
                    {(!forCommission || isNotMobileMoney) && <Grid item xs={12} md={6}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label={`${t("paymentDate")}${required ? "*" : ""}`}
                            type="date"
                            fullWidth
                            variant="standard"
                            defaultValue={new Date().toISOString().split('T')[0]}
                            inputProps={{
                                max: new Date().toISOString().split('T')[0],
                            }}
                            onChange={e => {
                                setDate(e.target.value);
                            }}
                        />
                    </Grid>}
                    {(!forCommission || isNotMobileMoney) && <Grid item xs={12} md={6}>
                        <TextField
                            autoFocus
                            margin="dense"
                            label={`${t("paymentRef")}${required ? "*" : ""}`}
                            type="text"
                            fullWidth
                            variant="standard"
                            onChange={e => {
                                setPaymentRef(e.target.value);
                            }}
                            {...inputProps}
                            helperText={payRef === ''? t('paymentRefIsRequired'): ''}
                            error={payRef === ''}
                        />
                    </Grid>}
                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            value={paymentMethod??{}}
                            onChange={(event, newValue) => {
                                setPaymentMethod(newValue);
                                if(newValue) {
                                    setIsNotModalMoney(newValue.code !== 'MOBILE')
                                    setPaymentSystem(null)
                                    handleGetSystems(newValue?.uid)
                                }
                            }}
                            getOptionLabel={(val) => val.label || ''}
                            onInputChange={(event, newInputValue) => {
                                setInputValue(newInputValue);
                            }}
                            id="controllable-states-demo"
                            options={paymentMethods}
                            renderInput={(params) => <TextField variant="standard"  {...params} label={`${t("paymentMethod")}*`} />}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Autocomplete
                            disabled={!paymentMethod}
                            value={paymentSystem??{}}
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
                                helperText={!paymentSystem? t('paymentSystemIsRequired'): ''}
                                error={!paymentSystem} />
                            }
                        />
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        onHandleOpening(false);
                        onCancel();
                    }}>
                    {t('cancel')}
                </Button>
                <Button color="error" onClick={handleConfirm} autoFocus>
                    {t('save')}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default PromptPaymentModal;