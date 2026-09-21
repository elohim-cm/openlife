"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { login, refreshToken } from "@/services/authServices";
import { useTranslation } from "react-i18next";
import Toast from "@/utils/toast";
import { usePathname, useRouter } from "next/navigation";
import {ACCESS_SELECTION_PAGE, DASHBOARD_PAGE} from "@/utils/routes/routes";
import {getUserAccess} from "@/services/accountService";
import Habilitation from "@/services/Habilitation";
import AuthService from "@/services/AuthService";
import { useAppContext } from "@/contexts/appContext";

// Helper to read and write stored values safely
function getStoredValues() {
  try {
    const raw = localStorage.getItem("storedValues");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Persisted lock state so the modal survives reloads until user refreshes session
function loadLockState() {
  try {
    const raw = localStorage.getItem("sessionLockState");
    return raw ? JSON.parse(raw) : null;
  } catch (_) {
    return null;
  }
}

function saveLockState(state) {
  try {
    localStorage.setItem("sessionLockState", JSON.stringify(state));
  } catch (_) {}
}

function clearLockState() {
  try {
    localStorage.removeItem("sessionLockState");
  } catch (_) {}
}

function setStoredValues(values) {
  localStorage.setItem("storedValues", JSON.stringify(values));
}

function getPreferredUsername() {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    const uname = window.localStorage.getItem("username");
    if (uname) return uname;
  }
  const sv = getStoredValues();
  if (sv?.authCredentials?.email) return sv.authCredentials.email;
  if (sv?.authCredentials?.phone) return sv.authCredentials.phone;
  return "";
}

const SessionManager = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const context = useAppContext();
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [modalType, setModalType] = useState("inactivity"); // "inactivity" or "tokenExpiry"
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const sv = getStoredValues();
    return !!(sv?.token);
  });

  const inactivityTimerRef = useRef(null);
  const lastActivityTimeRef = useRef(Date.now());
  const isLockedRef = useRef(false);
  const throttleTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  const [username, setUsername] = useState(() => getPreferredUsername());

  // Liste des routes publiques où le SessionManager ne doit pas s'afficher
  const isPublicRoute = useMemo(() => {
    if (!pathname) return true;
    let p = (pathname || '/').toLowerCase();
    if (p !== '/' && p.endsWith('/')) p = p.replace(/\/+$/, '');

    const publicPaths = [
      '/login',
      '/forgot',
      '/reset',
      '/simuler',
      '/subscription',
      '/faq',
      '/privacy',
      '/terms',
      '/sign-up',
    ];

    if (p === '/') return true;
    return publicPaths.some(path => p.startsWith(path));
  }, [pathname]);

  // Mettre à jour isAuthenticated quand le token change
  useEffect(() => {
    const checkAuth = () => {
      const sv = getStoredValues();
      setIsAuthenticated(!!(sv?.token));
    };

    // Écouter les événements de refresh de token
    window.addEventListener('tokenRefreshed', checkAuth);
    window.addEventListener('tokenRefreshFailed', checkAuth);
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('tokenRefreshed', checkAuth);
      window.removeEventListener('tokenRefreshFailed', checkAuth);
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Mettre à jour username quand les credentials changent
  useEffect(() => {
    const updateUsername = () => {
      setUsername(getPreferredUsername());
    };

    window.addEventListener('tokenRefreshed', updateUsername);
    window.addEventListener('storage', updateUsername);

    return () => {
      window.removeEventListener('tokenRefreshed', updateUsername);
      window.removeEventListener('storage', updateUsername);
    };
  }, []);

  // Cleanup au unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Arrêter le timer d'inactivité
  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  // Verrouiller la session pour inactivité
  const lockSessionDueToInactivity = useCallback(() => {
    if (isPublicRoute || !isAuthenticated || isLockedRef.current) return;

    isLockedRef.current = true;
    setModalType("inactivity");
    setOpen(true);

    // Persist lock state across reloads
    saveLockState({ locked: true, reason: "inactivity", ts: Date.now() });

    // Émettre un événement personnalisé pour informer d'autres composants
    window.dispatchEvent(new CustomEvent('sessionLocked', { detail: { reason: 'inactivity' } }));
  }, [isPublicRoute, isAuthenticated]);

  // Démarrer/redémarrer le timer d'inactivité
  const startInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    // Lire la durée d'inactivité depuis .env (en minutes), défaut: 10 minutes
    const timeoutMinutes = parseInt(process.env.NEXT_PUBLIC_SESSION_INACTIVITY_TIMEOUT_MINUTES || '10', 10);
    const timeoutMs = timeoutMinutes * 60 * 1000;
    
    inactivityTimerRef.current = setTimeout(() => {
      lockSessionDueToInactivity();
    }, timeoutMs);
  }, [clearInactivityTimer, lockSessionDueToInactivity]);

  // Réinitialiser le timer d'inactivité
  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    startInactivityTimer();
  }, [clearInactivityTimer, startInactivityTimer]);

  // Gestionnaire d'activité utilisateur (throttled)
  const handleUserActivity = useCallback(() => {
    if (isPublicRoute || !isAuthenticated || isLockedRef.current) return;

    // Throttle: max 1 fois par seconde
    if (throttleTimeoutRef.current) return;

    throttleTimeoutRef.current = setTimeout(() => {
      throttleTimeoutRef.current = null;
    }, 1000);

    lastActivityTimeRef.current = Date.now();
    resetInactivityTimer();
  }, [isPublicRoute, isAuthenticated, resetInactivityTimer]);

  // Vérifier l'expiration du token (séparé de l'inactivité)
  const checkTokenExpiry = useCallback(() => {
    // Ne pas vérifier si TokenRefreshManager gère le refresh
    if (window.__sessionRefreshInProgress) return;

    const sv = getStoredValues();
    const tokenExpiry = sv?.token_expired_at;

    if (!tokenExpiry) return;

    // Convertir la date d'expiration en timestamp
    const expiryDate = new Date(tokenExpiry.replace(" ", "T"));
    const now = new Date();

    if (expiryDate <= now) {
      // Token expiré
      isLockedRef.current = true;
      setModalType("tokenExpiry");
      setOpen(true);
      clearInactivityTimer();
      // Persist lock state across reloads
      saveLockState({ locked: true, reason: "tokenExpiry", ts: Date.now() });
    }
  }, []);

  // Écouter les événements d'activité utilisateur
  useEffect(() => {
    if (isPublicRoute || !isAuthenticated) return;

    const events = [
      'mousedown', 'mousemove', 'keypress', 'keydown', 'keyup',
      'scroll', 'touchstart', 'touchmove', 'click', 'dblclick',
      'input', 'change', 'focus', 'blur'
    ];

    const controller = new AbortController();

    events.forEach(event => {
      document.addEventListener(event, handleUserActivity, { 
        passive: true,
        signal: controller.signal
      });
    });

    // Démarrer le timer d'inactivité initial
    startInactivityTimer();

    // Vérifier l'expiration du token périodiquement (toutes les 30 secondes)
    const tokenCheckInterval = setInterval(checkTokenExpiry, 30000);

    return () => {
      controller.abort(); // Nettoie tous les listeners
      clearInactivityTimer();
      clearInterval(tokenCheckInterval);
      if (throttleTimeoutRef.current) {
        clearTimeout(throttleTimeoutRef.current);
        throttleTimeoutRef.current = null;
      }
    };
  }, [isPublicRoute, isAuthenticated, handleUserActivity, checkTokenExpiry]);

  useEffect(() => {
    if (isPublicRoute) {
      setOpen(false);
      setPassword("");
      setError("");
      clearInactivityTimer();
      isLockedRef.current = false;
      clearLockState();
    } else if (isAuthenticated && !isLockedRef.current) {
      resetInactivityTimer();
    }
  }, [isPublicRoute, isAuthenticated]);

  // Empêcher la navigation quand le modal est ouvert
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__sessionLocked = open;
    }

    const handleBeforeUnload = (e) => {
      if (open) {
        e.preventDefault();
        e.returnValue = t("sessionLockedWarning") || "Votre session est verrouillée. Veuillez vous reconnecter.";
      }
    };

    const handlePopState = (e) => {
      if (open) {
        // Empêcher la navigation arrière/avant
        window.history.pushState(null, '', window.location.pathname);
        e.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [open, t]);

  // Synchronisation multi-onglets pour le lock state
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'sessionLockState' && e.newValue) {
        try {
          const state = JSON.parse(e.newValue);
          if (state?.locked && !isLockedRef.current) {
            // Un autre onglet a verrouillé la session
            isLockedRef.current = true;
            setModalType(state?.reason === 'tokenExpiry' ? 'tokenExpiry' : 'inactivity');
            setOpen(true);
            clearInactivityTimer();
          } else if (!state?.locked && isLockedRef.current) {
            // Un autre onglet a déverrouillé la session
            if (!isMountedRef.current) return;
            isLockedRef.current = false;
            setOpen(false);
            setPassword("");
            setError("");
            resetInactivityTimer();
          }
        } catch (err) {
          console.error('[SessionManager] error parsing lock state:', err);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Restaurer le lock state au chargement
  useEffect(() => {
    const state = loadLockState();
    const sv = getStoredValues() || {};
    const hasToken = !!sv?.token;
    if (!isPublicRoute && hasToken && state?.locked === true) {
      isLockedRef.current = true;
      setModalType(state?.reason === 'tokenExpiry' ? 'tokenExpiry' : 'inactivity');
      setOpen(true);
      clearInactivityTimer();
    }
  }, [isPublicRoute]);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    try {
      // Pour déverrouiller, on doit utiliser le refresh avec password
      const sv = getStoredValues() || {};
      const rt = sv?.refresh_token;
      if (rt) {
        // Le refresh de déverrouillage inclut le password (différent du refresh auto)
        const resp = await refreshToken({ refresh_token: rt, username, password });
        
        // Vérifier si le composant est toujours monté
        if (!isMountedRef.current) return;
        
        const data = resp?.data?.data;
        if (!data?.token) throw new Error(t("reconnectionFailed"));

        const updated = {
          ...sv,
          token: data.token,
          token_expired_at: data.token_expired_at || sv.token_expired_at,
          refresh_token: data.refresh_token || sv.refresh_token,
          refresh_token_expired_at: data.refresh_token_expired_at || sv.refresh_token_expired_at,
          authCredentials: {
            email: data.email ?? sv?.authCredentials?.email ?? null,
            phone: data.phone ?? sv?.authCredentials?.phone ?? null,
          },
        };
        setStoredValues(updated);
        if (username) localStorage.setItem("username", username);
      } else {
        // Fallback: full login if no refresh token is available
        const resp = await login({ username, password });
        
        // Vérifier si le composant est toujours monté
        if (!isMountedRef.current) return;
        
        const data = resp?.data?.data;
        if (!data?.token) throw new Error(t("reconnectionFailed"));
        const updated = {
          ...(getStoredValues() || {}),
          token: data.token,
          token_expired_at: data.token_expired_at,
          refresh_token: data.refresh_token,
          refresh_token_expired_at: data.refresh_token_expired_at,
          authCredentials: {
            email: data.email ?? null,
            phone: data.phone ?? null,
          },
        };
        setStoredValues(updated);
        if (username) localStorage.setItem("username", username);
      }

      isLockedRef.current = false;
      setOpen(false);
      setPassword("");

      clearLockState();

      resetInactivityTimer();

      if (typeof window !== "undefined") {
        window.__sessionLocked = false;
      }

      // Émettre un événement de session déverrouillée
      window.dispatchEvent(new CustomEvent('sessionUnlocked'));

      Toast.success(t("sessionRefreshed"));
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || t("reconnectionFailed");
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLoginRedirect = () => {
    (async () => {
      try {
        const sv = getStoredValues() || {};
        const token = sv?.token;
        if (token) {
          await AuthService.logoutWithToken(token, context);
        }
      } catch (e) {
        // En cas d'erreur réseau, on nettoie quand même localement
      } finally {
        localStorage.removeItem("storedValues");
        localStorage.removeItem("currentAccess");
        localStorage.removeItem("username");
        isLockedRef.current = false;
        setOpen(false);
        clearInactivityTimer();
        clearLockState();
        router.push("/login");
      }
    })();
  };

  // Ne rien afficher sur les pages publiques ou si non authentifié
  if (isPublicRoute || !isAuthenticated || !open) return null;

  // Textes différents selon le type de modal
  const getTitle = () => {
    if (modalType === "inactivity") {
      return t("sessionInactivityTitle") || "Session verrouillée";
    }
    return t("sessionExpiredTitle") || "Session expirée";
  };

  const getMessage = () => {
    if (modalType === "inactivity") {
      const timeoutMinutes = parseInt(process.env.NEXT_PUBLIC_SESSION_INACTIVITY_TIMEOUT_MINUTES || '10', 10);
      return t("sessionInactivityMessage") || `Votre session a été verrouillée après ${timeoutMinutes} minutes d'inactivité. Veuillez saisir votre mot de passe pour continuer.`;
    }
    return t("sessionExpiredMessage") || "Votre session a expiré. Veuillez saisir votre mot de passe pour continuer.";
  };

  return (
      <Dialog
          open={open}
          onClose={() => {}} // Désactiver la fermeture via ESC ou clic externe
          disableEscapeKeyDown
          aria-labelledby="session-modal-title"
          maxWidth="sm"
          fullWidth
          BackdropProps={{
            sx: {
              backgroundColor: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(8px)",
            },
          }}
          sx={{
            '& .MuiPaper-root': {
              borderRadius: 2,
            },
          }}
      >
        <DialogTitle id="session-modal-title" sx={{ pb: 1 }}>
          {getTitle()}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <Typography color="text.secondary">
              {getMessage()}
            </Typography>
            <TextField
                size="small"
                type="password"
                label={t("password") || "Mot de passe"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && password && !submitting) {
                    handleConfirm();
                  }
                }}
                autoFocus
                fullWidth
            />
            {error ? (
                <Typography color="error" variant="body2">{error}</Typography>
            ) : null}
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
          <Button variant="outlined" color="secondary" onClick={handleLoginRedirect}>
            {t("logout") || "Se déconnecter"}
          </Button>
          <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={submitting || !password}
          >
            {t("stayConnected") || "Rester connecté"}
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default SessionManager;