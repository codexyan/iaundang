'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import {
  FlaskConical, Save, RefreshCw, Maximize2,
  ChevronUp, ChevronDown, Eye, EyeOff, Palette, Type,
  LayoutTemplate, Code2, Sparkles, Plus, Trash2, Rocket, X, GripVertical, Play, Check,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { getTransitionVariants } from '@/components/renderer/transitions/useTransition'
import type { TransitionType, TemplateMeta, ColorScheme, OpeningConfig, TemplateCategory, ColorPalette } from '@/lib/types'
import type { TemplateRecord, NewInvitationData, Wish, SectionType, GiftAccount } from '@/lib/types'
import JAVANESE_GOLD from '@/lib/template-configs/javanese-gold'
import ImageUploadField from '@/components/admin/ImageUploadField'
import VideoUploadField from '@/components/admin/VideoUploadField'

// Dynamic import — hindari SSR issue
const InvitationPreview = dynamic(() => import('@/components/renderer/InvitationPreview'), { ssr: false })
const CoverPagePreview  = dynamic(() => import('@/components/renderer/CoverPagePreview'),  { ssr: false })
const OpeningScene      = dynamic(() => import('@/components/renderer/OpeningScene'),      { ssr: false })
const LoadingScreen     = dynamic(() => import('@/components/renderer/LoadingScreen'),     { ssr: false })

// ─── Sample data default untuk preview ────────────────────────
const PREVIEW_DATA_DEFAULT: NewInvitationData = {
  groom_name: 'Ikhwal',
  bride_name: 'Fani',
  bride_parents: 'Bapak & Ibu Santoso',
  groom_parents: 'Bapak & Ibu Wijaya',
  tagline: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri.',
  story_title: 'Kisah Kami',
  story_text: 'Pertemuan sederhana yang ternyata menjadi awal dari perjalanan yang penuh makna. Dengan izin Allah SWT, kami memutuskan untuk melanjutkan ke jenjang pernikahan.',
  akad: {
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '08:00',
    venue_name: 'Masjid Al-Ikhlas',
    venue_address: 'Jl. Mawar No. 12, Jakarta Selatan',
    maps_url: 'https://maps.google.com',
  },
  resepsi: {
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '11:00',
    venue_name: 'Ballroom Grand Hotel',
    venue_address: 'Jl. Sudirman No. 86, Jakarta Pusat',
    maps_url: 'https://maps.google.com',
  },
  gift_accounts: [
    { type: 'bank', bank: 'BCA', number: '1234567890', name: 'Ikhwal' },
  ],
  closing_text: 'Merupakan suatu kehormatan apabila Bapak/Ibu berkenan hadir.',
  thank_you_message: 'Terima kasih atas doa dan kehadiran Anda.',
  quote_arabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا',
  quote_translation: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri, supaya kamu cenderung dan merasa tenteram kepadanya.',
  quote_source: 'QS. Ar-Rum: 21',
  video_embed_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  video_caption: 'Highlight perjalanan kami bersama',
  story_timeline: [
    { date: 'Maret 2021', title: 'Pertama Bertemu', description: 'Bertemu di kantor pertama kali, awal yang tidak terduga.' },
    { date: 'Juni 2023',  title: 'Lamaran',        description: 'Dengan restu kedua keluarga, kami melangkah lebih jauh.' },
    { date: 'April 2026', title: 'Hari Bahagia',   description: 'Mempersatukan dua hati menjadi satu keluarga.' },
  ],
  gift_registry: [
    { label: 'Perlengkapan dapur',   url: 'https://tokopedia.com/wishlist/1', marketplace: 'tokopedia' },
    { label: 'Furnitur rumah tangga', url: 'https://shopee.co.id/wishlist/2', marketplace: 'shopee' },
  ],
  ig_story_image_url: '',
  qr_target_url: 'https://akundang.id/ikhwal-fani',
  qr_label: 'Pindai untuk membagikan undangan ini',
}

// Semua referensi PREVIEW_DATA sekarang ke state previewData di komponen

const PREVIEW_WISHES: Wish[] = [
  { id: '1', invitation_id: 'lab', name: 'Reza', message: 'Selamat menempuh hidup baru! 💕', created_at: new Date().toISOString() },
  { id: '2', invitation_id: 'lab', name: 'Sari', message: 'Semoga menjadi keluarga sakinah mawaddah warahmah!', created_at: new Date().toISOString() },
]

// ─── Gift section lab data ─────────────────────────────────────
interface GiftLabBrand { g: [string, string]; type: 'bank' | 'ewallet'; num: string; name: string; logo: string }
const GIFT_LAB_BRANDS: Record<string, GiftLabBrand> = {
  'BRI':       { g: ['#003B8E', '#00529B'], type: 'bank',    num: '123456789012',  name: 'BUDI SANTOSO',  logo: '/logos/bri.svg' },
  'BCA':       { g: ['#003087', '#00509E'], type: 'bank',    num: '1234567890',    name: 'BUDI SANTOSO',  logo: '/logos/bca.svg' },
  'BNI':       { g: ['#003087', '#0050A0'], type: 'bank',    num: '9876543210',    name: 'BUDI SANTOSO',  logo: '/logos/bni.svg' },
  'Mandiri':   { g: ['#003368', '#005099'], type: 'bank',    num: '1400123456789', name: 'BUDI SANTOSO',  logo: '/logos/mandiri.svg' },
  'BSI':       { g: ['#006633', '#00884A'], type: 'bank',    num: '7123456789',    name: 'BUDI SANTOSO',  logo: '/logos/bsi.svg' },
  'Blu':       { g: ['#0077CC', '#00AAFF'], type: 'bank',    num: '8881234567',    name: 'BUDI SANTOSO',  logo: '/logos/blu.svg' },
  'GoPay':     { g: ['#00880F', '#00AA15'], type: 'ewallet', num: '08123456789',   name: 'Budi Santoso',  logo: '/logos/gopay.svg' },
  'DANA':      { g: ['#118EEA', '#1565C0'], type: 'ewallet', num: '08234567890',   name: 'Budi Santoso',  logo: '/logos/dana.svg' },
  'ShopeePay': { g: ['#D73211', '#EE4D2D'], type: 'ewallet', num: '08345678901',   name: 'Budi Santoso',  logo: '/logos/shopee.svg' },
  'OVO':       { g: ['#4B0080', '#6A1B9A'], type: 'ewallet', num: '08456789012',   name: 'Budi Santoso',  logo: '/logos/ovo.svg' },
}
function makeGiftAccount(name: string, b: GiftLabBrand): GiftAccount {
  return b.type === 'bank'
    ? { type: 'bank',    bank: name,     number: b.num, name: b.name }
    : { type: 'ewallet', platform: name, number: b.num, name: b.name }
}

// ─── Constants ─────────────────────────────────────────────────
const SECTION_TYPES = ['hero', 'profiles', 'countdown', 'events', 'story', 'gallery', 'rsvp', 'wishes', 'closing', 'gift', 'livestream', 'quote', 'video', 'gift-registry', 'ig-story', 'qrcode'] as const
const OPENING_TYPES = ['fade-reveal', 'envelope', 'curtain', 'gate-open', 'flower-bloom', 'scroll-reveal'] as const
const TRANSITION_TYPES = ['fade', 'slide-up', 'slide-left', 'slide-right', 'zoom-in'] as const

const OPENING_META: Record<string, { icon: string; label: string }> = {
  'fade-reveal':   { icon: '✨', label: 'Fade Reveal' },
  'envelope':      { icon: '✉️', label: 'Amplop' },
  'curtain':       { icon: '🎭', label: 'Tirai' },
  'gate-open':     { icon: '🚪', label: 'Gerbang' },
  'flower-bloom':  { icon: '🌸', label: 'Bunga' },
  'scroll-reveal': { icon: '📜', label: 'Gulungan' },
}

// ─── Color Palettes ────────────────────────────────────────────
const COLOR_PALETTES = [
  // Nusantara
  { name: 'Jawa Emas',       cat: 'Nusantara', p: '#1a4a1a', a: '#d4af37', t: '#ffffff', bg: '#0f2d0f' },
  { name: 'Jawa Kerajaan',   cat: 'Nusantara', p: '#2d1b4e', a: '#c5a028', t: '#f5e6c8', bg: '#1a0d30' },
  { name: 'Sumatera Tanah',  cat: 'Nusantara', p: '#4a2c17', a: '#e8a830', t: '#f5ebe0', bg: '#2c1a0e' },
  { name: 'Bali Sakral',     cat: 'Nusantara', p: '#3d0000', a: '#ffd700', t: '#fff8e7', bg: '#1a0000' },
  { name: 'Sunda Hijau',     cat: 'Nusantara', p: '#1b3a1b', a: '#8fbe6f', t: '#f0faf0', bg: '#0d1f0d' },
  { name: 'Betawi Merah',    cat: 'Nusantara', p: '#2c1810', a: '#e07b30', t: '#fff5ed', bg: '#1a0e08' },
  { name: 'Bugis Biru',      cat: 'Nusantara', p: '#0a1f3d', a: '#d4aa70', t: '#f0eee8', bg: '#050f20' },
  // Modern
  { name: 'Modern Putih',    cat: 'Modern',    p: '#f9f9f9', a: '#1a1a1a', t: '#1a1a1a', bg: '#ffffff' },
  { name: 'Modern Hitam',    cat: 'Modern',    p: '#0f0f0f', a: '#e8e0d0', t: '#f5f5f5', bg: '#1a1a1a' },
  { name: 'Navy Elegan',     cat: 'Modern',    p: '#0a192f', a: '#64ffda', t: '#ccd6f6', bg: '#020c1b' },
  { name: 'Sage Tenang',     cat: 'Modern',    p: '#2c3e2d', a: '#8fba8f', t: '#f0f4f0', bg: '#1a2b1c' },
  { name: 'Charcoal Gold',   cat: 'Modern',    p: '#1c1c1c', a: '#c8a84b', t: '#f0ead8', bg: '#111111' },
  // Floral
  { name: 'Rose Garden',     cat: 'Floral',    p: '#3d1020', a: '#f5a0b5', t: '#fff0f5', bg: '#2a0815' },
  { name: 'Lavender Dream',  cat: 'Floral',    p: '#1a0d33', a: '#b088f9', t: '#f5f0ff', bg: '#100820' },
  { name: 'Peony Soft',      cat: 'Floral',    p: '#fdf0f3', a: '#c45876', t: '#2d1018', bg: '#fff5f7' },
  { name: 'Dusty Mauve',     cat: 'Floral',    p: '#2e1a28', a: '#e0a8c8', t: '#f8eef5', bg: '#1c0f1a' },
  // Minimalis
  { name: 'Cream Lembut',    cat: 'Minimalis', p: '#faf8f5', a: '#8b7355', t: '#1a1510', bg: '#f5f2ed' },
  { name: 'Abu Elegan',      cat: 'Minimalis', p: '#2a2a2a', a: '#b8b8b8', t: '#f0f0f0', bg: '#1a1a1a' },
  { name: 'Off White',       cat: 'Minimalis', p: '#fcfaf7', a: '#6b6b6b', t: '#2a2a2a', bg: '#f7f5f2' },
  // Rustic
  { name: 'Kayu Tua',        cat: 'Rustic',    p: '#3d2b1f', a: '#d4956a', t: '#f5e6d3', bg: '#2a1a10' },
  { name: 'Hijau Hutan',     cat: 'Rustic',    p: '#1e3a2f', a: '#8fb870', t: '#e8f4e8', bg: '#122518' },
  { name: 'Terracotta',      cat: 'Rustic',    p: '#2c1a15', a: '#c87941', t: '#f5e5d8', bg: '#1a0e0a' },
]

