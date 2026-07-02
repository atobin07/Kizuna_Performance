'use client'

import { useMemo, useState } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import type { PageView, AnalyticsEvent } from '@/lib/supabase/types'

const GOLD = '#C4922A'
const IRON = '#8B2E2E'
const MOSS = '#3D3A35'
const SERIES = [GOLD, IRON, MOSS]

const CTA_EVENTS = ['cta_click', 'nav_cta_click', 'pricing_cta_click']

type Range = '7' | '30' | '90'

/** Safe accessor for a string field inside the jsonb `properties` blob. */
function propStr(props: AnalyticsEvent['properties'], key: string): string | null {
  if (props && typeof props === 'object' && !Array.isArray(props)) {
    const v = (props as Record<string, unknown>)[key]
    if (typeof v === 'string') return v
    if (typeof v === 'number') return String(v)
  }
  return null
}

function propNum(props: AnalyticsEvent['properties'], key: string): number | null {
  if (props && typeof props === 'object' && !Array.isArray(props)) {
    const v = (props as Record<string, unknown>)[key]
    if (typeof v === 'number') return v
    if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) return Number(v)
  }
  return null
}

const tooltipStyle = {
  backgroundColor: '#0A0A0A',
  border: '1px solid #3D3A35',
  borderRadius: 8,
  color: '#F4F1EC',
  fontSize: 12,
} as const

const axisProps = {
  stroke: '#6b675f',
  tick: { fill: '#8a857c', fontSize: 11 },
  tickLine: false,
} as const

function EmptyState({ label = 'No data yet' }: { label?: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
      {label}
    </div>
  )
}

function StatTile({
  value,
  label,
  accent,
}: {
  value: string | number
  label: string
  accent?: boolean
}) {
  return (
    <div className="rounded-lg border border-border bg-black/20 p-4">
      <div className={`text-2xl font-bold ${accent ? 'text-kin' : 'text-washi'}`}>
        {value}
      </div>
      <div className="tracked-caps mt-1 text-[10px] text-muted-foreground">{label}</div>
    </div>
  )
}

