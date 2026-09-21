import {createTheme} from "@mui/material/styles";
import {Poppins} from "next/font/google";

const poppins = Poppins({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Create a theme instance.
const OL = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 475, // adjust the breakpoint values as needed
      md: 768, // adjust the breakpoint values as needed
      lg: 1440, // adjust the breakpoint values as needed
      xl: 1920, // adjust the breakpoint values as needed
      full: "100%",
    },
  },
  palette: {
    primary: {
      main: "#0d6732",
      dark: "#0c592d",
      light: "#279852",
      contrastText: "#ffffff",
    },
    white: {
      main: "#ffffff",
      dark: "#cccccc",
      light: "#ffffff",
      contrastText: "#000000",
    },
    secondary: {
      main: "#343432",
      dark: "#141412",
      light: "#656563",
      contrastText: "#ffffff",
    },
    processing: {
      main: "#22468F",
      dark: "#152b59",
      light: "#3162c7",
      contrastText: "#ffffff",
    },
  },
  typography: {
    fontFamily: poppins.style.fontFamily,
  },
  components: {
    MuiFilledInput: {
      styleOverrides: {
        root: {
          background: "#ffffff",
          "&:hover": {
            background: "#ffffff",
          },
          "&.Mui-focused": {
            background: "#ffffff",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          background: "#ffffff",
          borderRadius: "8px",
          "&:hover": {
            background: "#ffffff",
            borderBottom: "none !important",
          },
          "&.Mui-focused": {
            border: "none !important",
            background: "#ffffff",
            "&::before": {
              borderBottom: "none",
            },
            "&::after": {
              borderBottom: "none",
            },
          },
        },
      },
    },
  },
});

export default OL;
