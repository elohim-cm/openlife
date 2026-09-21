const STORAGE_KEY = "openlife_device_token";

/**
 * Identifiant persistant et unique par navigateur, distinct du header
 * X-User-Agent (qui ne fait qu'identifier le navigateur/OS, pas l'appareil).
 * Utilisé par le backend pour reconnaître un "appareil de confiance" et ne
 * plus redemander de code 2FA pendant TWO_FACTOR_TRUSTED_DEVICE_DAYS jours.
 */
export const getDeviceToken = () => {
  if (typeof window === "undefined") {
    return null;
  }

  let token = localStorage.getItem(STORAGE_KEY);
  if (!token) {
    token =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID().replace(/-/g, "")
        : `${Date.now()}${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(STORAGE_KEY, token);
  }
  return token;
};

export default getDeviceToken;