export function AnalyticsDashboard({
  pageViews,
  events,
}: {
  pageViews: PageView[]
  events: AnalyticsEvent[]
}) {
  const [range, setRange] = useState<Range>('30')

  const { views, evts } = useMemo(() => {
    const days = Number(range)
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
    return {
      views: pageViews.filter((v) => new Date(v.created_at).getTime() >= cutoff),
      evts: events.filter((e) => new Date(e.created_at).getTime() >= cutoff),
    }
  }, [pageViews, events, range])

  // 1. Visits over time (by day)
  const visitsByDay = useMemo(() => {
    const map = new Map<string, number>()
    for (const v of views) {
      const day = v.created_at.slice(0, 10)
      map.set(day, (map.get(day) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date: date.slice(5), count }))
  }, [views])

  // 2. Top pages
  const topPages = useMemo(() => {
    const map = new Map<string, number>()
    for (const v of views) {
      const p = v.path ?? '(unknown)'
      map.set(p, (map.get(p) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([path, count]) => ({ path, count }))
  }, [views])

  // 3. CTA breakdown by label
  const ctaBreakdown = useMemo(() => {
    const map = new Map<string, number>()
    for (const e of evts) {
      if (!CTA_EVENTS.includes(e.event_name)) continue
      const label = propStr(e.properties, 'label') ?? e.event_name
      map.set(label, (map.get(label) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([label, count]) => ({ label, count }))
  }, [evts])

  // 4. Booking funnel
  const funnel = useMemo(() => {
    const started = evts.filter((e) => e.event_name === 'booking_started').length
    const completed = evts.filter((e) => e.event_name === 'booking_completed').length
    const rate = started > 0 ? Math.round((completed / started) * 100) : 0
    return { started, completed, rate }
  }, [evts])

  // 5. Email capture
  const email = useMemo(() => {
    const signups = evts.filter((e) => e.event_name === 'newsletter_signup')
    const bySource = new Map<string, number>()
    for (const s of signups) {
      const path = propStr(s.properties, 'path') ?? '(unknown)'
      bySource.set(path, (bySource.get(path) ?? 0) + 1)
    }
    return {
      count: signups.length,
      sources: Array.from(bySource.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6),
    }
  }, [evts])

  // 6. Scroll depth averages per page
  const scrollDepth = useMemo(() => {
    const agg = new Map<string, { sum: number; n: number }>()
    for (const e of evts) {
      if (e.event_name !== 'scroll_depth') continue
      const path = propStr(e.properties, 'path') ?? '(unknown)'
      const milestone = propNum(e.properties, 'milestone')
      if (milestone == null) continue
      const cur = agg.get(path) ?? { sum: 0, n: 0 }
      cur.sum += milestone
      cur.n += 1
      agg.set(path, cur)
    }
    return Array.from(agg.entries())
      .map(([path, { sum, n }]) => ({ path, avg: Math.round(sum / n) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8)
  }, [evts])

  // 7. Device breakdown
  const devices = useMemo(() => {
    let mobile = 0
    let desktop = 0
    let other = 0
    for (const v of views) {
      const d = (v.device ?? '').toLowerCase()
      if (d === 'mobile') mobile += 1
      else if (d === 'desktop') desktop += 1
      else other += 1
    }
    const data = [
      { name: 'Desktop', value: desktop },
      { name: 'Mobile', value: mobile },
    ]
    if (other > 0) data.push({ name: 'Other', value: other })
    return { mobile, desktop, other, data: data.filter((d) => d.value > 0) }
  }, [views])

  // 8. UTM sources
  const utmSources = useMemo(() => {
    const map = new Map<string, number>()
    for (const v of views) {
      if (!v.utm_source) continue
      map.set(v.utm_source, (map.get(v.utm_source) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([source, count]) => ({ source, count }))
  }, [views])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {views.length.toLocaleString()} page views · {evts.length.toLocaleString()} events
        </p>
        <Tabs value={range} onValueChange={(v) => setRange(v as Range)}>
          <TabsList>
            <TabsTrigger value="7">7d</TabsTrigger>
            <TabsTrigger value="30">30d</TabsTrigger>
            <TabsTrigger value="90">90d</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Top KPI tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile value={views.length.toLocaleString()} label="Site visits" accent />
        <StatTile value={`${funnel.rate}%`} label="Booking conversion" />
        <StatTile value={email.count} label="Email signups" />
        <StatTile
          value={`${devices.desktop}/${devices.mobile}`}
          label="Desktop / Mobile"
        />
      </div>

      {/* Visits over time */}
      <Card>
        <CardHeader>
          <CardTitle className="tracked-caps text-sm">Site Visits Over Time</CardTitle>
          <CardDescription>Daily page views</CardDescription>
        </CardHeader>
        <CardContent>
          {visitsByDay.length === 0 ? (
            <EmptyState />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={visitsByDay} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
                <CartesianGrid stroke={MOSS} strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" {...axisProps} />
                <YAxis {...axisProps} allowDecimals={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: MOSS }} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={GOLD}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: GOLD }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top pages */}
        <Card>
          <CardHeader>
            <CardTitle className="tracked-caps text-sm">Top Pages</CardTitle>
            <CardDescription>By visit count</CardDescription>
          </CardHeader>
          <CardContent>
            {topPages.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={topPages}
                  layout="vertical"
                  margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
                >
                  <CartesianGrid stroke={MOSS} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" {...axisProps} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="path"
                    width={120}
                    {...axisProps}
                    tick={{ fill: '#8a857c', fontSize: 10 }}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(196,146,42,0.08)' }} />
                  <Bar dataKey="count" fill={GOLD} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* CTA breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="tracked-caps text-sm">CTA Clicks</CardTitle>
            <CardDescription>By button label</CardDescription>
          </CardHeader>
          <CardContent>
            {ctaBreakdown.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={ctaBreakdown}
                  layout="vertical"
                  margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
                >
                  <CartesianGrid stroke={MOSS} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" {...axisProps} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={120}
                    {...axisProps}
                    tick={{ fill: '#8a857c', fontSize: 10 }}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(139,46,46,0.12)' }} />
                  <Bar dataKey="count" fill={IRON} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Booking funnel */}
        <Card>
          <CardHeader>
            <CardTitle className="tracked-caps text-sm">Booking Funnel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-bold text-washi">{funnel.started}</div>
                <div className="tracked-caps text-[10px] text-muted-foreground">Started</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-kin">{funnel.completed}</div>
                <div className="tracked-caps text-[10px] text-muted-foreground">Completed</div>
              </div>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-kin" style={{ width: `${funnel.rate}%` }} />
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-kin">{funnel.rate}%</span> conversion
            </p>
          </CardContent>
        </Card>

        {/* Email capture */}
        <Card>
          <CardHeader>
            <CardTitle className="tracked-caps text-sm">Email Capture</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-kin">{email.count}</div>
            <div className="tracked-caps mb-3 text-[10px] text-muted-foreground">
              Newsletter signups
            </div>
            {email.sources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No source pages yet.</p>
            ) : (
              <ul className="space-y-1.5">
                {email.sources.map(([path, count]) => (
                  <li key={path} className="flex items-center justify-between text-xs">
                    <span className="truncate text-washi/80">{path}</span>
                    <span className="ml-2 font-semibold text-kin">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Device breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="tracked-caps text-sm">Device Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {devices.data.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={devices.data}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {devices.data.map((entry, i) => (
                      <Cell key={entry.name} fill={SERIES[i % SERIES.length]} stroke="#0A0A0A" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="mt-2 flex justify-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: GOLD }} /> Desktop
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: IRON }} /> Mobile
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Scroll depth */}
        <Card>
          <CardHeader>
            <CardTitle className="tracked-caps text-sm">Avg Scroll Depth</CardTitle>
            <CardDescription>Per page (%)</CardDescription>
          </CardHeader>
          <CardContent>
            {scrollDepth.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={scrollDepth}
                  layout="vertical"
                  margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
                >
                  <CartesianGrid stroke={MOSS} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} {...axisProps} />
                  <YAxis
                    type="category"
                    dataKey="path"
                    width={120}
                    {...axisProps}
                    tick={{ fill: '#8a857c', fontSize: 10 }}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(196,146,42,0.08)' }} />
                  <Bar dataKey="avg" fill={GOLD} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* UTM sources */}
        <Card>
          <CardHeader>
            <CardTitle className="tracked-caps text-sm">UTM Sources</CardTitle>
            <CardDescription>Acquisition channels</CardDescription>
          </CardHeader>
          <CardContent>
            {utmSources.length === 0 ? (
              <EmptyState />
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={utmSources}
                  layout="vertical"
                  margin={{ top: 0, right: 12, bottom: 0, left: 8 }}
                >
                  <CartesianGrid stroke={MOSS} strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" {...axisProps} allowDecimals={false} />
                  <YAxis
                    type="category"
                    dataKey="source"
                    width={100}
                    {...axisProps}
                    tick={{ fill: '#8a857c', fontSize: 10 }}
                  />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(61,58,53,0.4)' }} />
                  <Bar dataKey="count" fill={MOSS} radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
