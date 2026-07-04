import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { todayISO, lastNDays } from '@/lib/dates'
import { can, historyWindowDays, type Plan } from '@/lib/plan'
import { SleepLogger } from '@/components/app/SleepLogger'
import { BenchmarkChart } from '@/components/app/BenchmarkChart'
import { UpgradeCard } from '@/components/app/UpgradeCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { SleepLog } from '@/lib/supabase/types'

export const metadata = { title: 'Sleep' }

function avg(nums: number[]): number | null {
  if (nums.length === 0) return null
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export default async function SleepPage() {
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

  // History window depends on plan (base = 30 days, higher = unlimited).
  const window = historyWindowDays(plan)
  const rangeDays = window ?? 90
  const since = lastNDays(rangeDays)[0]

  const { data: logsData } = await supabase
    .from('sleep_logs')
    .select('*')
    .eq('client_id', user.id)
    .gte('log_date', since)
    .order('log_date', { ascending: true })

  const logs = (logsData ?? []) as SleepLog[]
  const todayEntry = logs.find((l) => l.log_date === today) ?? null

  // Trend: last 14 days of duration (hours).
  const recent = logs.slice(-14)
  const chartData = recent
    .filter((l) => l.duration_min != null)
    .map((l) => ({
      date: l.log_date.slice(5),
      value: Math.round(((l.duration_min as number) / 60) * 10) / 10,
    }))

  const week = logs.slice(-7)
  const avgHours = avg(
    week.filter((l) => l.duration_min != null).map((l) => (l.duration_min as number) / 60)
  )
  const avgQuality = avg(
    week.filter((l) => l.quality != null).map((l) => l.quality as number)
  )
  const avgWakes = avg(
    week.filter((l) => l.awakenings != null).map((l) => l.awakenings as number)
  )

  const stats = [
    { label: 'Avg sleep (7d)', value: avgHours != null ? `${avgHours.toFixed(1)}h` : '—' },
    { label: 'Avg quality (7d)', value: avgQuality != null ? `${avgQuality.toFixed(1)}/10` : '—' },
    { label: 'Avg awakenings', value: avgWakes != null ? avgWakes.toFixed(1) : '—' },
  ]

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Recovery
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-washi">
          Sleep Tracker
        </h1>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">
                {s.label}
              </p>
              <p className="mt-1 font-mono text-2xl font-bold text-washi">
                {s.value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base uppercase tracking-wider">
              {todayEntry ? "Edit today's sleep" : 'Log last night'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <SleepLogger clientId={user.id} entry={todayEntry} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base uppercase tracking-wider">
              Duration — last 14 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <BenchmarkChart data={chartData} unit="hrs" movement="Sleep" />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Log a few nights to see your trend.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {window != null && (
        <UpgradeCard
          requiredPlan="track"
          title="Unlock full sleep history"
          blurb={`You can view the last ${window} days. Upgrade for unlimited history and long-term trends.`}
        />
      )}

      {!can(plan, 'integrations') && (
        <UpgradeCard
          requiredPlan="perform"
          title="Sync sleep automatically"
          blurb="Connect Oura, Whoop or Apple Health to import sleep stages, HRV and readiness — no manual logging."
        />
      )}
    </div>
  )
}
