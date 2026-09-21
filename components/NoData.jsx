import MDBox from "@/material/components/MDBox";
import MDTypography from "@/material/components/MDTypography";
import {Button} from "@mui/material";

const NoData = () => {
  return (
    <MDBox
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}>
      <MDTypography sx={{fontSize: {xs: "32px", md: "72px"}}} mb={3} variant="h1">
        No data
      </MDTypography>
      <Button onClick={() => window.location.reload()}>Actualiser</Button>
    </MDBox>
  );
};

export default NoData;
