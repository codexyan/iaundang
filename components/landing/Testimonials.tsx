'use client'

import { motion } from 'framer-motion'

const reviews = [
  {
    names: 'Rizky & Aulia',
    date: 'Maret 2026',
    template: 'Modern',
    quote: 'Tamunya banyak yang nanya "link undangannya keren banget, pakai apa?". Langsung kami rekomendasiin Akundang. Setup-nya cepat banget, kurang dari 30 menit sudah jadi.',
    initial: 'RA',
    color: '#2c4a34',
  },
  {
    names: 'Dimas & Nadia',
    date: 'Februari 2026',
    template: 'Casual',
    quote: 'Kami berdua kerja penuh waktu dan tidak ada waktu ngurusin undangan fisik. Akundang solusinya: simple, cantik, dan tamu bisa RSVP langsung dari HP mereka.',
    initial: 'DN',
    color: '#9a7d3f',
  },
  {
    names: 'Fajar & Syifa',
    date: 'April 2026',
    template: 'Traditional',
    quote: 'Yang paling suka fitur nama tamu personalnya. Tamu merasa diperhatikan karena nama mereka muncul langsung di undangan. Banyak yang WA bilang terkesan.',
    initial: 'FS',
    color: '#4a6355',
  },
  {
    names: 'Hendra & Mita',
    date: 'Januari 2026',
    template: 'Modern',
    quote: 'Harga segini sudah dapat semua fitur lengkap, tidak ada tambahan biaya. Undangan kami masih bisa dibuka 6 bulan setelah nikah untuk kenangan.',
    initial: 'HM',
    color: '#5d7a6a',
  },
]

export default function Testimonials() {
  return (
    <section className="py-14 sm:py-20 lg:py-28 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-14"
        >
          <p className="text-xs font-semibold tracking-[.18em] uppercase text-forest-400 mb-3">Kata mereka</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900">
            Pasangan yang sudah merasakannya
          </h2>
          <p className="mt-3 text-stone-400 text-sm max-w-xs mx-auto">
            Bukan dari kami, dari mereka yang sudah pakai.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {reviews.map((r, i) => (
            <motion.div
              key={r.names}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative rounded-3xl p-5 sm:p-7 border border-stone-100 bg-stone-50 hover:border-stone-200 hover:bg-white transition-all duration-300 hover:shadow-lg hover:shadow-stone-100"
            >
              {/* Quote mark */}
              <div className="font-serif text-6xl leading-none text-stone-200 absolute top-4 right-6 select-none pointer-events-none">&ldquo;</div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, j) => (
                  <svg key={j} className="w-3.5 h-3.5 fill-gold-500 text-gold-500" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-[14px] text-stone-600 leading-relaxed mb-6 relative z-10">
                &ldquo;{r.quote}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                  style={{ backgroundColor: r.color }}
                >
                  {r.initial}
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-800 leading-none">{r.names}</p>
                  <p className="text-[11px] text-stone-400 mt-0.5">{r.date} · Template {r.template}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  )
}
