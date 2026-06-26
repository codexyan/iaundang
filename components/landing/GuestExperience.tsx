'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Music2, MapPin, CheckCircle2, Heart } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

const steps = [
  {
    icon: Music2,
    title: 'Sambutan musik otomatis',
    desc: 'Begitu undangan dibuka, lagu pilihan kalian langsung mengalun. Kesan pertama yang terasa personal.',
    color: '#2c4a34',
  },
  {
    icon: MapPin,
    title: 'Lokasi satu ketukan',
    desc: 'Tamu tap sekali, Google Maps terbuka dan langsung mengarahkan ke lokasi acara.',
    color: '#c9a961',
  },
  {
    icon: CheckCircle2,
    title: 'RSVP cepat & mudah',
    desc: 'Isi nama, pilih hadir atau tidak. Selesai dalam 10 detik. Kalian langsung tahu siapa yang datang.',
    color: '#4a6355',
  },
  {
    icon: Heart,
    title: 'Ucapan & doa digital',
    desc: 'Setiap pesan dari tamu tersimpan rapi dan bisa kalian baca ulang kapan saja.',
    color: '#8fa99a',
  },
]

export default function GuestExperience() {
  return (
    <section className="py-20 sm:py-28 lg:py-32 bg-[#f9f7f4]">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-14"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-forest-600 bg-forest-50/80 border border-forest-100 px-3.5 py-1.5 rounded-full mb-5">
            Pengalaman Tamu
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-stone-900">
            Pengalaman tamu yang berkesan
          </h2>
          <p className="mt-3 text-stone-400 text-[15px] max-w-md mx-auto">
            Bukan sekadar info acara. Ini pengalaman interaktif yang tamu nikmati langsung di browser.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 mb-12">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
                className="group bg-white rounded-2xl p-6 sm:p-7 border border-stone-100 hover:border-stone-200 hover:shadow-lg hover:shadow-stone-100/60 transition-all duration-300"
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${step.color}10`, border: `1px solid ${step.color}15` }}
                >
                  <Icon className="w-5 h-5" strokeWidth={1.5} style={{ color: step.color }} />
                </div>
                <h3 className="font-semibold text-stone-800 text-[15px] mb-2 leading-snug">{step.title}</h3>
                <p className="text-[13px] text-stone-500 leading-relaxed">{step.desc}</p>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center"
        >
          <p className="text-[14px] text-stone-400 mb-5">
            Semua ini terjadi dalam hitungan detik.{' '}
            <span className="text-stone-700 font-medium">tamu tidak perlu install apapun.</span>
          </p>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 bg-forest-500 hover:bg-forest-600 text-white text-[14px] font-semibold px-7 py-3.5 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-forest-200"
          >
            Buat undangan seperti ini
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
