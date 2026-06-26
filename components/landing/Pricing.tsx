'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Check, ArrowRight, ShieldCheck, MessageCircle } from 'lucide-react'
import { PRICING_CONFIG } from '@/lib/pricing-config'
import type { PriceTier, FlashSale } from '@/lib/types'

const EASE = [0.16, 1, 0.3, 1] as const

type CardVariant = 'light' | 'dark' | 'gold'

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function getActiveFlashSale(tierId: string, flashSales: FlashSale[]): FlashSale | null {
  const now = new Date()
  return flashSales.find(s =>
    s.is_active &&
    new Date(s.start_date) <= now &&
    new Date(s.end_date) >= now &&
    (s.scope === 'all' || (s.scope === 'tier' && s.scope_ids.includes(tierId)))
  ) ?? null
}

function calcDiscountedPrice(price: number, sale: FlashSale): number {
  if (sale.discount_type === 'percentage') return Math.round(price * (1 - sale.discount_value / 100))
  return Math.max(0, price - sale.discount_value)
}

function PricingCard({
  name, badge, price, originalPrice, discountLabel, duration, features, highlightedFeature,
  ctaLabel, ctaHint, variant, popular, delay = 0,
}: {
  name: string; badge: string; price: string; originalPrice?: string; discountLabel?: string
  duration: string; features: readonly string[]; highlightedFeature?: string
  ctaLabel: string; ctaHint: string; variant: CardVariant
  popular?: boolean; delay?: number
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
          ? 'bg-graphite text-white ring-1 ring-white/10'
          : isGold
            ? 'bg-mist border border-hairline hover:border-smoke'
            : 'bg-chalk border border-hairline hover:border-smoke'
      }`}
    >
      {popular && (
        <div className="absolute top-0 inset-x-0 h-px bg-graphite" />
      )}

      {discountLabel && (
        <div className={`absolute top-3 right-3 text-[9px] font-bold px-2 py-1 rounded-lg ${
          isDark ? 'bg-chalk text-graphite' : 'bg-graphite text-chalk'
        }`}>
          {discountLabel}
        </div>
      )}

      <div className={`px-6 pt-6 pb-5 ${isDark ? 'border-b border-white/8' : 'border-b border-hairline'}`}>
        <span className={`inline-block text-[10px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 rounded-lg mb-4 ${
          isDark ? 'bg-chalk/10 text-chalk/70'
            : isGold ? 'bg-hairline text-graphite'
              : 'bg-mist text-concrete'
        }`}>
          {badge}
        </span>
        <p className={`text-[13px] font-medium mb-2 ${isDark ? 'text-white/60' : 'text-concrete'}`}>{name}</p>
        <div className="flex items-baseline gap-2">
          <span className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-graphite'}`}>{price}</span>
          {originalPrice && (
            <span className={`text-sm line-through ${isDark ? 'text-white/30' : 'text-ash'}`}>{originalPrice}</span>
          )}
        </div>
        <p className={`text-[12px] mt-2 ${isDark ? 'text-white/35' : 'text-ash'}`}>
          sekali bayar · aktif {duration}
        </p>
      </div>

      <div className="px-6 py-5 flex-1">
        <ul className="space-y-2.5">
          {features.map((feature) => {
            const isHL = feature === highlightedFeature
            return (
              <li key={feature} className={`flex items-start gap-2.5 ${
                isHL ? `rounded-lg px-2.5 py-1.5 -mx-2.5 ${isDark ? 'bg-chalk/[0.06]' : 'bg-mist'}` : ''
              }`}>
                <div className={`shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-chalk/10' : 'bg-mist'
                }`}>
                  <Check size={10} strokeWidth={3} className={isDark ? 'text-chalk/70' : 'text-graphite'} />
                </div>
                <span className={`text-[13px] leading-snug ${
                  isHL ? `font-semibold ${isDark ? 'text-chalk' : 'text-graphite'}` : isDark ? 'text-white/65' : 'text-concrete'
                }`}>
                  {feature}
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      <div className="px-6 pb-6">
        <Link href="/templates">
          <motion.span
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full font-semibold py-3 rounded-button text-[13px] transition-colors flex items-center justify-center gap-1.5 ${
              isDark ? 'bg-chalk text-graphite hover:bg-mist'
                : isGold ? 'bg-graphite text-chalk hover:bg-carbon'
                  : 'bg-mist text-graphite hover:bg-hairline'
            }`}
          >
            {ctaLabel}
            <ArrowRight size={14} />
          </motion.span>
        </Link>
        <p className={`text-[11px] mt-2.5 text-center ${isDark ? 'text-white/30' : 'text-ash'}`}>{ctaHint}</p>
      </div>
    </motion.div>
  )
}

const TIER_VARIANTS: Record<string, CardVariant> = { starter: 'light', popular: 'dark', eksklusif: 'gold' }
const TIER_CTA: Record<string, { label: string; hint: string }> = {
  starter: { label: 'Mulai Gratis', hint: 'Coba dulu, bayar kalau cocok' },
  popular: { label: 'Pilih Popular', hint: 'Fitur lengkap untuk acara kalian' },
  eksklusif: { label: 'Pilih Eksklusif', hint: 'Untuk acara besar & eksklusif' },
}

function buildFeatureList(tier: PriceTier): string[] {
  const f = tier.features
  if (!f) return []
  const list: string[] = []
  if (tier.id === 'popular') list.push('Semua fitur Starter')
  else if (tier.id === 'eksklusif') list.push('Semua fitur Popular')
  else {
    if (f.music) list.push('Musik pengiring')
    if (f.rsvp) list.push('RSVP online')
    if (f.gallery) list.push('Galeri foto')
    if (f.countdown) list.push('Countdown hari H')
    if (f.wishes) list.push('Ucapan & doa dari tamu')
  }
  if (f.gift) list.push('Amplop digital & rekening')
  if (f.gift_registry) list.push('Wishlist hadiah')
  if (f.story && tier.id !== 'starter') list.push('Kisah cinta pasangan')
  if (f.video && tier.id !== 'starter') list.push('Video prewedding')
  if (f.qrcode && tier.id === 'eksklusif') list.push('Scan barcode kehadiran tamu')
  if (f.remove_watermark) list.push('Tanpa watermark')
  if (f.custom_domain) list.push('Custom domain sendiri')
  if (f.priority_support) list.push('Priority support via WhatsApp')
  list.push(`Aktif ${f.validity_days} hari`)
  return list
}

interface PricingProps {
  priceTiers?: PriceTier[]
  flashSales?: FlashSale[]
}

export default function Pricing({ priceTiers, flashSales }: PricingProps) {
  const tiers = priceTiers?.length ? priceTiers : null
  const sales = flashSales ?? []

  return (
    <section id="harga" className="py-20 sm:py-28 lg:py-32 bg-chalk">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-graphite bg-graphite/[0.04] border border-hairline px-3.5 py-1.5 rounded-full mb-5">
            Harga
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-graphite">
            Sekali bayar. Tanpa langganan.
          </h2>
          <p className="mt-3 text-ash text-[15px] max-w-md mx-auto">
            Sekali bayar, langsung aktif. Tidak ada biaya bulanan atau biaya tersembunyi.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto items-stretch">
          {tiers ? (
            tiers
              .filter(t => ['starter', 'popular', 'eksklusif'].includes(t.id))
              .sort((a, b) => a.price - b.price)
              .map((tier, i) => {
                const sale = getActiveFlashSale(tier.id, sales)
                const discounted = sale ? calcDiscountedPrice(tier.price, sale) : null
                const variant = TIER_VARIANTS[tier.id] ?? 'light'
                const cta = TIER_CTA[tier.id] ?? { label: `Pilih ${tier.label}`, hint: '' }
                const features = buildFeatureList(tier)
                const highlighted = tier.id === 'popular' ? 'Amplop digital & rekening'
                  : tier.id === 'eksklusif' ? 'Scan barcode kehadiran tamu' : undefined

                return (
                  <PricingCard
                    key={tier.id}
                    name={`Paket ${tier.label}`}
                    badge={tier.id === 'popular' ? 'PALING DIPILIH' : tier.label.toUpperCase()}
                    price={formatRp(discounted ?? tier.price)}
                    originalPrice={discounted ? formatRp(tier.price) : undefined}
                    discountLabel={sale ? (sale.discount_type === 'percentage' ? `-${sale.discount_value}%` : `-${formatRp(sale.discount_value)}`) : undefined}
                    duration={tier.features ? `${tier.features.validity_days} hari` : '30 hari'}
                    features={features}
                    highlightedFeature={highlighted}
                    ctaLabel={cta.label}
                    ctaHint={cta.hint}
                    variant={variant}
                    popular={!!tier.highlight}
                    delay={i * 0.08}
                  />
                )
              })
          ) : (
            <>
              <PricingCard
                name="Paket Starter" badge={PRICING_CONFIG.starter.badge}
                price={PRICING_CONFIG.starter.priceFormatted} duration={PRICING_CONFIG.starter.durationLabel}
                features={PRICING_CONFIG.starter.features}
                ctaLabel="Mulai Gratis" ctaHint="Coba dulu, bayar kalau cocok" variant="light" delay={0}
              />
              <PricingCard
                name="Paket Popular" badge={PRICING_CONFIG.popular.badge}
                price={PRICING_CONFIG.popular.priceFormatted} duration={PRICING_CONFIG.popular.durationLabel}
                features={PRICING_CONFIG.popular.features} highlightedFeature={PRICING_CONFIG.popular.highlightedFeature}
                ctaLabel="Pilih Popular" ctaHint="Fitur lengkap untuk acara kalian" variant="dark" popular delay={0.08}
              />
              <PricingCard
                name="Paket Eksklusif" badge={PRICING_CONFIG.eksklusif.badge}
                price={PRICING_CONFIG.eksklusif.priceFormatted} duration={PRICING_CONFIG.eksklusif.durationLabel}
                features={PRICING_CONFIG.eksklusif.features} highlightedFeature={PRICING_CONFIG.eksklusif.highlightedFeature}
                ctaLabel="Pilih Eksklusif" ctaHint="Untuk acara besar & eksklusif" variant="gold" delay={0.16}
              />
            </>
          )}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 sm:mt-12 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-3xl mx-auto"
        >
          <div className="flex items-center gap-3.5 bg-mist rounded-xl px-5 py-4 border border-hairline">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-chalk flex items-center justify-center border border-hairline">
              <ShieldCheck size={18} className="text-graphite" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-graphite leading-snug">
                Lihat hasilnya dulu, bayar kalau suka
              </p>
              <p className="text-[11px] text-ash mt-0.5">Tanpa risiko, tanpa komitmen</p>
            </div>
          </div>
          <div className="flex items-center gap-3.5 bg-mist rounded-xl px-5 py-4 border border-hairline">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-chalk flex items-center justify-center border border-hairline">
              <MessageCircle size={18} className="text-graphite" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-graphite leading-snug">
                Tim kami siap membantu via WhatsApp
              </p>
              <p className="text-[11px] text-ash mt-0.5">Balas dalam 1 hari kerja</p>
            </div>
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="mt-8 text-center text-[13px] text-ash"
        >
          Ada pertanyaan?{' '}
          <Link href="/#faq" className="font-medium text-concrete hover:text-graphite underline underline-offset-2 transition-colors">
            Lihat FAQ
          </Link>
        </motion.p>

      </div>
    </section>
  )
}
