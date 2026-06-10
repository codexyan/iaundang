'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react'
import { PRICING_CONFIG } from '@/lib/pricing-config'

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
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`relative rounded-2xl h-full flex flex-col overflow-hidden ${
        isDark
          ? 'bg-stone-900 text-white ring-2 ring-forest-500/30'
          : isGold
            ? 'bg-gradient-to-b from-amber-50 to-white border-2 border-amber-200'
            : 'bg-white border border-stone-200'
      }`}
    >
      {popular && (
        <div className="absolute top-0 inset-x-0 h-1 bg-forest-500" />
      )}

      {/* Header */}
      <div className={`px-5 pt-5 pb-4 ${isDark ? 'border-b border-white/10' : 'border-b border-stone-100'}`}>
        <span
          className={`inline-block text-[10px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-full mb-3 ${
            isDark
              ? 'bg-forest-500 text-white'
              : isGold
                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                : 'bg-stone-100 text-stone-500'
          }`}
        >
          {badge}
        </span>

        <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-white/70' : 'text-stone-500'}`}>{name}</p>

        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-stone-900'}`}>
            {price}
          </span>
          {originalPrice && (
            <span className="text-sm text-stone-400 line-through">{originalPrice}</span>
          )}
        </div>
        <p className={`text-xs mt-1.5 ${isDark ? 'text-white/40' : 'text-stone-400'}`}>
          sekali bayar · aktif {duration}
        </p>
      </div>

      {/* Features */}
      <div className="px-5 py-4 flex-1">
        <ul className="space-y-2">
          {features.map((feature) => {
            const isHL = feature === highlightedFeature
            return (
              <li
                key={feature}
                className={`flex items-start gap-2.5 ${
                  isHL
                    ? `rounded-lg px-2.5 py-1.5 -mx-2.5 ${isDark ? 'bg-forest-500/15' : 'bg-amber-50'}`
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
                    : isDark ? 'text-white/70' : 'text-stone-600'
                }`}>
                  {feature}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* CTA */}
      <div className="px-5 pb-5">
        <Link href="/templates">
          <button className={`w-full font-semibold py-3 rounded-xl text-[13px] transition-all flex items-center justify-center gap-1.5 ${
            isDark
              ? 'bg-forest-500 text-white hover:bg-forest-600'
              : isGold
                ? 'bg-stone-900 text-white hover:bg-stone-800'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}>
            {ctaLabel}
            <ArrowRight size={14} />
          </button>
        </Link>
        <p className={`text-[11px] mt-2 text-center ${isDark ? 'text-white/35' : 'text-stone-400'}`}>
          {ctaHint}
        </p>
      </div>
    </motion.div>
  )
}

export default function Pricing() {
  return (
    <section id="harga" className="py-14 sm:py-20 lg:py-24 bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">

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
            Pilih paket yang pas untuk kalian
          </h2>
          <p className="mt-3 text-stone-400 text-sm max-w-md mx-auto">
            Bayar sekali saja, tidak ada biaya bulanan. Coba gratis dulu sebelum memutuskan.
          </p>
        </motion.div>

        {/* 3 Pricing Cards */}
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
            delay={0.1}
          />

          <PricingCard
            name="Paket Pro"
            badge={PRICING_CONFIG.pro.badge}
            price={PRICING_CONFIG.pro.priceFormatted}
            duration={PRICING_CONFIG.pro.durationLabel}
            features={PRICING_CONFIG.pro.features}
            highlightedFeature={PRICING_CONFIG.pro.highlightedFeature}
            ctaLabel="Pilih Pro"
            ctaHint="Untuk acara besar & eksklusif"
            variant="gold"
            delay={0.2}
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
