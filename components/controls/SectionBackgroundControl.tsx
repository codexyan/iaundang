'use client'

import type { BackgroundConfig } from '@/lib/types'
import ImageUploadField from '@/components/admin/ImageUploadField'
import VideoUploadField from '@/components/admin/VideoUploadField'

interface Props {
  value: BackgroundConfig
  onChange: (bg: BackgroundConfig) => void
  /** Warna default untuk color picker bila value belum di-set */
  defaultColor?: string
  /** Warna highlight tab aktif (indigo di admin, gold di studio) */
  accent?: string
}

const TYPES = [
  { id: 'color', label: 'Warna' },
  { id: 'image', label: 'Gambar' },
  { id: 'video', label: 'Video' },
] as const

/**
 * Kontrol latar belakang section (Warna / Gambar / Video + overlay opacity).
 * Diekstrak dari pola TemplateLab supaya bisa dipakai bersama di admin & Studio.
 */
export default function SectionBackgroundControl({
  value, onChange, defaultColor = '#1a1a1a', accent = '#6366f1',
}: Props) {
  const type = value.type === 'gradient' ? 'color' : value.type

  return (
    <div>
      {/* Tab tipe */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, background: '#F5F2ED', padding: 2, borderRadius: 10 }}>
        {TYPES.map(t => {
          const active = type === t.id
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChange({ ...value, type: t.id, ...(t.id === 'color' ? { url: undefined } : {}) })}
              style={{
                flex: 1, padding: '6px 0', borderRadius: 8, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 600, transition: 'all 0.15s',
                background: active ? '#FFFFFF' : 'transparent',
                color: active ? accent : '#A8A29E',
                boxShadow: active ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {type === 'color' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <input
            type="color"
            value={value.value ?? defaultColor}
            onChange={e => onChange({ ...value, type: 'color', value: e.target.value })}
            style={{ width: 36, height: 36, borderRadius: 10, cursor: 'pointer', border: '1px solid #E5E1DA', padding: 2, flexShrink: 0, background: '#fff' }}
          />
          <input
            value={value.value ?? defaultColor}
            onChange={e => onChange({ ...value, type: 'color', value: e.target.value })}
            placeholder="#000000"
            style={{
              flex: 1, minWidth: 0, fontSize: 11, fontFamily: 'monospace',
              background: '#FFFFFF', border: '1px solid #E5E1DA', borderRadius: 10, padding: '8px 10px', outline: 'none',
            }}
          />
        </div>
      )}

      {type === 'image' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ImageUploadField
            value={value.url}
            onChange={url => onChange({ ...value, url, type: 'image' })}
            hint="JPG, PNG, WebP, atau GIF animasi"
          />
          {value.url && <OverlaySlider value={value} onChange={onChange} fallback={0.4} />}
        </div>
      )}

      {type === 'video' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <VideoUploadField
            value={value.url}
            onChange={url => onChange({ ...value, url, type: 'video' })}
            hint="MP4, WebM (maks 50MB)"
          />
          {value.url && <OverlaySlider value={value} onChange={onChange} fallback={0.45} />}
        </div>
      )}
    </div>
  )
}

function OverlaySlider({ value, onChange, fallback }: { value: BackgroundConfig; onChange: (bg: BackgroundConfig) => void; fallback: number }) {
  const op = value.overlay_opacity ?? fallback
  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #EDE8E2', borderRadius: 10, padding: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <p style={{ fontSize: 9, fontWeight: 600, color: '#78716C' }}>Overlay Gelap</p>
        <span style={{ fontSize: 10, fontWeight: 700, color: '#44403C', background: '#F5F2ED', padding: '1px 6px', borderRadius: 6 }}>
          {Math.round(op * 100)}%
        </span>
      </div>
      <input
        type="range" min={0} max={0.9} step={0.05} value={op}
        onChange={e => onChange({ ...value, overlay_opacity: Number(e.target.value) })}
        style={{ width: '100%', height: 6 }}
      />
    </div>
  )
}
