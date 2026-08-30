import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { NotificationSettings } from '@/components/app/NotificationSettings'
import type { Reminder } from '@/lib/supabase/types'

export const metadata = { title: 'Notifications' }

export default async function NotificationsPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('reminders')
    .select('*')
    .eq('client_id', user.id)
    .order('send_time', { ascending: true })

  const reminders = (data ?? []) as Reminder[]

  return (
    <div className="space-y-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          Settings
        </p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-washi">
          Notifications
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Banner reminders that show up on your phone — timed around your
          training blocks. Enable them once per device, then tune the schedule
          to match your week.
        </p>
      </header>

      <NotificationSettings
        clientId={user.id}
        vapidPublicKey={process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? ''}
        initialReminders={reminders}
      />
    </div>
  )
}
