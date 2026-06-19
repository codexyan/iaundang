import type { AssetPosition, AssetIdleAnimation } from './types'

export interface DecorationPreset {
  id: string
  name: string
  category: 'floral' | 'geometric' | 'frame' | 'line-art'
  url: string
  defaultPosition: AssetPosition
  defaultScale: number
  defaultAnimation: string
  defaultIdle: AssetIdleAnimation
}

export const POSITION_GRID: { label: string; value: AssetPosition }[] = [
  { label: 'Kiri Atas', value: 'top-left' },
  { label: 'Tengah Atas', value: 'top-center' },
  { label: 'Kanan Atas', value: 'top-right' },
  { label: 'Kiri Tengah', value: 'center-left' },
  { label: 'Tengah', value: 'center' },
  { label: 'Kanan Tengah', value: 'center-right' },
  { label: 'Kiri Bawah', value: 'bottom-left' },
  { label: 'Tengah Bawah', value: 'bottom-center' },
  { label: 'Kanan Bawah', value: 'bottom-right' },
]

export const ANIMATION_PRESETS = [
  { label: 'Tanpa Animasi', value: 'none' },
  { label: 'Fade In', value: 'fade-in' },
  { label: 'Geser Kiri', value: 'slide-left' },
  { label: 'Geser Kanan', value: 'slide-right' },
  { label: 'Geser Atas', value: 'slide-up' },
  { label: 'Geser Bawah', value: 'slide-down' },
  { label: 'Zoom In', value: 'zoom-in' },
  { label: 'Putar Masuk', value: 'rotate-in' },
] as const

export const IDLE_PRESETS = [
  { label: 'Diam', value: 'none' as AssetIdleAnimation },
  { label: 'Melayang', value: 'float' as AssetIdleAnimation },
  { label: 'Denyut', value: 'pulse' as AssetIdleAnimation },
  { label: 'Berkilau', value: 'shimmer' as AssetIdleAnimation },
  { label: 'Goyang', value: 'sway' as AssetIdleAnimation },
  { label: 'Detak', value: 'heartbeat' as AssetIdleAnimation },
]

export const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero',
  profiles: 'Profil',
  countdown: 'Hitung Mundur',
  story: 'Cerita',
  events: 'Acara',
  gallery: 'Galeri',
  gift: 'Hadiah',
  rsvp: 'RSVP',
  wishes: 'Ucapan',
  closing: 'Penutup',
  quote: 'Doa',
  video: 'Video',
  'gift-registry': 'Registri',
  'ig-story': 'IG Story',
  livestream: 'Livestream',
  qrcode: 'QR Code',
}
