'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/marketing/Button'
import { EASE } from '@/lib/motion'

interface HeroContent {
  headline: string
  subheadline: string
  ctaPrimary: string
  ctaSecondary: string
}

// Teks miniatur di dalam mockup HP adalah ilustrasi dekoratif (bukan konten
// yang dibaca), jadi ukuran arbitrary < 12px diizinkan khusus di sini.
function PhoneMockup({ groomName = 'Rizky', brideName = 'Aulia' }: { groomName?: string; brideName?: string }) {
  return (
    <div className="relative">
      <div
        className="relative rounded-[36px] overflow-hidden shadow-float"
        style={{
          padding: 5,
          background: 'linear-gradient(160deg, #2a2a2c 0%, #1c1c1e 40%, #0a0a0a 100%)',
        }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 z-30 rounded-full" style={{ top: 8, width: 60, height: 18, background: '#000' }} />
        <div className="rounded-[32px] overflow-hidden relative" style={{ aspectRatio: '9/19.5' }}>
          <div className="absolute inset-0" style={{ background: '#0a1a0a' }}>
            <Image
              src="/images/templates/wedding-bg.jpg"
              alt="Preview undangan"
              fill
              className="object-cover"
              sizes="320px"
              quality={85}
              style={{ opacity: 0.5 }}
            />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center 35%, rgba(10,20,10,0.2) 0%, rgba(10,20,10,0.85) 100%)' }} />
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6">
              <p className="text-[9px] tracking-[0.35em] uppercase mb-4 text-gold">
                The Wedding of
              </p>
              <h3
                className="font-display text-[38px] leading-[0.95] text-white"
                style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
              >
                {groomName}
              </h3>
              <p className="font-display text-[22px] my-1.5 text-gold">
                &amp;
              </p>
              <h3
                className="font-display text-[38px] leading-[0.95] text-white"
                style={{ textShadow: '0 4px 24px rgba(0,0,0,0.5)' }}
              >
                {brideName}
              </h3>
              <div
                className="mt-6 px-5 py-2.5 rounded-full"
                style={{ border: '1px solid rgba(212,175,55,0.3)', background: 'rgba(212,175,55,0.06)' }}
              >
                <p className="text-[8px] tracking-[0.2em] uppercase" style={{ color: '#d4af37cc' }}>
                  Buka Undangan
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-[70%] h-8 rounded-[50%] bg-forest/[0.10] blur-xl" />
    </div>
  )
}

export default function HeroSection({
  content,
  mockup,
}: {
  content?: HeroContent
  mockup?: { groomName?: string; brideName?: string; date?: string; venue?: string }
}) {
  const hero = {
    ctaPrimary: content?.ctaPrimary ?? 'Mulai Gratis',
    ctaSecondary: content?.ctaSecondary ?? 'Lihat Demo',
    subheadline:
      content?.subheadline ??
      'Setiap tamu mendapat undangan dengan namanya. Musik otomatis, RSVP langsung, tanpa install.',
  }

  const ref = useRef<HTMLElement>(null)
  const isInView = useInView(ref, { once: true, amount: 0.1 })

  return (
    <section ref={ref} className="relative overflow-hidden bg-ivory" style={{ minHeight: '100svh' }}>
      <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pt-28 pb-16 sm:pt-36 sm:pb-20 lg:pt-40 lg:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Copy */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            >
              <span className="inline-flex items-center gap-2 text-label-sm uppercase tracking-[0.09em] text-forest bg-gold/[0.07] border border-gold-200/70 px-3.5 py-1.5 rounded-pill">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                Undangan Digital Premium
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.9, delay: 0.2, ease: EASE }}
              className="mt-8 font-display text-display-2xl text-forest-deep text-balance"
            >
              Undangan digital
              <br />
              yang personal untuk
              <br />
              <span className="text-gold-700">setiap tamu.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
              className="mt-6 text-body-lg leading-[1.75] text-concrete max-w-[440px]"
            >
              {hero.subheadline}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
              className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-5"
            >
              <Button href="/templates" size="lg">
                {hero.ctaPrimary}
                <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
              </Button>
              <Link
                href="/demo/renderer?id=javanese-gold"
                className="group inline-flex items-center gap-2 text-button-base text-concrete hover:text-forest-deep pb-0.5 border-b border-hairline hover:border-gold-dark transition-colors"
              >
                {hero.ctaSecondary}
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-8 flex items-center gap-5 text-body-xs text-concrete"
            >
              {['Gratis preview', 'Sekali bayar', 'Tanpa langganan'].map((t, i) => (
                <span key={t} className="flex items-center gap-5">
                  {i > 0 && <span className="w-1 h-1 rounded-full bg-gold/50 -ml-5" />}
                  {t}
                </span>
              ))}
            </motion.div>
          </div>

          {/* Phone mockup — desktop */}
          <div className="hidden lg:flex justify-center">
            <motion.div
              initial={{ opacity: 0, y: 48, scale: 0.92 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
              transition={{ duration: 1.1, delay: 0.3, ease: EASE }}
              className="relative w-[300px]"
            >
              <PhoneMockup groomName={mockup?.groomName} brideName={mockup?.brideName} />
            </motion.div>
          </div>

          {/* Phone mockup — mobile */}
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.4, ease: EASE }}
            className="lg:hidden flex justify-center"
          >
            <div className="w-[230px]">
              <PhoneMockup groomName={mockup?.groomName} brideName={mockup?.brideName} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
