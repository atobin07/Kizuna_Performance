'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { SignOutButton } from '@/components/app/SignOutButton'
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  BarChart3,
  BookOpen,
  MessageSquare,
  ClipboardCheck,
  Shield,
  UtensilsCrossed,
  Moon,
  Plug,
  Menu,
  X,
} from 'lucide-react'

export interface SidebarNavItem {
  href: string
  label: string
  icon: keyof typeof ICONS
}

const ICONS = {
  dashboard: LayoutDashboard,
  program: Dumbbell,
  strength: TrendingUp,
  benchmarks: BarChart3,
  journal: BookOpen,
  food: UtensilsCrossed,
  sleep: Moon,
  integrations: Plug,
  messages: MessageSquare,
  assessments: ClipboardCheck,
  coach: Shield,
} as const

export interface SidebarProps {
  items: SidebarNavItem[]
  userName?: string | null
  userRole?: string | null
}

export function Sidebar({ items, userName, userRole }: SidebarProps) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const nav = (
    <nav className="flex flex-1 flex-col gap-1">
      {items.map((item) => {
        const Icon = ICONS[item.icon]
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium uppercase tracking-wider transition-colors',
              active
                ? 'bg-kin/15 text-kin'
                : 'text-muted-foreground hover:bg-white/5 hover:text-washi'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )

  const inner = (
    <div className="flex h-full flex-col gap-6 p-5">
      <Link href="/dashboard" className="flex items-center gap-3">
        <span className="kanji text-3xl text-kin">絆</span>
        <span className="tracked-caps text-sm font-bold text-washi">
          Kizuna
        </span>
      </Link>

      {nav}

      <div className="mt-auto space-y-2 border-t border-border pt-4">
        {userName && (
          <div className="px-3">
            <p className="truncate text-sm font-semibold text-washi">
              {userName}
            </p>
            {userRole && (
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {userRole}
              </p>
            )}
          </div>
        )}
        <SignOutButton />
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3 lg:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="kanji text-2xl text-kin">絆</span>
          <span className="tracked-caps text-xs font-bold text-washi">
            Kizuna
          </span>
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-md p-2 text-washi hover:bg-white/5"
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Desktop fixed sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-border bg-card lg:block">
        {inner}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/80"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-64 border-r border-border bg-card">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-md p-2 text-washi hover:bg-white/5"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
            {inner}
          </aside>
        </div>
      )}
    </>
  )
}

export default Sidebar
