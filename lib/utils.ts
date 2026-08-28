import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
