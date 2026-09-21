import Grid from "@mui/material/Unstable_Grid2";
import { Alert, AlertTitle } from "@mui/material";
import '@/styles/alertContainer.scss'

const AlertMessage = () => {
  return (
    <Grid container
          justifyContent="center"
          alignItems="center" className="showAlertContainer">
      <Grid xs={ 12 } sm={ 12 } md={ 6 } lg={ 4 } xl={ 4 }>
        <Alert severity="success">
          <AlertTitle>Success</AlertTitle>
          This is a success alert — <strong>check it out!</strong>
        </Alert>
      </Grid>
    </Grid>
  );
};

export default AlertMessage;