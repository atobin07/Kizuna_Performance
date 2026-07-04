import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import type { Database } from '@/lib/supabase/types'

// Lazy service-role client (bypasses RLS to resolve tokens + write samples).
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

const SAMPLE_TYPES = [
  'sleep',
  'hrv',
  'resting_hr',
  'steps',
  'active_energy',
  'workout',
  'weight',
] as const

const sampleSchema = z.object({
  type: z.enum(SAMPLE_TYPES),
  value: z.number().nullable().optional(),
  unit: z.string().max(20).optional(),
  start_at: z.string(),
  end_at: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
})
type Sample = z.infer<typeof sampleSchema>

const samplesBody = z.object({
  provider: z.string().max(40).default('apple_health'),
  samples: z.array(sampleSchema).min(1).max(500),
})

/**
 * Flat "morning summary" shape — easy to build in an Apple Shortcut (one
 * Dictionary of a date + a few numbers). Any field may be omitted.
 */
const dailyBody = z.object({
  provider: z.string().max(40).default('apple_health'),
  date: z.string(), // YYYY-MM-DD
  sleep_min: z.number().optional(),
  sleep_quality: z.number().min(1).max(10).optional(),
  awakenings: z.number().min(0).optional(),
  hrv_ms: z.number().optional(),
  resting_hr: z.number().optional(),
  steps: z.number().optional(),
  active_energy: z.number().optional(),
  weight_kg: z.number().optional(),
})

function dailyToSamples(d: z.infer<typeof dailyBody>): Sample[] {
  const at = `${d.date}T00:00:00.000Z`
  const out: Sample[] = []
  if (d.sleep_min != null)
    out.push({
      type: 'sleep',
      value: d.sleep_min,
      unit: 'min',
      start_at: at,
      metadata: { quality: d.sleep_quality ?? null, awakenings: d.awakenings ?? 0 },
    })
  if (d.hrv_ms != null) out.push({ type: 'hrv', value: d.hrv_ms, unit: 'ms', start_at: at })
  if (d.resting_hr != null)
    out.push({ type: 'resting_hr', value: d.resting_hr, unit: 'bpm', start_at: at })
  if (d.steps != null) out.push({ type: 'steps', value: d.steps, unit: 'count', start_at: at })
  if (d.active_energy != null)
    out.push({ type: 'active_energy', value: d.active_energy, unit: 'kcal', start_at: at })
  if (d.weight_kg != null)
    out.push({ type: 'weight', value: d.weight_kg, unit: 'kg', start_at: at })
  return out
}

function isoDate(s: string): string {
  return new Date(s).toISOString().slice(0, 10)
}

export async function POST(req: NextRequest) {
  const auth = req.headers.get('authorization') ?? ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : ''
  if (!token) {
    return NextResponse.json({ error: 'Missing bearer token' }, { status: 401 })
  }

  const supabase = getSvc()
  const { data: tokenRow } = await supabase
    .from('integration_tokens')
    .select('client_id')
    .eq('token', token)
    .maybeSingle()
  if (!tokenRow?.client_id) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }
  const clientId = tokenRow.client_id

  const json = await req.json().catch(() => null)
  if (!json || typeof json !== 'object') {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Accept either the rich samples array or the flat daily summary.
  let provider = 'apple_health'
  let samples: Sample[] = []
  if ('samples' in json) {
    const p = samplesBody.safeParse(json)
    if (!p.success)
      return NextResponse.json({ error: 'Invalid payload', detail: p.error.flatten() }, { status: 400 })
    provider = p.data.provider
    samples = p.data.samples
  } else {
    const p = dailyBody.safeParse(json)
    if (!p.success)
      return NextResponse.json({ error: 'Invalid payload', detail: p.error.flatten() }, { status: 400 })
    provider = p.data.provider
    samples = dailyToSamples(p.data)
  }

  if (samples.length === 0) {
    return NextResponse.json({ error: 'No usable samples' }, { status: 400 })
  }

  // Store raw normalized samples (idempotent on client+provider+type+start).
  const rows = samples.map((s) => ({
    client_id: clientId,
    provider,
    type: s.type,
    value: s.value ?? null,
    unit: s.unit ?? null,
    start_at: s.start_at,
    end_at: s.end_at ?? null,
    metadata: (s.metadata ?? {}) as Database['public']['Tables']['wearable_samples']['Row']['metadata'],
  }))
  const { error: insErr } = await supabase
    .from('wearable_samples')
    .upsert(rows, { onConflict: 'client_id,provider,type,start_at', ignoreDuplicates: true })
  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 })
  }

  // Sleep samples flow into sleep_logs so they feed Sleep Density + the UI.
  for (const s of samples.filter((s) => s.type === 'sleep' && s.value != null)) {
    const meta = (s.metadata ?? {}) as Record<string, unknown>
    await supabase.from('sleep_logs').upsert(
      {
        client_id: clientId,
        log_date: isoDate(s.start_at),
        duration_min: Math.round(s.value as number),
        quality: typeof meta.quality === 'number' ? (meta.quality as number) : null,
        awakenings: typeof meta.awakenings === 'number' ? (meta.awakenings as number) : 0,
      },
      { onConflict: 'client_id,log_date' }
    )
  }

  await supabase
    .from('integration_tokens')
    .update({ last_used_at: new Date().toISOString() })
    .eq('token', token)

  return NextResponse.json({ ok: true, ingested: rows.length })
}
