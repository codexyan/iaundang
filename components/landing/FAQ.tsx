'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

const faqs = [
  {
    q: 'Bisa dilihat dulu hasilnya sebelum bayar?',
    a: 'Bisa. Pilih gaya yang kalian suka, masukkan nama kalian berdua, dan lihat sendiri hasilnya. Bayar hanya kalau sudah benar-benar cocok dan mau dipublish.',
  },
  {
    q: 'Tamu perlu download atau install sesuatu?',
    a: 'Tidak perlu sama sekali. Tamu cukup tap link yang kalian kirim lewat WhatsApp, dan undangan langsung terbuka di browser HP mereka.',
  },
  {
    q: 'Berapa lama undangan bisa diakses setelah bayar?',
    a: '6 bulan penuh sejak tanggal pembelian. Lebih dari cukup untuk sebelum hari H, saat hari H, dan beberapa bulan setelahnya.',
  },
  {
    q: 'Bisa ganti foto atau detail acara setelah dipublish?',
    a: 'Bisa, kapan saja dan sebanyak yang kalian mau. Edit info acara, ganti foto, ganti musik, bahkan ganti gaya tampilan tanpa biaya tambahan.',
  },
  {
    q: 'Bagaimana cara tamu menerima undangan?',
    a: 'Setelah undangan kalian publish, kalian dapat link unik seperti ikhwal-fani.akundang.id. Salin dan kirim ke tamu lewat WhatsApp, Line, atau media apapun.',
  },
  {
    q: 'Kalau ada yang membingungkan, ada yang bisa dihubungi?',
    a: 'Tentu. Hubungi kami lewat WhatsApp dan kami akan bantu dengan senang hati. Kami balas dalam 1 hari kerja.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-14 sm:py-20 lg:py-24 bg-white">
      <div className="max-w-xl mx-auto px-5 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-10"
        >
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Pertanyaan umum
          </h2>
          <p className="mt-2 text-sm text-stone-400">
            Masih ada yang mengganjal? Chat langsung ke kami.
          </p>
        </motion.div>

        <div className="space-y-1.5">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-16px' }}
              transition={{ duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-2xl border border-stone-100 overflow-hidden hover:border-forest-200 transition-colors bg-stone-50"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-start justify-between px-5 py-4 text-left gap-4 group"
              >
                <span className="font-medium text-stone-700 text-sm leading-snug group-hover:text-stone-900 transition-colors">
                  {faq.q}
                </span>
                <motion.span
                  animate={{ rotate: open === i ? 45 : 0 }}
                  transition={{ duration: 0.18 }}
                  className="text-stone-400 text-xl font-light shrink-0 leading-none mt-0.5"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-sm text-stone-400 leading-relaxed">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center border border-stone-100 rounded-2xl p-6 bg-stone-50"
        >
          <p className="text-sm text-stone-700 font-medium mb-1">Masih ada pertanyaan?</p>
          <p className="text-xs text-stone-400 mb-4">Kami senang membantu, balas cepat di hari kerja.</p>
          <a
            href="https://wa.me/628123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-forest-500 hover:bg-forest-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors"
          >
            Chat via WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  )
}
