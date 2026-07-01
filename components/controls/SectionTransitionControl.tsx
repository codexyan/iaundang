'use client'

import type { ReactNode } from 'react'
import type { TransitionType } from '@/lib/types'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ZoomIn, ZoomOut, Circle, Ban } from 'lucide-react'

/** Semua tipe transisi yang didukung getTransitionVariants (satu sumber kebenaran). */
export const TRANSITION_TYPES: TransitionType[] = [
  'fade', 'slide-up', 'slide-down', 'slide-left', 'slide-right', 'zoom-in', 'zoom-out', 'none',
]

/** Label + ikon arah gerakan supaya user langsung kebayang efeknya. */
export const TRANSITION_META: Record<TransitionType, { label: string; icon: (size: number) => ReactNode }> = {
  fade:          { label: 'Fade',     icon: s => <Circle size={s} /> },
  'slide-up':    { label: 'Naik',     icon: s => <ArrowUp size={s} /> },
  'slide-down':  { label: 'Turun',    icon: s => <ArrowDown size={s} /> },
  'slide-left':  { label: 'Kiri',     icon: s => <ArrowLeft size={s} /> },
  'slide-right': { label: 'Kanan',    icon: s => <ArrowRight size={s} /> },
  'zoom-in':     { label: 'Zoom In',  icon: s => <ZoomIn size={s} /> },
  'zoom-out':    { label: 'Zoom Out', icon: s => <ZoomOut size={s} /> },
  none:          { label: 'Tanpa',    icon: s => <Ban size={s} /> },
}

interface ColumnProps {
  title: string
  value: TransitionType
  onChange: (t: TransitionType) => void
  accent: string
}

function TransitionColumn({ title, value, onChange, accent }: ColumnProps) {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#78716C', marginBottom: 6 }}>
        {title}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
        {TRANSITION_TYPES.map(t => {
          const active = value === t
          const meta = TRANSITION_META[t]
          return (
            <button
              key={t}
              type="button"
              onClick={() => onChange(t)}
              title={meta.label}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '7px 3px', borderRadius: 9, cursor: 'pointer',
                border: `1px solid ${active ? accent : '#E5E1DA'}`,
                background: active ? `${accent}14` : '#FFFFFF',
                color: active ? accent : '#78716C',
                transition: 'all 0.15s',
              }}
            >
              {meta.icon(13)}
              <span style={{ fontSize: 8, fontWeight: 600, lineHeight: 1, color: active ? accent : '#A8A29E' }}>
                {meta.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface Props {
  valueIn: TransitionType
  valueOut: TransitionType
  onChangeIn: (t: TransitionType) => void
  onChangeOut: (t: TransitionType) => void
  /** Warna highlight tombol aktif (indigo di admin, gold di studio) */
  accent?: string
}

/**
 * Picker transisi visual: dua kolom berdampingan (Masuk | Keluar), tiap kolom
 * grid tombol ber-ikon arah gerakan. Dipakai bersama di TemplateLab (admin) dan
 * Studio (end-user).
 */
export default function SectionTransitionControl({
  valueIn, valueOut, onChangeIn, onChangeOut, accent = '#6366f1',
}: Props) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <TransitionColumn title="Masuk" value={valueIn} onChange={onChangeIn} accent={accent} />
      <div style={{ width: 1, background: '#EDE8E2', flexShrink: 0 }} />
      <TransitionColumn title="Keluar" value={valueOut} onChange={onChangeOut} accent={accent} />
    </div>
  )
}
