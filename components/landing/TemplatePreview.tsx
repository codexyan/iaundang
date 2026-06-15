'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Play, Sparkles, ArrowRight } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const

function PhoneMockup({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`relative rounded-[28px] sm:rounded-[32px] overflow-hidden ${className}`}
      style={{
        padding: 5,
        background: 'linear-gradient(160deg, #2a2a2c 0%, #1a1a1c 40%, #0a0a0a 100%)',
        boxShadow: `
          0 40px 80px -16px rgba(0,0,0,0.25),
          0 16px 40px -8px rgba(0,0,0,0.15),
          inset 0 1px 0 rgba(255,255,255,0.08)
        `,
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

const FEATURED = {
  name: 'Javanese Gold',
  tagline: 'Elegansi tradisi Jawa dalam sentuhan modern',
  coverPhoto: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=800&h=1200&fit=crop',
  primary: '#1a4a1a',
  accent: '#d4af37',
  textColor: '#ffffff',
  background: '#0f2d0f',
  href: '/demo/renderer?id=javanese-gold',
}

const COMING_SOON = [
  { label: 'Modern Minimal', accent: '#64ffda', bg: '#060e1f', photo: '/images/templates/modern.jpg' },
  { label: 'Romantic Bloom', accent: '#f5a0b5', bg: '#1a0810', photo: '/images/templates/casual.jpg' },
]

export default function TemplatePreview() {
  return (
    <section id="templates" className="py-20 sm:py-28 lg:py-32 bg-[#fafaf9] overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-16 sm:mb-20"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-forest-600 bg-forest-50/80 border border-forest-100 px-3.5 py-1.5 rounded-full mb-5">
            Koleksi Template
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Desain yang bikin tamu terpukau
          </h2>
          <p className="mt-3 text-stone-400 text-[15px] max-w-md mx-auto">
            Setiap template dirancang dengan detail: opening animasi, musik, dan transisi yang memukau.
          </p>
        </motion.div>

        {/* Featured Template */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-20 items-center mb-20 sm:mb-24">

          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: -30, scale: 0.96 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.8, ease: EASE }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-16 pointer-events-none">
                <div className="absolute inset-0 rounded-full blur-[60px] opacity-30"
                  style={{ background: 'radial-gradient(ellipse, rgba(26,74,26,0.2) 0%, transparent 70%)' }} />
              </div>
              <div className="w-[220px] sm:w-[260px]">
                <PhoneMockup>
                  <div className="absolute inset-0" style={{ backgroundColor: FEATURED.primary }}>
                    <Image
                      src={FEATURED.coverPhoto}
                      alt={FEATURED.name}
                      fill
                      className="object-cover"
                      sizes="260px"
                      style={{ opacity: 0.6 }}
                    />
                    <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, transparent 20%, ${FEATURED.primary}dd 60%, ${FEATURED.primary} 100%)` }} />
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-12 px-5">
                      <p className="text-[9px] tracking-[0.35em] uppercase mb-4" style={{ color: `${FEATURED.accent}cc` }}>
                        The Wedding of
                      </p>
                      <p className="text-[32px] font-bold leading-[0.85]" style={{ color: FEATURED.textColor, fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                        Ikhwal
                      </p>
                      <p className="text-xl my-1" style={{ color: FEATURED.accent, fontFamily: "var(--font-playfair), 'Playfair Display', serif", fontStyle: 'italic' }}>&amp;</p>
                      <p className="text-[32px] font-bold leading-[0.85]" style={{ color: FEATURED.textColor, fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                        Fani
                      </p>
                      <div className="mt-5 px-5 py-2 rounded-full" style={{ border: `1px solid ${FEATURED.accent}40`, fontSize: 9, color: `${FEATURED.accent}dd`, letterSpacing: '0.15em' }}>
                        BUKA UNDANGAN
                      </div>
                    </div>
                  </div>
                </PhoneMockup>
              </div>
              <div
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[80%] h-3 rounded-[50%] blur-md"
                style={{ background: 'radial-gradient(ellipse, rgba(0,0,0,0.1) 0%, transparent 70%)' }}
              />
            </div>
          </motion.div>

          {/* Info + CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="text-center lg:text-left"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-wide mb-5"
              style={{ background: `${FEATURED.accent}10`, color: FEATURED.accent, border: `1px solid ${FEATURED.accent}20` }}>
              <Sparkles size={12} /> Featured Template
            </span>

            <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 mb-3">{FEATURED.name}</h3>
            <p className="text-stone-500 text-[15px] leading-relaxed max-w-md mx-auto lg:mx-0 mb-7">
              {FEATURED.tagline}. Dilengkapi opening animasi, musik latar, countdown, galeri, RSVP, dan ucapan dalam satu undangan elegan.
            </p>

            <div className="flex items-center gap-2.5 mb-7 justify-center lg:justify-start">
              {[FEATURED.primary, FEATURED.accent, '#8fa99a', FEATURED.background].map((c, i) => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-white shadow-md ring-1 ring-stone-100" style={{ backgroundColor: c }} />
              ))}
              <span className="text-[11px] text-stone-400 ml-1.5">Color palette</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Link href={FEATURED.href}>
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2.5 w-full sm:w-auto px-6 py-3.5 rounded-xl text-white text-[14px] font-semibold shadow-lg transition-shadow hover:shadow-xl"
                  style={{ background: `linear-gradient(135deg, ${FEATURED.primary}, ${FEATURED.background})` }}
                >
                  <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center">
                    <Play size={11} className="fill-white text-white ml-0.5" />
                  </span>
                  Lihat Demo Live
                </motion.span>
              </Link>
              <Link href="/templates">
                <motion.span
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3.5 rounded-xl text-[14px] font-semibold border border-stone-200 text-stone-600 hover:border-stone-300 bg-white shadow-sm hover:shadow-md transition-all"
                >
                  Semua Template <ArrowRight size={15} />
                </motion.span>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <p className="text-center text-[11px] font-semibold tracking-[.15em] uppercase text-stone-400 mb-7">Segera Hadir</p>
          <div className="flex justify-center gap-8 sm:gap-10">
            {COMING_SOON.map((tpl, i) => (
              <motion.div
                key={tpl.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
                className="text-center"
              >
                <div className="w-[110px] sm:w-[130px] opacity-50 mx-auto mb-3">
                  <PhoneMockup>
                    <div className="absolute inset-0" style={{ backgroundColor: tpl.bg }}>
                      <Image src={tpl.photo} alt="" fill className="object-cover" sizes="130px" style={{ opacity: 0.15 }} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-1.5" style={{ backgroundColor: `${tpl.accent}12`, border: `1px solid ${tpl.accent}25` }}>
                          <Sparkles size={13} style={{ color: tpl.accent }} />
                        </div>
                        <p className="text-[7px] tracking-[0.2em] uppercase font-semibold" style={{ color: tpl.accent }}>Coming Soon</p>
                      </div>
                    </div>
                  </PhoneMockup>
                </div>
                <p className="text-xs font-semibold text-stone-500">{tpl.label}</p>
              </motion.div>
            ))}
          </div>
          <p className="text-center text-[12px] text-stone-400 mt-7">12+ gaya opening akan tersedia saat peluncuran resmi</p>
        </motion.div>
      </div>
    </section>
  )
}
