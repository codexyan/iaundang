'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, MessageCircle } from 'lucide-react'

const EASE = [0.22, 1, 0.36, 1] as const

const defaultFaqs = [
  { q: 'Bisa lihat hasilnya sebelum bayar?', a: 'Bisa. Pilih template, masukkan nama kalian, dan langsung lihat preview-nya. Bayar hanya saat kalian sudah cocok dan siap publish.' },
  { q: 'Apa tamu perlu install aplikasi?', a: 'Tidak. Tamu cukup tap link yang kalian kirim via WhatsApp, undangan langsung terbuka di browser HP mereka.' },
  { q: 'Berapa lama undangan tetap aktif?', a: 'Tergantung paket yang dipilih. Mulai dari 30 hari hingga 180 hari. Cukup untuk persiapan, hari H, dan beberapa bulan setelahnya sebagai kenangan.' },
  { q: 'Bisa edit setelah dipublish?', a: 'Bisa, kapan saja. Ganti foto, ubah detail acara, ganti musik. Semua tanpa biaya tambahan.' },
  { q: 'Bagaimana cara kirim undangan ke tamu?', a: 'Setelah publish, kalian dapat link unik (contoh: rizky-aulia.iaundang.online). Salin dan kirim ke tamu lewat WhatsApp atau media lainnya.' },
  { q: 'iaundang baru diluncurkan, apakah bisa dipercaya?', a: 'Kami membangun iaundang dengan standar kualitas tinggi. Teknologi modern, desain premium, dan tim yang responsif via WhatsApp. Kalian bisa coba gratis dulu dan lihat sendiri kualitasnya sebelum memutuskan.' },
  { q: 'Bagaimana kalau butuh bantuan?', a: 'Hubungi kami via WhatsApp. Tim kami siap membantu dan membalas dalam 1 hari kerja.' },
]

export default function FAQ({ items, whatsapp }: { items?: { q: string; a: string }[]; whatsapp?: string }) {
  const faqs = items ?? defaultFaqs
  const waNumber = whatsapp || '628123456789'
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section id="faq" className="py-24 sm:py-32 lg:py-36 bg-forest-50">
      <div className="max-w-2xl mx-auto px-5 sm:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-center mb-12"
        >
          <h2 className="text-display-md text-forest-deep">
            Pertanyaan umum
          </h2>
          <p className="mt-3 text-concrete text-[15px]">
            Belum menemukan jawabannya? Chat kami via WhatsApp.
          </p>
        </motion.div>

        <div className="space-y-2">
          {faqs.map((faq, i) => {
            const isOpen = open === i
            return (
              <motion.div
                key={faq.q}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-16px' }}
                transition={{ duration: 0.45, delay: i * 0.05, ease: EASE }}
                className={`rounded-2xl border overflow-hidden transition-all duration-300 ${
                  isOpen
                    ? 'bg-chalk border-forest-light/30'
                    : 'bg-chalk border-forest-100 hover:border-forest-light/30'
                }`}
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 text-left gap-4 group"
                >
                  <span className={`font-medium text-[14px] leading-snug transition-colors duration-200 ${
                    isOpen ? 'text-forest-deep' : 'text-carbon group-hover:text-forest-deep'
                  }`}>
                    {faq.q}
                  </span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
                    className="shrink-0"
                  >
                    <ChevronDown size={16} className={`transition-colors duration-200 ${
                      isOpen ? 'text-forest' : 'text-smoke group-hover:text-ash'
                    }`} />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
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
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-10 text-center bg-chalk rounded-2xl border border-forest-100 p-6 sm:p-8"
        >
          <div className="w-10 h-10 rounded-xl bg-forest-50 flex items-center justify-center mx-auto mb-3">
            <MessageCircle size={18} className="text-forest" />
          </div>
          <p className="text-[14px] text-forest-deep font-semibold mb-1">Masih ada pertanyaan?</p>
          <p className="text-[13px] text-ash mb-5">Kami senang membantu, balas cepat di hari kerja.</p>
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 bg-forest hover:bg-forest-deep text-chalk text-[13px] font-semibold px-6 py-2.5 rounded-button transition-colors"
            >
              Chat via WhatsApp
            </motion.span>
          </a>
        </motion.div>
      </div>
    </section>
  )
}
