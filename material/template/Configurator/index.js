/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

import {useState, useEffect} from "react";

// react-github-btn
import GitHubButton from "react-github-btn";

// @mui material components
import Divider from "@mui/material/Divider";
import Switch from "@mui/material/Switch";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import Icon from "@mui/material/Icon";

// @mui icons
import TwitterIcon from "@mui/icons-material/Twitter";
import FacebookIcon from "@mui/icons-material/Facebook";

// Material Dashboard 2 React components
import MDBox from "@/material/components/MDBox";
import MDTypography from "@/material/components/MDTypography";
import MDButton from "@/material/components/MDButton";

// Custom styles for the Configurator
import ConfiguratorRoot from "@/material/template/Configurator/ConfiguratorRoot";

// Material Dashboard 2 React context
import {
    useMaterialUIController,
    setOpenConfigurator,
    setTransparentSidenav,
    setWhiteSidenav,
    setFixedNavbar,
    setSidenavColor,
    setDarkMode,
} from "@/material/context";
import {Close, KeyboardArrowDown, KeyboardArrowUp} from "@mui/icons-material";
import {Menu, MenuItem} from "@mui/material";
import {useTranslation} from "react-i18next";
import {useRouter} from "next/navigation";
import i18n from "@/i18n";
import UtilMethods from "@/utils/UtilMethods";
import {getLanguage} from "@/utils";

export const codeCountry = {
    fr :'FR',
    en :'GB'
}

