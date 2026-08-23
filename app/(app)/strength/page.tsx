import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import {
  todayISO,
  lastNDays,
  startOfISOWeek,
  addDays,
  toISODate,
  fromISODate,
} from '@/lib/dates'
import { formatDate } from '@/lib/utils'
import { historyWindowDays, type Plan } from '@/lib/plan'
import {
  WEEKLY_PLAN,
  DAY_ORDER,
  dayKeyForDate,
  weeksElapsed,
  resolveDay,
  parseBaseWeights,
  targetWeight,
  INCREMENTS,
  MAIN_LIFT_LABELS,
  type MainLift,
} from '@/lib/strength'
import { StrengthWeek, type WeekDay } from '@/components/app/StrengthWeek'
import { StrengthSetup } from '@/components/app/StrengthSetup'
import { BenchmarkChart } from '@/components/app/BenchmarkChart'
import { UpgradeCard } from '@/components/app/UpgradeCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type {
  StrengthConfig,
  StrengthEntry,
  StrengthSession,
} from '@/lib/supabase/types'

export const metadata = { title: 'Strength' }

const MAIN_LIFTS = Object.keys(INCREMENTS) as MainLift[]
const ISO_RE = /^\d{4}-\d{2}-\d{2}$/

export default async function StrengthPage({
  searchParams,
}: {
  searchParams: { week?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = todayISO()

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .maybeSingle()
  const plan = (profile?.plan ?? 'base') as Plan

  const { data: configData } = await supabase
    .from('strength_config')
    .select('*')
    .eq('client_id', user.id)
    .maybeSingle()
  const config = configData as StrengthConfig | null

  const startDate = config?.start_date ?? today
  const baseWeights = parseBaseWeights(config?.base_weights)

  // Which week are we viewing? ?week=<Monday ISO>, else the current week.
  const weekParam = searchParams.week
  const weekStart =
    weekParam && ISO_RE.test(weekParam)
      ? startOfISOWeek(fromISODate(weekParam))
      : startOfISOWeek(new Date())
  const weekDates = DAY_ORDER.map((_, i) => toISODate(addDays(weekStart, i)))
  const weekStartISO = weekDates[0]
  const weekEndISO = weekDates[weekDates.length - 1]
  const isCurrentWeek = weekStartISO === toISODate(startOfISOWeek(new Date()))
  const headerWeeks = weeksElapsed(startDate, weekStartISO)

  const prevWeek = toISODate(addDays(weekStart, -7))
  const nextWeek = toISODate(addDays(weekStart, 7))

  // All entries + sessions for the viewed week, grouped by date.
  const { data: weekEntryRows } = await supabase
    .from('strength_entries')
    .select('*')
    .eq('client_id', user.id)
    .gte('log_date', weekStartISO)
    .lte('log_date', weekEndISO)
  const entriesByDate: Record<string, Record<string, StrengthEntry>> = {}
  for (const e of (weekEntryRows ?? []) as StrengthEntry[]) {
    ;(entriesByDate[e.log_date] ??= {})[e.exercise_key] = e
  }

  const { data: weekSessionRows } = await supabase
    .from('strength_sessions')
    .select('*')
    .eq('client_id', user.id)
    .gte('log_date', weekStartISO)
    .lte('log_date', weekEndISO)
  const notesByDate: Record<string, string> = {}
  for (const s of (weekSessionRows ?? []) as StrengthSession[]) {
    notesByDate[s.log_date] = s.notes ?? ''
  }

  const days: WeekDay[] = DAY_ORDER.map((k, i) => {
    const d = WEEKLY_PLAN[k]
    const dateISO = weekDates[i]
    const weeksForDay = weeksElapsed(startDate, dateISO)
    return {
      dayKey: k,
      label: d.label,
      shortLabel: d.label.slice(0, 3),
      title: d.title,
      rest: Boolean(d.rest),
      dateISO,
      isToday: dateISO === today,
      isPast: dateISO < today,
      exercises: resolveDay(d, baseWeights, weeksForDay),
      entries: entriesByDate[dateISO] ?? {},
      notes: notesByDate[dateISO] ?? '',
    }
  })

  const initialDayKey = isCurrentWeek ? dayKeyForDate(new Date()) : 'mon'

  // History for the progression charts (main lifts, actual weight over time).
  const window = historyWindowDays(plan)
  const since = lastNDays(window ?? 180)[0]
  const { data: histRows } = await supabase
    .from('strength_entries')
    .select('log_date, exercise_key, actual_weight, category')
    .eq('client_id', user.id)
    .eq('category', 'main')
    .gte('log_date', since)
    .order('log_date', { ascending: true })
  const history = (histRows ?? []) as Pick<
    StrengthEntry,
    'log_date' | 'exercise_key' | 'actual_weight' | 'category'
  >[]

  const charts = MAIN_LIFTS.map((lift) => {
    const data = history
      .filter((h) => h.exercise_key === lift && h.actual_weight != null)
      .map((h) => ({ date: h.log_date.slice(5), value: Number(h.actual_weight) }))
    return { lift, data }
  }).filter((c) => c.data.length > 0)

  const weekLabel = `${formatDate(weekStartISO, { year: undefined })} – ${formatDate(
    weekEndISO,
    { year: undefined }
  )}`

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Strength · Week {headerWeeks + 1}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-washi">
          Weekly progression
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toggle any day to review it. Logging opens on the active day.
        </p>
      </header>

      {/* Week navigation */}
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card p-2">
        <Link
          href={`/strength?week=${prevWeek}`}
          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-washi"
        >
          <ChevronLeft className="h-4 w-4" /> Prev
        </Link>
        <div className="flex flex-col items-center">
          <span className="text-sm font-medium text-washi">{weekLabel}</span>
          {!isCurrentWeek && (
            <Link
              href="/strength"
              className="mt-0.5 inline-flex items-center gap-1 text-[0.65rem] uppercase tracking-wider text-kin hover:underline"
            >
              <CalendarDays className="h-3 w-3" /> Jump to this week
            </Link>
          )}
          {isCurrentWeek && (
            <span className="mt-0.5 text-[0.65rem] uppercase tracking-wider text-kin">
              This week
            </span>
          )}
        </div>
        <Link
          href={`/strength?week=${nextWeek}`}
          className="inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-washi"
        >
          Next <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {/* This week's main-lift targets */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {MAIN_LIFTS.map((lift) => (
          <Card key={lift}>
            <CardContent className="p-4">
              <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                {MAIN_LIFT_LABELS[lift]}
              </p>
              <p className="mt-1 font-mono text-xl font-bold text-washi">
                {targetWeight(lift, baseWeights[lift], headerWeeks)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">lb</span>
              </p>
              <p className="text-[0.65rem] text-kin">+{INCREMENTS[lift]}/wk</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Week toggle + day (editable only on the active day) */}
      <StrengthWeek clientId={user.id} days={days} initialDayKey={initialDayKey} />

      {/* Progression charts */}
      {charts.length > 0 && (
        <div className="grid gap-8 lg:grid-cols-2">
          {charts.map((c) => (
            <Card key={c.lift}>
              <CardHeader>
                <CardTitle className="text-base uppercase tracking-wider">
                  {MAIN_LIFT_LABELS[c.lift]} — logged weight
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BenchmarkChart
                  data={c.data}
                  unit="lb"
                  movement={MAIN_LIFT_LABELS[c.lift]}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Program setup */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base uppercase tracking-wider">
            Program &amp; progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StrengthSetup
            clientId={user.id}
            startDate={startDate}
            baseWeights={baseWeights}
          />
        </CardContent>
      </Card>

      {window != null && (
        <UpgradeCard
          requiredPlan="track"
          title="Unlock full strength history"
          blurb={`You can view the last ${window} days of progression. Upgrade for unlimited history and long-term trends.`}
        />
      )}
    </div>
  )
}
