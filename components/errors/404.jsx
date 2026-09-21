import React from "react";
import MDTypography from "@/material/components/MDTypography";

const Error404 = () => {

    return (
        <div className="__error-page">
            <MDTypography variant="h1">404</MDTypography>
            <MDTypography>Not found</MDTypography>
        </div>
    );
};

export default Error404;