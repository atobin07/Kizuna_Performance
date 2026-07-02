import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BenchmarkChart } from '@/components/app/BenchmarkChart'
import { BenchmarkLogger } from '@/components/app/BenchmarkLogger'
import { formatDate } from '@/lib/utils'
import type { Benchmark } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

type MovementGroup = {
  movement: string
  unit: string
  pr: number
  prDate: string
  history: { date: string; value: number }[]
}

export default async function BenchmarksPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rows } = await supabase
    .from('benchmarks')
    .select('movement, value, unit, recorded_at')
    .eq('client_id', user.id)
    .order('recorded_at', { ascending: true })

  const benchmarks = (rows ?? []) as Pick<
    Benchmark,
    'movement' | 'value' | 'unit' | 'recorded_at'
  >[]

  const groupsMap = new Map<string, MovementGroup>()
  for (const b of benchmarks) {
    let g = groupsMap.get(b.movement)
    if (!g) {
      g = {
        movement: b.movement,
        unit: b.unit,
        pr: b.value,
        prDate: b.recorded_at,
        history: [],
      }
      groupsMap.set(b.movement, g)
    }
    g.history.push({ date: b.recorded_at, value: b.value })
    if (b.value > g.pr) {
      g.pr = b.value
      g.prDate = b.recorded_at
    }
    g.unit = b.unit
  }
  const groups = Array.from(groupsMap.values()).sort((a, b) =>
    a.movement.localeCompare(b.movement)
  )

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="tracked-caps text-2xl font-bold text-washi">
            Benchmarks
          </h1>
          <p className="text-sm text-muted-foreground">
            Track your PRs over time.
          </p>
        </div>
        <BenchmarkLogger clientId={user.id} />
      </div>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No benchmarks yet. Log your first PR to start tracking progress.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {groups.map((g) => (
            <Card key={g.movement}>
              <CardHeader className="flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-sm uppercase tracking-wider">
                    {g.movement}
                  </CardTitle>
                  <p className="mt-1 text-xs text-muted-foreground">
                    PR set {formatDate(g.prDate)}
                  </p>
                </div>
                <Badge>
                  {g.pr} {g.unit}
                </Badge>
              </CardHeader>
              <CardContent>
                <BenchmarkChart
                  data={g.history}
                  unit={g.unit}
                  movement={g.movement}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
