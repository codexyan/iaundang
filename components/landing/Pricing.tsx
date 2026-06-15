'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react'
import { PRICING_CONFIG } from '@/lib/pricing-config'

const EASE = [0.16, 1, 0.3, 1] as const

type CardVariant = 'light' | 'dark' | 'gold'

function PricingCard({
  name,
  badge,
  price,
  originalPrice,
  duration,
  features,
  highlightedFeature,
  ctaLabel,
  ctaHint,
  variant,
  popular,
  delay = 0,
}: {
  name: string
  badge: string
  price: string
  originalPrice?: string
  duration: string
  features: readonly string[]
  highlightedFeature?: string
  ctaLabel: string
  ctaHint: string
  variant: CardVariant
  popular?: boolean
  delay?: number
}) {
  const isDark = variant === 'dark'
  const isGold = variant === 'gold'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: EASE }}
      className={`relative rounded-2xl h-full flex flex-col overflow-hidden transition-all duration-300 ${
        isDark
          ? 'bg-stone-900 text-white shadow-2xl shadow-stone-900/20 ring-1 ring-white/10'
          : isGold
            ? 'bg-gradient-to-b from-amber-50/80 to-white border border-amber-200/60 hover:border-amber-300/80 hover:shadow-xl hover:shadow-amber-100/50'
            : 'bg-white border border-stone-200/60 hover:border-stone-300 hover:shadow-xl hover:shadow-stone-100/60'
      }`}
    >
      {popular && (
        <div className="absolute top-0 inset-x-0 h-0.5"
          style={{ background: 'linear-gradient(90deg, #2c4a34, #4a6355, #c9a961)' }} />
      )}

      {/* Header */}
      <div className={`px-6 pt-6 pb-5 ${isDark ? 'border-b border-white/8' : 'border-b border-stone-100'}`}>
        <span
          className={`inline-block text-[10px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-lg mb-4 ${
            isDark
              ? 'bg-forest-500/20 text-forest-400'
              : isGold
                ? 'bg-amber-100/80 text-amber-700'
                : 'bg-stone-100 text-stone-500'
          }`}
        >
          {badge}
        </span>

        <p className={`text-[13px] font-medium mb-2 ${isDark ? 'text-white/60' : 'text-stone-500'}`}>{name}</p>

        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
            {price}
          </span>
          {originalPrice && (
            <span className="text-sm text-stone-400 line-through">{originalPrice}</span>
          )}
        </div>
        <p className={`text-[12px] mt-2 ${isDark ? 'text-white/35' : 'text-stone-400'}`}>
          sekali bayar · aktif {duration}
        </p>
      </div>

      {/* Features */}
      <div className="px-6 py-5 flex-1">
        <ul className="space-y-2.5">
          {features.map((feature) => {
            const isHL = feature === highlightedFeature
            return (
              <li
                key={feature}
                className={`flex items-start gap-2.5 ${
                  isHL
                    ? `rounded-lg px-2.5 py-1.5 -mx-2.5 ${isDark ? 'bg-forest-500/10' : 'bg-amber-50/80'}`
                    : ''
                }`}
              >
                <div className={`shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-forest-500/20' : 'bg-forest-500/10'
                }`}>
                  <Check size={10} strokeWidth={3} className={isDark ? 'text-forest-400' : 'text-forest-500'} />
                </div>
                <span className={`text-[13px] leading-snug ${
                  isHL
                    ? `font-semibold ${isDark ? 'text-forest-300' : 'text-amber-700'}`
                    : isDark ? 'text-white/65' : 'text-stone-600'
                }`}>
                  {feature}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-6 pb-6">
        <Link href="/templates">
          <motion.span
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full font-semibold py-3 rounded-xl text-[13px] transition-all flex items-center justify-center gap-1.5 ${
              isDark
                ? 'bg-white text-stone-900 hover:bg-stone-50 shadow-lg'
                : isGold
                  ? 'bg-stone-900 text-white hover:bg-stone-800 shadow-lg shadow-stone-900/10'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            {ctaLabel}
            <ArrowRight size={14} />
          </motion.span>
        </Link>
        <p className={`text-[11px] mt-2.5 text-center ${isDark ? 'text-white/30' : 'text-stone-400'}`}>
          {ctaHint}
        </p>
      </div>
    </motion.div>
  )
}

export default function Pricing() {
  return (
    <section id="harga" className="py-20 sm:py-28 lg:py-32 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-forest-600 bg-forest-50/80 border border-forest-100 px-3.5 py-1.5 rounded-full mb-5">
            Harga
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Pilih paket yang pas untuk kalian
          </h2>
          <p className="mt-3 text-stone-400 text-[15px] max-w-md mx-auto">
            Bayar sekali saja, tidak ada biaya bulanan. Coba gratis dulu sebelum memutuskan.
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto items-stretch">
          <PricingCard
            name="Paket Starter"
            badge={PRICING_CONFIG.starter.badge}
            price={PRICING_CONFIG.starter.priceFormatted}
            duration={PRICING_CONFIG.starter.durationLabel}
            features={PRICING_CONFIG.starter.features}
            ctaLabel="Mulai Gratis"
            ctaHint="Coba dulu, bayar kalau cocok"
            variant="light"
            delay={0}
          />
          <PricingCard
            name="Paket Premium"
            badge={PRICING_CONFIG.premium.badge}
            price={PRICING_CONFIG.premium.priceFormatted}
            duration={PRICING_CONFIG.premium.durationLabel}
            features={PRICING_CONFIG.premium.features}
            highlightedFeature={PRICING_CONFIG.premium.highlightedFeature}
            ctaLabel="Pilih Premium"
            ctaHint="Pilihan terpopuler pasangan"
            variant="dark"
            popular
            delay={0.08}
          />
          <PricingCard
            name="Paket Exclusive"
            badge={PRICING_CONFIG.exclusive.badge}
            price={PRICING_CONFIG.exclusive.priceFormatted}
            duration={PRICING_CONFIG.exclusive.durationLabel}
            features={PRICING_CONFIG.exclusive.features}
            highlightedFeature={PRICING_CONFIG.exclusive.highlightedFeature}
            ctaLabel="Pilih Exclusive"
            ctaHint="Untuk acara besar & eksklusif"
            variant="gold"
            delay={0.16}
          />
        </div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3.5 bg-[#fafaf9] rounded-xl px-5 py-4 border border-stone-100">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ShieldCheck size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-stone-800 leading-snug">
                Lihat hasilnya dulu, bayar kalau suka
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">Tanpa risiko, tanpa komitmen</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 bg-[#fafaf9] rounded-xl px-5 py-4 border border-stone-100">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
              <MessageCircle size={18} className="text-blue-600" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-stone-800 leading-snug">
                Tim kami siap membantu via WhatsApp
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">Balas dalam 1 hari kerja</p>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 text-center text-[13px] text-stone-400"
        >
          Ada pertanyaan?{' '}
          <Link href="/#faq" className="font-medium text-stone-600 hover:text-stone-900 underline underline-offset-2 transition-colors">
            Lihat FAQ
          </Link>
        </motion.p>

      </div>
    </section>
  )
}
