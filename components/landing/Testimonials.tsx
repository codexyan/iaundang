'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const EASE = [0.16, 1, 0.3, 1] as const

interface Review {
  names: string
  date: string
  template: string
  quote: string
  initial: string
  color: string
}

const defaultReviews: Review[] = [
  { names: 'Rizky & Aulia', date: 'Maret 2026', template: 'Modern', quote: 'Tamunya banyak yang nanya "link undangannya keren banget, pakai apa?". Langsung kami rekomendasiin Akundang. Setup-nya cepat banget, kurang dari 30 menit sudah jadi.', initial: 'RA', color: '#2c4a34' },
  { names: 'Dimas & Nadia', date: 'Februari 2026', template: 'Casual', quote: 'Kami berdua kerja penuh waktu dan tidak ada waktu ngurusin undangan fisik. Akundang solusinya: simple, cantik, dan tamu bisa RSVP langsung dari HP mereka.', initial: 'DN', color: '#c9a961' },
  { names: 'Fajar & Syifa', date: 'April 2026', template: 'Traditional', quote: 'Yang paling suka fitur nama tamu personalnya. Tamu merasa diperhatikan karena nama mereka muncul langsung di undangan. Banyak yang WA bilang terkesan.', initial: 'FS', color: '#4a6355' },
  { names: 'Hendra & Mita', date: 'Januari 2026', template: 'Modern', quote: 'Harga segini sudah dapat semua fitur lengkap, tidak ada tambahan biaya. Undangan kami masih bisa dibuka 6 bulan setelah nikah untuk kenangan.', initial: 'HM', color: '#8fa99a' },
]

export default function Testimonials({ reviews: propReviews }: { reviews?: Review[] }) {
  const reviews = propReviews ?? defaultReviews

  return (
    <section id="testimoni" className="py-20 sm:py-28 lg:py-32 bg-[#fafaf9] overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-14 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-forest-600 bg-forest-50/80 border border-forest-100 px-3.5 py-1.5 rounded-full mb-5">
            Testimoni
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Pasangan yang sudah merasakannya
          </h2>
          <p className="mt-3 text-stone-400 text-[15px] max-w-sm mx-auto">
            Bukan dari kami — dari mereka yang sudah pakai.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {reviews.map((r, i) => (
            <motion.div
              key={r.names}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
              className="group relative bg-white rounded-2xl p-6 sm:p-7 border border-stone-100 hover:border-stone-200/80 transition-all duration-300 hover:shadow-xl hover:shadow-stone-100/80"
            >
              {/* Top accent line */}
              <div
                className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(90deg, transparent, ${r.color}40, transparent)` }}
              />

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={13} className="fill-gold-500 text-gold-500" />
                ))}
              </div>

              <p className="text-[14px] text-stone-600 leading-[1.7] mb-6">
                &ldquo;{r.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-stone-50">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                  style={{ background: `linear-gradient(135deg, ${r.color}, ${r.color}cc)` }}
                >
                  {r.initial}
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-stone-800">{r.names}</p>
                  <p className="text-[11px] text-stone-400">{r.date} · Template {r.template}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
