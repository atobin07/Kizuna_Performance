import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { WorkoutLogger } from '@/components/app/WorkoutLogger'
import { formatDate } from '@/lib/utils'
import type { Workout, WorkoutResult } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function WorkoutPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: workout, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (error || !workout) notFound()
  const w = workout as Workout

  // Ownership: the program's client is the user, or user is coach/admin.
  let allowed = false
  if (w.program_id) {
    const { data: program } = await supabase
      .from('programs')
      .select('client_id')
      .eq('id', w.program_id)
      .maybeSingle()
    allowed = program?.client_id === user.id
  }

  if (!allowed) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    allowed = profile?.role === 'coach' || profile?.role === 'admin'
  }

  if (!allowed) notFound()

  const { data: existingResults } = await supabase
    .from('workout_results')
    .select('*')
    .eq('workout_id', w.id)
    .eq('client_id', user.id)
    .order('logged_at', { ascending: false })

  const results: WorkoutResult[] = existingResults ?? []

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="tracked-caps text-2xl font-bold text-washi">
            {w.title}
          </h1>
          {w.scheduled_date && (
            <p className="text-sm text-muted-foreground">
              {formatDate(w.scheduled_date)}
            </p>
          )}
        </div>
        {w.completed_at && <Badge>Completed</Badge>}
      </div>

      {w.coach_notes && (
        <Card className="border-kin/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm uppercase tracking-wider text-kin">
              Coach notes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm text-washi">
              {w.coach_notes}
            </p>
          </CardContent>
        </Card>
      )}

      <WorkoutLogger workout={w} clientId={user.id} />

      {results.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
            Previous results
          </h2>
          <div className="grid gap-3">
            {results.map((r) => (
              <Card key={r.id}>
                <CardContent className="space-y-2 p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(r.logged_at, {
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </span>
                    {r.rpe != null && (
                      <Badge variant="muted">RPE {r.rpe}</Badge>
                    )}
                  </div>
                  {r.result && typeof r.result === 'object' && (
                    <ul className="space-y-1 text-sm text-washi">
                      {Object.entries(
                        r.result as Record<string, unknown>
                      ).map(([k, v]) => (
                        <li key={k} className="flex justify-between gap-4">
                          <span className="text-muted-foreground">{k}</span>
                          <span className="font-mono">{String(v)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {r.notes && (
                    <p className="text-sm text-muted-foreground">{r.notes}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
