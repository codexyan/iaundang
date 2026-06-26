import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { templateRecords, settings } from '@/lib/db'
import type { TemplateRecord, PriceTier, FlashSale } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Pilih Template Undangan | iaundang',
  description: 'Lihat semua template undangan digital pernikahan. Coba gratis dengan nama kalian sebelum beli.',
}

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function getActiveFlashSale(tierId: string, flashSales: FlashSale[]): FlashSale | null {
  const now = new Date()
  return flashSales.find(s =>
    s.is_active &&
    new Date(s.start_date) <= now &&
    new Date(s.end_date) >= now &&
    (s.scope === 'all' || (s.scope === 'tier' && s.scope_ids.includes(tierId)))
  ) ?? null
}

function calcDiscount(price: number, sale: FlashSale): number {
  if (sale.discount_type === 'percentage') return Math.round(price * (1 - sale.discount_value / 100))
  return Math.max(0, price - sale.discount_value)
}

function TemplateCard({ rec, tier, flashSale }: {
  rec: TemplateRecord
  tier?: PriceTier
  flashSale: FlashSale | null
}) {
  const cs = rec.config.meta.color_scheme
  const opening = rec.config?.opening
  const coverPhoto = opening?.cover_photo_url || opening?.background_image
  const demoUrl = `/demo/renderer?id=${rec.id}`
  const price = tier?.price ?? rec.price
  const discountedPrice = flashSale ? calcDiscount(price, flashSale) : null

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col group">
      {/* Thumbnail */}
      <Link href={demoUrl} className="block relative">
        <div
          className="aspect-[2/3] relative overflow-hidden"
          style={{ backgroundColor: cs.primary }}
        >
          {coverPhoto && (
            <Image
              src={coverPhoto}
              alt={rec.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 33vw"
              style={{ opacity: 0.6 }}
            />
          )}
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, transparent 20%, ${cs.primary}dd 60%, ${cs.primary} 100%)` }}
          />

          {/* Template preview content */}
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-end pb-10 px-6">
            <p
              className="text-[9px] uppercase tracking-[0.35em] mb-4"
              style={{ color: `${cs.accent}cc` }}
            >
              Undangan Pernikahan
            </p>
            <p
              className="font-sans text-3xl font-bold text-center leading-tight"
              style={{ color: cs.text }}
            >
              Namamu
            </p>
            <p
              className="font-sans text-xl my-2"
              style={{ color: cs.accent, fontStyle: 'italic' }}
            >
              &amp;
            </p>
            <p
              className="font-sans text-3xl font-bold text-center leading-tight"
              style={{ color: cs.text }}
            >
              Namanya
            </p>
            <div
              className="mt-5 px-5 py-1.5 rounded-full text-[9px] tracking-[0.15em]"
              style={{ border: `1px solid ${cs.accent}40`, color: `${cs.accent}dd` }}
            >
              BUKA UNDANGAN
            </div>
          </div>

          {/* Price badge */}
          {price > 0 && (
            <div className="absolute top-3 right-3 z-20">
              {discountedPrice != null ? (
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-500 text-white animate-pulse">
                    {flashSale!.discount_type === 'percentage' ? `-${flashSale!.discount_value}%` : `-${formatRp(flashSale!.discount_value)}`}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/90 text-stone-800 backdrop-blur-sm shadow-sm">
                    {formatRp(discountedPrice)}
                  </span>
                </div>
              ) : (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-white/90 text-stone-800 backdrop-blur-sm shadow-sm">
                  {tier?.label ?? formatRp(price)}
                </span>
              )}
            </div>
          )}

          {/* Category badge */}
          {rec.category && (
            <div className="absolute top-3 left-3 z-20">
              <span className="text-[10px] font-semibold px-2 py-1 rounded-lg bg-black/30 text-white/90 backdrop-blur-sm capitalize">
                {rec.category}
              </span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 z-20 bg-black/0 group-hover:bg-black/25 transition-all duration-300 flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-stone-900 text-xs font-semibold px-5 py-2.5 rounded-full shadow-lg">
              Coba dengan namamu →
            </span>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="p-5 flex flex-col flex-1">
        <h2 className="font-sans text-lg font-bold text-stone-900">{rec.name}</h2>

        {/* Price display */}
        <div className="flex items-center gap-2 mt-1.5">
          {price > 0 ? (
            discountedPrice != null ? (
              <>
                <span className="text-sm font-bold text-forest-600">{formatRp(discountedPrice)}</span>
                <span className="text-xs text-stone-400 line-through">{formatRp(price)}</span>
              </>
            ) : (
              <span className="text-sm font-bold text-stone-600">{formatRp(price)}</span>
            )
          ) : (
            <span className="text-sm font-semibold text-emerald-600">Gratis</span>
          )}
        </div>

        {/* Features summary */}
        {tier?.features && (
          <div className="flex flex-wrap gap-1 mt-3">
            {tier.features.music && <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">Musik</span>}
            {tier.features.gallery && <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">Galeri</span>}
            {tier.features.rsvp && <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">RSVP</span>}
            {tier.features.wishes && <span className="text-[10px] bg-stone-100 text-stone-500 px-2 py-0.5 rounded-full">Ucapan</span>}
            {tier.features.gift && <span className="text-[10px] bg-forest-50 text-forest-600 px-2 py-0.5 rounded-full">Amplop</span>}
            {tier.features.video && <span className="text-[10px] bg-forest-50 text-forest-600 px-2 py-0.5 rounded-full">Video</span>}
            {tier.features.custom_domain && <span className="text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">Custom Domain</span>}
          </div>
        )}

        <div className="mt-auto pt-4 space-y-2">
          <Link
            href={demoUrl}
            className="block w-full text-center py-3 rounded-xl text-sm font-semibold transition-colors text-white"
            style={{ backgroundColor: cs.primary }}
          >
            Coba Gratis
          </Link>
          <Link
            href={`/order?template=${rec.id}`}
            className="block w-full text-center py-2.5 rounded-xl text-xs font-medium border border-stone-200 text-stone-500 hover:border-forest-300 hover:text-forest-600 transition-colors"
          >
            Langsung buat undangan
          </Link>
        </div>
      </div>
    </div>
  )
}

export default async function TemplatesPage() {
  const [activeTemplates, appSettings] = await Promise.all([
    templateRecords.findActive(),
    settings.get(),
  ])

  const tiers = appSettings.priceTiers
  const flashSales = appSettings.flashSales

  function findTier(price: number): PriceTier | undefined {
    return tiers.find(t => t.price === price)
  }

  const categories = Array.from(new Set(activeTemplates.map(t => t.category).filter(Boolean)))

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Header */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 text-center">
          <Link href="/" className="text-sm text-stone-400 hover:text-forest-600 transition-colors mb-6 inline-block">
            ← Kembali ke beranda
          </Link>
          <h1 className="font-sans text-3xl sm:text-4xl font-bold text-stone-900 mt-2">
            Pilih gaya undanganmu
          </h1>
          <p className="mt-3 text-stone-500 text-sm max-w-md mx-auto">
            Klik <strong>Coba Gratis</strong> untuk lihat tampilan undangan dengan nama kalian sendiri.
            Tidak perlu daftar.
          </p>

          {/* Category filter chips */}
          {categories.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2 mt-6">
              <span className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-stone-900 text-white">
                Semua ({activeTemplates.length})
              </span>
              {categories.map(cat => (
                <span key={cat} className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-stone-100 text-stone-500 capitalize">
                  {cat} ({activeTemplates.filter(t => t.category === cat).length})
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Template grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {activeTemplates.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-stone-200 px-6 py-16 text-center">
            <p className="text-base font-semibold text-stone-400 mb-2">Template segera hadir</p>
            <p className="text-sm text-stone-400">
              Tim kami sedang menyiapkan koleksi template undangan digital terbaik untuk kalian.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {activeTemplates
              .sort((a, b) => a.sort_order - b.sort_order)
              .map(rec => {
                const tier = findTier(rec.price)
                const tierId = tier?.id ?? ''
                const sale = getActiveFlashSale(tierId, flashSales)
                return (
                  <TemplateCard key={rec.id} rec={rec} tier={tier} flashSale={sale} />
                )
              })}
          </div>
        )}

        {/* Footer note */}
        <div className="mt-12 text-center bg-white border border-stone-100 rounded-2xl px-6 py-6">
          <p className="text-sm text-stone-500">
            Semua template bisa dikustomisasi: nama, tanggal, lokasi, foto, dan musik.
          </p>
          <p className="text-xs text-stone-400 mt-1.5">
            Template baru akan terus ditambah. Sudah beli? Template lama tetap bisa dipakai.
          </p>
        </div>
      </div>
    </div>
  )
}
