import React from "react";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import ActivityIndicator from "@/components/ActivityIndicator";
import {Button, Paper, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import Autocomplete from "@mui/material/Autocomplete";
import Skeleton from "@mui/material/Skeleton";

const CreateFormSkeleton = () => {
  return (
    <>
      <Skeleton variant="rounded" height={33} width={116} sx={{mb: 2}} />
      <Paper elevation={2} sx={{padding: "40px 24px", mb: 3}} className="brSm">
        <Skeleton animation="wave" />
        <Grid container spacing={4}>
          <Grid xs={12} md={6} lg={6} xl={6}>
            <Skeleton animation="wave" />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={6}>
            <Skeleton animation="wave" />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={6}>
            <Skeleton animation="wave" />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={6}>
            <Skeleton animation="wave" />
          </Grid>
          <Grid container xs={12} md={6} lg={12} xl={12}>
            <Grid xs={12} md={12} lg={2} xl={2}>
              <Skeleton animation="wave" />
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default CreateFormSkeleton;
