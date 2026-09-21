// noinspection JSValidateTypes

import React, {useEffect, useRef, useState} from "react";
import PropTypes from "prop-types";

import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import MDTypography from "@/material/components/MDTypography";
import SidenavCollapse from "@/material/template/Sidenav/SidenavCollapse";

import SidenavRoot from "@/material/template/Sidenav/SidenavRoot";
import {
    useMaterialUIController,
    setMiniSidenav,
    setTransparentSidenav,
    setWhiteSidenav,
    setOpenConfigurator
} from "@/material/context";
import {usePathname, useRouter} from "next/navigation";
import {logo, logo_white} from "@/utils/assets/assets";
import Image from "next/image";
import MenuUtils from "@/utils/menu";
import {useTheme} from "@mui/material/styles";
import MDBox from "@/material/components/MDBox";
import {
    navbarIconButton,
    navbarSubSettings,
    sidebarSubSettings
} from "@/material/template/Navbars/DashboardNavbar/styles";
import IconButton from "@mui/material/IconButton";
import SettingsIcon from "@mui/icons-material/Settings";
import {Box, Stack, useMediaQuery} from "@mui/material";
import {ArrowDropDown, ArrowDropUp, Dashboard} from "@mui/icons-material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Constants from "@/utils/constants";
import Menu from "@mui/material/Menu";
import NotificationItem from "@/material/template/Items/NotificationItem";
import Routes from "@/utils/routes";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import AuthService from "@/services/AuthService";
import Toast from "@/utils/toast";
import {useAppContext} from "@/contexts/appContext";
import {getUserAccess} from "@/services/accountService";
import Habilitation from "@/services/Habilitation";
import {DASHBOARD_PAGE} from "@/utils/routes/routes";
import {useHabilitations} from "@/contexts/UtilsContext";
import {useTranslation} from "react-i18next";
import MDButton from "@/material/components/MDButton";
import UtilMethods from "@/utils/UtilMethods";

