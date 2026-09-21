"use client";

import React from "react";
import {usePathname} from "next/navigation";
import {useTwoFactorCompliance} from "@/contexts/TwoFactorComplianceContext";
import TwoFactorGraceBanner from "@/components/TwoFactor/TwoFactorGraceBanner";
import TwoFactorLockScreen from "@/components/TwoFactor/TwoFactorLockScreen";
import Routes from "@/utils/routes";

const PROFILE_PATH = Routes.PROFIL ?? "/profil";

/**
 * Point d'application, côté frontend, de l'obligation de 2FA : affiche la
 * bannière de rappel pendant le délai de grâce, ou remplace entièrement le
 * contenu du dashboard par l'écran de blocage une fois ce délai dépassé —
 * quelle que soit l'URL demandée, à l'exception de la page de profil qui
 * reste seule accessible pour permettre la configuration elle-même.
 *
 * Ceci reflète côté client la même logique d'exemption que le middleware
 * EnsureTwoFactorCompliance côté API : le blocage réel et faisant autorité
 * est celui du backend (toute tentative de contournement en naviguant
 * directement vers une autre route continuera de recevoir des réponses 423
 * de l'API), cet écran n'est qu'un confort d'expérience utilisateur pour ne
 * pas laisser un dashboard inutilisable à moitié affiché.
 */
export default function TwoFactorEnforcementGate({children}) {
  const pathname = usePathname();
  const {compliance} = useTwoFactorCompliance();

  if (!compliance) {
    return children;
  }

  const isProfilePage = pathname?.startsWith(PROFILE_PATH);

  if (compliance.status === "required_expired" || compliance.status === "suspended") {
    if (isProfilePage) {
      return children;
    }
    return <TwoFactorLockScreen compliance={compliance} />;
  }

  if (compliance.status === "required_grace_period") {
    return (
      <>
        <TwoFactorGraceBanner compliance={compliance} />
        {children}
      </>
    );
  }

  return children;
}
