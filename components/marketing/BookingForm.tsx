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

const TIERS = [
  { value: 'private', label: '1-on-1 Private ($750–$1,000/mo)' },
  { value: 'semi-private', label: 'Semi-Private Group ($500–$600/mo)' },
  { value: 'undecided', label: 'Not sure yet' },
] as const

const schema = z.object({
  name: z.string().min(2, 'Please enter your name'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().optional(),
  goals: z.string().min(10, 'Tell us a little about your goals'),
  tier: z.enum(['private', 'semi-private', 'undecided']),
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
    defaultValues: { tier: 'undecided' },
  })

  const selectedTier = watch('tier')

  // Fire booking_started once, when the athlete begins filling the form.
  const handleStart = () => {
    if (!startedTracked) {
      setStartedTracked(true)
      track('booking_started', { tier: selectedTier })
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

      // NOTE: Stripe checkout / Cal.com scheduling would wire in here — e.g.
      // redirect to a Stripe Checkout session or open a Cal.com embed seeded
      // with `values.tier`. For now we confirm the request and follow up manually.
      track('booking_completed', { tier: values.tier })
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
          Request received.
        </h2>
        <p className="mx-auto mt-3 max-w-md text-muted-foreground">
          Thank you. We will reach out within one business day to schedule your
          discovery call. Keep an eye on your inbox.
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
        <Label htmlFor="tier">Preferred tier</Label>
        <select
          id="tier"
          className={cn(
            'flex h-11 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          {...register('tier')}
        >
          {TIERS.map((t) => (
            <option key={t.value} value={t.value} className="bg-sumi text-washi">
              {t.label}
            </option>
          ))}
        </select>
        {errors.tier && <p className="text-sm text-aka">{errors.tier.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="goals">What are you training for?</Label>
        <Textarea
          id="goals"
          rows={5}
          placeholder="Your goals, history, injuries, timeline — anything that helps us prepare."
          {...register('goals')}
        />
        {errors.goals && (
          <p className="text-sm text-aka">{errors.goals.message}</p>
        )}
      </div>

      {error && <p className="text-sm text-aka">{error}</p>}

      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting…' : 'Request My Discovery Call'}
      </Button>
    </form>
  )
}
