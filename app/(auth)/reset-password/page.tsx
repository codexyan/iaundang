'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { motion } from 'framer-motion'
import { ArrowRight, KeyRound, CheckCircle, Loader2 } from 'lucide-react'
import Logo from '@/components/ui/Logo'

const schema = z
  .object({
    password: z.string().min(6, 'Password minimal 6 karakter'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  })

type FormData = z.infer<typeof schema>

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

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-stone-50">
      <Link
        href="/login"
        className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium text-stone-600 bg-white/80 backdrop-blur-sm border border-stone-200 hover:bg-white transition-all"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        <span className="hidden sm:inline">Kembali</span>
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-stone-200/50 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-gold-500 to-champagne-500" />
          <div className="p-6 sm:p-8">
            <div className="text-center mb-6 flex flex-col items-center">
              <Logo variant="horizontal" size="sm" animated />
              <p className="text-xs text-stone-500 mt-3">Undangan digital praktis</p>
            </div>
            {children}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

type TokenState = 'checking' | 'valid' | 'invalid'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token') || ''

  const [tokenState, setTokenState] = useState<TokenState>('checking')
  const [tokenError, setTokenError] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  useEffect(() => {
    if (!token) {
      setTokenState('invalid')
      setTokenError('Link reset tidak lengkap. Silakan minta link baru.')
      return
    }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.valid) {
          setEmail(data.email || '')
          setTokenState('valid')
        } else {
          setTokenState('invalid')
          setTokenError(
            data.expired
              ? 'Link reset sudah kadaluarsa. Silakan minta link baru.'
              : 'Link reset tidak valid. Silakan minta link baru.'
          )
        }
      })
      .catch(() => {
        setTokenState('invalid')
        setTokenError('Gagal memeriksa link reset. Coba muat ulang halaman.')
      })
  }, [token])

  async function onSubmit(data: FormData) {
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password: data.password }),
    })
    setLoading(false)
    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error || 'Gagal mereset password')
      return
    }
    setSuccess(true)
    toast.success('Password berhasil direset!')
    setTimeout(() => router.push('/login'), 2500)
  }

  if (tokenState === 'checking') {
    return (
      <CardShell>
        <div className="text-center py-6">
          <Loader2 className="w-6 h-6 text-stone-400 animate-spin mx-auto mb-3" />
          <p className="text-sm text-stone-500">Memeriksa link reset...</p>
        </div>
      </CardShell>
    )
  }

  if (tokenState === 'invalid') {
    return (
      <CardShell>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-amber-100 to-gold-100 flex items-center justify-center">
            <KeyRound className="w-8 h-8 text-gold-600" />
          </div>
          <h1 className="text-lg font-bold text-stone-900 mb-2">Link Tidak Berlaku</h1>
          <p className="text-xs text-stone-600 mb-6">{tokenError}</p>
          <div className="space-y-3">
            <Link
              href="/forgot-password"
              className="w-full py-3 px-4 bg-gold-gradient text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            >
              <span>Minta Link Baru</span>
              <ArrowRight size={14} />
            </Link>
            <Link
              href="/login"
              className="block w-full py-2.5 px-4 bg-white text-stone-700 text-sm font-medium rounded-lg border border-stone-300 hover:bg-stone-50 transition-all"
            >
              Kembali ke Login
            </Link>
          </div>
        </div>
      </CardShell>
    )
  }

  if (success) {
    return (
      <CardShell>
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center"
          >
            <CheckCircle className="w-8 h-8 text-green-600" />
          </motion.div>
          <h1 className="text-lg font-bold text-stone-900 mb-2">Password Berhasil Direset</h1>
          <p className="text-xs text-stone-600 mb-6">
            Kamu akan diarahkan ke halaman login. Silakan masuk dengan password baru.
          </p>
          <Link
            href="/login"
            className="w-full py-3 px-4 bg-gold-gradient text-white text-sm font-semibold rounded-lg hover:opacity-90 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span>Masuk Sekarang</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </CardShell>
    )
  }

  return (
    <CardShell>
      <div className="text-center mb-6">
        <h1 className="text-lg font-bold text-stone-900">Buat Password Baru</h1>
        <p className="text-xs text-stone-600 mt-1">
          {email ? <>untuk akun <strong>{email}</strong></> : 'Masukkan password baru untuk akunmu'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1.5">
            Password Baru
          </label>
          <div className="relative">
            <input
              type={showPass ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Min. 6 karakter"
              className="w-full px-3 py-2.5 pr-10 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100 transition-all"
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              aria-label={showPass ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <EyeIcon open={showPass} />
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-stone-700 mb-1.5">
            Konfirmasi Password Baru
          </label>
          <div className="relative">
            <input
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Ulangi password"
              className="w-full px-3 py-2.5 pr-10 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-gold-500 focus:ring-2 focus:ring-gold-100 transition-all"
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(v => !v)}
              aria-label={showConfirm ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <EyeIcon open={showConfirm} />
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-xs text-red-600 mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 bg-gold-gradient text-white text-sm font-semibold rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-gold-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Menyimpan...</span>
            </>
          ) : (
            <>
              <span>Simpan Password Baru</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>
    </CardShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordContent />
    </Suspense>
  )
}
