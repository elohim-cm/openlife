import React from "react";
import Grid from "@mui/material/Unstable_Grid2";
import Skeleton from "@mui/material/Skeleton";

const IndicatorSkeleton = ({columnsNumber}) => {
  const columns = Array.from({length: columnsNumber}, (_, index) => index);

  return (
    <Grid container sx={{backgroundColor: "#fff", padding: "24px", borderRadius: "16px"}}>
      <Grid xs={12} sx={{borderBottom: "1px solid #edf2f7", paddingBottom: "12px"}}>
        <Skeleton variant="rounded" sx={{bgcolor: "#cdcdcd"}} height={15} width={100} />
      </Grid>
      <Grid container xs={12} spacing={3} mt={0.5}>
        {columns.map((row, index) => (
          <Grid key={index} xs={12} sm={6} md={4} lg={3} xl={3}>
            <Skeleton variant="rounded" sx={{bgcolor: "#cdcdcd", borderRadius: "16px"}} height={120} />
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default IndicatorSkeleton;
