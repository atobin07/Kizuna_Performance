'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { track } from '@/lib/analytics'
import { CheckCircle2, Loader2 } from 'lucide-react'

const schema = z.object({ email: z.string().email('Enter a valid email') })
type FormValues = z.infer<typeof schema>

function LoginForm() {
  const params = useSearchParams()
  const redirectTo = params.get('redirectTo') ?? '/dashboard'
  const authError = params.get('error')
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  async function onSubmit({ email }: FormValues) {
    setServerError(null)
    const supabase = createClient()
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(
          redirectTo
        )}`,
      },
    })
    if (error) {
      setServerError(error.message)
      return
    }
    track('login_magic_link_sent', { email_domain: email.split('@')[1] })
    setSent(true)
  }

  return (
    <div className="w-full max-w-sm">
      <Link
        href="/"
        className="mb-10 flex items-center gap-3 text-washi"
      >
        <span className="text-3xl text-kin">絆</span>
        <span className="tracked-caps text-sm font-bold">
          Kizuna Performance
        </span>
      </Link>

      {sent ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-kin" />
          <h1 className="tracked-caps text-xl font-bold">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a magic link to sign you in. It expires shortly — open it on
            this device.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <h1 className="tracked-caps text-2xl font-bold">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a secure magic link. No
              passwords.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-xs text-aka">{errors.email.message}</p>
            )}
          </div>

          {(serverError || authError) && (
            <p className="text-xs text-aka">
              {serverError ??
                'Authentication failed. Request a new magic link.'}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Send magic link
          </Button>
        </form>
      )}
    </div>
  )
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-sumi px-6">
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </main>
  )
}
