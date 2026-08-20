import type { IconType } from "react-icons";

import {
  FaApple,
  FaArrowTrendUp,
  FaGooglePlay,
} from "react-icons/fa6";
import {
  PiShieldCheck,
} from "react-icons/pi";

export type MobileFeatureId =
  | "security"
  | "speed";

export type MobileScreenId =
  | "screen-login"
  | "screen-dashboard"
  | "screen-simulator";

export type MobileStoreId =
  | "google-play"
  | "app-store";

export type MobileAppFeatureDefinition = {
  id: MobileFeatureId;
  icon: IconType;
};

export type MobileAppScreenAsset = {
  id: MobileScreenId;
  lightSrc: string;
  darkSrc: string;
};

export type MobileAppStoreDefinition = {
  id: MobileStoreId;
  href: string;
  icon: IconType;
};

export type MobileAppScreen = MobileAppScreenAsset & {
  alt: string;
};

export const MOBILE_APP_FEATURES:
  readonly MobileAppFeatureDefinition[] = [
    {
      id: "security",
      icon: PiShieldCheck,
    },
    {
      id: "speed",
      icon: FaArrowTrendUp,
    },
  ];

export const MOBILE_APP_SCREENS:
  readonly MobileAppScreenAsset[] = [
    {
      id: "screen-dashboard",
      lightSrc:
        "/images/mobile-app/dashboard-light.jpg",
      darkSrc:
        "/images/mobile-app/dashboard-dark.jpeg",
    },
    {
      id: "screen-login",
      lightSrc:
        "/images/mobile-app/login-light.jpg",
      darkSrc:
        "/images/mobile-app/login-dark.jpeg",
    },
    {
      id: "screen-simulator",
      lightSrc:
        "/images/mobile-app/simulation-light.jpg",
      darkSrc:
        "/images/mobile-app/simulation-dark.jpeg",
    },
  ];

export const MOBILE_APP_STORES:
  readonly MobileAppStoreDefinition[] = [
    {
      id: "google-play",
      href: "#",
      icon: FaGooglePlay,
    },
    {
      id: "app-store",
      href: "#",
      icon: FaApple,
    },
  ];