'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'
import type { Workout, WorkoutBlock, WorkoutMovement } from '@/lib/supabase/types'

export interface WorkoutLoggerProps {
  workout: Workout
  clientId: string
}

const schema = z.object({
  rpe: z.number().min(1).max(10),
  notes: z.string().max(2000).optional(),
})
type FormValues = z.infer<typeof schema>

function movementLine(m: WorkoutMovement): string {
  const parts: string[] = []
  if (m.sets != null && m.reps != null) parts.push(`${m.sets}×${m.reps}`)
  else if (m.reps != null) parts.push(`${m.reps} reps`)
  if (m.load) parts.push(`@ ${m.load}`)
  return parts.join(' ')
}

export function WorkoutLogger({ workout, clientId }: WorkoutLoggerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const blocks: WorkoutBlock[] = Array.isArray(workout.blocks)
    ? workout.blocks
    : []

  // Per-movement free-text results, keyed by movement name.
  const [results, setResults] = useState<Record<string, string>>({})

  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { rpe: 7, notes: '' },
  })

  async function onSubmit(values: FormValues) {
    const supabase = createClient()

    const { error: insertError } = await supabase.from('workout_results').insert({
      workout_id: workout.id,
      client_id: clientId,
      result: results,
      rpe: values.rpe,
      notes: values.notes || null,
    })

    if (insertError) {
      toast({
        variant: 'destructive',
        title: 'Could not log workout',
        description: insertError.message,
      })
      return
    }

    const { error: updateError } = await supabase
      .from('workouts')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', workout.id)

    if (updateError) {
      toast({
        variant: 'destructive',
        title: 'Result saved, but status not updated',
        description: updateError.message,
      })
    }

    track('workout_completed', { workout_id: workout.id })
    toast({
      title: 'Workout logged',
      description: 'Nice work. Your result has been recorded.',
    })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Prescribed blocks */}
      <div className="space-y-4">
        {blocks.map((block, bi) => (
          <Card key={bi} className="border-border">
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm uppercase tracking-wider text-washi">
                {block.title || block.type}
              </CardTitle>
              <div className="flex items-center gap-2">
                {block.time_domain && (
                  <Badge variant="muted">{block.time_domain}</Badge>
                )}
                <Badge variant="outline">{block.type}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              {block.notes && (
                <p className="text-sm text-muted-foreground">{block.notes}</p>
              )}
              <div className="space-y-4">
                {(block.movements ?? []).map((m, mi) => {
                  const key = m.name
                  const line = movementLine(m)
                  return (
                    <div
                      key={`${key}-${mi}`}
                      className="space-y-2 border-l-2 border-koke pl-3"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <span className="font-semibold text-washi">
                          {m.name}
                        </span>
                        {line && (
                          <span className="font-mono text-xs text-kin">
                            {line}
                          </span>
                        )}
                      </div>
                      {m.notes && (
                        <p className="text-xs text-muted-foreground">
                          {m.notes}
                        </p>
                      )}
                      <Input
                        aria-label={`Result for ${m.name}`}
                        placeholder="Log your result (e.g. 5×5 @ 225, 3:42, etc.)"
                        value={results[key] ?? ''}
                        onChange={(e) =>
                          setResults((prev) => ({
                            ...prev,
                            [key]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        ))}
        {blocks.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No prescribed blocks for this session.
          </p>
        )}
      </div>

      {/* Session log */}
      <Card className="border-kin/30">
        <CardHeader>
          <CardTitle className="text-sm uppercase tracking-wider">
            Session log
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Controller
            control={control}
            name="rpe"
            render={({ field }) => (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Session RPE</Label>
                  <span className="font-mono text-lg font-bold text-kin">
                    {field.value}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={10}
                  step={1}
                  value={[field.value]}
                  onValueChange={(v) => field.onChange(v[0])}
                />
                {errors.rpe && (
                  <p className="text-xs text-aka">Pick an RPE from 1–10.</p>
                )}
              </div>
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="wl-notes">Notes</Label>
            <Textarea
              id="wl-notes"
              placeholder="How did it feel? Any modifications?"
              {...register('notes')}
            />
          </div>

          <Button
            type="submit"
            className={cn('w-full')}
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Complete workout
          </Button>
        </CardContent>
      </Card>
    </form>
  )
}

export default WorkoutLogger
