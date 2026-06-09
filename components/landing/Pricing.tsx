'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react'
import { PRICING_CONFIG } from '@/lib/pricing-config'

function PricingCard({
  name,
  badge,
  badgeStyle,
  price,
  duration,
  features,
  highlightedFeature,
  ctaLabel,
  ctaHint,
  variant,
  delay = 0,
}: {
  name: string
  badge: string
  badgeStyle: 'dark' | 'gold'
  price: string
  duration: string
  features: readonly string[]
  highlightedFeature?: string
  ctaLabel: string
  ctaHint: string
  variant: 'dark' | 'outline'
  delay?: number
}) {
  const isDark = variant === 'dark'

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-2xl h-full flex flex-col ${
        isDark
          ? 'bg-stone-900 text-white'
          : 'bg-white border border-stone-200'
      }`}
    >
      {/* Header */}
      <div className="px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-stone-200/10">
        <span
          className={`inline-block text-[10px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-full mb-3 ${
            badgeStyle === 'dark'
              ? 'bg-white/10 text-white/80 border border-white/15'
              : 'bg-gold-500 text-white'
          }`}
        >
          {badge}
        </span>

        <div className="flex items-baseline gap-1.5">
          <span className={`text-2xl sm:text-[28px] font-bold tracking-tight ${
            isDark ? 'text-white' : 'text-stone-900'
          }`}>
            {price}
          </span>
        </div>
        <p className={`text-xs mt-1 ${isDark ? 'text-white/50' : 'text-stone-400'}`}>
          sekali bayar · aktif {duration}
        </p>
      </div>

      {/* Features */}
      <div className="px-5 sm:px-6 py-4 flex-1">
        <ul className="space-y-2.5">
          {features.map((feature) => {
            const isHL = feature === highlightedFeature
            return (
              <li
                key={feature}
                className={`flex items-start gap-2.5 ${
                  isHL ? 'bg-gold-500/10 rounded-lg px-2.5 py-1.5 -mx-2.5' : ''
                }`}
              >
                <div className={`shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-white/10' : 'bg-forest-500/10'
                }`}>
                  <Check
                    size={10}
                    strokeWidth={3}
                    className={isDark ? 'text-white/80' : 'text-forest-500'}
                  />
                </div>
                <span className={`text-[13px] leading-snug ${
                  isHL
                    ? 'font-semibold ' + (isDark ? 'text-gold-400' : 'text-stone-900')
                    : isDark ? 'text-white/75' : 'text-stone-600'
                }`}>
                  {feature}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-5 sm:px-6 pb-5 sm:pb-6">
        <Link href="/templates">
          <button className={`w-full font-semibold py-3 px-5 rounded-xl text-[13px] transition-all flex items-center justify-center gap-1.5 ${
            isDark
              ? 'bg-white text-stone-900 hover:bg-stone-100 shadow-sm'
              : 'bg-forest-500 text-white hover:bg-forest-600 shadow-sm'
          }`}>
            {ctaLabel}
            <ArrowRight size={14} />
          </button>
        </Link>
        <p className={`text-[11px] mt-2.5 text-center ${
          isDark ? 'text-white/40' : 'text-stone-400'
        }`}>
          {ctaHint}
        </p>
      </div>
    </motion.div>
  )
}

export default function Pricing() {
  return (
    <section id="harga" className="py-14 sm:py-20 lg:py-24 bg-stone-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10 sm:mb-14"
        >
          <p className="text-xs font-semibold tracking-[.18em] uppercase text-forest-400 mb-3">Harga</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Satu harga, tanpa kejutan
          </h2>
          <p className="mt-3 text-stone-400 text-sm max-w-sm mx-auto">
            Bayar sekali, tidak ada tagihan bulanan. Coba gratis dulu sebelum memutuskan.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 max-w-3xl mx-auto">

          <PricingCard
            name="Premium"
            badge={PRICING_CONFIG.premium.badge}
            badgeStyle="dark"
            price={PRICING_CONFIG.premium.priceFormatted}
            duration={PRICING_CONFIG.premium.durationLabel}
            features={PRICING_CONFIG.premium.features}
            ctaLabel="Pilih Premium"
            ctaHint="Coba dulu gratis, bayar kalau cocok"
            variant="dark"
            delay={0}
          />

          <PricingCard
            name="Pro"
            badge={PRICING_CONFIG.pro.badge}
            badgeStyle="gold"
            price={PRICING_CONFIG.pro.priceFormatted}
            duration={PRICING_CONFIG.pro.durationLabel}
            features={PRICING_CONFIG.pro.features}
            highlightedFeature={PRICING_CONFIG.pro.highlightedFeature}
            ctaLabel="Pilih Pro"
            ctaHint="Ideal untuk pernikahan dengan tamu besar"
            variant="outline"
            delay={0.1}
          />

        </div>

        {/* Trust Signals */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 border border-stone-100">
            <div className="shrink-0 w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center">
              <ShieldCheck size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-stone-800 leading-snug">
                Lihat hasilnya dulu, bayar kalau suka
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">Tanpa risiko, tanpa komitmen</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 border border-stone-100">
            <div className="shrink-0 w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
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

        {/* Bottom link */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="mt-8 text-center text-sm text-stone-400"
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
