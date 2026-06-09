'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, CreditCard, Send, Check } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Eye,
    title: 'Coba dulu, gratis',
    desc: 'Masukkan nama kalian berdua dan pilih gaya yang paling cocok. Lihat sendiri hasilnya, tidak perlu daftar, tidak perlu bayar dulu.',
    highlight: 'Bebas, tanpa komitmen',
  },
  {
    number: '02',
    icon: CreditCard,
    title: 'Bayar sekali, selesai',
    desc: 'Sudah cocok? Daftar akun, tentukan nama link undangan kalian, dan bayar Rp 149.000. Satu kali bayar untuk 6 bulan penuh.',
    highlight: 'Tidak ada tagihan lagi',
  },
  {
    number: '03',
    icon: Send,
    title: 'Isi detail & bagikan',
    desc: 'Lengkapi info acara, upload foto pasangan, pilih musik. Selesai! Salin link dan kirim ke tamu lewat WhatsApp.',
    highlight: 'Siap dalam < 30 menit',
  },
]

export default function HowItWorks() {
  return (
    <section id="cara-kerja" className="py-14 sm:py-20 lg:py-28 bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <p className="text-xs font-semibold tracking-[.18em] uppercase text-forest-400 mb-3">Caranya</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Serius, semudah itu
          </h2>
          <p className="mt-3 text-stone-400 text-sm">
            Tiga langkah. Tidak perlu keahlian apapun.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Vertical line connector (mobile) */}
          <div className="absolute left-6 top-10 bottom-10 w-px bg-forest-100 md:hidden" />

          {/* Horizontal connector (desktop) */}
          <motion.div
            className="hidden md:block absolute top-[52px] left-[calc(16.7%+24px)] right-[calc(16.7%+24px)] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #d1e4d9 20%, #d1e4d9 80%, transparent)' }}
            initial={{ scaleX: 0, originX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.3 }}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.55, delay: i * 0.14, ease: [0.22, 1, 0.36, 1] }}
                className="relative flex md:flex-col gap-5 md:gap-0"
              >
                {/* Icon bubble */}
                <div className="relative z-10 shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-forest-500 flex items-center justify-center shadow-lg shadow-forest-200">
                    <step.icon size={22} className="text-white" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white border-2 border-forest-100 text-[9px] font-bold text-forest-500 flex items-center justify-center">
                    {i + 1}
                  </span>
                </div>

                <div className="md:mt-6">
                  <p className="text-[10px] font-semibold tracking-widest text-stone-300 uppercase mb-1.5">{step.number}</p>
                  <h3 className="font-semibold text-stone-900 text-[15px] mb-2 leading-snug">{step.title}</h3>
                  <p className="text-[13px] text-stone-400 leading-relaxed mb-3">{step.desc}</p>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-forest-600 bg-forest-50 px-2.5 py-1 rounded-full">
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
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-14 flex flex-col items-center gap-2"
        >
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 bg-forest-500 hover:bg-forest-600 text-white font-semibold px-8 py-3.5 rounded-2xl text-sm transition-all hover:shadow-lg hover:shadow-forest-200 hover:-translate-y-0.5"
          >
            Mulai pilih gaya undangan
          </Link>
          <p className="text-xs text-stone-300">Tidak perlu daftar dulu. Tidak perlu bayar dulu.</p>
        </motion.div>

      </div>
    </section>
  )
}
