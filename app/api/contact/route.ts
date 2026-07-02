import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  source: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const parsed = schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }
    const { email, source } = parsed.data

    const apiKey = process.env.KIT_API_KEY
    const formId = process.env.KIT_FORM_ID

    // Forward to Kit (ConvertKit). If not configured, accept gracefully so the
    // marketing form still works in local/dev.
    if (apiKey && formId) {
      const res = await fetch(
        `https://api.convertkit.com/v3/forms/${formId}/subscribe`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            api_key: apiKey,
            email,
            fields: { source: source ?? 'website' },
          }),
        }
      )
      if (!res.ok) {
        return NextResponse.json(
          { error: 'Subscription failed' },
          { status: 502 }
        )
      }
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
