'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Play, ArrowRight, Sparkles, Crown, Gem } from 'lucide-react'
import type { TemplateRecord } from '@/lib/types'
import { SectionContainer } from '@/components/marketing/SectionContainer'
import { Button } from '@/components/marketing/Button'
import { Badge } from '@/components/marketing/Badge'
import { EASE, VIEWPORT_ONCE } from '@/lib/motion'

// Teks miniatur di dalam mockup HP = ilustrasi dekoratif; arbitrary < 12px
// diizinkan khusus di dalam mockup.
function PhoneMockup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-[28px] sm:rounded-[32px] overflow-hidden ${className}`}
      style={{
        padding: 5,
        background: 'linear-gradient(160deg, #2a2a2c 0%, #1a1a1c 40%, #0a0a0a 100%)',
        boxShadow: '0 12px 28px -10px rgba(10,10,10,0.22), 0 28px 56px -16px rgba(10,10,10,0.14), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
    >
      <div className="absolute left-1/2 -translate-x-1/2 z-30 rounded-full" style={{ top: 8, width: 56, height: 16, backgroundColor: '#000' }} />
      <div className="rounded-[24px] sm:rounded-[28px] overflow-hidden relative" style={{ aspectRatio: '9/19.5' }}>
        {children}
      </div>
    </div>
  )
}

interface TemplateCard {
  id: string
  name: string
  category: string
  primary: string
  accent: string
  textColor: string
  coverPhoto: string
  href: string
  requiredPackage: string
}

type BadgeVariant = 'neutral' | 'forest' | 'gold'
const TIER_BADGE: Record<string, { label: string; icon: typeof Sparkles; variant: BadgeVariant }> = {
  all: { label: 'Starter', icon: Sparkles, variant: 'neutral' },
  starter: { label: 'Starter', icon: Sparkles, variant: 'neutral' },
  popular: { label: 'Popular', icon: Crown, variant: 'forest' },
  eksklusif: { label: 'Eksklusif', icon: Gem, variant: 'gold' },
}

// Solid-color blur placeholder so foto external (Unsplash) tidak flash kosong saat load
function blurFor(color: string): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='8' height='12'><rect width='100%' height='100%' fill='${color}'/></svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function templateToCard(t: TemplateRecord): TemplateCard {
  const cs = t.config.meta.color_scheme
  const opening = t.config?.opening
  return {
    id: t.id,
    name: t.name,
    category: t.category || 'Wedding',
    primary: cs.primary,
    accent: cs.accent,
    textColor: cs.text || '#ffffff',
    coverPhoto: opening?.cover_photo_url || opening?.background_image || '',
    href: `/demo/renderer?id=${t.id}`,
    requiredPackage: t.required_package,
  }
}

const FALLBACK_CARDS: TemplateCard[] = [
  {
    id: 'javanese-gold', name: 'Javanese Gold', category: 'Tradisional',
    primary: '#1a4a1a', accent: '#d4af37', textColor: '#ffffff',
    coverPhoto: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&h=1200&fit=crop',
    href: '/demo/renderer?id=javanese-gold', requiredPackage: 'all',
  },
  {
    id: 'rose-garden', name: 'Rose Garden', category: 'Floral',
    primary: '#6b3a3a', accent: '#d4918b', textColor: '#ffffff',
    coverPhoto: 'https://images.unsplash.com/photo-1522748906645-95d8adfd52c7?w=800&h=1200&fit=crop',
    href: '/demo/renderer?id=rose-garden', requiredPackage: 'popular',
  },
  {
    id: 'midnight-luxe', name: 'Midnight Luxe', category: 'Modern',
    primary: '#0c0c0c', accent: '#b8977e', textColor: '#f5f0eb',
    coverPhoto: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&h=1200&fit=crop',
    href: '/demo/renderer?id=midnight-luxe', requiredPackage: 'eksklusif',
  },
]

interface ShowcaseData {
  featured: { name: string; tagline: string; coverPhoto: string; primary: string; accent: string; href: string }
  comingSoon: { label: string; accent: string; bg: string }[]
}

export default function TemplatePreview({ templates }: { showcase?: ShowcaseData; templates?: TemplateRecord[] }) {
  const activeTemplates = templates?.filter(t => t.status === 'active') ?? []
  const cards = activeTemplates.length > 0 ? activeTemplates.map(templateToCard) : FALLBACK_CARDS

  return (
    <SectionContainer
      id="templates"
      tone="ivory"
      eyebrow="Koleksi Template"
      title="Pilih desain, preview langsung"
      lead="Setiap template sudah termasuk opening animasi, musik, dan semua section undangan."
    >
      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {cards.map((card, i) => {
          const badge = TIER_BADGE[card.requiredPackage] ?? TIER_BADGE.all
          const BadgeIcon = badge.icon

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={VIEWPORT_ONCE}
              transition={{ duration: 0.6, delay: i * 0.1, ease: EASE }}
              className="group"
            >
              <div className="rounded-card border border-hairline bg-chalk shadow-card p-4 sm:p-5 transition-all duration-300 ease-out group-hover:-translate-y-1 group-hover:shadow-card-hover group-hover:border-ash/40">

                {/* Phone Mockup */}
                <div className="flex justify-center mb-5">
                  <div className="relative w-[170px] sm:w-[190px] transition-transform duration-300 ease-out group-hover:-translate-y-1.5">
                    <PhoneMockup>
                      <div className="absolute inset-0" style={{ backgroundColor: card.primary }}>
                        {card.coverPhoto && (
                          <Image src={card.coverPhoto} alt={card.name} fill className="object-cover" sizes="200px"
                            placeholder="blur" blurDataURL={blurFor(card.primary)} style={{ opacity: 0.6 }} />
                        )}
                        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 18%, ${card.primary}99 56%, ${card.primary} 100%)` }} />
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-10 px-4">
                          <p className="text-[7px] tracking-[0.35em] uppercase mb-2" style={{ color: `${card.accent}bb` }}>
                            The Wedding of
                          </p>
                          <p className="font-display text-[24px] leading-[0.95]" style={{ color: card.textColor }}>
                            Ikhwal
                          </p>
                          <p className="font-display text-sm my-0.5" style={{ color: card.accent }}>&amp;</p>
                          <p className="font-display text-[24px] leading-[0.95]" style={{ color: card.textColor }}>
                            Fani
                          </p>
                          <div className="mt-3 px-4 py-1.5 rounded-full" style={{ border: `1px solid ${card.accent}30`, fontSize: 7, color: `${card.accent}aa`, letterSpacing: '0.15em' }}>
                            BUKA UNDANGAN
                          </div>
                        </div>
                      </div>
                    </PhoneMockup>
                  </div>
                </div>

                {/* Info */}
                <div className="text-center">
                  <div className="flex items-center justify-center gap-2 mb-2.5">
                    <Badge variant={badge.variant}>
                      <BadgeIcon className="w-3 h-3" />
                      {badge.label}
                    </Badge>
                    <span className="text-body-xs text-concrete capitalize">{card.category}</span>
                  </div>
                  <h3 className="font-display text-h3 text-graphite mb-4">{card.name}</h3>

                  <Button href={card.href} variant="secondary" className="w-full">
                    <span className="w-5 h-5 rounded-full bg-forest-50 flex items-center justify-center">
                      <Play size={9} className="fill-forest text-forest ml-0.5" />
                    </span>
                    Preview
                  </Button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mt-12 sm:mt-14"
      >
        <Link
          href="/templates"
          className="group inline-flex items-center gap-2 text-button-base text-concrete hover:text-forest-deep pb-0.5 border-b border-hairline hover:border-gold-dark transition-colors"
        >
          Lihat semua template
          <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
        <p className="text-body-xs text-concrete mt-4">
          {cards.length} template tersedia &middot; Koleksi terus bertambah
        </p>
      </motion.div>
    </SectionContainer>
  )
}
