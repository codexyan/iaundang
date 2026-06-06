'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-stone-50">

      {/* Back button - Compact */}
      <Link
        href="/login"
        className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-600 bg-white/80 backdrop-blur-sm border border-stone-200 hover:bg-white transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="hidden sm:inline">Kembali</span>
      </Link>

      {/* Reset Password Info Card - Mobile Optimized */}
      <div className="w-full max-w-sm">
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-stone-200/50 overflow-hidden">

          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-rose-500 to-pink-500" />

          <div className="p-6 sm:p-8 text-center">

            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>

            {/* Heading - Compact */}
            <h1 className="text-lg font-bold text-stone-900 mb-2">Reset Password</h1>
            <p className="text-xs text-stone-600 mb-6">Mode lokal - reset manual</p>

            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left mb-6">
              <p className="text-sm text-stone-700 leading-relaxed">
                Fitur reset password otomatis belum tersedia di mode lokal.
              </p>
              <div className="mt-3 space-y-1.5">
                <p className="text-xs text-stone-600">
                  <strong>Solusi:</strong>
                </p>
                <ol className="text-xs text-stone-600 space-y-1 ml-4 list-decimal">
                  <li>Hapus akun di <code className="bg-amber-100 px-1.5 py-0.5 rounded text-[11px] font-mono">data/users.json</code></li>
                  <li>Daftar ulang dengan email yang sama</li>
                </ol>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/login"
                className="w-full py-3 px-4 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-rose-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <span>Kembali ke Login</span>
                <ArrowRight size={14} />
              </Link>

              <Link
                href="/register"
                className="block w-full py-2.5 px-4 bg-white text-stone-700 text-sm font-medium rounded-lg border border-stone-300 hover:bg-stone-50 transition-all"
              >
                Atau Daftar Akun Baru
              </Link>
            </div>

          </div>
        </div>
      </div>

    </div>
  )
}
