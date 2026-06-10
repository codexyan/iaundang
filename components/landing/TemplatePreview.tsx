'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

// ─── Phone Shell ─────────────────────────────────────────────────

function PhoneMockup({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-[18px] sm:rounded-[22px] overflow-hidden"
      style={{
        padding: 3,
        background: 'linear-gradient(145deg, #1c1c1e 0%, #111 50%, #000 100%)',
        boxShadow: '0 24px 48px rgba(0,0,0,0.3), inset 0 0 0 0.5px rgba(255,255,255,0.12)',
      }}
    >
      <div className="absolute left-1/2 -translate-x-1/2 z-30 rounded-full" style={{ top: 5, width: 36, height: 10, backgroundColor: '#000' }} />
      <div className="rounded-[16px] sm:rounded-[20px] overflow-hidden relative" style={{ aspectRatio: '9/19.5' }}>
        {children}
      </div>
    </div>
  )
}

// ─── Opening Mini Previews — clean, minimal, premium ─────────────

function FadeRevealMini() {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: '#0a1a0a' }}>
      <Image src="/images/templates/wedding-bg.jpg" alt="" fill className="object-cover" sizes="200px" style={{ opacity: 0.5 }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center 40%, rgba(10,20,10,0.3) 0%, rgba(10,20,10,0.8) 100%)' }} />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
        <p className="text-[8px] tracking-[0.4em] uppercase mb-4" style={{ color: '#d4af37' }}>The Wedding of</p>
        <h3 className="text-[28px] font-bold leading-[0.85]" style={{ color: '#fff', fontFamily: "'Playfair Display', serif", textShadow: '0 3px 16px rgba(0,0,0,0.5)' }}>Rizky</h3>
        <p className="text-[18px] my-0.5" style={{ color: '#d4af37', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 300 }}>&amp;</p>
        <h3 className="text-[28px] font-bold leading-[0.85]" style={{ color: '#fff', fontFamily: "'Playfair Display', serif", textShadow: '0 3px 16px rgba(0,0,0,0.5)' }}>Aulia</h3>
        <p className="text-[7px] tracking-[0.2em] mt-4" style={{ color: 'rgba(255,255,255,0.5)' }}>12 · 04 · 2026</p>
      </div>
    </div>
  )
}

function GateOpenMini() {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: '#060e1f' }}>
      <Image src="/images/templates/modern.jpg" alt="" fill className="object-cover" sizes="200px" style={{ opacity: 0.35 }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center 40%, rgba(6,14,31,0.3) 0%, rgba(6,14,31,0.85) 100%)' }} />

      {/* Subtle gate lines */}
      <div className="absolute inset-y-0 left-1/2 z-[5] -translate-x-px" style={{ width: 1, background: 'linear-gradient(to bottom, transparent 20%, #64ffda33 50%, transparent 80%)' }} />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
        <p className="text-[8px] tracking-[0.4em] uppercase mb-4" style={{ color: '#64ffda' }}>The Wedding of</p>
        <h3 className="text-[28px] font-bold leading-[0.85]" style={{ color: '#ccd6f6', fontFamily: "'Playfair Display', serif", textShadow: '0 3px 16px rgba(6,14,31,0.8)' }}>Dimas</h3>
        <p className="text-[18px] my-0.5" style={{ color: '#64ffda', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 300 }}>&amp;</p>
        <h3 className="text-[28px] font-bold leading-[0.85]" style={{ color: '#ccd6f6', fontFamily: "'Playfair Display', serif", textShadow: '0 3px 16px rgba(6,14,31,0.8)' }}>Anisa</h3>
        <p className="text-[7px] tracking-[0.2em] mt-4" style={{ color: 'rgba(204,214,246,0.4)' }}>12 · 04 · 2026</p>
      </div>
    </div>
  )
}

