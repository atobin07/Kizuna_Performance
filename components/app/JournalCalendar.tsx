import { cn, formatDate } from '@/lib/utils'
import { lastNDays } from '@/lib/dates'

export interface JournalCalendarProps {
  /** Set of YYYY-MM-DD dates that have journal entries. */
  loggedDates: string[]
  days?: number
}

/** 30-day grid, gold when an entry exists that day, muted when missing. */
export function JournalCalendar({ loggedDates, days = 30 }: JournalCalendarProps) {
  const logged = new Set(loggedDates.map((d) => d.slice(0, 10)))
  const grid = lastNDays(days)

  return (
    <div>
      <div className="grid grid-cols-10 gap-1.5">
        {grid.map((d) => {
          const has = logged.has(d)
          return (
            <div
              key={d}
              title={`${formatDate(d)}${has ? ' — logged' : ' — no entry'}`}
              className={cn(
                'aspect-square rounded-sm border',
                has
                  ? 'border-kin/60 bg-kin'
                  : 'border-border bg-white/[0.03]'
              )}
            />
          )
        })}
      </div>
      <div className="mt-3 flex items-center gap-4 text-[10px] uppercase tracking-wider text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm bg-kin" /> Logged
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm border border-border bg-white/[0.03]" />
          Missing
        </span>
      </div>
    </div>
  )
}

export default JournalCalendar
