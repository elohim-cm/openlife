"use client";

import React, {createContext, useCallback, useContext, useEffect, useRef, useState} from "react";
import {getToken} from "@/utils";
import TwoFactor from "@/services/TwoFactor";

/**
 * État de conformité 2FA de l'utilisateur courant (voir TwoFactorStatus côté
 * backend) : not_required, required_grace_period, required_expired,
 * configured, suspended. Rafraîchi au montage, à intervalle régulier, et
 * immédiatement lorsque l'API renvoie un blocage 423 (événement
 * "two-factor-required" déclenché par AxiosClient).
 */
const TwoFactorComplianceContext = createContext({
  compliance: null,
  loading: true,
  refresh: () => {},
});

export const useTwoFactorCompliance = () => useContext(TwoFactorComplianceContext);

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes: garde les rappels/le compte à rebours à jour sans spammer l'API.

export function TwoFactorComplianceProvider({children}) {
  const [compliance, setCompliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const refreshingRef = useRef(false);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token || refreshingRef.current) return;

    refreshingRef.current = true;
    const result = await TwoFactor.getSettings(token);
    refreshingRef.current = false;

    if (result.error == null && result.data?.compliance) {
      setCompliance(result.data.compliance);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();

    const interval = setInterval(refresh, POLL_INTERVAL_MS);

    const onTwoFactorRequired = () => refresh();
    window.addEventListener("two-factor-required", onTwoFactorRequired);

    return () => {
      clearInterval(interval);
      window.removeEventListener("two-factor-required", onTwoFactorRequired);
    };
  }, [refresh]);

  return (
    <TwoFactorComplianceContext.Provider value={{compliance, loading, refresh}}>
      {children}
    </TwoFactorComplianceContext.Provider>
  );
}
