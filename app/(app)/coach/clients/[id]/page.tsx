import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/utils'
import { BenchmarkChart } from '@/components/app/BenchmarkChart'
import { ProgressRing } from '@/components/app/ProgressRing'
import { ProgramBuilder } from '@/components/coach/ProgramBuilder'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type {
  Profile,
  Program,
  Workout,
  Benchmark,
  JournalEntry,
  Message,
} from '@/lib/supabase/types'
import { ArrowLeft, MessageSquare, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Params = { params: { id: string } }

export default async function ClientDetailPage({ params }: Params) {
  const supabase = createClient()
  await supabase.auth.getUser()
  const clientId = params.id

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', clientId)
    .maybeSingle()

  if (profileError || !profile || (profile as Profile).role !== 'client') {
    notFound()
  }
  const client = profile as Profile

  // Programs first — needed for workouts + the program builder.
  const { data: programsData } = await supabase
    .from('programs')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false })
  const programs: Program[] = programsData ?? []
  const programIds = programs.map((p) => p.id)

  // Parallel batched fetches for the remaining sections.
  const [benchmarksRes, journalRes, messagesRes, workoutsRes] = await Promise.all([
    supabase
      .from('benchmarks')
      .select('*')
      .eq('client_id', clientId)
      .order('recorded_at', { ascending: true }),
    supabase
      .from('journal_entries')
      .select('*')
      .eq('client_id', clientId)
      .order('entry_date', { ascending: false })
      .limit(30),
    supabase
      .from('messages')
      .select('*')
      .or(`sender_id.eq.${clientId},recipient_id.eq.${clientId}`)
      .order('created_at', { ascending: false })
      .limit(5),
    programIds.length > 0
      ? supabase
          .from('workouts')
          .select('id, completed_at')
          .in('program_id', programIds)
      : Promise.resolve({ data: [] as Pick<Workout, 'id' | 'completed_at'>[] }),
  ])

  const benchmarks: Benchmark[] = benchmarksRes.data ?? []
  const journal: JournalEntry[] = journalRes.data ?? []
  const messages: Message[] = messagesRes.data ?? []
  const workouts = (workoutsRes.data ?? []) as Pick<Workout, 'id' | 'completed_at'>[]

  // ---- Benchmarks grouped by movement ----
  const benchmarkGroups = new Map<
    string,
    { data: { date: string; value: number }[]; unit: string; pr: number }
  >()
  for (const b of benchmarks) {
    const g =
      benchmarkGroups.get(b.movement) ??
      { data: [], unit: b.unit, pr: Number.NEGATIVE_INFINITY }
    g.data.push({ date: b.recorded_at, value: Number(b.value) })
    g.pr = Math.max(g.pr, Number(b.value))
    g.unit = b.unit
    benchmarkGroups.set(b.movement, g)
  }
  const benchmarkList = Array.from(benchmarkGroups.entries())

  // ---- Journal trends (chronological for charts) ----
  const journalChrono = [...journal].reverse()
  const journalSeries = (key: 'sleep_hrs' | 'energy' | 'stress') =>
    journalChrono
      .filter((j) => j[key] != null)
      .map((j) => ({ date: j.entry_date, value: Number(j[key]) }))
  const sleepData = journalSeries('sleep_hrs')
  const energyData = journalSeries('energy')
  const stressData = journalSeries('stress')

  // ---- Workout completion (all-time) ----
  const totalWorkouts = workouts.length
  const completedWorkouts = workouts.filter((w) => w.completed_at).length

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/coach"
        className="mb-6 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-kin"
      >
        <ArrowLeft className="h-4 w-4" /> Back to roster
      </Link>

      {/* Profile summary */}
      <header className="mb-8 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-washi">
            {client.full_name ?? 'Unnamed athlete'}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            {client.tier && (
              <Badge variant={client.tier === 'private' ? 'default' : 'secondary'}>
                {client.tier === 'private' ? 'Private' : 'Semi-Private'}
              </Badge>
            )}
            {programs[0] && (
              <Badge variant="muted">Phase {programs[0].phase}</Badge>
            )}
            {client.email && (
              <span className="text-sm text-muted-foreground">{client.email}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Joined {formatDate(client.created_at)}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Workout completion ring */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="tracked-caps text-sm">Workout Completion</CardTitle>
            <CardDescription>All-time programmed vs completed</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            {totalWorkouts > 0 ? (
              <ProgressRing
                value={completedWorkouts}
                max={totalWorkouts}
                label={`${completedWorkouts}/${totalWorkouts}`}
                sublabel="Completed"
                size={160}
              />
            ) : (
              <p className="py-8 text-sm text-muted-foreground">
                No workouts programmed yet.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Recent messages */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 tracked-caps text-sm">
              <MessageSquare className="h-4 w-4 text-kin" /> Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="py-6 text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {messages.map((m) => (
                  <li key={m.id} className="flex flex-col gap-1 py-3">
                    <div className="flex items-center justify-between">
                      <span className="tracked-caps text-xs text-kin">
                        {m.sender_id === clientId ? client.full_name ?? 'Athlete' : 'Coach'}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(m.created_at, {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-washi/90">{m.body}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Benchmark history */}
      <section className="mt-8">
        <h2 className="mb-4 flex items-center gap-2 tracked-caps text-sm text-washi">
          <Activity className="h-4 w-4 text-kin" /> Benchmark History
        </h2>
        {benchmarkList.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No benchmarks recorded yet.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {benchmarkList.map(([movement, g]) => (
              <Card key={movement}>
                <CardHeader className="flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-base">{movement}</CardTitle>
                  <Badge variant="outline">
                    PR {g.pr} {g.unit}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <BenchmarkChart data={g.data} unit={g.unit} movement={movement} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Journal trends */}
      <section className="mt-8">
        <h2 className="mb-4 tracked-caps text-sm text-washi">Journal Trends</h2>
        {journal.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              No journal entries in the last 30 days.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {[
              { label: 'Sleep', data: sleepData, unit: 'hrs' },
              { label: 'Energy', data: energyData, unit: '/10' },
              { label: 'Stress', data: stressData, unit: '/10' },
            ].map((s) => (
              <Card key={s.label}>
                <CardHeader>
                  <CardTitle className="text-base">{s.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  {s.data.length === 0 ? (
                    <p className="py-8 text-center text-sm text-muted-foreground">
                      No data
                    </p>
                  ) : (
                    <BenchmarkChart data={s.data} unit={s.unit} movement={s.label} />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Program builder */}
      <section className="mt-8">
        <ProgramBuilder programs={programs} clientId={clientId} />
      </section>
    </main>
  )
}
