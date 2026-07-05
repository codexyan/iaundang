import { Suspense } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import ReferralCapture from '@/components/landing/ReferralCapture'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-ivory">
      <Suspense fallback={null}><ReferralCapture /></Suspense>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
