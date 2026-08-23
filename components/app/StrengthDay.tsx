'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Check, Loader2, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  deloadBaseline,
  MAIN_LIFT_LABELS,
  type ResolvedExercise,
  type Category,
  type DayKey,
} from '@/lib/strength'
import type { StrengthEntry } from '@/lib/supabase/types'

interface RowState {
  completed: boolean
  actual_weight: string
  actual_sets: string
  actual_reps: string
}

export interface StrengthDayProps {
  clientId: string
  logDate: string
  logWeek: number
  dayKey: DayKey
  exercises: ResolvedExercise[]
  initialEntries: Record<string, StrengthEntry>
  initialNotes: string
}

const CATEGORY_LABEL: Record<Category, string> = {
  main: 'Main lift',
  bodyweight: 'Bodyweight',
  accessory: 'Accessory',
  abs: 'Core',
}

function num(v: string): number | null {
  if (v.trim() === '') return null
  const n = Number(v)
  return Number.isNaN(n) ? null : n
}

export function StrengthDay({
  clientId,
  logDate,
  logWeek,
  dayKey,
  exercises,
  initialEntries,
  initialNotes,
}: StrengthDayProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [saving, setSaving] = React.useState(false)
  const [failing, setFailing] = React.useState<string | null>(null)
  const [notes, setNotes] = React.useState(initialNotes)

  async function handleFail(ex: ResolvedExercise) {
    if (!ex.lift || ex.target == null) return
    const newBaseline = deloadBaseline(ex.target)
    const label = MAIN_LIFT_LABELS[ex.lift]
    const ok = window.confirm(
      `Fail ${label} at ${ex.target} lb?\n\nIt will drop 20% to ${newBaseline} lb, and progression resumes from there for every future session. Today stays as logged.`
    )
    if (!ok) return

    setFailing(ex.key)
    const supabase = createClient()
    const { error } = await supabase.from('strength_deloads').insert({
      client_id: clientId,
      lift: ex.lift,
      effective_date: logDate,
      baseline_week: logWeek,
      new_baseline: newBaseline,
    })
    setFailing(null)

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Could not record the deload',
        description: error.message,
      })
      return
    }

    track('strength_deload', { lift: ex.lift, from: ex.target, to: newBaseline })
    toast({
      title: `${label} deloaded to ${newBaseline} lb`,
      description: 'Progression resumes from the new baseline next session.',
    })
    router.refresh()
  }

  const [rows, setRows] = React.useState<Record<string, RowState>>(() => {
    const init: Record<string, RowState> = {}
    for (const ex of exercises) {
      const e = initialEntries[ex.key]
      init[ex.key] = {
        completed: e?.completed ?? false,
        actual_weight:
          e?.actual_weight != null
            ? String(e.actual_weight)
            : ex.target != null
              ? String(ex.target)
              : '',
        actual_sets: e?.actual_sets != null ? String(e.actual_sets) : String(ex.sets),
        actual_reps: e?.actual_reps ?? ex.reps,
      }
    }
    return init
  })

  const update = (key: string, patch: Partial<RowState>) =>
    setRows((r) => ({ ...r, [key]: { ...r[key], ...patch } }))

  const completedCount = Object.values(rows).filter((r) => r.completed).length

  async function save() {
    setSaving(true)
    const supabase = createClient()

    const entries = exercises.map((ex) => {
      const r = rows[ex.key]
      return {
        client_id: clientId,
        log_date: logDate,
        exercise_key: ex.key,
        exercise_name: ex.name,
        category: ex.category,
        target_weight: ex.target,
        target_sets: ex.sets,
        target_reps: ex.reps,
        actual_weight: num(r.actual_weight),
        actual_sets: num(r.actual_sets),
        actual_reps: r.actual_reps || null,
        completed: r.completed,
        updated_at: new Date().toISOString(),
      }
    })

    const { error: entriesError } = await supabase
      .from('strength_entries')
      .upsert(entries, { onConflict: 'client_id,log_date,exercise_key' })

    const { error: sessionError } = await supabase
      .from('strength_sessions')
      .upsert(
        {
          client_id: clientId,
          log_date: logDate,
          day_key: dayKey,
          notes: notes || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'client_id,log_date' }
      )

    setSaving(false)

    if (entriesError || sessionError) {
      toast({
        variant: 'destructive',
        title: 'Could not save session',
        description: (entriesError ?? sessionError)?.message,
      })
      return
    }

    track('strength_logged', { day: dayKey, completed: completedCount })
    toast({
      title: 'Session saved',
      description: `${completedCount}/${exercises.length} logged for today.`,
    })
    router.refresh()
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {completedCount}/{exercises.length} complete
        </span>
        <div className="h-1.5 w-32 overflow-hidden rounded-full bg-white/8">
          <div
            className="h-full rounded-full bg-gradient-to-r from-ember to-kin transition-all"
            style={{ width: `${(completedCount / Math.max(exercises.length, 1)) * 100}%` }}
          />
        </div>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {exercises.map((ex) => {
          const r = rows[ex.key]
          const planned =
            ex.target != null
              ? `${ex.sets}×${ex.reps} @ ${ex.target} lb`
              : `${ex.sets}×${ex.reps}`
          return (
            <li
              key={ex.key}
              className={cn(
                'p-4 transition-colors',
                r.completed ? 'bg-kin/[0.06]' : 'bg-card'
              )}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  aria-pressed={r.completed}
                  aria-label={`Mark ${ex.name} complete`}
                  onClick={() => update(ex.key, { completed: !r.completed })}
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border transition-colors',
                    r.completed
                      ? 'border-kin bg-kin text-sumi'
                      : 'border-border text-transparent hover:border-kin/50'
                  )}
                >
                  <Check className="h-4 w-4" />
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="font-medium text-washi">{ex.name}</p>
                    <span className="text-[0.65rem] uppercase tracking-wider text-koke">
                      {CATEGORY_LABEL[ex.category]}
                    </span>
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-kin">Prescribed: {planned}</p>
                    {ex.lift && ex.target != null && (
                      <button
                        type="button"
                        onClick={() => handleFail(ex)}
                        disabled={failing === ex.key}
                        className="inline-flex items-center gap-1 rounded-md border border-aka/50 px-2 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-aka transition-colors hover:bg-aka/10 disabled:opacity-50"
                      >
                        {failing === ex.key ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        Fail −20%
                      </button>
                    )}
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                        Weight
                      </Label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        step="2.5"
                        placeholder="lb"
                        value={r.actual_weight}
                        onChange={(e) => update(ex.key, { actual_weight: e.target.value })}
                        className="mt-1 h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                        Sets
                      </Label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder={String(ex.sets)}
                        value={r.actual_sets}
                        onChange={(e) => update(ex.key, { actual_sets: e.target.value })}
                        className="mt-1 h-9"
                      />
                    </div>
                    <div>
                      <Label className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
                        Reps
                      </Label>
                      <Input
                        type="text"
                        placeholder={ex.reps}
                        value={r.actual_reps}
                        onChange={(e) => update(ex.key, { actual_reps: e.target.value })}
                        className="mt-1 h-9"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>

      <div className="space-y-2">
        <Label htmlFor="strength-notes">Session notes</Label>
        <Textarea
          id="strength-notes"
          placeholder="How it felt, bar speed, form cues, tweaks, PRs…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <Button onClick={save} className="w-full" disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Save today&apos;s session
      </Button>
    </div>
  )
}

export default StrengthDay
