'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})
type FormData = z.infer<typeof schema>

const ease = [0.16, 1, 0.3, 1] as const

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  ) : (
    <svg className="w-[17px] h-[17px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
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
      toast.error('Email atau password salah. Coba lagi ya!', {
        icon: '🔐',
        style: { background: '#1f2937', color: '#fff' }
      })
      return
    }
    const { user } = await res.json()
    toast.success('Selamat datang kembali! 🎉', {
      style: { background: '#059669', color: '#fff' }
    })
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@akundang.id'
    router.push(user?.email === adminEmail ? '/admin' : redirect)
    router.refresh()
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-white to-stone-50">

      {/* Enhanced gradient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full opacity-30 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(244,63,94,0.2) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-25 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)' }} />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_70%,transparent_110%)]" />

      {/* Back to home button */}
      <motion.div
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute top-6 left-6"
      >
        <Link
          href="/"
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all backdrop-blur-xl border"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))',
            borderColor: 'rgba(120,113,108,0.2)',
          }}
        >
          <svg className="w-4 h-4 text-stone-600 group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          <span className="text-body-sm font-medium text-stone-700">Kembali</span>
        </Link>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease }}
        className="relative w-full max-w-[440px] mx-4 z-10"
      >
        {/* Card glow effect */}
        <div className="absolute -inset-4 rounded-3xl opacity-20 blur-2xl"
          style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.4), rgba(139,92,246,0.3))' }} />

        {/* Glassmorphism card */}
        <div
          className="relative rounded-3xl overflow-hidden border shadow-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.9))',
            borderColor: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
          }}
        >
          {/* Top gradient accent */}
          <div className="h-1 w-full"
            style={{ background: 'linear-gradient(90deg, transparent, #f43f5e 30%, #a78bfa 70%, transparent)' }} />

          <div className="px-8 sm:px-10 pt-10 pb-10">

            {/* Logo + Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease }}
              className="text-center mb-8"
            >
              <Link href="/" className="group inline-block">
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg">
                    <Sparkles size={20} className="text-white" />
                  </div>
                  <span className="text-h3 font-bold tracking-tight">
                    <span className="bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">ak</span>
                    <span className="text-primary">undang</span>
                  </span>
                </div>
              </Link>
              <p className="text-caption text-muted">Undangan digital yang bikin tamu kagum</p>
            </motion.div>

            {/* Heading with better UX copy */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6, ease }}
              className="mb-8 text-center"
            >
              <h1 className="text-h2 font-bold text-primary mb-2">
                Selamat Datang Kembali! 👋
              </h1>
              <p className="text-body-sm text-secondary">
                Lanjutkan buat undangan impianmu
              </p>
            </motion.div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35, duration: 0.5 }}
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-5"
            >
              {/* Email field */}
              <div className="space-y-2">
                <label className="text-label-sm text-secondary block">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="nama@email.com"
                  className="w-full rounded-xl px-4 py-3.5 text-body-base text-primary placeholder-muted outline-none transition-all duration-200 bg-white border-2 border-stone-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                  {...register('email')}
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-caption text-red-600 flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errors.email.message}
                  </motion.p>
                )}
              </div>

              {/* Password field */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-label-sm text-secondary">
                    Password
                  </label>
                  <Link
                    href="/reset-password"
                    className="text-caption font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                  >
                    Lupa password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Masukkan password kamu"
                    className="w-full rounded-xl px-4 py-3.5 pr-12 text-body-base text-primary placeholder-muted outline-none transition-all duration-200 bg-white border-2 border-stone-200 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
                    {...register('password')}
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPass(v => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    <EyeIcon open={showPass} />
                  </button>
                </div>
                {errors.password && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-caption text-red-600 flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    {errors.password.message}
                  </motion.p>
                )}
              </div>

              {/* Submit button with better UX copy */}
              <div className="pt-2">
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={loading ? {} : { scale: 1.02, y: -2 }}
                  whileTap={loading ? {} : { scale: 0.98 }}
                  className="group w-full py-4 px-6 rounded-xl text-button-lg text-white font-semibold flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  style={{
                    background: loading
                      ? 'linear-gradient(135deg, rgba(244,63,94,0.6), rgba(225,29,72,0.6))'
                      : 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)',
                    boxShadow: loading
                      ? 'none'
                      : '0 8px 24px rgba(244,63,94,0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
                  }}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      <span>Sedang masuk...</span>
                    </>
                  ) : (
                    <>
                      <span>Masuk Sekarang</span>
                      <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </div>
            </motion.form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-caption">
                <span className="px-4 bg-white text-muted">atau</span>
              </div>
            </div>

            {/* Register CTA with persuasive copy */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="text-center space-y-4"
            >
              <p className="text-body-sm text-secondary">
                Belum punya akun?{' '}
                <Link
                  href={templateId ? `/register?template=${templateId}` : '/register'}
                  className="font-semibold text-rose-600 hover:text-rose-700 transition-colors"
                >
                  Daftar gratis sekarang
                </Link>
              </p>

              {/* Social proof micro-copy */}
              <div className="flex items-center justify-center gap-2 text-caption text-muted">
                <div className="flex -space-x-2">
                  {['🤵🏻', '👰🏻', '🤵🏽'].map((e, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-stone-100 to-stone-50 border-2 border-white flex items-center justify-center text-xs shadow-sm">
                      {e}
                    </div>
                  ))}
                </div>
                <span>500+ pasangan sudah percaya</span>
              </div>
            </motion.div>

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
