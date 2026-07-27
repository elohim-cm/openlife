import type { IconType } from "react-icons";

import {
  FaAndroid,
  FaApple,
  FaArrowTrendUp,
  FaShield,
} from "react-icons/fa6";

export type MobileAppFeature = {
  id: string;
  title: string;
  description: string;
  icon: IconType;
};

export type MobileAppScreen = {
  id: string;
  src: string;
  alt: string;
};

export const MOBILE_APP_FEATURES: readonly MobileAppFeature[] = [
  {
    id: "security",
    title: "Sécurisé et Fiable",
    description: "Vos transactions sont protégées avec les meilleurs standards de sécurité",
    icon: FaShield,
  },
  {
    id: "speed",
    title: "Rapide et Pratique",
    description: "Accédez à vos services d’assurance en quelques clics",
    icon: FaArrowTrendUp,
  },
] as const;

export const MOBILE_APP_SCREENS: readonly MobileAppScreen[] = [
  {
    id: "screen-login",
    src: "/images/mobile-app/app-screen-1.jpg",
    alt: "Écran de connexion de l’application Open Life",
  },
  {
    id: "screen-dashboard",
    src: "/images/mobile-app/app-screen-2.jpg",
    alt: "Tableau de bord mobile Open Life",
  },
  {
    id: "screen-simulator",
    src: "/images/mobile-app/app-screen-3.jpg",
    alt: "Simulateur mobile Open Life",
  },
] as const;

export const MOBILE_APP_STORES = [
  {
    id: "google-play",
    label: "Google Play",
    eyebrow: "Disponible sur",
    href: "#",
    icon: FaAndroid,
  },
  {
    id: "app-store",
    label: "App Store",
    eyebrow: "Télécharger sur",
    href: "#",
    icon: FaApple,
  },
] as const;