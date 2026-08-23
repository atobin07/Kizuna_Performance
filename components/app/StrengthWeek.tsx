'use client'

import * as React from 'react'
import { StrengthDay } from '@/components/app/StrengthDay'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Check, Lock, Moon } from 'lucide-react'
import type { ResolvedExercise, DayKey, MainLift } from '@/lib/strength'
import type { StrengthEntry } from '@/lib/supabase/types'

export interface WeekDay {
  dayKey: DayKey
  label: string
  shortLabel: string
  title: string
  rest: boolean
  dateISO: string
  isToday: boolean
  isPast: boolean
  exercises: ResolvedExercise[]
  entries: Record<string, StrengthEntry>
  notes: string
}

export interface StrengthWeekProps {
  clientId: string
  days: WeekDay[]
  initialDayKey: DayKey
  activeWeek: number
  increments: Record<MainLift, number>
}

function plannedLabel(ex: ResolvedExercise): string {
  return ex.target != null
    ? `${ex.sets}×${ex.reps} @ ${ex.target} lb`
    : `${ex.sets}×${ex.reps}`
}

function ReadOnlyDay({ day }: { day: WeekDay }) {
  const hasLogged = Object.keys(day.entries).length > 0
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-lg border border-border bg-sumi/60 px-4 py-2.5 text-sm text-muted-foreground">
        <Lock className="h-4 w-4 text-koke" />
        {day.isPast
          ? hasLogged
            ? 'Preview of a past session — logging is only open on the active day.'
            : 'No session was logged this day. Entries open only on the active day.'
          : 'Upcoming day — preview only. Entries open when it becomes today.'}
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
        {day.exercises.map((ex) => {
          const e = day.entries[ex.key]
          return (
            <li key={ex.key} className="flex items-start gap-3 bg-card p-4">
              <span
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border',
                  e?.completed
                    ? 'border-kin bg-kin text-sumi'
                    : 'border-border text-transparent'
                )}
              >
                <Check className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-washi">{ex.name}</p>
                <p className="mt-0.5 text-sm text-kin">
                  Prescribed: {plannedLabel(ex)}
                </p>
                {e && (e.actual_weight != null || e.actual_reps || e.actual_sets != null) && (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Logged: {e.actual_weight != null ? `${e.actual_weight} lb` : '—'}
                    {e.actual_sets != null ? ` · ${e.actual_sets} sets` : ''}
                    {e.actual_reps ? ` · ${e.actual_reps} reps` : ''}
                  </p>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      {day.notes && (
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">
            Session notes
          </p>
          <p className="mt-1 text-sm text-washi">{day.notes}</p>
        </div>
      )}
    </div>
  )
}

export function StrengthWeek({
  clientId,
  days,
  initialDayKey,
  activeWeek,
  increments,
}: StrengthWeekProps) {
  const [selectedKey, setSelectedKey] = React.useState<DayKey>(initialDayKey)
  const day = days.find((d) => d.dayKey === selectedKey) ?? days[0]

  return (
    <div className="space-y-5">
      {/* Day toggle */}
      <div className="grid grid-cols-7 gap-1.5">
        {days.map((d) => (
          <button
            key={d.dayKey}
            type="button"
            onClick={() => setSelectedKey(d.dayKey)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-lg border px-1 py-2 text-xs font-medium transition-colors',
              d.dayKey === selectedKey
                ? 'border-kin bg-kin/15 text-kin'
                : 'border-border bg-card text-muted-foreground hover:border-kin/40 hover:text-washi'
            )}
          >
            <span className="uppercase tracking-wider">{d.shortLabel}</span>
            {d.isToday ? (
              <span className="h-1.5 w-1.5 rounded-full bg-kin" aria-label="Today" />
            ) : (
              <span className="h-1.5 w-1.5" />
            )}
          </button>
        ))}
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base uppercase tracking-wider">
            {day.label} — {day.title}
          </CardTitle>
          {day.isToday && !day.rest && (
            <span className="rounded-full bg-kin/15 px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-kin">
              Active day
            </span>
          )}
        </CardHeader>
        <CardContent>
          {day.rest ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="inline-flex rounded-full border border-kin/30 bg-kin/10 p-3 text-kin">
                <Moon className="h-6 w-6" />
              </span>
              <h3 className="font-display text-xl font-bold text-washi">Rest day</h3>
              <p className="max-w-md text-sm text-muted-foreground">
                Recovery is training. Sleep, easy movement and food — you grow
                today so you can hit next week&apos;s numbers.
              </p>
            </div>
          ) : day.isToday ? (
            <StrengthDay
              clientId={clientId}
              logDate={day.dateISO}
              logWeek={activeWeek}
              dayKey={day.dayKey}
              exercises={day.exercises}
              increments={increments}
              initialEntries={day.entries}
              initialNotes={day.notes}
            />
          ) : (
            <ReadOnlyDay day={day} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default StrengthWeek
