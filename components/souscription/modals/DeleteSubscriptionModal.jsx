"use client";
import React from "react";
import ActivityIndicator from "@/components/ActivityIndicator";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {useTranslation} from "react-i18next";
import SubscriptionService from "@/services/SubscriptionService";
import {displayHttpError} from "@/utils/api";
import {useRouter} from "next/navigation";
import Toast from "@/utils/toast";

const DeleteSubscriptionModal = ({token, record, onDelete}, ref) => {
  const {t} = useTranslation();
  const [opened, setOpenend] = React.useState(false);
  const [inProgress, setInProgress] = React.useState(false);
  const router = useRouter();

  React.useImperativeHandle(ref, () => ({
    open: () => {
      setOpenend(true);
    },
    close: () => {
      setOpenend(false);
    },
  }));

  const handleDelete = async () => {
    setInProgress(true);
    let result = await SubscriptionService.deleteRecord(token, record);
    setInProgress(false);
    if (result.error == null) {
      Toast.success(t("subscriptionDeletedSuccessfully"));
      setOpenend(false);
      onDelete();
    } else {
      displayHttpError(result.error, router);
    }
  };

  return (
    <Dialog className="__positionned" open={opened} onClose={() => setOpenend(false)}>
      <ActivityIndicator visible={inProgress} />
      <DialogTitle>{t("confirmation")}</DialogTitle>
      <DialogContent>
        <DialogContentText>{t("areYouSureToDeleteSubscription")}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenend(false)}>{t("no")}</Button>
        <Button color="error" onClick={handleDelete} autoFocus>
          {t("yes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.forwardRef(DeleteSubscriptionModal);
