import {enqueueSnackbar} from "notistack";
import React from "react";
import {Trans} from "react-i18next";

const Toast = {
    TOAST_SHORT: { autoHideDuration: 3000 },
    TOAST_LONG: { autoHideDuration: 5000 },
    show: (msg, duration, variant) => {
        enqueueSnackbar(msg, {
            variant: variant,
            autoHideDuration: duration ?? 3000,
            anchorOrigin: {horizontal: "right", vertical: "bottom"}
        });
    },
    success: (msg, duration) => Toast.show(msg, duration ?? Toast.TOAST_SHORT, "success"),
    error: (msg, duration) => Toast.show(msg, duration ?? Toast.TOAST_LONG, "error"),
    warn: (msg, duration) => Toast.show(msg, duration ?? Toast.TOAST_SHORT, "warning"),
    translated: (key, duration, variant, values) => Toast.show(
      React.createElement(Trans, {i18nKey: key, values}),
      duration,
      variant,
    ),
    successKey: (key, values, duration) => Toast.translated(key, duration ?? Toast.TOAST_SHORT, "success", values),
    errorKey: (key, values, duration) => Toast.translated(key, duration ?? Toast.TOAST_LONG, "error", values),
};

export default Toast;
