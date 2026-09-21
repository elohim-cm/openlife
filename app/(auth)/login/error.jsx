'use client'

import Grid from "@mui/material/Unstable_Grid2";
import { Button, Typography } from "@mui/material";

const loginErrorPage = ({ error, reset }) => {


  return (
    <Grid container>
      <Typography variant="h3" component="h1" textAlign="center">
        Une erreur est survenue lors du chargement de la page
      </Typography>
      <Button variant="contained" onClick={ () => reset }>Veuillez reéssayer</Button>
    </Grid>
  );
};

export default loginErrorPage;