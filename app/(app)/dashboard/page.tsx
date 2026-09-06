import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StrengthDay } from '@/components/app/StrengthDay'
import { QuickAddFood } from '@/components/app/QuickAddFood'
import { todayISO } from '@/lib/dates'
import {
  WEEKLY_PLAN,
  dayKeyForDate,
  weeksElapsed,
  resolveDay,
  parseBaseWeights,
  parseIncrements,
  type MainLift,
  type DeloadEvent,
} from '@/lib/strength'
import type {
  StrengthConfig,
  StrengthEntry,
  StrengthSession,
  StrengthDeload,
  FoodLog,
} from '@/lib/supabase/types'
import { TrendingUp, UtensilsCrossed } from 'lucide-react'

export const dynamic = 'force-dynamic'

function sumCalories(logs: FoodLog[]): number {
  return Math.round(logs.reduce((acc, l) => acc + (Number(l.calories) || 0), 0))
}

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = todayISO()

  // Today's strength checklist — same data the /strength page uses, so it
  // can be checked off right here without navigating.
  const [
    { data: configData },
    { data: deloadRows },
    { data: entryRows },
    { data: sessionRow },
    { data: foodRows },
  ] = await Promise.all([
    supabase.from('strength_config').select('*').eq('client_id', user.id).maybeSingle(),
    supabase
      .from('strength_deloads')
      .select('lift, effective_date, baseline_week, new_baseline')
      .eq('client_id', user.id)
      .order('effective_date', { ascending: true }),
    supabase.from('strength_entries').select('*').eq('client_id', user.id).eq('log_date', today),
    supabase
      .from('strength_sessions')
      .select('notes')
      .eq('client_id', user.id)
      .eq('log_date', today)
      .maybeSingle(),
    supabase.from('food_logs').select('*').eq('client_id', user.id).eq('log_date', today),
  ])

  const strengthConfig = configData as StrengthConfig | null
  const strengthStart = strengthConfig?.start_date ?? today
  const baseWeights = parseBaseWeights(strengthConfig?.base_weights)
  const increments = parseIncrements(strengthConfig?.increments)
  const deloads: DeloadEvent[] = ((deloadRows ?? []) as StrengthDeload[]).map((d) => ({
    lift: d.lift as MainLift,
    effective_date: d.effective_date,
    baseline_week: d.baseline_week,
    new_baseline: Number(d.new_baseline),
  }))
  const todayEntries: Record<string, StrengthEntry> = {}
  for (const e of (entryRows ?? []) as StrengthEntry[]) todayEntries[e.exercise_key] = e

  const todayKey = dayKeyForDate(new Date())
  const todayPlan = WEEKLY_PLAN[todayKey]
  const todayExercises = resolveDay(
    todayPlan,
    baseWeights,
    strengthStart,
    today,
    deloads,
    increments
  )
  const todayIsRest = todayExercises.length === 0
  const todayNotes = ((sessionRow as StrengthSession | null)?.notes) ?? ''

  return (
    <div className="space-y-8">
      <div>
        <h1 className="tracked-caps text-2xl font-bold text-washi">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Elite movement. Built to last.
        </p>
      </div>

      {/* Today's strength checklist — check off without leaving the dashboard */}
      <Card className="border-kin/30">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
            <TrendingUp className="h-4 w-4 text-kin" /> Today&apos;s training
          </CardTitle>
          <Link
            href="/strength"
            className="text-xs uppercase tracking-wider text-kin hover:underline"
          >
            Full week →
          </Link>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-lg font-semibold text-washi">{todayPlan.title}</p>
          {todayIsRest ? (
            <p className="text-sm text-muted-foreground">
              Rest day — recover, hydrate, get your sleep. Nothing to log.
            </p>
          ) : (
            <StrengthDay
              clientId={user.id}
              logDate={today}
              logWeek={weeksElapsed(strengthStart, today)}
              dayKey={todayKey}
              exercises={todayExercises}
              increments={increments}
              initialEntries={todayEntries}
              initialNotes={todayNotes}
            />
          )}
        </CardContent>
      </Card>

      {/* Today's food — log without leaving the dashboard */}
      <Card className="border-kin/30">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
            <UtensilsCrossed className="h-4 w-4 text-kin" /> Today&apos;s food
          </CardTitle>
          <Link
            href="/food"
            className="text-xs uppercase tracking-wider text-kin hover:underline"
          >
            Full log →
          </Link>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="font-mono text-2xl font-bold text-washi">
            {sumCalories((foodRows ?? []) as FoodLog[])} <span className="text-sm font-normal text-muted-foreground">kcal today</span>
          </p>
          <QuickAddFood clientId={user.id} logDate={today} />
        </CardContent>
      </Card>
    </div>
  )
}
