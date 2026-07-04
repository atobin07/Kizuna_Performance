import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProvider, isOAuthConfigured } from '@/lib/integrations'

/**
 * Generic OAuth initiator. Redirects the user to the provider's authorize
 * URL using the config in lib/integrations.ts. Works for any OAuth provider
 * once its client id/secret env vars are set.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = getProvider(params.provider)
  const origin = new URL(req.url).origin

  if (!provider?.oauth) {
    return NextResponse.redirect(`${origin}/integrations?error=unknown_provider`)
  }
  if (!isOAuthConfigured(provider)) {
    return NextResponse.redirect(
      `${origin}/integrations?error=not_configured&provider=${provider.key}`
    )
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(`${origin}/login?redirectTo=/integrations`)
  }

  const clientId = process.env[provider.oauth.clientIdEnv]!
  const redirectUri = `${origin}/api/integrations/${provider.key}/callback`
  const state = `${user.id}:${provider.key}`

  const url = new URL(provider.oauth.authorizeUrl)
  url.searchParams.set('client_id', clientId)
  url.searchParams.set('redirect_uri', redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', provider.oauth.scopes)
  url.searchParams.set('state', state)

  return NextResponse.redirect(url.toString())
}
