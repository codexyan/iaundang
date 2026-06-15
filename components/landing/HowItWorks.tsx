'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, CreditCard, Send, Check } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const

const defaultSteps = [
  { title: 'Coba dulu, gratis', description: 'Masukkan nama kalian berdua dan pilih gaya yang paling cocok. Lihat sendiri hasilnya, tidak perlu daftar, tidak perlu bayar dulu.' },
  { title: 'Bayar sekali, selesai', description: 'Sudah cocok? Daftar akun, tentukan nama link undangan kalian, dan pilih paket mulai Rp 79.000. Sekali bayar, langsung aktif.' },
  { title: 'Isi detail & bagikan', description: 'Lengkapi info acara, upload foto pasangan, pilih musik. Selesai! Salin link dan kirim ke tamu lewat WhatsApp.' },
]

const ICONS = [Eye, CreditCard, Send]
const HIGHLIGHTS = ['Bebas, tanpa komitmen', 'Tidak ada tagihan lagi', 'Siap dalam < 30 menit']
const STEP_COLORS = ['#2c4a34', '#c9a961', '#4a6355']

export default function HowItWorks({ steps: propSteps }: { steps?: { title: string; description: string }[] }) {
  const steps = (propSteps ?? defaultSteps).map((s, i) => ({
    number: String(i + 1).padStart(2, '0'),
    icon: ICONS[i] ?? Send,
    title: s.title,
    desc: s.description,
    highlight: HIGHLIGHTS[i] ?? '',
    color: STEP_COLORS[i] ?? '#2c4a34',
  }))

  return (
    <section id="cara-kerja" className="py-20 sm:py-28 lg:py-32 bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-forest-600 bg-forest-50/80 border border-forest-100 px-3.5 py-1.5 rounded-full mb-5">
            Cara Kerja
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Serius, semudah itu
          </h2>
          <p className="mt-3 text-stone-400 text-[15px]">
            Tiga langkah. Tidak perlu keahlian apapun.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Horizontal connector (desktop) */}
          <motion.div
            className="hidden md:block absolute top-[56px] left-[calc(16.7%+28px)] right-[calc(16.7%+28px)] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #e7e5e4 15%, #e7e5e4 85%, transparent)' }}
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.55, delay: i * 0.12, ease: EASE }}
                className="relative flex md:flex-col gap-5 md:gap-0"
              >
                {/* Vertical connector (mobile) */}
                {i < steps.length - 1 && (
                  <div className="absolute left-6 top-14 bottom-[-32px] w-px bg-stone-100 md:hidden" />
                )}

                {/* Icon */}
                <div className="relative z-10 shrink-0">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${step.color}, ${step.color}cc)`,
                      boxShadow: `0 8px 24px -4px ${step.color}30`,
                    }}
                  >
                    <step.icon size={22} className="text-white" />
                  </div>
                  <span
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-white text-[9px] font-bold flex items-center justify-center shadow-sm ring-1 ring-stone-100"
                    style={{ color: step.color }}
                  >
                    {i + 1}
                  </span>
                </div>

                <div className="md:mt-6">
                  <p className="text-[10px] font-semibold tracking-[0.2em] text-stone-300 uppercase mb-2">{step.number}</p>
                  <h3 className="font-semibold text-stone-900 text-base mb-2 leading-snug">{step.title}</h3>
                  <p className="text-[13px] text-stone-400 leading-relaxed mb-4">{step.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-forest-600 bg-forest-50 px-3 py-1.5 rounded-full">
                    <Check size={12} strokeWidth={3} />
                    {step.highlight}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 flex flex-col items-center gap-3"
        >
          <Link href="/templates">
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-forest-500 text-white font-semibold px-7 py-3.5 rounded-xl text-[14px] shadow-lg shadow-forest-500/15 hover:shadow-xl hover:shadow-forest-500/20 transition-shadow"
            >
              Mulai pilih gaya undangan
            </motion.span>
          </Link>
          <p className="text-[12px] text-stone-400">Tidak perlu daftar dulu. Tidak perlu bayar dulu.</p>
        </motion.div>

      </div>
    </section>
  )
}
