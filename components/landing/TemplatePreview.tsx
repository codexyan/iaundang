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

// ─── Opening Mini Previews ───────────────────────────────────────

function FadeRevealMini() {
  return (
    <div className="absolute inset-0" style={{ backgroundColor: '#0f2d0f' }}>
      <Image src="/images/templates/wedding-bg.jpg" alt="" fill className="object-cover" sizes="200px" style={{ opacity: 0.4 }} />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(10,20,10,0.6)' }} />
      <div className="absolute inset-x-0 bottom-0" style={{ height: '60%', background: 'linear-gradient(to top, rgba(10,20,10,0.97) 0%, rgba(10,20,10,0.8) 50%, transparent 100%)' }} />

      <div className="absolute inset-0 z-10 flex flex-col justify-end px-3 pb-4 text-center">
        <p className="text-[8px] italic mb-2" style={{ color: 'rgba(255,255,255,0.8)' }}>Assalamu&apos;alaikum Wr. Wb.</p>
        <div className="flex items-center gap-1 justify-center mb-2 mx-auto" style={{ width: '55%' }}>
          <div style={{ flex: 1, height: 0.5, background: 'linear-gradient(to right, transparent, #d4af3788)' }} />
          <div style={{ width: 3, height: 3, transform: 'rotate(45deg)', backgroundColor: '#d4af37', opacity: 0.8 }} />
          <div style={{ flex: 1, height: 0.5, background: 'linear-gradient(to left, transparent, #d4af3788)' }} />
        </div>
        <p className="text-[7px] tracking-[0.25em] uppercase mb-0.5" style={{ color: '#d4af37' }}>Kepada Yth.</p>
        <p className="text-[11px] font-semibold mb-3" style={{ color: '#fff', fontFamily: "'Playfair Display', serif", textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}>Bapak Budi &amp; Keluarga</p>
        <h3 className="text-[22px] font-bold leading-none" style={{ color: '#fff', fontFamily: "'Playfair Display', serif", textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>Rizky</h3>
        <div className="flex items-center justify-center gap-1.5 my-1">
          <div style={{ width: 16, height: 0.5, backgroundColor: '#d4af3766' }} />
          <span className="text-[14px]" style={{ color: '#d4af37', fontStyle: 'italic' }}>&amp;</span>
          <div style={{ width: 16, height: 0.5, backgroundColor: '#d4af3766' }} />
        </div>
        <h3 className="text-[22px] font-bold leading-none" style={{ color: '#fff', fontFamily: "'Playfair Display', serif", textShadow: '0 2px 12px rgba(0,0,0,0.6)' }}>Aulia</h3>
        <p className="text-[6px] tracking-[0.15em] uppercase mt-1.5 mb-2.5" style={{ color: '#d4af37cc' }}>Sabtu, 12 April 2026</p>
        <div className="inline-block mx-auto px-3 py-1.5 text-[7px] tracking-[0.2em] uppercase" style={{ border: '1px solid #d4af3788', color: '#d4af37', backgroundColor: 'rgba(15,45,15,0.5)' }}>Buka Undangan</div>
      </div>
    </div>
  )
}

function GateOpenMini() {
  const p = '#0a192f', a = '#64ffda', t = '#ccd6f6'
  return (
    <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: p }}>
      <Image src="/images/templates/modern.jpg" alt="" fill className="object-cover" sizes="200px" style={{ opacity: 0.25 }} />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(8,18,38,0.7)' }} />
      {/* Left gate */}
      <div className="absolute inset-y-0 left-0 w-1/2 z-10 flex items-center justify-end pr-2"
        style={{ backgroundColor: `${p}f0`, borderRight: `1.5px solid ${a}55` }}>
        <div className="flex flex-col items-center gap-2.5">
          {[0,1,2,3].map(i => <div key={i} style={{ width: 1.5, height: 6, backgroundColor: `${a}55` }} />)}
        </div>
      </div>
      {/* Right gate */}
      <div className="absolute inset-y-0 right-0 w-1/2 z-10 flex items-center justify-start pl-2"
        style={{ backgroundColor: `${p}f0`, borderLeft: `1.5px solid ${a}55` }}>
        <div className="flex flex-col items-center gap-2.5">
          {[0,1,2,3].map(i => <div key={i} style={{ width: 1.5, height: 6, backgroundColor: `${a}55` }} />)}
        </div>
      </div>
      {/* Center content */}
      <div className="relative z-0 text-center px-3 flex flex-col items-center gap-1">
        <p className="text-[8px] italic" style={{ color: `${a}cc` }}>Assalamu&apos;alaikum Wr. Wb.</p>
        <div className="py-1 px-3 my-1 rounded" style={{ backgroundColor: `${a}12` }}>
          <p className="text-[7px] tracking-[0.2em] uppercase" style={{ color: `${t}bb` }}>Kepada Yth.</p>
          <p className="text-[10px] font-semibold" style={{ color: t, fontFamily: "'Playfair Display', serif" }}>Ibu Sari &amp; Keluarga</p>
        </div>
        <h3 className="text-[20px] font-bold leading-none" style={{ color: t, fontFamily: "'Playfair Display', serif", textShadow: `0 2px 10px ${p}` }}>Dimas</h3>
        <p className="text-[14px]" style={{ color: a }}>&amp;</p>
        <h3 className="text-[20px] font-bold leading-none" style={{ color: t, fontFamily: "'Playfair Display', serif", textShadow: `0 2px 10px ${p}` }}>Anisa</h3>
        <div className="mt-2 px-3 py-1.5 text-[7px] tracking-[0.2em] uppercase" style={{ border: `1px solid ${a}66`, color: a }}>Masuk Sekarang</div>
      </div>
    </div>
  )
}

function EnvelopeMini() {
  const p = '#3d1020', a = '#f5a0b5', t = '#fff0f5'
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ backgroundColor: p }}>
      <Image src="/images/templates/casual.jpg" alt="" fill className="object-cover" sizes="200px" style={{ opacity: 0.15 }} />
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(40,10,22,0.75)' }} />
      {/* Guest name above */}
      <div className="relative z-10 text-center mb-3">
        <p className="text-[7px] tracking-[0.2em] uppercase" style={{ color: `${t}aa` }}>Kepada Yth.</p>
        <p className="text-[10px] font-semibold" style={{ color: t, fontFamily: "'Playfair Display', serif" }}>Bapak Ahmad &amp; Keluarga</p>
      </div>
      {/* Envelope */}
      <div className="relative z-10 w-[75%] rounded-lg overflow-hidden" style={{ aspectRatio: '3/2', backgroundColor: a }}>
        <div className="absolute top-0 left-0 right-0" style={{ height: '50%', backgroundColor: `${a}dd`, clipPath: 'polygon(0 0, 50% 100%, 100% 0)' }} />
        <div className="absolute bottom-3 inset-x-0 flex flex-col items-center">
          <p className="text-[7px] tracking-[0.2em] uppercase" style={{ color: p }}>Undangan</p>
          <p className="text-[12px] font-bold" style={{ color: p, fontFamily: "'Playfair Display', serif" }}>Fajar &amp; Mawar</p>
        </div>
      </div>
      <div className="relative z-10 mt-3 px-3 py-1.5 text-[7px] tracking-[0.2em] uppercase" style={{ border: `1px solid ${a}88`, color: a }}>Buka Undangan</div>
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
