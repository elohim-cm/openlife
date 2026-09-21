"use client";

import React from "react";
import HabilitationGuard from "@/components/Habilitation/HabilitationGuard";
import UtilMethods from "@/utils/UtilMethods";
import TwoFactorPolicySettings from "@/components/TwoFactorPolicy/TwoFactorPolicySettings";

/**
 * Réservée aux comptes administrateurs (voir le middleware 2fa.admin côté
 * API, qui reste l'autorité réelle) : pas d'entrée de menu habilitations
 * dédiée pour cette page pour l'instant, le contrôle d'accès frontend
 * s'appuie donc sur le rôle courant, en miroir du filet de sécurité
 * EnsureCanManageTwoFactorPolicy côté backend.
 */
const TwoFactorPolicyPage = () => {
  const storedValues = UtilMethods.getStoredValues();
  const currentAccess = storedValues?.access?.find(access => access.uid === storedValues.currentAccess);
  const roleCode = currentAccess?.role?.code;
  const isAuthorized = ["ADMIN", "SUPER ADMIN", "PDG"].includes(roleCode);

  return (
    <HabilitationGuard customCheck={isAuthorized}>
      <TwoFactorPolicySettings />
    </HabilitationGuard>
  );
};

export default TwoFactorPolicyPage;
