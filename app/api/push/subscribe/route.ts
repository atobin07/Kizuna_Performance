import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

// Persist a browser PushSubscription for the signed-in user. RLS ensures a user
// can only write their own rows (we authenticate via the session cookie).
export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const endpoint = body?.endpoint as string | undefined
  const p256dh = body?.keys?.p256dh as string | undefined
  const auth = body?.keys?.auth as string | undefined
  if (!endpoint || !p256dh || !auth) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 })
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      client_id: user.id,
      endpoint,
      p256dh,
      auth,
      user_agent: (body?.user_agent as string | undefined) ?? null,
    },
    { onConflict: 'endpoint' }
  )
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const endpoint = body?.endpoint as string | undefined
  if (!endpoint) {
    return NextResponse.json({ error: 'endpoint required' }, { status: 400 })
  }

  await supabase
    .from('push_subscriptions')
    .delete()
    .eq('client_id', user.id)
    .eq('endpoint', endpoint)

  return NextResponse.json({ ok: true })
}
