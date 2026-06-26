'use client'

import { motion } from 'framer-motion'
import { Sparkles, Shield, Eye, Palette, Headphones, Globe } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const

interface Review {
  names: string
  date: string
  template: string
  quote: string
  initial: string
  color: string
}

const VALUE_PROPS = [
  {
    icon: Eye,
    title: 'Coba Dulu, Bayar Kalau Suka',
    desc: 'Preview undangan dengan nama pasangan kalian sendiri, gratis, tanpa registrasi. Bayar hanya saat sudah puas.',
    color: '#2c4a34',
  },
  {
    icon: Palette,
    title: 'Desain Premium, Harga Terjangkau',
    desc: 'Template dirancang oleh desainer profesional. Animasi halus, tipografi elegan, dan detail yang membuat tamu terkesan.',
    color: '#c9a961',
  },
  {
    icon: Sparkles,
    title: 'Personal untuk Setiap Tamu',
    desc: 'Nama tamu muncul otomatis di halaman pembuka. Bukan broadcast massal, tapi undangan yang terasa spesial.',
    color: '#4a6355',
  },
  {
    icon: Shield,
    title: 'Sekali Bayar, Tanpa Kejutan',
    desc: 'Tidak ada biaya bulanan, tidak ada upsell tersembunyi. Satu harga transparan untuk seluruh masa aktif.',
    color: '#8fa99a',
  },
  {
    icon: Headphones,
    title: 'Support Cepat via WhatsApp',
    desc: 'Tim kami siap membantu jika ada kendala. Balas di hari kerja, langsung ke orang, bukan chatbot.',
    color: '#5d7a6a',
  },
  {
    icon: Globe,
    title: 'Buka di Semua Perangkat',
    desc: 'Undangan tampil sempurna di HP, tablet, dan laptop. Tamu cukup tap link, tanpa install apapun.',
    color: '#b8954d',
  },
]

export default function Testimonials({ reviews: _propReviews }: { reviews?: Review[] }) {
  return (
    <section id="testimoni" className="py-20 sm:py-28 lg:py-32 bg-[#fafaf9] overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-14 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-forest-600 bg-forest-50/80 border border-forest-100 px-3.5 py-1.5 rounded-full mb-5">
            Kenapa iaundang
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-stone-900">
            Dibangun untuk hari spesial kalian
          </h2>
          <p className="mt-3 text-stone-400 text-[15px] max-w-md mx-auto">
            Kami membangun iaundang dengan satu tujuan: membuat undangan digital yang benar-benar elegan dan personal.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {VALUE_PROPS.map((item, i) => {
            const Icon = item.icon
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.55, delay: i * 0.06, ease: EASE }}
                className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-stone-100 hover:border-stone-200/80 transition-all duration-300 hover:shadow-xl hover:shadow-stone-100/80"
              >
                <div
                  className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `linear-gradient(90deg, transparent, ${item.color}40, transparent)` }}
                />

                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 shadow-sm"
                  style={{ background: `linear-gradient(135deg, ${item.color}15, ${item.color}08)`, border: `1px solid ${item.color}15` }}
                >
                  <Icon size={18} style={{ color: item.color }} />
                </div>

                <h3 className="text-[15px] font-semibold text-stone-900 mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-[13px] text-stone-500 leading-[1.7]">
                  {item.desc}
                </p>
              </motion.div>
            )
          })}
        </div>

      </div>
    </section>
  )
}
