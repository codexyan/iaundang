'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MessageCircle } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const

const defaultFaqs = [
  { q: 'Bisa dilihat dulu hasilnya sebelum bayar?', a: 'Bisa. Pilih gaya yang kalian suka, masukkan nama kalian berdua, dan lihat sendiri hasilnya. Bayar hanya kalau sudah benar-benar cocok dan mau dipublish.' },
  { q: 'Tamu perlu download atau install sesuatu?', a: 'Tidak perlu sama sekali. Tamu cukup tap link yang kalian kirim lewat WhatsApp, dan undangan langsung terbuka di browser HP mereka.' },
  { q: 'Berapa lama undangan bisa diakses setelah bayar?', a: '6 bulan penuh sejak tanggal pembelian. Lebih dari cukup untuk sebelum hari H, saat hari H, dan beberapa bulan setelahnya.' },
  { q: 'Bisa ganti foto atau detail acara setelah dipublish?', a: 'Bisa, kapan saja dan sebanyak yang kalian mau. Edit info acara, ganti foto, ganti musik, bahkan ganti gaya tampilan tanpa biaya tambahan.' },
  { q: 'Bagaimana cara tamu menerima undangan?', a: 'Setelah undangan kalian publish, kalian dapat link unik seperti ikhwal-fani.iaundang.id. Salin dan kirim ke tamu lewat WhatsApp, Line, atau media apapun.' },
  { q: 'Kalau ada yang membingungkan, ada yang bisa dihubungi?', a: 'Tentu. Hubungi kami lewat WhatsApp dan kami akan bantu dengan senang hati. Kami balas dalam 1 hari kerja.' },
]

export default function FAQ({ items }: { items?: { q: string; a: string }[] }) {
  const faqs = items ?? defaultFaqs
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 sm:py-28 lg:py-32 bg-[#fafaf9]">
      <div className="max-w-2xl mx-auto px-5 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-forest-600 bg-forest-50/80 border border-forest-100 px-3.5 py-1.5 rounded-full mb-5">
            FAQ
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Pertanyaan umum
          </h2>
          <p className="mt-3 text-stone-400 text-[15px]">
            Masih ada yang mengganjal? Chat langsung ke kami.
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-16px' }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: EASE }}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'bg-white border-stone-200 shadow-lg shadow-stone-100/80'
                    : 'bg-white border-stone-100 hover:border-stone-200'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left gap-4 group"
                >
                  <span className={`font-medium text-[14px] leading-snug transition-colors duration-200 ${
                    isOpen ? 'text-stone-900' : 'text-stone-700 group-hover:text-stone-900'
                  }`}>
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                    className="shrink-0"
                  >
                    <ChevronDown size={16} className={`transition-colors duration-200 ${
                      isOpen ? 'text-forest-500' : 'text-stone-300'
                    }`} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-[14px] text-stone-500 leading-[1.7]">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10 text-center bg-white rounded-2xl border border-stone-100 p-6 sm:p-8 shadow-sm"
        >
          <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center mx-auto mb-3">
            <MessageCircle size={18} className="text-forest-500" />
          </div>
          <p className="text-[14px] text-stone-800 font-semibold mb-1">Masih ada pertanyaan?</p>
          <p className="text-[13px] text-stone-400 mb-5">Kami senang membantu, balas cepat di hari kerja.</p>
          <a
            href="https://wa.me/628123456789"
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-forest-500 hover:bg-forest-600 text-white text-[13px] font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              Chat via WhatsApp
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
