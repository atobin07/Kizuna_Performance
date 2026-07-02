import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { MessageThread } from '@/components/app/MessageThread'
import type { Message } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  const role = profile?.role ?? 'client'

  let otherUserId: string | null = null
  let partnerName: string | null = null

  if (role === 'coach' || role === 'admin') {
    // Most recent conversation partner.
    const { data: recent } = await supabase
      .from('messages')
      .select('sender_id, recipient_id, created_at')
      .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(1)
    const m = recent?.[0]
    if (m) {
      otherUserId = m.sender_id === user.id ? m.recipient_id : m.sender_id
    }
  } else {
    // Client: their program coach, else any coach/admin.
    const { data: program } = await supabase
      .from('programs')
      .select('coach_id')
      .eq('client_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    otherUserId = program?.coach_id ?? null

    if (!otherUserId) {
      const { data: anyCoach } = await supabase
        .from('profiles')
        .select('id')
        .in('role', ['coach', 'admin'])
        .limit(1)
        .maybeSingle()
      otherUserId = anyCoach?.id ?? null
    }
  }

  if (!otherUserId) {
    return (
      <div className="space-y-8">
        <h1 className="tracked-caps text-2xl font-bold text-washi">Messages</h1>
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No conversation available yet.
          </CardContent>
        </Card>
      </div>
    )
  }

  const { data: partner } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', otherUserId)
    .maybeSingle()
  partnerName = partner?.full_name ?? null

  // Fetch existing messages between the two.
  const { data: msgRows } = await supabase
    .from('messages')
    .select('*')
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
    )
    .order('created_at', { ascending: true })

  const messages = (msgRows ?? []) as Message[]

  // Mark received (unread) messages as read.
  const unreadIds = messages
    .filter((m) => m.recipient_id === user.id && !m.read_at)
    .map((m) => m.id)
  if (unreadIds.length > 0) {
    await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .in('id', unreadIds)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="tracked-caps text-2xl font-bold text-washi">Messages</h1>
        {partnerName && (
          <p className="text-sm text-muted-foreground">
            Conversation with {partnerName}
          </p>
        )}
      </div>

      <MessageThread
        currentUserId={user.id}
        otherUserId={otherUserId}
        initialMessages={messages}
      />
    </div>
  )
}
