import { Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import React from "react";

const Loading = () => {
  return (
    <>
        <div style={{
            display:'flex',
            alignItems:'center',
            justifyContent:'center',
            width:'100%',
            height:'80vh'
        }}>
            <CircularProgress />
        </div>
    </>
  );
};

export default Loading;