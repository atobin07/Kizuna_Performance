import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { ClientCard } from '@/components/app/ClientCard'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { Profile, Program, Workout, WorkoutResult, JournalEntry } from '@/lib/supabase/types'
import { BarChart3, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

/**
 * SSR-safe ISO-week boundary (Mon–Sun) as YYYY-MM-DD strings so we can compare
 * against `scheduled_date` (a plain date column) lexicographically.
 */
function isoWeekRange(now = new Date()): { start: string; end: string } {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const diffToMonday = (d.getUTCDay() + 6) % 7 // 0 = Monday
  const monday = new Date(d)
  monday.setUTCDate(d.getUTCDate() - diffToMonday)
  const sunday = new Date(monday)
  sunday.setUTCDate(monday.getUTCDate() + 6)
  const fmt = (x: Date) => x.toISOString().slice(0, 10)
  return { start: fmt(monday), end: fmt(sunday) }
}

export default async function CoachDashboardPage() {
  const supabase = createClient()
  await supabase.auth.getUser()

  // Batched fetches — reduce in JS to avoid N+1 across clients.
  const { data: clientsData, error: clientsError } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'client')
    .order('created_at', { ascending: false })

  const clients: Profile[] = clientsError ? [] : clientsData ?? []
  const clientIds = clients.map((c) => c.id)

  let programs: Program[] = []
  let workouts: Pick<Workout, 'id' | 'program_id' | 'scheduled_date' | 'completed_at'>[] = []
  let results: Pick<WorkoutResult, 'client_id' | 'logged_at'>[] = []
  let journals: Pick<JournalEntry, 'client_id' | 'created_at'>[] = []

  if (clientIds.length > 0) {
    const { data: programsData } = await supabase
      .from('programs')
      .select('*')
      .in('client_id', clientIds)
    programs = programsData ?? []

    const programIds = programs.map((p) => p.id)
    if (programIds.length > 0) {
      const { data: workoutsData } = await supabase
        .from('workouts')
        .select('id, program_id, scheduled_date, completed_at')
        .in('program_id', programIds)
      workouts = workoutsData ?? []
    }

    const [{ data: resultsData }, { data: journalsData }] = await Promise.all([
      supabase
        .from('workout_results')
        .select('client_id, logged_at')
        .in('client_id', clientIds)
        .order('logged_at', { ascending: false }),
      supabase
        .from('journal_entries')
        .select('client_id, created_at')
        .in('client_id', clientIds)
        .order('created_at', { ascending: false }),
    ])
    results = resultsData ?? []
    journals = journalsData ?? []
  }

  const { start: weekStart, end: weekEnd } = isoWeekRange()

  // Index helpers.
  const programByClient = new Map<string, Program>()
  for (const p of programs) {
    if (!p.client_id) continue
    const existing = programByClient.get(p.client_id)
    // Prefer the active program; otherwise the most recently created.
    if (!existing || (p.is_active && !existing.is_active)) {
      programByClient.set(p.client_id, p)
    }
  }
  const clientByProgram = new Map<string, string>()
  for (const p of programs) if (p.client_id) clientByProgram.set(p.id, p.client_id)

  const lastActiveByClient = new Map<string, string>()
  const bump = (clientId: string | null, ts: string | null) => {
    if (!clientId || !ts) return
    const cur = lastActiveByClient.get(clientId)
    if (!cur || ts > cur) lastActiveByClient.set(clientId, ts)
  }
  for (const r of results) bump(r.client_id, r.logged_at)
  for (const j of journals) bump(j.client_id, j.created_at)

  // Weekly completion rate = (workouts scheduled this ISO week that have a
  // completed_at) / (workouts scheduled this ISO week). Expressed as a 0–1
  // fraction; null when nothing was scheduled this week.
  const weekTotals = new Map<string, { total: number; done: number }>()
  for (const w of workouts) {
    if (!w.program_id || !w.scheduled_date) continue
    if (w.scheduled_date < weekStart || w.scheduled_date > weekEnd) continue
    const clientId = clientByProgram.get(w.program_id)
    if (!clientId) continue
    const t = weekTotals.get(clientId) ?? { total: 0, done: 0 }
    t.total += 1
    if (w.completed_at) t.done += 1
    weekTotals.set(clientId, t)
  }

  const activeProgramCount = programs.filter((p) => p.is_active).length

  const cards = clients.map((c) => {
    const program = programByClient.get(c.id)
    const wt = weekTotals.get(c.id)
    return {
      id: c.id,
      full_name: c.full_name,
      email: c.email,
      tier: c.tier,
      lastActive: lastActiveByClient.get(c.id) ?? null,
      phase: program?.phase ?? null,
      completionRate: wt && wt.total > 0 ? wt.done / wt.total : null,
    }
  })

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <header className="mb-8 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="tracked-caps text-xs text-kin">絆 Coach Portal</p>
          <h1 className="text-3xl font-bold tracking-tight text-washi">Roster</h1>
          <p className="text-sm text-muted-foreground">
            Every athlete under your programming, at a glance.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Card className="min-w-[120px]">
            <CardContent className="flex items-center gap-3 p-4">
              <Users className="h-5 w-5 text-kin" />
              <div>
                <div className="text-2xl font-bold leading-none text-washi">
                  {clients.length}
                </div>
                <div className="tracked-caps mt-1 text-[10px] text-muted-foreground">
                  Clients
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="min-w-[120px]">
            <CardContent className="flex items-center gap-3 p-4">
              <BarChart3 className="h-5 w-5 text-kin" />
              <div>
                <div className="text-2xl font-bold leading-none text-washi">
                  {activeProgramCount}
                </div>
                <div className="tracked-caps mt-1 text-[10px] text-muted-foreground">
                  Active programs
                </div>
              </div>
            </CardContent>
          </Card>
          <Button asChild variant="outline" className="hidden sm:inline-flex">
            <Link href="/coach/analytics">Analytics</Link>
          </Button>
        </div>
      </header>

      {clients.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Users className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm font-medium text-washi">No clients yet</p>
            <p className="text-sm text-muted-foreground">
              Client profiles will appear here once athletes are onboarded.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      )}
    </main>
  )
}