function EnvelopeMini() {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: '#1a0810' }}>
      <Image src="/images/templates/casual.jpg" alt="" fill className="object-cover" sizes="200px" style={{ opacity: 0.3 }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center 40%, rgba(26,8,16,0.3) 0%, rgba(26,8,16,0.85) 100%)' }} />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
        <p className="text-[8px] tracking-[0.4em] uppercase mb-4" style={{ color: '#f5a0b5' }}>The Wedding of</p>
        <h3 className="text-[28px] font-bold leading-[0.85]" style={{ color: '#fff0f5', fontFamily: "'Playfair Display', serif", textShadow: '0 3px 16px rgba(26,8,16,0.8)' }}>Fajar</h3>
        <p className="text-[18px] my-0.5" style={{ color: '#f5a0b5', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontWeight: 300 }}>&amp;</p>
        <h3 className="text-[28px] font-bold leading-[0.85]" style={{ color: '#fff0f5', fontFamily: "'Playfair Display', serif", textShadow: '0 3px 16px rgba(26,8,16,0.8)' }}>Mawar</h3>
        <p className="text-[7px] tracking-[0.2em] mt-4" style={{ color: 'rgba(255,240,245,0.4)' }}>12 · 04 · 2026</p>
      </div>
    </div>
  )
}

// ─── Template data ───────────────────────────────────────────────

const templates = [
  {
    id: 'javanese-gold',
    label: 'Traditional',
    tagline: 'Klasik, anggun, penuh makna',
    desc: 'Foto latar dramatis dengan ornamen emas dan tipografi elegan yang memikat sejak pertama klik.',
    visual: <FadeRevealMini />,
    accentColor: '#d4af37',
  },
  {
    id: 'navy-elegant',
    label: 'Modern',
    tagline: 'Berani, dramatis, tak terlupakan',
    desc: 'Gerbang megah terbuka dengan palet navy gelap dan aksen futuristik yang mewah.',
    visual: <GateOpenMini />,
    accentColor: '#64ffda',
  },
  {
    id: 'rose-garden',
    label: 'Romantic',
    tagline: 'Lembut, romantis, memukau',
    desc: 'Amplop cantik dengan nuansa rose pink yang menawan untuk sambutan hangat nan manis.',
    visual: <EnvelopeMini />,
    accentColor: '#f5a0b5',
  },
]

// ─── Section ────────────────────────────────────────────────────

export default function TemplatePreview() {
  return (
    <section id="templates" className="py-14 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold tracking-[.18em] uppercase text-forest-400 mb-3">Pilih Gaya</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Mana yang paling mencerminkan kalian?
          </h2>
          <p className="mt-3 text-stone-400 text-sm max-w-xs mx-auto">
            Setiap gaya opening langsung tampil saat tamu membuka undangan.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 lg:gap-8">
          {templates.map((tpl, i) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href="/demo/renderer" className="group block">
                <div className="flex justify-center mb-5">
                  <motion.div
                    whileHover={{ y: -8, scale: 1.02 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="w-[180px] sm:w-[190px] lg:w-[200px]"
                  >
                    <PhoneMockup>
                      {tpl.visual}
                    </PhoneMockup>
                  </motion.div>
                </div>

                <div className="text-center">
                  <span
                    className="inline-block text-[10px] font-semibold tracking-[.14em] uppercase px-3 py-1 rounded-full mb-2"
                    style={{ background: `${tpl.accentColor}15`, color: tpl.accentColor, border: `1px solid ${tpl.accentColor}30` }}
                  >
                    {tpl.label}
                  </span>
                  <p className="font-serif text-lg font-bold text-stone-900 leading-tight mb-1">
                    {tpl.tagline}
                  </p>
                  <p className="text-stone-400 text-xs leading-relaxed line-clamp-2 max-w-[220px] mx-auto">{tpl.desc}</p>
                </div>

                <div className="flex items-center justify-center mt-3">
                  <span className="inline-flex items-center gap-1 text-xs text-stone-500 group-hover:text-stone-900 font-medium transition-colors">
                    Coba Gratis <ArrowRight size={11} className="group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-10"
        >
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 font-medium border border-stone-200 hover:border-stone-400 px-5 py-2.5 rounded-full transition-all duration-200"
          >
            Lihat 12 gaya opening lainnya <ArrowRight size={13} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
