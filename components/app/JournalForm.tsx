'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'
import { todayISO } from '@/lib/dates'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Loader2 } from 'lucide-react'
import type { JournalEntry } from '@/lib/supabase/types'

export interface JournalFormProps {
  clientId: string
  entry?: JournalEntry | null
  onSaved?: () => void
}

const schema = z.object({
  sleep_hrs: z.coerce.number().min(0).max(14),
  energy: z.number().min(1).max(10),
  stress: z.number().min(1).max(10),
  body_weight: z.coerce.number().min(0).max(1000).optional(),
  notes: z.string().max(2000).optional(),
})
type FormValues = z.infer<typeof schema>

export function JournalForm({ clientId, entry, onSaved }: JournalFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isEdit = Boolean(entry)

  const {
    control,
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      sleep_hrs: entry?.sleep_hrs ?? 7.5,
      energy: entry?.energy ?? 7,
      stress: entry?.stress ?? 4,
      body_weight: entry?.body_weight ?? undefined,
      notes: entry?.notes ?? '',
    },
  })

  async function onSubmit(values: FormValues) {
    const supabase = createClient()
    const entry_date = entry?.entry_date ?? todayISO()

    const { error } = await supabase.from('journal_entries').upsert(
      {
        client_id: clientId,
        entry_date,
        sleep_hrs: values.sleep_hrs,
        energy: values.energy,
        stress: values.stress,
        body_weight:
          values.body_weight != null && !Number.isNaN(values.body_weight)
            ? values.body_weight
            : null,
        notes: values.notes || null,
      },
      { onConflict: 'client_id,entry_date' }
    )

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Could not save entry',
        description: error.message,
      })
      return
    }

    track('journal_submitted', {})
    toast({
      title: isEdit ? 'Entry updated' : 'Entry saved',
      description: "Today's check-in is recorded.",
    })
    router.refresh()
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="jf-sleep">Sleep (hrs)</Label>
          <Input
            id="jf-sleep"
            type="number"
            step="0.5"
            min={0}
            max={14}
            {...register('sleep_hrs')}
          />
          {errors.sleep_hrs && (
            <p className="text-xs text-aka">Enter 0–14 hours.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="jf-weight">Body weight</Label>
          <Input
            id="jf-weight"
            type="number"
            step="0.1"
            min={0}
            placeholder="Optional"
            {...register('body_weight')}
          />
        </div>
      </div>

      <Controller
        control={control}
        name="energy"
        render={({ field }) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Energy</Label>
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
          </div>
        )}
      />

      <Controller
        control={control}
        name="stress"
        render={({ field }) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Stress</Label>
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
          </div>
        )}
      />

      <div className="space-y-2">
        <Label htmlFor="jf-notes">Notes</Label>
        <Textarea
          id="jf-notes"
          placeholder="Soreness, mood, life stress, wins…"
          {...register('notes')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isEdit ? 'Update entry' : 'Save entry'}
      </Button>
    </form>
  )
}

export default JournalForm
