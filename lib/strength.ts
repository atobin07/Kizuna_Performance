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
 * Progression is per SESSION: each time a lift is trained it adds from the
 * previous session of that lift, so the configured WEEKLY increment is spread
 * across however many times per week that lift is scheduled (e.g. squat +10/wk
 * over 2 sessions = +5 each session; deadlift +10/wk over 1 session = +10).
 */
import { fromISODate, addDays } from '@/lib/dates'

export type MainLift = 'squat' | 'deadlift' | 'ohp' | 'bench' | 'hang_clean'
export type Category = 'main' | 'bodyweight' | 'accessory' | 'abs'
export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

/** Default weekly weight added to each progressed lift (lb) — user-overridable. */
export const INCREMENTS: Record<MainLift, number> = {
  squat: 10,
  deadlift: 10,
  ohp: 2.5,
  bench: 5,
  hang_clean: 2.5,
}

/** Allowed weekly increments the athlete can pick per lift. */
export const INCREMENT_OPTIONS = [2.5, 5, 10] as const

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
      { key: 'bulgarian_split_squat', name: 'Bulgarian Split Squat (DB)', category: 'accessory', sets: 3, reps: '8 / leg' },
      { key: 'lateral_raise', name: 'DB Lateral Raise', category: 'accessory', sets: 3, reps: '15' },
      { key: 'face_pull', name: 'DB Rear-Delt Fly', category: 'accessory', sets: 3, reps: '15' },
    ],
  },
  tue: {
    key: 'tue',
    label: 'Tuesday',
    title: 'Deadlift + Pull-ups',
    exercises: [
      { key: 'deadlift', name: 'Deadlift', category: 'main', sets: 3, reps: '5', lift: 'deadlift' },
      { key: 'pullups', name: 'Pull-ups', category: 'bodyweight', sets: 3, reps: 'AMRAP' },
      { key: 'romanian_deadlift', name: 'Romanian Deadlift (BB)', category: 'accessory', sets: 3, reps: '10' },
      { key: 'barbell_row', name: 'Barbell Row', category: 'accessory', sets: 3, reps: '10' },
      { key: 'hanging_leg_raise', name: 'Hanging Leg Raise', category: 'abs', sets: 3, reps: '12' },
      { key: 'cable_crunch', name: 'Weighted Sit-up (DB/KB)', category: 'abs', sets: 3, reps: '15' },
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
      { key: 'chest_supported_row', name: 'Chest-Supported DB Row', category: 'accessory', sets: 3, reps: '12' },
      { key: 'triceps_pushdown', name: 'DB Skull Crusher', category: 'accessory', sets: 3, reps: '12' },
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
      { key: 'leg_press', name: 'DB Walking Lunge', category: 'accessory', sets: 3, reps: '10 / leg' },
      { key: 'cable_fly', name: 'Flat DB Fly', category: 'accessory', sets: 3, reps: '15' },
      { key: 'hamstring_curl', name: 'Single-Leg DB RDL', category: 'accessory', sets: 3, reps: '10 / leg' },
      { key: 'rear_delt_fly', name: 'DB Rear-Delt Fly', category: 'accessory', sets: 3, reps: '15' },
    ],
  },
  sat: {
    key: 'sat',
    label: 'Saturday',
    title: 'Hang Clean + Pull-ups',
    exercises: [
      { key: 'hang_clean', name: 'Hang Clean', category: 'main', sets: 5, reps: '3', lift: 'hang_clean' },
      { key: 'pullups', name: 'Pull-ups', category: 'bodyweight', sets: 3, reps: 'AMRAP' },
      { key: 'front_squat', name: 'Front Squat (BB)', category: 'accessory', sets: 3, reps: '5' },
      { key: 'ab_wheel', name: 'Half-Kneeling KB Press-Out', category: 'abs', sets: 3, reps: '10 / side' },
      { key: 'cable_woodchop', name: 'KB Russian Twist', category: 'abs', sets: 3, reps: '12 / side' },
      { key: 'farmer_carry', name: "Farmer's Carry (DB/KB)", category: 'accessory', sets: 3, reps: '40 yd' },
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

/** Which weekdays each main lift is scheduled on (derived from the plan). */
export const LIFT_DAYS: Record<MainLift, DayKey[]> = (() => {
  const map = {} as Record<MainLift, DayKey[]>
  for (const k of DAY_ORDER) {
    for (const ex of WEEKLY_PLAN[k].exercises) {
      if (ex.lift) (map[ex.lift] ??= []).push(k)
    }
  }
  return map
})()

/** Sessions per week for a lift (min 1). */
export function sessionsPerWeek(lift: MainLift): number {
  return LIFT_DAYS[lift]?.length || 1
}

/** Per-session weight step = weekly increment spread across the lift's sessions. */
export function perSessionStep(
  lift: MainLift,
  increments: Record<MainLift, number> = INCREMENTS
): number {
  const weekly = increments[lift] || INCREMENTS[lift]
  return roundLoad(weekly / sessionsPerWeek(lift))
}

/**
 * Count scheduled sessions of a lift between two dates. When `inclusiveFrom`
 * is true the range is [fromISO, toISO); otherwise (fromISO, toISO).
 */
function sessionsBetween(
  lift: MainLift,
  fromISO: string,
  toISO: string,
  inclusiveFrom: boolean
): number {
  const days = LIFT_DAYS[lift] ?? []
  const to = fromISODate(toISO)
  let cur = fromISODate(fromISO)
  if (!inclusiveFrom) cur = addDays(cur, 1)
  let count = 0
  while (cur < to) {
    if (days.includes(dayKeyForDate(cur))) count += 1
    cur = addDays(cur, 1)
  }
  return count
}

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

/** A recorded failure/deload for a lift. */
export interface DeloadEvent {
  lift: MainLift
  effective_date: string
  baseline_week: number
  new_baseline: number
}

/** Round to a loadable 0.5 lb. */
export function roundLoad(n: number): number {
  return Math.round(n * 2) / 2
}

/**
 * The 20%-reduced baseline used when a lift is failed. Snaps to the lift's own
 * weekly step so it stays on that lift's loading grid.
 */
export function deloadBaseline(
  currentTarget: number,
  lift: MainLift,
  increments: Record<MainLift, number> = INCREMENTS
): number {
  const step = perSessionStep(lift, increments)
  return Math.round((currentTarget * 0.8) / step) * step
}

/**
 * Effective target for a lift on a given date, honoring deloads.
 * Baseline starts at the program's base weight (week 0). Each deload that took
 * effect strictly BEFORE this date resets the baseline; progression resumes
 * linearly from the most recent one.
 */
export function liftTargetForDate(
  lift: MainLift,
  baseWeights: Partial<Record<MainLift, number>>,
  startISO: string,
  dateISO: string,
  deloads: DeloadEvent[],
  increments: Record<MainLift, number> = INCREMENTS
): number {
  const step = perSessionStep(lift, increments)
  // Base segment counts sessions from the start date inclusively; a deload
  // segment counts sessions strictly after the fail date (the fail day itself
  // keeps its pre-deload weight).
  let seg = {
    date: startISO,
    baseline: baseWeights[lift] ?? DEFAULT_BASE_WEIGHTS[lift],
    inclusiveFrom: true,
  }
  for (const d of deloads) {
    if (d.lift !== lift) continue
    if (d.effective_date < dateISO && d.effective_date >= seg.date) {
      seg = { date: d.effective_date, baseline: d.new_baseline, inclusiveFrom: false }
    }
  }
  const priorSessions = sessionsBetween(lift, seg.date, dateISO, seg.inclusiveFrom)
  return roundLoad(seg.baseline + step * priorSessions)
}

/** Resolve a day's exercises with deload-aware target weights. */
export function resolveDay(
  day: DayPlan,
  baseWeights: Partial<Record<MainLift, number>>,
  startISO: string,
  dateISO: string,
  deloads: DeloadEvent[],
  increments: Record<MainLift, number> = INCREMENTS
): ResolvedExercise[] {
  return day.exercises.map((ex) => {
    if (ex.lift) {
      return {
        ...ex,
        target: liftTargetForDate(
          ex.lift,
          baseWeights,
          startISO,
          dateISO,
          deloads,
          increments
        ),
      }
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

/** Coerce a stored increments json blob into a typed record (falls back to defaults). */
export function parseIncrements(json: unknown): Record<MainLift, number> {
  const out = { ...INCREMENTS }
  if (json && typeof json === 'object') {
    for (const lift of Object.keys(INCREMENTS) as MainLift[]) {
      const v = (json as Record<string, unknown>)[lift]
      if (typeof v === 'number' && v > 0) out[lift] = v
    }
  }
  return out
}
