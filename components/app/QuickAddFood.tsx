'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'
import { todayISO } from '@/lib/dates'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus } from 'lucide-react'
import { MEAL_LABELS } from '@/lib/utils'
import { FOOD_PRESETS } from '@/lib/food-presets'
import type { MealType } from '@/lib/supabase/types'

const MEALS: MealType[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'pre_workout',
  'intra_workout',
  'post_workout',
]

const round1 = (n: number) => Math.round(n * 10) / 10

export interface QuickAddFoodProps {
  clientId: string
  logDate?: string
}

export function QuickAddFood({ clientId, logDate }: QuickAddFoodProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [meal, setMeal] = useState<MealType>('breakfast')
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [qty, setQty] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)

  const [factorCalories, setFactorCalories] = useState('')
  const [factorSubmitting, setFactorSubmitting] = useState(false)

  const selectedCount = Object.values(checked).filter(Boolean).length

  function toggle(key: string) {
    setChecked((c) => ({ ...c, [key]: !c[key] }))
    setQty((q) => (q[key] ? q : { ...q, [key]: 1 }))
  }

  function setItemQty(key: string, value: number) {
    setQty((q) => ({ ...q, [key]: value > 0 ? value : 1 }))
  }

  async function addSelected() {
    const rows = FOOD_PRESETS.filter((p) => checked[p.key]).map((p) => {
      const n = qty[p.key] ?? 1
      return {
        client_id: clientId,
        log_date: logDate ?? todayISO(),
        meal,
        name: p.name,
        quantity: n === 1 ? p.quantity : `${n} × ${p.quantity}`,
        calories: round1(p.calories * n),
        protein_g: round1(p.protein_g * n),
        carbs_g: round1(p.carbs_g * n),
        fat_g: round1(p.fat_g * n),
      }
    })
    if (rows.length === 0) return

    setSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('food_logs').insert(rows)
    setSubmitting(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Could not log food',
        description: error.message,
      })
      return
    }

    track('food_logged', { meal, quick_add: true, count: rows.length })
    toast({
      title: 'Logged',
      description: `${rows.length} item${rows.length === 1 ? '' : 's'} added.`,
    })
    setChecked({})
    setQty({})
    router.refresh()
  }

  async function addFactorMeal() {
    const calories = Number(factorCalories)
    if (!factorCalories || Number.isNaN(calories) || calories < 0) return

    setFactorSubmitting(true)
    const supabase = createClient()
    const { error } = await supabase.from('food_logs').insert({
      client_id: clientId,
      log_date: logDate ?? todayISO(),
      meal,
      name: 'Factor meal',
      calories,
    })
    setFactorSubmitting(false)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Could not log food',
        description: error.message,
      })
      return
    }

    track('food_logged', { meal, quick_add: true, factor: true })
    toast({ title: 'Logged', description: `Factor meal (${calories} kcal) added.` })
    setFactorCalories('')
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="qa-meal">Meal</Label>
        <select
          id="qa-meal"
          value={meal}
          onChange={(e) => setMeal(e.target.value as MealType)}
          className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {MEALS.map((m) => (
            <option key={m} value={m} className="bg-sumi">
              {MEAL_LABELS[m]}
            </option>
          ))}
        </select>
      </div>

      <ul className="max-h-[26rem] space-y-1 overflow-y-auto pr-1">
        {FOOD_PRESETS.map((p) => {
          const isChecked = !!checked[p.key]
          return (
            <li
              key={p.key}
              className="flex items-center gap-3 rounded-md px-2 py-2 hover:bg-white/5"
            >
              <input
                type="checkbox"
                id={`qa-${p.key}`}
                checked={isChecked}
                onChange={() => toggle(p.key)}
                className="h-4 w-4 shrink-0 rounded border-input accent-kin"
              />
              <label htmlFor={`qa-${p.key}`} className="min-w-0 flex-1 cursor-pointer text-sm">
                <span className="text-washi">{p.name}</span>{' '}
                <span className="text-muted-foreground">
                  · {p.quantity} · {p.calories} kcal
                </span>
              </label>
              <Input
                type="number"
                min={0.5}
                step={0.5}
                value={qty[p.key] ?? 1}
                onChange={(e) => setItemQty(p.key, Number(e.target.value))}
                disabled={!isChecked}
                aria-label={`Quantity of ${p.name}`}
                className="h-9 w-16 shrink-0 px-2 text-center"
              />
            </li>
          )
        })}
      </ul>

      <Button onClick={addSelected} disabled={selectedCount === 0 || submitting} className="w-full">
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Add {selectedCount > 0 ? `${selectedCount} item${selectedCount === 1 ? '' : 's'}` : 'checked items'}
      </Button>

      <div className="space-y-2 border-t border-border pt-4">
        <Label htmlFor="qa-factor">Factor meal (enter calories from the label)</Label>
        <div className="flex gap-2">
          <Input
            id="qa-factor"
            type="number"
            step="1"
            min={0}
            placeholder="Calories"
            value={factorCalories}
            onChange={(e) => setFactorCalories(e.target.value)}
          />
          <Button
            onClick={addFactorMeal}
            disabled={!factorCalories || factorSubmitting}
            variant="outline"
          >
            {factorSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}

export default QuickAddFood
