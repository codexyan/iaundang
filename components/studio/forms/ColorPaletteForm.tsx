/**
 * ColorPaletteForm - Theme color customization (TIER 1 CRITICAL)
 * Allows users to customize invitation colors
 */

'use client'

import { Palette } from 'lucide-react'
import FormField, { inputClass } from '../ui/FormField'
import SectionCard from '../ui/SectionCard'

interface ColorPaletteFormProps {
  primaryColor: string
  accentColor: string
  textColor: string
  backgroundColor: string
  onPrimaryColorChange: (color: string) => void
  onAccentColorChange: (color: string) => void
  onTextColorChange: (color: string) => void
  onBackgroundColorChange: (color: string) => void
}

// Preset palettes
const PRESETS = [
  {
    id: 'javanese-gold',
    name: 'Javanese Gold',
    primary: '#2c4a34',
    accent: '#c9a961',
    text: '#1a1a1a',
    background: '#fefdf8',
  },
  {
    id: 'modern-mint',
    name: 'Modern Mint',
    primary: '#34D399',
    accent: '#10B981',
    text: '#111827',
    background: '#F0FDF4',
  },
  {
    id: 'romantic-rose',
    name: 'Romantic Rose',
    primary: '#F43F5E',
    accent: '#FB7185',
    text: '#1F2937',
    background: '#FFF1F2',
  },
  {
    id: 'elegant-navy',
    name: 'Elegant Navy',
    primary: '#1E3A8A',
    accent: '#3B82F6',
    text: '#1F2937',
    background: '#EFF6FF',
  },
  {
    id: 'soft-purple',
    name: 'Soft Purple',
    primary: '#9333EA',
    accent: '#A855F7',
    text: '#1F2937',
    background: '#FAF5FF',
  },
  {
    id: 'rustic-brown',
    name: 'Rustic Brown',
    primary: '#78350F',
    accent: '#D97706',
    text: '#1F2937',
    background: '#FFFBEB',
  },
]

export default function ColorPaletteForm({
  primaryColor,
  accentColor,
  textColor,
  backgroundColor,
  onPrimaryColorChange,
  onAccentColorChange,
  onTextColorChange,
  onBackgroundColorChange,
}: ColorPaletteFormProps) {
  function applyPreset(preset: typeof PRESETS[0]) {
    onPrimaryColorChange(preset.primary)
    onAccentColorChange(preset.accent)
    onTextColorChange(preset.text)
    onBackgroundColorChange(preset.background)
  }

  return (
    <SectionCard
      title="Tema Warna"
      icon={Palette}
      required
      description="Pilih palet warna atau kustomisasi sendiri"
    >
      {/* Preset Palettes */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-stone-700">Palet Siap Pakai</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => applyPreset(preset)}
              className="group relative p-3 border-2 border-stone-200 rounded-xl hover:border-gold-400 transition-all"
            >
              {/* Color Preview */}
              <div className="flex gap-1 mb-2">
                <div
                  className="w-full h-8 rounded"
                  style={{ backgroundColor: preset.primary }}
                />
                <div
                  className="w-full h-8 rounded"
                  style={{ backgroundColor: preset.accent }}
                />
              </div>

              {/* Name */}
              <p className="text-xs font-semibold text-stone-700 text-center">
                {preset.name}
              </p>

              {/* Active indicator */}
              {primaryColor === preset.primary && (
                <div className="absolute top-2 right-2 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="pt-4 border-t border-stone-200 space-y-4">
        <p className="text-sm font-semibold text-stone-700">Kustomisasi Warna</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            label="Warna Utama"
            hint="Warna tema utama undangan"
          >
            <div className="flex gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => onPrimaryColorChange(e.target.value)}
                className="w-16 h-10 rounded-lg border border-stone-300 cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => onPrimaryColorChange(e.target.value)}
                className={inputClass}
                placeholder="#2c4a34"
              />
            </div>
          </FormField>

          <FormField
            label="Warna Aksen"
            hint="Warna untuk highlight dan tombol"
          >
            <div className="flex gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => onAccentColorChange(e.target.value)}
                className="w-16 h-10 rounded-lg border border-stone-300 cursor-pointer"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => onAccentColorChange(e.target.value)}
                className={inputClass}
                placeholder="#c9a961"
              />
            </div>
          </FormField>

          <FormField
            label="Warna Teks"
            hint="Warna teks utama"
          >
            <div className="flex gap-2">
              <input
                type="color"
                value={textColor}
                onChange={(e) => onTextColorChange(e.target.value)}
                className="w-16 h-10 rounded-lg border border-stone-300 cursor-pointer"
              />
              <input
                type="text"
                value={textColor}
                onChange={(e) => onTextColorChange(e.target.value)}
                className={inputClass}
                placeholder="#1a1a1a"
              />
            </div>
          </FormField>

          <FormField
            label="Warna Latar"
            hint="Warna latar belakang"
          >
            <div className="flex gap-2">
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                className="w-16 h-10 rounded-lg border border-stone-300 cursor-pointer"
              />
              <input
                type="text"
                value={backgroundColor}
                onChange={(e) => onBackgroundColorChange(e.target.value)}
                className={inputClass}
                placeholder="#fefdf8"
              />
            </div>
          </FormField>
        </div>

        {/* Color Preview */}
        <div className="p-4 rounded-xl" style={{ backgroundColor }}>
          <div
            className="p-4 rounded-lg"
            style={{
              background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
            }}
          >
            <p className="text-sm font-semibold text-center" style={{ color: textColor }}>
              Preview Warna
            </p>
            <p className="text-xs text-center opacity-80" style={{ color: textColor }}>
              Lihat kombinasi warna Anda
            </p>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
