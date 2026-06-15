'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Users, Star, Zap, Shield } from 'lucide-react'

const defaultStats = [
  { value: '500+', label: 'Pasangan memilih kami' },
  { value: '4.9', label: 'Rating pengguna' },
  { value: '< 5 mnt', label: 'Waktu setup' },
  { value: '6 bln', label: 'Masa aktif' },
]

const ICONS = [Users, Star, Zap, Shield]
const COLORS = ['#2c4a34', '#c9a961', '#4a6355', '#8fa99a']

export default function TrustBar({ items }: { items?: { value: string; label: string }[] }) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })
  const stats = (items ?? defaultStats).map((s, i) => ({
    ...s,
    icon: ICONS[i] ?? Shield,
    color: COLORS[i] ?? '#2c4a34',
  }))

  return (
    <section ref={ref} className="relative py-6 sm:py-0 bg-white">
      <div className="max-w-5xl mx-auto px-5 sm:px-8">
        <div className="relative bg-white rounded-2xl sm:rounded-3xl border border-stone-100 shadow-[0_2px_24px_-4px_rgba(0,0,0,0.06)] sm:-mt-10 z-20">
          <div className="grid grid-cols-2 sm:grid-cols-4">
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className={`flex flex-col items-center justify-center py-6 sm:py-7 px-4 gap-2 ${
                    i < stats.length - 1 ? 'border-r border-stone-100' : ''
                  } ${i < 2 ? 'sm:border-r border-b sm:border-b-0 border-stone-100' : ''}`}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center mb-0.5"
                    style={{ backgroundColor: `${s.color}08` }}
                  >
                    <Icon size={15} style={{ color: s.color }} />
                  </div>
                  <span className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                    {s.value}
                  </span>
                  <span className="text-[11px] text-stone-400 font-medium text-center leading-tight">
                    {s.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
