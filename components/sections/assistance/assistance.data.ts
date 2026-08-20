import type { IconType } from "react-icons";

import {
  FaEnvelope,
  FaPhoneAlt,
  FaWhatsapp,
} from "react-icons/fa";

export type AssistanceContactId = | "phone" | "whatsapp" | "email";

export type AssistanceContactDefinition = {
  id: AssistanceContactId;
  href: string;
  icon: IconType;
  accentClassName: string;
};

export type AssistanceContact =
  AssistanceContactDefinition & {
    title: string;
    description: string;
    value: string;
    status: string;
    ariaLabel: string;
  };

export type BusinessPartner = {
  title: string;
  description: string;
  buttonLabel: string;
  buttonAriaLabel: string;
  href: string;
};

export const ASSISTANCE_PHONE ="237681704497";

export const ASSISTANCE_CONTACTS:
  readonly AssistanceContactDefinition[] = [
    {
      id: "phone",
      href: `tel:+${ASSISTANCE_PHONE}`,
      icon: FaPhoneAlt,
      accentClassName: "text-[#31d20d]",
    },
    {
      id: "whatsapp",
      href: `https://wa.me/${ASSISTANCE_PHONE}`,
      icon: FaWhatsapp,
      accentClassName: "text-whatsapp",
    },
    {
      id: "email",
      href: "mailto:support.openlife@acamvie.com",
      icon: FaEnvelope,
      accentClassName: "text-[#31d20d]",
    },
  ];