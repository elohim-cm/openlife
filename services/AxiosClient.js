import axios from "axios";
import detectBrowser from "@/utils/BrowserDetails";
import { PROVIDER } from "@/services/roleService";
import { getDeviceToken } from "@/utils/DeviceToken";

// Timeout raisonnable pour l'attente d'un refresh
const REFRESH_WAIT_TIMEOUT = 5000; // 5 secondes max
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.request.use(function (config) {
  const { browser, os, version } = detectBrowser(window.navigator.userAgent);
  config.headers["X-User-Agent"] = `Browser: ${browser}, Version: ${version}, OS: ${os}`;

  const deviceToken = getDeviceToken();
  if (deviceToken) {
    config.headers["X-Device-Token"] = deviceToken;
  }

    const urlStr = (config?.url || "").toString();
    const skipAuthHeader = config?.headers?.["Skip-Auth"] === true || config?.headers?.["Skip-Auth"] === "true";
    const isAuthEndpoint = urlStr.includes("/auth/");

    // Ne pas ajouter de token pour les endpoints publics
    if (skipAuthHeader || isAuthEndpoint) {
      return config;
    }

  // Récupérer le token actuel
  try {
    const raw = localStorage.getItem("storedValues");
    if (raw) {
      const sv = JSON.parse(raw);

      if (sv?.token) {
        // Vérifier si le token est expiré
        if (sv?.token_expired_at) {
          const expiry = new Date(sv.token_expired_at.replace(" ", "T"));
          const now = new Date();

          // Si le token expire dans moins de 30 secondes OU est déjà expiré
          if (expiry.getTime() - now.getTime() < 30000) {
            // Déclencher un refresh si pas déjà en cours
            if (!isRefreshing && typeof window !== "undefined") {
              window.dispatchEvent(new CustomEvent('triggerTokenRefresh'));
            }
          }
        }

        config.headers["Authorization"] = `Bearer ${sv.token}`;

        // Automatically set X-Provider-Code header if user is a provider
        if (sv.access && sv.currentAccess) {
          const currentAccess = sv.access.find(a => a.uid === sv.currentAccess);
          if (currentAccess && currentAccess.role?.code === PROVIDER) {
            config.headers["X-Provider-Code"] = currentAccess.code;
          }
        }
      }
    }
  } catch (error) {
    console.warn("Error reading token from storage:", error);
  }

  return config;
});

/**
 * Intercepteur de réponse
 */
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error || {};

    // La 2FA est obligatoire et le délai de grâce est dépassé (ou un admin a
    // exigé une reconfiguration) : prévenir immédiatement le contexte de
    // conformité plutôt que d'attendre son prochain sondage périodique, pour
    // que l'écran de blocage apparaisse sans délai perceptible.
    if (response?.status === 423 && response?.data?.two_factor_required && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("two-factor-required", { detail: response.data }));
    }

    // Ne pas retry si déjà tenté ou si pas de config
    if (!config || config.__isRetry) {
      return Promise.reject(error);
    }

    const skipAuthHeader = config?.headers?.["Skip-Auth"] === true || config?.headers?.["Skip-Auth"] === "true";
    const urlStr = (config?.url || "").toString();
    const isAuthEndpoint = urlStr.includes('/auth/');

    // Ne gérer que les erreurs 401 sur les endpoints protégés
    if (skipAuthHeader || isAuthEndpoint || response?.status !== 401) {
      return Promise.reject(error);
    }

      config.__retryCount = 1;

      // Attendre brièvement qu'un refresh soit complété
      try {
        await new Promise((resolve, reject) => {
          const startTime = Date.now();

          const checkRefresh = () => {
            if (Date.now() - startTime > REFRESH_WAIT_TIMEOUT) {
              reject(new Error("Refresh timeout"));
              return;
            }

            // Vérifier si un nouveau token est disponible
            try {
              const raw = localStorage.getItem("storedValues");
              if (raw) {
                const sv = JSON.parse(raw);
                if (sv?.token) {
                  resolve(sv.token);
                  return;
                }
              }
            } catch (e) {
              // Continue
            }

            setTimeout(checkRefresh, 100);
          };

          checkRefresh();
        });

        // Réessayer la requête avec le nouveau token
        const raw = localStorage.getItem("storedValues");
        if (raw) {
          const sv = JSON.parse(raw);
          if (sv?.token) {
            config.headers.Authorization = `Bearer ${sv.token}`;
            return axios(config);
          }
        }
      } catch (waitError) {
        // Timeout ou erreur pendant l'attente
        console.warn("Failed to refresh token for retry:", waitError);
      }

      return Promise.reject(error);
    }
);

// Écouter l'événement de refresh déclenché par l'intercepteur
if (typeof window !== "undefined") {
  window.addEventListener('triggerTokenRefresh', async () => {
    if (isRefreshing) return;

    isRefreshing = true;

    try {
      // Déclencher le refresh via votre TokenRefreshManager
      // Vous pouvez émettre un événement personnalisé ou appeler directement la fonction
      window.dispatchEvent(new CustomEvent('manualTokenRefresh'));
    } finally {
      isRefreshing = false;
    }
  });
}

export default axios;