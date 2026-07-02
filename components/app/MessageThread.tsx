'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { track } from '@/lib/analytics'
import { cn, formatDate } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Send } from 'lucide-react'
import type { Message } from '@/lib/supabase/types'

export interface MessageThreadProps {
  currentUserId: string
  otherUserId: string
  initialMessages: Message[]
}

function belongsToConversation(
  m: Message,
  a: string,
  b: string
): boolean {
  return (
    (m.sender_id === a && m.recipient_id === b) ||
    (m.sender_id === b && m.recipient_id === a)
  )
}

export function MessageThread({
  currentUserId,
  otherUserId,
  initialMessages,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom on new messages.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Realtime subscription for inserts to this conversation.
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`messages:${currentUserId}:${otherUserId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const m = payload.new as Message
          if (!belongsToConversation(m, currentUserId, otherUserId)) return
          setMessages((prev) => {
            if (prev.some((x) => x.id === m.id)) return prev
            return [...prev, m]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [currentUserId, otherUserId])

  async function send() {
    const text = body.trim()
    if (!text || sending) return
    setSending(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('messages')
      .insert({
        sender_id: currentUserId,
        recipient_id: otherUserId,
        body: text,
      })
      .select()
      .single()

    setSending(false)
    if (error) return

    setBody('')
    track('message_sent', {})
    if (data) {
      setMessages((prev) =>
        prev.some((x) => x.id === data.id) ? prev : [...prev, data]
      )
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-lg border border-border bg-card">
      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No messages yet. Say hello.
          </p>
        )}
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId
          return (
            <div
              key={m.id}
              className={cn('flex', mine ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[75%] rounded-lg px-3 py-2 text-sm',
                  mine
                    ? 'bg-kin/20 text-washi'
                    : 'border border-border bg-white/[0.03] text-washi'
                )}
              >
                <p className="whitespace-pre-wrap break-words">{m.body}</p>
                <p
                  className={cn(
                    'mt-1 text-[10px] uppercase tracking-wider',
                    mine ? 'text-kin/70' : 'text-muted-foreground'
                  )}
                >
                  {formatDate(m.created_at, {
                    month: 'short',
                    day: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          send()
        }}
        className="flex items-center gap-2 border-t border-border p-3"
      >
        <Input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write a message…"
          className="flex-1"
        />
        <Button type="submit" size="icon" disabled={sending || !body.trim()}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </form>
    </div>
  )
}

export default MessageThread
