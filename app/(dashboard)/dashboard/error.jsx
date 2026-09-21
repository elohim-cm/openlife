'use client'

import { Button, Typography } from "@mui/material";

const Error = ({ error, reset }) => {
  return (
    <>
      <Typography variant="h4" component="h4" color="error">Une erreure est survenue</Typography>
      <Typography variant="h4" component="h4" color="error">{ error }</Typography>
      <Button onClick={ reset } size="large" variant="cotained">Reset</Button>
    </>
  );
};

export default Error;