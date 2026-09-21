"use client";

import {useAppContext} from "@/contexts/appContext";
import {useTranslation} from "react-i18next";
import {useRouter} from "next/navigation";
import {useHabilitations} from "@/contexts/UtilsContext";
import React, {useEffect, useState} from "react";
import {getRoleCode} from "@/utils";
import Constants from "@/utils/constants";
import DashboardAdmin from "@/components/Dashboard/DashboardAdmin";
import DashboardProvider from "@/components/Dashboard/DashboardProvider";
import DashboardSubscriber from "@/components/Dashboard/DashboardSubscriber";
import DashboardCustomerService from "@/components/Dashboard/DashboardCustomerService";
import DashboardPDG from "@/components/Dashboard/DashboardPDG";
import DashboardTreasurer from "@/components/Dashboard/DashboardTreasurer";
import DashboardTechnicalReference from "@/components/Dashboard/DashboardTechnicalReference";
import {Typography} from "@mui/material";
import Routes from "@/utils/routes";

const DashboardPage = () => {
  const [dashboard, setDashboard] = useState(null);
  const context = useAppContext();
  const {t} = useTranslation();
  const router = useRouter();

  const {habilitations} = useHabilitations();

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);

  const getView = () => {
    const role = getRoleCode();
    let jsxElement;
    switch (role) {
      case Constants.ROLES.admin:
        jsxElement = <DashboardAdmin dashboard={dashboard}/>;
        break;
      case Constants.ROLES.sous:
        jsxElement = <DashboardSubscriber dashboard={dashboard} />;
        break;
      case Constants.ROLES.scl:
        jsxElement = <DashboardCustomerService dashboard={dashboard} />;
        break;
      case Constants.ROLES.tre:
        jsxElement = <DashboardTreasurer dashboard={dashboard} />;
        break;
      case Constants.ROLES.tech:
        jsxElement = <DashboardTechnicalReference dashboard={dashboard} />;
        break;
      case Constants.ROLES.inp:
      case Constants.ROLES.mng:
      case Constants.ROLES.anm:
      case Constants.ROLES.dcom:
      case Constants.ROLES.pdg:
      case Constants.ROLES.app:
        jsxElement = <DashboardProvider isBusiness={false} />
        break;
      default:
        jsxElement = (
          <Typography variant="h6" component="h6" mb={1}>
            {t("keyFigures")}
          </Typography>
        );
        break;
    }
    return jsxElement;
  };

  return <>{getView()}</>;
};

export default DashboardPage;
