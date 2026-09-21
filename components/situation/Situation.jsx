import React, {useState} from 'react'
import {
    Button, Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Paper,
    Stack,
    Typography
} from "@mui/material";
import AuthService from "@/services/AuthService";
import {useAppContext} from "@/contexts/appContext";
import {useRouter} from "next/navigation";
import AccountService from "@/services/Account";
import {getToken} from "@/utils";
import MDAlert from "@/material/components/MDAlert";
import ActivityIndicator from "@/components/ActivityIndicator";
import Grid from "@mui/material/Grid";
import {useTranslation} from "react-i18next";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SuccessAlert from "@/components/alerts/SuccessAlert";
import {CheckCircle} from "@mui/icons-material";
import {displayHttpError} from "@/utils/api";

export default function Situation() {
    const {t} = useTranslation();
    const [inProgress, setInProgress] = useState(false);
    const [message, setMessage] = useState(undefined);
    const context = useAppContext()
    const router = useRouter()
    const [deleteModal, setDeleteModal] = useState(false);
    const token = getToken()

    const handleGetMySituation = async () =>{
        setInProgress(true)
        setMessage(undefined)
        const {error} = await AccountService.mySituation(token, setMessage, setDeleteModal, t)
        if(error !== null) {
            displayHttpError(error, router);
        }
        setInProgress(false)
    }

    return (
        <Paper  sx={{padding:'16px', margin:'24px', display:'flex', flexDirection:'column', justifyContent:'center'}} elevation={2}>
            <Button variant="contained" sx={{padding:'20px', width:'fit-content', margin:'auto'}} color="primary" onClick={handleGetMySituation}>{t("requestStatusToDate")}</Button>
            <ActivityIndicator visible={inProgress} />
            {message !== undefined &&
                <Dialog
                    open={deleteModal}
                    onClose={() => setDeleteModal(false)}
                    aria-labelledby="alert-delete-access"
                    aria-describedby="confirm-delete-access">
                    <DialogTitle id="alert-dialog-title">
                        <Stack direction="rows" alignItems="center">
                            <CheckCircle color="success" fontSize="medium" sx={{ mr: 1 }} />
                            <Typography variant="h4" component="p" sx={{ color: 'success.main' }}>
                                {t("successNotification")}
                            </Typography>
                        </Stack>
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            {message}
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button variant="outlined" onClick={() => setDeleteModal(false)}>
                            {t("ok")}
                        </Button>
                    </DialogActions>
                </Dialog>
            }
        </Paper>
    )
}
