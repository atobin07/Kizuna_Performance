/**
 * Performance Scorecard — a public lead-gen assessment that reuses the
 * north-star Durability Index. A handful of self-rated questions map to the
 * four durability pillars, producing a score, a band, and the single weakest
 * lever to fix — the hook that drives a booked call.
 */
import { durabilityIndex, type DurabilityResult } from './metrics'

export type Pillar = 'training' | 'nutrition' | 'sleep' | 'recovery'

export interface ScoreQuestion {
  id: string
  pillar: Pillar
  prompt: string
  options: { label: string; value: number }[] // value on 0–100
}

export const PILLAR_LABELS: Record<Pillar, string> = {
  training: 'Training',
  nutrition: 'Nutrition',
  sleep: 'Sleep',
  recovery: 'Recovery',
}

// Two questions per pillar. Option values are already on the 0–100 scale.
export const QUESTIONS: ScoreQuestion[] = [
  {
    id: 'train_consistency',
    pillar: 'training',
    prompt: 'How consistent is your training, week to week?',
    options: [
      { label: 'Rarely — it comes and goes', value: 20 },
      { label: 'A couple sessions when I can', value: 45 },
      { label: 'Most weeks, mostly on plan', value: 70 },
      { label: 'Dialed — I almost never miss', value: 95 },
    ],
  },
  {
    id: 'train_structure',
    pillar: 'training',
    prompt: 'How structured is your current program?',
    options: [
      { label: 'I mostly wing it', value: 20 },
      { label: 'A loose routine', value: 45 },
      { label: 'A real plan I follow', value: 72 },
      { label: 'Periodized toward a goal', value: 96 },
    ],
  },
  {
    id: 'nutri_dialed',
    pillar: 'nutrition',
    prompt: 'How dialed is your nutrition for your goal?',
    options: [
      { label: 'I eat however I feel', value: 20 },
      { label: 'I try to eat well', value: 48 },
      { label: 'I track loosely', value: 72 },
      { label: 'Calories & macros on point', value: 95 },
    ],
  },
  {
    id: 'nutri_protein',
    pillar: 'nutrition',
    prompt: 'How consistent is your protein intake?',
    options: [
      { label: 'Hit or miss', value: 25 },
      { label: 'Decent on training days', value: 50 },
      { label: 'Solid most days', value: 74 },
      { label: 'A target I hit daily', value: 95 },
    ],
  },
  {
    id: 'sleep_hours',
    pillar: 'sleep',
    prompt: 'On average, how much do you sleep a night?',
    options: [
      { label: 'Under 5 hours', value: 15 },
      { label: '5–6 hours', value: 42 },
      { label: '6–7 hours', value: 68 },
      { label: '7–8 hours', value: 98 },
      { label: '8+ hours', value: 92 },
    ],
  },
  {
    id: 'sleep_consistency',
    pillar: 'sleep',
    prompt: 'How consistent is your sleep schedule?',
    options: [
      { label: 'All over the place', value: 22 },
      { label: 'Varies a lot on weekends', value: 48 },
      { label: 'Fairly steady', value: 73 },
      { label: 'Same window every night', value: 95 },
    ],
  },
  {
    id: 'recov_between',
    pillar: 'recovery',
    prompt: 'How recovered do you feel between sessions?',
    options: [
      { label: 'Always beat up', value: 20 },
      { label: 'Often sore or tired', value: 45 },
      { label: 'Usually pretty good', value: 72 },
      { label: 'Fresh and ready', value: 95 },
    ],
  },
  {
    id: 'recov_stress',
    pillar: 'recovery',
    prompt: 'How would you rate your daily stress?',
    options: [
      { label: 'Very high, always on', value: 20 },
      { label: 'Elevated most days', value: 45 },
      { label: 'Manageable', value: 72 },
      { label: 'Low and in control', value: 95 },
    ],
  },
]

export interface ScorecardResult extends DurabilityResult {
  pillarScores: Record<Pillar, number>
  weakest: Pillar
  headline: string
  insight: string
}

const HEADLINES: Record<ScorecardResult['band'], string> = {
  forged: 'Forged — you are built to last.',
  strong: 'Strong — a few levers from elite.',
  building: 'Building — the foundation is there.',
  fragile: 'Fragile — high upside, fundamentals first.',
}

const INSIGHTS: Record<Pillar, string> = {
  training:
    'Your training is the leak. Consistency and real programming — not more intensity — is the fastest lever you have. A structured plan built around your goal changes everything downstream.',
  nutrition:
    'Nutrition is where your progress is quietly leaking. Dialing calories and protein to your goal is the highest-return fix on this list — the training only pays off once the fuel is right.',
  sleep:
    'Sleep is your bottleneck. It is a training input, not a break from training. Fix the depth and the schedule and your recovery, strength and focus all move with it.',
  recovery:
    'You are under-recovered. Managing stress and programming real recovery is what lets hard training actually stick instead of grinding you down.',
}

export function scoreScorecard(
  answers: Record<string, number>
): ScorecardResult | null {
  const pillars: Pillar[] = ['training', 'nutrition', 'sleep', 'recovery']
  const pillarScores = {} as Record<Pillar, number>

  for (const pillar of pillars) {
    const qs = QUESTIONS.filter((q) => q.pillar === pillar)
    const vals = qs
      .map((q) => answers[q.id])
      .filter((v): v is number => typeof v === 'number')
    if (vals.length === 0) return null
    pillarScores[pillar] = Math.round(
      vals.reduce((a, b) => a + b, 0) / vals.length
    )
  }

  const di = durabilityIndex(pillarScores)
  if (!di) return null

  const weakest = pillars.reduce((a, b) =>
    pillarScores[a] <= pillarScores[b] ? a : b
  )

  return {
    ...di,
    pillarScores,
    weakest,
    headline: HEADLINES[di.band],
    insight: INSIGHTS[weakest],
  }
}
