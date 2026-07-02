import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: {
    default: 'Kizuna Performance — Elite movement. Built to last.',
    template: '%s — Kizuna Performance',
  },
  description:
    'Elite personal training and coaching. Precision meets grit. Movement Architecture, Sustainable Load, Recovery as Training, Performance Longevity.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  ),
  openGraph: {
    title: 'Kizuna Performance',
    description: 'Elite movement. Built to last.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-sumi text-washi">
        {children}
        <Toaster />
      </body>
    </html>
  )
}
