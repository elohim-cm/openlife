import type { IconType } from "react-icons";

import {FaFacebookF,FaLinkedinIn,FaTwitter,} from "react-icons/fa";

export type FooterCountry = {
  id: string;
  name: string;
  flag: string;
};

export type FooterSocialLink = {
  id: string;
  label: string;
  href: string;
  icon: IconType;
};

export const FOOTER_COUNTRIES: readonly FooterCountry[] = [
    {
      id: "cameroon",
      name: "Cameroun",
      flag: "🇨🇲",
    },
    {
      id: "central-african-republic",
      name: "RCA",
      flag: "🇨🇫",
    },
  ] as const;

export const FOOTER_SOCIAL_LINKS: readonly FooterSocialLink[] = [
    {
      id: "facebook",
      label: "Facebook",
      href: "https://www.facebook.com/OpenLifebyACAMVie",
      icon: FaFacebookF,
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      href: "https://www.linkedin.com/company/openlifebyacamvie",
      icon: FaLinkedinIn,
    },
    {
      id: "twitter",
      label: "Twitter",
      href: "https://twitter.com/OpenLif24397584",
      icon: FaTwitter,
    },
  ] as const;

export const FOOTER_LINKS = {
  privacy: "/documents/politique-confidentialite-openlife.pdf",
  developer: "https://elohim-warren.vercel.app/",
} as const;

export const FOOTER_LEGAL_TEXT = "Open Life est la propriété d’ACAM Vie S.A, société anonyme au capital social de 5 000 000 000 FCFA, régie par le Code des Assurances et agréée par le Ministère des Finances camerounais et la CIMA. Tous droits réservés, N° 320 210 1354 du 27/04/2021, OAPI, Yaoundé, Cameroun.";