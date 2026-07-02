import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { JournalForm } from '@/components/app/JournalForm'
import { JournalCalendar } from '@/components/app/JournalCalendar'
import { todayISO, lastNDays } from '@/lib/dates'
import type { JournalEntry } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

function avg(nums: number[]): string {
  if (nums.length === 0) return '—'
  return (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(1)
}

export default async function JournalPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = todayISO()
  const windowStart = lastNDays(30)[0]

  const { data: rows } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('client_id', user.id)
    .gte('entry_date', windowStart)
    .order('entry_date', { ascending: false })

  const entries = (rows ?? []) as JournalEntry[]
  const todaysEntry = entries.find((e) => e.entry_date === today) ?? null
  const loggedDates = entries.map((e) => e.entry_date)

  const last7 = lastNDays(7)
  const week = entries.filter((e) => last7.includes(e.entry_date))
  const sleepAvg = avg(
    week.map((e) => e.sleep_hrs).filter((n): n is number => n != null)
  )
  const energyAvg = avg(
    week.map((e) => e.energy).filter((n): n is number => n != null)
  )
  const stressAvg = avg(
    week.map((e) => e.stress).filter((n): n is number => n != null)
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="tracked-caps text-2xl font-bold text-washi">Journal</h1>
        <p className="text-sm text-muted-foreground">
          {todaysEntry
            ? "Editing today's check-in."
            : "Log today's check-in."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm uppercase tracking-wider">
              {todaysEntry ? "Today's entry" : 'New entry'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <JournalForm clientId={user.id} entry={todaysEntry} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider">
                7-day averages
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Sleep', value: `${sleepAvg} hrs` },
                { label: 'Energy', value: `${energyAvg} / 10` },
                { label: 'Stress', value: `${stressAvg} / 10` },
              ].map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                    {row.label}
                  </span>
                  <span className="font-mono font-semibold text-washi">
                    {row.value}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wider">
                Last 30 days
              </CardTitle>
            </CardHeader>
            <CardContent>
              <JournalCalendar loggedDates={loggedDates} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
