"use client";

import React, {useState, useEffect, useCallback, useRef} from "react";
import QuizIcon from '@mui/icons-material/Quiz';
// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// @material-ui core components
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";

// Material Dashboard 2 React components
import MDBox from "@/material/components/MDBox";
import MDInput from "@/material/components/MDInput";

// Material Dashboard 2 React example components
import Breadcrumbs from "@/material/template/Breadcrumbs";
import NotificationItem from "@/material/template/Items/NotificationItem";
import SettingsIcon from "@mui/icons-material/Settings";
import MenuOpenIcon from "@mui/icons-material/MenuOpen";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

// Custom styles for DashboardNavbar
import {
  navbar,
  navbarContainer,
  navbarRow,
  navbarIconButton,
  navbarMobileMenu,
  navbarRowHideToXS,
  navbarSettings,
  navbarSubSettings,
  navbarInput,
} from "@/material/template/Navbars/DashboardNavbar/styles";

// Material Dashboard 2 React context
import {useMaterialUIController, setTransparentNavbar, setMiniSidenav, setOpenConfigurator} from "@/material/context";
import {usePathname, useRouter} from "next/navigation";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import {useAppContext} from "@/contexts/appContext";
import AuthService from "@/services/AuthService";
import Constants from "@/utils/constants";
import Toast from "@/utils/toast";
import Routes from "@/utils/routes";
import {Box, Button, ClickAwayListener, Paper, Popper, Stack, Typography} from "@mui/material";
import {
    ArrowDropDown,
    ArrowDropUp, CheckCircle,
    Dashboard,
    ExpandLess,
    ExpandMore, Info,
    Notifications, Quiz,
    Warning
} from "@mui/icons-material";
import Image from "next/image";
import MDTypography from "@/material/components/MDTypography";
import {getUserAccess} from "@/services/accountService";
import {useHabilitations} from "@/contexts/UtilsContext";
import {DASHBOARD_PAGE} from "@/utils/routes/routes";
import Habilitation from "@/services/Habilitation";
import {useTranslation} from "react-i18next";
import UtilMethods from "@/utils/UtilMethods";
import {getToken} from "@/utils";
import Badge from "@mui/material/Badge";
import NotificationService from "@/services/Notification";
import {displayHttpError} from "@/utils/api";
import ActivityIndicator from "@/components/ActivityIndicator";
import CircularProgress from "@mui/material/CircularProgress";
import NotificationWrapper from "@/components/NotificationWrapper";
import {checkerItem} from "@/components/Notification/NotificationListing";
import TwoFAModal from "@/components/TwoFAModal";

const DEBUG_REFRESH = true;

