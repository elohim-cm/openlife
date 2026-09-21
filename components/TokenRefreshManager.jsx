"use client"

import { useEffect, useMemo, useRef, useCallback, useState } from "react"
import { usePathname } from "next/navigation"
import { refreshToken } from "@/services/authServices"

const DEBUG_REFRESH = true

function getStoredValues() {
  try {
    const raw = localStorage.getItem("storedValues")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setStoredValues(values) {
  localStorage.setItem("storedValues", JSON.stringify(values))
}

const TokenRefreshManager = () => {
  const pathname = usePathname()
  const scheduledRef = useRef(null)
  const isRefreshingRef = useRef(false)
  const refreshPromiseRef = useRef(null)
  const isMountedRef = useRef(true)
  const tryRefreshRef = useRef(null)
  const scheduleNextRefreshRef = useRef(null)

  const isPublicRoute = useMemo(() => {
    if (!pathname) return true
    let p = (pathname || "/").toLowerCase()
    if (p !== "/" && p.endsWith("/")) p = p.replace(/\/+$/, "")

    if (p === "/") return true

    const publicPaths = [
      "/login",
      "/forgot",
      "/reset",
      "/simuler",
      "/subscription",
      "/faq",
      "/privacy",
      "/terms",
      "/sign-up",
    ]
    return publicPaths.some((path) => p.startsWith(path))
  }, [pathname])

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const sv = getStoredValues()
    return !!(sv?.token && sv?.refresh_token)
  })

  // Mettre à jour isAuthenticated quand le token change
  useEffect(() => {
    const checkAuth = () => {
      const sv = getStoredValues()
      setIsAuthenticated(!!(sv?.token && sv?.refresh_token))
    }

    window.addEventListener('tokenRefreshed', checkAuth)
    window.addEventListener('tokenRefreshFailed', checkAuth)
    window.addEventListener('storage', checkAuth)

    return () => {
      window.removeEventListener('tokenRefreshed', checkAuth)
      window.removeEventListener('tokenRefreshFailed', checkAuth)
      window.removeEventListener('storage', checkAuth)
    }
  }, [])

  const tryRefresh = useCallback(async (reason = "scheduled", retries = 2) => {
    // Si un refresh est en cours, attendre sa complétion
    if (isRefreshingRef.current && refreshPromiseRef.current) {
      if (DEBUG_REFRESH) console.log(`[refresh] waiting for ongoing refresh (${reason})`)
      return refreshPromiseRef.current
    }

    if (isRefreshingRef.current) {
      if (DEBUG_REFRESH) console.log(`[refresh] skipped: refresh already in progress (${reason})`)
      return
    }

    // Ne pas rafraîchir si le tab n'est pas visible (sauf pour refresh manuel)
    if (reason !== "manual" && typeof document !== "undefined" && document.visibilityState !== "visible") {
      if (DEBUG_REFRESH) console.log("[refresh] skipped: tab hidden")
      return
    }

    const sv = getStoredValues() || {}
    const rt = sv.refresh_token

    if (!rt) {
      if (DEBUG_REFRESH) console.log("[refresh] skipped: no refresh_token in storage")
      return
    }

    // Vérifier si le refresh token est expiré
    const refreshTokenExpiry = sv.refresh_token_expired_at
    if (refreshTokenExpiry) {
      const expiryDate = new Date(refreshTokenExpiry.replace(" ", "T"))
      const now = new Date()
      if (expiryDate <= now) {
        if (DEBUG_REFRESH) console.log("[refresh] skipped: refresh token expired")
        // Nettoyer le storage si le refresh token est expiré
        localStorage.removeItem("storedValues")
        localStorage.removeItem("currentAccess")
        localStorage.removeItem("username")
        return
      }
    }

    isRefreshingRef.current = true

    refreshPromiseRef.current = (async () => {
      try {
        if (DEBUG_REFRESH) console.log(`[refresh] calling /auth/refresh (reason: ${reason})`)

        if (typeof window !== "undefined") {
          window.__sessionRefreshInProgress = true
        }

        const resp = await refreshToken(rt)
        
        // Vérifier si le composant est toujours monté
        if (!isMountedRef.current) return
        
        const data = resp?.data?.data

        if (!data?.token) {
          if (DEBUG_REFRESH) console.log("[refresh] response missing token")
          throw new Error("No token in response")
        }

        const updated = {
          ...sv,
          token: data.token,
          token_expired_at: data.token_expired_at || sv.token_expired_at,
          refresh_token: data.refresh_token || sv.refresh_token,
          refresh_token_expired_at: data.refresh_token_expired_at || sv.refresh_token_expired_at,
        }

        setStoredValues(updated)

        if (DEBUG_REFRESH) {
          console.log("[refresh] success: token updated")
          console.log("[refresh] new token expires at:", updated.token_expired_at)
          console.log("[refresh] new refresh token expires at:", updated.refresh_token_expired_at)
        }

        // Émettre un événement pour informer de la réussite du refresh
        window.dispatchEvent(new CustomEvent('tokenRefreshed', {
          detail: {
            token: data.token,
            expiresAt: updated.token_expired_at
          }
        }))

        // Planifier le prochain refresh dynamiquement
        scheduleNextRefreshRef.current?.(updated.token_expired_at)

      } catch (e) {
        if (DEBUG_REFRESH) {
          console.warn("[refresh] error:", e)
          console.warn("[refresh] error response:", e?.response?.data)
        }

        // Retry pour erreurs réseau temporaires
        const isNetworkError = !e.response || e.response.status >= 500
        if (retries > 0 && isNetworkError) {
          if (DEBUG_REFRESH) console.log(`[refresh] retrying (${retries} left) after network error`)
          await new Promise(r => setTimeout(r, 2000))
          return tryRefresh(reason, retries - 1)
        }

        // Si le refresh token est invalide/expiré, déconnecter l'utilisateur
        if (e?.response?.status === 401 || e?.response?.status === 403) {
          if (DEBUG_REFRESH) console.log("[refresh] invalid refresh token, clearing storage")
          localStorage.removeItem("storedValues")
          localStorage.removeItem("currentAccess")
          localStorage.removeItem("username")

          // Émettre un événement pour informer de l'échec
          window.dispatchEvent(new CustomEvent('tokenRefreshFailed', {
            detail: { reason: 'invalid_refresh_token' }
          }))
        }

        throw e
      } finally {
        isRefreshingRef.current = false
        refreshPromiseRef.current = null
        if (typeof window !== "undefined") {
          window.__sessionRefreshInProgress = false
        }
      }
    })()

    return refreshPromiseRef.current
  }, [])

  // Fonction pour refresh manuel (appelée depuis l'intercepteur axios)
  const handleManualRefresh = useCallback(async () => {
    return tryRefreshRef.current?.("manual")
  }, [])

  // Exposer tryRefresh via ref pour éviter la dépendance circulaire
  tryRefreshRef.current = tryRefresh

  // Planifier le prochain refresh basé sur l'expiration du token
  const scheduleNextRefresh = useCallback((tokenExpiredAt) => {
    if (scheduledRef.current) {
      clearTimeout(scheduledRef.current)
      scheduledRef.current = null
    }

    if (!tokenExpiredAt) return

    const expiryDate = new Date(tokenExpiredAt.replace(" ", "T"))
    const now = new Date()
    const timeUntilExpiry = expiryDate.getTime() - now.getTime()

    if (timeUntilExpiry <= 0) {
      if (DEBUG_REFRESH) console.log("[refresh] token already expired")
      return
    }

    // Refresh à 75% de la durée du token, max 5 minutes, min 30 secondes
    const delay = Math.max(30000, Math.min(timeUntilExpiry * 0.75, 5 * 60 * 1000))

    if (DEBUG_REFRESH) console.log(`[refresh] scheduling next refresh in ${Math.round(delay / 1000)}s`)

    scheduledRef.current = setTimeout(() => {
      tryRefreshRef.current?.("scheduled")
    }, delay)
  }, [])

  // Exposer scheduleNextRefresh via ref
  scheduleNextRefreshRef.current = scheduleNextRefresh

  // Démarrer le refresh automatique
  const startAutoRefresh = useCallback(() => {
    const sv = getStoredValues()
    const tokenExpiredAt = sv?.token_expired_at

    // Premier refresh après 30 secondes (donne le temps à l'app de s'initialiser)
    const initialDelay = setTimeout(() => {
      tryRefreshRef.current?.("initial").then(() => {
        // Après le premier refresh, planifier dynamiquement
        const updated = getStoredValues()
        if (updated?.token_expired_at) {
          scheduleNextRefreshRef.current?.(updated.token_expired_at)
        }
      })
    }, 30000)

    // Si on a déjà une expiration, planifier maintenant
    if (tokenExpiredAt) {
      scheduleNextRefreshRef.current?.(tokenExpiredAt)
    }

    return () => {
      clearTimeout(initialDelay)
    }
  }, [])

  // Rafraîchir quand le tab redevient visible
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "visible") {
      if (DEBUG_REFRESH) console.log("[refresh] tab became visible, triggering refresh")
      tryRefreshRef.current?.("visibility")
    }
  }, [])

  // Vérifier et rafraîchir si le token expire bientôt
  const checkTokenExpiry = useCallback(() => {
    // Ne pas interférer si SessionManager gère déjà l'expiration
    if (window.__sessionLocked) return

    const sv = getStoredValues()
    if (!sv?.token_expired_at) return

    const expiryDate = new Date(sv.token_expired_at.replace(" ", "T"))
    const now = new Date()
    const timeUntilExpiry = expiryDate.getTime() - now.getTime()

    // Si le token expire dans moins de 2 minutes, rafraîchir immédiatement
    if (timeUntilExpiry > 0 && timeUntilExpiry < 2 * 60 * 1000) {
      if (DEBUG_REFRESH) console.log("[refresh] token expires very soon, triggering refresh")
      tryRefreshRef.current?.("expiry_critical")
    }
  }, [])

  // Synchronisation multi-onglets via storage event
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'storedValues' && e.newValue) {
        try {
          const newData = JSON.parse(e.newValue)
          if (newData?.token) {
            if (DEBUG_REFRESH) console.log("[refresh] token updated in another tab")
            // Émettre événement local pour informer les autres composants
            window.dispatchEvent(new CustomEvent('tokenRefreshed', {
              detail: {
                token: newData.token,
                expiresAt: newData.token_expired_at,
                source: 'other_tab'
              }
            }))

            // Replanifier le refresh basé sur le nouveau token
            if (newData.token_expired_at) {
              scheduleNextRefreshRef.current?.(newData.token_expired_at)
            }
          }
        } catch (err) {
          console.error('[refresh] error parsing storage change:', err)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Cleanup au unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  useEffect(() => {
    // Nettoyer le timeout existant
    if (scheduledRef.current) {
      clearTimeout(scheduledRef.current)
      scheduledRef.current = null
    }

    // Ne rien faire sur les routes publiques ou si non authentifié
    if (isPublicRoute || !isAuthenticated) {
      if (DEBUG_REFRESH) console.log("[refresh] disabled: public route or not authenticated")
      return
    }

    // Démarrer le refresh automatique
    const cleanupInitial = startAutoRefresh()

    // Vérifier l'expiration du token périodiquement (toutes les minutes)
    const expiryCheckInterval = setInterval(checkTokenExpiry, 60 * 1000)

    // Écouter les changements de visibilité
    document.addEventListener("visibilitychange", handleVisibilityChange)

    // Écouter les événements de refresh manuel
    const handleManualRefreshEvent = () => {
      handleManualRefresh()
    }
    window.addEventListener('manualTokenRefresh', handleManualRefreshEvent)

    return () => {
      cleanupInitial?.()
      clearInterval(expiryCheckInterval)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener('manualTokenRefresh', handleManualRefreshEvent)
      if (scheduledRef.current) {
        clearTimeout(scheduledRef.current)
        scheduledRef.current = null
      }
    }
  }, [isPublicRoute, isAuthenticated, startAutoRefresh, handleVisibilityChange, handleManualRefresh, checkTokenExpiry])

  // Exposer la fonction de refresh manuel globalement
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__triggerTokenRefresh = handleManualRefresh
    }

    return () => {
      if (typeof window !== "undefined") {
        delete window.__triggerTokenRefresh
      }
    }
  }, [handleManualRefresh])

  return null
}

export default TokenRefreshManager