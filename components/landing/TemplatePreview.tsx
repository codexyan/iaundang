'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Sparkles, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react'
import type { TemplateRecord } from '@/lib/types'

const EASE = [0.16, 1, 0.3, 1] as const

function PhoneMockup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-[28px] sm:rounded-[32px] overflow-hidden ${className}`}
      style={{
        padding: 5,
        background: 'linear-gradient(160deg, #2a2a2c 0%, #1a1a1c 40%, #0a0a0a 100%)',
        boxShadow: '0 50px 100px -20px rgba(0,0,0,0.3), 0 20px 50px -10px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}
    >
      <div className="absolute left-1/2 -translate-x-1/2 z-30 rounded-full" style={{ top: 8, width: 56, height: 16, backgroundColor: '#000' }} />
      <div className="absolute right-[-1px] top-[25%] w-[2px] h-6 rounded-l bg-gradient-to-b from-transparent via-white/8 to-transparent" />
      <div className="rounded-[24px] sm:rounded-[28px] overflow-hidden relative" style={{ aspectRatio: '9/19.5' }}>
        {children}
      </div>
    </div>
  )
}

/* ─── Data ─── */

const DEFAULT_FEATURED = {
  name: 'Javanese Gold',
  tagline: 'Elegansi tradisi Jawa dalam sentuhan modern',
  coverPhoto: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&h=1200&fit=crop',
  primary: '#1a4a1a',
  accent: '#d4af37',
  href: '/demo/renderer?id=javanese-gold',
}

const DEFAULT_COMING_SOON = [
  { label: 'Modern Minimal', accent: '#64ffda', bg: '#060e1f' },
  { label: 'Romantic Bloom', accent: '#f5a0b5', bg: '#1a0810' },
]

interface ShowcaseData {
  featured: { name: string; tagline: string; coverPhoto: string; primary: string; accent: string; href: string }
  comingSoon: { label: string; accent: string; bg: string }[]
}

interface TemplateItem {
  id: string
  name: string
  category: string
  primary: string
  accent: string
  textColor: string
  coverPhoto: string
  href: string
  tagline: string
}

function templateToItem(t: TemplateRecord): TemplateItem {
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
    tagline: 'Template undangan digital elegan',
  }
}

const FEATURES_INCLUDED = [
  'Opening animasi',
  'Musik latar',
  'RSVP digital',
  'Galeri foto',
  'Ucapan & doa',
  'Countdown',
]

/* ─── Main ─── */

export default function TemplatePreview({ showcase, templates }: { showcase?: ShowcaseData; templates?: TemplateRecord[] }) {
  const activeTemplates = templates?.filter(t => t.status === 'active') ?? []

  const items: TemplateItem[] = activeTemplates.length > 0
    ? activeTemplates.map(templateToItem)
    : [{
        id: 'javanese-gold',
        name: DEFAULT_FEATURED.name,
        category: 'Traditional',
        primary: DEFAULT_FEATURED.primary,
        accent: DEFAULT_FEATURED.accent,
        textColor: '#ffffff',
        coverPhoto: DEFAULT_FEATURED.coverPhoto,
        href: DEFAULT_FEATURED.href,
        tagline: DEFAULT_FEATURED.tagline,
      }]

  const comingSoonItems = (showcase?.comingSoon ?? DEFAULT_COMING_SOON).map(c => ({ ...c, photo: '/images/templates/modern.jpg' }))

  const [activeIdx, setActiveIdx] = useState(0)
  const active = items[activeIdx]
  const hasMultiple = items.length > 1

  const prev = () => setActiveIdx(i => (i - 1 + items.length) % items.length)
  const next = () => setActiveIdx(i => (i + 1) % items.length)

  return (
    <section id="templates" className="py-20 sm:py-28 lg:py-32 overflow-hidden relative bg-mist">

      <div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-14 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-graphite bg-graphite/[0.04] border border-hairline px-3.5 py-1.5 rounded-full mb-5">
            Koleksi Template
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-graphite">
            Pilih template. Preview langsung.
          </h2>
          <p className="mt-3 text-ash text-[15px] max-w-md mx-auto">
            Setiap template sudah termasuk opening animasi, musik latar, dan transisi yang halus.
          </p>
        </motion.div>

        {/* Showcase Card */}
        <div className="relative rounded-3xl border border-hairline bg-chalk overflow-hidden">

          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: EASE }}
            >
              <div className="flex flex-col lg:flex-row">

                {/* Left: Phone Mockup */}
                <div
                  className="relative flex items-center justify-center py-10 sm:py-14 lg:py-16 px-8 sm:px-12 lg:w-[45%] bg-mist"
                >

                  <motion.div
                    key={active.id + '-phone'}
                    initial={{ opacity: 0, y: 20, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
                    className="relative w-[200px] sm:w-[240px]"
                  >
                    <PhoneMockup>
                      <div className="absolute inset-0" style={{ backgroundColor: active.primary }}>
                        {active.coverPhoto && (
                          <Image src={active.coverPhoto} alt={active.name} fill className="object-cover" sizes="240px" style={{ opacity: 0.55 }} />
                        )}
                        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 15%, ${active.primary}cc 55%, ${active.primary} 100%)` }} />
                        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-12 px-5">
                          <p className="text-[8px] tracking-[0.35em] uppercase mb-3" style={{ color: `${active.accent}bb` }}>
                            The Wedding of
                          </p>
                          <p className="text-[28px] sm:text-[32px] font-bold leading-[0.85]" style={{ color: active.textColor, fontFamily: "var(--font-geist-sans), sans-serif" }}>
                            Ikhwal
                          </p>
                          <p className="text-lg my-1" style={{ color: active.accent, fontFamily: "var(--font-geist-sans), sans-serif", fontStyle: 'italic' }}>&amp;</p>
                          <p className="text-[28px] sm:text-[32px] font-bold leading-[0.85]" style={{ color: active.textColor, fontFamily: "var(--font-geist-sans), sans-serif" }}>
                            Fani
                          </p>
                          <div className="mt-5 px-5 py-2 rounded-full" style={{ border: `1px solid ${active.accent}35`, fontSize: 8, color: `${active.accent}cc`, letterSpacing: '0.15em' }}>
                            BUKA UNDANGAN
                          </div>
                        </div>
                      </div>
                    </PhoneMockup>
                    <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[80%] h-3 rounded-[50%] blur-md bg-graphite/[0.08]" />
                  </motion.div>

                  {/* Nav arrows (desktop) */}
                  {hasMultiple && (
                    <div className="hidden lg:flex absolute bottom-6 left-1/2 -translate-x-1/2 items-center gap-2">
                      <button onClick={prev}
                        className="w-8 h-8 rounded-full bg-chalk border border-hairline flex items-center justify-center text-concrete hover:text-graphite hover:bg-mist transition-all">
                        <ChevronLeft size={15} />
                      </button>
                      <div className="flex gap-1.5 px-2">
                        {items.map((_, i) => (
                          <button key={i} onClick={() => setActiveIdx(i)} aria-label={`Template ${i + 1}`}>
                            <div className={`h-1.5 rounded-full transition-all duration-300 ${
                              i === activeIdx ? 'w-5 bg-graphite' : 'w-1.5 bg-smoke hover:bg-ash'
                            }`} />
                          </button>
                        ))}
                      </div>
                      <button onClick={next}
                        className="w-8 h-8 rounded-full bg-chalk border border-hairline flex items-center justify-center text-concrete hover:text-graphite hover:bg-mist transition-all">
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Right: Details */}
                <div className="flex-1 p-7 sm:p-10 lg:p-12 flex flex-col justify-center border-t lg:border-t-0 lg:border-l border-hairline">
                  <motion.div
                    key={active.id + '-info'}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.15, ease: EASE }}
                  >
                    <div className="flex items-center gap-2.5 mb-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide text-graphite bg-mist border border-hairline">
                        <Sparkles size={12} />
                        {hasMultiple ? active.category : 'Featured'}
                      </span>
                      {hasMultiple && (
                        <span className="text-[11px] text-ash">
                          {activeIdx + 1} / {items.length}
                        </span>
                      )}
                    </div>

                    <h3 className="font-sans text-2xl sm:text-3xl font-bold text-graphite mb-3">{active.name}</h3>
                    <p className="text-concrete text-[15px] leading-relaxed max-w-md mb-7">
                      {active.tagline}. Dilengkapi semua fitur untuk undangan yang berkesan.
                    </p>

                    <div className="mb-8">
                      <p className="text-[10px] font-bold text-ash tracking-[0.1em] uppercase mb-3">Termasuk dalam template</p>
                      <div className="flex flex-wrap gap-2">
                        {FEATURES_INCLUDED.map(f => (
                          <span key={f} className="inline-flex items-center gap-1.5 text-[11px] text-concrete bg-mist border border-hairline px-2.5 py-1.5 rounded-lg">
                            <svg className="w-3 h-3 text-graphite" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link href={active.href}>
                        <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3.5 rounded-button bg-graphite text-chalk text-[14px] font-medium transition-colors hover:bg-carbon">
                          <span className="w-6 h-6 rounded-full bg-chalk/15 flex items-center justify-center">
                            <Play size={11} className="fill-chalk text-chalk ml-0.5" />
                          </span>
                          Lihat Demo Live
                        </motion.span>
                      </Link>
                      <Link href="/templates">
                        <motion.span whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                          className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-button text-[14px] font-medium border border-hairline text-concrete hover:text-graphite hover:border-smoke bg-chalk transition-all">
                          Semua Template <ArrowRight size={15} />
                        </motion.span>
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile nav */}
        {hasMultiple && (
          <div className="flex lg:hidden items-center justify-center gap-3 mt-6">
            <button onClick={prev}
              className="w-9 h-9 rounded-full bg-chalk border border-hairline flex items-center justify-center text-concrete hover:text-graphite transition-all">
              <ChevronLeft size={16} />
            </button>
            <div className="flex gap-1.5">
              {items.map((_, i) => (
                <button key={i} onClick={() => setActiveIdx(i)} aria-label={`Template ${i + 1}`}>
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === activeIdx ? 'w-5 bg-graphite' : 'w-1.5 bg-smoke'
                  }`} />
                </button>
              ))}
            </div>
            <button onClick={next}
              className="w-9 h-9 rounded-full bg-chalk border border-hairline flex items-center justify-center text-concrete hover:text-graphite transition-all">
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {/* Coming soon / other templates strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-14 sm:mt-16"
        >
          {items.length <= 1 && (
            <>
              <p className="text-center text-[11px] font-semibold tracking-[.15em] uppercase text-ash mb-7">Segera Hadir</p>
              <div className="flex justify-center gap-6 sm:gap-8">
                {comingSoonItems.map((tpl, i) => (
                  <motion.div
                    key={tpl.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className="w-[100px] sm:w-[120px] opacity-50 mx-auto mb-3">
                      <PhoneMockup>
                        <div className="absolute inset-0" style={{ backgroundColor: tpl.bg }}>
                          <Image src={tpl.photo} alt={`${tpl.label} - coming soon`} fill className="object-cover" sizes="120px" style={{ opacity: 0.15 }} />
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="w-7 h-7 rounded-full flex items-center justify-center mb-1.5" style={{ backgroundColor: `${tpl.accent}12`, border: `1px solid ${tpl.accent}25` }}>
                              <Sparkles size={12} style={{ color: tpl.accent }} />
                            </div>
                            <p className="text-[7px] tracking-[0.2em] uppercase font-semibold" style={{ color: tpl.accent }}>Coming Soon</p>
                          </div>
                        </div>
                      </PhoneMockup>
                    </div>
                    <p className="text-xs font-semibold text-concrete">{tpl.label}</p>
                  </motion.div>
                ))}
              </div>
            </>
          )}
          <p className="text-center text-[12px] text-ash mt-7">
            {items.length > 1
              ? `${items.length} template tersedia, pilih yang cocok untuk acara kalian`
              : 'Koleksi template akan terus bertambah, ikuti perkembangannya'}
          </p>
        </motion.div>

      </div>
    </section>
  )
}
