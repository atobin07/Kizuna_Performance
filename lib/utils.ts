import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...opts,
  }).format(new Date(date))
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
