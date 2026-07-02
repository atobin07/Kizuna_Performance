import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Workout } from '@/lib/supabase/types'

export interface WorkoutCardProps {
  workout: Workout
  href?: string
}

/** Server-safe workout summary card. */
export function WorkoutCard({ workout, href }: WorkoutCardProps) {
  const blockCount = Array.isArray(workout.blocks) ? workout.blocks.length : 0
  const completed = Boolean(workout.completed_at)

  return (
    <Link
      href={href ?? `/workouts/${workout.id}`}
      className="group block"
    >
      <Card className="border-border transition-colors group-hover:border-kin">
        <CardContent className="flex items-center justify-between gap-4 p-5">
          <div className="min-w-0 space-y-1">
            <p className="truncate font-semibold text-washi">
              {workout.title || 'Workout'}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
              {workout.scheduled_date && (
                <span>{formatDate(workout.scheduled_date)}</span>
              )}
              <span>
                {blockCount} {blockCount === 1 ? 'block' : 'blocks'}
              </span>
            </div>
          </div>
          {completed ? (
            <Badge variant="default" className="shrink-0">
              Completed
            </Badge>
          ) : (
            <Badge variant="muted" className="shrink-0">
              Scheduled
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

export default WorkoutCard
