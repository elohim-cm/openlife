import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import {Info} from "@mui/icons-material";
import {Box, DialogContentText} from "@mui/material";
import {getStatusBadge, toCaptitalize} from "@/utils";
import {useAppContext} from "@/contexts/appContext";
import {ACCOUNT_DETAILS_PAGE, BUSINESS_GOAL_LIST} from "@/utils/routes/routes";
import Divider from "@mui/material/Divider";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {useTranslation} from "react-i18next";

export default function AlertDialog({title="", datas, open, onOpenAlert}) {
    const {t} = useTranslation();
    const context = useAppContext();
    const router = useRouter();
    const handleClose = () => {
        onOpenAlert(!open);
    };
    return (
        <div>
            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <Box display='flex' alignItems='center'  style={{padding: "0 24px"}}>
                    <Info style={{fontSize:"72px", margin:"0 10px", transform: "scale(2)"}} />
                    <DialogTitle style={{fontSize:"24px"}} mx={1} id="alert-dialog-title" color>{title}</DialogTitle>
                </Box>
                <Divider />
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        <span><strong>{t("account")} : </strong> <em>{`${datas.account.first_name} ${datas.account.last_name}`}</em></span>
                        <Link
                            style={{
                                margin: "0 10px",
                                textDecoration: "underline !important",
                                color: 'primary', // Ajout de la couleur du texte
                                cursor: 'pointer', // Ajout d'un pointeur au survol
                            }}
                            onClick={() => {
                                handleClose();
                                context.togglePageLoading(true);
                            }}
                            href={ACCOUNT_DETAILS_PAGE(datas.account.uid)}
                        >
                            {t('seeMoreOnAccount')}
                        </Link>

                    </DialogContentText>
                    <DialogContentText id="alert-dialog-description"><strong>{t("role")} : </strong>{datas.role.label}</DialogContentText>
                    <DialogContentText id="alert-dialog-description"><strong>{t("status")} : </strong>{getStatusBadge(datas.status, t)}</DialogContentText>
                    <DialogContentText id="alert-dialog-description"><strong>{t("code")} : </strong>{datas.code}</DialogContentText>
                </DialogContent>
                <Divider />
                <DialogActions>
                    <Button onClick={handleClose}>{t("close")}</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

