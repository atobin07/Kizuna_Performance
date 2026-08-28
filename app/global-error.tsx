'use client'

import { useEffect } from 'react'

// Catches any uncaught client-side error (e.g. a ChunkLoadError from a stale
// cached page after a new deploy) and self-heals: clears the service worker and
// all caches, then lets the user reload into the fresh version.
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    try {
      if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
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

  return (
    <html lang="en" className="dark">
      <body
        style={{
          background: '#0B0B0C',
          color: '#F2EEE6',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          padding: '2rem',
          margin: 0,
        }}
      >
        <div style={{ maxWidth: '24rem' }}>
          <div style={{ fontSize: '2.25rem', color: '#E7B24C', marginBottom: '1rem' }}>絆</div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem' }}>
            Let&apos;s refresh that
          </h1>
          <p style={{ color: '#A6A199', margin: '0 0 1.5rem', lineHeight: 1.5 }}>
            We cleared the app cache to pull the latest version. Tap reload to
            continue.
          </p>
          <button
            type="button"
            onClick={() => {
              try {
                reset()
              } catch {
                // ignore
              }
              window.location.reload()
            }}
            style={{
              background: '#E7B24C',
              color: '#0B0B0C',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.75rem 1.75rem',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer',
            }}
          >
            Reload
          </button>
        </div>
      </body>
    </html>
  )
}
