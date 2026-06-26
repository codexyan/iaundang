'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MessageCircle } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const

const defaultFaqs = [
  { q: 'Bisa lihat hasilnya sebelum bayar?', a: 'Bisa. Pilih template, masukkan nama kalian, dan langsung lihat preview-nya. Bayar hanya saat kalian sudah cocok dan siap publish.' },
  { q: 'Apa tamu perlu install aplikasi?', a: 'Tidak. Tamu cukup tap link yang kalian kirim via WhatsApp, undangan langsung terbuka di browser HP mereka.' },
  { q: 'Berapa lama undangan tetap aktif?', a: 'Tergantung paket yang dipilih. Mulai dari 30 hari hingga 180 hari. Cukup untuk persiapan, hari H, dan beberapa bulan setelahnya sebagai kenangan.' },
  { q: 'Bisa edit setelah dipublish?', a: 'Bisa, kapan saja. Ganti foto, ubah detail acara, ganti musik. Semua tanpa biaya tambahan.' },
  { q: 'Bagaimana cara kirim undangan ke tamu?', a: 'Setelah publish, kalian dapat link unik (contoh: rizky-aulia.iaundang.id). Salin dan kirim ke tamu lewat WhatsApp atau media lainnya.' },
  { q: 'iaundang baru diluncurkan, apakah bisa dipercaya?', a: 'Kami membangun iaundang dengan standar kualitas tinggi. Teknologi modern, desain premium, dan tim yang responsif via WhatsApp. Kalian bisa coba gratis dulu dan lihat sendiri kualitasnya sebelum memutuskan.' },
  { q: 'Bagaimana kalau butuh bantuan?', a: 'Hubungi kami via WhatsApp. Tim kami siap membantu dan membalas dalam 1 hari kerja.' },
]

export default function FAQ({ items, whatsapp }: { items?: { q: string; a: string }[]; whatsapp?: string }) {
  const faqs = items ?? defaultFaqs
  const waNumber = whatsapp || '628123456789'
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 sm:py-28 lg:py-32 bg-mist">
      <div className="max-w-2xl mx-auto px-5 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-12"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-graphite bg-graphite/[0.04] border border-hairline px-3.5 py-1.5 rounded-full mb-5">
            FAQ
          </span>
          <h2 className="font-sans text-3xl sm:text-4xl font-bold text-graphite">
            Pertanyaan umum
          </h2>
          <p className="mt-3 text-ash text-[15px]">
            Belum menemukan jawabannya? Chat kami via WhatsApp.
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-16px' }}
                transition={{ duration: 0.4, delay: i * 0.04, ease: EASE }}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'bg-chalk border-hairline'
                    : 'bg-chalk border-hairline/60 hover:border-hairline'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left gap-4 group"
                >
                  <span className={`font-medium text-[14px] leading-snug transition-colors duration-200 ${
                    isOpen ? 'text-graphite' : 'text-carbon group-hover:text-graphite'
                  }`}>
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
                    className="shrink-0"
                  >
                    <ChevronDown size={16} className={`transition-colors duration-200 ${
                      isOpen ? 'text-graphite' : 'text-smoke'
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
                      <p className="px-5 sm:px-6 pb-5 sm:pb-6 text-[14px] text-concrete leading-[1.7]">{faq.a}</p>
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
          className="mt-10 text-center bg-chalk rounded-2xl border border-hairline p-6 sm:p-8"
        >
          <div className="w-10 h-10 rounded-xl bg-mist flex items-center justify-center mx-auto mb-3">
            <MessageCircle size={18} className="text-graphite" />
          </div>
          <p className="text-[14px] text-graphite font-semibold mb-1">Masih ada pertanyaan?</p>
          <p className="text-[13px] text-ash mb-5">Kami senang membantu, balas cepat di hari kerja.</p>
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.span
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 bg-graphite hover:bg-carbon text-chalk text-[13px] font-semibold px-6 py-2.5 rounded-button transition-colors"
            >
              Chat via WhatsApp
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
