import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { todayISO } from '@/lib/dates'
import { can, type Plan } from '@/lib/plan'
import { FoodLogger } from '@/components/app/FoodLogger'
import { UpgradeCard } from '@/components/app/UpgradeCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { FoodLog, NutritionTarget } from '@/lib/supabase/types'
import { MEAL_ORDER, MEAL_LABELS } from '@/lib/utils'

export const metadata = { title: 'Food' }

function sum(logs: FoodLog[], key: keyof FoodLog): number {
  return logs.reduce((acc, l) => acc + (Number(l[key]) || 0), 0)
}

export default async function FoodPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = todayISO()

  const [{ data: profile }, { data: logsData }, { data: targetData }] =
    await Promise.all([
      supabase.from('profiles').select('plan').eq('id', user.id).maybeSingle(),
      supabase
        .from('food_logs')
        .select('*')
        .eq('client_id', user.id)
        .eq('log_date', today)
        .order('logged_at', { ascending: true }),
      supabase
        .from('nutrition_targets')
        .select('*')
        .eq('client_id', user.id)
        .maybeSingle(),
    ])

  const plan = (profile?.plan ?? 'base') as Plan
  const logs = (logsData ?? []) as FoodLog[]
  const target = (targetData ?? null) as NutritionTarget | null

  const totals = {
    calories: Math.round(sum(logs, 'calories')),
    protein_g: Math.round(sum(logs, 'protein_g')),
    carbs_g: Math.round(sum(logs, 'carbs_g')),
    fat_g: Math.round(sum(logs, 'fat_g')),
  }

  const macros = [
    { label: 'Calories', value: totals.calories, target: target?.calories, unit: '' },
    { label: 'Protein', value: totals.protein_g, target: target?.protein_g, unit: 'g' },
    { label: 'Carbs', value: totals.carbs_g, target: target?.carbs_g, unit: 'g' },
    { label: 'Fat', value: totals.fat_g, target: target?.fat_g, unit: 'g' },
  ]

  const showTargets = can(plan, 'macro_targets')

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Nutrition
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-washi">
          Food Log — Today
        </h1>
      </header>

      {/* Daily totals */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {macros.map((m) => {
          const pct =
            showTargets && m.target
              ? Math.min(100, Math.round((m.value / Number(m.target)) * 100))
              : null
          return (
            <Card key={m.label}>
              <CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </p>
                <p className="mt-1 font-mono text-2xl font-bold text-washi">
                  {m.value}
                  {m.unit}
                  {showTargets && m.target ? (
                    <span className="text-sm text-muted-foreground">
                      {' '}
                      / {Math.round(Number(m.target))}
                      {m.unit}
                    </span>
                  ) : null}
                </p>
                {pct != null && (
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-kin"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {!showTargets && (
        <UpgradeCard
          requiredPlan="track"
          title="Set macro targets"
          blurb="Get daily calorie & protein/carb/fat goals with progress bars."
        />
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Logger */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base uppercase tracking-wider">
              Add food
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FoodLogger clientId={user.id} />
          </CardContent>
        </Card>

        {/* Today's entries grouped by meal */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base uppercase tracking-wider">
              Today&apos;s meals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {logs.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nothing logged yet. Add your first meal to start tracking.
              </p>
            )}
            {MEAL_ORDER.map((meal) => {
              const items = logs.filter((l) => l.meal === meal)
              if (items.length === 0) return null
              return (
                <div key={meal}>
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant="muted">
                      {MEAL_LABELS[meal]}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(sum(items, 'calories'))} kcal
                    </span>
                  </div>
                  <ul className="space-y-1.5">
                    {items.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-washi">
                          {item.name}
                          {item.quantity && (
                            <span className="text-muted-foreground">
                              {' '}
                              · {item.quantity}
                            </span>
                          )}
                        </span>
                        <span className="font-mono text-muted-foreground">
                          {item.calories != null ? `${Math.round(Number(item.calories))} kcal` : '—'}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {!can(plan, 'integrations') && (
        <UpgradeCard
          requiredPlan="perform"
          title="Auto-import from your wearables"
          blurb="Connect Oura, Whoop, Fitbit & more to sync nutrition and recovery automatically."
        />
      )}
    </div>
  )
}
