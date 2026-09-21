"use client";

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import {setMiniSidenav, setOpenConfigurator, useMaterialUIController} from "@/material/context";
import createCache from "@emotion/cache";
import rtlPlugin from "stylis-plugin-rtl";
import MDBox from "@/material/components/MDBox";
import Icon from "@mui/material/Icon";
import {CacheProvider, ThemeProvider} from "@emotion/react";
import {CssBaseline} from "@mui/material";
import Sidenav from "@/material/template/Sidenav";
import Configurator from "@/material/template/Configurator";
import theme from "@/material/assets/theme";
import themeRTL from "@/material/assets/theme/theme-rtl";
import themeDark from "@/material/assets/theme-dark";
import themeDarkRTL from "@/material/assets/theme-dark/theme-rtl";

import routes from "@/material/routes";
import DashboardNavbar from "@/material/template/Navbars/DashboardNavbar";
import Footer from "@/material/template/Footer";
import DashboardLayout from "@/material/template/LayoutContainers/DashboardLayout";
import Constants from "@/utils/constants";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import {AppContext} from "@/contexts/appContext";
import {getToken} from "@/utils";
import Routes from "@/utils/routes";
import UtilsProvider from "@/contexts/UtilsContext";
import {useTranslation} from "react-i18next";
import {ConnectionProvider} from "@/contexts/ConnectionContext";
import {TwoFactorComplianceProvider} from "@/contexts/TwoFactorComplianceContext";
import TwoFactorEnforcementGate from "@/components/TwoFactor/TwoFactorEnforcementGate";

const MaterialLayout = ({children}) => {
  const {t} = useTranslation();
  const [controller, dispatch] = useMaterialUIController();
  const {miniSidenav, direction, layout, openConfigurator, sidenavColor, transparentSidenav, whiteSidenav, darkMode} =
    controller;
  const [pageLoading, setPageLoading] = useState(false);
  const [onMouseEnter, setOnMouseEnter] = useState(false);
  const [sidenavOpened, setSidenavOpened] = useState(false);
  const [rtlCache, setRtlCache] = useState(null);
  const {pathname} = usePathname();
  const router = useRouter();
  const token = getToken();
  const [role, setRole] = useState("");

  if (token == null) router.push(Routes.LOGIN);

  const togglePageLoading = useCallback((_val = false) => {
    setPageLoading(_val);
  }, []);

  const setSidenavOpen = useCallback(
    (_value = false) => {
      if (window.innerWidth < 1200) {
        setSidenavOpened(_value);
        setMiniSidenav(dispatch, !_value);
      }
    },
    [dispatch],
  );

  const contextValue = useMemo(
    () => ({
      togglePageLoading,
      theme: darkMode ? themeDark : theme,
      setSidenavOpen,
    }),
    [darkMode, setSidenavOpen, togglePageLoading],
  );

  // Cache for the rtl
  useMemo(() => {
    const cacheRtl = createCache({
      key: "rtl",
      stylisPlugins: [rtlPlugin],
    });

    setRtlCache(cacheRtl);
  }, []);

  // Open sidenav when mouse enter on mini sidenav
  const handleOnMouseEnter = () => {
    if (miniSidenav && !onMouseEnter) {
      setMiniSidenav(dispatch, false);
      setOnMouseEnter(true);
    }
  };

  // Close sidenav when mouse leave mini sidenav
  const handleOnMouseLeave = () => {
    if (onMouseEnter) {
      setMiniSidenav(dispatch, true);
      setOnMouseEnter(false);
    }
  };

  // Change the openConfigurator state
  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  // Handle click outside sidenav
  const handleClickOutsideSidenav = e => {
    const sidenavContainer = document.querySelector("#app-sidenav-container");
    if (!sidenavContainer.contains(e.target)) {
      if (sidenavOpened) {
        setSidenavOpen(false);
      }
    }
  };

  // Setting the dir attribute for the body element
  useEffect(() => {
    document.body.setAttribute("dir", direction);
  }, [direction]);

  // Setting page scroll to 0 when changing the route
  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
  }, [pathname]);

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.25rem"
      height="3.25rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      right="2rem"
      bottom="2rem"
      zIndex={99}
      color="dark"
      sx={{cursor: "pointer"}}
      onClick={handleConfiguratorOpen}>
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  return direction === "rtl" ? (
    <CacheProvider value={rtlCache}>
      <ThemeProvider theme={darkMode ? themeDarkRTL : themeRTL}>
        <AppContext.Provider value={contextValue}>
          <UtilsProvider>
            <ConnectionProvider>
              <TwoFactorComplianceProvider>
                <CssBaseline />
                <div className="__positionned" onClick={handleClickOutsideSidenav} style={{height: "100vh"}}>
                  <PageLoadingIndicator visible={pageLoading} />
                  {layout === "dashboard" && (
                    <>
                      <Sidenav
                        id="app-sidenav-container"
                        onNavigate={(_val = true) => {
                          setPageLoading(_val);
                        }}
                        color="primary"
                        brandName={Constants.APP_NAME}
                        routes={routes(t)}
                        onMouseEnter={handleOnMouseEnter}
                        onMouseLeave={handleOnMouseLeave}
                        role={role}
                        onHandleChangeRole={setRole}
                        // light = {light}
                      />
                      <Configurator />
                    </>
                  )}
                  {layout === "vr" && <Configurator />}
                  <DashboardLayout>
                    <DashboardNavbar onToggleSidenav={_value => setSidenavOpened(_value)} onHandleChangeRole={setRole} />
                    <TwoFactorEnforcementGate>{children}</TwoFactorEnforcementGate>
                    <Footer />
                  </DashboardLayout>
                </div>
              </TwoFactorComplianceProvider>
            </ConnectionProvider>
          </UtilsProvider>
        </AppContext.Provider>
      </ThemeProvider>
    </CacheProvider>
  ) : (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <AppContext.Provider value={contextValue}>
        <UtilsProvider>
          <ConnectionProvider>
            <TwoFactorComplianceProvider>
              <CssBaseline />
              <div className="__positionned" onClick={handleClickOutsideSidenav} style={{height: "100vh"}}>
                <PageLoadingIndicator visible={pageLoading} />
                {layout === "dashboard" && (
                  <>
                    <Sidenav
                      id="app-sidenav-container"
                      onNavigate={(_val = true) => {
                        setPageLoading(_val);
                      }}
                      color="primary"
                      brandName={Constants.APP_NAME}
                      routes={routes(t)}
                      onMouseEnter={handleOnMouseEnter}
                      onMouseLeave={handleOnMouseLeave}
                      role={role}
                      onHandleChangeRole={setRole}
                      // light = {light}
                    />
                    <Configurator />
                  </>
                )}
                {layout === "vr" && <Configurator />}
                <DashboardLayout>
                  <DashboardNavbar onToggleSidenav={_value => setSidenavOpened(_value)} onHandleChangeRole={setRole} />
                  <TwoFactorEnforcementGate>{children}</TwoFactorEnforcementGate>
                  <Footer company={{name: Constants.AUTHOR.name, href: Constants.AUTHOR.link}} />
                </DashboardLayout>
              </div>
            </TwoFactorComplianceProvider>
          </ConnectionProvider>
        </UtilsProvider>
      </AppContext.Provider>
    </ThemeProvider>
  );
};

export default MaterialLayout;