function DashboardNavbar({absolute = false, light = false, isMini = false, onHandleChangeRole, onToggleSidenav}) {
  const {t} = useTranslation();
  const [navbarType, setNavbarType] = useState();
  const router = useRouter();
  const [controller, dispatch] = useMaterialUIController();
  const {miniSidenav, transparentNavbar, fixedNavbar, openConfigurator, darkMode} = controller;
  const [openMenu, setOpenMenu] = useState(false);
  const [openRoleMenu, setOpenRoleMenu] = useState(false);
  const [reload, setReload] = useState(false);
  const [hasClick, setHasClick] = useState(false);
  const [cNotif, setcNotif] = useState(0);
  const [notifications, setNotifications] = useState(undefined);
  //-----------------------------------------------------------
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  //-----------------------------------------------------------
  const pathname = usePathname();
  const route = pathname.split("/").slice(1);
  const context = useAppContext();
  
  // Récupérer les valeurs initiales
  const getStoredData = () => {
    return JSON.parse(localStorage.getItem("storedValues") ?? Constants.defaultStoredValue);
  };
  
  const [
    {
      token: token_,
      image,
      access: accesses,
      currentAccess,
      firstName,
      lastName,
      email,
      uid,
    },
    setStoredData
  ] = useState(getStoredData);
  const [access, setAccess] = useState(currentAccess);
  const [role, setRole] = useState("");
  const [pendingData, setPendingData] = useState(null);

  const twoFaRef = useRef(null);

  const {habilitations, defineHabilitations} = useHabilitations();

  const [open, setOpen] = useState(false);
  const anchorRef = React.useRef(null);
  const iconRetrieved = {
    info: {icon: <Info style={{fontSize: "16px"}} color="info" />, color: "#1E90FF"},
    success: {icon: <CheckCircle style={{fontSize: "16px"}} color="success" />, color: "#32CD32"},
    error: {icon: <Info style={{fontSize: "16px"}} color="error" />, color: "#FF0000"},
    alert: {icon: <Warning style={{fontSize: "16px"}} color="warning" />, color: "#FFA500"},
  };

  useEffect(() => {
    context.togglePageLoading();
    setToken(token_);
    
    // Écouter les événements de refresh token pour mettre à jour les données
    const handleTokenRefresh = () => {
      const freshData = getStoredData();
      setStoredData(freshData);
      setToken(freshData.token);
      if (DEBUG_REFRESH) console.log('[DashboardNavbar] Token refreshed, updating state');
    };
    
    window.addEventListener('tokenRefreshed', handleTokenRefresh);
    
    return () => {
      window.removeEventListener('tokenRefreshed', handleTokenRefresh);
    };
  }, [token_]);

  useEffect(() => {
    (async () => {
      try {
        const counter = await NotificationService.count(token_);
        setcNotif(counter);
      } catch (e) {
        AuthService.formatFetchErrorMsgAndLogout(e, context, router);
      }
    })();
  }, [token_, reload, open]);

  useEffect(() => {
    if (open) {
      (async () => {
        try {
          const {notifications} = await NotificationService.get(token_, 1, uid, "unread");
          setNotifications(notifications);
        } catch (e) {
          AuthService.formatFetchErrorMsgAndLogout(e, context, router);
        }
      })();
    }
  }, [token_, open]);

  useEffect(() => {
    try {
      const {role: _role} = accesses?.find(access => access.uid === currentAccess);
      setRole(_role.code);
      onHandleChangeRole(_role.code);
    } catch (e) {
      Toast.error(t("unAuthenticated"));
    }
  }, [access]);

  useEffect(() => {
    // Setting the navbar type
    if (fixedNavbar) {
      setNavbarType("sticky");
    } else {
      setNavbarType("static");
    }

    // A function that sets the transparent state of the navbar.
    function handleTransparentNavbar() {
      setTransparentNavbar(dispatch, (fixedNavbar && window.scrollY === 0) || !fixedNavbar);
    }

    /**
         The event listener that's calling the handleTransparentNavbar function when
         scrolling the window.
        */
    window.addEventListener("scroll", handleTransparentNavbar);

    // Call the handleTransparentNavbar function to set the state with the initial value.
    handleTransparentNavbar();

    // Remove event listener on cleanup
    return () => window.removeEventListener("scroll", handleTransparentNavbar);
  }, [dispatch, fixedNavbar]);

  const handleMiniSidenav = () => {
    onToggleSidenav(miniSidenav);
    setMiniSidenav(dispatch, !miniSidenav);
  };
  const handleConfiguratorOpen = () => {
    setOpenConfigurator(dispatch, !openConfigurator);
  };
  const handleOpenMenu = event => setOpenMenu(event.currentTarget);
  const handleOpenRoleMenu = async event => setOpenRoleMenu(event.currentTarget);

  const handleCloseMenu = () => setOpenMenu(false);
  const handleCloseRoleMenu = () => setOpenRoleMenu(false);
  const handleLogout = async () => {
    try {
      context.togglePageLoading(true);
      const result = await AuthService.logoutWithToken(token, context);
      Toast.success(result);
      router.push(Routes.LOGIN);
    } catch (e) {
      AuthService.formatFetchErrorMsgAndLogout(e, context, router);
    }
  };

  const handleMarkAsRead = async _uid => {
    try {
      const {message} = await NotificationService.maskAsRead(token, _uid);
      const notificationFiltered = notifications.filter(notif => notif.uid !== _uid);

      setNotifications(notificationFiltered);
      setReload(prev => !prev);
      Toast.success(message);
    } catch (e) {
      AuthService.formatFetchErrorMsgAndLogout(e, context, router);
    }
  };
  // Render the notifications menu
  const renderMenu = () => (
    <Menu
      anchorEl={openMenu}
      anchorReference={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      open={Boolean(openMenu)}
      onClose={handleCloseMenu}
      sx={{mt: 2}}>
      <NotificationItem
        onClick={() => {
          context.togglePageLoading(true);
          router.push(Routes.PROFIL);
        }}
        icon={<PersonIcon />}
        title="Mon Profil"
      />
        <NotificationItem onClick={() => {
            context.togglePageLoading(true)
            router.push(Routes.FAQ)
        }} icon={<Quiz />} title="FaQ" />
      <NotificationItem onClick={handleLogout} icon={<LogoutIcon />} title="Déconnexion" />
    </Menu>
  );

  const handleChangeAccess = async (access, otp = null) => {
    try {
      const {uid, role} = access;
      context.togglePageLoading(true);
      
      // TOUJOURS récupérer le token frais au moment de la requête
      const freshToken = getToken();
      console.log('[handleChangeAccess] Fresh token .:. ', freshToken);
      const response = await getUserAccess(uid, freshToken, otp);

      twoFaRef.current.toggleLoader(false);
      
      if(response.error && response.error.response?.status === 403 && response.error.response.data?.two_step) {
        Toast.warn(response.error.response.data.message);
        setPendingData(access);
        twoFaRef.current.open(response.error.response.data.data);
        return;
      }

      const authorizations = response.authorizations;
      defineHabilitations(authorizations);
      //  set the access to local storage
      localStorage.setItem("currentAccess", uid);

      //  const set the access to local storage
      let storedValues = JSON.parse(localStorage.getItem("storedValues"));
      storedValues = {
        ...storedValues,
        authorizations: authorizations,
        currentAccess: uid,
      };
      localStorage.setItem("storedValues", JSON.stringify(storedValues));

      // Fetch role authorizations - TOUJOURS récupérer le token frais
      const roleAuthToken = getToken();
      console.log('[handleChangeAccess] Role auth token .:. ', roleAuthToken);
      const roleAuthorizations = await Habilitation.getHabilitationRole(roleAuthToken, role.uid, true);
      console.log('[handleChangeAccess] Role authorizations .:. ', roleAuthorizations);
      // Update storedValues in local storage for role authorizations
      storedValues = {
        ...storedValues,
        role_authorizations: roleAuthorizations,
      };

      localStorage.setItem("storedValues", JSON.stringify(storedValues));

      setAccess(uid);
      const dashboardUrl = window.location.href.split("/");
      let menu = dashboardUrl.pop();

      if (menu === DASHBOARD_PAGE.split("/").pop()) {
        window.location.reload();
      } else {
        window.location.reload();
        //router.push(DASHBOARD_PAGE);
        window.location.href = DASHBOARD_PAGE;
      }
    } catch (e) {
      AuthService.formatFetchErrorMsgAndLogout(e, context, router);
    } finally {
      context.togglePageLoading(false);
    }

    // setAccess(uid)
  };
  const toggleOpen = () => {
    setOpen(prevOpen => !prevOpen);
  };
  //render accesses menu
  const renderAccesses = () => {
    return (
      <Menu
        anchorEl={openRoleMenu}
        anchorReference={null}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        open={Boolean(openRoleMenu)}
        onClose={handleCloseRoleMenu}
        sx={{mt: 2}}>
        {accesses?.map((access, key) => (
          <NotificationItem
            isActive={access.role.code === role}
            key={key}
            onClick={() => handleChangeAccess(access)}
            title={`${UtilMethods.roleMatching(t)[access.role.code]} ${access.role.code === role ? "(actuel)" : ""}`}
          />
        ))}
      </Menu>
    );
  };

  // Styles for the navbar icons
  const iconsStyle = ({palette: {dark, white, text}, functions: {rgba}}) => ({
    color: () => {
      let colorValue = light || darkMode ? white.main : dark.main;

      if (transparentNavbar && !light) {
        colorValue = darkMode ? rgba(text.main, 0.6) : text.main;
      }

      return colorValue;
    },
  });

  const timeDifference = _time => {
    const notificationTime = new Date(_time);
    const currentTime = new Date();
    const differenceInMilliseconds = currentTime - notificationTime;

    // Conversion des millisecondes en secondes, minutes et heures
    const seconds = Math.floor(differenceInMilliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    // Calcul du reste pour chaque unité de temps
    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;

    // Construction de la chaîne de temps écoulé
    let timeString = "";
    if (hours > 0) {
      timeString += `${hours} ${t("hour")}${hours > 1 ? "s" : ""} `;
    }
    if (remainingMinutes > 0) {
      timeString += `${remainingMinutes} ${t("minute")}${remainingMinutes > 1 ? "s" : ""} `;
    }
    if (remainingSeconds > 0) {
      timeString += `${remainingSeconds} ${t("seconde")}${remainingSeconds > 1 ? "s" : ""}`;
    }

    return timeString;
  };

  const handleClickItem = ({uid, datas}, idex) => {
    if (datas) {
      handleMarkAsRead(uid);
      const key = Object.keys(datas)[0],
        value = datas[key];
      checkerItem(value, key, router, Routes, context);
    }
  };
  return (
    <AppBar
      position={absolute ? "absolute" : navbarType}
      color="inherit"
      sx={theme => navbar(theme, {transparentNavbar, absolute, light, darkMode})}>
      <Toolbar sx={theme => navbarContainer(theme)}>
        <MDBox color="inherit" mb={{xs: 0, md: 0}} sx={theme => navbarRow(theme, {isMini})}>
          {false && (
            <Breadcrumbs
              isMini={isMini}
              icon={<HomeIcon />}
              title={route[route.length - 1]}
              route={route}
              light={light}
            />
          )}
        </MDBox>
        {isMini ? null : (
          <MDBox sx={theme => navbarRow(theme, {isMini})}>
            <MDBox sx={theme => navbarInput(theme)} pr={1}>
              <MDInput style={{opacity: "0", marginRight: "12px!important"}} label="Search here" />
            </MDBox>
            <MDBox
              className="btn-toggle"
              sx={theme => navbarSettings(theme, {isMini})}
              color={light ? "white" : "inherit"}>
              <IconButton size="small" disableRipple color="inherit" sx={navbarMobileMenu} onClick={handleMiniSidenav}>
                {miniSidenav ? <MenuIcon sx={iconsStyle} /> : <MenuOpenIcon sx={iconsStyle} />}
              </IconButton>
              <MDBox sx={theme => navbarSubSettings(theme, {isMini})}>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  onClick={() => {
                    toggleOpen();
                    setHasClick(prev => !prev);
                  }}>
                  <Badge badgeContent={cNotif} color="error">
                    <Notifications sx={iconsStyle} />
                  </Badge>
                </IconButton>
                <NotificationWrapper
                  cNotif={cNotif}
                  onHandleClickItem={handleClickItem}
                  notifications={notifications}
                  open={open}
                  anchorRef={anchorRef}
                  toggleOpen={toggleOpen}
                  onHandleMarkAsRead={handleMarkAsRead}
                  timeDifference={timeDifference}
                  iconRetrieved={iconRetrieved}
                />
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  onClick={handleConfiguratorOpen}>
                  <SettingsIcon sx={iconsStyle} />
                </IconButton>
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={{...navbarIconButton, ...{fontSise: "24px!important"}}}
                  aria-controls="role-menu"
                  aria-haspopup="true"
                  variant="contained"
                  onClick={handleOpenRoleMenu}>
                  <Stack direction="row" alignItems="center">
                    <Dashboard sx={iconsStyle} style={{fontSise: "24px!important"}} />
                  </Stack>
                </IconButton>
                {renderAccesses()}
                <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  aria-controls="notification-menu"
                  aria-haspopup="true"
                  variant="contained"
                  onClick={handleOpenMenu}>
                  <Stack direction="row" alignItems="center">
                    {image ? (
                      <img
                        alt="User Image"
                        src={image ? image : "chemin/par/defaut/pour/image"}
                        width={30}
                        height={30}
                        style={{borderRadius: "50%", objectFit: "cover", objectPosition: "center"}}
                      />
                    ) : (
                      <AccountCircleIcon width={50} height={50} sx={iconsStyle} />
                    )}
                    <Box display="flex" justifyContent="space-evenly" alignItems="center">
                      <MDTypography variant="text">{`${
                        String(lastName)?.split(" ")?.length >= 2
                          ? String(lastName)?.split(" ")[0].length >= 5
                            ? String(lastName)?.split(" ")[0].slice(0, 6)
                            : String(lastName)?.split(" ")[0]
                          : String(lastName).slice(0, 5)
                      }...`}</MDTypography>
                      {openMenu ? <ArrowDropUp sx={iconsStyle} /> : <ArrowDropDown sx={iconsStyle} />}
                    </Box>
                  </Stack>
                </IconButton>
                {renderMenu()}
              </MDBox>
            </MDBox>
          </MDBox>
        )}
      </Toolbar>
      <TwoFAModal
        ref={twoFaRef}
        title={t("Two-Factor Authentification")}
        content={t("A Two-Factor OTP has been sent to you by email/sms.")}
        onCancel={() => context.togglePageLoading(false)}
        onContinue={otp => handleChangeAccess(pendingData, otp)}/>
    </AppBar>
  );
}

// Typechecking props for the DashboardNavbar
DashboardNavbar.propTypes = {
  absolute: PropTypes.bool,
  light: PropTypes.bool,
  isMini: PropTypes.bool,
};

export default DashboardNavbar;
