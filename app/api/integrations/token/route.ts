import { randomBytes } from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/** Generate (or rotate) the caller's personal ingestion token. */
export async function POST() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const token = `kz_${randomBytes(24).toString('base64url')}`

  // One active token per user: clear old, insert fresh (RLS scopes to owner).
  await supabase.from('integration_tokens').delete().eq('client_id', user.id)
  const { error } = await supabase
    .from('integration_tokens')
    .insert({ client_id: user.id, token, label: 'default' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ token })
}
