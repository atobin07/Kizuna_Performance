/**
 * Kizuna wellness metric engine — pure, deterministic functions.
 * These power the public Macro Blueprint hook and the in-app scores
 * (Sleep Density, Readiness, and the north-star Durability Index).
 */

const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n))
const round = (n: number) => Math.round(n)

// ---------------------------------------------------------------------------
// MACRO BLUEPRINT — TDEE (Mifflin-St Jeor) → calorie + macro targets
// ---------------------------------------------------------------------------
export type Sex = 'male' | 'female'
export type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'athlete'
export type Goal = 'lose' | 'maintain' | 'gain'

export const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9,
}

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary — desk job, little exercise',
  light: 'Light — train 1–3×/week',
  moderate: 'Moderate — train 3–5×/week',
  active: 'Active — train 6–7×/week',
  athlete: 'Athlete — 2-a-days / physical job',
}

export const GOAL_LABELS: Record<Goal, string> = {
  lose: 'Lose fat',
  maintain: 'Maintain',
  gain: 'Build muscle',
}

// Calorie adjustment and protein target (g per kg bodyweight) by goal.
const GOAL_CAL_ADJ: Record<Goal, number> = { lose: -0.2, maintain: 0, gain: 0.12 }
const PROTEIN_PER_KG: Record<Goal, number> = { lose: 2.2, maintain: 1.8, gain: 2.0 }

export interface MacroInput {
  sex: Sex
  age: number
  heightCm: number
  weightKg: number
  activity: ActivityLevel
  goal: Goal
}

export interface MacroResult {
  bmr: number
  tdee: number
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  proteinPct: number
  carbsPct: number
  fatPct: number
}

export function computeMacros(input: MacroInput): MacroResult {
  const { sex, age, heightCm, weightKg, activity, goal } = input
  const bmr =
    10 * weightKg + 6.25 * heightCm - 5 * age + (sex === 'male' ? 5 : -161)
  const tdee = bmr * ACTIVITY_FACTORS[activity]
  const calories = tdee * (1 + GOAL_CAL_ADJ[goal])

  const protein_g = PROTEIN_PER_KG[goal] * weightKg
  const fat_g = (calories * 0.25) / 9 // 25% of calories from fat
  const proteinCals = protein_g * 4
  const fatCals = fat_g * 9
  const carbCals = Math.max(0, calories - proteinCals - fatCals)
  const carbs_g = carbCals / 4

  const totalCals = proteinCals + fatCals + carbCals || 1
  return {
    bmr: round(bmr),
    tdee: round(tdee),
    calories: round(calories),
    protein_g: round(protein_g),
    carbs_g: round(carbs_g),
    fat_g: round(fat_g),
    proteinPct: round((proteinCals / totalCals) * 100),
    carbsPct: round((carbCals / totalCals) * 100),
    fatPct: round((fatCals / totalCals) * 100),
  }
}

export const lbToKg = (lb: number) => lb * 0.453592
export const inToCm = (inches: number) => inches * 2.54

// ---------------------------------------------------------------------------
// SLEEP DENSITY — how restorative sleep actually is (0–100)
// ---------------------------------------------------------------------------
export interface SleepNight {
  durationMin: number | null
  quality: number | null // 1–10
  awakenings: number | null
  bedtimeMinutes?: number | null // minutes past midnight, for consistency
}

function nightDensity(n: SleepNight): number | null {
  if (n.durationMin == null) return null
  // Duration: peak at 8h (480m); ~1 pt lost per 4 min away.
  const durScore = clamp(100 - Math.abs(n.durationMin - 480) / 4)
  const qualityScore = n.quality != null ? clamp(n.quality * 10) : 70
  const awakeScore = clamp(100 - (n.awakenings ?? 0) * 12)
  return 0.5 * durScore + 0.35 * qualityScore + 0.15 * awakeScore
}

export interface SleepDensityResult {
  score: number
  band: 'elite' | 'solid' | 'building' | 'depleted'
  nights: number
  consistency: number | null // 0–100, higher = steadier bedtimes
}

