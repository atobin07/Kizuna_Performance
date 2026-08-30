'use client'

import { useEffect } from 'react'

/**
 * Registers the push-only service worker (public/sw.js). That worker has no
 * fetch handler, so it never caches pages — it only receives Web Push messages
 * and shows notifications. Registering it also clears any caches left by the
 * old caching worker (see sw.js activate), so the app still always loads the
 * latest version from the network.
 */
export function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.register('/sw.js').catch(() => {
      // ignore — notifications simply won't be available
    })
  }, [])
  return null
}

export default PWARegister
