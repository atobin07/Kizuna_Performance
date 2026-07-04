'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'
import { todayISO } from '@/lib/dates'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Plus } from 'lucide-react'

const MEALS = ['breakfast', 'lunch', 'dinner', 'snack'] as const

export interface FoodLoggerProps {
  clientId: string
  /** Defaults to today; a history view can pass a specific date. */
  logDate?: string
}

const schema = z.object({
  meal: z.enum(MEALS),
  name: z.string().min(1, 'Required').max(120),
  quantity: z.string().max(60).optional(),
  calories: z.coerce.number().min(0).max(20000).optional(),
  protein_g: z.coerce.number().min(0).max(2000).optional(),
  carbs_g: z.coerce.number().min(0).max(2000).optional(),
  fat_g: z.coerce.number().min(0).max(2000).optional(),
})
type FormValues = z.infer<typeof schema>

const num = (v: number | undefined) =>
  v != null && !Number.isNaN(v) ? v : null

export function FoodLogger({ clientId, logDate }: FoodLoggerProps) {
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { meal: 'breakfast' },
  })

  async function onSubmit(values: FormValues) {
    const supabase = createClient()
    const { error } = await supabase.from('food_logs').insert({
      client_id: clientId,
      log_date: logDate ?? todayISO(),
      meal: values.meal,
      name: values.name,
      quantity: values.quantity || null,
      calories: num(values.calories),
      protein_g: num(values.protein_g),
      carbs_g: num(values.carbs_g),
      fat_g: num(values.fat_g),
    })

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Could not log food',
        description: error.message,
      })
      return
    }

    track('food_logged', { meal: values.meal })
    toast({ title: 'Logged', description: `${values.name} added.` })
    reset({ meal: values.meal })
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fl-meal">Meal</Label>
          <select
            id="fl-meal"
            {...register('meal')}
            className="flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm capitalize text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {MEALS.map((m) => (
              <option key={m} value={m} className="bg-sumi capitalize">
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="fl-name">Food</Label>
          <Input id="fl-name" placeholder="e.g. Grilled chicken" {...register('name')} />
          {errors.name && <p className="text-xs text-aka">{errors.name.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fl-qty">Quantity</Label>
        <Input id="fl-qty" placeholder="Optional — e.g. 200g, 1 cup" {...register('quantity')} />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="fl-cal">Calories</Label>
          <Input id="fl-cal" type="number" step="1" min={0} {...register('calories')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fl-p">Protein (g)</Label>
          <Input id="fl-p" type="number" step="0.1" min={0} {...register('protein_g')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fl-c">Carbs (g)</Label>
          <Input id="fl-c" type="number" step="0.1" min={0} {...register('carbs_g')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fl-f">Fat (g)</Label>
          <Input id="fl-f" type="number" step="0.1" min={0} {...register('fat_g')} />
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Add to log
      </Button>
    </form>
  )
}

export default FoodLogger
