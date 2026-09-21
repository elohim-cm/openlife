"use client";

import React from "react";
import {createPortal} from "react-dom";
import {LinearProgress} from "@mui/material";

const PageLoadingIndicator = ({ visible = true }) => {
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    return visible && mounted
        ? createPortal(<LinearProgress className="__page-loading-indicator"/>, document.body)
        : null;
};

export default PageLoadingIndicator;
