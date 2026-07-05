'use client'

import * as React from 'react'
import Link from 'next/link'
import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { track } from '@/lib/analytics'

interface LeadFormProps {
  source: string
  cta: string
  submittingLabel?: string
  successTitle: string
  successBody: string
  placeholder?: string
}

export function LeadForm({
  source,
  cta,
  submittingLabel = 'Sending…',
  successTitle,
  successBody,
  placeholder = 'you@example.com',
}: LeadFormProps) {
  const [email, setEmail] = React.useState('')
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [done, setDone] = React.useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Enter a valid email address.')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      if (!res.ok) throw new Error('failed')
      track('lead_captured', { source })
      setDone(true)
    } catch {
      setError('Something went wrong. Please try again in a moment.')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-kin/40 bg-card p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-kin/15">
          <Check className="h-6 w-6 text-kin" />
        </div>
        <h3 className="mt-5 font-display text-2xl font-bold text-washi">
          {successTitle}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-muted-foreground">{successBody}</p>
        <Button asChild size="lg" variant="outline" className="mt-6">
          <Link href="/book">Ready now? Book a call</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-3">
      <Input
        type="email"
        placeholder={placeholder}
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-invalid={!!error}
      />
      {error && <p className="text-sm text-aka">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={submitting}>
        {submitting ? submittingLabel : cta}
      </Button>
    </form>
  )
}

export default LeadForm
