'use client'

import { DoorOpen, Check } from 'lucide-react'
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

type OpeningCategory = 'klasik' | 'romantis' | 'modern' | 'dramatis'

const OPENING_STYLES: {
  id: OpeningType
  name: string
  desc: string
  category: OpeningCategory
  preview: React.CSSProperties
}[] = [
  // KLASIK
  { id: 'fade-reveal',   name: 'Fade Elegan',      desc: 'Muncul perlahan seperti fajar',          category: 'klasik',   preview: { background: 'linear-gradient(135deg, #1a1a1a 0%, #3a3a3a 100%)' } },
  { id: 'envelope',      name: 'Amplop Surat',     desc: 'Seperti membuka surat cinta',            category: 'klasik',   preview: { background: 'linear-gradient(135deg, #f5f0eb 0%, #e8ddd0 100%)' } },
  { id: 'scroll-reveal', name: 'Gulungan Kertas',  desc: 'Terbuka seperti gulungan undangan kuno', category: 'klasik',   preview: { background: 'linear-gradient(135deg, #f5f0e0 0%, #e8ddbf 100%)' } },
  { id: 'book-open',     name: 'Buku Terbuka',     desc: 'Buku pernikahan membuka halaman',         category: 'klasik',   preview: { background: 'linear-gradient(135deg, #1a1a0a 0%, #3a3a1a 100%)' } },
  // ROMANTIS
  { id: 'flower-bloom',  name: 'Bunga Mekar',      desc: 'Kelopak bunga mekar dari tengah',        category: 'romantis', preview: { background: 'linear-gradient(135deg, #3a1a1a 0%, #6b3a3a 100%)' } },
  { id: 'petal-fall',    name: 'Kelopak Jatuh',    desc: 'Hujan kelopak bunga romantis',           category: 'romantis', preview: { background: 'linear-gradient(135deg, #2a1a2a 0%, #4a2a4a 100%)' } },
  { id: 'veil-lift',     name: 'Selubung Terangkat', desc: 'Kerudung halus terangkat perlahan',    category: 'romantis', preview: { background: 'linear-gradient(135deg, #f0ebe5 0%, #ddd5c8 100%)' } },
  { id: 'lantern-rise',  name: 'Lentera Naik',     desc: 'Lentera terbang ke langit malam',        category: 'romantis', preview: { background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%)' } },
  // MODERN
  { id: 'ring-zoom',     name: 'Zoom Cincin',      desc: 'Cincin dari jauh mendekat',              category: 'modern',   preview: { background: 'linear-gradient(135deg, #1a1a2a 0%, #2a2a4a 100%)' } },
  { id: 'diamond-split', name: 'Berlian Terbelah', desc: 'Pecahan berlian berpencar elegan',       category: 'modern',   preview: { background: 'linear-gradient(135deg, #0a1a2a 0%, #1a3a4a 100%)' } },
  { id: 'mosaic-reveal', name: 'Mosaik',           desc: 'Pecahan gambar menyatu menjadi satu',    category: 'modern',   preview: { background: 'linear-gradient(135deg, #0a0a0a 0%, #2a2a2a 100%)' } },
  { id: 'typewriter',    name: 'Mesin Ketik',      desc: 'Nama diketik perlahan satu per satu',    category: 'modern',   preview: { background: 'linear-gradient(135deg, #050505 0%, #1a1a1a 100%)' } },
  { id: 'gold-shimmer',  name: 'Kilauan Emas',     desc: 'Partikel emas berterbangan elegan',      category: 'modern',   preview: { background: 'linear-gradient(135deg, #0a0500 0%, #1a0f00 100%)' } },
  { id: 'frosted-blur',  name: 'Kaca Buram',       desc: 'Kabut foto perlahan menjadi jelas',      category: 'modern',   preview: { background: 'linear-gradient(135deg, #f0f0f0 0%, #d8d8d8 100%)' } },
  // DRAMATIS
  { id: 'curtain',       name: 'Tirai Sinema',     desc: 'Tirai terbuka seperti panggung',         category: 'dramatis', preview: { background: 'linear-gradient(135deg, #0f0f0f 0%, #2a2a2a 100%)' } },
  { id: 'gate-open',     name: 'Gerbang Terbuka',  desc: 'Dua pintu membuka ke dalam',             category: 'dramatis', preview: { background: 'linear-gradient(135deg, #1a2a1a 0%, #2c4a2c 100%)' } },
  { id: 'parallax-split', name: 'Belah Paralaks',  desc: 'Layar terbelah atas bawah dramatis',     category: 'dramatis', preview: { background: 'linear-gradient(135deg, #0a0a1a 0%, #1a1a3a 100%)' } },
]

const CATEGORIES: { id: OpeningCategory; label: string }[] = [
  { id: 'klasik', label: 'Klasik' },
  { id: 'romantis', label: 'Romantis' },
  { id: 'modern', label: 'Modern' },
  { id: 'dramatis', label: 'Dramatis' },
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
      <div className="space-y-1">
        <p className="text-sm font-semibold text-stone-700">Gaya Pembuka</p>
        <p className="text-xs text-stone-400">Pilih animasi pembuka yang tampil pertama kali saat tamu membuka undangan</p>
        {CATEGORIES.map((cat) => {
          const styles = OPENING_STYLES.filter((s) => s.category === cat.id)
          return (
            <div key={cat.id}>
              <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-stone-400 mb-2 mt-4">
                {cat.label}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {styles.map((style) => {
                  const isSelected = openingType === style.id
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => onOpeningTypeChange(style.id)}
                      className={`relative p-3 rounded-xl text-left transition-all ${
                        isSelected
                          ? 'ring-2 ring-forest-500 ring-offset-1 bg-forest-50/40'
                          : 'border border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                      }`}
                    >
                      {/* Mini CSS preview */}
                      <div className="w-full h-10 rounded-lg mb-2 overflow-hidden relative" style={style.preview}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-px" style={{ background: 'rgba(255,255,255,0.3)' }} />
                        </div>
                      </div>
                      <p className={`text-[11px] font-semibold leading-tight ${isSelected ? 'text-forest-700' : 'text-stone-700'}`}>
                        {style.name}
                      </p>
                      <p className="text-[9px] text-stone-400 mt-0.5 leading-tight">{style.desc}</p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-forest-500 flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
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
        <p className="text-sm font-semibold text-stone-700">Nama di Pembuka</p>
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
            Gaya: {OPENING_STYLES.find(s => s.id === openingType)?.name}
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
