import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getProvider, isOAuthConfigured } from '@/lib/integrations'
import type { Database } from '@/lib/supabase/types'

let svc: SupabaseClient<Database> | null = null
function getSvc() {
  if (!svc) {
    svc = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
  }
  return svc
}

/**
 * Generic OAuth callback. Exchanges the auth code for tokens and stores the
 * connection. Per-provider sample fetching is layered on top of this stored
 * connection (each provider's API shape gets a small normalizer).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const { searchParams, origin } = new URL(req.url)
  const provider = getProvider(params.provider)
  const code = searchParams.get('code')
  const state = searchParams.get('state') ?? ''
  const [clientId] = state.split(':')

  const done = (q: string) => NextResponse.redirect(`${origin}/integrations?${q}`)

  if (!provider?.oauth || !isOAuthConfigured(provider)) {
    return done('error=not_configured')
  }
  if (!code || !clientId) {
    return done('error=oauth_failed')
  }

  try {
    const res = await fetch(provider.oauth.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: process.env[provider.oauth.clientIdEnv]!,
        client_secret: process.env[provider.oauth.clientSecretEnv]!,
        redirect_uri: `${origin}/api/integrations/${provider.key}/callback`,
      }),
    })
    if (!res.ok) return done(`error=token_exchange&provider=${provider.key}`)

    const tok = (await res.json()) as {
      access_token?: string
      refresh_token?: string
      expires_in?: number
    }
    if (!tok.access_token) return done('error=no_token')

    await getSvc()
      .from('wearable_connections')
      .upsert(
        {
          client_id: clientId,
          provider: provider.key,
          status: 'connected',
          access_token: tok.access_token,
          refresh_token: tok.refresh_token ?? null,
          scopes: provider.oauth.scopes,
          expires_at: tok.expires_in
            ? new Date(Date.now() + tok.expires_in * 1000).toISOString()
            : null,
          connected_at: new Date().toISOString(),
        },
        { onConflict: 'client_id,provider' }
      )

    return done(`connected=${provider.key}`)
  } catch {
    return done(`error=oauth_exception&provider=${provider.key}`)
  }
}
