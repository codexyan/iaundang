import type { DecorationAsset } from './types'

export interface PresetBundle {
  id: string
  name: string
  desc: string
  thumbnail: string
  assets: Omit<DecorationAsset, 'id'>[]
}

// Preset siap pakai memakai built-in SVG (lihat lib/built-in-assets.ts).
// opacity memakai skala 0-100 sesuai DecorationAsset.
export const DECORATION_BUNDLES: PresetBundle[] = [
  {
    id: 'floral-corners',
    name: 'Sudut Bunga',
    desc: 'Ornamen bunga di empat sudut',
    thumbnail: '🌸',
    assets: [
      { url: 'BUILT_IN:floral-corner-tl', position: 'top-left',     width: 100, scale: 1, rotation: 0,   opacity: 60, animation: 'fade-in', idle_animation: 'none' },
      { url: 'BUILT_IN:floral-corner-tr', position: 'top-right',    width: 100, scale: 1, rotation: 90,  opacity: 60, animation: 'fade-in', idle_animation: 'none' },
      { url: 'BUILT_IN:floral-corner-bl', position: 'bottom-left',  width: 100, scale: 1, rotation: 270, opacity: 60, animation: 'fade-in', idle_animation: 'none' },
      { url: 'BUILT_IN:floral-corner-br', position: 'bottom-right', width: 100, scale: 1, rotation: 180, opacity: 60, animation: 'fade-in', idle_animation: 'none' },
    ],
  },
  {
    id: 'botanical-frame',
    name: 'Bingkai Daun',
    desc: 'Daun-daun menghiasi sisi kiri kanan',
    thumbnail: '🌿',
    assets: [
      { url: 'BUILT_IN:leaf-branch-left',  position: 'center-left',  width: 80, scale: 1, rotation: 0,   opacity: 50, animation: 'slide-right', idle_animation: 'float' },
      { url: 'BUILT_IN:leaf-branch-right', position: 'center-right', width: 80, scale: 1, rotation: 180, opacity: 50, animation: 'slide-left',  idle_animation: 'float' },
    ],
  },
  {
    id: 'geometric-luxury',
    name: 'Geometri Mewah',
    desc: 'Garis geometris emas di sudut atas',
    thumbnail: '◇',
    assets: [
      { url: 'BUILT_IN:geo-corner-tl', position: 'top-left',  width: 80, scale: 1, rotation: 0,  opacity: 70, animation: 'fade-in', idle_animation: 'none' },
      { url: 'BUILT_IN:geo-corner-tr', position: 'top-right', width: 80, scale: 1, rotation: 90, opacity: 70, animation: 'fade-in', idle_animation: 'none' },
    ],
  },
  {
    id: 'floating-rings',
    name: 'Cincin Melayang',
    desc: 'Lingkaran elegan melayang di latar',
    thumbnail: '○',
    assets: [
      { url: 'BUILT_IN:ring-lg', position: 'top-center',    width: 160, scale: 1, rotation: 0, opacity: 8, animation: 'fade-in', idle_animation: 'pulse' },
      { url: 'BUILT_IN:ring-sm', position: 'center',        width: 80,  scale: 1, rotation: 0, opacity: 5, animation: 'fade-in', idle_animation: 'pulse' },
      { url: 'BUILT_IN:ring-md', position: 'bottom-center', width: 120, scale: 1, rotation: 0, opacity: 6, animation: 'fade-in', idle_animation: 'pulse' },
    ],
  },
  {
    id: 'rose-scatter',
    name: 'Sebaran Mawar',
    desc: 'Mawar kecil tersebar di sekeliling',
    thumbnail: '🌹',
    assets: [
      { url: 'BUILT_IN:rose-sm', position: 'top-left',     width: 40, scale: 1, rotation: -20, opacity: 50, animation: 'fade-in', idle_animation: 'sway' },
      { url: 'BUILT_IN:rose-sm', position: 'top-right',    width: 35, scale: 1, rotation: 30,  opacity: 40, animation: 'fade-in', idle_animation: 'sway' },
      { url: 'BUILT_IN:rose-lg', position: 'bottom-left',  width: 55, scale: 1, rotation: 10,  opacity: 50, animation: 'fade-in', idle_animation: 'sway' },
      { url: 'BUILT_IN:rose-sm', position: 'bottom-right', width: 40, scale: 1, rotation: -15, opacity: 45, animation: 'fade-in', idle_animation: 'sway' },
    ],
  },
]
