import Link from 'next/link'
import { Instagram, Linkedin } from 'lucide-react'
import { Logo } from '@/components/marketing/Logo'

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Coaching', href: '/coaching' },
  { label: 'Blog', href: '/blog' },
  { label: 'Book', href: '/book' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-sumi">
      <div className="container py-14">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <Link href="/" aria-label="Kizuna Performance home">
              <Logo size={40} />
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Elite movement. Built to last. Precision coaching rooted in the
              discipline of a craft.
            </p>
          </div>

          <div className="flex flex-col gap-8 sm:flex-row sm:gap-16">
            <nav className="flex flex-col gap-3">
              <span className="tracked-caps text-xs font-medium text-kin">
                Explore
              </span>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-kin"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex flex-col gap-3">
              <span className="tracked-caps text-xs font-medium text-kin">
                Follow
              </span>
              <div className="flex gap-4">
                <a
                  href="#"
                  aria-label="Instagram"
                  className="text-muted-foreground transition-colors hover:text-kin"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="text-muted-foreground transition-colors hover:text-kin"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Kizuna Performance</p>
          <p className="tracked-caps text-xs">Texas, USA</p>
        </div>
      </div>
    </footer>
  )
}
