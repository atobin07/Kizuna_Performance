'use client'

import { useForm, useFieldArray, type Control, type UseFormRegister } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import type { Program, WorkoutBlock } from '@/lib/supabase/types'
import { Loader2, Plus, Trash2, Dumbbell } from 'lucide-react'

const movementSchema = z.object({
  name: z.string().min(1, 'Required'),
  sets: z.string().optional(),
  reps: z.string().optional(),
  load: z.string().optional(),
  notes: z.string().optional(),
})

const blockSchema = z.object({
  type: z.enum(['warmup', 'strength', 'conditioning']),
  title: z.string().optional(),
  time_domain: z.string().optional(),
  movements: z.array(movementSchema).min(1, 'Add at least one movement'),
})

const schema = z.object({
  program_id: z.string().min(1, 'Select a program'),
  scheduled_date: z.string().min(1, 'Pick a date'),
  title: z.string().min(1, 'Give the session a title'),
  coach_notes: z.string().optional(),
  blocks: z.array(blockSchema).min(1, 'Add at least one block'),
})

type FormValues = z.infer<typeof schema>

const BLOCK_TYPES: FormValues['blocks'][number]['type'][] = [
  'warmup',
  'strength',
  'conditioning',
]

function emptyMovement() {
  return { name: '', sets: '', reps: '', load: '', notes: '' }
}

function emptyBlock(): FormValues['blocks'][number] {
  return { type: 'strength', title: '', time_domain: '', movements: [emptyMovement()] }
}

