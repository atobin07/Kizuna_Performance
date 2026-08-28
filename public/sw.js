// Service worker — makes the app installable as a real PWA (clean icon, no
// browser badge). It ONLY caches immutable, content-hashed static assets
// (/_next/static/**). It never caches HTML documents, RSC payloads, or API
// calls, so a new deploy can never leave a stale page pointing at JS chunks
// that no longer exist (which shows up as "a client-side exception").
const CACHE = 'kizuna-static-v2'

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop every older cache (including v1, which used to cache HTML).
      const keys = await caches.keys()
      await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      await self.clients.claim()
    })()
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Cache-first ONLY for immutable hashed build assets. Everything else —
  // navigations, RSC, /api, /auth — falls through to normal network handling.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.open(CACHE).then(async (cache) => {
        const hit = await cache.match(request)
        if (hit) return hit
        const res = await fetch(request)
        if (res.ok) cache.put(request, res.clone())
        return res
      })
    )
  }
})
