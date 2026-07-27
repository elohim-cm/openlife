import type { IconType } from "react-icons";

import {FaEnvelope,FaPhoneAlt,FaWhatsapp,} from "react-icons/fa";

export type AssistanceContact = {
  id: string;
  title: string;
  description: string;
  value: string;
  href: string;
  status: string;
  icon: IconType;
  accentClassName: string;
};

export const ASSISTANCE_CONTACTS:
  readonly AssistanceContact[] = [
    {
      id: "phone",
      title: "Par Téléphone",
      description:"Notre équipe vous répond de vive voix pour toute question urgente.",
      value: "(+237) 658 994 705",
      href: "tel:+237658994705",
      status: "Disponible 24h/24",
      icon: FaPhoneAlt,
      accentClassName: "text-[#31d20d]",
    },
    {
      id: "whatsapp",
      title: "Via WhatsApp",
      description:"Contactez-nous instantanément pour un support rapide et personnalisé.",
      value: "(+237) 658 994 705",
      href: "https://wa.me/237658994705",
      status: "Réponse éclair",
      icon: FaWhatsapp,
      accentClassName: "text-whatsapp",
    },
    {
      id: "email",
      title: "Par E-mail",
      description:"Envoyez-nous vos documents ou demandes détaillées par courriel.",
      value: "support.openlife@acamvie.com",
      href: "mailto:support.openlife@acamvie.com",
      status: "Traitement prioritaire",
      icon: FaEnvelope,
      accentClassName: "text-[#31d20d]",
    },
  ] as const;

const BUSINESS_WHATSAPP_MESSAGE =
  encodeURIComponent("Bonjour, je souhaite obtenir plus d’informations sur le programme d’apporteur d’affaires Open Life.",);

export const BUSINESS_PARTNER = {
  title: "Devenez Apporteur d’Affaires !",
  description:"Enregistrez des clients et gagnez 2 % de commission sur chaque encaissement. Pour plus d’informations, contactez notre équipe technique.",
  buttonLabel: "Contacter l’équipe",
  href: `https://wa.me/237658994705?text=${BUSINESS_WHATSAPP_MESSAGE}`,
} as const;