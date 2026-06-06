/**
 * OpeningForm - Opening animation & greeting settings (TIER 1 CRITICAL)
 * Customize first impression of the invitation
 */

'use client'

import { DoorOpen } from 'lucide-react'
import FormField, { inputClass, textareaClass } from '../ui/FormField'
import SectionCard from '../ui/SectionCard'

interface OpeningFormProps {
  openingGreeting: string
  openingSubtitle: string
  onOpeningGreetingChange: (value: string) => void
  onOpeningSubtitleChange: (value: string) => void
}

// Opening animation types
const ANIMATION_TYPES = [
  {
    id: 'envelope',
    name: 'Amplop',
    icon: '💌',
    description: 'Klasik & formal',
  },
  {
    id: 'curtain',
    name: 'Tirai',
    icon: '🎭',
    description: 'Elegan & mewah',
  },
  {
    id: 'flower-bloom',
    name: 'Bunga Mekar',
    icon: '🌸',
    description: 'Romantis & feminin',
  },
  {
    id: 'slide-up',
    name: 'Geser Atas',
    icon: '⬆️',
    description: 'Modern & simpel',
  },
  {
    id: 'fade',
    name: 'Fade In',
    icon: '✨',
    description: 'Minimalis & halus',
  },
]

export default function OpeningForm({
  openingGreeting,
  openingSubtitle,
  onOpeningGreetingChange,
  onOpeningSubtitleChange,
}: OpeningFormProps) {
  return (
    <SectionCard
      title="Pembuka Undangan"
      icon={DoorOpen}
      description="Sapaan dan teks pembuka saat tamu membuka undangan"
    >
      {/* Animation Type Preview (Future Enhancement) */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800">
          <strong>Coming Soon:</strong> Pilihan animasi pembuka (envelope, curtain, flower bloom, dll) akan segera tersedia!
        </p>
      </div>

      {/* Greeting Text */}
      <FormField
        label="Salam Pembuka"
        hint="Sapaan formal untuk tamu undangan"
      >
        <input
          type="text"
          className={inputClass}
          value={openingGreeting}
          onChange={(e) => onOpeningGreetingChange(e.target.value)}
          placeholder="Assalamualaikum Warahmatullahi Wabarakatuh"
        />
      </FormField>

      {/* Subtitle */}
      <FormField
        label="Kalimat Pembuka"
        hint="Teks formal di bawah salam pembuka"
      >
        <textarea
          className={textareaClass}
          rows={3}
          value={openingSubtitle}
          onChange={(e) => onOpeningSubtitleChange(e.target.value)}
          placeholder="Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami."
        />
      </FormField>

      {/* Common Greetings Quick Select */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-stone-700">Pilih Cepat:</p>
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => {
              onOpeningGreetingChange('Assalamualaikum Warahmatullahi Wabarakatuh')
              onOpeningSubtitleChange('Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk menghadiri acara pernikahan kami.')
            }}
            className="p-3 border border-stone-200 rounded-lg hover:border-gold-400 hover:bg-gold-50 transition-all text-left"
          >
            <p className="text-xs font-semibold text-stone-700">☪️ Muslim (Formal)</p>
            <p className="text-xs text-stone-600 mt-1">
              Assalamualaikum Warahmatullahi Wabarakatuh
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpeningGreetingChange('Dengan Memohon Rahmat dan Ridho Tuhan Yang Maha Esa')
              onOpeningSubtitleChange('Kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pernikahan kami.')
            }}
            className="p-3 border border-stone-200 rounded-lg hover:border-gold-400 hover:bg-gold-50 transition-all text-left"
          >
            <p className="text-xs font-semibold text-stone-700">🙏 Umum (Formal)</p>
            <p className="text-xs text-stone-600 mt-1">
              Dengan Memohon Rahmat dan Ridho Tuhan Yang Maha Esa
            </p>
          </button>

          <button
            type="button"
            onClick={() => {
              onOpeningGreetingChange('We Are Getting Married!')
              onOpeningSubtitleChange('You are invited to celebrate our special day. Join us as we begin our journey together.')
            }}
            className="p-3 border border-stone-200 rounded-lg hover:border-gold-400 hover:bg-gold-50 transition-all text-left"
          >
            <p className="text-xs font-semibold text-stone-700">💑 Modern (Casual)</p>
            <p className="text-xs text-stone-600 mt-1">
              We Are Getting Married!
            </p>
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200">
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold text-gold-600 uppercase tracking-wider">
            Preview Pembuka
          </p>
          <p className="text-sm font-serif text-stone-700 leading-relaxed">
            {openingGreeting || 'Salam pembuka...'}
          </p>
          <div className="w-12 h-px bg-gold-400 mx-auto" />
          <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
            {openingSubtitle || 'Kalimat pembuka...'}
          </p>
        </div>
      </div>
    </SectionCard>
  )
}
