import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar, type SidebarNavItem } from '@/components/app/Sidebar'

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', user.id)
    .maybeSingle()

  const role = profile?.role ?? 'client'

  const items: SidebarNavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
    { href: '/program', label: 'Program', icon: 'program' },
    { href: '/food', label: 'Food', icon: 'food' },
    { href: '/sleep', label: 'Sleep', icon: 'sleep' },
    { href: '/benchmarks', label: 'Benchmarks', icon: 'benchmarks' },
    { href: '/journal', label: 'Journal', icon: 'journal' },
    { href: '/integrations', label: 'Integrations', icon: 'integrations' },
    { href: '/messages', label: 'Messages', icon: 'messages' },
    { href: '/assessments', label: 'Assessments', icon: 'assessments' },
  ]

  if (role === 'coach' || role === 'admin') {
    items.push({ href: '/coach', label: 'Coach Portal', icon: 'coach' })
  }

  return (
    <div className="flex min-h-screen flex-col bg-sumi lg:flex-row">
      <Sidebar
        items={items}
        userName={profile?.full_name ?? user.email}
        userRole={role}
      />
      <main className="flex-1 bg-sumi">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 lg:px-10">
          {children}
        </div>
      </main>
    </div>
  )
}
