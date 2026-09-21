"use client";
import React from "react";
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
import {useTheme} from "@mui/material/styles";
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import {useTranslation} from "react-i18next";
import {formatNumber, getLanguage} from "@/utils";

const PromptModal = (
    {
        title,
        content,
        onSendRequest = () => {},
        onCancel = () => {},
        required = true,
        inputProps = {},
        inProgress = false,
        labels = {yes: "Oui", no: "Non", input: "Valeur"},
        role=null,
        onHandleOpenPaymentModal = () => {},
        total_amount = null,
        massPayment = false
    },
    ref,
) => {
    const {t} = useTranslation();
    const [opened, setOpenend] = React.useState(false);
    const [inputValue, setInputValue] = React.useState("");
    const lg = getLanguage();

    React.useImperativeHandle(ref, () => ({
        open: () => {
            setOpenend(true);
        },
        close: () => {
            setOpenend(false);
        },
    }));

    const handleConfirm = () => {
        console.log('massPayment', massPayment)
        console.log('Data1 ::: ', role, !massPayment)
        if (role === 'TRE' && !massPayment){
            onHandleOpenPaymentModal()
        }else{
            if (inputValue.trim() === "") {
                if (required) {
                    toast.show(t('youShouldFillForm'), toast.TOAST_LONG);
                } else {
                    onSendRequest("");
                }
            } else {
                onSendRequest(inputValue.trim());
            }
        }
    };
    return (
        <Dialog className="__positionned" open={opened} onClose={() => setOpenend(false)}>
            <ActivityIndicator visible={inProgress} />
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                <DialogContentText>{content}</DialogContentText>
                {total_amount && <DialogContentText>{t('amount')}: {formatNumber(total_amount, lg)}</DialogContentText>}
                {((role === 'TRE' && massPayment) || role === 'PDG' || role === 'TECH') && <TextField
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
                />}
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
