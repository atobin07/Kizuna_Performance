import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { AnalyticsDashboard } from '@/components/coach/AnalyticsDashboard'
import { Card, CardContent } from '@/components/ui/card'
import type { PageView, AnalyticsEvent } from '@/lib/supabase/types'
import { ArrowLeft } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function CoachAnalyticsPage() {
  const supabase = createClient()
  await supabase.auth.getUser()

  // Fetch the last 90 days on the server; the client dashboard filters this
  // window down to the selected 7/30/90-day range without re-querying.
  const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()

  const [pageViewsRes, eventsRes] = await Promise.all([
    supabase
      .from('page_views')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(20000),
    supabase
      .from('events')
      .select('*')
      .gte('created_at', since)
      .order('created_at', { ascending: false })
      .limit(20000),
  ])

  const pageViews: PageView[] = pageViewsRes.error ? [] : pageViewsRes.data ?? []
  const events: AnalyticsEvent[] = eventsRes.error ? [] : eventsRes.data ?? []

  const hasData = pageViews.length > 0 || events.length > 0

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <Link
        href="/coach"
        className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-kin"
      >
        <ArrowLeft className="h-4 w-4" /> Back to roster
      </Link>

      <header className="mb-8 border-b border-border pb-8">
        <p className="tracked-caps text-xs text-kin">絆 Coach Portal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-washi">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Site traffic, conversion, and engagement across the last 90 days.
        </p>
      </header>

      {!hasData ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-sm font-medium text-washi">No analytics data yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Visits and events will populate here as traffic comes in.
            </p>
          </CardContent>
        </Card>
      ) : (
        <AnalyticsDashboard pageViews={pageViews} events={events} />
      )}
    </main>
  )
}
