'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Logo } from '@/components/marketing/Logo'
import { cn } from '@/lib/utils'
import { track } from '@/lib/analytics'

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Coaching', href: '/coaching' },
  { label: 'Blog', href: '/blog' },
]

export function Navbar() {
  const [open, setOpen] = React.useState(false)
  const [scrolled, setScrolled] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleCta = () => track('nav_cta_click', { label: 'Book a Call' })

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-colors duration-300',
        scrolled || open
          ? 'border-b border-border bg-sumi/85 backdrop-blur supports-[backdrop-filter]:bg-sumi/65'
          : 'border-b border-transparent bg-transparent'
      )}
    >
      <div className="container flex h-[4.5rem] items-center justify-between">
        <Link href="/" onClick={() => setOpen(false)} aria-label="Kizuna Performance home">
          <Logo size={38} />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="group relative text-xs font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-washi"
            >
              {link.label}
              <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-kin transition-all duration-300 group-hover:w-full" />
            </Link>
          ))}
          <Button asChild size="sm" onClick={handleCta}>
            <Link href="/book">Book a Call</Link>
          </Button>
        </nav>

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
              className="py-3 text-sm font-medium uppercase tracking-widest text-muted-foreground transition-colors hover:text-kin"
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
