import React from "react";
import CircularProgress from "@mui/material/CircularProgress";

const ActivityIndicator = ({ visible = true }) => {

    return visible ? (
        <div className="__activity-indicator">
            <CircularProgress />
        </div>
    ) : <></>;
};

export default ActivityIndicator;