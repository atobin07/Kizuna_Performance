'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'
import { todayISO } from '@/lib/dates'
import { COMMON_MOVEMENTS } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'

export interface BenchmarkLoggerProps {
  clientId: string
  defaultMovement?: string
  triggerLabel?: string
}

const schema = z.object({
  movement: z.string().min(1, 'Movement is required'),
  value: z.coerce.number().positive('Enter a positive value'),
  unit: z.string().min(1, 'Unit is required'),
  recorded_at: z.string().min(1, 'Date is required'),
  notes: z.string().max(1000).optional(),
})
type FormValues = z.infer<typeof schema>

export function BenchmarkLogger({
  clientId,
  defaultMovement,
  triggerLabel = 'Log New PR',
}: BenchmarkLoggerProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      movement: defaultMovement ?? '',
      unit: 'lb',
      recorded_at: todayISO(),
      notes: '',
    },
  })

  async function onSubmit(values: FormValues) {
    const supabase = createClient()
    const { error } = await supabase.from('benchmarks').insert({
      client_id: clientId,
      movement: values.movement.trim(),
      value: values.value,
      unit: values.unit.trim(),
      recorded_at: values.recorded_at,
      notes: values.notes || null,
    })

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Could not log PR',
        description: error.message,
      })
      return
    }

    track('benchmark_logged', { movement: values.movement.trim() })
    toast({ title: 'PR logged', description: `${values.movement} recorded.` })
    reset({
      movement: defaultMovement ?? '',
      value: undefined,
      unit: values.unit,
      recorded_at: todayISO(),
      notes: '',
    })
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log New PR</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bm-movement">Movement</Label>
            <Input
              id="bm-movement"
              list="common-movements"
              placeholder="Search or type a movement"
              {...register('movement')}
            />
            <datalist id="common-movements">
              {COMMON_MOVEMENTS.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            {errors.movement && (
              <p className="text-xs text-aka">{errors.movement.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bm-value">Value</Label>
              <Input
                id="bm-value"
                type="number"
                step="any"
                {...register('value')}
              />
              {errors.value && (
                <p className="text-xs text-aka">{errors.value.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="bm-unit">Unit</Label>
              <Input
                id="bm-unit"
                placeholder="lb, kg, sec, reps"
                {...register('unit')}
              />
              {errors.unit && (
                <p className="text-xs text-aka">{errors.unit.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bm-date">Date</Label>
            <Input id="bm-date" type="date" {...register('recorded_at')} />
            {errors.recorded_at && (
              <p className="text-xs text-aka">{errors.recorded_at.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bm-notes">Notes</Label>
            <Textarea
              id="bm-notes"
              placeholder="Optional context…"
              {...register('notes')}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Save PR
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BenchmarkLogger
