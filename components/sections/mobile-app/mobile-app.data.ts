import type { IconType } from "react-icons";

import {
  FaAndroid,
  FaApple,
  FaArrowTrendUp,
  FaShield,
} from "react-icons/fa6";

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
  src: string;
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
      icon: FaShield,
    },
    {
      id: "speed",
      icon: FaArrowTrendUp,
    },
  ];

export const MOBILE_APP_SCREENS:
  readonly MobileAppScreenAsset[] = [
    {
      id: "screen-login",
      src: "/images/mobile-app/app-screen-1.jpg",
    },
    {
      id: "screen-dashboard",
      src: "/images/mobile-app/app-screen-2.jpg",
    },
    {
      id: "screen-simulator",
      src: "/images/mobile-app/app-screen-3.jpg",
    },
  ];

export const MOBILE_APP_STORES:
  readonly MobileAppStoreDefinition[] = [
    {
      id: "google-play",
      href: "#",
      icon: FaAndroid,
    },
    {
      id: "app-store",
      href: "#",
      icon: FaApple,
    },
  ];