import type { IconType } from "react-icons";
import {FaFacebookF,FaLinkedinIn,FaTwitter} from "react-icons/fa";

export type FooterCountryId = | "cameroon"| "central-african-republic";
export type FooterSocialId = | "facebook" | "linkedin" | "twitter";

export type FooterCountryDefinition = {
  id: FooterCountryId;
  flag: string;
};

export type FooterSocialDefinition = {
  id: FooterSocialId;
  href: string;
  icon: IconType;
};

export const FOOTER_COUNTRIES:
  readonly FooterCountryDefinition[] = [
    {
      id: "cameroon",
      flag: "🇨🇲",
    },
    {
      id: "central-african-republic",
      flag: "🇨🇫",
    },
  ];

export const FOOTER_SOCIAL_LINKS:
  readonly FooterSocialDefinition[] = [
    {
      id: "facebook",
      href:"https://www.facebook.com/OpenLifebyACAMVie",
      icon: FaFacebookF,
    },
    {
      id: "linkedin",
      href:"https://www.linkedin.com/company/openlifebyacamvie",
      icon: FaLinkedinIn,
    },
    {
      id: "twitter",
      href:"https://twitter.com/OpenLif24397584",
      icon: FaTwitter,
    },
  ];

export const FOOTER_LINKS = {
  privacy:"/documents/politique-confidentialite-openlife.pdf",
  developer: "https://karbura.com/",
} as const;