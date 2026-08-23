/**
 * Kizuna strength progression engine.
 *
 * The weekly split + linear progression the athlete follows:
 *   Mon  Squat + OH Press + accessory
 *   Tue  Deadlift + Pullups + abs + accessory
 *   Wed  Bench + Pushups + accessory
 *   Thu  Rest
 *   Fri  Squat (2nd) + Bench + Pushups + accessory
 *   Sat  Hang Clean + Pullups + abs
 *   Sun  Rest
 *
 * Progression: +5 lb squat / +10 lb deadlift / +2.5 lb every other barbell
 * lift, per week from the program start date.
 */
import { fromISODate } from '@/lib/dates'

export type MainLift = 'squat' | 'deadlift' | 'ohp' | 'bench' | 'hang_clean'
export type Category = 'main' | 'bodyweight' | 'accessory' | 'abs'
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

/** Weekly weight added to each progressed lift (lb). */
export const INCREMENTS: Record<MainLift, number> = {
  squat: 5,
  deadlift: 10,
  ohp: 2.5,
  bench: 2.5,
  hang_clean: 2.5,
}

export const MAIN_LIFT_LABELS: Record<MainLift, string> = {
  squat: 'Squat',
  deadlift: 'Deadlift',
  ohp: 'Overhead Press',
  bench: 'Bench Press',
  hang_clean: 'Hang Clean',
}

/** Sensible starting weights (lb) — the athlete overrides these in setup. */
export const DEFAULT_BASE_WEIGHTS: Record<MainLift, number> = {
  squat: 135,
  deadlift: 185,
  ohp: 65,
  bench: 95,
  hang_clean: 95,
}

export interface Exercise {
  key: string
  name: string
  category: Category
  sets: number
  reps: string
  /** Present on progressed barbell lifts — links to base weight + increment. */
  lift?: MainLift
}

export interface DayPlan {
  key: DayKey
  label: string
  title: string
  rest?: boolean
  exercises: Exercise[]
}

// The "perfect" accessory work is chosen to complement each day's main lifts:
// single-leg + shoulder health on squat/press day, posterior chain + back on
// pull day, push balance + arms on bench day, and so on.
export const WEEKLY_PLAN: Record<DayKey, DayPlan> = {
  mon: {
    key: 'mon',
    label: 'Monday',
    title: 'Squat + Overhead Press',
    exercises: [
      { key: 'squat', name: 'Back Squat', category: 'main', sets: 5, reps: '5', lift: 'squat' },
      { key: 'ohp', name: 'Overhead Press', category: 'main', sets: 5, reps: '5', lift: 'ohp' },
      { key: 'bulgarian_split_squat', name: 'Bulgarian Split Squat', category: 'accessory', sets: 3, reps: '8 / leg' },
      { key: 'lateral_raise', name: 'Lateral Raise', category: 'accessory', sets: 3, reps: '15' },
      { key: 'face_pull', name: 'Face Pull', category: 'accessory', sets: 3, reps: '15' },
    ],
  },
  tue: {
    key: 'tue',
    label: 'Tuesday',
    title: 'Deadlift + Pull-ups',
    exercises: [
      { key: 'deadlift', name: 'Deadlift', category: 'main', sets: 3, reps: '5', lift: 'deadlift' },
      { key: 'pullups', name: 'Pull-ups', category: 'bodyweight', sets: 3, reps: 'AMRAP' },
      { key: 'romanian_deadlift', name: 'Romanian Deadlift', category: 'accessory', sets: 3, reps: '10' },
      { key: 'barbell_row', name: 'Barbell Row', category: 'accessory', sets: 3, reps: '10' },
      { key: 'hanging_leg_raise', name: 'Hanging Leg Raise', category: 'abs', sets: 3, reps: '12' },
      { key: 'cable_crunch', name: 'Cable Crunch', category: 'abs', sets: 3, reps: '15' },
    ],
  },
  wed: {
    key: 'wed',
    label: 'Wednesday',
    title: 'Bench + Push-ups',
    exercises: [
      { key: 'bench', name: 'Bench Press', category: 'main', sets: 5, reps: '5', lift: 'bench' },
      { key: 'pushups', name: 'Push-ups', category: 'bodyweight', sets: 3, reps: 'AMRAP' },
      { key: 'incline_db_press', name: 'Incline DB Press', category: 'accessory', sets: 3, reps: '10' },
      { key: 'chest_supported_row', name: 'Chest-Supported Row', category: 'accessory', sets: 3, reps: '12' },
      { key: 'triceps_pushdown', name: 'Triceps Rope Pushdown', category: 'accessory', sets: 3, reps: '15' },
      { key: 'db_hammer_curl', name: 'DB Hammer Curl', category: 'accessory', sets: 3, reps: '12' },
    ],
  },
  thu: {
    key: 'thu',
    label: 'Thursday',
    title: 'Rest',
    rest: true,
    exercises: [],
  },
  fri: {
    key: 'fri',
    label: 'Friday',
    title: 'Squat + Bench + Push-ups',
    exercises: [
      { key: 'squat', name: 'Back Squat', category: 'main', sets: 5, reps: '5', lift: 'squat' },
      { key: 'bench', name: 'Bench Press', category: 'main', sets: 5, reps: '5', lift: 'bench' },
      { key: 'pushups', name: 'Push-ups', category: 'bodyweight', sets: 3, reps: 'AMRAP' },
      { key: 'leg_press', name: 'Leg Press', category: 'accessory', sets: 3, reps: '12' },
      { key: 'cable_fly', name: 'Cable Fly', category: 'accessory', sets: 3, reps: '15' },
      { key: 'hamstring_curl', name: 'Seated Hamstring Curl', category: 'accessory', sets: 3, reps: '12' },
      { key: 'rear_delt_fly', name: 'Rear Delt Fly', category: 'accessory', sets: 3, reps: '15' },
    ],
  },
  sat: {
    key: 'sat',
    label: 'Saturday',
    title: 'Hang Clean + Pull-ups',
    exercises: [
      { key: 'hang_clean', name: 'Hang Clean', category: 'main', sets: 5, reps: '3', lift: 'hang_clean' },
      { key: 'pullups', name: 'Pull-ups', category: 'bodyweight', sets: 3, reps: 'AMRAP' },
      { key: 'front_squat', name: 'Front Squat', category: 'accessory', sets: 3, reps: '5' },
      { key: 'ab_wheel', name: 'Ab Wheel Rollout', category: 'abs', sets: 3, reps: '10' },
      { key: 'cable_woodchop', name: 'Cable Woodchopper', category: 'abs', sets: 3, reps: '12 / side' },
      { key: 'farmer_carry', name: "Farmer's Carry", category: 'accessory', sets: 3, reps: '40 yd' },
    ],
  },
  sun: {
    key: 'sun',
    label: 'Sunday',
    title: 'Rest',
    rest: true,
    exercises: [],
  },
}

