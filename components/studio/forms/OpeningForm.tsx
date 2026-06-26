'use client'

import { DoorOpen } from 'lucide-react'
import FormField, { inputClass, textareaClass } from '../ui/FormField'
import SectionCard from '../ui/SectionCard'
import type { OpeningType } from '@/lib/types'

interface OpeningFormProps {
  openingType: OpeningType
  openingGreeting: string
  openingSubtitle: string
  openingGroomName: string
  openingBrideName: string
  groomName: string
  brideName: string
  nameGap: number
  onOpeningTypeChange: (value: OpeningType) => void
  onOpeningGreetingChange: (value: string) => void
  onOpeningSubtitleChange: (value: string) => void
  onOpeningGroomNameChange: (value: string) => void
  onOpeningBrideNameChange: (value: string) => void
  onNameGapChange: (value: number) => void
}

const OPENING_STYLES: { id: OpeningType; name: string; icon: string; desc: string }[] = [
  { id: 'fade-reveal',    name: 'Fade Reveal',    icon: '✨', desc: 'Muncul perlahan, elegan' },
  { id: 'ring-zoom',      name: 'Cincin',         icon: '💍', desc: 'Ikonik & bermakna' },
  { id: 'petal-fall',     name: 'Petal Jatuh',    icon: '🌺', desc: 'Kelopak jatuh romantis' },
]

export default function OpeningForm({
  openingType,
  openingGreeting,
  openingSubtitle,
  openingGroomName,
  openingBrideName,
  groomName,
  brideName,
  nameGap,
  onOpeningTypeChange,
  onOpeningGreetingChange,
  onOpeningSubtitleChange,
  onOpeningGroomNameChange,
  onOpeningBrideNameChange,
  onNameGapChange,
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

      {/* Nama Mempelai di Opening */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-stone-700">Nama di Opening</p>
        <p className="text-xs text-stone-400">
          Bisa berbeda dari nama di section lain (misal: panggilan, singkatan)
        </p>
        <FormField
          label="Nama Mempelai Pria"
          hint={`Kosongkan untuk pakai "${groomName || 'nama utama'}"`}
        >
          <input
            type="text"
            className={inputClass}
            value={openingGroomName}
            onChange={(e) => onOpeningGroomNameChange(e.target.value)}
            placeholder={groomName || 'Nama mempelai pria...'}
          />
        </FormField>
        <FormField
          label="Nama Mempelai Wanita"
          hint={`Kosongkan untuk pakai "${brideName || 'nama utama'}"`}
        >
          <input
            type="text"
            className={inputClass}
            value={openingBrideName}
            onChange={(e) => onOpeningBrideNameChange(e.target.value)}
            placeholder={brideName || 'Nama mempelai wanita...'}
          />
        </FormField>
      </div>

      {/* Jarak Nama */}
      <FormField
        label={`Jarak Nama & Konektor (${nameGap}px)`}
        hint="Atur jarak antara nama pria, simbol &, dan nama wanita"
      >
        <input
          type="range"
          min={0}
          max={24}
          step={1}
          value={nameGap}
          onChange={(e) => onNameGapChange(Number(e.target.value))}
          className="w-full accent-forest-500"
        />
        <div className="flex justify-between text-[10px] text-stone-400 mt-1">
          <span>Rapat</span>
          <span>Renggang</span>
        </div>
      </FormField>

      {/* Preview */}
      <div className="p-6 rounded-xl bg-gradient-to-br from-stone-50 to-stone-100 border border-stone-200">
        <div className="text-center space-y-3">
          <p className="text-xs font-semibold text-gold-600 uppercase tracking-wider">
            Preview Pembuka
          </p>
          <p className="text-xs text-stone-400">
            Gaya: {OPENING_STYLES.find(s => s.id === openingType)?.icon} {OPENING_STYLES.find(s => s.id === openingType)?.name}
          </p>
          <p className="text-sm font-sans text-stone-700 leading-relaxed">
            {openingGreeting || 'Salam pembuka...'}
          </p>
          <div className="w-12 h-px bg-gold-400 mx-auto" />
          <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
            {openingSubtitle || 'Kalimat pembuka...'}
          </p>
          <div className="mt-3 space-y-0" style={{ lineHeight: 1.2 }}>
            <p className="text-lg font-bold text-stone-800 uppercase tracking-wider" style={{ marginBottom: nameGap }}>
              {openingGroomName || groomName || 'Nama Pria'}
            </p>
            <p className="text-sm text-gold-500" style={{ marginBottom: nameGap }}>
              &amp;
            </p>
            <p className="text-lg font-bold text-stone-800 uppercase tracking-wider">
              {openingBrideName || brideName || 'Nama Wanita'}
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
