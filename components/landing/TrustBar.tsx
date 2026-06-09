'use client'

import { motion } from 'framer-motion'
import { Users, Star, Zap, Shield } from 'lucide-react'

const stats = [
  { value: '500+', label: 'Pasangan dipercaya', icon: Users },
  { value: '4.9', label: 'Rating rata-rata', icon: Star, star: true },
  { value: '< 5 mnt', label: 'Rata-rata setup', icon: Zap },
  { value: '6 bln', label: 'Masa aktif undangan', icon: Shield },
]

export default function TrustBar() {
  return (
    <section className="bg-forest-500/[0.03] border-y border-forest-100/50">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-forest-100/40">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center justify-center py-6 sm:py-7 px-4 gap-1"
            >
              <div className="flex items-center gap-1.5">
                <s.icon size={14} className="text-forest-400 hidden sm:block" />
                <span className="font-serif text-2xl font-bold text-stone-900">{s.value}</span>
                {s.star && (
                  <svg className="w-4 h-4 fill-gold-500 text-gold-500 mb-0.5" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
              </div>
              <span className="text-[11px] text-stone-400 font-medium text-center leading-tight">{s.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
