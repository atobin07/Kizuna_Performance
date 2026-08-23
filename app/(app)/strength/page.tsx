import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  todayISO,
  lastNDays,
  startOfISOWeek,
  addDays,
  toISODate,
} from '@/lib/dates'
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

export default async function StrengthPage() {
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
  const weeks = weeksElapsed(startDate, today)

  // Current Monday-based week: one date per split day.
  const weekStart = startOfISOWeek(new Date())
  const weekDates = DAY_ORDER.map((_, i) => toISODate(addDays(weekStart, i)))
  const weekStartISO = weekDates[0]
  const weekEndISO = weekDates[weekDates.length - 1]

  // All entries + sessions for this week, grouped by date.
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
    return {
      dayKey: k,
      label: d.label,
      shortLabel: d.label.slice(0, 3),
      title: d.title,
      rest: Boolean(d.rest),
      dateISO,
      isToday: dateISO === today,
      isPast: dateISO < today,
      exercises: resolveDay(d, baseWeights, weeks),
      entries: entriesByDate[dateISO] ?? {},
      notes: notesByDate[dateISO] ?? '',
    }
  })

  const initialDayKey = dayKeyForDate(new Date())

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

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Strength · Week {weeks + 1}
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-washi">
          Weekly progression
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Toggle any day to preview it. Logging opens on the active day.
        </p>
      </header>

      {/* This week's main-lift targets */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {MAIN_LIFTS.map((lift) => (
          <Card key={lift}>
            <CardContent className="p-4">
              <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                {MAIN_LIFT_LABELS[lift]}
              </p>
              <p className="mt-1 font-mono text-xl font-bold text-washi">
                {targetWeight(lift, baseWeights[lift], weeks)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">lb</span>
              </p>
              <p className="text-[0.65rem] text-kin">+{INCREMENTS[lift]}/wk</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Week toggle + day (editable only when active) */}
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
