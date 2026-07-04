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
import type { SleepLog } from '@/lib/supabase/types'

export interface SleepLoggerProps {
  clientId: string
  entry?: SleepLog | null
  onSaved?: () => void
}

const schema = z.object({
  hours: z.coerce.number().min(0).max(24),
  quality: z.number().min(1).max(10),
  bedtime: z.string().optional(),
  wake_time: z.string().optional(),
  awakenings: z.coerce.number().min(0).max(50).optional(),
  notes: z.string().max(2000).optional(),
})
type FormValues = z.infer<typeof schema>

export function SleepLogger({ clientId, entry, onSaved }: SleepLoggerProps) {
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
      hours: entry?.duration_min != null ? entry.duration_min / 60 : 8,
      quality: entry?.quality ?? 7,
      bedtime: entry?.bedtime ?? '',
      wake_time: entry?.wake_time ?? '',
      awakenings: entry?.awakenings ?? 0,
      notes: entry?.notes ?? '',
    },
  })

  async function onSubmit(values: FormValues) {
    const supabase = createClient()
    const log_date = entry?.log_date ?? todayISO()

    const { error } = await supabase.from('sleep_logs').upsert(
      {
        client_id: clientId,
        log_date,
        duration_min: Math.round(values.hours * 60),
        quality: values.quality,
        bedtime: values.bedtime || null,
        wake_time: values.wake_time || null,
        awakenings:
          values.awakenings != null && !Number.isNaN(values.awakenings)
            ? values.awakenings
            : 0,
        notes: values.notes || null,
      },
      { onConflict: 'client_id,log_date' }
    )

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Could not save sleep',
        description: error.message,
      })
      return
    }

    track('sleep_logged', {})
    toast({
      title: isEdit ? 'Sleep updated' : 'Sleep logged',
      description: "Tonight's rest is recorded.",
    })
    router.refresh()
    onSaved?.()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="sl-hours">Hours slept</Label>
          <Input
            id="sl-hours"
            type="number"
            step="0.25"
            min={0}
            max={24}
            {...register('hours')}
          />
          {errors.hours && <p className="text-xs text-aka">Enter 0–24 hours.</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sl-bed">Bedtime</Label>
          <Input id="sl-bed" type="time" {...register('bedtime')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sl-wake">Wake time</Label>
          <Input id="sl-wake" type="time" {...register('wake_time')} />
        </div>
      </div>

      <Controller
        control={control}
        name="quality"
        render={({ field }) => (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Sleep quality</Label>
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
        <Label htmlFor="sl-wakes">Awakenings</Label>
        <Input
          id="sl-wakes"
          type="number"
          step="1"
          min={0}
          className="max-w-[8rem]"
          {...register('awakenings')}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="sl-notes">Notes</Label>
        <Textarea
          id="sl-notes"
          placeholder="Dreams, disturbances, caffeine, screen time…"
          {...register('notes')}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isEdit ? 'Update sleep' : 'Save sleep'}
      </Button>
    </form>
  )
}

export default SleepLogger
