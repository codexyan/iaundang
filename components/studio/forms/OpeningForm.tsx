'use client'

import { DoorOpen } from 'lucide-react'
import FormField, { inputClass, textareaClass } from '../ui/FormField'
import SectionCard from '../ui/SectionCard'
import type { OpeningType } from '@/lib/types'

interface OpeningFormProps {
  openingType: OpeningType
  openingGreeting: string
  openingSubtitle: string
  onOpeningTypeChange: (value: OpeningType) => void
  onOpeningGreetingChange: (value: string) => void
  onOpeningSubtitleChange: (value: string) => void
}

const OPENING_STYLES: { id: OpeningType; name: string; icon: string; desc: string }[] = [
  { id: 'fade-reveal',    name: 'Fade Reveal',    icon: '✨', desc: 'Muncul perlahan, elegan' },
  { id: 'envelope',       name: 'Amplop',         icon: '💌', desc: 'Klasik & formal' },
  { id: 'curtain',        name: 'Tirai',          icon: '🎭', desc: 'Elegan & mewah' },
  { id: 'gate-open',      name: 'Gerbang',        icon: '🚪', desc: 'Megah terbuka' },
  { id: 'flower-bloom',   name: 'Bunga Mekar',    icon: '🌸', desc: 'Romantis & feminin' },
  { id: 'scroll-reveal',  name: 'Gulungan',       icon: '📜', desc: 'Tradisional & unik' },
  { id: 'diamond-split',  name: 'Berlian',        icon: '💎', desc: 'Geometris & modern' },
  { id: 'book-open',      name: 'Buku',           icon: '📖', desc: 'Perspektif 3D' },
  { id: 'lantern-rise',   name: 'Lentera',        icon: '🏮', desc: 'Hangat & sakral' },
  { id: 'veil-lift',      name: 'Kerudung',       icon: '👰', desc: 'Lembut terangkat' },
  { id: 'mosaic-reveal',  name: 'Mosaik',         icon: '🔷', desc: 'Pecah terurai' },
  { id: 'ring-zoom',      name: 'Cincin',         icon: '💍', desc: 'Ikonik & bermakna' },
]

export default function OpeningForm({
  openingType,
  openingGreeting,
  openingSubtitle,
  onOpeningTypeChange,
  onOpeningGreetingChange,
  onOpeningSubtitleChange,
}: OpeningFormProps) {
  return (
    <SectionCard
      title="Pembuka Undangan"
      icon={DoorOpen}
      description="Gaya animasi dan teks pembuka saat tamu membuka undangan"
    >
      {/* Opening Style Selector */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-stone-700">Gaya Opening</p>
        <p className="text-xs text-stone-400">Pilih animasi pembuka yang tampil pertama kali</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {OPENING_STYLES.map((style) => {
            const isSelected = openingType === style.id
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onOpeningTypeChange(style.id)}
                className={`relative p-3 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-forest-50 border-2 border-forest-500 ring-1 ring-forest-500/20'
                    : 'bg-stone-50 border border-stone-200 hover:border-stone-300 hover:bg-stone-100'
                }`}
              >
                <span className="text-xl block mb-1">{style.icon}</span>
                <p className={`text-[11px] font-semibold leading-tight ${isSelected ? 'text-forest-700' : 'text-stone-700'}`}>
                  {style.name}
                </p>
                <p className={`text-[9px] mt-0.5 leading-tight ${isSelected ? 'text-forest-500' : 'text-stone-400'}`}>
                  {style.desc}
                </p>
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-forest-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                    </svg>
                  </div>
                )}
              </button>
            )
          })}
        </div>
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

      {/* Quick Select */}
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
            <p className="text-xs text-stone-600 mt-1">Assalamualaikum Warahmatullahi Wabarakatuh</p>
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
            <p className="text-xs text-stone-600 mt-1">Dengan Memohon Rahmat dan Ridho Tuhan Yang Maha Esa</p>
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
            <p className="text-xs text-stone-600 mt-1">We Are Getting Married!</p>
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200">
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold text-gold-600 uppercase tracking-wider">
            Preview Pembuka
          </p>
          <p className="text-xs text-stone-400">
            Gaya: {OPENING_STYLES.find(s => s.id === openingType)?.icon} {OPENING_STYLES.find(s => s.id === openingType)?.name}
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
