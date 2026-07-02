// Small, SSR-safe date helpers. All operate on YYYY-MM-DD strings in local
// terms without relying on locale-specific formatting.

/** Today as YYYY-MM-DD. */
export function todayISO(d: Date = new Date()): string {
  return toISODate(d)
}

/** Format a Date as YYYY-MM-DD (zero-padded, no timezone surprises). */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Parse a YYYY-MM-DD string into a local Date at midnight. */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

/** Add (or subtract) whole days to a date, returning a new Date. */
export function addDays(d: Date, days: number): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + days)
  return next
}

/** Monday-based start of the ISO week containing `d`, as a Date at midnight. */
export function startOfISOWeek(d: Date = new Date()): Date {
  const date = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  const day = date.getDay() // 0 = Sun … 6 = Sat
  const diff = day === 0 ? -6 : 1 - day // shift back to Monday
  return addDays(date, diff)
}

/** ISO week start as a YYYY-MM-DD string. */
export function startOfISOWeekISO(d: Date = new Date()): string {
  return toISODate(startOfISOWeek(d))
}

/**
 * Consecutive-day streak ending today (or yesterday) given a set of activity
 * dates (YYYY-MM-DD). If neither today nor yesterday is present, the streak is 0.
 */
export function computeStreak(dates: string[], today: Date = new Date()): number {
  const set = new Set(dates.map((d) => d.slice(0, 10)))
  if (set.size === 0) return 0

  const todayStr = toISODate(today)
  const yesterdayStr = toISODate(addDays(today, -1))

  // Anchor: today if logged, else yesterday, else no active streak.
  let cursor: Date
  if (set.has(todayStr)) cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  else if (set.has(yesterdayStr)) cursor = addDays(today, -1)
  else return 0

  let streak = 0
  while (set.has(toISODate(cursor))) {
    streak += 1
    cursor = addDays(cursor, -1)
  }
  return streak
}

/** Last N days as YYYY-MM-DD strings, oldest first, ending today. */
export function lastNDays(n: number, today: Date = new Date()): string[] {
  const out: string[] = []
  for (let i = n - 1; i >= 0; i--) out.push(toISODate(addDays(today, -i)))
  return out
}
