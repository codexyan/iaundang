'use client'

import { useState, useCallback } from 'react'
import {
  Loader2, ChevronDown, ChevronUp, Settings2,
  Circle, Heart, Fan, Flower2, AudioLines, Type,
  Landmark, Flame, Infinity, Sparkles, Globe,
  Target, Diamond, Hourglass, Moon, Shell,
} from 'lucide-react'
import FormField, { inputClass } from '../ui/FormField'
import SectionCard from '../ui/SectionCard'
import type { LoadingConfig, LoadingVariant, LoadingBgType } from '@/lib/types'

interface LoadingFormProps {
  config: LoadingConfig
  onChange: (config: LoadingConfig) => void
}

const VARIANTS: {
  id: LoadingVariant
  name: string
  icon: typeof Circle
  description: string
  tier: 'free' | 'pro'
}[] = [
  { id: 'dual-ring',        name: 'Dual Ring',       icon: Circle,     description: 'Klasik & elegan',        tier: 'free' },
  { id: 'heartbeat',        name: 'Heartbeat',       icon: Heart,      description: 'Hangat & emosional',     tier: 'free' },
  { id: 'elegant-spinner',  name: 'Spinner',         icon: Fan,        description: 'Minimalis & mewah',      tier: 'free' },
  { id: 'petal-cascade',    name: 'Petal',           icon: Flower2,    description: 'Romantis & lembut',      tier: 'free' },
  { id: 'wave-dots',        name: 'Wave',            icon: AudioLines, description: 'Dinamis & modern',       tier: 'free' },
  { id: 'ripple-pulse',     name: 'Ripple',          icon: Target,     description: 'Clean & simpel',         tier: 'free' },
  { id: 'shimmer-bar',      name: 'Shimmer',         icon: Sparkles,   description: 'Halus & smooth',         tier: 'free' },
  { id: 'diamond-spin',     name: 'Diamond',         icon: Diamond,    description: 'Mewah & prestisius',     tier: 'free' },
  { id: 'candle-glow',      name: 'Candle',          icon: Flame,      description: 'Hangat & intimate',      tier: 'pro' },
  { id: 'arch-gate',        name: 'Arch Gate',       icon: Landmark,   description: 'Megah & klasik',         tier: 'pro' },
  { id: 'orbit-rings',      name: 'Orbit',           icon: Globe,      description: 'Futuristik & unik',      tier: 'pro' },
  { id: 'infinity-ribbon',  name: 'Infinity',        icon: Infinity,   description: 'Cinta tanpa akhir',      tier: 'pro' },
  { id: 'letter-reveal',    name: 'Letter',          icon: Type,       description: 'Kreatif & playful',      tier: 'pro' },
  { id: 'hourglass',        name: 'Hourglass',       icon: Hourglass,  description: 'Timeless & nostalgia',   tier: 'pro' },
  { id: 'crescent-moon',    name: 'Crescent',        icon: Moon,       description: 'Islami & syahdu',        tier: 'pro' },
  { id: 'spiral-gold',      name: 'Spiral',          icon: Shell,      description: 'Artistik & dinamis',     tier: 'pro' },
]

const BG_TYPES: { id: LoadingBgType; name: string; desc: string }[] = [
  { id: 'solid',    name: 'Solid',    desc: 'Warna tunggal' },
  { id: 'gradient', name: 'Gradient', desc: 'Dua warna linear' },
  { id: 'radial',   name: 'Radial',   desc: 'Gradien melingkar' },
  { id: 'image',    name: 'Gambar',   desc: 'Foto background' },
  { id: 'pattern',  name: 'Pattern',  desc: 'Pola dekoratif' },
]

const PATTERNS = [
  { id: 'none' as const, name: 'Tanpa Pola' },
  { id: 'dots' as const, name: 'Titik-titik' },
  { id: 'lines' as const, name: 'Garis' },
  { id: 'cross' as const, name: 'Silang' },
  { id: 'moroccan' as const, name: 'Moroccan' },
]

