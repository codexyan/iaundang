'use client'

import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { Shield, Clock, CreditCard, Smartphone } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const

const defaultItems = [
  { icon: Shield, value: 'Gratis Preview', label: 'Coba sebelum bayar' },
  { icon: Clock, value: '< 5 menit', label: 'Setup cepat' },
  { icon: CreditCard, value: 'Sekali Bayar', label: 'Tanpa langganan' },
  { icon: Smartphone, value: 'Tanpa Install', label: 'Buka di browser' },
]

export default function TrustBar({ items }: { items?: { value: string; label: string }[] }) {
  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.5 })

  const stats = items
    ? items.map((item, i) => ({ ...item, icon: defaultItems[i]?.icon ?? Shield }))
    : defaultItems

  return (
    <section ref={ref} className="relative bg-chalk pt-6 pb-2 sm:pt-0 sm:pb-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: EASE }}
          className="relative sm:-mt-8 z-20 bg-chalk rounded-2xl border border-hairline"
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-0">
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div
                  key={s.label ?? i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.07, ease: EASE }}
                  className={`flex flex-col items-center text-center px-4 py-5 sm:py-6 ${
                    i < stats.length - 1 ? 'border-r border-mist sm:border-hairline' : ''
                  } ${i === 1 ? 'max-sm:border-r-0' : ''} ${i >= 2 ? 'max-sm:border-t max-sm:border-mist' : ''}`}
                >
                  <div className="w-9 h-9 rounded-xl bg-mist flex items-center justify-center mb-2.5">
                    <Icon size={16} className="text-graphite" />
                  </div>
                  <span className="font-semibold text-sm sm:text-[15px] text-graphite leading-none">
                    {s.value}
                  </span>
                  <span className="text-[10px] sm:text-[11px] text-ash font-medium mt-1.5">
                    {s.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
