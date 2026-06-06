'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Logo from '@/components/ui/Logo'

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})
type FormData = z.infer<typeof schema>

const ease = [0.16, 1, 0.3, 1] as const

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams.get('template') || ''
  const redirect = searchParams.get('redirect') || (templateId ? `/dashboard?template=${templateId}` : '/dashboard')
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setLoading(false)
    if (!res.ok) {
      toast.error('Email atau password salah', { icon: '🔐' })
      return
    }
    const { user } = await res.json()
    toast.success('Login berhasil! 🎉')
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@akundang.id'
    router.push(user?.email === adminEmail ? '/admin' : redirect)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-stone-50">

      {/* Back button - Compact mobile */}
      <Link
        href="/"
        className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-600 bg-white/80 backdrop-blur-sm border border-stone-200 hover:bg-white transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="hidden sm:inline">Kembali</span>
      </Link>

      {/* Login Card - Mobile Optimized */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-stone-200/50 overflow-hidden">

          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-gold-500 to-champagne-500" />

          <div className="p-6 sm:p-8">

            {/* Logo - Compact */}
            <div className="text-center mb-6">
              <Logo size="md" animated />
              <p className="text-xs text-stone-500 mt-1">Undangan digital praktis</p>
            </div>

            {/* Heading - Compact */}
            <div className="text-center mb-6">
              <h1 className="text-lg font-bold text-stone-900">Masuk ke Akun</h1>
              <p className="text-xs text-stone-600 mt-1">Kelola undanganmu</p>
            </div>

            {/* Form - Compact */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  className="w-full px-3 py-2.5 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100 transition-all"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-stone-700">
                    Password
                  </label>
                  <Link
                    href="/reset-password"
                    className="text-xs font-medium text-gold-600 hover:text-gold-600"
                  >
                    Lupa?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Masukkan password"
                    className="w-full px-3 py-2.5 pr-10 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100 transition-all"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                  >
                    <EyeIcon open={showPass} />
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit Button - Compact */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gold-gradient text-white text-sm font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Masuk...</span>
                  </>
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </form>

            {/* Divider - Compact */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-3 bg-white text-xs text-stone-500">atau</span>
              </div>
            </div>

            {/* Register CTA - Compact */}
            <div className="text-center space-y-3">
              <p className="text-sm text-stone-600">
                Belum punya akun?{' '}
                <Link
                  href={templateId ? `/register?template=${templateId}` : '/register'}
                  className="font-semibold text-gold-600 hover:text-gold-600"
                >
                  Daftar gratis
                </Link>
              </p>

              {/* Social proof - Mini */}
              <div className="flex items-center justify-center gap-2 text-xs text-stone-500">
                <div className="flex -space-x-1.5">
                  {['🤵🏻', '👰🏻', '🤵🏽'].map((e, i) => (
                    <div key={i} className="w-5 h-5 rounded-full bg-stone-100 border border-white flex items-center justify-center text-[10px]">
                      {e}
                    </div>
                  ))}
                </div>
                <span>500+ pasangan</span>
              </div>
            </div>

          </div>
        </div>
      </motion.div>

    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}
