'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowUpRight, Flame } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'
import {
  computeMacros,
  lbToKg,
  inToCm,
  ACTIVITY_LABELS,
  GOAL_LABELS,
  type ActivityLevel,
  type Goal,
  type Sex,
} from '@/lib/metrics'

type Units = 'metric' | 'imperial'

const inputCls =
  'flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div className="grid auto-cols-fr grid-flow-col gap-1 rounded-md border border-input p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            'rounded px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors',
            value === o.value
              ? 'bg-kin text-sumi'
              : 'text-muted-foreground hover:text-washi'
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function MacroCalculator() {
  const [units, setUnits] = useState<Units>('imperial')
  const [sex, setSex] = useState<Sex>('male')
  const [age, setAge] = useState('30')
  const [heightCm, setHeightCm] = useState('178')
  const [heightFt, setHeightFt] = useState('5')
  const [heightIn, setHeightIn] = useState('10')
  const [weight, setWeight] = useState('185') // lb or kg per units
  const [activity, setActivity] = useState<ActivityLevel>('moderate')
  const [goal, setGoal] = useState<Goal>('lose')

  const result = useMemo(() => {
    const ageN = Number(age)
    const weightN = Number(weight)
    if (!ageN || !weightN || ageN < 13 || ageN > 100) return null

    const weightKg = units === 'imperial' ? lbToKg(weightN) : weightN
    const cm =
      units === 'imperial'
        ? inToCm(Number(heightFt) * 12 + Number(heightIn))
        : Number(heightCm)
    if (!cm || cm < 120 || cm > 230) return null

    return computeMacros({
      sex,
      age: ageN,
      heightCm: cm,
      weightKg,
      activity,
      goal,
    })
  }, [units, sex, age, heightCm, heightFt, heightIn, weight, activity, goal])

  const macroBars = result
    ? [
        { label: 'Protein', g: result.protein_g, pct: result.proteinPct, color: 'bg-kin' },
        { label: 'Carbs', g: result.carbs_g, pct: result.carbsPct, color: 'bg-ember' },
        { label: 'Fat', g: result.fat_g, pct: result.fatPct, color: 'bg-aka' },
      ]
    : []

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Inputs */}
      <div className="space-y-5 rounded-xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-center justify-between">
          <Label>Units</Label>
          <div className="w-48">
            <Segmented
              value={units}
              onChange={setUnits}
              options={[
                { value: 'imperial', label: 'lb / ft' },
                { value: 'metric', label: 'kg / cm' },
              ]}
            />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Biological sex</Label>
          <Segmented
            value={sex}
            onChange={setSex}
            options={[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="mc-age">Age</Label>
            <Input id="mc-age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mc-weight">Weight ({units === 'imperial' ? 'lb' : 'kg'})</Label>
            <Input id="mc-weight" type="number" value={weight} onChange={(e) => setWeight(e.target.value)} />
          </div>
        </div>

        <div>
          <Label className="mb-2 block">Height</Label>
          {units === 'imperial' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Input type="number" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} />
                <span className="text-sm text-muted-foreground">ft</span>
              </div>
              <div className="flex items-center gap-2">
                <Input type="number" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} />
                <span className="text-sm text-muted-foreground">in</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Input type="number" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
              <span className="text-sm text-muted-foreground">cm</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="mc-activity">Activity</Label>
          <select
            id="mc-activity"
            className={inputCls}
            value={activity}
            onChange={(e) => setActivity(e.target.value as ActivityLevel)}
          >
            {(Object.keys(ACTIVITY_LABELS) as ActivityLevel[]).map((k) => (
              <option key={k} value={k} className="bg-sumi">
                {ACTIVITY_LABELS[k]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label className="mb-2 block">Goal</Label>
          <Segmented
            value={goal}
            onChange={setGoal}
            options={(Object.keys(GOAL_LABELS) as Goal[]).map((g) => ({
              value: g,
              label: GOAL_LABELS[g],
            }))}
          />
        </div>
      </div>

      {/* Result */}
      <div className="relative flex flex-col justify-center overflow-hidden rounded-xl border border-kin/25 bg-gradient-to-br from-card to-sumi p-6 md:p-8">
        <div className="glow-gold pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full blur-2xl" />
        {result ? (
          <motion.div
            key={result.calories}
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            className="relative"
          >
            <p className="text-xs uppercase tracking-widest text-kin">
              Your daily target · {GOAL_LABELS[goal]}
            </p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-display text-6xl font-bold text-washi">
                {result.calories.toLocaleString()}
              </span>
              <span className="mb-2 flex items-center gap-1 text-sm text-muted-foreground">
                <Flame className="h-4 w-4 text-ember" /> kcal
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Maintenance ≈ {result.tdee.toLocaleString()} kcal · BMR {result.bmr.toLocaleString()}
            </p>

            <div className="mt-7 space-y-4">
              {macroBars.map((m) => (
                <div key={m.label}>
                  <div className="mb-1.5 flex items-baseline justify-between text-sm">
                    <span className="font-medium text-washi">{m.label}</span>
                    <span className="font-mono text-muted-foreground">
                      {m.g}g · {m.pct}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
                    <motion.div
                      className={cn('h-full rounded-full', m.color)}
                      initial={{ width: 0 }}
                      animate={{ width: `${m.pct}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-lg border border-border bg-sumi/60 p-4">
              <p className="text-sm text-washi">
                Want to actually <span className="text-kin">hit</span> these?
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create a free account to log food against this blueprint and
                unlock your Sleep Density & Readiness scores.
              </p>
              <Button
                asChild
                className="group mt-4 w-full"
                onClick={() => track('macro_calculated', { goal, calories: result.calories })}
              >
                <Link href="/login">
                  Start free — track my blueprint
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        ) : (
          <p className="relative text-center text-muted-foreground">
            Enter your details to see your personalized macros.
          </p>
        )}
      </div>
    </div>
  )
}

export default MacroCalculator
