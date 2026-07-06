/**
 * QuoteForm - Quote/Doa section (TIER 1 CRITICAL)
 * Quranic verses or love quotes
 */

'use client'

import { BookOpen } from 'lucide-react'
import FormField from '../ui/FormField'
import { StudioInput, StudioTextarea } from '../ui/StudioInput'
import SectionCard from '../ui/SectionCard'

interface QuoteFormProps {
  quoteArabic: string
  quoteTranslation: string
  quoteSource: string
  onQuoteArabicChange: (value: string) => void
  onQuoteTranslationChange: (value: string) => void
  onQuoteSourceChange: (value: string) => void
}

// Popular Quranic verses for weddings
const QURANIC_VERSES = [
  {
    arabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُم مَّوَدَّةً وَرَحْمَةً',
    translation: 'Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.',
    source: 'QS. Ar-Rum: 21',
  },
  {
    arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا',
    translation: 'Ya Tuhan kami, anugerahkanlah kepada kami pasangan kami dan keturunan kami sebagai penyenang hati (kami), dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa.',
    source: 'QS. Al-Furqan: 74',
  },
  {
    arabic: 'يَا أَيُّهَا النَّاسُ اتَّقُوا رَبَّكُمُ الَّذِي خَلَقَكُم مِّن نَّفْسٍ وَاحِدَةٍ وَخَلَقَ مِنْهَا زَوْجَهَا',
    translation: 'Wahai manusia! Bertakwalah kepada Tuhanmu yang telah menciptakan kamu dari diri yang satu (Adam), dan (Allah) menciptakan pasangannya (Hawa) dari (diri)-nya.',
    source: 'QS. An-Nisa: 1',
  },
]

// Love quotes
const LOVE_QUOTES = [
  {
    text: 'Love is composed of a single soul inhabiting two bodies.',
    author: 'Aristotle',
  },
  {
    text: 'The best thing to hold onto in life is each other.',
    author: 'Audrey Hepburn',
  },
  {
    text: 'Love is not about how many days, months, or years you have been together. Love is about how much you love each other every single day.',
    author: 'Unknown',
  },
]

export default function QuoteForm({
  quoteArabic,
  quoteTranslation,
  quoteSource,
  onQuoteArabicChange,
  onQuoteTranslationChange,
  onQuoteSourceChange,
}: QuoteFormProps) {
  function applyQuranVerse(verse: typeof QURANIC_VERSES[0]) {
    onQuoteArabicChange(verse.arabic)
    onQuoteTranslationChange(verse.translation)
    onQuoteSourceChange(verse.source)
  }

  function applyLoveQuote(quote: typeof LOVE_QUOTES[0]) {
    onQuoteArabicChange('') // Clear Arabic
    onQuoteTranslationChange(quote.text)
    onQuoteSourceChange(quote.author)
  }

  return (
    <SectionCard
      title="Quote & Doa"
      icon={BookOpen}
      description="Ayat Al-Quran atau kutipan romantis (opsional)"
    >
      {/* Quick Select: Quranic Verses */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-graphite">Pilih Ayat Al-Quran</p>
        <div className="space-y-2">
          {QURANIC_VERSES.map((verse, index) => (
            <button
              key={index}
              type="button"
              onClick={() => applyQuranVerse(verse)}
              className="w-full p-3 border border-hairline rounded-lg hover:border-gold-dark/50 hover:bg-forest-50 transition-all text-left"
            >
              <p className="text-xs font-semibold text-gold-dark mb-1">{verse.source}</p>
              <p className="text-xs text-concrete leading-relaxed line-clamp-2">
                {verse.translation}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Select: Love Quotes */}
      <div className="space-y-2 pt-4 border-t border-hairline">
        <p className="text-sm font-semibold text-graphite">Pilih Kutipan Cinta</p>
        <div className="space-y-2">
          {LOVE_QUOTES.map((quote, index) => (
            <button
              key={index}
              type="button"
              onClick={() => applyLoveQuote(quote)}
              className="w-full p-3 border border-hairline rounded-lg hover:border-gold-dark/50 hover:bg-forest-50 transition-all text-left"
            >
              <p className="text-xs text-graphite italic leading-relaxed line-clamp-2">
                &ldquo;{quote.text}&rdquo;
              </p>
              <p className="text-xs text-concrete mt-1">- {quote.author}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Input */}
      <div className="space-y-4 pt-4 border-t border-hairline">
        <p className="text-sm font-semibold text-graphite">Atau Tulis Sendiri</p>

        <FormField
          label="Teks Arab (Opsional)"
          hint="Untuk ayat Al-Quran atau doa"
        >
          <StudioTextarea
            rows={3}
            value={quoteArabic}
            onChange={(e) => onQuoteArabicChange(e.target.value)}
            placeholder="وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم..."
            dir="rtl"
            style={{ fontFamily: 'Arial, sans-serif' }}
          />
        </FormField>

        <FormField
          label="Terjemahan / Quote"
          hint="Terjemahan ayat atau kutipan cinta"
          required
        >
          <StudioTextarea
            rows={3}
            value={quoteTranslation}
            onChange={(e) => onQuoteTranslationChange(e.target.value)}
            placeholder="Dan di antara tanda-tanda kekuasaan-Nya..."
          />
        </FormField>

        <FormField
          label="Sumber"
          hint="Sumber ayat atau nama penulis quote"
        >
          <StudioInput
            type="text"
            value={quoteSource}
            onChange={(e) => onQuoteSourceChange(e.target.value)}
            placeholder="QS. Ar-Rum: 21"
          />
        </FormField>
      </div>

      {/* Preview */}
      {(quoteArabic || quoteTranslation) && (
        <div className="p-6 rounded-xl bg-ivory border border-hairline">
          <div className="text-center space-y-3">
            <p className="text-xs font-semibold text-gold-dark uppercase tracking-wider">
              Preview Quote
            </p>

            {quoteArabic && (
              <p
                className="text-lg font-sans text-graphite leading-relaxed"
                dir="rtl"
                style={{ fontFamily: 'Arial, sans-serif' }}
              >
                {quoteArabic}
              </p>
            )}

            {quoteTranslation && (
              <p className="text-sm text-graphite leading-relaxed max-w-md mx-auto">
                {quoteTranslation}
              </p>
            )}

            {quoteSource && (
              <>
                <div className="w-12 h-px bg-forest mx-auto" />
                <p className="text-xs font-semibold text-gold-dark">
                  {quoteSource}
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  )
}