function MovementRows({
  control,
  register,
  blockIndex,
}: {
  control: Control<FormValues>
  register: UseFormRegister<FormValues>
  blockIndex: number
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `blocks.${blockIndex}.movements`,
  })

  return (
    <div className="space-y-3">
      {fields.map((field, mi) => (
        <div
          key={field.id}
          className="grid grid-cols-1 gap-2 rounded-md border border-border bg-black/20 p-3 sm:grid-cols-12"
        >
          <div className="sm:col-span-4">
            <Input
              placeholder="Movement (e.g. Back Squat)"
              {...register(`blocks.${blockIndex}.movements.${mi}.name`)}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              placeholder="Sets"
              {...register(`blocks.${blockIndex}.movements.${mi}.sets`)}
            />
          </div>
          <div className="sm:col-span-2">
            <Input
              placeholder="Reps"
              {...register(`blocks.${blockIndex}.movements.${mi}.reps`)}
            />
          </div>
          <div className="sm:col-span-3">
            <Input
              placeholder="Load"
              {...register(`blocks.${blockIndex}.movements.${mi}.load`)}
            />
          </div>
          <div className="flex items-center justify-end sm:col-span-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => (fields.length > 1 ? remove(mi) : undefined)}
              disabled={fields.length <= 1}
              aria-label="Remove movement"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          <div className="sm:col-span-12">
            <Input
              placeholder="Movement notes (optional)"
              {...register(`blocks.${blockIndex}.movements.${mi}.notes`)}
            />
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => append(emptyMovement())}
        className="text-kin"
      >
        <Plus className="h-4 w-4" /> Movement
      </Button>
    </div>
  )
}

export function ProgramBuilder({
  programs,
  clientId,
}: {
  programs: Program[]
  clientId: string
}) {
  const { toast } = useToast()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      program_id: programs[0]?.id ?? '',
      scheduled_date: '',
      title: '',
      coach_notes: '',
      blocks: [emptyBlock()],
    },
  })

  const {
    fields: blockFields,
    append: appendBlock,
    remove: removeBlock,
  } = useFieldArray({ control, name: 'blocks' })

  async function onSubmit(values: FormValues) {
    const supabase = createClient()
    const blocks: WorkoutBlock[] = values.blocks.map((b) => ({
      type: b.type,
      title: b.title || undefined,
      time_domain: b.time_domain || undefined,
      movements: b.movements.map((m) => ({
        name: m.name,
        sets: m.sets || undefined,
        reps: m.reps || undefined,
        load: m.load || undefined,
        notes: m.notes || undefined,
      })),
    }))

    const { error } = await supabase.from('workouts').insert({
      program_id: values.program_id,
      scheduled_date: values.scheduled_date,
      title: values.title,
      blocks,
      coach_notes: values.coach_notes || null,
    })

    if (error) {
      toast({
        title: 'Could not save workout',
        description: error.message,
        variant: 'destructive',
      })
      return
    }

    track('workout_created', { program_id: values.program_id })
    toast({
      title: 'Workout programmed',
      description: `"${values.title}" scheduled for ${values.scheduled_date}.`,
    })
    reset({
      program_id: values.program_id,
      scheduled_date: '',
      title: '',
      coach_notes: '',
      blocks: [emptyBlock()],
    })
  }

  if (programs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="tracked-caps text-sm">Program Builder</CardTitle>
          <CardDescription>
            This client has no program yet. Create a program before scheduling
            workouts.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 tracked-caps text-sm">
          <Dumbbell className="h-4 w-4 text-kin" /> Program Builder
        </CardTitle>
        <CardDescription>
          Build and schedule a session for this athlete.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="program_id">Program</Label>
              <select
                id="program_id"
                {...register('program_id')}
                className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {programs.map((p) => (
                  <option key={p.id} value={p.id} className="bg-sumi">
                    {p.name} — Phase {p.phase}
                  </option>
                ))}
              </select>
              {errors.program_id && (
                <p className="text-xs text-aka">{errors.program_id.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Scheduled date</Label>
              <Input id="scheduled_date" type="date" {...register('scheduled_date')} />
              {errors.scheduled_date && (
                <p className="text-xs text-aka">{errors.scheduled_date.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Session title</Label>
              <Input id="title" placeholder="Lower body strength" {...register('title')} />
              {errors.title && (
                <p className="text-xs text-aka">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {blockFields.map((block, bi) => (
              <div key={block.id} className="rounded-lg border border-border bg-card/50 p-4">
                <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-12">
                  <div className="sm:col-span-3">
                    <Label htmlFor={`blocks.${bi}.type`}>Type</Label>
                    <select
                      id={`blocks.${bi}.type`}
                      {...register(`blocks.${bi}.type`)}
                      className="mt-2 flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm capitalize text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {BLOCK_TYPES.map((t) => (
                        <option key={t} value={t} className="bg-sumi capitalize">
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-5">
                    <Label htmlFor={`blocks.${bi}.title`}>Block title</Label>
                    <Input
                      id={`blocks.${bi}.title`}
                      placeholder="A. Back Squat"
                      className="mt-2"
                      {...register(`blocks.${bi}.title`)}
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <Label htmlFor={`blocks.${bi}.time_domain`}>Time domain</Label>
                    <Input
                      id={`blocks.${bi}.time_domain`}
                      placeholder="EMOM 12"
                      className="mt-2"
                      {...register(`blocks.${bi}.time_domain`)}
                    />
                  </div>
                  <div className="flex items-end justify-end sm:col-span-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => (blockFields.length > 1 ? removeBlock(bi) : undefined)}
                      disabled={blockFields.length <= 1}
                      aria-label="Remove block"
                    >
                      <Trash2 className="h-4 w-4 text-aka" />
                    </Button>
                  </div>
                </div>
                <MovementRows control={control} register={register} blockIndex={bi} />
                {errors.blocks?.[bi]?.movements && (
                  <p className="mt-2 text-xs text-aka">
                    {errors.blocks[bi]?.movements?.message ??
                      'Each movement needs a name.'}
                  </p>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => appendBlock(emptyBlock())}
            >
              <Plus className="h-4 w-4" /> Add block
            </Button>
            {errors.blocks && typeof errors.blocks.message === 'string' && (
              <p className="text-xs text-aka">{errors.blocks.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="coach_notes">Coach notes</Label>
            <Textarea
              id="coach_notes"
              placeholder="Intent, cues, scaling options…"
              {...register('coach_notes')}
            />
          </div>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Schedule workout
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
