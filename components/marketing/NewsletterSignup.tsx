'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { track } from '@/lib/analytics'

const schema = z.object({
  email: z.string().email('Enter a valid email address'),
})

type FormValues = z.infer<typeof schema>

export function NewsletterSignup() {
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          source: window.location.pathname,
        }),
      })
      if (!res.ok) throw new Error('Request failed')

      track('newsletter_signup', {})
      toast({
        title: 'You are in.',
        description: 'Welcome to The Bond. Watch your inbox.',
      })
      reset()
    } catch {
      toast({
        variant: 'destructive',
        title: 'Something went wrong.',
        description: 'Please try again in a moment.',
      })
    }
  }

  return (
    <section className="border-y border-border bg-card py-20 md:py-24">
      <div className="container">
        <div className="mx-auto max-w-2xl text-center">
          <span className="kanji text-3xl text-kin">絆</span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-washi sm:text-4xl">
            Join The Bond
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Training principles, recovery science, and the occasional shokunin
            note on mastery. No noise.
          </p>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <div className="flex-1 text-left">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-aka">{errors.email.message}</p>
              )}
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Joining…' : 'Subscribe'}
            </Button>
          </form>

          {isSubmitSuccessful && (
            <p className="mt-4 text-sm text-kin">
              Subscribed. Welcome to the room.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