const SPEEDS = [
  { value: 'slow' as const,   label: 'Lambat' },
  { value: 'normal' as const, label: 'Normal' },
  { value: 'fast' as const,   label: 'Cepat' },
]

const TEXT_SIZES = [
  { value: 'sm' as const,   label: 'S' },
  { value: 'base' as const, label: 'M' },
  { value: 'lg' as const,   label: 'L' },
]

const DURATIONS = [
  { value: 1000, label: '1s' },
  { value: 1600, label: '1.6s' },
  { value: 2500, label: '2.5s' },
  { value: 3500, label: '3.5s' },
]

export default function LoadingForm({ config, onChange }: LoadingFormProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)

  const update = useCallback(
    (partial: Partial<LoadingConfig>) => onChange({ ...config, ...partial }),
    [config, onChange]
  )

  const selectedVariant = config.variant ?? 'dual-ring'
  const bgType = config.bg_type ?? 'solid'

  return (
    <SectionCard
      title="Loading Screen"
      icon={Loader2}
      description="Animasi & tampilan saat undangan pertama kali dibuka"
    >
      {/*  Variant Grid  */}
      <FormField label="Gaya Animasi">
        <div className="grid grid-cols-4 gap-1.5">
          {VARIANTS.map((v) => {
            const Icon = v.icon
            const active = selectedVariant === v.id
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => update({ variant: v.id })}
                className={`
                  relative flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all group
                  ${active
                    ? 'border-gold-500 bg-gold-50/80 shadow-sm'
                    : 'border-stone-100 bg-white hover:border-stone-200 hover:bg-stone-50'
                  }
                `}
              >
                {v.tier === 'pro' && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gradient-to-br from-gold-500 to-warmGold-600 flex items-center justify-center">
                    <Sparkles size={8} className="text-white" />
                  </span>
                )}
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className={active ? 'text-gold-600' : 'text-stone-400 group-hover:text-stone-600'}
                />
                <span className={`text-[10px] font-medium leading-tight text-center ${active ? 'text-gold-800' : 'text-stone-500'}`}>
                  {v.name}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-[10px] text-stone-400 mt-1">
          {VARIANTS.find(v => v.id === selectedVariant)?.description}
        </p>
      </FormField>

      {/*  Teks Loading  */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-stone-700">Teks Loading</span>
            <p className="text-[10px] text-stone-400">Tampil di bawah animasi</p>
          </div>
          <button
            type="button"
            onClick={() => update({ show_text: !(config.show_text !== false) })}
            className={`relative w-10 h-5 rounded-full transition-colors ${config.show_text !== false ? 'bg-gold-500' : 'bg-stone-300'}`}
          >
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${config.show_text !== false ? 'translate-x-5' : 'translate-x-0.5'}`} />
          </button>
        </div>

        {config.show_text !== false && (
          <>
            <input
              type="text"
              value={config.text}
              onChange={(e) => update({ text: e.target.value })}
              className={inputClass}
              placeholder="Membuka undangan..."
              maxLength={40}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField label="Ukuran Teks">
                <div className="flex gap-1">
                  {TEXT_SIZES.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => update({ text_size: t.value })}
                      className={`
                        flex-1 py-2 rounded-lg border text-xs font-bold transition-all
                        ${(config.text_size ?? 'sm') === t.value
                          ? 'border-gold-500 bg-gold-50 text-gold-800'
                          : 'border-stone-200 text-stone-500'
                        }
                      `}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </FormField>
              <ColorRow
                label="Warna Teks"
                value={config.text_color ?? '#b3b3b3'}
                onChange={(v) => update({ text_color: v })}
              />
            </div>
          </>
        )}
      </div>

      {/*  Background Type  */}
      <FormField label="Background">
        <div className="flex gap-1.5 mb-3">
          {BG_TYPES.map((bg) => (
            <button
              key={bg.id}
              type="button"
              onClick={() => update({ bg_type: bg.id })}
              className={`
                flex-1 py-2 rounded-lg border text-center transition-all
                ${bgType === bg.id
                  ? 'border-gold-500 bg-gold-50 text-gold-800'
                  : 'border-stone-200 text-stone-500 hover:border-stone-300'
                }
              `}
            >
              <span className="text-[10px] font-semibold block">{bg.name}</span>
            </button>
          ))}
        </div>

        {/* Solid */}
        {bgType === 'solid' && (
          <ColorRow
            label="Warna"
            value={config.background_color}
            onChange={(v) => update({ background_color: v })}
          />
        )}

        {/* Gradient / Radial */}
        {(bgType === 'gradient' || bgType === 'radial') && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <ColorRow
                label="Dari"
                value={config.bg_gradient_from ?? config.background_color}
                onChange={(v) => update({ bg_gradient_from: v })}
              />
              <ColorRow
                label="Ke"
                value={config.bg_gradient_to ?? '#000000'}
                onChange={(v) => update({ bg_gradient_to: v })}
              />
            </div>
            {bgType === 'gradient' && (
              <div>
                <label className="text-[10px] font-semibold text-stone-500 block mb-1">Arah ({config.bg_gradient_angle ?? 135}&deg;)</label>
                <input
                  type="range" min={0} max={360} step={15}
                  value={config.bg_gradient_angle ?? 135}
                  onChange={(e) => update({ bg_gradient_angle: Number(e.target.value) })}
                  className="w-full accent-gold-500"
                />
              </div>
            )}
            <div
              className="w-full h-10 rounded-lg border border-stone-200"
              style={{
                background: bgType === 'gradient'
                  ? `linear-gradient(${config.bg_gradient_angle ?? 135}deg, ${config.bg_gradient_from ?? config.background_color}, ${config.bg_gradient_to ?? '#000'})`
                  : `radial-gradient(ellipse at center, ${config.bg_gradient_from ?? config.background_color}, ${config.bg_gradient_to ?? '#000'})`,
              }}
            />
          </div>
        )}

        {/* Image */}
        {bgType === 'image' && (
          <div className="space-y-2">
            <input
              type="text"
              value={config.bg_image_url ?? ''}
              onChange={(e) => update({ bg_image_url: e.target.value })}
              className={inputClass}
              placeholder="URL gambar background..."
            />
            <ColorRow
              label="Overlay"
              value={config.background_color}
              onChange={(v) => update({ background_color: v })}
            />
            <div>
              <label className="text-[10px] font-semibold text-stone-500 block mb-1">
                Opacity overlay ({Math.round((config.overlay_opacity ?? 0.85) * 100)}%)
              </label>
              <input
                type="range" min={0.2} max={1} step={0.05}
                value={config.overlay_opacity ?? 0.85}
                onChange={(e) => update({ overlay_opacity: Number(e.target.value) })}
                className="w-full accent-gold-500"
              />
            </div>
          </div>
        )}

        {/* Pattern */}
        {bgType === 'pattern' && (
          <div className="space-y-3">
            <ColorRow
              label="Warna dasar"
              value={config.background_color}
              onChange={(v) => update({ background_color: v })}
            />
            <div className="flex gap-1.5">
              {PATTERNS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => update({ bg_pattern: p.id })}
                  className={`
                    flex-1 py-1.5 rounded-lg border text-[10px] font-medium transition-all
                    ${(config.bg_pattern ?? 'none') === p.id
                      ? 'border-gold-500 bg-gold-50 text-gold-800'
                      : 'border-stone-200 text-stone-500 hover:border-stone-300'
                    }
                  `}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </FormField>

      {/*  Accent Color  */}
      <ColorRow
        label="Warna Aksen (animasi)"
        value={config.accent_color ?? '#d4af37'}
        onChange={(v) => update({ accent_color: v })}
      />

      {/*  Speed  */}
      <FormField label="Kecepatan">
        <div className="flex gap-1.5">
          {SPEEDS.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => update({ animation_speed: s.value })}
              className={`
                flex-1 py-2 rounded-xl border-2 text-xs font-semibold transition-all
                ${(config.animation_speed ?? 'normal') === s.value
                  ? 'border-gold-500 bg-gold-50 text-gold-800'
                  : 'border-stone-200 text-stone-600 hover:border-stone-300'
                }
              `}
            >
              {s.label}
            </button>
          ))}
        </div>
      </FormField>

      {/*  Advanced  */}
      <button
        type="button"
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-xs font-semibold text-stone-500 hover:text-gold-600 transition-colors w-full py-2"
      >
        <Settings2 size={14} />
        Pengaturan Lanjutan
        {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showAdvanced && (
        <div className="space-y-4 pt-3 border-t border-stone-100">
          {/* Duration */}
          <FormField label="Durasi">
            <div className="flex gap-1.5 mb-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => update({ duration_ms: d.value })}
                  className={`
                    flex-1 py-1.5 rounded-lg border text-[10px] font-semibold transition-all
                    ${(config.duration_ms ?? 1600) === d.value
                      ? 'border-gold-500 bg-gold-50 text-gold-800'
                      : 'border-stone-200 text-stone-500 hover:border-stone-300'
                    }
                  `}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <input
              type="range" min={500} max={5000} step={100}
              value={config.duration_ms ?? 1600}
              onChange={(e) => update({ duration_ms: Number(e.target.value) })}
              className="w-full accent-gold-500"
            />
            <span className="text-[10px] text-stone-400">{((config.duration_ms ?? 1600) / 1000).toFixed(1)} detik</span>
          </FormField>


          {/* Logo */}
          <FormField label="Logo" hint="URL gambar logo di atas animasi">
            <input
              type="text"
              value={config.logo_image ?? ''}
              onChange={(e) => update({ logo_image: e.target.value || undefined })}
              className={inputClass}
              placeholder="https://..."
            />
          </FormField>

          {/* Progress Bar toggle */}
          <ToggleRow
            label="Progress Bar"
            desc="Bar progress di bawah animasi"
            checked={!!config.show_progress}
            onChange={() => update({ show_progress: !config.show_progress })}
          />

          {/* Blur toggle */}
          <ToggleRow
            label="Blur Background"
            desc="Efek glassmorphism"
            checked={!!config.blur_background}
            onChange={() => update({ blur_background: !config.blur_background })}
          />

          {/* Particles */}
          <FormField label={`Partikel (${config.particle_count ?? 0})`} hint="Partikel melayang, 0 = nonaktif">
            <input
              type="range" min={0} max={30}
              value={config.particle_count ?? 0}
              onChange={(e) => update({ particle_count: Number(e.target.value) })}
              className="w-full accent-gold-500"
            />
          </FormField>

          {/* Font */}
          <FormField label="Custom Font" hint="Nama Google Font">
            <input
              type="text"
              value={config.font_family ?? ''}
              onChange={(e) => update({ font_family: e.target.value || undefined })}
              className={inputClass}
              placeholder="Cormorant Garamond"
            />
          </FormField>
        </div>
      )}
    </SectionCard>
  )
}

//  Shared small components 

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-[10px] font-semibold text-stone-500 block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-stone-200 cursor-pointer shrink-0"
        />
        <input
          type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1.5 border border-stone-200 rounded-lg text-xs text-stone-600 focus:outline-none focus:ring-1 focus:ring-gold-500"
        />
      </div>
    </div>
  )
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-1">
      <div>
        <span className="text-xs font-semibold text-stone-700">{label}</span>
        <p className="text-[10px] text-stone-400">{desc}</p>
      </div>
      <button
        type="button" onClick={onChange}
        className={`relative w-10 h-5 rounded-full transition-colors ${checked ? 'bg-gold-500' : 'bg-stone-300'}`}
      >
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}
