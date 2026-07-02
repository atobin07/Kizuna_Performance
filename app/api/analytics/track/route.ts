import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/lib/supabase/types'

// Service-role client — bypasses RLS for analytics writes. Created lazily so a
// missing env var can't crash the build's page-data collection.
let serviceClient: SupabaseClient<Database> | null = null
function getSupabase() {
  if (!serviceClient) {
    serviceClient = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { persistSession: false } }
    )
  }
  return serviceClient
}

export async function POST(req: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await req.json()
    const { event_name, properties, session_id, user_id, path } = body

    if (!event_name) {
      return NextResponse.json({ error: 'event_name required' }, { status: 400 })
    }

    const country = req.headers.get('x-vercel-ip-country') ?? null
    const device = req.headers.get('user-agent') ?? null

    await supabase.from('events').insert({
      event_name,
      properties: { ...(properties ?? {}), path },
      session_id: session_id ?? null,
      user_id: user_id ?? null,
    })

    if (event_name === 'page_view') {
      const url = new URL(req.headers.get('referer') ?? 'http://localhost')
      await supabase.from('page_views').insert({
        session_id: session_id ?? null,
        user_id: user_id ?? null,
        path,
        referrer: (properties?.referrer as string) ?? null,
        utm_source: url.searchParams.get('utm_source'),
        utm_medium: url.searchParams.get('utm_medium'),
        utm_campaign: url.searchParams.get('utm_campaign'),
        country,
        device: device
          ? /mobile/i.test(device)
            ? 'mobile'
            : 'desktop'
          : null,
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
