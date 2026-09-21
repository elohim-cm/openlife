import Drawer from "@mui/material/Drawer";
import {styled} from "@mui/material/styles";

export default styled(Drawer)(({theme, ownerState}) => {
  const {palette, boxShadows, transitions, breakpoints, functions} = theme;
  const {transparentSidenav, whiteSidenav, miniSidenav, darkMode} = ownerState;

  const sidebarWidth = 250;
  const backg = "#DDE1DE";
  const {transparent, gradients, white, primary, background} = palette;
  const {xxl} = boxShadows;
  const {pxToRem, linearGradient} = functions;

  let backgroundValue = darkMode ? background.sidenav : linearGradient(primary.main, primary.main);

  if (transparentSidenav) {
    backgroundValue = transparent.main;
  } else if (whiteSidenav) {
    backgroundValue = white.main;
  }

  // styles for the sidenav when miniSidenav={false}
  const drawerOpenStyles = () => ({
    background: backg,
    transform: "translateX(0)",
    transition: transitions.create("transform", {
      easing: transitions.easing.sharp,
      duration: transitions.duration.shorter,
    }),

    [breakpoints.up("xl")]: {
      marginBottom: transparentSidenav ? 0 : "inherit",
      left: "0",
      width: sidebarWidth,
      transform: "translateX(0)",
      transition: transitions.create(["width", "background-color"], {
        easing: transitions.easing.sharp,
        duration: transitions.duration.enteringScreen,
      }),
    },
  });

  // styles for the sidenav when miniSidenav={true}
  const drawerCloseStyles = () => ({
    background: backg,
    transform: `translateX(${pxToRem(-320)})`,
    transition: transitions.create("transform", {
      easing: transitions.easing.sharp,
      duration: transitions.duration.shorter,
    }),

    [breakpoints.up("xl")]: {
      marginBottom: transparentSidenav ? 0 : "inherit",
      left: "0",
      width: pxToRem(96),
      overflowX: "hidden",
      transform: "translateX(0)",
      transition: transitions.create(["width", "background-color"], {
        easing: transitions.easing.sharp,
        duration: transitions.duration.shorter,
      }),
    },
  });

  return {
    "& .MuiDrawer-paper": {
      border: "none",
      "& .__sidenav-container": {
        maxWidth: "270px",
        padding: "20px 0",
        background: backgroundValue,
        borderRadius: "0.75rem",
        boxShadow: xxl,
        height: "100%",
        overflow: "auto",
      },
      ...(miniSidenav ? drawerCloseStyles() : drawerOpenStyles()),
    },
  };
});
