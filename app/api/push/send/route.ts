import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'
import { createServiceClient } from '@/lib/supabase/server'
import type { Reminder, PushSubscriptionRow } from '@/lib/supabase/types'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// How much slack (minutes) past a reminder's send_time we still fire it. Cron
// runs ~every 15 min; last_sent_on prevents a second send on the next tick.
const WINDOW_MIN = 20

type TzParts = { minutes: number; isoWeekday: number; date: string }

function tzNow(timezone: string): TzParts {
  const now = new Date()
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
  })
  const parts = Object.fromEntries(
    fmt.formatToParts(now).map((p) => [p.type, p.value])
  )
  const weekdayMap: Record<string, number> = {
    Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7,
  }
  let hour = parseInt(parts.hour, 10)
  if (hour === 24) hour = 0 // some engines emit '24' for midnight
  return {
    minutes: hour * 60 + parseInt(parts.minute, 10),
    isoWeekday: weekdayMap[parts.weekday] ?? 1,
    date: `${parts.year}-${parts.month}-${parts.day}`,
  }
}

function parseHHMM(s: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s.trim())
  if (!m) return null
  return parseInt(m[1], 10) * 60 + parseInt(m[2], 10)
}

export async function GET(req: NextRequest) {
  return handle(req)
}
export async function POST(req: NextRequest) {
  return handle(req)
}

async function handle(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  const auth = req.headers.get('authorization')
  const provided =
    auth?.replace(/^Bearer\s+/i, '') ??
    new URL(req.url).searchParams.get('secret') ??
    ''
  if (!secret || provided !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!publicKey || !privateKey) {
    return NextResponse.json({ error: 'VAPID keys not configured' }, { status: 500 })
  }
  webpush.setVapidDetails(
    'mailto:atobin07@proton.me',
    publicKey,
    privateKey
  )

  const supabase = createServiceClient()
  const { data: reminderData } = await supabase
    .from('reminders')
    .select('*')
    .eq('enabled', true)
  const reminders = (reminderData ?? []) as Reminder[]

  const due = reminders.filter((r) => {
    const target = parseHHMM(r.send_time)
    if (target == null) return false
    const { minutes, isoWeekday, date } = tzNow(r.timezone || 'America/New_York')
    if (!r.days?.includes(isoWeekday)) return false
    if (r.last_sent_on === date) return false
    return minutes >= target && minutes - target < WINDOW_MIN
  })

  let sent = 0
  const removedEndpoints: string[] = []

  for (const r of due) {
    const { data: subData } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('client_id', r.client_id)
    const subs = (subData ?? []) as PushSubscriptionRow[]

    const payload = JSON.stringify({
      title: r.title,
      body: r.body,
      url: urlForCategory(r.category),
      tag: r.category,
    })

    for (const s of subs) {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        )
        sent++
      } catch (err: unknown) {
        const status = (err as { statusCode?: number })?.statusCode
        if (status === 404 || status === 410) removedEndpoints.push(s.endpoint)
      }
    }

    const { date } = tzNow(r.timezone || 'America/New_York')
    await supabase
      .from('reminders')
      .update({ last_sent_on: date })
      .eq('id', r.id)
  }

  if (removedEndpoints.length) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', removedEndpoints)
  }

  return NextResponse.json({
    ok: true,
    due: due.length,
    sent,
    pruned: removedEndpoints.length,
  })
}

function urlForCategory(category: string): string {
  switch (category) {
    case 'nutrition':
      return '/food'
    case 'log':
      return '/strength'
    case 'training':
      return '/strength'
    default:
      return '/dashboard'
  }
}
