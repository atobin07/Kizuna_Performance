'use client'

import { useEffect } from 'react'

/** Registers the service worker so the site installs as a true PWA. */
export function PWARegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    // When a new worker takes control (e.g. after a deploy), reload ONCE so the
    // page is served by the fresh worker instead of stale cached assets.
    let reloaded = false
    const onChange = () => {
      if (reloaded) return
      reloaded = true
      window.location.reload()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onChange)

    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => reg.update().catch(() => {}))
      .catch(() => {})

    return () =>
      navigator.serviceWorker.removeEventListener('controllerchange', onChange)
  }, [])
  return null
}

export default PWARegister
