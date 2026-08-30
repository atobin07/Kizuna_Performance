'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bell, BellOff, Trash2, Plus, Loader2 } from 'lucide-react'
import {
  enablePush,
  disablePush,
  isSubscribed,
  pushSupported,
} from '@/lib/push-client'
import type { Reminder, ReminderCategory } from '@/lib/supabase/types'

const CATEGORY_LABELS: Record<ReminderCategory, string> = {
  training: 'Training',
  recovery: 'Recovery',
  nutrition: 'Nutrition',
  log: 'Log session',
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_VALUES = [1, 2, 3, 4, 5, 6, 7]

const TZ = 'America/New_York'

// Recommended starting set, built from the athlete's training rhythm.
const PRESETS: Omit<
  Reminder,
  'id' | 'client_id' | 'created_at' | 'updated_at' | 'last_sent_on'
>[] = [
  {
    category: 'training',
    title: 'Swim block',
    body: 'Swim at 5:30 — goggles, cap, get in the water.',
    send_time: '05:15',
    timezone: TZ,
    days: [1, 2, 3, 4, 5],
    enabled: true,
  },
  {
    category: 'training',
    title: 'Strength session',
    body: 'Strength at 7:00 — warm up hips & shoulders, hit your numbers.',
    send_time: '06:45',
    timezone: TZ,
    days: [1, 2, 3, 5, 6],
    enabled: true,
  },
  {
    category: 'training',
    title: 'CrossFit block',
    body: 'CrossFit at 4:30 — fuel up and mobilize beforehand.',
    send_time: '16:15',
    timezone: TZ,
    days: [1, 2, 3, 4, 5],
    enabled: true,
  },
  {
    category: 'nutrition',
    title: 'Pre-workout fuel',
    body: 'Easy carbs + a little protein before you train.',
    send_time: '06:30',
    timezone: TZ,
    days: [1, 2, 3, 4, 5, 6],
    enabled: true,
  },
  {
    category: 'nutrition',
    title: 'Post-workout window',
    body: 'Protein + carbs within the hour. Log it while it’s fresh.',
    send_time: '08:15',
    timezone: TZ,
    days: [1, 2, 3, 4, 5, 6],
    enabled: true,
  },
  {
    category: 'recovery',
    title: 'Recovery block',
    body: 'Cold plunge to blunt soreness after hard work; sauna later to unwind.',
    send_time: '19:30',
    timezone: TZ,
    days: [1, 2, 3, 4, 5, 6, 7],
    enabled: true,
  },
  {
    category: 'log',
    title: 'Log your session',
    body: 'Record today’s lifts, reps, and notes so the data is there later.',
    send_time: '20:30',
    timezone: TZ,
    days: [1, 2, 3, 4, 5, 6],
    enabled: true,
  },
]

export interface NotificationSettingsProps {
  clientId: string
  vapidPublicKey: string
  initialReminders: Reminder[]
}

export function NotificationSettings({
  clientId,
  vapidPublicKey,
  initialReminders,
}: NotificationSettingsProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const [supported, setSupported] = useState(true)
  const [subscribed, setSubscribed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [reminders, setReminders] = useState<Reminder[]>(initialReminders)

  useEffect(() => {
    setSupported(pushSupported())
    isSubscribed().then(setSubscribed).catch(() => setSubscribed(false))
  }, [])

  async function handleEnable() {
    setBusy(true)
    try {
      const ok = await enablePush(vapidPublicKey)
      if (ok) {
        setSubscribed(true)
        toast({ title: 'Notifications on', description: 'This device will get your reminders.' })
        if (reminders.length === 0) await restoreRecommended()
      } else {
        toast({
          variant: 'destructive',
          title: 'Permission needed',
          description: 'Allow notifications in your browser settings, then try again.',
        })
      }
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Could not enable',
        description: e instanceof Error ? e.message : 'Unknown error',
      })
    } finally {
      setBusy(false)
    }
  }

  async function handleDisable() {
    setBusy(true)
    try {
      await disablePush()
      setSubscribed(false)
      toast({ title: 'Notifications off', description: 'This device won’t get reminders.' })
    } finally {
      setBusy(false)
    }
  }

  async function restoreRecommended() {
    const rows = PRESETS.map((p) => ({ ...p, client_id: clientId }))
    const { data, error } = await supabase.from('reminders').insert(rows).select()
    if (error) {
      toast({ variant: 'destructive', title: 'Could not add reminders', description: error.message })
      return
    }
    setReminders((prev) => [...prev, ...((data ?? []) as Reminder[])])
    router.refresh()
  }

  async function updateReminder(id: string, patch: Partial<Reminder>) {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    const { error } = await supabase
      .from('reminders')
      .update({ ...patch, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (error) {
      toast({ variant: 'destructive', title: 'Save failed', description: error.message })
    }
  }

  async function deleteReminder(id: string) {
    setReminders((prev) => prev.filter((r) => r.id !== id))
    await supabase.from('reminders').delete().eq('id', id)
  }

  async function addReminder() {
    const row = {
      client_id: clientId,
      category: 'training' as ReminderCategory,
      title: 'New reminder',
      body: 'What should this remind you to do?',
      send_time: '12:00',
      timezone: TZ,
      days: [1, 2, 3, 4, 5],
      enabled: true,
    }
    const { data, error } = await supabase.from('reminders').insert(row).select().single()
    if (error) {
      toast({ variant: 'destructive', title: 'Could not add', description: error.message })
      return
    }
    setReminders((prev) => [...prev, data as Reminder])
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-washi">
              {subscribed ? 'Notifications are on for this device' : 'Turn on notifications'}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {supported
                ? 'Get banner reminders on your phone for training, recovery, nutrition, and logging. Enable this once per device.'
                : 'This device or browser doesn’t support web push. On iPhone, add the app to your Home Screen first, then open it and enable.'}
            </p>
          </div>
          {supported &&
            (subscribed ? (
              <Button variant="outline" onClick={handleDisable} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <BellOff className="h-4 w-4" />}
                Turn off
              </Button>
            ) : (
              <Button onClick={handleEnable} disabled={busy || !vapidPublicKey}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                Enable notifications
              </Button>
            ))}
        </CardContent>
      </Card>

      {!vapidPublicKey && (
        <p className="text-sm text-aka">
          Push isn’t configured yet — the VAPID public key env var is missing.
        </p>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-washi">
          Your reminders
        </h2>
        <div className="flex gap-2">
          {reminders.length === 0 && (
            <Button size="sm" variant="outline" onClick={restoreRecommended}>
              Add recommended set
            </Button>
          )}
          <Button size="sm" variant="outline" onClick={addReminder}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>

      {reminders.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No reminders yet. Add the recommended set built around your training rhythm, or create your own.
        </p>
      )}

      <div className="space-y-4">
        {[...reminders]
          .sort((a, b) => a.send_time.localeCompare(b.send_time))
          .map((r) => (
            <Card key={r.id} className={r.enabled ? '' : 'opacity-60'}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="muted">{CATEGORY_LABELS[r.category]}</Badge>
                    <Input
                      type="time"
                      value={r.send_time}
                      onChange={(e) => updateReminder(r.id, { send_time: e.target.value })}
                      className="h-9 w-32"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={r.enabled ? 'default' : 'outline'}
                      onClick={() => updateReminder(r.id, { enabled: !r.enabled })}
                    >
                      {r.enabled ? 'On' : 'Off'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => deleteReminder(r.id)}
                      aria-label="Delete reminder"
                    >
                      <Trash2 className="h-4 w-4 text-aka" />
                    </Button>
                  </div>
                </div>

                <Input
                  value={r.title}
                  onChange={(e) => updateReminder(r.id, { title: e.target.value })}
                  placeholder="Title"
                  className="font-medium"
                />
                <Input
                  value={r.body}
                  onChange={(e) => updateReminder(r.id, { body: e.target.value })}
                  placeholder="Message"
                />

                <div className="flex flex-wrap gap-1.5">
                  {DAY_VALUES.map((d, i) => {
                    const on = r.days?.includes(d)
                    return (
                      <button
                        key={d}
                        type="button"
                        onClick={() => {
                          const next = on
                            ? r.days.filter((x) => x !== d)
                            : [...(r.days ?? []), d].sort((a, b) => a - b)
                          updateReminder(r.id, { days: next })
                        }}
                        className={
                          'rounded-md px-2.5 py-1 text-xs font-medium transition-colors ' +
                          (on
                            ? 'bg-kin/20 text-kin'
                            : 'bg-white/5 text-muted-foreground hover:text-washi')
                        }
                      >
                        {DAY_LABELS[i]}
                      </button>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}

export default NotificationSettings
