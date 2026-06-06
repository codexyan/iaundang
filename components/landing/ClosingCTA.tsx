'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'

export default function ClosingCTA() {
  return (
    <section className="py-24 sm:py-32 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f1a12 0%, #1a3320 50%, #0f1a12 100%)' }}>

      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(212,175,55,0.1) 0%, transparent 65%)' }} />
        <div className="absolute -bottom-24 left-1/4 w-96 h-96 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(244,194,194,0.06) 0%, transparent 70%)' }} />
        <div className="absolute -top-20 right-1/4 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(180,200,180,0.05) 0%, transparent 70%)' }} />
      </div>

      {/* Fine grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

      <div className="relative z-10 max-w-3xl mx-auto px-5 sm:px-8 text-center">

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="text-xs font-semibold tracking-[.2em] uppercase mb-5"
          style={{ color: 'rgba(212,175,55,0.7)' }}
        >
          Mulai sekarang
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="font-serif font-bold text-white leading-[1.1] tracking-tight"
          style={{ fontSize: 'clamp(32px, 5vw, 52px)' }}
        >
          Hari spesial kalian layak<br />
          <span style={{
            background: 'linear-gradient(135deg, #b8860b 0%, #d4af37 45%, #c9952d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>dirayakan dengan indah</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 text-sm leading-relaxed max-w-md mx-auto"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          Coba dulu gratis, lihat hasilnya dengan nama kalian sendiri. Bayar hanya kalau sudah benar-benar cocok.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <Link href="/templates">
            <motion.button
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-8 py-4 rounded-2xl text-stone-900 font-semibold text-[15px] transition-all"
              style={{
                background: 'linear-gradient(135deg, #d4af37 0%, #b8860b 100%)',
                boxShadow: '0 8px 32px rgba(212,175,55,0.35)',
              }}
            >
              Pilih Template Sekarang
              <ArrowRight size={16} />
            </motion.button>
          </Link>
          <a href="https://wa.me/628123456789" target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-6 py-4 rounded-2xl text-sm font-semibold transition-colors"
              style={{ color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Tanya via WhatsApp
            </motion.button>
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="mt-6 text-[11px]"
          style={{ color: 'rgba(255,255,255,0.2)' }}
        >
          Tidak perlu kartu kredit · Coba gratis dulu · Bayar saat siap publish
        </motion.p>

      </div>
    </section>
  )
}
