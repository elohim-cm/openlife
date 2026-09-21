"use client";
import React from "react";
import ActivityIndicator from "@/components/ActivityIndicator";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle} from "@mui/material";
import {useTranslation} from "react-i18next";

const ConfirmModal = ({title, content, onConfirm, onCancel}, ref) => {
  const [opened, setOpened] = React.useState(false);
  const [inProgress, setInProgress] = React.useState(false);
  const {t} = useTranslation();

  React.useImperativeHandle(ref, () => ({
    open: () => {
      setOpened(true);
    },
    close: () => {
      setOpened(false);
    },
    toggleLoader: _value => setInProgress(_value),
  }));

  return (
    <Dialog className="__positionned" open={opened} onClose={() => setOpened(false)}>
      <ActivityIndicator visible={inProgress} />
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            setOpened(false);
            onCancel();
          }}>
          {t("no")}
        </Button>
        <Button color="error" onClick={onConfirm} autoFocus>
          {t("yes")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.forwardRef(ConfirmModal);
