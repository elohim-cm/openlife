"use client";
import React from "react";
import ActivityIndicator from "@/components/ActivityIndicator";
import {Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField} from "@mui/material";
import toast from "@/utils/toast";

const PromptModalGroup = ( 
  {
    title,
    content,
    onConfirm = () => {},
    onCancel = () => {},
    required = true,
    inputProps = {},
    inProgress = false,
    labels = {yes: "Oui", no: "Non", input: "Valeur"},
  },
  ref,
) => {
  const [opened, setOpenend] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  React.useImperativeHandle(ref, () => ({
    open: () => {
      setOpenend(true);
    },
    close: () => {
      setOpenend(false);
    },
  }));

  const handleConfirm = () => {
    if (inputValue.trim() === "") {
      if (required) {
        toast.show("Veuillez remplir le formulaire", toast.TOAST_LONG);
      } else {
        onConfirm("");
      }
    } else {
      onConfirm(inputValue.trim());
    }
  };

  return (
    <Dialog className="__positionned" open={opened} onClose={() => setOpenend(false)}>
      <ActivityIndicator visible={inProgress} />
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{content}</DialogContentText>
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

export default React.forwardRef(PromptModalGroup);
