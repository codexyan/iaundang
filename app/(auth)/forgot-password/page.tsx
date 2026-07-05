'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'
import { ArrowRight, Mail, CheckCircle, Loader2 } from 'lucide-react'
import { AuthCard } from '@/components/marketing/AuthCard'
import { InputField } from '@/components/marketing/Field'
import { Button } from '@/components/marketing/Button'

const schema = z.object({
  email: z.string().email('Email tidak valid'),
})

type FormData = z.infer<typeof schema>

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    setLoading(true)
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    setLoading(false)

    if (!res.ok) {
      const err = await res.json()
      toast.error(err.error || 'Gagal mengirim reset link')
      return
    }

    setSuccess(true)
    toast.success('Permintaan reset berhasil dikirim!')
  }

  if (success) {
    return (
      <AuthCard backHref="/login">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <h1 className="font-display text-h1 text-forest-deep mb-3">Cek Email Anda</h1>

          <p className="text-body-sm text-concrete mb-4 leading-relaxed">
            Jika email terdaftar, kami akan mengirimkan link untuk reset password.
            Silakan cek inbox dan folder spam Anda.
          </p>

          <p className="text-body-xs text-concrete mb-6">
            Link akan kadaluarsa dalam <strong className="text-graphite">1 jam</strong>.
          </p>

          <Button href="/login" className="w-full">
            <span>Kembali ke Login</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard backHref="/login">
      <div className="w-12 h-12 mb-5 rounded-xl bg-forest-50 border border-forest-100 flex items-center justify-center">
        <Mail className="w-5 h-5 text-forest" />
      </div>

      <div className="mb-8">
        <h1 className="font-display text-display-md text-forest-deep">Lupa Password?</h1>
        <p className="text-body-sm text-concrete mt-2">
          Masukkan email akunmu — kami kirimkan link untuk membuat password baru.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <InputField
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="nama@email.com"
          error={errors.email?.message}
          {...register('email')}
        />

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4" />
              <span>Memproses...</span>
            </>
          ) : (
            <>
              <span>Kirim Link Reset</span>
              <ArrowRight size={14} />
            </>
          )}
        </Button>
      </form>

      <div className="relative my-6" aria-hidden>
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-hairline" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-3 bg-chalk text-body-xs text-concrete">atau</span>
        </div>
      </div>

      <p className="text-body-sm text-concrete">
        Sudah ingat password?{' '}
        <Link href="/login" className="font-semibold text-forest hover:text-forest-deep transition-colors">
          Masuk
        </Link>
      </p>
    </AuthCard>
  )
}
