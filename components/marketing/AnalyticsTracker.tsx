'use client'

import { useEffect } from 'react'
import { trackPageView, initScrollTracking } from '@/lib/analytics'

/** Fires page_view on mount and wires scroll-depth tracking. Renders nothing. */
export function AnalyticsTracker() {
  useEffect(() => {
    trackPageView()
    const cleanup = initScrollTracking()
    return cleanup
  }, [])

  return null
}
