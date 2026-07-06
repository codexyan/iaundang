'use client'

import { useState, useCallback } from 'react'
import {
  Loader2, ChevronDown, ChevronUp, Settings2,
  Circle, Heart, Fan, Flower2, AudioLines, Type,
  Landmark, Flame, Infinity, Sparkles, Globe,
  Target, Diamond, Hourglass, Moon, Shell,
} from 'lucide-react'
import FormField from '../ui/FormField'
import { StudioInput, StudioToggle } from '../ui/StudioInput'
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
      title="Animasi Loading"
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
                    ? 'border-forest bg-forest-50 shadow-card'
                    : 'border-hairline bg-chalk hover:border-ash/50 hover:bg-mist'
                  }
                `}
              >
                {v.tier === 'pro' && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-gold flex items-center justify-center">
                    <Sparkles size={8} className="text-white" />
                  </span>
                )}
                <Icon
                  size={20}
                  strokeWidth={1.5}
                  className={active ? 'text-forest' : 'text-ash group-hover:text-concrete'}
                />
                <span className={`text-ui-2xs font-medium leading-tight text-center ${active ? 'text-forest-deep' : 'text-concrete'}`}>
                  {v.name}
                </span>
              </button>
            )
          })}
        </div>
        <p className="text-ui-2xs text-concrete mt-1">
          {VARIANTS.find(v => v.id === selectedVariant)?.description}
        </p>
      </FormField>

      {/*  Teks Loading  */}
      <div className="space-y-3">
        <StudioToggle
          label="Teks Loading"
          desc="Tampil di bawah animasi"
          checked={config.show_text !== false}
          onChange={() => update({ show_text: !(config.show_text !== false) })}
        />

        {config.show_text !== false && (
          <>
            <StudioInput
              type="text"
              value={config.text}
              onChange={(e) => update({ text: e.target.value })}              placeholder="Membuka undangan..."
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
                          ? 'border-forest bg-forest-50 text-forest-deep'
                          : 'border-hairline text-concrete'
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
      <FormField label="Latar Belakang">
        <div className="flex gap-1.5 mb-3">
          {BG_TYPES.map((bg) => (
            <button
              key={bg.id}
              type="button"
              onClick={() => update({ bg_type: bg.id })}
              className={`
                flex-1 py-2 rounded-lg border text-center transition-all
                ${bgType === bg.id
                  ? 'border-forest bg-forest-50 text-forest-deep'
                  : 'border-hairline text-concrete hover:border-ash/50'
                }
              `}
            >
              <span className="text-ui-2xs font-semibold block">{bg.name}</span>
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
                <label className="text-ui-2xs font-semibold text-concrete block mb-1">Arah ({config.bg_gradient_angle ?? 135}&deg;)</label>
                <input
                  type="range" min={0} max={360} step={15}
                  value={config.bg_gradient_angle ?? 135}
                  onChange={(e) => update({ bg_gradient_angle: Number(e.target.value) })}
                  className="w-full accent-gold-500"
                />
              </div>
            )}
            <div
              className="w-full h-10 rounded-lg border border-hairline"
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
            <StudioInput
              type="text"
              value={config.bg_image_url ?? ''}
              onChange={(e) => update({ bg_image_url: e.target.value })}              placeholder="Link gambar latar..."
            />
            <ColorRow
              label="Overlay"
              value={config.background_color}
              onChange={(v) => update({ background_color: v })}
            />
            <div>
              <label className="text-ui-2xs font-semibold text-concrete block mb-1">
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
                    flex-1 py-1.5 rounded-lg border text-ui-2xs font-medium transition-all
                    ${(config.bg_pattern ?? 'none') === p.id
                      ? 'border-forest bg-forest-50 text-forest-deep'
                      : 'border-hairline text-concrete hover:border-ash/50'
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
                  ? 'border-forest bg-forest-50 text-forest-deep'
                  : 'border-hairline text-concrete hover:border-ash/50'
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
        className="flex items-center gap-2 text-xs font-semibold text-concrete hover:text-forest transition-colors w-full py-2"
      >
        <Settings2 size={14} />
        Pengaturan Lanjutan
        {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>

      {showAdvanced && (
        <div className="space-y-4 pt-3 border-t border-hairline">
          {/* Duration */}
          <FormField label="Durasi">
            <div className="flex gap-1.5 mb-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => update({ duration_ms: d.value })}
                  className={`
                    flex-1 py-1.5 rounded-lg border text-ui-2xs font-semibold transition-all
                    ${(config.duration_ms ?? 1600) === d.value
                      ? 'border-forest bg-forest-50 text-forest-deep'
                      : 'border-hairline text-concrete hover:border-ash/50'
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
            <span className="text-ui-2xs text-concrete">{((config.duration_ms ?? 1600) / 1000).toFixed(1)} detik</span>
          </FormField>


          {/* Logo */}
          <FormField label="Logo" hint="URL gambar logo di atas animasi">
            <StudioInput
              type="text"
              value={config.logo_image ?? ''}
              onChange={(e) => update({ logo_image: e.target.value || undefined })}              placeholder="https://..."
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
            label="Blur Latar"
            desc="Efek kaca buram"
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
          <FormField label="Font Kustom" hint="Nama Google Font">
            <StudioInput
              type="text"
              value={config.font_family ?? ''}
              onChange={(e) => update({ font_family: e.target.value || undefined })}              placeholder="Cormorant Garamond"
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
      <label className="text-ui-2xs font-semibold text-concrete block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg border border-hairline cursor-pointer shrink-0"
        />
        <input
          type="text" value={value} onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-2 py-1.5 border border-hairline rounded-lg text-ui-sm text-graphite focus:outline-none focus:ring-2 focus:ring-forest/15 focus:border-forest-light"
        />
      </div>
    </div>
  )
}

function ToggleRow({ label, desc, checked, onChange }: { label: string; desc: string; checked: boolean; onChange: () => void }) {
  return <StudioToggle label={label} desc={desc} checked={checked} onChange={onChange} />
}
