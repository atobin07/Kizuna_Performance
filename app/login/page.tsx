'use client'

import { useState, Suspense } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { track } from '@/lib/analytics'
import { CheckCircle2, Loader2 } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().optional(),
})
type FormValues = z.infer<typeof schema>

function LoginForm() {
  const params = useSearchParams()
  const redirectTo = params.get('redirectTo') ?? '/dashboard'
  const authError = params.get('error')
  const [sent, setSent] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  // Primary path: email + password. No email round-trip, no redirect config.
  async function onSubmit({ email, password }: FormValues) {
    setServerError(null)
    if (!password) {
      setServerError('Enter your password, or use the magic link below.')
      return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setServerError(error.message)
      return
    }
    track('login_password', {})
    // Full navigation so the SSR middleware picks up the fresh session cookie.
    window.location.assign(redirectTo)
  }

  // Secondary path: magic link.
  async function sendMagicLink() {
    setServerError(null)
    const email = getValues('email')
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setServerError('Enter your email above first.')
      return
    }
    setMagicLoading(true)
    const supabase = createClient()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    })
    setMagicLoading(false)
    if (error) {
      setServerError(error.message)
      return
    }
    track('login_magic_link_sent', { email_domain: email.split('@')[1] })
    setSent(true)
  }

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="mb-10 flex items-center gap-3 text-washi">
        <span className="text-3xl text-kin">絆</span>
        <span className="tracked-caps text-sm font-bold">Kizuna Performance</span>
      </Link>

      {sent ? (
        <div className="space-y-4 text-center">
          <CheckCircle2 className="mx-auto h-12 w-12 text-kin" />
          <h1 className="tracked-caps text-xl font-bold">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a magic link to sign you in. Open it on this device.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <h1 className="tracked-caps text-2xl font-bold">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password.
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
            {errors.email && <p className="text-xs text-aka">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              {...register('password')}
            />
          </div>

          {(serverError || authError) && (
            <p className="text-xs text-aka">
              {serverError ?? 'Authentication failed. Try again.'}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={sendMagicLink}
              disabled={magicLoading}
              className="text-xs text-muted-foreground underline-offset-4 transition-colors hover:text-kin hover:underline"
            >
              {magicLoading ? 'Sending…' : 'Prefer a magic link? Email me one instead'}
            </button>
          </div>
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
