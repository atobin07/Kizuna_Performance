import { v4 as uuidv4 } from 'uuid'

/** Session ID persisted in sessionStorage for the browser session. */
function getSessionId(): string {
  if (typeof window === 'undefined') return ''
  let sid = sessionStorage.getItem('kz_sid')
  if (!sid) {
    sid = uuidv4()
    sessionStorage.setItem('kz_sid', sid)
  }
  return sid
}

export async function track(
  eventName: string,
  properties: Record<string, unknown> = {},
  userId?: string
) {
  if (typeof window === 'undefined') return
  try {
    await fetch('/api/analytics/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_name: eventName,
        properties,
        session_id: getSessionId(),
        user_id: userId ?? null,
        path: window.location.pathname,
      }),
      keepalive: true,
    })
  } catch {
    // Silent fail — never block UI for analytics.
  }
}

/** Fire a page_view event. Call on route mount. */
export function trackPageView(userId?: string) {
  if (typeof window === 'undefined') return
  track(
    'page_view',
    { referrer: document.referrer || null },
    userId
  )
}

/** Scroll depth tracker — call once on page mount, returns a cleanup fn. */
export function initScrollTracking(userId?: string) {
  if (typeof window === 'undefined') return () => {}
  const milestones = new Set<number>()
  const handler = () => {
    const scrollable = document.body.scrollHeight - window.innerHeight
    if (scrollable <= 0) return
    const pct = Math.round((window.scrollY / scrollable) * 100)
    ;[25, 50, 75, 100].forEach((m) => {
      if (pct >= m && !milestones.has(m)) {
        milestones.add(m)
        track('scroll_depth', { milestone: m, path: window.location.pathname }, userId)
      }
    })
  }
  window.addEventListener('scroll', handler, { passive: true })
  return () => window.removeEventListener('scroll', handler)
}