export const DAY_ORDER: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']

/** JS getDay() (0=Sun) → our DayKey. */
export function dayKeyForDate(d: Date = new Date()): DayKey {
  const map: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return map[d.getDay()]
}

/** Whole weeks elapsed since the program start (never negative). */
export function weeksElapsed(startISO: string, todayISO: string): number {
  const start = fromISODate(startISO)
  const today = fromISODate(todayISO)
  const ms = today.getTime() - start.getTime()
  const weeks = Math.floor(ms / (7 * 24 * 60 * 60 * 1000))
  return Math.max(0, weeks)
}

/** Target weight for a progressed lift at a given week. */
export function targetWeight(lift: MainLift, base: number, weeks: number): number {
  const raw = base + INCREMENTS[lift] * weeks
  // Keep to a loadable 0.5 lb resolution.
  return Math.round(raw * 2) / 2
}

export interface ResolvedExercise extends Exercise {
  /** Computed target weight for progressed lifts, else null. */
  target: number | null
}

/** Resolve a day's exercises with computed target weights for the given week. */
export function resolveDay(
  day: DayPlan,
  baseWeights: Partial<Record<MainLift, number>>,
  weeks: number
): ResolvedExercise[] {
  return day.exercises.map((ex) => {
    if (ex.lift) {
      const base = baseWeights[ex.lift] ?? DEFAULT_BASE_WEIGHTS[ex.lift]
      return { ...ex, target: targetWeight(ex.lift, base, weeks) }
    }
    return { ...ex, target: null }
  })
}

/** Coerce a stored base_weights json blob into a typed record. */
export function parseBaseWeights(
  json: unknown
): Record<MainLift, number> {
  const out = { ...DEFAULT_BASE_WEIGHTS }
  if (json && typeof json === 'object') {
    for (const lift of Object.keys(INCREMENTS) as MainLift[]) {
      const v = (json as Record<string, unknown>)[lift]
      if (typeof v === 'number' && !Number.isNaN(v)) out[lift] = v
    }
  }
  return out
}