// ─── Variant Thumbnail ─────────────────────────────────────────
// Mini-mockup visual per variant menggunakan warna template aktif
function VariantThumb({ type, variant, p, a, t }: { type: string; variant: string; p: string; a: string; t: string }) {
  const base: React.CSSProperties = { width: 54, height: 76, backgroundColor: p, borderRadius: 6, overflow: 'hidden', flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column' }

  if (type === 'hero') {
    if (variant === 'default') return (
      <div style={base}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
          <div style={{ width: 20, height: 1, backgroundColor: a }} />
          <div style={{ width: 30, height: 3, backgroundColor: t, borderRadius: 1 }} />
          <div style={{ width: 10, height: 2, backgroundColor: a }} />
          <div style={{ width: 30, height: 3, backgroundColor: t, borderRadius: 1 }} />
          <div style={{ width: 20, height: 1, backgroundColor: a }} />
        </div>
        <div style={{ height: 4, backgroundColor: `${a}44` }} />
      </div>
    )
    if (variant === 'bottom') return (
      <div style={{ ...base, justifyContent: 'flex-end' }}>
        <div style={{ flex: 1, background: `linear-gradient(to bottom, transparent, ${p}cc)` }} />
        <div style={{ padding: '0 6px 8px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <div style={{ width: 34, height: 3.5, backgroundColor: t, borderRadius: 1 }} />
          <div style={{ width: 8, height: 1.5, backgroundColor: a }} />
          <div style={{ width: 34, height: 3.5, backgroundColor: t, borderRadius: 1 }} />
        </div>
      </div>
    )
    if (variant === 'minimal') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 42, height: 60, border: `1.5px solid ${a}88`, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
          <div style={{ width: 28, height: 2.5, backgroundColor: t, borderRadius: 1 }} />
          <div style={{ width: 10, height: 10, border: `1px solid ${a}`, transform: 'rotate(45deg)' }} />
          <div style={{ width: 28, height: 2.5, backgroundColor: t, borderRadius: 1 }} />
        </div>
      </div>
    )
  }

  if (type === 'profiles') {
    if (variant === 'default') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${a}`, backgroundColor: `${a}33` }} />
          <div style={{ width: 1, height: 24, backgroundColor: `${a}44` }} />
          <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${a}`, backgroundColor: `${a}33` }} />
        </div>
      </div>
    )
    if (variant === 'card') return (
      <div style={{ ...base, justifyContent: 'center', padding: '4px 6px', gap: 4 }}>
        {[0,1].map(i => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: `${a}18`, borderRadius: 3, padding: '4px 5px' }}>
            <div style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${a}`, backgroundColor: `${a}22`, flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ width: 18, height: 2, backgroundColor: t, borderRadius: 1 }} />
              <div style={{ width: 12, height: 1.5, backgroundColor: `${t}66`, borderRadius: 1 }} />
            </div>
          </div>
        ))}
      </div>
    )
    if (variant === 'vertical') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${a}`, backgroundColor: `${a}33` }} />
        <div style={{ width: 1, height: 10, backgroundColor: `${a}44` }} />
        <div style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${a}`, backgroundColor: `${a}33` }} />
      </div>
    )
  }

  if (type === 'events') {
    if (variant === 'default') return (
      <div style={{ ...base, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, padding: 6 }}>
        {[0,1].map(i => (
          <div key={i} style={{ flex: 1, height: 54, border: `1px solid ${a}44`, borderRadius: 3, padding: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ width: '80%', height: 2.5, backgroundColor: a, borderRadius: 1 }} />
            <div style={{ width: '60%', height: 2, backgroundColor: `${t}66`, borderRadius: 1 }} />
            <div style={{ width: '70%', height: 2, backgroundColor: `${t}66`, borderRadius: 1 }} />
          </div>
        ))}
      </div>
    )
    if (variant === 'timeline') return (
      <div style={{ ...base, justifyContent: 'center', padding: '4px 8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'flex-start' }}>
          {[0,1].map(i => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: a, flexShrink: 0 }} />
                {i === 0 && <div style={{ width: 1.5, height: 16, backgroundColor: `${a}44` }} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1 }}>
                <div style={{ width: 24, height: 2.5, backgroundColor: a, borderRadius: 1 }} />
                <div style={{ width: 18, height: 2, backgroundColor: `${t}55`, borderRadius: 1 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
    if (variant === 'compact') return (
      <div style={{ ...base, justifyContent: 'center', padding: '4px 8px', gap: 6 }}>
        {[0,1].map(i => (
          <div key={i}>
            <div style={{ width: 28, height: 2.5, backgroundColor: a, borderRadius: 1, marginBottom: 3 }} />
            <div style={{ width: '100%', height: 1.5, backgroundColor: `${t}55`, borderRadius: 1, marginBottom: 2 }} />
            <div style={{ width: '80%', height: 1.5, backgroundColor: `${t}44`, borderRadius: 1 }} />
          </div>
        ))}
      </div>
    )
  }

  if (type === 'countdown') {
    if (variant === 'default') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 10, height: 14, border: `1px solid ${a}55`, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 6, height: 2, backgroundColor: a }} />
            </div>
          ))}
        </div>
        <div style={{ width: 28, height: 1.5, backgroundColor: `${a}44` }} />
      </div>
    )
    if (variant === 'minimal') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
              <div style={{ width: 12, height: 5, backgroundColor: t, borderRadius: 1, opacity: 0.9 }} />
              <div style={{ width: 8, height: 1.5, backgroundColor: `${a}77`, borderRadius: 1 }} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'closing') {
    if (variant === 'default') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <div style={{ fontSize: 14 }}>💍</div>
        <div style={{ width: 28, height: 1.5, backgroundColor: `${a}55` }} />
        <div style={{ width: 36, height: 2, backgroundColor: `${t}88`, borderRadius: 1 }} />
        <div style={{ width: 28, height: 2, backgroundColor: a, borderRadius: 1 }} />
        <div style={{ width: 28, height: 1.5, backgroundColor: `${a}55` }} />
      </div>
    )
    if (variant === 'elegant') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 44, height: 64, border: `1px solid ${a}66`, borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
          <div style={{ width: 22, height: 2.5, backgroundColor: a, borderRadius: 1 }} />
          <div style={{ width: 30, height: 2, backgroundColor: t, borderRadius: 1 }} />
          <div style={{ width: 20, height: 2, backgroundColor: `${t}66`, borderRadius: 1 }} />
        </div>
      </div>
    )
  }

  // Default fallback
  return (
    <div style={{ ...base, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
        <div style={{ width: 32, height: 2.5, backgroundColor: a, borderRadius: 1 }} />
        <div style={{ width: 38, height: 2, backgroundColor: `${t}88`, borderRadius: 1 }} />
        <div style={{ width: 28, height: 2, backgroundColor: `${t}66`, borderRadius: 1 }} />
      </div>
    </div>
  )
}


// Variant yang tersedia per tipe section
const SECTION_VARIANTS: Record<string, { value: string; label: string; desc: string }[]> = {
  hero: [
    { value: 'default', label: 'Centered', desc: 'Nama di tengah layar' },
    { value: 'bottom',  label: 'Bottom',   desc: 'Nama di bawah, foto penuh' },
    { value: 'minimal', label: 'Minimal',  desc: 'Tipografi, tanpa foto bg' },
  ],
  profiles: [
    { value: 'default',  label: 'Portrait',  desc: 'Frame portrait berdampingan, badge &' },
    { value: 'card',    label: 'Full Panel', desc: 'Setiap profil satu panel penuh' },
    { value: 'vertical', label: 'Vertical',      desc: 'Susun atas-bawah' },
  ],
  events: [
    { value: 'default',  label: 'Cards',    desc: 'Kartu premium dengan gradien' },
    { value: 'photo',    label: 'Foto',     desc: 'Foto lokasi + info di bawah' },
    { value: 'timeline', label: 'Timeline', desc: 'Garis waktu dengan titik' },
    { value: 'compact',  label: 'Kompak',   desc: 'Ringkas, info essensial' },
  ],
  countdown: [
    { value: 'boxes',   label: 'Kotak',       desc: 'Angka dalam kotak bergradien' },
    { value: 'minimal', label: 'Minimal',     desc: 'Angka besar bersih tanpa kotak' },
    { value: 'rings',   label: 'Lingkaran',   desc: 'Progress ring SVG animasi' },
    { value: 'elegant', label: 'Elegan',      desc: 'Hari besar + jam/menit/detik kecil' },
  ],
  gift: [
    { value: 'default', label: 'Stack',  desc: 'Kartu vertikal penuh' },
    { value: 'swipe',   label: 'Swipe',  desc: 'Geser horizontal, 1 kartu tampil' },
    { value: 'grid',    label: 'Grid 2×', desc: '2 kartu kompak per baris' },
    { value: 'list',    label: 'List',   desc: 'Baris ringkas dengan logo' },
  ],
  closing: [
    { value: 'default',  label: 'Simple',  desc: 'Teks penutup sederhana' },
    { value: 'elegant',  label: 'Elegant', desc: 'Dengan ornamen border' },
  ],
  story: [
    { value: 'default',   label: 'Default',   desc: 'Teks + foto opsional' },
    { value: 'cinematic', label: 'Cinematic', desc: 'Foto besar, teks overlay' },
    { value: 'timeline',  label: 'Timeline',  desc: 'Garis waktu perjalanan (butuh story_timeline)' },
  ],
}

const ANIM_LABEL: Record<string, string> = {
  'none': 'Tidak Ada', 'fade-in': 'Fade In', 'slide-left': 'Geser Kiri',
  'slide-right': 'Geser Kanan', 'slide-up': 'Naik', 'slide-down': 'Turun',
  'zoom-in': 'Zoom In', 'rotate-in': 'Putar Masuk', 'float': 'Melayang',
}
const HEADING_FONTS = ['Playfair Display', 'Cinzel', 'Cormorant Garamond', 'Great Vibes', 'Dancing Script', 'Libre Baskerville', 'EB Garamond']
const BODY_FONTS = ['Lato', 'Raleway', 'Nunito', 'Cormorant Garamond', 'Roboto', 'Inter', 'Jost']

type ConfigTab = 'identity' | 'colors' | 'opening' | 'sections' | 'json'

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero (Cover)', profiles: 'Profil Pasangan', countdown: 'Hitung Mundur',
  events: 'Detail Acara', story: 'Kisah Cinta', gallery: 'Galeri Foto',
  rsvp: 'RSVP', wishes: 'Buku Ucapan', closing: 'Penutup',
  gift: 'Amplop Digital', livestream: 'Livestream',
  quote: 'Quote / Doa', video: 'Video Sinematik', 'gift-registry': 'Daftar Hadiah',
  'ig-story': 'Template IG Story', qrcode: 'QR Code',
}

// ─── Helpers ───────────────────────────────────────────────────
function makeId() {
  return 'lab-' + Date.now().toString(36)
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// ─── Main Component ────────────────────────────────────────────
interface TemplateLabProps {
  onGoToManagement?: () => void
  /** Kategori dari Manajemen (CRUD admin). Fallback ke built-in kalau undefined. */
  categories?: TemplateCategory[]
  /** Palet warna dari Manajemen (CRUD admin). Fallback ke COLOR_PALETTES hardcoded. */
  palettes?: ColorPalette[]
}

export default function TemplateLab({ onGoToManagement, categories: categoriesProp, palettes: palettesProp }: TemplateLabProps) {
  const [config, setConfig] = useState<TemplateRecord>(() => ({
    ...deepClone(JAVANESE_GOLD),
    id: makeId(),
    name: 'Template Baru',
    slug: 'template-baru',
  }))
  const [activeTab, setActiveTab] = useState<ConfigTab>('identity')
  const [previewMode, setPreviewMode] = useState<'invitation' | 'cover' | 'loading'>('invitation')
  const [previewGuestName, setPreviewGuestName] = useState('Bapak Budi dan Keluarga')
  const [jsonText, setJsonText] = useState('')
  const [previewData, setPreviewData] = useState<NewInvitationData>(PREVIEW_DATA_DEFAULT)
  const [showHowTo, setShowHowTo] = useState(false)
  // ── Categories: mutable state + inline CRUD ────────────────
  const BUILT_IN_CATS: TemplateCategory[] = [
    { slug: 'modern',      label: 'Modern',      is_built_in: true },
    { slug: 'tradisional', label: 'Tradisional', is_built_in: true },
    { slug: 'minimalis',   label: 'Minimalis',   is_built_in: true },
    { slug: 'floral',      label: 'Floral',      is_built_in: true },
    { slug: 'rustic',      label: 'Rustic',      is_built_in: true },
  ]
  const [categoryList, setCategoryList] = useState<TemplateCategory[]>(
    (categoriesProp && categoriesProp.length > 0) ? categoriesProp : BUILT_IN_CATS
  )
  const [catAddLabel,  setCatAddLabel]  = useState('')
  const [catAdding,    setCatAdding]    = useState(false)
  const [catEditSlug,  setCatEditSlug]  = useState<string | null>(null)
  const [catEditLabel, setCatEditLabel] = useState('')
  const [catBusy,      setCatBusy]      = useState(false)

  async function catAdd() {
    const label = catAddLabel.trim(); if (!label || catBusy) return
    const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    setCatBusy(true)
    try {
      const res = await fetch('/api/admin/categories', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label, slug }) })
      if (res.ok) { const { category } = await res.json(); setCategoryList(cs => [...cs, category]); setCatAddLabel(''); setCatAdding(false) }
    } finally { setCatBusy(false) }
  }
  async function catDelete(slug: string) {
    if (catBusy) return; setCatBusy(true)
    try {
      const res = await fetch(`/api/admin/categories/${slug}`, { method: 'DELETE' })
      if (res.ok) { setCategoryList(cs => cs.filter(c => c.slug !== slug)); if (cfg.meta.category === slug) updateMeta({ category: '' }) }
    } finally { setCatBusy(false) }
  }
  async function catEdit(slug: string) {
    const label = catEditLabel.trim(); if (!label || catBusy) return; setCatBusy(true)
    try {
      const res = await fetch(`/api/admin/categories/${slug}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ label }) })
      if (res.ok) { setCategoryList(cs => cs.map(c => c.slug === slug ? { ...c, label } : c)); setCatEditSlug(null) }
    } finally { setCatBusy(false) }
  }

  // Konversi COLOR_PALETTES (hardcoded) ke shape ColorPalette kalau tidak ada prop.
  const paletteList: { name: string; cat: string; p: string; a: string; t: string; bg: string }[] = useMemo(() => {
    if (palettesProp && palettesProp.length > 0) {
      return palettesProp.map(p => ({ name: p.name, cat: p.group, p: p.primary, a: p.accent, t: p.text, bg: p.background }))
    }
    return COLOR_PALETTES
  }, [palettesProp])

  const paletteGroups: string[] = useMemo(() => {
    const seen = new Set<string>()
    const out: string[] = []
    for (const p of paletteList) if (!seen.has(p.cat)) { seen.add(p.cat); out.push(p.cat) }
    return out
  }, [paletteList])
  const [templateDesc, setTemplateDesc]             = useState('')
  const [templateTags, setTemplateTags]             = useState<string[]>([])
  const [expandedSectionId, setExpandedSectionId]   = useState<string | null>(null)
  const [draggingSectionId, setDraggingSectionId]   = useState<string | null>(null)
  const [dragOverSectionId, setDragOverSectionId]   = useState<string | null>(null)
  const [previewPlaying, setPreviewPlaying]         = useState(false)
  const [previewLoading, setPreviewLoading]         = useState(false)
  const [decorPreviewKey, setDecorPreviewKey]       = useState(0)
  const [sectionReplay, setSectionReplay]           = useState<{ id: string; key: number } | null>(null)
  const [showRelease, setShowRelease]               = useState(false)
  const [releaseSuccess, setReleaseSuccess]         = useState<string | null>(null)
  const [releaseForm, setReleaseForm] = useState({
    name: '',
    slug: '',
    category: 'modern' as 'modern' | 'tradisional' | 'minimalis' | 'floral' | 'rustic',
    status: 'draft' as 'draft' | 'active',
    description: '',
    price: 0,
    required_package: 'all' as import('@/lib/types').TemplatePackageRequirement,
    thumbnail_url: '',
  })
  const [releasing, setReleasing] = useState(false)
  const [jsonError, setJsonError] = useState('')
  const [previewKey, setPreviewKey] = useState(0)
  const [savedLabs, setSavedLabs] = useState<{ id: string; name: string; config: TemplateRecord }[]>(() => {
    try { return JSON.parse(localStorage.getItem('akundang-labs') || '[]') }
    catch { return [] }
  })

  // Auto-switch preview ke Cover saat tab Opening aktif
  useEffect(() => {
    if (activeTab === 'opening') setPreviewMode('cover')
    else if (activeTab !== 'json') setPreviewMode('invitation')
  }, [activeTab])

  // Derived
  const cfg = config.config
  const sections = useMemo(
    () => [...cfg.sections].sort((a, b) => a.order - b.order),
    [cfg.sections]
  )

  // ── Updaters ──────────────────────────────────────────────────
  const updateMeta = useCallback((patch: Partial<TemplateMeta>) => {
    setConfig(prev => ({
      ...prev,
      config: { ...prev.config, meta: { ...prev.config.meta, ...patch } },
    }))
  }, [])

  const updateColors = useCallback((key: keyof ColorScheme, val: string) => {
    setConfig(prev => ({
      ...prev,
      config: {
        ...prev.config,
        meta: {
          ...prev.config.meta,
          color_scheme: { ...prev.config.meta.color_scheme, [key]: val },
        },
      },
    }))
  }, [])

  const updateFont = useCallback((key: 'heading' | 'body', val: string) => {
    setConfig(prev => ({
      ...prev,
      config: {
        ...prev.config,
        meta: { ...prev.config.meta, font: { ...prev.config.meta.font, [key]: val } },
      },
    }))
  }, [])

  const updateOpening = useCallback((patch: Partial<OpeningConfig>) => {
    setConfig(prev => ({
      ...prev,
      config: { ...prev.config, opening: { ...prev.config.opening, ...patch } },
    }))
  }, [])

  const updateSection = useCallback((sectionId: string, patch: Record<string, unknown>) => {
    setConfig(prev => ({
      ...prev,
      config: {
        ...prev.config,
        sections: prev.config.sections.map(s => s.id === sectionId ? { ...s, ...patch } : s),
      },
    }))
  }, [])

  const moveSection = useCallback((sectionId: string, dir: 'up' | 'down') => {
    setConfig(prev => {
      const sorted = [...prev.config.sections].sort((a, b) => a.order - b.order)
      const idx = sorted.findIndex(s => s.id === sectionId)
      const swapIdx = dir === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= sorted.length) return prev
      const newSections = sorted.map((s, i) => ({ ...s, order: i + 1 }))
      const tmp = newSections[idx].order
      newSections[idx] = { ...newSections[idx], order: newSections[swapIdx].order }
      newSections[swapIdx] = { ...newSections[swapIdx], order: tmp }
      return { ...prev, config: { ...prev.config, sections: newSections } }
    })
  }, [])

  const addSection = useCallback((type: string) => {
    const maxOrder = Math.max(0, ...cfg.sections.map(s => s.order))
    const newSection = {
      id: type + '-' + makeId(),
      type: type as SectionType,
      order: maxOrder + 1,
      enabled: true,
      background: { type: 'color' as const, value: cfg.meta.color_scheme.primary },
      decoration_images: [] as string[],
      transition_in: 'fade' as const,
      transition_out: 'fade' as const,
      user_fields: [] as string[],
    }
    setConfig(prev => ({
      ...prev,
      config: { ...prev.config, sections: [...prev.config.sections, newSection] },
    }))
  }, [cfg])

  const removeSection = useCallback((sectionId: string) => {
    setConfig(prev => ({
      ...prev,
      config: { ...prev.config, sections: prev.config.sections.filter(s => s.id !== sectionId) },
    }))
  }, [])

  const handleSectionDrop = useCallback((targetId: string) => {
    if (!draggingSectionId || draggingSectionId === targetId) return
    setConfig(prev => {
      const sorted = [...prev.config.sections].sort((a, b) => a.order - b.order)
      const fromIdx = sorted.findIndex(s => s.id === draggingSectionId)
      const toIdx   = sorted.findIndex(s => s.id === targetId)
      if (fromIdx === -1 || toIdx === -1) return prev
      const reordered = [...sorted]
      const [moved] = reordered.splice(fromIdx, 1)
      reordered.splice(toIdx, 0, moved)
      return {
        ...prev,
        config: { ...prev.config, sections: reordered.map((s, i) => ({ ...s, order: i + 1 })) },
      }
    })
    setDraggingSectionId(null)
    setDragOverSectionId(null)
  }, [draggingSectionId])

  // ── JSON tab handlers ─────────────────────────────────────────
  function openJsonTab() {
    setJsonText(JSON.stringify(config.config, null, 2))
    setJsonError('')
    setActiveTab('json')
  }

  function applyJson() {
    try {
      const parsed = JSON.parse(jsonText)
      setConfig(prev => ({ ...prev, config: parsed }))
      setJsonError('')
      toast.success('Konfigurasi JSON diterapkan')
    } catch (e) {
      setJsonError('JSON tidak valid: ' + (e as Error).message)
    }
  }

  // ── Save/Load lab ─────────────────────────────────────────────
  function saveLab() {
    const name = prompt('Nama eksperimen ini:', config.name || 'Lab ' + new Date().toLocaleDateString('id-ID'))
    if (!name) return
    const entry = { id: makeId(), name, config }
    const updated = [...savedLabs, entry]
    setSavedLabs(updated)
    localStorage.setItem('akundang-labs', JSON.stringify(updated))
    toast.success('Eksperimen disimpan di browser!')
  }

  function loadLab(id: string) {
    const entry = savedLabs.find(l => l.id === id)
    if (!entry) return
    setConfig(deepClone(entry.config))
    setPreviewKey(k => k + 1)
    toast.success(`"${entry.name}" dimuat`)
  }

  function deleteLab(id: string) {
    const updated = savedLabs.filter(l => l.id !== id)
    setSavedLabs(updated)
    localStorage.setItem('akundang-labs', JSON.stringify(updated))
  }

  function resetToBase() {
    if (!confirm('Reset ke Javanese Gold?')) return
    setConfig({ ...deepClone(JAVANESE_GOLD), id: makeId(), name: 'Template Baru', slug: 'template-baru' })
    setPreviewKey(k => k + 1)
  }

  function openReleaseModal() {
    setReleaseForm({
      name: config.name || 'Template Baru',
      slug: config.slug || 'template-baru',
      category: (config.config.meta.category as typeof releaseForm.category) || 'modern',
      status: 'draft',
      description: templateDesc || '',
      price: config.price ?? 0,
      required_package: config.required_package ?? 'all',
      thumbnail_url: config.thumbnail_url ?? '',
    })
    setShowRelease(true)
  }

  async function submitRelease() {
    if (!releaseForm.name || !releaseForm.slug) {
      toast.error('Nama dan slug wajib diisi')
      return
    }
    if (!/^[a-z0-9-]{3,30}$/.test(releaseForm.slug)) {
      toast.error('Slug: 3-30 karakter, huruf kecil + angka + strip saja')
      return
    }
    setReleasing(true)
    try {
      // Kirim FULL TemplateRecord ke endpoint baru — config.sections + designTokens ikut tersimpan,
      // beda dgn endpoint legacy /api/admin/templates yang cuma metadata.
      const body = {
        id: releaseForm.slug,
        name: releaseForm.name,
        slug: releaseForm.slug,
        category: releaseForm.category,
        config: {
          ...config.config,
          meta: {
            ...config.config.meta,
            name: releaseForm.name,
            slug: releaseForm.slug,
            category: releaseForm.category,
            thumbnail: releaseForm.thumbnail_url,
          },
        },
        thumbnail_url: releaseForm.thumbnail_url,
        status: releaseForm.status,
        price: releaseForm.price,
        required_package: releaseForm.required_package,
      }
      const res = await fetch('/api/admin/template-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Gagal mendaftarkan template')
      }
      setShowRelease(false)
      setReleaseSuccess(releaseForm.name)
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setReleasing(false)
    }
  }

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden">

      {/* ── Left: Config Editor ── */}
      <div className="w-[420px] shrink-0 flex flex-col border-r border-gray-200 bg-white overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <FlaskConical className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-gray-900">Template Lab</h2>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold ml-1">BETA</span>
          </div>
          <input
            value={config.name}
            onChange={e => setConfig(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nama template..."
          />
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50 shrink-0">
          {([
            ['identity', LayoutTemplate, 'Identitas'],
            ['colors',   Palette,        'Warna'],
            ['opening',  Sparkles,       'Opening'],
            ['sections', Type,           'Sections'],
            ['json',     Code2,          'JSON'],
          ] as [ConfigTab, React.ElementType, string][]).map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => id === 'json' ? openJsonTab() : setActiveTab(id)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors ${
                activeTab === id
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">

          {/* ── Identitas ── */}
          {activeTab === 'identity' && (
            <div className="space-y-5">

              {/* Info: alur kerja Template Lab — collapsible */}
              <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100 overflow-hidden">
                <button
                  onClick={() => setShowHowTo(s => !s)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50/50 transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">💡</span>
                    <p className="text-xs font-bold text-indigo-700">Cara Kerja Template Lab</p>
                  </div>
                  <ChevronDown size={14} className={`text-indigo-400 transition-transform duration-200 ${showHowTo ? 'rotate-180' : ''}`} />
                </button>
                {showHowTo && (
                  <div className="px-4 pb-4 space-y-2.5 border-t border-indigo-100">
                    {[
                      { icon: '✏️', title: 'Edit & Eksperimen', desc: 'Desain template bebas di sini. Klik "Simpan Eksperimen" untuk menyimpan sementara di browser.' },
                      { icon: '🚀', title: 'Rilis ke Manajemen', desc: 'Klik "Rilis Template" untuk mengirim ke modul Manajemen, lalu atur harga & paket akses.' },
                      { icon: '👤', title: 'Tersedia ke User', desc: 'Setelah diaktifkan di Manajemen, user bisa memilih template ini saat buat undangan.' },
                    ].map(s => (
                      <div key={s.icon} className="flex gap-2.5 items-start pt-2">
                        <span className="text-sm shrink-0">{s.icon}</span>
                        <div>
                          <p className="text-[11px] font-semibold text-indigo-800">{s.title}</p>
                          <p className="text-[10px] text-indigo-500 leading-relaxed">{s.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Identity fields */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Identitas Template</p>
                <div className="space-y-3">
                  <Field label="Slug (ID Unik)">
                    <div className="flex gap-1.5">
                      <input
                        value={config.slug}
                        onChange={e => setConfig(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                        className={inputCls + ' flex-1 font-mono text-xs'}
                        placeholder="contoh: jawa-emas-modern"
                      />
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, slug: prev.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }))}
                        className="px-2.5 py-2 text-[10px] font-semibold bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-600 shrink-0"
                        title="Generate dari nama"
                      >
                        Auto
                      </button>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1">Huruf kecil + strip. Dipakai sebagai ID unik template.</p>
                  </Field>

                  <Field label="Deskripsi">
                    <textarea
                      value={templateDesc}
                      onChange={e => setTemplateDesc(e.target.value)}
                      rows={2}
                      className={inputCls + ' text-sm resize-none'}
                      placeholder="Deskripsi singkat template ini untuk ditampilkan ke user..."
                    />
                  </Field>
                </div>
              </div>

              {/* Kategori — inline CRUD */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Kategori</p>
                  <button onClick={() => { setCatAdding(a => !a); setCatAddLabel('') }}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5">
                    {catAdding ? '✕ Batal' : '+ Tambah'}
                  </button>
                </div>

                {/* Add form */}
                {catAdding && (
                  <div className="flex gap-1.5 mb-2.5">
                    <input
                      value={catAddLabel}
                      onChange={e => setCatAddLabel(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && catAdd()}
                      placeholder="Nama kategori baru..."
                      className="flex-1 text-xs px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-400"
                      autoFocus
                    />
                    <button onClick={catAdd} disabled={!catAddLabel.trim() || catBusy}
                      className="px-3 py-2 bg-indigo-600 text-white text-[10px] font-bold rounded-xl disabled:opacity-40 hover:bg-indigo-700 transition-colors">
                      Simpan
                    </button>
                  </div>
                )}

                {/* Category list */}
                <div className="space-y-1.5">
                  {categoryList.map(c => (
                    <div key={c.slug}
                      className={`flex items-center gap-2 rounded-xl border px-3 py-2 transition-all ${
                        cfg.meta.category === c.slug ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-100 hover:border-indigo-200'
                      }`}>

                      {/* Select radio dot */}
                      <button onClick={() => updateMeta({ category: c.slug as typeof cfg.meta.category })}
                        className="shrink-0 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors"
                        style={{ borderColor: cfg.meta.category === c.slug ? '#4f46e5' : '#d1d5db' }}>
                        {cfg.meta.category === c.slug && <div className="w-2 h-2 rounded-full bg-indigo-600" />}
                      </button>

                      {/* Label (editable for non-built-in) */}
                      {catEditSlug === c.slug ? (
                        <input
                          value={catEditLabel}
                          onChange={e => setCatEditLabel(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') catEdit(c.slug); if (e.key === 'Escape') setCatEditSlug(null) }}
                          className="flex-1 text-xs px-2 py-0.5 border border-indigo-300 rounded-lg focus:outline-none"
                          autoFocus
                          onBlur={() => catEdit(c.slug)}
                        />
                      ) : (
                        <span className="flex-1 text-xs font-semibold text-gray-700 truncate">{c.label}</span>
                      )}

                      {/* Actions — all categories can be edited & deleted */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button onClick={() => { setCatEditSlug(c.slug); setCatEditLabel(c.label) }}
                          className="text-[9px] text-indigo-400 hover:text-indigo-700 font-semibold px-1.5 py-0.5 rounded-md hover:bg-indigo-50 transition-colors">
                          Edit
                        </button>
                        <button onClick={() => catDelete(c.slug)} disabled={catBusy}
                          className="p-1 text-gray-300 hover:text-red-400 rounded-md hover:bg-red-50 transition-colors disabled:opacity-30">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tipografi dengan preview + ukuran */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Tipografi</p>
                <div className="space-y-4">

                  {/* Font Judul */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-600">Font Judul</p>
                      <span className="text-xs italic" style={{ fontFamily: `'${cfg.meta.font.heading}', serif`, color: cfg.meta.color_scheme.accent }}>
                        {cfg.meta.font.heading}
                      </span>
                    </div>
                    <select value={cfg.meta.font.heading} onChange={e => updateFont('heading', e.target.value)} className={inputCls}>
                      {HEADING_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    {/* Ukuran judul */}
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-gray-500 shrink-0">Ukuran</p>
                      <input type="range" min={0.6} max={2.0} step={0.05}
                        value={cfg.meta.font.heading_scale ?? 1.0}
                        onChange={e => updateMeta({ font: { ...cfg.meta.font, heading_scale: Number(e.target.value) } })}
                        className="flex-1 accent-indigo-600 h-1.5" />
                      <span className="text-[10px] font-mono text-indigo-500 w-9 text-right shrink-0">
                        {((cfg.meta.font.heading_scale ?? 1.0) * 100).toFixed(0)}%
                      </span>
                      {(cfg.meta.font.heading_scale ?? 1.0) !== 1.0 && (
                        <button onClick={() => updateMeta({ font: { ...cfg.meta.font, heading_scale: 1.0 } })}
                          className="text-[9px] text-gray-400 hover:text-indigo-500 shrink-0">↺</button>
                      )}
                    </div>
                    {/* Preview */}
                    <div className="px-3 py-2 rounded-lg border border-gray-100 bg-gray-50">
                      <p style={{
                        fontFamily: `'${cfg.meta.font.heading}', serif`,
                        color: cfg.meta.color_scheme.text,
                        backgroundColor: cfg.meta.color_scheme.primary,
                        fontSize: `calc(16px * ${cfg.meta.font.heading_scale ?? 1.0})`,
                        fontWeight: 700,
                        padding: '4px 8px', borderRadius: 6, display: 'inline-block',
                      }}>
                        Aa — Ikhwal &amp; Fani
                      </p>
                    </div>
                  </div>

                  {/* Font Teks */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-gray-600">Font Teks</p>
                      <span className="text-xs" style={{ fontFamily: `'${cfg.meta.font.body}', sans-serif`, color: '#666' }}>
                        {cfg.meta.font.body}
                      </span>
                    </div>
                    <select value={cfg.meta.font.body} onChange={e => updateFont('body', e.target.value)} className={inputCls}>
                      {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                    {/* Ukuran teks */}
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-gray-500 shrink-0">Ukuran</p>
                      <input type="range" min={0.6} max={1.6} step={0.05}
                        value={cfg.meta.font.body_scale ?? 1.0}
                        onChange={e => updateMeta({ font: { ...cfg.meta.font, body_scale: Number(e.target.value) } })}
                        className="flex-1 accent-indigo-600 h-1.5" />
                      <span className="text-[10px] font-mono text-indigo-500 w-9 text-right shrink-0">
                        {((cfg.meta.font.body_scale ?? 1.0) * 100).toFixed(0)}%
                      </span>
                      {(cfg.meta.font.body_scale ?? 1.0) !== 1.0 && (
                        <button onClick={() => updateMeta({ font: { ...cfg.meta.font, body_scale: 1.0 } })}
                          className="text-[9px] text-gray-400 hover:text-indigo-500 shrink-0">↺</button>
                      )}
                    </div>
                    {/* Preview */}
                    <div className="px-3 py-2 rounded-lg border border-gray-100 bg-gray-50">
                      <p style={{
                        fontFamily: `'${cfg.meta.font.body}', sans-serif`,
                        color: '#444',
                        fontSize: `calc(11px * ${cfg.meta.font.body_scale ?? 1.0})`,
                        lineHeight: 1.6,
                      }}>
                        Dengan penuh kebahagiaan kami mengundang kehadiran Bapak/Ibu
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* Eksperimen tersimpan */}
              {savedLabs.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Eksperimen Tersimpan ({savedLabs.length})
                  </p>
                  <p className="text-[9px] text-gray-400 mb-2">Tersimpan di browser kamu — tidak hilang kalau tab ditutup.</p>
                  <div className="space-y-1.5">
                    {savedLabs.map(l => (
                      <div key={l.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="flex-1 text-xs text-gray-700 truncate font-medium">{l.name}</span>
                        <button onClick={() => loadLab(l.id)} className="text-[10px] text-indigo-600 hover:underline font-semibold shrink-0">Muat</button>
                        <button onClick={() => deleteLab(l.id)} className="text-gray-300 hover:text-red-500 shrink-0">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Warna ── */}
          {activeTab === 'colors' && (
            <div className="space-y-5">

              {/* Diagram visual: warna dipakai di mana */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Penerapan Warna</p>
                <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  {/* Header = primary */}
                  <div className="relative px-4 pt-4 pb-3"
                    style={{ backgroundColor: cfg.meta.color_scheme.primary, color: cfg.meta.color_scheme.text }}>
                    <div className="absolute top-1.5 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${cfg.meta.color_scheme.accent}33`, color: cfg.meta.color_scheme.accent }}>
                      PRIMER
                    </div>
                    <p className="text-[9px] opacity-60 mb-0.5" style={{ fontFamily: `'${cfg.meta.font.body}', serif` }}>
                      Bismillahirrahmanirrahim
                    </p>
                    <p className="text-lg font-bold leading-tight" style={{ fontFamily: `'${cfg.meta.font.heading}', serif` }}>
                      Ikhwal &amp; Fani
                    </p>
                    {/* Accent line */}
                    <div className="mt-2 h-0.5 w-12 rounded" style={{ backgroundColor: cfg.meta.color_scheme.accent }}>
                    </div>
                    <div className="absolute bottom-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${cfg.meta.color_scheme.accent}33`, color: cfg.meta.color_scheme.accent }}>
                      AKSEN ↑
                    </div>
                  </div>
                  {/* Secondary section = background */}
                  <div className="relative px-4 py-3"
                    style={{ backgroundColor: cfg.meta.color_scheme.background ?? cfg.meta.color_scheme.primary }}>
                    <div className="absolute top-1.5 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${cfg.meta.color_scheme.accent}33`, color: cfg.meta.color_scheme.accent }}>
                      BACKGROUND
                    </div>
                    <p className="text-xs leading-relaxed" style={{ color: cfg.meta.color_scheme.text, opacity: 0.8, fontFamily: `'${cfg.meta.font.body}', serif` }}>
                      Dengan penuh kebahagiaan kami mengundang...
                    </p>
                    <div className="absolute bottom-2 right-2 text-[8px] font-bold px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${cfg.meta.color_scheme.text}22`, color: cfg.meta.color_scheme.text, opacity: 0.7 }}>
                      TEKS ↑
                    </div>
                  </div>
                  {/* Footer legend */}
                  <div className="bg-gray-50 px-3 py-2 flex flex-wrap gap-3">
                    {([
                      ['primary', 'Latar utama & cover'],
                      ['accent', 'Ornamen & dekorasi'],
                      ['text', 'Semua teks'],
                      ['background', 'Latar section ke-2'],
                    ] as [keyof typeof cfg.meta.color_scheme, string][]).map(([k, desc]) => (
                      <div key={k} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-full border border-gray-200 shrink-0"
                          style={{ backgroundColor: cfg.meta.color_scheme[k] }} />
                        <p className="text-[9px] text-gray-500">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Palette presets */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Palet Tema Siap Pakai
                  </p>
                  {onGoToManagement && (
                    <button onClick={onGoToManagement} className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-700">
                      Kelola di Manajemen &rarr;
                    </button>
                  )}
                </div>
                {/* Group by category — sumber dari props server (CRUD admin) atau fallback hardcoded */}
                {paletteGroups.map(cat => (
                  <div key={cat} className="mb-3">
                    <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-widest mb-1.5">{cat}</p>
                    <div className="grid grid-cols-2 gap-1.5">
                      {paletteList.filter(p => p.cat === cat).map(pal => {
                        const isActive = cfg.meta.color_scheme.primary === pal.p && cfg.meta.color_scheme.accent === pal.a
                        return (
                          <button key={pal.name}
                            onClick={() => {
                              updateColors('primary', pal.p)
                              updateColors('accent', pal.a)
                              updateColors('text', pal.t)
                              updateColors('background', pal.bg)
                            }}
                            className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl border text-left transition-all ${
                              isActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300 bg-white'
                            }`}
                          >
                            {/* Mini color bars */}
                            <div className="flex gap-0.5 shrink-0">
                              <div style={{ width: 12, height: 28, backgroundColor: pal.p, borderRadius: '3px 0 0 3px' }} />
                              <div style={{ width: 6, height: 28, backgroundColor: pal.a }} />
                              <div style={{ width: 6, height: 28, backgroundColor: pal.bg, borderRadius: '0 3px 3px 0' }} />
                            </div>
                            <span className={`text-[10px] font-semibold truncate ${isActive ? 'text-indigo-700' : 'text-gray-600'}`}>
                              {pal.name}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Custom color pickers */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">Custom Warna</p>
                <div className="space-y-3">
                  {([
                    ['primary',    'Latar Utama',   'Background cover & section utama'],
                    ['accent',     'Aksen',         'Ornamen, garis, border, tombol'],
                    ['text',       'Warna Teks',    'Semua tulisan di atas latar primer'],
                    ['background', 'Latar Kedua',   'Background section selang-seling'],
                  ] as [keyof typeof cfg.meta.color_scheme, string, string][]).map(([key, label, hint]) => (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold text-gray-600">{label}</p>
                        <p className="text-[9px] text-gray-400">{hint}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input type="color"
                          value={cfg.meta.color_scheme[key]}
                          onChange={e => updateColors(key, e.target.value)}
                          className="w-10 h-9 rounded-lg cursor-pointer border border-gray-200 shrink-0"
                        />
                        <input
                          value={cfg.meta.color_scheme[key]}
                          onChange={e => updateColors(key, e.target.value)}
                          className={inputCls + ' font-mono flex-1 text-xs'}
                          placeholder="#000000"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Opening ── */}
          {activeTab === 'opening' && (
            <div className="space-y-5">


              {/* ── Opening Content (Still configurable for future use) ── */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Konten Opening (Tidak Ditampilkan di Cover)
                </p>
                <p className="text-[9px] text-gray-400 mb-4 italic">
                  Setting ini untuk konten saja. Cover page tidak akan muncul karena sudah dinonaktifkan.
                </p>

                <div className="space-y-4 opacity-60">

                  <Field label="Salam Pembuka">
                    <input
                      value={cfg.opening.subtitle ?? ''}
                      onChange={e => updateOpening({ subtitle: e.target.value || undefined })}
                      className={inputCls}
                      placeholder="Assalamu'alaikum Wr. Wb."
                    />
                  </Field>

                  {/* Teks Undangan: preset + kustom */}
                  {(() => {
                    const PRESETS = [
                      { key: 'bahagia',   label: '🎉 Bahagia',     text: 'Dengan penuh kebahagiaan, kami mengundang kehadiran Bapak/Ibu/Saudara/i' },
                      { key: 'islami',    label: '🤲 Islami',      text: 'Bismillahirrahmanirrahim. Dengan memohon rahmat dan ridha Allah SWT, kami mengundang Bapak/Ibu/Saudara/i' },
                      { key: 'formal',    label: '🎩 Formal',      text: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami untuk mengundang kehadiran Bapak/Ibu/Saudara/i' },
                      { key: 'rendah',    label: '🙏 Rendah Hati', text: 'Dengan segala kerendahan hati, kami mengundang kehadiran Bapak/Ibu/Saudara/i' },
                      { key: 'sukacita',  label: '💫 Sukacita',    text: 'Dengan penuh sukacita, kami mengundang kehadiran Bapak/Ibu/Saudara/i untuk turut merayakan momen bahagia kami' },
                      { key: 'custom',    label: '✏️ Kustom',      text: null },
                    ] as const
                    const current = cfg.opening.invitation_text ?? ''
                    const matchedPreset = PRESETS.slice(0, -1).find(p => p.text === current)
                    const isCustom = !matchedPreset && current !== ''
                    const showCustom = isCustom || matchedPreset === undefined

                    return (
                      <div>
                        <p className="text-xs font-semibold text-gray-600 mb-2">Teks Undangan</p>
                        {/* Preset chips */}
                        <div className="flex flex-wrap gap-1.5 mb-2.5">
                          {PRESETS.map(p => {
                            const active = p.key === 'custom' ? isCustom : matchedPreset?.key === p.key
                            return (
                              <button key={p.key} type="button"
                                onClick={() => {
                                  if (p.key === 'custom') updateOpening({ invitation_text: '' })
                                  else updateOpening({ invitation_text: p.text })
                                }}
                                className={`px-2.5 py-1.5 rounded-xl text-[10px] font-semibold transition-all border ${
                                  active
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                                }`}>
                                {p.label}
                              </button>
                            )
                          })}
                        </div>
                        {/* Textarea (always visible untuk edit / kustom) */}
                        <textarea
                          value={current}
                          onChange={e => updateOpening({ invitation_text: e.target.value || undefined })}
                          rows={3}
                          className={inputCls + ' resize-none text-xs leading-relaxed'}
                          placeholder="Tulis teks undangan kustom..."
                        />
                        {!isCustom && matchedPreset && (
                          <p className="text-[9px] text-gray-400 mt-1">Edit textarea untuk membuat variasi kustom dari preset ini</p>
                        )}
                      </div>
                    )
                  })()}

                  <Field label="Teks Tombol">
                    <input
                      value={cfg.opening.button_text ?? ''}
                      onChange={e => updateOpening({ button_text: e.target.value || undefined })}
                      className={inputCls}
                      placeholder="Buka Undangan"
                    />
                  </Field>

                  {/* Toggle: Tampilkan Nama Tamu */}
                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Tampilkan Nama Tamu</p>
                      <p className="text-[10px] text-gray-400">Dari URL ?to=nama-tamu</p>
                    </div>
                    <button
                      onClick={() => updateOpening({ show_guest_name: cfg.opening.show_guest_name === false ? true : false })}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                        cfg.opening.show_guest_name !== false ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        cfg.opening.show_guest_name !== false ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  {/* Preview nama tamu (hanya di preview cover) */}
                  {cfg.opening.show_guest_name !== false && (
                    <Field label="Nama Tamu (untuk Preview)">
                      <input
                        value={previewGuestName}
                        onChange={e => setPreviewGuestName(e.target.value)}
                        className={inputCls}
                        placeholder="dr. Gia dan Istri"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">
                        Hanya untuk preview admin. Di undangan asli dari URL ?to=
                      </p>
                    </Field>
                  )}
                </div>
              </div>

              {/* ── Background Music ── */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Musik Latar
                </p>
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Foto Pasangan
                </p>
                <div className="space-y-4">
                  <ImageUploadField
                    value={cfg.opening.cover_photo_url}
                    onChange={url => updateOpening({ cover_photo_url: url })}
                    hint="Foto pasangan akan ditampilkan di halaman cover undangan"
                  />

                  <Field label="Tampilan Foto">
                    <select
                      value={cfg.opening.cover_photo_display ?? 'background'}
                      onChange={e => updateOpening({ cover_photo_display: e.target.value as 'background' | 'portrait' | 'banner' })}
                      className={inputCls}
                    >
                      <option value="background">Background penuh</option>
                      <option value="portrait">Portrait bulat (tengah)</option>
                      <option value="banner">Banner atas</option>
                    </select>
                  </Field>

                  {(cfg.opening.cover_photo_display ?? 'background') === 'background' && (
                    <>
                      <Field label={`Opacity Foto: ${cfg.opening.cover_photo_opacity ?? 40}%`}>
                        <input type="range" min={5} max={80} step={5}
                          value={cfg.opening.cover_photo_opacity ?? 40}
                          onChange={e => updateOpening({ cover_photo_opacity: Number(e.target.value) })}
                          className="w-full accent-indigo-600"
                        />
                        <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
                          <span>Transparan</span><span>Terang</span>
                        </div>
                      </Field>
                      <Field label="Posisi Foto">
                        <select value={cfg.opening.cover_photo_position ?? 'center'}
                          onChange={e => updateOpening({ cover_photo_position: e.target.value as 'top' | 'center' | 'bottom' })}
                          className={inputCls}>
                          <option value="top">Atas</option>
                          <option value="center">Tengah</option>
                          <option value="bottom">Bawah</option>
                        </select>
                      </Field>
                      <Field label={`Tebal Gradasi Bawah: ${cfg.opening.cover_gradient_height ?? 55}%`}>
                        <input type="range" min={20} max={90} step={5}
                          value={cfg.opening.cover_gradient_height ?? 55}
                          onChange={e => updateOpening({ cover_gradient_height: Number(e.target.value) })}
                          className="w-full accent-indigo-600"
                        />
                        <div className="flex justify-between text-[9px] text-gray-400 mt-0.5">
                          <span>Tipis</span><span>Tebal</span>
                        </div>
                      </Field>
                      <Field label="Warna Gradasi">
                        <div className="flex items-center gap-2">
                          <input type="color"
                            value={cfg.opening.cover_gradient_color ?? cfg.meta.color_scheme.primary}
                            onChange={e => updateOpening({ cover_gradient_color: e.target.value })}
                            className="w-10 h-9 rounded-lg cursor-pointer border border-gray-200 shrink-0"
                          />
                          <input
                            value={cfg.opening.cover_gradient_color ?? cfg.meta.color_scheme.primary}
                            onChange={e => updateOpening({ cover_gradient_color: e.target.value })}
                            className={inputCls + ' font-mono flex-1 text-xs'}
                            placeholder="Default: warna primer"
                          />
                          {cfg.opening.cover_gradient_color && (
                            <button onClick={() => updateOpening({ cover_gradient_color: undefined })}
                              className="text-gray-300 hover:text-gray-600 text-xs shrink-0" title="Reset ke primer">
                              ↺
                            </button>
                          )}
                        </div>
                      </Field>
                    </>
                  )}
                </div>
              </div>

              {/* ── Aset Dekorasi (Layer Panel) ── */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Aset Dekorasi</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Upload gambar → atur posisi, efek masuk & animasi berkelanjutan</p>
                  </div>
                  <label className="flex items-center gap-1 text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 cursor-pointer border border-indigo-200 hover:border-indigo-400 rounded-lg px-2 py-1 transition-colors shrink-0">
                    <Plus className="w-3 h-3" /> Upload
                    <input type="file" accept="image/*" className="hidden"
                      onChange={async e => {
                        const file = e.target.files?.[0]
                        if (!file) return
                        const fd = new FormData()
                        fd.append('file', file)
                        fd.append('folder', 'decorations')
                        const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
                        const data = await res.json()
                        if (!res.ok) { alert(data.error); return }
                        const newAsset: import('@/lib/types').DecorationAsset = {
                          id: 'deco-' + Date.now().toString(36),
                          url: data.url, label: file.name.replace(/\.[^.]+$/, ''),
                          position: 'top-right', width: 80, opacity: 100,
                          animation: 'fade-in', animation_delay: 200,
                          idle_animation: 'none', z_layer: (cfg.opening.decoration_assets?.length ?? 0),
                        }
                        updateOpening({ decoration_assets: [...(cfg.opening.decoration_assets ?? []), newAsset] })
                        e.target.value = ''
                      }}
                    />
                  </label>
                </div>

                {(!cfg.opening.decoration_assets || cfg.opening.decoration_assets.length === 0) ? (
                  <div className="border-2 border-dashed border-gray-200 rounded-xl py-6 text-center">
                    <p className="text-2xl mb-1">🎋</p>
                    <p className="text-[10px] font-medium text-gray-400">Belum ada aset dekorasi</p>
                    <p className="text-[9px] text-gray-300 mt-0.5">Upload kipas, ornamen, batik, bunga, dll.</p>
                  </div>
                ) : (
                  <DecorationLayerList
                    assets={cfg.opening.decoration_assets}
                    onUpdate={assets => updateOpening({ decoration_assets: assets })}
                    onPreview={() => { setPreviewMode('cover'); setDecorPreviewKey(k => k + 1) }}
                  />
                )}
              </div>

              {/* ── Loading Screen Settings ── */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">
                    Loading Screen
                  </p>
                  <button
                    onClick={() => setPreviewMode('loading')}
                    className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-2 py-1 transition-colors"
                  >
                    <Play className="w-2.5 h-2.5 fill-current" /> Preview
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 mb-3">
                  <p className="text-[9px] text-blue-700 leading-relaxed">
                    <strong>Info:</strong> Loading screen TIDAK muncul di undangan live (langsung masuk).
                    Setting ini hanya untuk preview di mockup admin.
                  </p>
                </div>
                <div className="space-y-4">
                  <Field label="Teks Loading">
                    <input
                      value={cfg.loading.text}
                      onChange={e => setConfig(prev => ({
                        ...prev,
                        config: { ...prev.config, loading: { ...prev.config.loading, text: e.target.value } },
                      }))}
                      className={inputCls}
                    />
                  </Field>
                  <Field label="Warna Background Loading">
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={cfg.loading.background_color}
                        onChange={e => setConfig(prev => ({
                          ...prev,
                          config: { ...prev.config, loading: { ...prev.config.loading, background_color: e.target.value } },
                        }))}
                        className="w-10 h-9 rounded-lg cursor-pointer border border-gray-200"
                      />
                      <input
                        value={cfg.loading.background_color}
                        onChange={e => setConfig(prev => ({
                          ...prev,
                          config: { ...prev.config, loading: { ...prev.config.loading, background_color: e.target.value } },
                        }))}
                        className={inputCls + ' font-mono flex-1'}
                      />
                    </div>
                  </Field>
                </div>
              </div>

              {/* ── Musik Latar ── */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Musik Latar
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-500">Putar Musik Otomatis</label>
                    <button
                      onClick={() => updateOpening({ music_autoplay: !cfg.opening.music_autoplay })}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                        cfg.opening.music_autoplay ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        cfg.opening.music_autoplay ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* ── Sections ── */}
          {activeTab === 'sections' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Atur section yang tampil, urutan, dan warna latar masing-masing.</p>

              {sections.map((s, idx) => (
                <div
                  key={s.id}
                  draggable
                  onDragStart={() => setDraggingSectionId(s.id)}
                  onDragOver={e => { e.preventDefault(); setDragOverSectionId(s.id) }}
                  onDrop={() => handleSectionDrop(s.id)}
                  onDragEnd={() => { setDraggingSectionId(null); setDragOverSectionId(null) }}
                  className={`border rounded-xl overflow-hidden transition-all ${
                    draggingSectionId === s.id
                      ? 'opacity-40 scale-[0.98] border-indigo-300'
                      : dragOverSectionId === s.id && draggingSectionId !== s.id
                      ? 'border-indigo-400 ring-2 ring-indigo-200'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50">
                    {/* Drag handle */}
                    <div className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0">
                      <GripVertical className="w-3.5 h-3.5" />
                    </div>
                    {/* Reorder arrows (fallback) */}
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveSection(s.id, 'up')} disabled={idx === 0}
                        className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20">
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => moveSection(s.id, 'down')} disabled={idx === sections.length - 1}
                        className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20">
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Color dot */}
                    <input
                      type="color"
                      value={s.background.value}
                      onChange={e => updateSection(s.id, { background: { ...s.background, value: e.target.value } })}
                      className="w-6 h-6 rounded cursor-pointer border border-gray-200 shrink-0"
                      title="Warna latar section"
                    />

                    {/* Label */}
                    <span className="text-xs font-medium text-gray-700 flex-1 truncate">
                      {SECTION_LABELS[s.type] ?? s.type}
                    </span>

                    {/* Toggle visibility */}
                    <button
                      onClick={() => updateSection(s.id, { enabled: !s.enabled })}
                      className={`p-1 rounded-lg transition-colors ${s.enabled ? 'text-emerald-500 hover:bg-emerald-50' : 'text-gray-300 hover:bg-gray-100'}`}
                      title={s.enabled ? 'Sembunyikan' : 'Tampilkan'}
                    >
                      {s.enabled ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>

                    {/* Expand/collapse toggle */}
                    <button
                      onClick={() => setExpandedSectionId(expandedSectionId === s.id ? null : s.id)}
                      className={`p-1 rounded-lg transition-colors ${expandedSectionId === s.id ? 'bg-indigo-100 text-indigo-600' : 'text-gray-300 hover:text-gray-600'}`}
                      title={expandedSectionId === s.id ? 'Minimize' : 'Expand controls'}
                    >
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expandedSectionId === s.id ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Delete */}
                    {s.type !== 'hero' && (
                      <button onClick={() => removeSection(s.id)}
                        className="p-1 text-gray-200 hover:text-red-400 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Advanced controls — hanya tampil saat di-expand */}
                  {s.enabled && expandedSectionId === s.id && (
                    <div className="bg-white border-t border-gray-50 divide-y divide-gray-50">

                      {/* Style variant selector — visual thumbnails */}
                      {SECTION_VARIANTS[s.type] && (
                        <div className="px-3 py-2.5">
                          <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-2">
                            Gaya Tampilan
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {SECTION_VARIANTS[s.type].map(v => {
                              const active = (s.style_variant ?? 'default') === v.value
                              return (
                                <button key={v.value}
                                  onClick={() => updateSection(s.id, { style_variant: v.value })}
                                  className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl border-2 transition-all ${
                                    active ? 'border-indigo-500' : 'border-transparent hover:border-gray-300'
                                  }`}
                                  title={v.desc}
                                >
                                  <div className={`overflow-hidden rounded-md ${active ? 'ring-2 ring-indigo-300' : ''}`}>
                                    <VariantThumb
                                      type={s.type}
                                      variant={v.value}
                                      p={cfg.meta.color_scheme.primary}
                                      a={cfg.meta.color_scheme.accent}
                                      t={cfg.meta.color_scheme.text}
                                    />
                                  </div>
                                  <p className={`text-[9px] font-semibold ${active ? 'text-indigo-700' : 'text-gray-500'}`}>
                                    {v.label}
                                  </p>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      {/* Animasi masuk / keluar */}
                      <div className="px-3 py-2 flex gap-2">
                        <div className="flex-1">
                          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Animasi Masuk</p>
                          <div className="flex gap-1">
                            <select value={s.transition_in} onChange={e => updateSection(s.id, { transition_in: e.target.value })}
                              className="flex-1 text-xs border border-gray-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400">
                              {TRANSITION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <button
                              onClick={() => {
                                setPreviewMode('invitation')
                                setSectionReplay(p => ({ id: s.id, key: (p?.id === s.id ? p.key + 1 : 0) }))
                              }}
                              className="px-1.5 py-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                              title="Preview di mockup — scroll ke section ini"
                            >
                              <Play className="w-2.5 h-2.5 fill-current" />
                            </button>
                          </div>
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Animasi Keluar</p>
                          <select value={s.transition_out} onChange={e => updateSection(s.id, { transition_out: e.target.value })}
                            className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400">
                            {TRANSITION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </div>
                      {/* Label hint saat section di-preview */}
                      {sectionReplay?.id === s.id && (
                        <div className="px-3 pb-2">
                          <p className="text-[9px] text-emerald-600 font-medium">
                            ↑ Scroll di preview untuk lihat animasi section ini
                          </p>
                        </div>
                      )}

                      {/* Layout & Padding */}
                      <div className="px-3 py-2 flex gap-2">
                        <div className="flex-1">
                          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Padding</p>
                          <select value={s.padding_y ?? 'normal'} onChange={e => updateSection(s.id, { padding_y: e.target.value as 'compact' | 'normal' | 'spacious' })}
                            className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400">
                            <option value="compact">Compact</option>
                            <option value="normal">Normal</option>
                            <option value="spacious">Spacious</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Alignment</p>
                          <select value={s.text_align ?? 'center'} onChange={e => updateSection(s.id, { text_align: e.target.value as 'center' | 'left' | 'right' })}
                            className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400">
                            <option value="center">Center</option>
                            <option value="left">Left</option>
                            <option value="right">Right</option>
                          </select>
                        </div>
                      </div>

                      {/* Layout konten */}
                      <div className="px-3 py-2">
                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Layout Konten</p>
                        <div className="flex gap-1.5 flex-wrap">
                          {([
                            ['default',     'Default'],
                            ['split-left',  'Split ←'],
                            ['split-right', 'Split →'],
                            ['full-bleed',  'Full Bleed'],
                          ] as [string, string][]).map(([val, lbl]) => (
                            <button key={val}
                              onClick={() => updateSection(s.id, { content_layout: val as 'default' | 'split-left' | 'split-right' | 'full-bleed' })}
                              className={`text-[10px] px-2.5 py-1 rounded-lg border transition-colors font-medium ${
                                (s.content_layout ?? 'default') === val
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'
                              }`}>
                              {lbl}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Background type */}
                      <div className="px-3 py-2 space-y-2">
                        <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Latar Belakang Section</p>
                        <div className="grid grid-cols-4 gap-1">
                          {([
                            ['color',    '🎨', 'Warna'],
                            ['gradient', '🌈', 'Gradient'],
                            ['image',    '🖼️',  'Foto'],
                            ['video',    '🎬', 'Video'],
                          ] as const).map(([t, icon, lbl]) => (
                            <button key={t} type="button"
                              onClick={() => updateSection(s.id, { background: { ...s.background, type: t } })}
                              className={`flex flex-col items-center gap-0.5 py-2 rounded-xl text-[9px] font-semibold transition-all border ${
                                s.background.type === t
                                  ? 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-gray-50 text-gray-500 border-gray-100 hover:border-indigo-200 hover:bg-indigo-50'
                              }`}>
                              <span className="text-base leading-none">{icon}</span>
                              {lbl}
                            </button>
                          ))}
                        </div>
                        {s.background.type === 'color' && (
                          <div className="flex items-center gap-2 mt-1">
                            <input type="color" value={s.background.value ?? '#000000'}
                              onChange={e => updateSection(s.id, { background: { ...s.background, value: e.target.value } })}
                              className="w-9 h-8 rounded cursor-pointer border border-gray-200 shrink-0" />
                            <input type="text" value={s.background.value ?? ''}
                              onChange={e => updateSection(s.id, { background: { ...s.background, value: e.target.value } })}
                              className="flex-1 text-xs border border-gray-100 rounded-lg px-2 py-1.5 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-400"
                              placeholder="#000000" />
                          </div>
                        )}
                      </div>

                      {s.background.type === 'gradient' && (() => {
                        // Parse existing gradient or use defaults
                        const raw = s.background.value ?? 'linear-gradient(135deg, #1a4a1a, #0f2d0f)'
                        const colorMatches = raw.match(/#[0-9a-fA-F]{3,6}/g) ?? ['#1a4a1a', '#0f2d0f']
                        const c1 = colorMatches[0] ?? '#1a4a1a'
                        const c2 = colorMatches[1] ?? '#0f2d0f'
                        const dirs = [
                          { label: '↓',  val: 'to bottom' },
                          { label: '↘',  val: '135deg' },
                          { label: '→',  val: 'to right' },
                          { label: '↗',  val: '45deg' },
                        ]
                        const currentDir = dirs.find(d => raw.includes(d.val))?.val ?? '135deg'
                        const buildGrad = (dir: string, a: string, b: string) =>
                          `linear-gradient(${dir}, ${a}, ${b})`
                        return (
                          <div className="px-3 py-2 space-y-2">
                            <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Gradient</p>
                            {/* Preview */}
                            <div className="h-8 rounded-lg w-full" style={{ background: s.background.value ?? raw }} />
                            {/* Colors */}
                            <div className="flex gap-2 items-center">
                              <div className="flex-1">
                                <p className="text-[8px] text-gray-400 mb-0.5">Warna 1</p>
                                <div className="flex gap-1 items-center">
                                  <input type="color" value={c1}
                                    onChange={e => updateSection(s.id, { background: { ...s.background, value: buildGrad(currentDir, e.target.value, c2) } })}
                                    className="w-8 h-7 rounded cursor-pointer border border-gray-200" />
                                  <input type="text" value={c1} readOnly className="flex-1 text-[10px] border border-gray-100 rounded px-1.5 py-1 font-mono bg-gray-50" />
                                </div>
                              </div>
                              <div className="flex-1">
                                <p className="text-[8px] text-gray-400 mb-0.5">Warna 2</p>
                                <div className="flex gap-1 items-center">
                                  <input type="color" value={c2}
                                    onChange={e => updateSection(s.id, { background: { ...s.background, value: buildGrad(currentDir, c1, e.target.value) } })}
                                    className="w-8 h-7 rounded cursor-pointer border border-gray-200" />
                                  <input type="text" value={c2} readOnly className="flex-1 text-[10px] border border-gray-100 rounded px-1.5 py-1 font-mono bg-gray-50" />
                                </div>
                              </div>
                            </div>
                            {/* Direction */}
                            <div>
                              <p className="text-[8px] text-gray-400 mb-1">Arah</p>
                              <div className="flex gap-1">
                                {dirs.map(d => (
                                  <button key={d.val} type="button"
                                    onClick={() => updateSection(s.id, { background: { ...s.background, value: buildGrad(d.val, c1, c2) } })}
                                    className={`flex-1 py-1 rounded text-xs font-bold transition-colors ${currentDir === d.val ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                    {d.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )
                      })()}

                      {s.background.type === 'image' && (
                        <div className="px-3 py-2 space-y-2">
                          <ImageUploadField
                            value={s.background.url}
                            onChange={url => updateSection(s.id, { background: { ...s.background, url } })}
                            hint="Foto akan menutupi seluruh section sebagai latar belakang"
                          />
                          <div className="flex items-center gap-2 pt-1">
                            <p className="text-[9px] text-gray-500 shrink-0 font-medium">Gelap overlay</p>
                            <input type="range" min={0} max={0.9} step={0.05}
                              value={s.background.overlay_opacity ?? 0}
                              onChange={e => updateSection(s.id, { background: { ...s.background, overlay_opacity: Number(e.target.value) } })}
                              className="flex-1 accent-indigo-600 h-1.5 rounded-full" />
                            <span className="text-[9px] font-mono text-gray-500 w-8 text-right shrink-0">
                              {Math.round((s.background.overlay_opacity ?? 0) * 100)}%
                            </span>
                          </div>
                        </div>
                      )}

                      {s.background.type === 'video' && (
                        <div className="px-3 py-2 space-y-2">
                          <VideoUploadField
                            value={s.background.url}
                            onChange={url => updateSection(s.id, { background: { ...s.background, url } })}
                            hint="Video akan loop otomatis tanpa suara sebagai latar belakang section"
                          />
                          <div className="flex items-center gap-2 pt-1">
                            <p className="text-[9px] text-gray-500 shrink-0 font-medium">Gelap overlay</p>
                            <input type="range" min={0} max={0.9} step={0.05}
                              value={s.background.overlay_opacity ?? 0}
                              onChange={e => updateSection(s.id, { background: { ...s.background, overlay_opacity: Number(e.target.value) } })}
                              className="flex-1 accent-indigo-600 h-1.5 rounded-full" />
                            <span className="text-[9px] font-mono text-gray-500 w-8 text-right shrink-0">
                              {Math.round((s.background.overlay_opacity ?? 0) * 100)}%
                            </span>
                          </div>
                          <p className="text-[9px] text-amber-500 bg-amber-50 px-2 py-1.5 rounded-lg">
                            Tips: gunakan video pendek (5–15 detik) agar loading cepat di HP tamu
                          </p>
                        </div>
                      )}

                      {/* ── Konten Section ── */}
                      <div className="px-3 pb-3 border-t border-violet-50 bg-violet-50/30">
                        <p className="text-[9px] font-bold text-violet-600 uppercase tracking-widest mt-2.5 mb-3">
                          Konten & Foto
                        </p>

                        {/* HERO — editor lengkap */}
                        {s.type === 'hero' && (
                          <div className="space-y-3">

                            {/* Konten */}
                            <div className="space-y-1.5">
                              <p className="text-[8px] font-bold text-violet-500 uppercase tracking-widest">Konten</p>
                              <SectionField label="Nama Pria">
                                <input className={miniInput} value={previewData.groom_name} onChange={e => setPreviewData(d => ({ ...d, groom_name: e.target.value }))} />
                              </SectionField>
                              <SectionField label="Nama Wanita">
                                <input className={miniInput} value={previewData.bride_name} onChange={e => setPreviewData(d => ({ ...d, bride_name: e.target.value }))} />
                              </SectionField>
                              <SectionField label="Tagline / Ayat">
                                <textarea className={miniInput + ' resize-none'} rows={2} value={previewData.tagline ?? ''} onChange={e => setPreviewData(d => ({ ...d, tagline: e.target.value }))} />
                              </SectionField>
                              <SectionField label="Foto Background">
                                <ImageUploadField value={previewData.couple_photo_url} onChange={url => setPreviewData(d => ({ ...d, couple_photo_url: url }))} />
                              </SectionField>
                            </div>

                            {/* Bismillah */}
                            <div className="border-t border-violet-50 pt-2.5 space-y-1.5">
                              <p className="text-[8px] font-bold text-violet-500 uppercase tracking-widest">Bismillah</p>
                              <div className="flex gap-1">
                                {([['none','Tanpa'],['text','Teks'],['arabic','Arab']] as const).map(([v,lbl]) => (
                                  <button key={v} type="button"
                                    onClick={() => updateSection(s.id, { hero_bismillah: v })}
                                    className={`flex-1 py-1 rounded text-[9px] font-semibold transition-colors ${(s.hero_bismillah ?? 'text') === v ? 'bg-violet-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-violet-100'}`}>
                                    {lbl}
                                  </button>
                                ))}
                              </div>
                              {(s.hero_bismillah === 'text' || !s.hero_bismillah) && (
                                <SectionField label="Teks Kustom (kosong = default)">
                                  <input className={miniInput} value={s.hero_bismillah_custom ?? ''} placeholder="Bismillahirrahmanirrahim"
                                    onChange={e => updateSection(s.id, { hero_bismillah_custom: e.target.value || undefined })} />
                                </SectionField>
                              )}
                              {s.hero_bismillah === 'arabic' && (
                                <p className="text-[8px] text-gray-400 italic">بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ + transliterasi</p>
                              )}
                            </div>

                            {/* Tipografi ukuran px */}
                            <div className="border-t border-violet-50 pt-2.5 space-y-1.5">
                              <p className="text-[8px] font-bold text-violet-500 uppercase tracking-widest">Ukuran Font (px)</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                {([
                                  ['Nama', 'hero_title_size', 36],
                                  ['Simbol &', 'hero_and_size', 22],
                                  ['Tagline', 'hero_tagline_size', 11],
                                  ['Label kecil', 'hero_label_size', 9],
                                ] as const).map(([lbl, key, def]) => (
                                  <div key={key}>
                                    <p className="text-[8px] text-gray-400 mb-0.5">{lbl} <span className="text-gray-300">({def}px)</span></p>
                                    <input type="number" min={6} max={120} step={1}
                                      className={miniInput}
                                      value={s[key] ?? def}
                                      onChange={e => updateSection(s.id, { [key]: Number(e.target.value) })} />
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Animasi */}
                            <div className="border-t border-violet-50 pt-2.5 space-y-1.5">
                              <p className="text-[8px] font-bold text-violet-500 uppercase tracking-widest">Animasi</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                <div>
                                  <div className="flex justify-between">
                                    <p className="text-[8px] text-gray-400">Durasi (dtk)</p>
                                    <span className="text-[8px] font-mono text-gray-500">{(s.hero_anim_duration ?? 0.8).toFixed(1)}</span>
                                  </div>
                                  <input type="range" min={0.2} max={2.0} step={0.1}
                                    value={s.hero_anim_duration ?? 0.8}
                                    onChange={e => updateSection(s.id, { hero_anim_duration: Number(e.target.value) })}
                                    className="w-full h-1 accent-violet-500" />
                                </div>
                                <div>
                                  <div className="flex justify-between">
                                    <p className="text-[8px] text-gray-400">Jeda (stagger)</p>
                                    <span className="text-[8px] font-mono text-gray-500">{(s.hero_anim_stagger ?? 0.15).toFixed(2)}</span>
                                  </div>
                                  <input type="range" min={0} max={0.5} step={0.05}
                                    value={s.hero_anim_stagger ?? 0.15}
                                    onChange={e => updateSection(s.id, { hero_anim_stagger: Number(e.target.value) })}
                                    className="w-full h-1 accent-violet-500" />
                                </div>
                              </div>
                            </div>

                            {/* Layout & padding */}
                            <div className="border-t border-violet-50 pt-2.5 space-y-1.5">
                              <p className="text-[8px] font-bold text-violet-500 uppercase tracking-widest">Layout</p>
                              <div className="grid grid-cols-2 gap-1.5">
                                <div>
                                  <p className="text-[8px] text-gray-400 mb-0.5">Padding Atas (px)</p>
                                  <input type="number" min={0} max={200} step={4}
                                    className={miniInput} value={s.hero_padding_top ?? 0}
                                    onChange={e => updateSection(s.id, { hero_padding_top: Number(e.target.value) })} />
                                </div>
                                <div>
                                  <p className="text-[8px] text-gray-400 mb-0.5">Padding Bawah (px)</p>
                                  <input type="number" min={0} max={200} step={4}
                                    className={miniInput} value={s.hero_padding_bottom ?? 0}
                                    onChange={e => updateSection(s.id, { hero_padding_bottom: Number(e.target.value) })} />
                                </div>
                                <div>
                                  <div className="flex justify-between">
                                    <p className="text-[8px] text-gray-400">Overlay background</p>
                                    <span className="text-[8px] font-mono text-gray-500">{Math.round((s.hero_overlay ?? 0.52) * 100)}%</span>
                                  </div>
                                  <input type="range" min={0} max={0.95} step={0.05}
                                    value={s.hero_overlay ?? 0.52}
                                    onChange={e => updateSection(s.id, { hero_overlay: Number(e.target.value) })}
                                    className="w-full h-1 accent-violet-500" />
                                </div>
                                <div className="flex items-center gap-2 pt-3">
                                  <input type="checkbox" id={`scroll-${s.id}`}
                                    checked={s.hero_show_scroll !== false}
                                    onChange={e => updateSection(s.id, { hero_show_scroll: e.target.checked })}
                                    className="accent-violet-500 w-3 h-3" />
                                  <label htmlFor={`scroll-${s.id}`} className="text-[9px] text-gray-500 cursor-pointer">Indikator scroll</label>
                                </div>
                                <div className="flex items-center gap-2">
                                  <input type="checkbox" id={`shadow-${s.id}`}
                                    checked={s.hero_text_shadow !== false}
                                    onChange={e => updateSection(s.id, { hero_text_shadow: e.target.checked })}
                                    className="accent-violet-500 w-3 h-3" />
                                  <label htmlFor={`shadow-${s.id}`} className="text-[9px] text-gray-500 cursor-pointer">Bayangan teks</label>
                                </div>
                              </div>
                            </div>

                          </div>
                        )}

                        {/* PROFILES */}
                        {s.type === 'profiles' && (
                          <div className="space-y-2">
                            <p className="text-[9px] font-semibold text-gray-500 mt-1">Pengantin Pria</p>
                            <SectionField label="Nama"><input className={miniInput} value={previewData.groom_name} onChange={e => setPreviewData(d => ({ ...d, groom_name: e.target.value }))} /></SectionField>
                            <SectionField label="Orang Tua"><input className={miniInput} value={previewData.groom_parents ?? ''} onChange={e => setPreviewData(d => ({ ...d, groom_parents: e.target.value }))} /></SectionField>
                            <SectionField label="Bio"><input className={miniInput} value={previewData.groom_bio ?? ''} onChange={e => setPreviewData(d => ({ ...d, groom_bio: e.target.value }))} /></SectionField>
                            <SectionField label="Foto"><ImageUploadField value={previewData.groom_photo_url} onChange={url => setPreviewData(d => ({ ...d, groom_photo_url: url }))} /></SectionField>
                            <p className="text-[9px] font-semibold text-gray-500 mt-2">Pengantin Wanita</p>
                            <SectionField label="Nama"><input className={miniInput} value={previewData.bride_name} onChange={e => setPreviewData(d => ({ ...d, bride_name: e.target.value }))} /></SectionField>
                            <SectionField label="Orang Tua"><input className={miniInput} value={previewData.bride_parents ?? ''} onChange={e => setPreviewData(d => ({ ...d, bride_parents: e.target.value }))} /></SectionField>
                            <SectionField label="Bio"><input className={miniInput} value={previewData.bride_bio ?? ''} onChange={e => setPreviewData(d => ({ ...d, bride_bio: e.target.value }))} /></SectionField>
                            <SectionField label="Foto"><ImageUploadField value={previewData.bride_photo_url} onChange={url => setPreviewData(d => ({ ...d, bride_photo_url: url }))} /></SectionField>
                          </div>
                        )}

                        {/* STORY */}
                        {s.type === 'story' && (
                          <div className="space-y-2">
                            <SectionField label="Judul Kisah"><input className={miniInput} value={previewData.story_title ?? ''} onChange={e => setPreviewData(d => ({ ...d, story_title: e.target.value }))} /></SectionField>
                            <SectionField label="Teks Kisah"><textarea className={miniInput + ' resize-none'} rows={3} value={previewData.story_text ?? ''} onChange={e => setPreviewData(d => ({ ...d, story_text: e.target.value }))} /></SectionField>
                            <SectionField label="Foto"><ImageUploadField value={previewData.couple_photo_url} onChange={url => setPreviewData(d => ({ ...d, couple_photo_url: url }))} /></SectionField>
                          </div>
                        )}

                        {/* EVENTS */}
                        {s.type === 'events' && (
                          <div className="space-y-4">

                            {/* ── Akad Nikah ── */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 pb-1 border-b border-violet-100">
                                <div className="w-2 h-2 rounded-full bg-violet-500" />
                                <p className="text-[9px] font-bold text-violet-600 uppercase tracking-widest">Akad Nikah</p>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                <SectionField label="Tanggal">
                                  <input type="date" className={miniInput} value={previewData.akad?.date ?? ''}
                                    onChange={e => setPreviewData(d => ({ ...d, akad: { ...d.akad!, date: e.target.value } }))} />
                                </SectionField>
                                <SectionField label="Jam">
                                  <input type="time" className={miniInput} value={previewData.akad?.time ?? ''}
                                    onChange={e => setPreviewData(d => ({ ...d, akad: { ...d.akad!, time: e.target.value } }))} />
                                </SectionField>
                              </div>
                              <SectionField label="Nama Tempat">
                                <input className={miniInput} placeholder="Masjid Al-Ikhlas"
                                  value={previewData.akad?.venue_name ?? ''}
                                  onChange={e => setPreviewData(d => ({ ...d, akad: { ...d.akad!, venue_name: e.target.value } }))} />
                              </SectionField>
                              <SectionField label="Alamat">
                                <textarea className={miniInput + ' resize-none'} rows={2} placeholder="Jl. Mawar No. 12..."
                                  value={previewData.akad?.venue_address ?? ''}
                                  onChange={e => setPreviewData(d => ({ ...d, akad: { ...d.akad!, venue_address: e.target.value } }))} />
                              </SectionField>
                              <SectionField label="Google Maps URL">
                                <input className={miniInput} placeholder="https://maps.app.goo.gl/..."
                                  value={previewData.akad?.maps_url ?? ''}
                                  onChange={e => setPreviewData(d => ({ ...d, akad: { ...d.akad!, maps_url: e.target.value || undefined } }))} />
                              </SectionField>
                              <SectionField label="Foto Lokasi">
                                <ImageUploadField
                                  value={previewData.akad?.venue_photo_url}
                                  onChange={url => setPreviewData(d => ({ ...d, akad: { ...d.akad!, venue_photo_url: url } }))}
                                  hint="Foto masjid/gedung untuk variant Foto"
                                />
                              </SectionField>
                            </div>

                            {/* ── Resepsi ── */}
                            <div className="space-y-2">
                              <div className="flex items-center gap-2 pb-1 border-b border-emerald-100">
                                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">Resepsi</p>
                              </div>
                              <div className="grid grid-cols-2 gap-1.5">
                                <SectionField label="Tanggal">
                                  <input type="date" className={miniInput} value={previewData.resepsi?.date ?? ''}
                                    onChange={e => setPreviewData(d => ({ ...d, resepsi: { ...d.resepsi!, date: e.target.value } }))} />
                                </SectionField>
                                <SectionField label="Jam">
                                  <input type="time" className={miniInput} value={previewData.resepsi?.time ?? ''}
                                    onChange={e => setPreviewData(d => ({ ...d, resepsi: { ...d.resepsi!, time: e.target.value } }))} />
                                </SectionField>
                              </div>
                              <SectionField label="Nama Tempat">
                                <input className={miniInput} placeholder="Ballroom Grand Hotel"
                                  value={previewData.resepsi?.venue_name ?? ''}
                                  onChange={e => setPreviewData(d => ({ ...d, resepsi: { ...d.resepsi!, venue_name: e.target.value } }))} />
                              </SectionField>
                              <SectionField label="Alamat">
                                <textarea className={miniInput + ' resize-none'} rows={2} placeholder="Jl. Sudirman No. 86..."
                                  value={previewData.resepsi?.venue_address ?? ''}
                                  onChange={e => setPreviewData(d => ({ ...d, resepsi: { ...d.resepsi!, venue_address: e.target.value } }))} />
                              </SectionField>
                              <SectionField label="Google Maps URL">
                                <input className={miniInput} placeholder="https://maps.app.goo.gl/..."
                                  value={previewData.resepsi?.maps_url ?? ''}
                                  onChange={e => setPreviewData(d => ({ ...d, resepsi: { ...d.resepsi!, maps_url: e.target.value || undefined } }))} />
                              </SectionField>
                              <SectionField label="Foto Lokasi">
                                <ImageUploadField
                                  value={previewData.resepsi?.venue_photo_url}
                                  onChange={url => setPreviewData(d => ({ ...d, resepsi: { ...d.resepsi!, venue_photo_url: url } }))}
                                  hint="Foto ballroom/gedung untuk variant Foto"
                                />
                              </SectionField>
                            </div>

                          </div>
                        )}

                        {/* COUNTDOWN */}
                        {s.type === 'countdown' && (
                          <div className="space-y-2">
                            <SectionField label="Tanggal Akad"><input type="date" className={miniInput} value={previewData.akad?.date ?? ''} onChange={e => setPreviewData(d => ({ ...d, akad: { ...d.akad!, date: e.target.value } }))} /></SectionField>
                            <SectionField label="Jam"><input className={miniInput} placeholder="08:00" value={previewData.akad?.time ?? ''} onChange={e => setPreviewData(d => ({ ...d, akad: { ...d.akad!, time: e.target.value } }))} /></SectionField>
                          </div>
                        )}

                        {/* CLOSING */}
                        {s.type === 'closing' && (
                          <div className="space-y-2">
                            <SectionField label="Teks Penutup"><textarea className={miniInput + ' resize-none'} rows={3} value={previewData.closing_text ?? ''} onChange={e => setPreviewData(d => ({ ...d, closing_text: e.target.value }))} /></SectionField>
                            <SectionField label="Ucapan Terima Kasih"><input className={miniInput} value={previewData.thank_you_message ?? ''} onChange={e => setPreviewData(d => ({ ...d, thank_you_message: e.target.value }))} /></SectionField>
                          </div>
                        )}

                        {/* GIFT — amplop digital settings */}
                        {s.type === 'gift' && (() => {
                          const activeSet = new Set(
                            (previewData.gift_accounts ?? []).map(a => a.type === 'bank' ? a.bank : a.platform)
                          )
                          function toggleProvider(name: string) {
                            const b = GIFT_LAB_BRANDS[name]; if (!b) return
                            const cur = previewData.gift_accounts ?? []
                            if (activeSet.has(name)) {
                              setPreviewData(d => ({ ...d, gift_accounts: cur.filter(a => (a.type === 'bank' ? a.bank : a.platform) !== name) }))
                            } else {
                              setPreviewData(d => ({ ...d, gift_accounts: [...cur, makeGiftAccount(name, b)] }))
                            }
                          }
                          return (
                            <div className="space-y-3">

                              {/* ── Provider preview picker ── */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <p className="text-[8px] font-bold text-violet-500 uppercase tracking-widest">Preview Provider</p>
                                  <div className="flex gap-1.5">
                                    <button type="button"
                                      onClick={() => setPreviewData(d => ({ ...d, gift_accounts: Object.entries(GIFT_LAB_BRANDS).map(([n, b]) => makeGiftAccount(n, b)) }))}
                                      className="text-[7px] font-bold text-violet-500 hover:text-violet-700 transition-colors">
                                      Semua
                                    </button>
                                    <span className="text-[7px] text-gray-300">·</span>
                                    <button type="button"
                                      onClick={() => setPreviewData(d => ({ ...d, gift_accounts: [] }))}
                                      className="text-[7px] font-bold text-gray-400 hover:text-red-400 transition-colors">
                                      Reset
                                    </button>
                                  </div>
                                </div>

                                {/* Mini card grid — 5 per row */}
                                <div className="grid grid-cols-5 gap-1.5">
                                  {Object.entries(GIFT_LAB_BRANDS).map(([name, b]) => {
                                    const active = activeSet.has(name)
                                    return (
                                      <button key={name} type="button" onClick={() => toggleProvider(name)}
                                        title={name}
                                        className="relative overflow-hidden rounded-lg transition-all"
                                        style={{
                                          background: `linear-gradient(135deg, ${b.g[0]}, ${b.g[1]})`,
                                          aspectRatio: '1 / 1',
                                          boxShadow: active ? `0 0 0 2px white, 0 0 0 3.5px ${b.g[0]}` : `0 1px 4px ${b.g[0]}44`,
                                          opacity: active ? 1 : 0.45,
                                          transform: active ? 'scale(1)' : 'scale(0.93)',
                                          transition: 'all 0.15s ease',
                                        }}>
                                        <div className="absolute inset-0 flex items-center justify-center p-1">
                                          <img src={b.logo} alt={name}
                                            style={{ height: 13, width: 'auto', maxWidth: '90%', objectFit: 'contain', filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.35))' }} />
                                        </div>
                                        {active && (
                                          <div className="absolute top-0.5 right-0.5 w-3 h-3 rounded-full bg-white flex items-center justify-center">
                                            <svg width="6" height="6" viewBox="0 0 10 10" fill="none">
                                              <path d="M2 5l2.5 2.5L8 2.5" stroke={b.g[0]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                          </div>
                                        )}
                                      </button>
                                    )
                                  })}
                                </div>
                                <p className="text-[7px] text-gray-400">Klik provider untuk tampilkan / sembunyi di preview</p>
                              </div>

                              {/* ── Toggles ── */}
                              {([
                                ['gift_show_logo',    'Logo Brand',           'Tampilkan logo pada kartu'],
                                ['gift_proof_enabled','Upload Bukti Transfer', 'Tombol & form kirim bukti'],
                              ] as const).map(([key, label, desc]) => (
                                <div key={key} className="flex items-center justify-between border-t border-violet-50 pt-2.5">
                                  <div>
                                    <p className="text-[9px] font-semibold text-gray-600">{label}</p>
                                    <p className="text-[7px] text-gray-400">{desc}</p>
                                  </div>
                                  <button type="button"
                                    onClick={() => updateSection(s.id, { [key]: !(s[key] ?? true) })}
                                    style={{ color: (s[key] ?? true) ? '#7c3aed' : '#d1d5db' }}>
                                    {(s[key] ?? true)
                                      ? <svg xmlns="http://www.w3.org/2000/svg" width="28" height="16" viewBox="0 0 28 16" fill="currentColor"><rect width="28" height="16" rx="8"/><circle cx="20" cy="8" r="6" fill="white"/></svg>
                                      : <svg xmlns="http://www.w3.org/2000/svg" width="28" height="16" viewBox="0 0 28 16" fill="currentColor"><rect width="28" height="16" rx="8" fill="#e5e7eb"/><circle cx="8" cy="8" r="6" fill="white"/></svg>
                                    }
                                  </button>
                                </div>
                              ))}

                              {/* ── Thank you text ── */}
                              {(s.gift_proof_enabled ?? true) && (
                                <div className="border-t border-violet-50 pt-2.5 space-y-1">
                                  <p className="text-[8px] font-bold text-violet-500 uppercase tracking-widest">Pesan Terima Kasih</p>
                                  <textarea
                                    value={s.gift_thankyou_text ?? ''}
                                    onChange={e => updateSection(s.id, { gift_thankyou_text: e.target.value || undefined })}
                                    className="w-full text-[10px] border border-gray-100 rounded-lg px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-violet-400 text-gray-600"
                                    rows={4}
                                    placeholder="Terima kasih telah memberikan hadiah... (kosong = pesan default)"
                                  />
                                </div>
                              )}

                            </div>
                          )
                        })()}

                        {/* HERO/PROFILES/STORY: no extra content beyond above */}
                        {!['hero','profiles','story','events','countdown','closing','gift'].includes(s.type) && (
                          <p className="text-[9px] text-gray-400 italic">Konten section ini diisi oleh user saat membuat undangan.</p>
                        )}
                      </div>

                      {/* ── Font Override per Section ── */}
                      <div className="px-3 pb-3 border-t border-orange-50 bg-orange-50/30 space-y-2.5">
                        <p className="text-[9px] font-bold text-orange-500 uppercase tracking-widest mt-2.5">
                          Tipografi Section Ini
                        </p>

                        {/* Font family */}
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <p className="text-[9px] text-gray-500 mb-1">Font Judul</p>
                            <select
                              value={s.font_heading ?? ''}
                              onChange={e => updateSection(s.id, { font_heading: e.target.value || undefined })}
                              className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            >
                              <option value="">Global ({cfg.meta.font.heading})</option>
                              {HEADING_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>
                          <div className="flex-1">
                            <p className="text-[9px] text-gray-500 mb-1">Font Teks</p>
                            <select
                              value={s.font_body ?? ''}
                              onChange={e => updateSection(s.id, { font_body: e.target.value || undefined })}
                              className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            >
                              <option value="">Global ({cfg.meta.font.body})</option>
                              {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                            </select>
                          </div>
                        </div>

                        {/* Font weight */}
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <p className="text-[9px] text-gray-500 mb-1">Ketebalan Judul</p>
                            <select
                              value={s.heading_weight ?? ''}
                              onChange={e => updateSection(s.id, { heading_weight: e.target.value ? Number(e.target.value) : undefined })}
                              className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            >
                              <option value="">Default (700)</option>
                              {[300,400,500,600,700,800,900].map(w => (
                                <option key={w} value={w}>{w} — {w<=300?'Tipis':w<=400?'Normal':w<=500?'Medium':w<=600?'Semi Bold':w<=700?'Bold':w<=800?'Extra Bold':'Black'}</option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <p className="text-[9px] text-gray-500 mb-1">Ketebalan Teks</p>
                            <select
                              value={s.body_weight ?? ''}
                              onChange={e => updateSection(s.id, { body_weight: e.target.value ? Number(e.target.value) : undefined })}
                              className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            >
                              <option value="">Default (400)</option>
                              {[300,400,500,600,700].map(w => (
                                <option key={w} value={w}>{w} — {w<=300?'Tipis':w<=400?'Normal':w<=500?'Medium':w<=600?'Semi Bold':'Bold'}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        {/* Font size: heading + body terpisah */}
                        <div className="space-y-2">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[9px] text-gray-500">Ukuran Judul</p>
                              <span className="text-[9px] font-mono text-gray-500">{Math.round((s.heading_scale ?? 1) * 100)}%</span>
                            </div>
                            <input type="range" min={0.6} max={1.8} step={0.05}
                              value={s.heading_scale ?? 1}
                              onChange={e => updateSection(s.id, { heading_scale: Number(e.target.value) === 1 ? undefined : Number(e.target.value) })}
                              className="w-full accent-orange-500 h-1" />
                            <div className="flex justify-between text-[8px] text-gray-300 mt-0.5">
                              <span>60%</span><span>Judul</span><span>180%</span>
                            </div>
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-[9px] text-gray-500">Ukuran Teks Isi</p>
                              <span className="text-[9px] font-mono text-gray-500">{Math.round((s.body_scale ?? 1) * 100)}%</span>
                            </div>
                            <input type="range" min={0.6} max={1.5} step={0.05}
                              value={s.body_scale ?? 1}
                              onChange={e => updateSection(s.id, { body_scale: Number(e.target.value) === 1 ? undefined : Number(e.target.value) })}
                              className="w-full accent-blue-400 h-1" />
                            <div className="flex justify-between text-[8px] text-gray-300 mt-0.5">
                              <span>60%</span><span>Teks</span><span>150%</span>
                            </div>
                          </div>
                        </div>

                        {(s.font_heading || s.font_body || s.heading_weight || s.body_weight || s.heading_scale || s.body_scale) && (
                          <button onClick={() => updateSection(s.id, {
                            font_heading: undefined, font_body: undefined,
                            heading_weight: undefined, body_weight: undefined,
                            heading_scale: undefined, body_scale: undefined,
                          })} className="text-[9px] text-orange-500 hover:underline">
                            Reset semua tipografi ke default
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Add section */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">Tambah section baru</p>
                <div className="flex flex-wrap gap-1.5">
                  {SECTION_TYPES.filter(t => !sections.find(s => s.type === t)).map(t => (
                    <button
                      key={t}
                      onClick={() => addSection(t)}
                      className="flex items-center gap-1 text-[10px] font-medium bg-white border border-gray-200 hover:border-indigo-300 hover:text-indigo-600 text-gray-500 px-2.5 py-1 rounded-full transition-colors"
                    >
                      <Plus className="w-2.5 h-2.5" />
                      {SECTION_LABELS[t] ?? t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── JSON ── */}
          {activeTab === 'json' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Edit konfigurasi secara langsung. Tekan <strong>Terapkan</strong> untuk memperbarui preview.</p>
              <textarea
                value={jsonText}
                onChange={e => { setJsonText(e.target.value); setJsonError('') }}
                rows={22}
                className="w-full text-xs font-mono border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                spellCheck={false}
              />
              {jsonError && <p className="text-xs text-red-500">{jsonError}</p>}
              <button onClick={applyJson}
                className="w-full bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-xl hover:bg-indigo-700 transition-colors">
                Terapkan JSON
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 space-y-2 shrink-0">
          <div className="flex gap-2">
            <button
              onClick={saveLab}
              className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Simpan Eksperimen
            </button>
            <button
              onClick={resetToBase}
              className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-gray-800 hover:border-gray-300 transition-colors"
              title="Reset ke template dasar"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={openReleaseModal}
            className="w-full flex items-center justify-center gap-1.5 border border-dashed border-indigo-300 text-indigo-600 text-xs font-semibold py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            <Rocket className="w-3.5 h-3.5" /> Rilis ke Manajemen
          </button>

          {/* Success banner setelah rilis */}
          {releaseSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
              <span className="text-lg shrink-0">✅</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-800">
                  &ldquo;{releaseSuccess}&rdquo; berhasil dirilis!
                </p>
                <p className="text-[10px] text-emerald-600 mt-0.5">
                  Template sudah ada di Manajemen. Atur harga & aktifkan agar user bisa memilihnya.
                </p>
                <button
                  onClick={() => { onGoToManagement?.(); setReleaseSuccess(null) }}
                  className="mt-1.5 text-[10px] font-bold text-emerald-700 hover:underline"
                >
                  Buka Manajemen Template →
                </button>
              </div>
              <button onClick={() => setReleaseSuccess(null)} className="text-emerald-400 hover:text-emerald-700 shrink-0">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Preview ── */}
      <div className="flex-1 bg-slate-100 flex flex-col overflow-hidden">

        {/* Preview toolbar */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-gray-600">Live Preview</span>
          </div>
          <div className="flex items-center gap-2">
            {previewMode === 'invitation' && (
              <span className="text-xs text-gray-400">
                {sections.filter(s => s.enabled).length} sections
              </span>
            )}
            {/* Tombol Play — preview animasi opening di dalam mockup */}
            <button
              onClick={() => { setPreviewMode('cover'); setPreviewPlaying(true) }}
              className="flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg px-3 py-1.5 transition-colors"
              title="Preview animasi opening"
            >
              <Play className="w-3 h-3 fill-current" /> Play
            </button>
            <button
              onClick={() => setPreviewKey(k => k + 1)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3" /> Refresh
            </button>
            <a
              href="/demo/renderer"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Maximize2 className="w-3 h-3" /> Full Screen
            </a>
          </div>
        </div>

        {/*
          Phone preview — shell 360px, screen 340×736, zoom 340/390 ≈ 0.872
          Cover height: 736 / (340/390) = 845px
          Menggunakan visibility (bukan display:none) + position:absolute agar
          kedua preview selalu punya dimensi, tidak collapse saat tidak aktif.
        */}
        <div className="flex-1 overflow-y-auto flex items-start justify-center py-8 px-4">
          <div className="relative">
            <div className="relative bg-gray-950 rounded-[52px] shadow-2xl shadow-black/40 ring-1 ring-white/10"
              style={{ width: 360, padding: 10 }}>
              {/* Dynamic island */}
              <div className="absolute left-1/2 -translate-x-1/2 bg-gray-950 rounded-full z-20"
                style={{ top: 14, width: 82, height: 24 }} />

              {/* Screen */}
              <div className="rounded-[44px] overflow-hidden bg-gray-900"
                style={{ width: 340, height: 736, position: 'relative' }}>

                {/* ── Cover preview — position absolute, visibility toggle ── */}
                <div style={{
                  position: 'absolute', inset: 0, overflow: 'hidden',
                  visibility: previewMode === 'cover' && !previewPlaying ? 'visible' : 'hidden',
                  pointerEvents: previewMode === 'cover' && !previewPlaying ? 'auto' : 'none',
                }}>
                  <div style={{ width: 390, zoom: 340 / 390, height: 845 }}>
                    <CoverPagePreview
                      template={config}
                      data={previewData}
                      previewGuestName={previewGuestName}
                      containerHeight={845}
                      decorPreviewKey={decorPreviewKey}
                    />
                  </div>
                </div>

                {/* ── Invitation preview — scroll-snap, satu section = satu layar ── */}
                <div key={previewKey} style={{
                  position: 'absolute', inset: 0,
                  overflowY: 'scroll', overflowX: 'hidden', scrollbarWidth: 'none',
                  scrollSnapType: 'y mandatory',
                  visibility: previewMode === 'invitation' ? 'visible' : 'hidden',
                  pointerEvents: previewMode === 'invitation' ? 'auto' : 'none',
                }}>
                  <div style={{ width: 390, zoom: 340 / 390 }}>
                    <InvitationPreview
                      template={config}
                      data={previewData}
                      invitationId="lab-preview"
                      initialWishes={PREVIEW_WISHES}
                      isPreview
                      replaySectionId={sectionReplay?.id}
                      replaySectionKey={sectionReplay?.key}
                    />
                  </div>
                </div>

                {/* ── Loading screen preview (static mode) ── */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  visibility: previewMode === 'loading' && !previewPlaying && !previewLoading ? 'visible' : 'hidden',
                  pointerEvents: previewMode === 'loading' && !previewPlaying && !previewLoading ? 'auto' : 'none',
                  overflow: 'hidden',
                }}>
                  <div style={{ width: 390, zoom: 340 / 390, height: 845, position: 'relative' }}>
                    <LoadingScreen
                      config={cfg.loading}
                      onDone={() => {}}
                      isPreview={true}
                    />
                  </div>
                </div>

                {/* ── Loading screen (flow preview - when triggered) ── */}
                {previewLoading && (
                  <div style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 50,
                    overflow: 'hidden',
                    borderRadius: '2rem'
                  }}>
                    <div style={{ width: 390, zoom: 340 / 390, height: 845, position: 'relative' }}>
                      <LoadingScreen
                        config={cfg.loading}
                        onDone={() => {
                          setPreviewLoading(false)
                          setPreviewPlaying(false)
                        }}
                        isPreview={true}
                      />
                    </div>
                  </div>
                )}

                {/* ── Cover/Opening preview — click MASUK SEKARANG triggers loading ── */}
                {previewPlaying && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 30, overflow: 'hidden', borderRadius: '2rem' }}>
                    <div style={{ width: 390, zoom: 340 / 390, height: 845, position: 'relative' }}>
                      <AnimatePresence>
                        <OpeningScene
                          config={cfg.opening}
                          data={previewData}
                          meta={cfg.meta}
                          positionMode="absolute"
                          onOpen={() => {
                            // When clicking MASUK SEKARANG: hide cover, show loading
                            setPreviewPlaying(false)
                            setPreviewLoading(true)
                          }}
                        />
                      </AnimatePresence>
                    </div>
                    {/* Tombol tutup */}
                    <button
                      onClick={() => setPreviewPlaying(false)}
                      className="absolute top-3 right-3 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Mode Tabs */}
            <div className="mt-3 flex items-center gap-1.5 bg-white rounded-xl p-1.5 shadow-sm border border-gray-200">
              <button
                onClick={() => setPreviewMode('cover')}
                className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-semibold transition-all ${
                  previewMode === 'cover'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Cover
              </button>
              <button
                onClick={() => setPreviewMode('loading')}
                className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-semibold transition-all ${
                  previewMode === 'loading'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Loading
              </button>
              <button
                onClick={() => setPreviewMode('invitation')}
                className={`flex-1 px-3 py-2 rounded-lg text-[10px] font-semibold transition-all ${
                  previewMode === 'invitation'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Undangan
              </button>
            </div>

            <p className="text-center text-xs text-slate-400 mt-2 font-medium">
              {config.name}
            </p>
          </div>
        </div>
      </div>

      {/* ── Modal Rilis Template ── */}
      {showRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Rocket className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-gray-900 text-sm">Rilis Template</h3>
              </div>
              <button onClick={() => setShowRelease(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nama Template</label>
                <input
                  value={releaseForm.name}
                  onChange={e => setReleaseForm(f => ({
                    ...f,
                    name: e.target.value,
                    slug: e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
                  }))}
                  className={inputCls}
                  placeholder="Nama template yang akan tampil ke user"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Slug (ID unik)</label>
                <input
                  value={releaseForm.slug}
                  onChange={e => setReleaseForm(f => ({
                    ...f,
                    slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''),
                  }))}
                  className={inputCls + ' font-mono'}
                  placeholder="contoh: modern-floral-gold"
                />
                <p className="text-[10px] text-gray-400 mt-1">Huruf kecil dan strip saja. Ini akan menjadi ID template.</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Kategori</label>
                <select
                  value={releaseForm.category}
                  onChange={e => setReleaseForm(f => ({ ...f, category: e.target.value as typeof f.category }))}
                  className={inputCls}
                >
                  {[
                    ['modern',      'Modern'],
                    ['tradisional', 'Tradisional'],
                    ['minimalis',   'Minimalis'],
                    ['floral',      'Floral'],
                    ['rustic',      'Rustic'],
                  ].map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Deskripsi (opsional)</label>
                <textarea
                  value={releaseForm.description}
                  onChange={e => setReleaseForm(f => ({ ...f, description: e.target.value }))}
                  rows={2}
                  className={inputCls + ' resize-none text-sm'}
                  placeholder="Deskripsi singkat template..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Harga (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    step={1000}
                    value={releaseForm.price}
                    onChange={e => setReleaseForm(f => ({ ...f, price: Math.max(0, Number(e.target.value)) }))}
                    className={inputCls}
                    placeholder="0"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">0 = ikuti harga global</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">Akses Paket</label>
                  <select
                    value={releaseForm.required_package}
                    onChange={e => setReleaseForm(f => ({ ...f, required_package: e.target.value as typeof f.required_package }))}
                    className={inputCls}
                  >
                    <option value="all">Semua user</option>
                    <option value="starter">Starter ke atas</option>
                    <option value="premium">Premium ke atas</option>
                    <option value="ultimate">Ultimate saja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">URL Thumbnail (opsional)</label>
                <input
                  value={releaseForm.thumbnail_url}
                  onChange={e => setReleaseForm(f => ({ ...f, thumbnail_url: e.target.value }))}
                  className={inputCls}
                  placeholder="/templates/nama-slug/thumbnail.jpg"
                />
                <p className="text-[10px] text-gray-400 mt-1">Upload manual ke /public dulu, lalu isi path</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-2">Status Rilis</label>
                <div className="flex gap-3">
                  {(['draft', 'active'] as const).map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value={s}
                        checked={releaseForm.status === s}
                        onChange={() => setReleaseForm(f => ({ ...f, status: s }))}
                        className="accent-indigo-600"
                      />
                      <span className="text-xs font-medium text-gray-700 capitalize">
                        {s === 'draft' ? 'Draft (tidak tampil ke user)' : 'Aktif (langsung tampil)'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex gap-3">
              <button
                onClick={() => setShowRelease(false)}
                className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={submitRelease}
                disabled={releasing || !releaseForm.name || !releaseForm.slug}
                className="flex-1 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
              >
                <Rocket className="w-3.5 h-3.5" />
                {releasing ? 'Merilis...' : 'Rilis Template'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Decoration Layer List ─────────────────────────────────────

const IDLE_LABELS: Record<string, string> = {
  none: 'Tidak Ada', float: 'Melayang', pulse: 'Berdenyut', shimmer: 'Kilap',
  sway: 'Berayun', 'spin-slow': 'Berputar Lambat', heartbeat: 'Detak Jantung', 'drift-right': 'Geser Kanan-Kiri',
}
const ENTRY_LABELS: Record<string, string> = {
  none: 'Langsung', 'fade-in': 'Fade In', 'slide-left': 'Geser Kiri', 'slide-right': 'Geser Kanan',
  'slide-up': 'Naik', 'slide-down': 'Turun', 'zoom-in': 'Zoom In', 'rotate-in': 'Putar Masuk',
}
const POSITIONS_GRID = [
  ['top-left','↖'],['top-center','↑'],['top-right','↗'],
  ['center-left','←'],['center','○'],['center-right','→'],
  ['bottom-left','↙'],['bottom-center','↓'],['bottom-right','↘'],
] as [import('@/lib/types').AssetPosition, string][]

function updateAsset(
  assets: import('@/lib/types').DecorationAsset[],
  id: string,
  patch: Partial<import('@/lib/types').DecorationAsset>
) {
  return assets.map(a => a.id === id ? { ...a, ...patch } : a)
}

function DecorationLayerList({
  assets, onUpdate, onPreview,
}: {
  assets: import('@/lib/types').DecorationAsset[]
  onUpdate: (a: import('@/lib/types').DecorationAsset[]) => void
  onPreview: () => void
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const up = (id: string, patch: Partial<import('@/lib/types').DecorationAsset>) =>
    onUpdate(updateAsset(assets, id, patch))

  return (
    <div className="space-y-1.5">
      {/* Layer list header */}
      <div className="flex items-center gap-2 px-2 py-1 text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
        <span className="w-7" />
        <span className="flex-1">Nama</span>
        <span className="w-12 text-center">Posisi</span>
        <span className="w-12 text-center">Layer</span>
        <span className="w-14 text-center">Aksi</span>
      </div>

      {[...assets].sort((a, b) => (b.z_layer ?? 0) - (a.z_layer ?? 0)).map(asset => {
        const isExpanded = expandedId === asset.id
        return (
          <div key={asset.id} className={`rounded-xl overflow-hidden border transition-all ${isExpanded ? 'border-indigo-300 shadow-sm' : 'border-gray-200'}`}>
            {/* Layer row */}
            <div
              className={`flex items-center gap-2 px-2.5 py-2 cursor-pointer select-none ${isExpanded ? 'bg-indigo-50' : 'bg-white hover:bg-gray-50'}`}
              onClick={() => setExpandedId(isExpanded ? null : asset.id)}
            >
              <img src={asset.url} alt="" className="w-7 h-7 object-contain rounded border border-gray-200 bg-gray-50 shrink-0" />
              <span className="flex-1 text-xs font-medium text-gray-700 truncate min-w-0">{asset.label || 'Aset'}</span>
              <span className="w-12 text-center text-[9px] text-gray-400 font-mono shrink-0">{asset.position?.replace('-', '\n')}</span>
              <span className="w-7 text-center text-[9px] font-bold text-indigo-500 shrink-0">L{asset.z_layer ?? 0}</span>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={e => { e.stopPropagation(); onPreview() }}
                  className="p-1 text-emerald-600 hover:bg-emerald-100 rounded transition-colors" title="Preview animasi">
                  <Play className="w-2.5 h-2.5 fill-current" />
                </button>
                <button onClick={e => { e.stopPropagation(); onUpdate(assets.filter(a => a.id !== asset.id)) }}
                  className="p-1 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded transition-colors">
                  <Trash2 className="w-2.5 h-2.5" />
                </button>
                <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {/* Expanded controls */}
            {isExpanded && (
              <div className="px-3 pb-4 pt-3 space-y-3 bg-white border-t border-indigo-100">

                {/* Posisi grid */}
                <div>
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Posisi Anchor</p>
                  <div className="grid grid-cols-3 gap-1 w-28">
                    {POSITIONS_GRID.map(([pos, icon]) => (
                      <button key={pos}
                        onClick={() => up(asset.id, { position: pos })}
                        className={`py-1.5 text-sm font-bold rounded-lg border transition-colors ${asset.position === pos ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-400 border-gray-200 hover:border-indigo-300'}`}
                      >{icon}</button>
                    ))}
                  </div>
                </div>

                {/* Geser + ukuran + rotasi */}
                <div className="grid grid-cols-2 gap-2">
                  {([
                    ['Geser X (px)', 'offset_x', -300, 300, 4, 0],
                    ['Geser Y (px)', 'offset_y', -300, 300, 4, 0],
                    ['Ukuran (px)', 'width', 10, 400, 10, 80],
                    ['Rotasi (°)', 'rotation', -180, 180, 5, 0],
                  ] as [string, string, number, number, number, number][]).map(([lbl, key, min, max, step, def]) => (
                    <div key={key}>
                      <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{lbl}</p>
                      <input type="number" min={min} max={max} step={step}
                        value={(asset as unknown as Record<string, number>)[key] ?? def}
                        onChange={e => up(asset.id, { [key]: Number(e.target.value) } as Partial<import('@/lib/types').DecorationAsset>)}
                        className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-gray-50"
                      />
                    </div>
                  ))}
                </div>

                {/* Layer + Opacity + Flip */}
                <div className="flex gap-2 items-end">
                  <div style={{ width: 60 }}>
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Layer Z</p>
                    <input type="number" min={-10} max={20}
                      value={asset.z_layer ?? 0}
                      onChange={e => up(asset.id, { z_layer: Number(e.target.value) })}
                      className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-gray-50"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Opacity {asset.opacity ?? 100}%</p>
                    <input type="range" min={5} max={100} step={5}
                      value={asset.opacity ?? 100}
                      onChange={e => up(asset.id, { opacity: Number(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => up(asset.id, { flip_h: !asset.flip_h })}
                      className={`text-[9px] font-bold px-2 py-1.5 rounded-lg border transition-colors ${asset.flip_h ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      ↔H
                    </button>
                    <button onClick={() => up(asset.id, { flip_v: !asset.flip_v })}
                      className={`text-[9px] font-bold px-2 py-1.5 rounded-lg border transition-colors ${asset.flip_v ? 'bg-indigo-600 text-white' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                      ↕V
                    </button>
                  </div>
                </div>

                {/* Animasi masuk + delay */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">✦ Efek Masuk</p>
                    <select value={asset.animation ?? 'fade-in'}
                      onChange={e => up(asset.id, { animation: e.target.value as import('@/lib/types').AssetAnimation })}
                      className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-gray-50">
                      {Object.entries(ENTRY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Delay (ms)</p>
                    <input type="number" min={0} max={4000} step={100}
                      value={asset.animation_delay ?? 0}
                      onChange={e => up(asset.id, { animation_delay: Number(e.target.value) })}
                      className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-gray-50"
                    />
                  </div>
                </div>

                {/* Animasi berkelanjutan (idle) */}
                <div>
                  <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-wider mb-1.5">∞ Animasi Berkelanjutan</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <select value={asset.idle_animation ?? 'none'}
                        onChange={e => up(asset.id, { idle_animation: e.target.value as import('@/lib/types').AssetIdleAnimation })}
                        className="w-full text-xs border border-indigo-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-indigo-50">
                        {Object.entries(IDLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                    </div>
                    {(asset.idle_animation ?? 'none') !== 'none' && (
                      <div>
                        <select value={asset.idle_speed ?? 'normal'}
                          onChange={e => up(asset.id, { idle_speed: e.target.value as 'slow' | 'normal' | 'fast' })}
                          className="w-full text-xs border border-indigo-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-indigo-50">
                          <option value="slow">Lambat</option>
                          <option value="normal">Normal</option>
                          <option value="fast">Cepat</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* Label */}
                <div>
                  <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Nama Layer</p>
                  <input type="text"
                    value={asset.label ?? ''}
                    onChange={e => up(asset.id, { label: e.target.value })}
                    className="w-full text-xs border border-gray-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-gray-50"
                    placeholder="Nama aset (untuk identifikasi)"
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Helper components ─────────────────────────────────────────

function SectionField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
      {children}
    </div>
  )
}

const miniInput = 'w-full text-xs px-2 py-1.5 border border-gray-100 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white'
