import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'
import type { PushSubscriptionRow } from '@/lib/supabase/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Sends an immediate test banner to every device the signed-in user has
// subscribed. Used by the "Send test" button on the Notifications page.
export async function POST() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 })
  }
  webpush.setVapidDetails('mailto:atobin07@proton.me', publicKey, privateKey)

  const { data } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('client_id', user.id)
  const subs = (data ?? []) as PushSubscriptionRow[]

  if (subs.length === 0) {
    return NextResponse.json(
      { error: 'No subscriptions on this account yet.' },
      { status: 400 }
    )
  }

  const payload = JSON.stringify({
    title: 'Kizuna Performance',
    body: 'Test notification — you’re all set. Reminders will arrive on schedule.',
    url: '/notifications',
    tag: 'test',
  })

  let sent = 0
  const dead: string[] = []
  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      )
      sent++
    } catch (err: unknown) {
      const status = (err as { statusCode?: number })?.statusCode
      if (status === 404 || status === 410) dead.push(s.endpoint)
    }
  }

  if (dead.length) {
    await supabase.from('push_subscriptions').delete().in('endpoint', dead)
  }

  return NextResponse.json({ ok: true, sent })
}
