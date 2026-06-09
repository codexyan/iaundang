'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

const templates = [
  {
    id: 'modern-white',
    label: 'Casual',
    tagline: 'Hangat, simpel, dan modern',
    desc: 'Minimalis bersih dengan sentuhan hangat. Cocok untuk pasangan yang ingin tampil apa adanya namun tetap berkesan.',
    photo: '/images/templates/casual.jpg',
    overlayFrom: 'from-stone-900/10',
    overlayTo:   'to-stone-900/65',
    accent: '#e8ddd0',
  },
  {
    id: 'floral-garden',
    label: 'Traditional',
    tagline: 'Klasik, anggun, penuh makna',
    desc: 'Sentuhan tradisional khas Indonesia yang memadukan keindahan budaya dan romansa abadi.',
    photo: '/images/templates/traditional.jpg',
    overlayFrom: 'from-amber-950/10',
    overlayTo:   'to-amber-950/72',
    accent: '#f5d89e',
  },
  {
    id: 'dark-elegant',
    label: 'Modern',
    tagline: 'Berani, dramatis, tak terlupakan',
    desc: 'Tampilan kontemporer yang kuat dengan palet gelap mewah untuk kesan yang mendalam.',
    photo: '/images/templates/modern.jpg',
    overlayFrom: 'from-gray-950/5',
    overlayTo:   'to-gray-950/78',
    accent: '#c9a85c',
  },
]

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
            Tap salah satu dan rasakan langsung dengan nama kalian sendiri.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {templates.map((tpl, i) => (
            <motion.div
              key={tpl.id}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <Link href={`/demo/${tpl.id}`} className="group block">
                {/* Photo card */}
                <div className="relative rounded-2xl overflow-hidden aspect-[3/4] mb-4 shadow-sm group-hover:shadow-xl transition-shadow duration-500">
                  <Image
                    src={tpl.photo}
                    alt={tpl.label}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />

                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-b ${tpl.overlayFrom} ${tpl.overlayTo}`} />

                  {/* Label badge */}
                  <div className="absolute top-4 left-4 z-10">
                    <span
                      className="text-[10px] font-semibold tracking-[.14em] uppercase px-3 py-1 rounded-full"
                      style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(6px)', border: '1px solid rgba(255,255,255,0.25)', color: tpl.accent }}
                    >
                      {tpl.label}
                    </span>
                  </div>

                  {/* Bottom text on photo */}
                  <div className="absolute bottom-0 inset-x-0 z-10 p-5">
                    <p className="font-serif text-xl font-bold text-white leading-tight mb-1">
                      {tpl.tagline}
                    </p>
                    <p className="text-white/60 text-xs leading-relaxed line-clamp-2">{tpl.desc}</p>
                  </div>

                  {/* Hover CTA */}
                  <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="bg-white/95 text-stone-900 text-xs font-bold px-5 py-2.5 rounded-full shadow-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      Coba dengan nama kalian →
                    </span>
                  </div>
                </div>

                {/* CTA below card */}
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-stone-400 font-medium">{tpl.label}</p>
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
            Lihat semua template <ArrowRight size={13} />
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
