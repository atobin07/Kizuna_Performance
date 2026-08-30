'use client'

// Browser helpers for Web Push subscription.

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  const output = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i)
  return output
}

export function pushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  )
}

async function readyRegistration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration()
  if (existing) return navigator.serviceWorker.ready
  await navigator.serviceWorker.register('/sw.js')
  return navigator.serviceWorker.ready
}

/**
 * Ask permission, subscribe with the browser's PushManager, and persist the
 * subscription server-side. Returns true on success.
 */
export async function enablePush(vapidPublicKey: string): Promise<boolean> {
  if (!pushSupported()) throw new Error('Push is not supported on this device.')
  if (!vapidPublicKey) throw new Error('Notifications are not configured yet.')

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') return false

  const reg = await readyRegistration()
  let sub = await reg.pushManager.getSubscription()
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) as BufferSource,
    })
  }

  const json = sub.toJSON()
  const res = await fetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      endpoint: sub.endpoint,
      keys: json.keys,
      user_agent: navigator.userAgent,
    }),
  })
  if (!res.ok) throw new Error('Could not save subscription.')
  return true
}

/** Remove the local subscription and delete it server-side. */
export async function disablePush(): Promise<void> {
  if (!pushSupported()) return
  const reg = await navigator.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  if (sub) {
    await fetch('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ endpoint: sub.endpoint }),
    }).catch(() => {})
    await sub.unsubscribe().catch(() => {})
  }
}

export async function isSubscribed(): Promise<boolean> {
  if (!pushSupported()) return false
  const reg = await navigator.serviceWorker.getRegistration()
  const sub = await reg?.pushManager.getSubscription()
  return !!sub && Notification.permission === 'granted'
}
