import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WorkoutCard } from '@/components/app/WorkoutCard'
import { formatDate } from '@/lib/utils'
import { todayISO } from '@/lib/dates'
import type { Workout } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function ProgramPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: program } = await supabase
    .from('programs')
    .select('id, name, phase, start_date, is_active')
    .eq('client_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .maybeSingle()

  let workouts: Workout[] = []
  if (program) {
    const { data } = await supabase
      .from('workouts')
      .select('*')
      .eq('program_id', program.id)
      .order('scheduled_date', { ascending: true })
    workouts = data ?? []
  }

  const today = todayISO()
  const upcoming = workouts.filter(
    (w) => !w.scheduled_date || w.scheduled_date >= today
  )
  const past = workouts.filter(
    (w) => w.scheduled_date && w.scheduled_date < today
  )

  if (!program) {
    return (
      <div className="space-y-8">
        <h1 className="tracked-caps text-2xl font-bold text-washi">Program</h1>
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            You don&apos;t have an active program yet. Your coach will assign one
            soon.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="tracked-caps text-2xl font-bold text-washi">
            {program.name}
          </h1>
          <p className="text-sm text-muted-foreground">
            {program.start_date
              ? `Started ${formatDate(program.start_date)}`
              : 'Active program'}
          </p>
        </div>
        <Badge variant="outline">Phase {program.phase}</Badge>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
          Upcoming
        </h2>
        {upcoming.length > 0 ? (
          <div className="grid gap-3">
            {upcoming.map((w) => (
              <WorkoutCard key={w.id} workout={w} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No upcoming workouts scheduled.
          </p>
        )}
      </section>

      {past.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
            Past
          </h2>
          <div className="grid gap-3">
            {past
              .slice()
              .reverse()
              .map((w) => (
                <WorkoutCard key={w.id} workout={w} />
              ))}
          </div>
        </section>
      )}
    </div>
  )
}
