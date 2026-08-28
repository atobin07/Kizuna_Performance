// Self-destroying service worker.
//
// Earlier versions cached the app, which caused stale pages and "failed to
// load" after deploys. This worker takes over from any old one, deletes every
// cache, unregisters ITSELF, and reloads open tabs — after which the app has NO
// service worker at all and always loads the latest version straight from the
// network. There is deliberately no fetch handler, so nothing is ever cached.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      try {
        const keys = await caches.keys()
        await Promise.all(keys.map((k) => caches.delete(k)))
      } catch {
        // ignore
      }
      try {
        await self.registration.unregister()
      } catch {
        // ignore
      }
      try {
        const clients = await self.clients.matchAll({ type: 'window' })
        clients.forEach((c) => {
          try {
            c.navigate(c.url)
          } catch {
            // ignore
          }
        })
      } catch {
        // ignore
      }
    })()
  )
})
