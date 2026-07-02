import { createServerClient, type CookieOptions } from '@supabase/ssr'
import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/lib/supabase/types'

type CookieToSet = { name: string; value: string; options?: CookieOptions }

// NOTE: @supabase/ssr's generic threading is out of sync with the installed
// supabase-js and collapses row types to `never`. There is a single hoisted
// supabase-js, so casting to its SupabaseClient<Database> restores correct
// typing without any runtime change.
export function createClient(): SupabaseClient<Database> {
  const cookieStore = cookies()
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from a Server Component — safe to ignore when middleware
            // is refreshing sessions.
          }
        },
      },
    }
  ) as unknown as SupabaseClient<Database>
}

/** Service-role client for trusted server-side writes (analytics, webhooks). */
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}