function Sidenav({color = "info", brandName, routes, onNavigate, role = '', isMini = false, light = false, onHandleChangeRole, ...rest})
{
    const {t} = useTranslation();
    const [controller, dispatch] = useMaterialUIController();
    const [activeMenu, setActiveMenu] = useState("");
    const [openMenu, setOpenMenu] = useState(false);
    const [openRoleMenu, setOpenRoleMenu] = useState(false);
    const {miniSidenav, transparentSidenav, whiteSidenav, darkMode, fixedNavbar, openConfigurator} = controller;
    const pathname = usePathname();
    const paths = pathname.split("/");
    let collapseName = paths[paths.length - 1];
    //--------------------------------------------
    const router = useRouter();
    const context = useAppContext();
    const theme = useTheme()
    const {habilitations, defineHabilitations} = useHabilitations();
    const [token, setToken] = useState("");
    const {
        token: token_,
        image,
        access: accesses,
        currentAccess,
        firstName,
        lastName,
        email,
    } = JSON.parse(localStorage.getItem("storedValues") ?? Constants.defaultStoredValue);
    const [access, setAccess] = useState(currentAccess);

    const [isMobile, setIsMobile] = useState(false);

    const isMobileResolution = useMediaQuery('(max-width: 759px)');

    let textColor = "white";

    if (transparentSidenav || (whiteSidenav && !darkMode)) {
        textColor = "dark";
    } else if (whiteSidenav && darkMode) {
        textColor = "inherit";
    }
    const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

    const handleOpenMenu = event => setOpenMenu(event.currentTarget);
    const handleOpenRoleMenu = async event => setOpenRoleMenu(event.currentTarget);

    const handleCloseMenu = () => setOpenMenu(false);
    const handleCloseRoleMenu = () => setOpenRoleMenu(false);

    const sidebarRef = useRef(null);
    const closeSidenav = () => setMiniSidenav(dispatch, true);

    useEffect(() => {
        // Mettez à jour l'état lorsque la résolution change
        setIsMobile(isMobileResolution);
    }, [isMobileResolution]);

    useEffect(() => {
      // A function that sets the mini state of the sidenav.
        function handleMiniSidenav()
        {
            setMiniSidenav(dispatch, window.innerWidth < 1200);
            setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
            setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
        }

      /**
       The event listener that's calling the handleMiniSidenav function when resizing the window.
      */
        window.addEventListener("resize", handleMiniSidenav);

      // Call the handleMiniSidenav function to set the state with the initial value.
        handleMiniSidenav();

      // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleMiniSidenav);
    }, [dispatch, whiteSidenav, transparentSidenav]);

    useEffect(() => {
        context.togglePageLoading();
        setToken(token_);
    }, [token_]);

    const [isOutSide, setIsOutSide] = useState(false)
    const getAllChildren = (element) => {
        var relatedTarget = element
        while (relatedTarget !== element && relatedTarget.nodeName !== 'BODY' && relatedTarget !== document) {
            relatedTarget = relatedTarget.parentNode;
        }
        if (relatedTarget !== element) {
            return ;
        }

        return relatedTarget;
    };

    useEffect(() => {
        try {
            const {role: _role} = accesses?.find(access => access.uid === currentAccess);
            console.log(_role.code)
            onHandleChangeRole(_role.code);
        } catch (e) {
            Toast.error(t("unAuthenticated"));
        }
    }, [access]);

  // Render all the routes from the routes.js (All the visible items on the Sidenav)
    const renderRoutes = routes.map(({type, name, icon, title, noCollapse, key, href, route, items, isMini}) => {
        let returnValue;
      // console.log("Sidenav::: ", items);
        if (type === "collapse") {
            returnValue = href ? (
            <Link href={href} key={key} target="_blank" rel="noreferrer" sx={{textDecoration: "none"}}>
            <SidenavCollapse
            name={name}
            icon={icon}
            collapseName={collapseName}
            active={key === collapseName}
            items={items}
            noCollapse={noCollapse}
            />
            </Link>
            ) : items ? (
            <div
              key={key}
              onClick={() => {
                    if (route && activeMenu !== key) {
                        onNavigate();
                    }
                    }}
              style={{marginLeft:'8px!important'}}
            >
            <SidenavCollapse
                name={name}
                icon={icon}
                id={key}
                onClick={_key => {
                    setActiveMenu(_key);
                    console.log("Active Menu::: ", _key);
                }}
                collapseName={collapseName}
                active={activeMenu === key}
                items={items}
                onNavigate={onNavigate}
            />
            </div>
            ) : (
            <Link
              key={key}
              href={route}
              onClick={() => {
                    if (route && activeMenu !== key) {
                        onNavigate();
                    }
              }}>
            <SidenavCollapse
            name={name}
            icon={icon}
            id={key}
            onClick={_key => {
                // setMiniSidenav(dispatch, true)
                setActiveMenu(_key);
                console.log("Active Menu::: ", _key);
            }}
            collapseName={collapseName}
            active={activeMenu === key}
            items={items}
            onNavigate={onNavigate}
            />
            </Link>
            );
        } else if (type === "title") {
            returnValue = (
            <MDTypography
            key={key}
            color={textColor}
            display="block"
            variant="caption"
            fontWeight="bold"
            textTransform="uppercase"
            pl={3}
            mt={2}
            mb={1}
            ml={1}>
            {title}
            </MDTypography>
            );
        } else if (type === "divider") {
            returnValue = (
            <Divider
            key={key}
            light={
                (!darkMode && !whiteSidenav && !transparentSidenav) || (darkMode && !transparentSidenav && whiteSidenav)
              }
            />
            );
        }
        const tab = items ? items.map(item => item.key) : [];
        if (MenuUtils.hasMenu(key, isMobile) || MenuUtils.parentNode(tab)) {
            return returnValue;
        }
        return null;
    });
    const iconsStyle = ({palette: {dark, white, text}, functions: {rgba}}) => ({
        color: () => {
            let colorValue = light || darkMode ? white.main : dark.main;

            return colorValue;
        },
    });

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
            sx={{mt: 2}}
        >
            <NotificationItem
                onClick={() => {
                    context.togglePageLoading(true);
                    router.push(Routes.PROFIL);
                }}
                icon={<PersonIcon />}
                title="Mon Profil"
            />
            <NotificationItem onClick={handleLogout} icon={<LogoutIcon />} title="Déconnexion" />
        </Menu>
    );

    const handleChangeAccess = async access => {
        try {
            const {uid, role} = access;
            context.togglePageLoading(true);
            const response = await getUserAccess(uid, token);

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

            // Fetch role authorizations
            const roleAuthorizations = await Habilitation.getHabilitationRole(token, role.uid, true);
            console.log("getRoleAuthorization response ||| ");
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
                router.push(DASHBOARD_PAGE);
            }
        } catch (e) {
            console.log(e);
        } finally {
            context.togglePageLoading(false);
        }

        // setAccess(uid)
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
    return (
    <SidenavRoot ref={sidebarRef} className='wrapper-sidebar' {...rest} variant="permanent" ownerState={{transparentSidenav, whiteSidenav, miniSidenav, darkMode}}>
      <Image
        src={darkMode ? logo_white : logo}
        alt="Brand logo"
        width={99}
        height={48}
        style={{display: "block", marginInline: "auto", marginBottom: "24px", overflow: "hidden"}}
      />
      <div className="__sidenav-container">
        <MDBox>
            <MDTypography sx={(theme) => {
                return {
                    width: "100%",
                    textAlign: 'center',
                    color: theme.palette.light.main,
                    display:'block',
                }
                }} variant='body1'
            >
                {UtilMethods.roleMatching(t)[role]}
            </MDTypography>
        </MDBox>
        <MDBox display='flex' justifyContent='center' alignItems='center'>
            <Divider style={{backgroundColor:'white', width:'80%'}} />
        </MDBox>
          <MDBox sx={theme => sidebarSubSettings(theme, {isMini}, light)}>
              <IconButton
                  size="small"
                  disableRipple
                  color="inherit"
                  sx={navbarIconButton}
                  onClick={handleConfiguratorOpen}
              >
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
                  onClick={handleOpenRoleMenu}
              >
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
                  onClick={handleOpenMenu}
              >
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
                      {openMenu ? <ArrowDropUp sx={iconsStyle} /> : <ArrowDropDown sx={iconsStyle} />}
                  </Stack>
              </IconButton>
              {renderMenu()}
          </MDBox>
        <List>{renderRoutes}</List>
        {/*<MDButton >Test</MDButton>*/}
      </div>
    </SidenavRoot>
    );
}

// Typechecking props for the Sidenav
Sidenav.propTypes = {
    color: PropTypes.oneOf(["primary", "secondary", "info", "success", "warning", "error", "dark"]),
    brandName: PropTypes.string.isRequired,
    routes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default Sidenav;