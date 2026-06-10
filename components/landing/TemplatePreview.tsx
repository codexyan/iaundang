'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'

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

// ─── Coming Soon Preview ─────────────────────────────────────────

function ComingSoonPreview({ bgColor, accentColor, photo }: { bgColor: string; accentColor: string; photo: string }) {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: bgColor }}>
      <Image src={photo} alt="" fill className="object-cover" sizes="200px" style={{ opacity: 0.2 }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${bgColor}88 0%, ${bgColor} 100%)` }} />

      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${accentColor}15`, border: `1px solid ${accentColor}30` }}>
          <Clock size={18} style={{ color: accentColor }} />
        </div>
        <p className="text-[9px] tracking-[0.3em] uppercase font-semibold" style={{ color: accentColor }}>Coming Soon</p>
      </div>
    </div>
  )
}

// ─── Template data ───────────────────────────────────────────────

const templates = [
  {
    id: 'traditional',
    label: 'Traditional',
    tagline: 'Klasik & anggun',
    accentColor: '#d4af37',
    bgColor: '#0a1a0a',
    photo: '/images/templates/wedding-bg.jpg',
  },
  {
    id: 'modern',
    label: 'Modern',
    tagline: 'Berani & dramatis',
    accentColor: '#64ffda',
    bgColor: '#060e1f',
    photo: '/images/templates/modern.jpg',
  },
  {
    id: 'romantic',
    label: 'Romantic',
    tagline: 'Lembut & memukau',
    accentColor: '#f5a0b5',
    bgColor: '#1a0810',
    photo: '/images/templates/casual.jpg',
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
            Segera hadir untuk kalian
          </h2>
          <p className="mt-3 text-stone-400 text-sm max-w-sm mx-auto">
            Koleksi gaya opening sedang kami persiapkan. Nantikan peluncurannya!
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
              <div className="block">
                <div className="flex justify-center mb-5">
                  <div className="w-[160px] sm:w-[170px] lg:w-[180px] opacity-75">
                    <PhoneMockup>
                      <ComingSoonPreview bgColor={tpl.bgColor} accentColor={tpl.accentColor} photo={tpl.photo} />
                    </PhoneMockup>
                  </div>
                </div>

                <div className="text-center">
                  <span
                    className="inline-block text-[10px] font-semibold tracking-[.14em] uppercase px-3 py-1 rounded-full mb-2"
                    style={{ background: `${tpl.accentColor}10`, color: `${tpl.accentColor}88`, border: `1px solid ${tpl.accentColor}20` }}
                  >
                    {tpl.label}
                  </span>
                  <p className="font-serif text-base font-bold text-stone-400 leading-tight">
                    {tpl.tagline}
                  </p>
                </div>
              </div>
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
          <p className="text-sm text-stone-400">
            12 gaya opening akan tersedia saat peluncuran resmi
          </p>
        </motion.div>
      </div>
    </section>
  )
}
