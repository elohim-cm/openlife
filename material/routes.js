import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import SettingsIcon from "@mui/icons-material/Settings";
import PersonIcon from "@mui/icons-material/Person";
import {
    ContactSupport,
    CreditCardOutlined,
    GroupOutlined, Logout, Person,
    Preview,
    ReceiptLongOutlined,
    Security,
    Settings,
    Shield,
    VerifiedUser,
    VpnKey,
    Wallet,
} from "@mui/icons-material";
import MenuIcon from "@mui/icons-material/Menu";
import HubIcon from "@mui/icons-material/Hub";
import StorefrontIcon from "@mui/icons-material/Storefront";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaymentsIcon from "@mui/icons-material/Payments";
import {GiReceiveMoney} from "react-icons/gi";
import React from "react";

/**
 *
 * @param t
 * @return {[{component: JSX.Element, route: string, name: string, icon: JSX.Element, type: string, key: string},{name: string, icon: JSX.Element, type: string, items: [{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string},{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string},{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string},{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string},{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string}], key: string},{name: string, icon: JSX.Element, type: string, items: [{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string},{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string},{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string},{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string},{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string}], key: string},{name: string, icon: JSX.Element, type: string, items: [{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string},{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string},{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string},{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string},{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string}], key: string},{name: string, icon: JSX.Element, type: string, items: [{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string},{component: JSX.Element, route: string, name: string, icon: JSX.Element, key: string}], key: string},null,null,null,null]}
 */
const routes = t => [
  {
        type: "collapse",
        name: t("dashboard"),
        key: "dashboard",
        icon: <DashboardOutlinedIcon />,
        route: "/dashboard",
        component: <></>,
    },
    {
        type: "collapse",
        name: t("administration"),
        key: "admin",
        icon: <SettingsIcon />,
        items: [
        {
            name: t("accounts"),
            key: "account",
            icon: <PersonIcon />,
            route: "/account",
            component: <></>,
        },
        {
            name: t("access"),
            key: "access",
            icon: <Security />,
            route: "/access",
            component: <></>,
        },
        {
            name: t("roles"),
            key: "role",
            icon: <VerifiedUser />,
            route: "/role",
            component: <></>,
        },
        {
            name: t("authorizations"),
            key: "authorization",
            icon: <VpnKey />,
            route: "/authorization",
            component: <></>,
        },
        {
            name: t("menus"),
            key: "menu",
            icon: <MenuIcon />,
            route: "/menu",
            component: <></>,
        },
        {
            name: t("twoFactorPolicy"),
            key: "2fa-policy",
            icon: <Shield />,
            route: "/security/2fa-policy",
            component: <></>,
        },
        ],
    },
    {
        type: "collapse",
        name: t("businessNetwork"),
        key: "business-network",
        icon: <HubIcon />,
        items: [
        {
            name: t("network"),
            key: "network",
            icon: <HubIcon />,
            route: "/network",
            component: <></>,
        },
        {
            name: t("distributionArea"),
            key: "distribution-area",
            icon: <VpnKey />,
            route: "/distribution-area",
            component: <></>,
        },
        {
            name: t("animationTeam"),
            key: "animation-team",
            icon: <VpnKey />,
            route: "/animation-team",
            component: <></>,
        },
        {
            name: t("provider"),
            key: "provider",
            icon: <VpnKey />,
            route: "/provider",
            component: <></>,
        },
        {
            name: t("businessGoals"),
            key: "business-goals",
            icon: <VpnKey />,
            route: "/business-goal",
            component: <></>,
        },
        ],
    },
    {
        type: "collapse",
        name: t("sales"),
        key: "sells",
        icon: <StorefrontIcon />,
        items: [
        {
            name: t("subscriptions"),
            key: "subscription",
            icon: <GroupOutlined />,
            route: "/sells/subscription",
            component: <></>,
        },
        {
            name: t("relationships"),
            key: "relationships",
            icon: <Wallet />,
            route: "/sells/relationships",
            component: <></>,
        },
        {
            name: t("contracts"),
            key: "contract",
            icon: <ReceiptLongOutlined />,
            route: "/contract",
            component: <></>,
        },
        {
            name: t("collections"),
            key: "collection",
            icon: <AccountBalanceWalletIcon />,
            route: "/collection",
            component: <></>,
        },
        {
            name: t("payments"),
            key: "payments",
            icon: <CreditCardOutlined />,
            route: "/sells/payment",
            component: <></>,
        },
        ],
    },
    {
        type: "collapse",
        name: t("redemptions"),
        key: "rachat",
        icon: <PaymentsIcon />,
        items: [
        {
            name: t("redemptions"),
            key: "redemption",
            icon: <GiReceiveMoney />,
            route: "/redemption",
            component: <></>,
        },
        {
            name: t("payments"),
            key: "payments",
            icon: <CreditCardOutlined />,
            route: "/redemption/payment",
            component: <></>,
        },
        ],
    },
    {
        type: "collapse",
        name: t("commissions"),
        key: "commission",
        route: "/commission",
        icon: <AccountBalanceWalletIcon />,
    },
    {
        type: "collapse",
        name: t("subscribers"),
        key: "souscripteur",
        route: "/souscripteur",
        icon: <GroupOutlined />,
    },
    {
        type: "collapse",
        name: t("myAccount"),
        key: "compte",
        icon: <Settings />,
        items: [
            {
                name: t("mySituation"),
                key: "my situation",
                icon: <Preview />,
                route: "/my-account/situation",
                component: <></>,
            },
            /*{
                name: t("supportAndAssistance"),
                key: "support and assistance",
                icon: <ContactSupport />,
                route: "/my-account/support-and-assistance",
                component: <></>,
            },*/
        ],
    },
    {
          type: "collapse",
          name: t("products"),
          key: "product",
          icon: <SettingsIcon />,
          route: "/product",
          component: <></>,
    },
    {
          type: "collapse",
          name: t("PisteAudit"),
          key: "audit",
          icon: <HubIcon />,
          route: "/piste-audit",
          component: <></>,
    },
];

    export default routes;