export function sleepDensity(nights: SleepNight[]): SleepDensityResult | null {
  const scores = nights.map(nightDensity).filter((s): s is number => s != null)
  if (scores.length === 0) return null
  let score = scores.reduce((a, b) => a + b, 0) / scores.length

  // Consistency: penalize variable bedtimes.
  const beds = nights
    .map((n) => n.bedtimeMinutes)
    .filter((b): b is number => b != null)
  let consistency: number | null = null
  if (beds.length >= 3) {
    const mean = beds.reduce((a, b) => a + b, 0) / beds.length
    const variance = beds.reduce((a, b) => a + (b - mean) ** 2, 0) / beds.length
    const sd = Math.sqrt(variance)
    consistency = clamp(100 - sd) // ~1 pt per minute of SD
    score = score * 0.9 + consistency * 0.1
  }

  return {
    score: round(score),
    band: band4(score, ['elite', 'solid', 'building', 'depleted']),
    nights: scores.length,
    consistency: consistency != null ? round(consistency) : null,
  }
}

// ---------------------------------------------------------------------------
// READINESS — train hard, or recover? (0–100, daily)
// ---------------------------------------------------------------------------
export interface ReadinessInput {
  sleepHrs: number | null
  energy: number | null // 1–10
  stress: number | null // 1–10 (higher = worse)
  soreness?: number | null // 1–10 (higher = worse)
}

export interface ReadinessResult {
  score: number
  band: 'prime' | 'ready' | 'moderate' | 'recover'
  advice: string
}

export function readiness(input: ReadinessInput): ReadinessResult | null {
  const parts: Array<{ score: number; weight: number }> = []
  if (input.sleepHrs != null)
    parts.push({ score: clamp(100 - Math.abs(input.sleepHrs - 8) * 12.5), weight: 0.35 })
  if (input.energy != null)
    parts.push({ score: clamp(input.energy * 10), weight: 0.3 })
  if (input.stress != null)
    parts.push({ score: clamp(((10 - input.stress) / 9) * 100), weight: 0.25 })
  if (input.soreness != null)
    parts.push({ score: clamp(((10 - input.soreness) / 9) * 100), weight: 0.15 })

  if (parts.length === 0) return null
  const wsum = parts.reduce((a, p) => a + p.weight, 0)
  const score = round(parts.reduce((a, p) => a + p.score * p.weight, 0) / wsum)

  const band = band4(score, ['prime', 'ready', 'moderate', 'recover'])
  const advice = {
    prime: 'Green light. Attack today — go for PRs or heavy volume.',
    ready: 'Solid. Train as programmed; push where it feels good.',
    moderate: 'Dial it back ~20%. Quality over intensity today.',
    recover: 'Recover. Mobility, easy zone-2, sleep. Skip the grind.',
  }[band]

  return { score, band, advice }
}

// ---------------------------------------------------------------------------
// DURABILITY INDEX — the north-star weekly composite (0–100)
// ---------------------------------------------------------------------------
export interface DurabilityPillars {
  training: number | null // adherence 0–100
  nutrition: number | null // 0–100
  sleep: number | null // avg sleep density 0–100
  recovery: number | null // avg readiness 0–100
}

export interface DurabilityResult {
  score: number
  band: 'forged' | 'strong' | 'building' | 'fragile'
  pillars: DurabilityPillars
}

const PILLAR_WEIGHTS = { training: 0.3, nutrition: 0.25, sleep: 0.25, recovery: 0.2 }

export function durabilityIndex(p: DurabilityPillars): DurabilityResult | null {
  const entries = (Object.keys(PILLAR_WEIGHTS) as (keyof DurabilityPillars)[])
    .map((k) => ({ v: p[k], w: PILLAR_WEIGHTS[k] }))
    .filter((e): e is { v: number; w: number } => e.v != null)
  if (entries.length === 0) return null
  const wsum = entries.reduce((a, e) => a + e.w, 0)
  const score = round(entries.reduce((a, e) => a + e.v * e.w, 0) / wsum)
  return {
    score,
    band: band4(score, ['forged', 'strong', 'building', 'fragile']),
    pillars: p,
  }
}

// ---------------------------------------------------------------------------
function band4<T extends string>(
  score: number,
  [a, b, c, d]: [T, T, T, T]
): T {
  if (score >= 80) return a
  if (score >= 65) return b
  if (score >= 45) return c
  return d
}