function Configurator()
{
    const {t} = useTranslation();
    const [controller, dispatch] = useMaterialUIController();
    const {openConfigurator, fixedNavbar, sidenavColor, transparentSidenav, whiteSidenav, darkMode} = controller;
    const [disabled, setDisabled] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const sidenavColors = ["sidenav", "primary", "dark", "info", "success", "warning", "error"];
    const open = Boolean(anchorEl);
    const {locale} = useRouter();
    const currentLg = getLanguage();
    const [lg, setLg] = useState(currentLg);


  // Use the useEffect hook to change the button state for the sidenav type based on window size.
    useEffect(() => {
      // A function that sets the disabled state of the buttons for the sidenav type.
        function handleDisabled()
        {
            return window.innerWidth > 1200 ? setDisabled(false) : setDisabled(true);
        }

      // The event listener that's calling the handleDisabled function when resizing the window.
        window.addEventListener("resize", handleDisabled);

      // Call the handleDisabled function to set the state with the initial value.
        handleDisabled();

      // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleDisabled);
    }, []);

    const handleCloseConfigurator = () => setOpenConfigurator(dispatch, false);
    const handleTransparentSidenav = () => {
        setTransparentSidenav(dispatch, true);
        setWhiteSidenav(dispatch, false);
    };
    const handleWhiteSidenav = () => {
        setWhiteSidenav(dispatch, true);
        setTransparentSidenav(dispatch, false);
    };
    const handleDarkSidenav = () => {
        setWhiteSidenav(dispatch, false);
        setTransparentSidenav(dispatch, false);
    };
    const handleFixedNavbar = () => setFixedNavbar(dispatch, !fixedNavbar);
    const handleDarkMode = () => setDarkMode(dispatch, !darkMode);
    const [openL, setOpenL] = useState(false);
    const handleClick = event => {
        setAnchorEl(event.currentTarget);
        setOpenL(_op => !_op)
    };
    const handleClose = () => {
        setAnchorEl(null);
        setOpenL(_op => !_op)
    };

  // sidenav type buttons styles
    const sidenavTypeButtonsStyles = ({
        functions: {pxToRem},
        palette: {white, dark, background},
        borders: {borderWidth},
    }) => ({
        height: pxToRem(39),
        background: darkMode ? background.sidenav : white.main,
        color: darkMode ? white.main : dark.main,
        border: `${borderWidth[1]} solid ${darkMode ? white.main : dark.main}`,

        "&:hover, &:focus, &:focus:not(:hover)": {
            background: darkMode ? background.sidenav : white.main,
            color: darkMode ? white.main : dark.main,
            border: `${borderWidth[1]} solid ${darkMode ? white.main : dark.main}`,
        },
    });

  // sidenav type active button styles
    const sidenavTypeActiveButtonStyles = ({
        functions: {pxToRem, linearGradient},
        palette: {white, gradients, background},
    }) => ({
        height: pxToRem(39),
        background: darkMode ? white.main : linearGradient(gradients.dark.main, gradients.dark.state),
        color: darkMode ? background.sidenav : white.main,

        "&:hover, &:focus, &:focus:not(:hover)": {
            background: darkMode ? white.main : linearGradient(gradients.dark.main, gradients.dark.state),
            color: darkMode ? background.sidenav : white.main,
        },
    });

    return (
    <ConfiguratorRoot variant="permanent" ownerState={{openConfigurator}}>
      <MDBox display="flex" justifyContent="space-between" alignItems="baseline" pt={4} pb={0.5} px={3}>
        <MDBox>
          <MDTypography variant="h5">{t('settings')}</MDTypography>
          <MDTypography variant="caption" color="text">
            {t("customizeOpenLife")}
          </MDTypography>
        </MDBox>

        <Close
          sx={({typography: {size}, palette: {dark, white}}) => ({
                fontSize: `${size.lg} !important`,
                color: darkMode ? white.main : dark.main,
                stroke: "currentColor",
                strokeWidth: "2px",
                cursor: "pointer",
                transform: "translateY(5px)",
            })}
          onClick={handleCloseConfigurator}
        />
      </MDBox>

      <MDBox style={{width:'100%'}} my={2}  pt={4} pb={0.5} px={3}>
          <MDTypography variant='h6'>{t("setLanguage")}</MDTypography>
        <MDButton
            aria-controls={open ? "basic-menu" : undefined}
            aria-haspopup="true"
            aria-expanded={open ? "true" : undefined}
            onClick={handleClick}
            color='primary'
            style={{display:'flex', justifyContent:'space-evenly', alignItems:'center'}}
        >
            <span>
              {t("language")}
              <span style={{marginLeft:'12px'}}>{UtilMethods.isoToEmoji(codeCountry[lg])}</span>
            </span>
          <>
            {
                openL?  <KeyboardArrowUp />: <KeyboardArrowDown />
            }
          </>
        </MDButton>
        <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            MenuListProps={{
                "aria-labelledby": "basic-button",
                }}
        >
          <MenuItem
              style={{width:'100%'}}
              selected={locale === "fr"}
              onClick={() => {
                    i18n.changeLanguage("fr");
                    setLg(_lg => _lg='fr')
                    handleClose();
                    }}>
            {t("french")}
          </MenuItem>
          <MenuItem
              style={{width:'100%'}}
              selected={locale === "en"}
              onClick={() => {
                    i18n.changeLanguage("en");
                    setLg(_lg => _lg='en')
                    handleClose();
                    }}>
            {t("english")}
          </MenuItem>
        </Menu>
      </MDBox>
      <Divider />

      <MDBox pt={0.5} pb={3} px={3}>
        <MDBox>
          <MDTypography variant="h6">{t("sidenavColors")}</MDTypography>

          <MDBox mb={0.5}>
            {sidenavColors.map(color => (
                <IconButton
                key={color}
                sx={({borders: {borderWidth}, palette: {white, dark, background}, transitions}) => ({
                    width: "24px",
                    height: "24px",
                    padding: 0,
                    border: `${borderWidth[1]} solid ${darkMode ? background.sidenav : white.main}`,
                    borderColor: () => {
                        let borderColorValue = sidenavColor === color && dark.main;

                        if (darkMode && sidenavColor === color) {
                            borderColorValue = white.main;
                        }

                        return borderColorValue;
                    },
                    transition: transitions.create("border-color", {
                        easing: transitions.easing.sharp,
                        duration: transitions.duration.shorter,
                    }),
                backgroundImage: ({functions: {linearGradient}, palette: {gradients}}) =>
                    linearGradient(gradients[color].main, gradients[color].state),

                "&:not(:last-child)": {
                    mr: 1,
                    },

                    "&:hover, &:focus, &:active": {
                        borderColor: darkMode ? white.main : dark.main,
                    },
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.25)",
                })}
                onClick={() => setSidenavColor(dispatch, color)}
              />
            ))}
          </MDBox>
        </MDBox>

        <MDBox mt={3} lineHeight={1}>
          <MDTypography variant="h6">Sidenav Type</MDTypography>
          <MDTypography variant="button" color="text">
            {t("chooseSidenavType")}
          </MDTypography>

          <MDBox
            sx={{
                display: "flex",
                mt: 2,
                mr: 1,
                }}>
            <MDButton
              color="dark"
              variant="gradient"
              onClick={handleDarkSidenav}
              disabled={disabled}
              fullWidth
              sx={!transparentSidenav && !whiteSidenav ? sidenavTypeActiveButtonStyles : sidenavTypeButtonsStyles}>
              {t("dark")}
            </MDButton>
            <MDBox sx={{mx: 1, width: "8rem", minWidth: "8rem"}}>
              <MDButton
                color="dark"
                variant="gradient"
                onClick={handleTransparentSidenav}
                disabled={disabled}
                fullWidth
                sx={transparentSidenav && !whiteSidenav ? sidenavTypeActiveButtonStyles : sidenavTypeButtonsStyles}>
                {t("transparent")}
              </MDButton>
            </MDBox>
            <MDButton
              color="dark"
              variant="gradient"
              onClick={handleWhiteSidenav}
              disabled={disabled}
              fullWidth
              sx={whiteSidenav && !transparentSidenav ? sidenavTypeActiveButtonStyles : sidenavTypeButtonsStyles}>
              {t("white")}
            </MDButton>
          </MDBox>
        </MDBox>
        <MDBox display="flex" justifyContent="space-between" alignItems="center" mt={3} lineHeight={1}>
          <MDTypography variant="h6">{t("navbarFixed")}</MDTypography>

          <Switch checked={fixedNavbar} onChange={handleFixedNavbar} />
        </MDBox>
        <Divider />
        <MDBox display="flex" justifyContent="space-between" alignItems="center" lineHeight={1}>
          <MDTypography variant="h6">{t("lightDark")}</MDTypography>

          <Switch checked={darkMode} onChange={handleDarkMode} />
        </MDBox>
      </MDBox>
    </ConfiguratorRoot>
    );
}

export default Configurator;
