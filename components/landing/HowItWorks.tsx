'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Palette, CreditCard, Share2, ArrowRight, MousePointerClick, QrCode, Sparkles } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

const defaultSteps = [
  {
    title: 'Pilih desain & coba gratis',
    description: 'Pilih template yang kalian suka, masukkan nama pasangan, dan lihat hasilnya langsung. Tanpa registrasi, tanpa bayar.',
  },
  {
    title: 'Bayar sekali, langsung aktif',
    description: 'Sudah cocok? Pilih paket mulai Rp 79.000, sekali bayar, tanpa langganan. Transfer bank atau QRIS, aktif dalam 1x24 jam.',
  },
  {
    title: 'Lengkapi & bagikan ke tamu',
    description: 'Isi detail acara, upload foto, pilih musik. Salin link undangan dan kirim ke tamu lewat WhatsApp. Setiap tamu dapat undangan personal.',
  },
]

const ICONS = [Palette, CreditCard, Share2]
const HIGHLIGHTS = ['Gratis, tanpa registrasi', 'Tanpa biaya bulanan', 'Setiap tamu dapat link unik']

function StepVisual1() {
  return (
    <div className="relative w-full max-w-[260px] mx-auto">
      <div className="bg-chalk rounded-2xl border border-hairline p-4 space-y-2.5">
        {[
          { name: 'Javanese Gold', color: '#1a4a1a', accent: '#d4af37', active: true },
          { name: 'Modern White', color: '#f5f5f4', accent: '#1c1c1e', active: false },
          { name: 'Floral Garden', color: '#1a3320', accent: '#f5a0b5', active: false },
        ].map((t) => (
          <div
            key={t.name}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all ${
              t.active
                ? 'bg-mist border border-hairline'
                : 'border border-transparent hover:bg-mist'
            }`}
          >
            <div
              className="w-8 h-10 rounded-lg shrink-0"
              style={{
                background: `linear-gradient(135deg, ${t.color}, ${t.color}dd)`,
                border: `1px solid ${t.accent}30`,
              }}
            >
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: t.accent, opacity: 0.6 }} />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-[11px] font-semibold leading-tight ${t.active ? 'text-graphite' : 'text-concrete'}`}>
                {t.name}
              </p>
              <p className="text-[9px] text-ash mt-0.5">Template undangan</p>
            </div>
            {t.active && (
              <div className="w-5 h-5 rounded-full bg-graphite flex items-center justify-center shrink-0">
                <svg className="w-3 h-3 text-chalk" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>
        ))}
        <div className="pt-1">
          <div className="flex items-center gap-2 text-[10px] text-graphite font-semibold px-1">
            <MousePointerClick size={12} />
            Langsung preview dengan nama kalian
          </div>
        </div>
      </div>
    </div>
  )
}

function StepVisual2() {
  return (
    <div className="relative w-full max-w-[260px] mx-auto">
      <div className="bg-chalk rounded-2xl border border-hairline p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-bold text-graphite">Pilih Paket</p>
          <span className="text-[8px] font-semibold text-graphite bg-mist px-2 py-0.5 rounded-full border border-hairline">
            Sekali bayar
          </span>
        </div>
        <div className="space-y-2">
          {[
            { name: 'Starter', price: 'Rp 79.000', days: '30 hari', active: false },
            { name: 'Popular', price: 'Rp 149.000', days: '90 hari', active: true },
            { name: 'Eksklusif', price: 'Rp 249.000', days: '180 hari', active: false },
          ].map((p) => (
            <div
              key={p.name}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                p.active
                  ? 'bg-graphite'
                  : 'bg-mist border border-hairline'
              }`}
            >
              <div>
                <p className={`text-[11px] font-semibold ${p.active ? 'text-chalk' : 'text-carbon'}`}>{p.name}</p>
                <p className={`text-[9px] mt-0.5 ${p.active ? 'text-chalk/50' : 'text-ash'}`}>{p.days}</p>
              </div>
              <p className={`text-[12px] font-bold ${p.active ? 'text-chalk' : 'text-concrete'}`}>{p.price}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex gap-1">
            {['BCA', 'QRIS'].map((m) => (
              <span key={m} className="text-[8px] font-semibold text-concrete bg-mist px-2 py-1 rounded-md">{m}</span>
            ))}
          </div>
          <QrCode size={12} className="text-smoke ml-auto" />
        </div>
      </div>
    </div>
  )
}

function StepVisual3() {
  return (
    <div className="relative w-full max-w-[260px] mx-auto">
      <div className="bg-chalk rounded-2xl border border-hairline p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-graphite flex items-center justify-center">
            <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold text-graphite">Bagikan ke tamu</p>
            <p className="text-[8px] text-ash">Salin link, kirim via WA</p>
          </div>
        </div>
        <div className="bg-mist rounded-xl px-3 py-2 mb-2.5 flex items-center gap-2 border border-hairline">
          <span className="text-[9px] text-concrete font-mono truncate flex-1">
            <span className="text-graphite font-semibold">rizky-aulia</span>.iaundang.online
          </span>
          <span className="text-[8px] font-semibold text-graphite bg-chalk px-2 py-0.5 rounded border border-hairline shrink-0">Salin</span>
        </div>
        <div className="space-y-1.5">
          {['Bpk. Andi · terkirim ✓', 'Ibu Sinta · terkirim ✓', 'Hendra W. · terkirim ✓'].map((g) => (
            <div key={g} className="flex items-center gap-2 px-2 py-1">
              <div className="w-4 h-4 rounded-full bg-mist flex items-center justify-center shrink-0">
                <svg className="w-2.5 h-2.5 text-graphite" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-[9px] text-concrete">{g}</p>
            </div>
          ))}
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 px-1">
          <Sparkles size={10} className="text-ash" />
          <p className="text-[9px] text-ash">Nama tamu muncul otomatis di undangan</p>
        </div>
      </div>
    </div>
  )
}

const VISUALS = [StepVisual1, StepVisual2, StepVisual3]

export default function HowItWorks({ steps: propSteps }: { steps?: { title: string; description: string }[] }) {
  const steps = (propSteps ?? defaultSteps).map((s, i) => ({
    icon: ICONS[i] ?? Share2,
    title: s.title,
    desc: s.description,
    highlight: HIGHLIGHTS[i] ?? '',
  }))

  return (
    <section id="cara-kerja" className="py-24 sm:py-32 lg:py-36 bg-chalk overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        {/* Header — right-aligned for rhythm break */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mb-16 sm:mb-20 text-right max-w-xl ml-auto"
        >
          <p className="text-[12px] font-semibold tracking-[0.15em] uppercase text-ash mb-4">
            Cara Kerja
          </p>
          <h2 className="text-display-lg text-graphite">
            3 langkah. 5 menit. Selesai.
          </h2>
          <p className="mt-4 text-concrete text-[15px] leading-relaxed">
            Tanpa skill desain, tanpa download aplikasi. Semua lewat browser.
          </p>
        </motion.div>

        <div className="space-y-6 sm:space-y-0">
          {steps.map((step, i) => {
            const Icon = step.icon
            const Visual = VISUALS[i] ?? StepVisual1
            const isReversed = i % 2 !== 0

            return (
              <div key={step.title} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute left-1/2 -translate-x-1/2 top-full w-px h-6 z-0">
                    <div className="w-full h-full bg-hairline" />
                  </div>
                )}

                <motion.div
                  initial={{ opacity: 0, x: isReversed ? 32 : -32 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.7, delay: 0.05, ease: EASE }}
                  className={`relative flex flex-col ${isReversed ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-8 sm:gap-12 lg:gap-20 sm:py-8`}
                >
                  {/* Content */}
                  <div className="flex-1 max-w-md">
                    <div className="flex items-center gap-3.5 mb-5">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-graphite">
                          <Icon size={20} className="text-chalk" />
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold text-chalk bg-graphite ring-2 ring-chalk">
                          {i + 1}
                        </div>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-smoke tracking-[0.12em] uppercase">
                          Langkah {i + 1}
                        </p>
                        <h3 className="text-h3 text-graphite">
                          {step.title}
                        </h3>
                      </div>
                    </div>

                    <p className="text-[15px] text-concrete leading-relaxed mb-5 sm:pl-[62px]">
                      {step.desc}
                    </p>

                    <div className="sm:pl-[62px]">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-graphite bg-mist px-3.5 py-1.5 rounded-full border border-hairline">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {step.highlight}
                      </span>
                    </div>
                  </div>

                  {/* Visual */}
                  <motion.div
                    className="flex-1 w-full flex justify-center"
                    initial={{ opacity: 0, x: isReversed ? -24 : 24 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.65, delay: 0.15, ease: EASE }}
                  >
                    <Visual />
                  </motion.div>
                </motion.div>
              </div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-16 sm:mt-20 flex flex-col items-center gap-3"
        >
          <Link href="/templates">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group inline-flex items-center gap-2 text-chalk bg-graphite hover:bg-carbon font-semibold px-7 py-3.5 rounded-button text-[14px] transition-colors"
            >
              Mulai buat undangan
              <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
            </motion.span>
          </Link>
          <p className="text-[12px] text-ash">Coba gratis, bayar saat siap publish.</p>
        </motion.div>

      </div>
    </section>
  )
}
