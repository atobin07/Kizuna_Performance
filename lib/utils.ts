import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MealType } from '@/lib/supabase/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Display order + labels for meal categories (incl. workout nutrition). */
export const MEAL_ORDER: MealType[] = [
  'breakfast',
  'lunch',
  'dinner',
  'snack',
  'pre_workout',
  'intra_workout',
  'post_workout',
]

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  pre_workout: 'Pre-workout',
  intra_workout: 'Intra-workout',
  post_workout: 'Post-workout',
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions) {
  let d: Date
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}/.test(date)) {
    // Parse YYYY-MM-DD as a LOCAL date (avoids UTC off-by-one).
    const [y, m, day] = date.slice(0, 10).split('-').map(Number)
    d = new Date(y, m - 1, day)
  } else {
    d = new Date(date)
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...opts,
  }).format(d)
}

/** Common movements prepopulated in the benchmark logger. */
export const COMMON_MOVEMENTS = [
  'Back Squat',
  'Front Squat',
  'Deadlift',
  'Clean',
  'Snatch',
  'Clean & Jerk',
  'Press',
  'Push Press',
  'Bench Press',
  '500m Row',
  '1 Mile Run',
  'Fran',
  'Grace',
  'Helen',
  'Max Pull-ups',
  'Max Ring Muscle-ups',
] as const
