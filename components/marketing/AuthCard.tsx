import Link from 'next/link'
import Logo from '@/components/ui/Logo'

// Shell halaman auth (login/register/forgot/reset) — kartu chalk dengan
// accent bar gold di atas canvas ivory. Tanpa framer: animasi masuk via CSS.

export function AuthCard({ backHref = '/', children }: { backHref?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-ivory">
      <Link
        href={backHref}
        className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-button text-label-sm text-concrete bg-chalk border border-hairline hover:text-forest-deep hover:border-gold-dark/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/40 focus-visible:ring-offset-2"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="hidden sm:inline">Kembali</span>
      </Link>

      <div className="w-full max-w-sm animate-slide-up">
        <div className="bg-chalk rounded-card shadow-card border border-hairline overflow-hidden">
          <div aria-hidden className="h-1 bg-gold-gradient" />
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6 flex flex-col items-center">
              <Logo variant="horizontal" size="sm" />
              <p className="text-body-xs text-concrete mt-3">Undangan digital premium</p>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
