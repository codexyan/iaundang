'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { RefreshCw, Home, AlertTriangle } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error('Error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-dark-gradient flex items-center justify-center p-4 relative overflow-hidden">

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(244,63,94,0.06) 0%, transparent 65%)' }} />
        <div className="absolute -bottom-20 right-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 max-w-2xl mx-auto text-center">

        {/* Error Icon */}
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/10 border border-red-500/20">
          <AlertTriangle className="w-12 h-12 text-red-400" />
        </div>

        {/* Heading */}
        <h1 className="text-white font-serif font-bold mb-4"
          style={{ fontSize: 'clamp(28px, 4vw, 40px)' }}>
          Oops! Terjadi Kesalahan
        </h1>

        {/* Description */}
        <p className="text-stone-400 text-sm sm:text-base leading-relaxed mb-2 max-w-md mx-auto">
          Maaf, ada yang tidak beres. Tim kami sudah diberitahu dan akan segera memperbaikinya.
        </p>

        {/* Error details (development only) */}
        {process.env.NODE_ENV === 'development' && error.message && (
          <div className="mt-4 mb-8 p-4 rounded-lg bg-red-950/20 border border-red-900/30 max-w-md mx-auto">
            <p className="text-red-400 text-xs font-mono break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-red-500/50 text-[10px] font-mono mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-8">
          <button
            onClick={reset}
            className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-stone-900 font-semibold text-sm bg-gold-gradient shadow-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <RefreshCw size={16} />
            Coba Lagi
          </button>
          <Link href="/">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium text-stone-300 border border-stone-700/50 hover:border-gold-500/50 hover:text-gold-400 transition-all">
              <Home size={16} />
              Kembali ke Beranda
            </button>
          </Link>
        </div>

        {/* Contact Support */}
        <div className="mt-12 pt-8 border-t border-stone-800/50">
          <p className="text-stone-500 text-xs mb-3">Masih bermasalah?</p>
          <a
            href="https://wa.me/628123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-gold-400 hover:text-gold-300 transition-colors"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            Hubungi Support via WhatsApp
          </a>
        </div>

      </div>
    </div>
  )
}
