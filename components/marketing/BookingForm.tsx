'use client'

import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'

const GOALS = [
  { value: 'endurance', label: 'Marathon / Endurance' },
  { value: 'strength', label: 'Lifting Competition (Powerlifting / Olympic)' },
  { value: 'adventure', label: 'Adventure / Obstacle Race' },
  { value: 'longevity', label: 'Longevity / Whole-Health Fitness' },
  { value: 'other', label: 'Something else' },
] as const

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  goal: z.string().refine((v) => GOALS.some((g) => g.value === v), {
    message: 'Select what you are training for',
  }),
  details: z.string().min(10, 'Tell me a little about your goal'),
})

type FormValues = z.infer<typeof schema>

export function BookingForm() {
  const [submitted, setSubmitted] = React.useState(false)
  const [startedTracked, setStartedTracked] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { goal: '' },
  })

  const selectedGoal = watch('goal')

  // Fire booking_started once, when the athlete begins filling the form.
  const handleStart = () => {
    if (!startedTracked) {
      setStartedTracked(true)
      track('booking_started', { goal: selectedGoal })
    }
  }

  const onSubmit = async (values: FormValues) => {
    setError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: values.email, source: 'booking' }),
      })
      if (!res.ok) throw new Error('Request failed')

      // NOTE: Cal.com scheduling would wire in here — e.g. open a Cal.com embed
      // seeded with `values.goal`. For now we confirm the request and follow up
      // manually.
      track('booking_completed', { goal: values.goal })
      setSubmitted(true)
    } catch {
      setError('We could not submit your request. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="rounded-lg border border-kin/40 bg-card p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-kin/15">
          <Check className="h-7 w-7 text-kin" />
        </div>
        <h2 className="mt-6 text-2xl font-black tracking-tight text-washi">
          Application received.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          I review every application personally. If it looks like a fit, I will
          reach out within one business day to set up your call. Keep an eye on
          your inbox.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      onFocus={handleStart}
      noValidate
      className="space-y-6 rounded-lg border border-border bg-card p-6 sm:p-8"
    >
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Your name" autoComplete="name" {...register('name')} />
        {errors.name && <p className="text-sm text-aka">{errors.name.message}</p>}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-aka">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 555-5555"
            autoComplete="tel"
            {...register('phone')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="goal">What are you training for?</Label>
        <select
          id="goal"
          className={cn(
            'flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          {...register('goal')}
        >
          <option value="" disabled className="bg-sumi text-koke">
            Select your primary goal…
          </option>
          {GOALS.map((g) => (
            <option key={g.value} value={g.value} className="bg-sumi text-washi">
              {g.label}
            </option>
          ))}
        </select>
        {errors.goal && <p className="text-sm text-aka">{errors.goal.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="details">Tell me more about your goal</Label>
        <Textarea
          id="details"
          rows={5}
          placeholder="Your target event or milestone, timeline, training history, injuries — anything that helps me program you properly."
          {...register('details')}
        />
        {errors.details && (
          <p className="text-sm text-aka">{errors.details.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-aka">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting…' : 'Apply for a spot'}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        Every request is reviewed personally. We reply within one business day.
      </p>
    </form>
  )
}
