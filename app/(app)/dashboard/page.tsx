import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ProgressRing } from '@/components/app/ProgressRing'
import { formatDate } from '@/lib/utils'
import {
  computeStreak,
  todayISO,
  startOfISOWeekISO,
} from '@/lib/dates'
import type { Benchmark } from '@/lib/supabase/types'
import { Flame, MessageSquare, Dumbbell, BookOpen } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = todayISO()
  const weekStart = startOfISOWeekISO()

  // (a) Today's scheduled workout — resolve the user's programs first.
  const { data: programRows } = await supabase
    .from('programs')
    .select('id')
    .eq('client_id', user.id)
  const programIds = (programRows ?? []).map((p) => p.id)

  let todaysWorkout: {
    id: string
    title: string
    scheduled_date: string | null
  } | null = null
  if (programIds.length > 0) {
    const { data: todaysWorkouts } = await supabase
      .from('workouts')
      .select('id, title, scheduled_date')
      .in('program_id', programIds)
      .eq('scheduled_date', today)
      .limit(1)
    todaysWorkout = todaysWorkouts?.[0] ?? null
  }

  // (b) Training streak from workout_results.logged_at.
  const { data: resultRows } = await supabase
    .from('workout_results')
    .select('logged_at')
    .eq('client_id', user.id)
    .order('logged_at', { ascending: false })
    .limit(200)
  const streak = computeStreak((resultRows ?? []).map((r) => r.logged_at))

  // (c) Last 3 benchmark PRs (max value per movement, most recent).
  const { data: benchmarkRows } = await supabase
    .from('benchmarks')
    .select('movement, value, unit, recorded_at')
    .eq('client_id', user.id)
    .order('recorded_at', { ascending: false })
    .limit(200)
  const prByMovement = new Map<string, Pick<Benchmark, 'movement' | 'value' | 'unit' | 'recorded_at'>>()
  for (const b of benchmarkRows ?? []) {
    const existing = prByMovement.get(b.movement)
    if (!existing || b.value > existing.value) prByMovement.set(b.movement, b)
  }
  const topPRs = Array.from(prByMovement.values())
    .sort((a, b) => (a.recorded_at < b.recorded_at ? 1 : -1))
    .slice(0, 3)

  // (d) Weekly journal completion (# entries this ISO week / 7).
  const { count: journalCount } = await supabase
    .from('journal_entries')
    .select('id', { count: 'exact', head: true })
    .eq('client_id', user.id)
    .gte('entry_date', weekStart)
  const journalDays = Math.min(7, journalCount ?? 0)

  // (e) Unread messages + latest preview.
  const { data: unreadRows } = await supabase
    .from('messages')
    .select('id, body, created_at')
    .eq('recipient_id', user.id)
    .is('read_at', null)
    .order('created_at', { ascending: false })
    .limit(50)
  const unreadCount = unreadRows?.length ?? 0
  const latestUnread = unreadRows?.[0] ?? null

  return (
    <div className="space-y-8">
      <div>
        <h1 className="tracked-caps text-2xl font-bold text-washi">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Elite movement. Built to last.
        </p>
      </div>

      {/* Today's workout */}
      <Card className="border-kin/30">
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
            <Dumbbell className="h-4 w-4 text-kin" /> Today&apos;s session
          </CardTitle>
          <span className="text-xs text-muted-foreground">
            {formatDate(today)}
          </span>
        </CardHeader>
        <CardContent>
          {todaysWorkout ? (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-lg font-semibold text-washi">
                {todaysWorkout.title}
              </p>
              <Button asChild size="sm">
                <Link href={`/workouts/${todaysWorkout.id}`}>Start Workout</Link>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No workout scheduled today. Review your{' '}
              <Link href="/program" className="text-kin hover:underline">
                program
              </Link>
              .
            </p>
          )}
        </CardContent>
      </Card>

      {/* Metrics row */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
            <ProgressRing
              value={Math.min(streak, 30)}
              max={30}
              label={String(streak)}
              sublabel="Day streak"
            />
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
              <Flame className="h-3.5 w-3.5 text-kin" /> Training streak
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-5 text-center">
            <ProgressRing
              value={journalDays}
              max={7}
              label={`${journalDays}/7`}
              sublabel="This week"
            />
            <span className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5 text-kin" /> Journal
            </span>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-wider">
              <MessageSquare className="h-4 w-4 text-kin" /> Messages
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-washi">
                {unreadCount}
              </span>
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                unread
              </span>
            </div>
            {latestUnread && (
              <p className="line-clamp-2 text-sm text-muted-foreground">
                “{latestUnread.body}”
              </p>
            )}
            <Button asChild variant="ghost" size="sm" className="px-0">
              <Link href="/messages" className="text-kin">
                Open messages →
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* PRs + quick log */}
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider">
              Recent PRs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topPRs.length > 0 ? (
              <ul className="divide-y divide-border">
                {topPRs.map((pr) => (
                  <li
                    key={pr.movement}
                    className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="font-semibold text-washi">{pr.movement}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(pr.recorded_at)}
                      </p>
                    </div>
                    <span className="font-mono text-lg font-bold text-kin">
                      {pr.value}
                      <span className="ml-1 text-xs text-muted-foreground">
                        {pr.unit}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                No PRs logged yet.{' '}
                <Link href="/benchmarks" className="text-kin hover:underline">
                  Log your first
                </Link>
                .
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider">
              Quick log
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Log today&apos;s check-in in under a minute.
            </p>
            <Button asChild className="w-full">
              <Link href="/journal">Daily journal</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/benchmarks">Log a PR</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
