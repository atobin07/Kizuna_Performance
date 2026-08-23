'use client'

import { useEffect } from 'react'

/** Registers the service worker so the site installs as a true PWA. */
export function PWARegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])
  return null
}

export default PWARegister
