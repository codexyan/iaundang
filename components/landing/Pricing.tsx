'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Link2, Images, Music2, CalendarCheck, Clock, ShieldCheck, MessageSquare, Users } from 'lucide-react'
import { PRICE_FORMATTED } from '@/lib/types'

const PROMO_END = '31 Agustus 2026'

const features = [
  { icon: Link2,         text: 'Domain nama pasangan kalian',       sub: 'ikhwal-fani.akundang.id, mudah diingat, enak dibagikan' },
  { icon: CalendarCheck, text: 'Undangan personal per tamu',        sub: 'Nama tamu tampil di undangan, bukan sekadar link biasa' },
  { icon: Music2,        text: 'Musik pengiring pilihan sendiri',   sub: 'Upload lagu favorit kalian sebagai pengiring halaman' },
  { icon: Images,        text: 'RSVP online hingga 500 tamu',       sub: 'Kelola konfirmasi kehadiran tanpa tanya satu per satu' },
  { icon: Clock,         text: 'Aktif 6 bulan penuh',               sub: 'Dari sebelum hingga setelah hari H' },
]

const guarantees = [
  {
    icon: ShieldCheck,
    title: 'Lihat hasilnya dulu, bayar kalau suka',
    desc: 'Masukkan nama kalian, pilih gayanya, dan lihat sendiri hasilnya. Bayar hanya kalau sudah yakin.',
  },
  {
    icon: MessageSquare,
    title: 'Ada yang siap membantu',
    desc: 'Kalian bisa tanya apa saja lewat WhatsApp. Kami balas dalam 1 hari kerja.',
  },
]

export default function Pricing() {
  return (
    <section id="harga" className="py-20 sm:py-24" style={{ background: '#f9f6f1' }}>
      <div className="max-w-4xl mx-auto px-5 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-12"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Semua yang kalian butuhkan, dalam satu harga
          </h2>
          <p className="mt-3 text-stone-400 text-sm">
            Bayar sekali. Tidak ada tagihan bulanan. Tidak ada biaya kejutan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">

          {/* Paket */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-stone-900 rounded-3xl p-7 text-white relative overflow-hidden"
          >
            {/* Subtle warm glow */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(184,152,110,0.12) 0%, transparent 65%)' }} />

            <div className="absolute top-5 right-5 text-[10px] font-semibold text-stone-400 border border-stone-700 px-2.5 py-1 rounded-full">
              s/d {PROMO_END}
            </div>

            <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-2 relative z-10">Paket Premium</p>
            <div className="flex items-end gap-2 mb-1 relative z-10">
              <span className="text-4xl font-bold">{PRICE_FORMATTED}</span>
              <span className="text-stone-500 text-sm mb-1">sekali bayar</span>
            </div>
            <p className="text-stone-600 text-xs mb-7 relative z-10">Aktif 6 bulan sejak tanggal pembelian</p>

            <ul className="space-y-3.5 mb-7 relative z-10">
              {features.map((f) => {
                const Icon = f.icon
                return (
                  <li key={f.text} className="flex items-start gap-3">
                    <div className="shrink-0 mt-0.5 w-6 h-6 rounded-lg bg-stone-800 flex items-center justify-center">
                      <Icon size={12} className="text-stone-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white leading-snug">{f.text}</p>
                      <p className="text-xs text-stone-500 mt-0.5">{f.sub}</p>
                    </div>
                  </li>
                )
              })}
            </ul>

            <div className="relative z-10">
              <Link href="/templates">
                <button className="w-full bg-white text-stone-900 font-semibold py-3.5 rounded-xl text-sm transition-all hover:bg-stone-100">
                  Buat Undangan Kami Sekarang →
                </button>
              </Link>
              <p className="text-xs text-stone-600 mt-2.5 text-center">
                Coba dulu gratis, bayar hanya kalau sudah cocok
              </p>
            </div>
          </motion.div>

          {/* Jaminan */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-4"
          >
            {guarantees.map((g) => {
              const Icon = g.icon
              return (
                <div key={g.title} className="bg-white rounded-2xl p-5 border border-stone-100 flex gap-4">
                  <div className="shrink-0 w-9 h-9 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center">
                    <Icon size={16} className="text-stone-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">{g.title}</p>
                    <p className="text-xs text-stone-400 mt-1 leading-relaxed">{g.desc}</p>
                  </div>
                </div>
              )
            })}

            <div className="rounded-2xl p-5 border border-dashed border-stone-200 bg-white">
              <p className="text-xs font-semibold text-stone-300 uppercase tracking-widest mb-2">Segera Hadir</p>
              <p className="text-sm font-semibold text-stone-400">Paket Pro</p>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Lebih banyak pilihan gaya, masa aktif lebih panjang, dan fitur eksklusif lainnya sedang kami siapkan.
              </p>
            </div>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-stone-400 mt-8"
        >
          Ada pertanyaan?{' '}
          <Link href="#faq" className="text-stone-600 hover:underline font-medium">Lihat FAQ</Link>
          {' '}atau{' '}
          <a href="https://wa.me/628123456789" className="text-stone-600 hover:underline font-medium">chat kami di WhatsApp</a>.
        </motion.p>
      </div>
    </section>
  )
}
