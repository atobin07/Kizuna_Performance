import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { todayISO, lastNDays } from '@/lib/dates'
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
import { StrengthDay } from '@/components/app/StrengthDay'
import { StrengthSetup } from '@/components/app/StrengthSetup'
import { BenchmarkChart } from '@/components/app/BenchmarkChart'
import { UpgradeCard } from '@/components/app/UpgradeCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Moon } from 'lucide-react'
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

  const dayKey = dayKeyForDate(new Date())
  const day = WEEKLY_PLAN[dayKey]
  const resolved = resolveDay(day, baseWeights, weeks)

  // Today's saved data.
  const { data: entryRows } = await supabase
    .from('strength_entries')
    .select('*')
    .eq('client_id', user.id)
    .eq('log_date', today)
  const todaysEntries = (entryRows ?? []) as StrengthEntry[]
  const entryMap: Record<string, StrengthEntry> = {}
  for (const e of todaysEntries) entryMap[e.exercise_key] = e

  const { data: sessionData } = await supabase
    .from('strength_sessions')
    .select('*')
    .eq('client_id', user.id)
    .eq('log_date', today)
    .maybeSingle()
  const session = sessionData as StrengthSession | null

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
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Strength · Week {weeks + 1}
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-washi">
            {day.label} — {day.title}
          </h1>
        </div>
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

      {/* Today */}
      {day.rest ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-14 text-center">
            <span className="inline-flex rounded-full border border-kin/30 bg-kin/10 p-3 text-kin">
              <Moon className="h-6 w-6" />
            </span>
            <h2 className="font-display text-2xl font-bold text-washi">Rest day</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Recovery is training. Prioritize sleep, easy movement and food —
              you grow today so you can hit next week&apos;s numbers.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base uppercase tracking-wider">
              Today&apos;s checklist
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StrengthDay
              clientId={user.id}
              logDate={today}
              dayKey={dayKey}
              exercises={resolved}
              initialEntries={entryMap}
              initialNotes={session?.notes ?? ''}
            />
          </CardContent>
        </Card>
      )}

      {/* The week at a glance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base uppercase tracking-wider">
            Weekly split
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {DAY_ORDER.map((k) => {
              const d = WEEKLY_PLAN[k]
              const isToday = k === dayKey
              return (
                <div
                  key={k}
                  className={
                    'rounded-lg border p-3 ' +
                    (isToday ? 'border-kin bg-kin/[0.06]' : 'border-border bg-card')
                  }
                >
                  <p className="text-[0.65rem] uppercase tracking-wider text-kin">
                    {d.label}
                    {isToday ? ' · Today' : ''}
                  </p>
                  <p className="mt-1 text-sm text-washi">{d.title}</p>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

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
