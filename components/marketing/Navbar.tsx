'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Coaching', href: '/coaching' },
  { label: 'Blog', href: '/blog' },
]

export function Navbar() {
  const [open, setOpen] = React.useState(false)

  const handleCta = () => {
    track('nav_cta_click', { label: 'Book a Call' })
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-sumi/90 backdrop-blur supports-[backdrop-filter]:bg-sumi/70">
      <div className="container flex h-16 items-center justify-between">
        {/* Wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2.5"
          onClick={() => setOpen(false)}
        >
          <span className="kanji text-2xl leading-none text-kin">絆</span>
          <span className="tracked-caps text-sm font-bold text-washi">
            Kizuna Performance
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="tracked-caps text-xs font-medium text-muted-foreground transition-colors hover:text-kin"
            >
              {link.label}
            </Link>
          ))}
          <Button asChild size="sm" onClick={handleCta}>
            <Link href="/book">Book a Call</Link>
          </Button>
        </nav>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          aria-expanded={open}
          className="inline-flex h-10 w-10 items-center justify-center text-washi md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden border-t border-border bg-sumi transition-[max-height] duration-300 ease-in-out md:hidden',
          open ? 'max-h-96' : 'max-h-0'
        )}
      >
        <nav className="container flex flex-col gap-1 py-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="tracked-caps py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-kin"
            >
              {link.label}
            </Link>
          ))}
          <Button
            asChild
            className="mt-2 w-full"
            onClick={() => {
              handleCta()
              setOpen(false)
            }}
          >
            <Link href="/book">Book a Call</Link>
          </Button>
        </nav>
      </div>
    </header>
  )
}
