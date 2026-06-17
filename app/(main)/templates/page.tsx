import Link from 'next/link'
import type { Metadata } from 'next'
import { TEMPLATES } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Pilih Template Undangan | iaundang',
  description: 'Lihat semua template undangan digital pernikahan. Coba gratis dengan nama kalian sebelum beli.',
}

const STYLES: Record<string, {
  bg: string
  nameColor: string
  ampColor: string
  dividerColor: string
  labelColor: string
  ctaBg: string
  ctaText: string
}> = {
  'modern-white': {
    bg: 'from-rose-50 via-white to-amber-50',
    nameColor: 'text-gray-900',
    ampColor: 'text-rose-400',
    dividerColor: 'bg-rose-200',
    labelColor: 'text-gray-400',
    ctaBg: 'bg-rose-600 hover:bg-rose-700',
    ctaText: 'text-white',
  },
  'floral-garden': {
    bg: 'from-pink-100 via-fuchsia-50 to-rose-50',
    nameColor: 'text-pink-900',
    ampColor: 'text-pink-400',
    dividerColor: 'bg-pink-200',
    labelColor: 'text-pink-400',
    ctaBg: 'bg-pink-700 hover:bg-pink-800',
    ctaText: 'text-white',
  },
  'dark-elegant': {
    bg: 'from-gray-900 via-gray-800 to-gray-900',
    nameColor: 'text-amber-100',
    ampColor: 'text-amber-400',
    dividerColor: 'bg-amber-700',
    labelColor: 'text-amber-700',
    ctaBg: 'bg-amber-500 hover:bg-amber-600',
    ctaText: 'text-gray-900',
  },
}

const DESCRIPTIONS: Record<string, { mood: string; cocokUntuk: string }> = {
  'modern-white': {
    mood: 'Bersih, elegan, dan timeless.',
    cocokUntuk: 'Pasangan yang suka tampilan minimalis dan simpel.',
  },
  'floral-garden': {
    mood: 'Hangat, penuh bunga, dan romantis.',
    cocokUntuk: 'Pasangan yang ingin nuansa feminin dan penuh warna.',
  },
  'dark-elegant': {
    mood: 'Mewah, gelap, dan berkesan kuat.',
    cocokUntuk: 'Pasangan yang ingin tampil beda dan berkesan.',
  },
}

export default function TemplatesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 text-center">
          <Link href="/" className="text-sm text-gray-400 hover:text-rose-600 transition-colors mb-6 inline-block">
            ← Kembali ke beranda
          </Link>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mt-2">
            Pilih gaya undanganmu
          </h1>
          <p className="mt-3 text-gray-500 text-sm max-w-md mx-auto">
            Klik <strong>Coba Gratis</strong> untuk lihat tampilan undangan dengan nama kalian sendiri.
            Tidak perlu daftar.
          </p>
        </div>
      </div>

      {/* Template grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TEMPLATES.map((tpl) => {
            const s = STYLES[tpl.id]
            const d = DESCRIPTIONS[tpl.id]

            return (
              <div
                key={tpl.id}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                {/* Thumbnail besar */}
                <Link href={`/demo/${tpl.id}`} className="block group">
                  <div className={`aspect-[2/3] bg-gradient-to-br ${s.bg} flex flex-col items-center justify-center px-10 relative overflow-hidden`}>
                    {/* Ornamen */}
                    <div className={`w-10 h-px ${s.dividerColor} mb-7 opacity-60`} />

                    <p className={`text-[9px] uppercase tracking-[0.35em] ${s.labelColor} mb-5`}>
                      Undangan Pernikahan
                    </p>

                    <p className={`font-serif text-3xl sm:text-4xl font-bold text-center leading-tight ${s.nameColor}`}>
                      Namamu
                    </p>
                    <p className={`font-serif text-2xl my-3 ${s.ampColor}`}>&amp;</p>
                    <p className={`font-serif text-3xl sm:text-4xl font-bold text-center leading-tight ${s.nameColor}`}>
                      Namanya
                    </p>

                    <div className={`w-10 h-px ${s.dividerColor} mt-7 mb-5 opacity-60`} />
                    <p className={`text-[9px] tracking-[0.25em] ${s.labelColor}`}>
                      12 • 08 • 2025
                    </p>

                    {/* Hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-gray-900 text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg">
                        Coba dengan namamu →
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Info */}
                <div className="p-6 flex flex-col flex-1">
                  <h2 className="font-serif text-lg font-bold text-gray-900">{tpl.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{d.mood}</p>
                  <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                    <span className="font-medium text-gray-500">Cocok untuk:</span> {d.cocokUntuk}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-3 mb-5">
                    {tpl.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto space-y-2">
                    <Link
                      href={`/demo/${tpl.id}`}
                      className={`block w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors ${s.ctaBg} ${s.ctaText}`}
                    >
                      Coba Gratis: Masukkan Namamu
                    </Link>
                    <Link
                      href={`/register?template=${tpl.id}`}
                      className="block w-full text-center py-2.5 rounded-xl text-xs font-medium border border-gray-200 text-gray-500 hover:border-rose-300 hover:text-rose-600 transition-colors"
                    >
                      Langsung beli tanpa coba
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer note */}
        <div className="mt-12 text-center bg-white border border-gray-100 rounded-2xl px-6 py-6">
          <p className="text-sm text-gray-500">
            Semua template bisa dikustomisasi: nama, tanggal, lokasi, foto, dan musik.
          </p>
          <p className="text-xs text-gray-400 mt-1.5">
            Template baru akan terus ditambah. Sudah beli? Template lama tetap bisa dipakai.
          </p>
        </div>
      </div>
    </div>
  )
}
