'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Users, ClipboardCheck, Music2, Globe, ImageIcon, ChevronRight } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const

/* ─── Visual Components ─── */

function VisualPersonal({ guestName = 'Bapak Andi & Keluarga', groomName = 'Rizky', brideName = 'Aulia' }: { guestName?: string; groomName?: string; brideName?: string }) {
  const a = '#d4af37', t = '#ffffff'
  return (
    <div className="relative w-full max-w-[280px] mx-auto">
      <div className="relative rounded-[24px] sm:rounded-[28px] overflow-hidden shadow-2xl" style={{ padding: 4, background: 'linear-gradient(145deg, #1c1c1e 0%, #111 50%, #000 100%)', boxShadow: '0 40px 80px rgba(0,0,0,0.3), inset 0 0 0 0.5px rgba(255,255,255,0.12)' }}>
        <div className="absolute left-1/2 -translate-x-1/2 z-30 rounded-full" style={{ top: 7, width: 60, height: 16, backgroundColor: '#000' }} />
        <div className="rounded-[21px] sm:rounded-[25px] overflow-hidden relative" style={{ aspectRatio: '9/19.5', backgroundColor: '#0a1a0a' }}>
          <Image src="/images/templates/wedding-bg.jpg" alt="Preview undangan personalisasi" fill className="object-cover" sizes="280px" quality={90} style={{ opacity: 0.5 }} />
          <div className="absolute inset-0 z-[2]" style={{ background: 'radial-gradient(ellipse at center 40%, rgba(10,20,10,0.25) 0%, rgba(10,20,10,0.8) 100%)' }} />
          <div className="absolute inset-0 z-20 flex flex-col text-center">
            <div className="pt-14 px-5">
              <p className="text-[10px] tracking-[0.35em] uppercase" style={{ color: a }}>The Wedding of</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center px-5">
              <h3 className="text-[34px] font-bold leading-[0.85]" style={{ color: t, fontFamily: "var(--font-geist-sans), sans-serif", textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{groomName}</h3>
              <p className="text-[20px] my-1" style={{ color: a, fontFamily: "var(--font-geist-sans), sans-serif", fontStyle: 'italic', fontWeight: 300 }}>&amp;</p>
              <h3 className="text-[34px] font-bold leading-[0.85]" style={{ color: t, fontFamily: "var(--font-geist-sans), sans-serif", textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{brideName}</h3>
            </div>
            <div className="pb-8 px-5">
              <div className="inline-block px-5 py-3 rounded-xl" style={{ backgroundColor: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', backdropFilter: 'blur(8px)' }}>
                <p className="text-[8px] tracking-[0.3em] uppercase mb-0.5" style={{ color: `${a}aa` }}>Kepada Yth.</p>
                <p className="text-[14px] font-semibold" style={{ color: t, fontFamily: "var(--font-geist-sans), sans-serif" }}>{guestName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function VisualRSVP() {
  return (
    <div className="relative w-full max-w-[300px] mx-auto">
      <div className="bg-chalk rounded-3xl border border-hairline p-5">
        <p className="text-[11px] font-bold text-graphite mb-4">Konfirmasi Kehadiran</p>
        <div className="space-y-2.5">
          <div className="bg-mist rounded-xl px-3 py-2.5 border border-hairline">
            <p className="text-[8px] text-ash mb-0.5">Nama lengkap</p>
            <p className="text-[10px] text-graphite font-medium">Bapak Andi Sanjaya</p>
          </div>
          <div className="bg-mist rounded-xl px-3 py-2.5 border border-hairline">
            <p className="text-[8px] text-ash mb-0.5">Jumlah tamu</p>
            <p className="text-[10px] text-graphite font-medium">2 orang</p>
          </div>
          <div className="flex gap-2">
            {['Hadir', 'Tidak Hadir'].map((opt, i) => (
              <button key={opt}
                className={`flex-1 py-2 rounded-xl text-[9px] font-semibold transition-all ${
                  i === 0 ? 'bg-graphite text-chalk' : 'bg-mist text-concrete'
                }`}>
                {opt}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4 space-y-1.5">
          <p className="text-[8px] font-semibold text-ash uppercase tracking-wide">Rekap otomatis</p>
          {['Andi S. · Hadir · 2 orang', 'Sinta R. · Hadir · 3 orang', 'Hendra W. · Tidak hadir'].map((g) => (
            <div key={g} className="flex items-center justify-between bg-mist rounded-lg px-2.5 py-1.5">
              <p className="text-[9px] text-concrete">{g.split(' · ')[0]}</p>
              <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded-full ${
                g.includes('Tidak') ? 'bg-mist text-concrete' : 'bg-mist text-graphite'
              }`}>{g.includes('Tidak') ? 'Tidak' : 'Hadir'}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function VisualMusic() {
  return (
    <div className="relative w-full max-w-[300px] mx-auto">
      <div className="bg-graphite rounded-3xl border border-carbon p-5">
        <div className="rounded-2xl mb-4 flex items-center justify-center"
          style={{ height: 120, background: '#171717' }}>
          <div className="text-center">
            <div className="w-12 h-12 rounded-full border-2 border-white/20 flex items-center justify-center mx-auto mb-2"
              style={{ background: 'rgba(255,255,255,0.08)' }}>
              <svg className="w-5 h-5 text-white/60" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
              </svg>
            </div>
            <p className="text-white font-semibold text-[11px]">A Thousand Years</p>
            <p className="text-white/40 text-[9px]">Christina Perri</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-[8px] text-concrete">1:24</span>
          <div className="flex-1 h-1 bg-carbon rounded-full overflow-hidden">
            <motion.div className="h-full rounded-full bg-ash"
              animate={{ width: ['35%', '60%', '35%'] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }} />
          </div>
          <span className="text-[8px] text-concrete">4:45</span>
        </div>
        <div className="flex items-center justify-center gap-5">
          {['⏮', '⏸', '⏭'].map(c => (
            <button key={c} className="text-white/60 hover:text-white text-sm">{c}</button>
          ))}
        </div>
      </div>
      <div className="mt-3 bg-chalk rounded-2xl border border-hairline p-3 space-y-1.5">
        <p className="text-[8px] font-bold text-ash uppercase tracking-wide px-1">Pilih lagu lain</p>
        {['Perfect · Ed Sheeran', 'All of Me · John Legend', 'Upload lagumu sendiri'].map((s, i) => (
          <div key={s} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${i === 2 ? 'border border-dashed border-hairline' : 'hover:bg-mist'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[8px] ${i === 2 ? 'bg-mist' : 'bg-hairline'}`}>
              {i === 2 ? '＋' : '♪'}
            </div>
            <p className="text-[9px] text-concrete font-medium">{s}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function VisualDomain() {
  return (
    <div className="relative w-full max-w-[320px] mx-auto">
      <div className="bg-hairline rounded-2xl overflow-hidden border border-smoke">
        <div className="bg-hairline px-4 py-2.5 flex items-center gap-2">
          <div className="flex gap-1.5">
            {['#ff5f57','#febc2e','#28c840'].map(c => (
              <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c }} />
            ))}
          </div>
          <div className="flex-1 bg-chalk rounded-md px-3 py-1 flex items-center gap-1.5">
            <svg className="w-2.5 h-2.5 text-graphite shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd"/>
            </svg>
            <span className="text-[9px] text-ash font-mono">
              <span className="text-concrete font-semibold">rizky-aulia</span>.iaundang.id
            </span>
          </div>
        </div>
        <div className="bg-chalk p-4" style={{ minHeight: 140 }}>
          <div className="flex items-start gap-3">
            <div className="w-12 h-16 rounded-lg bg-hairline shrink-0" />
            <div className="flex-1 space-y-1.5 pt-1">
              <div className="h-2 bg-hairline rounded-full w-3/4" />
              <div className="h-2 bg-hairline rounded-full w-1/2" />
              <div className="h-2 bg-hairline rounded-full w-2/3" />
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <div className="flex-1 h-6 bg-graphite rounded-lg flex items-center justify-center">
              <div className="h-1.5 bg-white/30 rounded-full w-12" />
            </div>
            <div className="flex-1 h-6 bg-hairline border border-hairline rounded-lg" />
          </div>
        </div>
      </div>
      <motion.div
        animate={{ y: [0, -6, 0] }} transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-4 right-0 sm:-right-2 bg-chalk rounded-2xl px-3.5 py-2.5 border border-hairline max-w-[160px] max-sm:scale-90"
      >
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-full bg-graphite flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/></svg>
          </div>
          <p className="text-[9px] font-bold text-graphite">Bagikan via WA</p>
        </div>
        <p className="text-[8px] text-ash font-mono">rizky-aulia.iaundang.id</p>
      </motion.div>
    </div>
  )
}

function VisualGallery() {
  const colors = [
    ['#e8d5c4','#d4c0ad','#c4a98e'],
    ['#b5c9b7','#9ab59c','#7d9e80'],
    ['#c9b8d4','#b5a3c0','#9d8aab'],
    ['#d4c5b0','#c0ae96','#a8957a'],
  ]
  return (
    <div className="relative w-full max-w-[300px] mx-auto">
      <div className="bg-chalk rounded-3xl border border-hairline p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-graphite">Galeri Foto</p>
          <span className="text-[8px] text-ash bg-mist px-2 py-0.5 rounded-full">24 foto</span>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {colors.flatMap(row => row).map((c, i) => (
            <motion.div
              key={c}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.3 }}
              className="rounded-xl overflow-hidden"
              style={{ aspectRatio: '1', backgroundColor: c }}
            >
              {i === 4 && (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-4 h-4 rounded-full border-2 border-white/50 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-white/40" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 bg-mist rounded-xl px-3 py-2">
          <span className="text-[10px]">🖼</span>
          <p className="text-[9px] text-concrete">Tap foto untuk tampilan penuh</p>
        </div>
      </div>
    </div>
  )
}

/* ─── Feature Data ─── */

interface PersonalisasiData {
  guestName: string
  groomName: string
  brideName: string
}

interface FeatureItem {
  id: string
  icon: typeof Users
  tag: string
  title: string
  desc: string
  bullets: string[]
  color: string
  visual: React.ReactNode
}

function getFeatures(personalisasi?: PersonalisasiData): FeatureItem[] {
  return [
    {
      id: 'personal',
      icon: Users,
      tag: 'Personalisasi',
      title: 'Satu link, setiap tamu disambut namanya',
      desc: 'Setiap tamu melihat namanya sendiri di halaman pembuka. Terasa eksklusif, bukan broadcast massal.',
      bullets: [
        'Import daftar tamu via spreadsheet',
        'Nama tampil otomatis di halaman pembuka',
        'Link unik per tamu, tidak bisa di-forward',
      ],
      color: '#0a0a0a',
      visual: <VisualPersonal guestName={personalisasi?.guestName} groomName={personalisasi?.groomName} brideName={personalisasi?.brideName} />,
    },
    {
      id: 'rsvp',
      icon: ClipboardCheck,
      tag: 'RSVP Digital',
      title: 'Konfirmasi kehadiran dalam 10 detik',
      desc: 'Tamu isi nama dan pilih hadir, selesai. Kalian pantau rekap kehadiran langsung dari dashboard.',
      bullets: [
        'Hingga 500 tamu per undangan',
        'Rekap otomatis hadir & tidak hadir',
        'Export ke spreadsheet kapan saja',
      ],
      color: '#0a0a0a',
      visual: <VisualRSVP />,
    },
    {
      id: 'music',
      icon: Music2,
      tag: 'Musik Pengiring',
      title: 'Lagu favorit kalian menyambut setiap tamu',
      desc: 'Musik mengalun otomatis begitu undangan dibuka. Pilih dari koleksi kami atau upload lagu sendiri.',
      bullets: [
        'Upload file MP3 milik sendiri',
        'Pilih dari koleksi lagu populer',
        'Volume bisa diatur oleh tamu',
      ],
      color: '#0a0a0a',
      visual: <VisualMusic />,
    },
    {
      id: 'domain',
      icon: Globe,
      tag: 'Link Undangan',
      title: 'Alamat undangan atas nama kalian',
      desc: 'Bukan link random. Undangan kalian punya subdomain sendiri yang mudah diingat dan dibagikan via WhatsApp.',
      bullets: [
        'Format: nama-pasangan.iaundang.id',
        'Langsung bisa dibagikan via WhatsApp',
        'Aktif selama 6 bulan penuh',
      ],
      color: '#0a0a0a',
      visual: <VisualDomain />,
    },
    {
      id: 'gallery',
      icon: ImageIcon,
      tag: 'Galeri Foto',
      title: 'Ceritakan kisah kalian lewat galeri foto',
      desc: 'Upload foto prewedding atau momen bersama keluarga. Tamu bisa menikmati galeri dalam tampilan fullscreen.',
      bullets: [
        'Layout grid yang rapi dan elegan',
        'Lightbox fullscreen saat di-tap',
        'Upload hingga 20 foto',
      ],
      color: '#0a0a0a',
      visual: <VisualGallery />,
    },
  ]
}

/* ─── Main Component ─── */

export default function FeatureShowcase({ personalisasi }: { personalisasi?: PersonalisasiData }) {
  const features = getFeatures(personalisasi)
  const [activeIdx, setActiveIdx] = useState(0)
  const active = features[activeIdx]

  return (
    <section id="fitur" className="py-20 sm:py-28 lg:py-32 bg-mist overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-12 sm:mb-14"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-graphite bg-graphite/[0.04] border border-hairline px-3.5 py-1.5 rounded-full mb-5">
            Fitur Unggulan
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-graphite leading-snug">
            Fitur yang benar-benar dipakai
          </h2>
          <p className="mt-3 text-ash text-[15px] max-w-md mx-auto leading-relaxed">
            Dari personalisasi nama tamu hingga RSVP otomatis. Semua dalam satu undangan yang elegan.
          </p>
        </motion.div>

        {/* Feature Tab Pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
          className="flex flex-wrap justify-center gap-2 sm:gap-2.5 mb-12 sm:mb-16"
        >
          {features.map((f, i) => {
            const Icon = f.icon
            const isActive = i === activeIdx
            return (
              <button
                key={f.id}
                onClick={() => setActiveIdx(i)}
                className={`group relative flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-[12px] sm:text-[13px] font-semibold transition-all duration-300 ${
                  isActive
                    ? 'text-chalk bg-graphite'
                    : 'text-concrete bg-chalk border border-hairline hover:border-smoke hover:text-graphite'
                }`}
              >
                <Icon size={15} className={isActive ? 'text-chalk/80' : 'text-ash group-hover:text-concrete'} />
                <span className="hidden sm:inline">{f.tag}</span>
                <span className="sm:hidden">{f.tag.split(' ')[0]}</span>
              </button>
            )
          })}
        </motion.div>

        {/* Active Feature: content + visual */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="relative rounded-3xl border border-hairline bg-chalk overflow-hidden">
              <div className="h-px bg-graphite" />

              <div className="flex flex-col lg:flex-row">
                {/* Left: Copy */}
                <div className="flex-1 p-7 sm:p-10 lg:p-12 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-6">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center bg-mist border border-hairline"
                    >
                      <active.icon size={20} className="text-graphite" />
                    </div>
                    <span
                      className="text-[11px] font-semibold tracking-[0.06em] uppercase px-3 py-1 rounded-full text-graphite bg-mist border border-hairline"
                    >
                      {active.tag}
                    </span>
                  </div>

                  <h3 className="font-sans text-2xl sm:text-3xl font-bold text-graphite leading-tight mb-4">
                    {active.title}
                  </h3>
                  <p className="text-concrete text-[15px] leading-relaxed mb-7">
                    {active.desc}
                  </p>

                  <ul className="space-y-3">
                    {active.bullets.map(b => (
                      <li key={b} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 bg-mist">
                          <svg className="w-3 h-3 text-graphite" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                          </svg>
                        </div>
                        <span className="text-[14px] text-concrete leading-snug">{b}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Nav hint */}
                  <div className="mt-8 flex items-center gap-4">
                    <div className="flex gap-1.5">
                      {features.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveIdx(i)}
                          className="transition-all duration-300"
                          aria-label={`Fitur ${i + 1}`}
                        >
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              i === activeIdx ? 'w-6 bg-graphite' : 'w-1.5 bg-smoke hover:bg-ash'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {activeIdx < features.length - 1 && (
                      <button
                        onClick={() => setActiveIdx(activeIdx + 1)}
                        className="flex items-center gap-1 text-[12px] font-medium text-ash hover:text-graphite transition-colors"
                      >
                        Fitur berikutnya
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Right: Visual */}
                <div
                  className="flex-1 flex items-center justify-center p-7 sm:p-10 lg:p-12 lg:border-l border-t lg:border-t-0 border-hairline bg-mist"
                >
                  <motion.div
                    key={active.id + '-visual'}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1, ease: EASE }}
                  >
                    {active.visual}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-12 sm:mt-14 text-center"
        >
          <p className="text-sm text-ash mb-5">
            Semua fitur tersedia mulai paket Starter. Pilih yang sesuai kebutuhan kalian.
          </p>
          <Link href="/templates"
            className="inline-flex items-center gap-2 bg-graphite hover:bg-carbon text-chalk font-semibold px-8 py-3.5 rounded-button text-sm transition-colors">
            Lihat semua template
          </Link>
        </motion.div>

      </div>
    </section>
  )
}
