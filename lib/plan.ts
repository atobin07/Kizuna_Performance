import type { Plan } from '@/lib/supabase/types'

export type { Plan }

/** Ordered from lowest to highest. Index doubles as rank. */
export const PLAN_ORDER: Plan[] = ['base', 'track', 'perform', 'coached']

export interface PlanInfo {
  key: Plan
  name: string
  price: string
  tagline: string
}

export const PLANS: Record<Plan, PlanInfo> = {
  base: {
    key: 'base',
    name: 'Base',
    price: 'Free',
    tagline: 'Manual food & sleep logging to build the habit.',
  },
  track: {
    key: 'track',
    name: 'Track',
    price: '$12/mo',
    tagline: 'Unlimited history, macro targets, trends & export.',
  },
  perform: {
    key: 'perform',
    name: 'Perform',
    price: '$29/mo',
    tagline: 'Wearable integrations + advanced analytics.',
  },
  coached: {
    key: 'coached',
    name: 'Coached',
    price: 'Coaching',
    tagline: 'Everything, plus a coach reviewing your data.',
  },
}

/** Features gated by plan. Add a key here + a minimum plan and you're done. */
export type Feature =
  | 'food_tracking'
  | 'sleep_tracking'
  | 'unlimited_history'
  | 'macro_targets'
  | 'trends'
  | 'export'
  | 'integrations'
  | 'advanced_analytics'

export const FEATURE_MIN_PLAN: Record<Feature, Plan> = {
  food_tracking: 'base',
  sleep_tracking: 'base',
  trends: 'base',
  unlimited_history: 'track',
  macro_targets: 'track',
  export: 'track',
  integrations: 'perform',
  advanced_analytics: 'perform',
}

/** How many days of history each plan can view. `null` = unlimited. */
export const HISTORY_DAYS_BY_PLAN: Record<Plan, number | null> = {
  base: 30,
  track: null,
  perform: null,
  coached: null,
}

export function planRank(plan: Plan | null | undefined): number {
  return PLAN_ORDER.indexOf(plan ?? 'base')
}

/** Does `plan` unlock `feature`? */
export function can(plan: Plan | null | undefined, feature: Feature): boolean {
  return planRank(plan) >= planRank(FEATURE_MIN_PLAN[feature])
}

/** The lowest plan that unlocks `feature`. */
export function requiredPlan(feature: Feature): Plan {
  return FEATURE_MIN_PLAN[feature]
}

export function historyWindowDays(plan: Plan | null | undefined): number | null {
  return HISTORY_DAYS_BY_PLAN[plan ?? 'base']
}
