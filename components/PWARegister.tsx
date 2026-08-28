'use client'

import { useEffect } from 'react'

/**
 * We no longer use a caching service worker (it caused stale "failed to load"
 * pages after deploys). This component just cleans up: it unregisters any
 * previously-installed worker and clears its caches, so the app always loads
 * the latest version from the network — no reinstalls needed for updates.
 */
export function PWARegister() {
  useEffect(() => {
    try {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .getRegistrations()
          .then((regs) => regs.forEach((r) => r.unregister()))
          .catch(() => {})
      }
      if (typeof caches !== 'undefined') {
        caches
          .keys()
          .then((keys) => keys.forEach((k) => caches.delete(k)))
          .catch(() => {})
      }
    } catch {
      // ignore
    }
  }, [])
  return null
}

export default PWARegister
