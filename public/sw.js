// Push-only service worker for Kizuna Performance.
//
// This worker exists ONLY to receive Web Push messages and show notifications.
// It deliberately has NO fetch handler, so it never caches pages or chunks —
// that's what caused the earlier "failed to load" issues. On activate it also
// deletes any caches left behind by a previous caching worker.

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
      await self.clients.claim()
    })()
  )
})

self.addEventListener('push', (event) => {
  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch {
    data = { title: 'Kizuna Performance', body: event.data ? event.data.text() : '' }
  }

  const title = data.title || 'Kizuna Performance'
  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/192',
    badge: data.badge || '/icons/192',
    tag: data.tag || undefined,
    data: { url: data.url || '/dashboard' },
    vibrate: [80, 40, 80],
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const target = (event.notification.data && event.notification.data.url) || '/dashboard'

  event.waitUntil(
    (async () => {
      const all = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })
      for (const client of all) {
        if ('focus' in client) {
          try {
            await client.focus()
            if ('navigate' in client) await client.navigate(target)
            return
          } catch {
            // ignore, fall through to openWindow
          }
        }
      }
      if (self.clients.openWindow) await self.clients.openWindow(target)
    })()
  )
})
