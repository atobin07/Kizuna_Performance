import { Navbar } from '@/components/marketing/Navbar'
import { Footer } from '@/components/marketing/Footer'
import { AnalyticsTracker } from '@/components/marketing/AnalyticsTracker'

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-sumi text-washi">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <AnalyticsTracker />
    </div>
  )
}
