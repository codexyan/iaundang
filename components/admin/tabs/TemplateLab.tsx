'use client'

import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import toast from 'react-hot-toast'
import {
  FlaskConical, Save, RefreshCw, Maximize2, Move, Music, Volume2,
  ChevronUp, ChevronDown, Eye, EyeOff, Palette, Type, Layers,
  LayoutTemplate, Code2, Sparkles, Loader2, Plus, Trash2, Rocket, X, GripVertical, Play, Check, Lock, Unlock,
  Paintbrush, ImageIcon, Undo2, Redo2, FileCheck, FileClock, PenLine, ArrowLeft, Upload,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { getTransitionVariants } from '@/components/renderer/transitions/useTransition'
import type { TransitionType, TemplateMeta, ColorScheme, OpeningConfig, MusicConfig, TemplateCategory, ColorPalette, DecorationAsset } from '@/lib/types'
import type { TemplateRecord, NewInvitationData, Wish, SectionType, GiftAccount } from '@/lib/types'
import { checkColorScheme, autoFixColorScheme, contrastRatio, wcagLevel, wcagLevelLarge } from '@/lib/color-contrast'
import DecorationMoodboard from '@/components/admin/DecorationMoodboard'
import JAVANESE_GOLD from '@/lib/template-configs/javanese-gold'
import ImageUploadField from '@/components/admin/ImageUploadField'
import VideoUploadField from '@/components/admin/VideoUploadField'

// Dynamic import   hindari SSR issue
const InvitationPreview = dynamic(() => import('@/components/renderer/InvitationPreview'), { ssr: false })
// CoverPagePreview replaced by direct OpeningScene in live preview
const OpeningScene      = dynamic(() => import('@/components/renderer/OpeningScene'),      { ssr: false })
const LoadingScreen     = dynamic(() => import('@/components/renderer/LoadingScreen'),     { ssr: false })
const FloatingMusicPlayer = dynamic(() => import('@/components/renderer/FloatingMusicPlayer'), { ssr: false })
const InvitationRenderer  = dynamic(() => import('@/components/renderer/InvitationRenderer'),  { ssr: false })

//  Sample data default untuk preview 
const PREVIEW_DATA_DEFAULT: NewInvitationData = {
  groom_name: 'Ikhwal',
  bride_name: 'Fani',
  bride_parents: 'Bapak & Ibu Santoso',
  groom_parents: 'Bapak & Ibu Wijaya',
  tagline: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri.',
  groom_photo_url: 'https://images.unsplash.com/photo-1526922782478-4946233fabf5?w=400&h=500&fit=crop&crop=face',
  bride_photo_url: 'https://images.unsplash.com/photo-1492175742197-ed20dc5a6bed?w=400&h=500&fit=crop&crop=face',
  couple_photo_url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&h=800&fit=crop',
  groom_bio: 'Seorang arsitek yang percaya bahwa keindahan sejati terletak pada kesederhanaan.',
  bride_bio: 'Dokter muda yang menemukan kebahagiaan dalam merawat dan menyayangi sesama.',
  story_title: 'Kisah Kami',
  story_text: 'Pertemuan sederhana yang ternyata menjadi awal dari perjalanan yang penuh makna. Dengan izin Allah SWT, kami memutuskan untuk melanjutkan ke jenjang pernikahan.',
  akad: {
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '08:00',
    venue_name: 'Masjid Al-Ikhlas',
    venue_address: 'Jl. Mawar No. 12, Jakarta Selatan',
    maps_url: 'https://maps.google.com',
    venue_photo_url: 'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?w=600&h=400&fit=crop',
  },
  resepsi: {
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '11:00',
    venue_name: 'Ballroom Grand Hotel',
    venue_address: 'Jl. Sudirman No. 86, Jakarta Pusat',
    maps_url: 'https://maps.google.com',
    venue_photo_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&h=400&fit=crop',
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
  story_chapters: [
    { date: 'Maret 2021', title: 'Pertama Bertemu', text: 'Sebuah pertemuan yang tidak direncanakan di ruang meeting kantor. Senyumnya yang hangat membuat hari-hari di kantor terasa berbeda.', photo_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=900&fit=crop' },
    { date: 'Desember 2022', title: 'Jatuh Cinta', text: 'Dari rekan kerja menjadi sahabat, dari sahabat menjadi cinta. Perasaan yang tumbuh perlahan namun pasti, bagai bunga yang mekar di musim semi.', photo_url: 'https://images.unsplash.com/photo-1606216794079-73f85bbd57d5?w=600&h=900&fit=crop' },
    { date: 'Juni 2023', title: 'Melamar', text: 'Dengan restu kedua keluarga dan keyakinan di hati, kami memutuskan untuk melangkah bersama menuju jenjang yang lebih serius.', photo_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&h=900&fit=crop' },
  ],
  story_timeline: [
    { date: 'Maret 2021', title: 'Pertama Bertemu', description: 'Sebuah pertemuan yang tidak direncanakan di ruang meeting kantor. Senyumnya yang hangat membuat hari-hari terasa berbeda.', photo_url: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=400&h=400&fit=crop' },
    { date: 'Desember 2022', title: 'Jatuh Cinta',  description: 'Dari rekan kerja menjadi sahabat, dari sahabat menjadi cinta yang tumbuh perlahan namun pasti.', photo_url: 'https://images.unsplash.com/photo-1606216794079-73f85bbd57d5?w=400&h=400&fit=crop' },
    { date: 'Juni 2023',  title: 'Melamar',        description: 'Dengan restu kedua keluarga, kami memutuskan untuk melangkah bersama menuju jenjang pernikahan.', photo_url: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=400&h=400&fit=crop' },
    { date: 'April 2026', title: 'Hari Bahagia',   description: 'Mempersatukan dua hati menjadi satu keluarga, insya Allah.', photo_url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=400&h=400&fit=crop' },
  ],
  gallery_photos: [
    'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1606216794079-73f85bbd57d5?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&h=600&fit=crop',
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&h=800&fit=crop',
    'https://images.unsplash.com/photo-1529636798458-92182e662485?w=600&h=600&fit=crop',
  ],
  gift_registry: [
    { label: 'Perlengkapan dapur',   url: 'https://tokopedia.com/wishlist/1', marketplace: 'tokopedia', image_url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=300&h=300&fit=crop' },
    { label: 'Furnitur rumah tangga', url: 'https://shopee.co.id/wishlist/2', marketplace: 'shopee', image_url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=300&h=300&fit=crop' },
  ],
  ig_story_image_url: 'https://images.unsplash.com/photo-1604017011826-d3b4c23f8914?w=400&h=710&fit=crop',
  qr_target_url: 'https://iaundang.id/ikhwal-fani',
  qr_label: 'Pindai untuk membagikan undangan ini',
}

// Semua referensi PREVIEW_DATA sekarang ke state previewData di komponen

const PREVIEW_WISHES: Wish[] = [
  { id: '1', invitation_id: 'lab', name: 'Reza', message: 'Selamat menempuh hidup baru! 💕', created_at: new Date().toISOString() },
  { id: '2', invitation_id: 'lab', name: 'Sari', message: 'Semoga menjadi keluarga sakinah mawaddah warahmah!', created_at: new Date().toISOString() },
]

//  Gift section lab data 
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

//  Constants 
const SECTION_TYPES = ['hero', 'profiles', 'countdown', 'events', 'story', 'gallery', 'rsvp', 'wishes', 'closing', 'gift', 'livestream', 'quote', 'video', 'gift-registry', 'ig-story', 'qrcode'] as const
const OPENING_TYPES = ['fade-reveal', 'ring-zoom', 'petal-fall'] as const
const TRANSITION_TYPES = ['fade', 'slide-up', 'slide-left', 'slide-right', 'zoom-in'] as const

const OPENING_META: Record<string, { icon: string; label: string }> = {
  'fade-reveal':   { icon: '✨', label: 'Fade Reveal' },
  'ring-zoom':     { icon: '💍', label: 'Cincin' },
  'petal-fall':    { icon: '🌺', label: 'Petal Jatuh' },
}

//  Color Palettes 
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

//  Variant Thumbnail 
// Mini-mockup visual per variant menggunakan warna template aktif
function VariantThumb({ type, variant, p, a, t }: { type: string; variant: string; p: string; a: string; t: string }) {
  const base: React.CSSProperties = { width: 54, height: 76, backgroundColor: p, borderRadius: 6, overflow: 'hidden', flexShrink: 0, position: 'relative', display: 'flex', flexDirection: 'column' }

  if (type === 'hero') {
    // Centered   crosshair + centered text block
    if (variant === 'default') return (
      <div style={base}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          {/* Crosshair lines */}
          <div style={{ position: 'absolute', width: 1, height: '100%', left: '50%', backgroundColor: `${a}15` }} />
          <div style={{ position: 'absolute', height: 1, width: '100%', top: '50%', backgroundColor: `${a}15` }} />
          {/* Content block */}
          <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, backgroundColor: `${p}ee`, padding: '6px 4px' }}>
            <div style={{ fontSize: 6, color: `${a}88`, fontStyle: 'italic', lineHeight: 1 }}>بسم</div>
            <div style={{ fontSize: 7, fontWeight: 700, color: t, lineHeight: 1, letterSpacing: -0.3 }}>A & B</div>
            <div style={{ width: 16, height: 0.5, backgroundColor: a }} />
            <div style={{ fontSize: 4, color: `${t}66`, lineHeight: 1 }}>scroll ↓</div>
          </div>
        </div>
      </div>
    )
    // Bottom   gradient fade, text anchored to bottom
    if (variant === 'bottom') return (
      <div style={{ ...base, justifyContent: 'flex-end', background: `linear-gradient(135deg, ${a}22, ${p})` }}>
        <div style={{ position: 'absolute', inset: 0, background: `url("data:image/svg+xml,%3Csvg width='54' height='76' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='54' height='76' fill='%23999' opacity='0.08'/%3E%3C/svg%3E")` }} />
        <div style={{ position: 'absolute', inset: '30% 0 0 0', background: `linear-gradient(to bottom, transparent, ${p}ee)` }} />
        <div style={{ position: 'relative', padding: '0 5px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5 }}>
          <div style={{ fontSize: 7, fontWeight: 700, color: '#fff', lineHeight: 1, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>A & B</div>
          <div style={{ width: 18, display: 'flex', alignItems: 'center', gap: 2 }}>
            <div style={{ flex: 1, height: 0.5, backgroundColor: `${a}88` }} />
            <div style={{ width: 2, height: 2, borderRadius: '50%', backgroundColor: a }} />
            <div style={{ flex: 1, height: 0.5, backgroundColor: `${a}88` }} />
          </div>
        </div>
      </div>
    )
    // Minimal   double border frame, geometric center
    if (variant === 'minimal') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 42, height: 58, border: `1px solid ${a}55`, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
          <div style={{ position: 'absolute', inset: 3, border: `0.5px solid ${a}22` }} />
          {[{ top: -3, left: -3 }, { top: -3, right: -3 }, { bottom: -3, left: -3 }, { bottom: -3, right: -3 }].map((pos, i) => (
            <div key={i} style={{ position: 'absolute', ...pos, width: 5, height: 5, backgroundColor: a, opacity: 0.6 }} />
          ))}
          <div style={{ fontSize: 7, fontWeight: 600, color: t, lineHeight: 1 }}>A</div>
          <div style={{ width: 8, height: 8, border: `0.8px solid ${a}`, transform: 'rotate(45deg)' }} />
          <div style={{ fontSize: 7, fontWeight: 600, color: t, lineHeight: 1 }}>B</div>
        </div>
      </div>
    )
    // Split   foto kiri, nama kanan
    if (variant === 'split') return (
      <div style={{ ...base, flexDirection: 'row' }}>
        <div style={{ flex: 1, background: `linear-gradient(135deg, ${a}33, ${a}11)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 20 20" width="16" height="16" fill="none">
            <rect x="2" y="2" width="16" height="16" rx="2" stroke={`${a}88`} strokeWidth="1" />
            <circle cx="7" cy="8" r="2.5" fill={`${a}44`} />
            <path d="M2,16 Q6,10 10,12 Q14,14 18,10 L18,18 L2,18 Z" fill={`${a}33`} />
          </svg>
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: '0 5px', gap: 2 }}>
          <div style={{ fontSize: 6, fontWeight: 700, color: t, lineHeight: 1 }}>A</div>
          <div style={{ width: 12, height: 0.5, backgroundColor: a }} />
          <div style={{ fontSize: 6, fontWeight: 700, color: t, lineHeight: 1 }}>B</div>
          <div style={{ fontSize: 3.5, color: `${t}55`, lineHeight: 1, marginTop: 2 }}>tagline</div>
        </div>
      </div>
    )
    // Glass Card   frosted card floating on gradient
    if (variant === 'overlay-card') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', background: `linear-gradient(150deg, ${a}44 0%, ${p} 50%, ${a}22 100%)` }}>
        <div style={{
          width: 36, height: 46, borderRadius: 5,
          background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.25)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        }}>
          <div style={{ fontSize: 6, fontWeight: 700, color: '#fff', lineHeight: 1, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>A</div>
          <div style={{ fontSize: 5, color: a, fontStyle: 'italic', lineHeight: 1 }}>&amp;</div>
          <div style={{ fontSize: 6, fontWeight: 700, color: '#fff', lineHeight: 1, textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>B</div>
          <div style={{ width: 16, height: 0.5, backgroundColor: `${a}66`, marginTop: 1 }} />
        </div>
      </div>
    )
    // Editorial   oversized dramatic text
    if (variant === 'editorial') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <div style={{ fontSize: 3.5, letterSpacing: 1.5, textTransform: 'uppercase', color: `${a}77`, lineHeight: 1 }}>THE WEDDING</div>
        <div style={{ fontSize: 12, fontWeight: 200, color: t, lineHeight: 0.9, letterSpacing: 1 }}>A</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 3, margin: '1px 0' }}>
          <div style={{ width: 10, height: 0.5, backgroundColor: `${a}44` }} />
          <div style={{ fontSize: 4, color: `${a}88` }}>&amp;</div>
          <div style={{ width: 10, height: 0.5, backgroundColor: `${a}44` }} />
        </div>
        <div style={{ fontSize: 12, fontWeight: 200, color: t, lineHeight: 0.9, letterSpacing: 1 }}>B</div>
      </div>
    )
    // Arch   SVG arch frame
    if (variant === 'arch') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center' }}>
        <svg viewBox="0 0 42 64" width="42" height="64" fill="none" style={{ position: 'absolute' }}>
          <path d="M8,64 L8,24 Q8,5 21,5 Q34,5 34,24 L34,64" stroke={`${a}55`} strokeWidth="1" />
          <path d="M12,64 L12,26 Q12,10 21,10 Q30,10 30,26 L30,64" stroke={`${a}22`} strokeWidth="0.5" />
        </svg>
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 4 }}>
          <div style={{ fontSize: 4, color: `${a}88`, lineHeight: 1 }}>بسم الله</div>
          <div style={{ fontSize: 7, fontWeight: 600, color: t, lineHeight: 1 }}>A</div>
          <div style={{ fontSize: 5, color: a, fontStyle: 'italic', lineHeight: 1 }}>&amp;</div>
          <div style={{ fontSize: 7, fontWeight: 600, color: t, lineHeight: 1 }}>B</div>
        </div>
      </div>
    )
    // Magazine   circle photo + horizontal name
    if (variant === 'magazine') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', border: `1.5px solid ${a}`, backgroundColor: `${a}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg viewBox="0 0 12 12" width="10" height="10" fill="none">
            <circle cx="6" cy="4.5" r="2.5" fill={`${a}44`} />
            <ellipse cx="6" cy="10" rx="4" ry="2.5" fill={`${a}33`} />
          </svg>
        </div>
        <div style={{ fontSize: 3.5, letterSpacing: 1, textTransform: 'uppercase', color: `${a}77`, lineHeight: 1 }}>UNDANGAN</div>
        <div style={{ fontSize: 6.5, fontWeight: 700, color: t, lineHeight: 1 }}>A & B</div>
        <div style={{ width: 18, display: 'flex', alignItems: 'center', gap: 2 }}>
          <div style={{ flex: 1, height: 0.5, backgroundColor: `${a}44` }} />
          <div style={{ width: 1.5, height: 1.5, borderRadius: '50%', backgroundColor: a }} />
          <div style={{ flex: 1, height: 0.5, backgroundColor: `${a}44` }} />
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
      <div style={{ ...base, justifyContent: 'center', padding: '4px 6px', gap: 4 }}>
        {[0,1].map(i => (
          <div key={i} style={{ width: '100%', border: `1px solid ${a}30`, padding: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              <div style={{ width: 2, height: 10, backgroundColor: `${a}50` }} />
              <div style={{ width: 20, height: 2, backgroundColor: t }} />
            </div>
            <div style={{ width: '80%', height: 8, backgroundColor: `${a}12` }} />
            <div style={{ width: '60%', height: 1.5, backgroundColor: `${t}44` }} />
          </div>
        ))}
      </div>
    )
    if (variant === 'cinematic') return (
      <div style={{ ...base, justifyContent: 'flex-end', gap: 0, background: `linear-gradient(135deg, ${t}cc, ${t}88)` }}>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60%', background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
        <div style={{ position: 'relative', padding: '0 6px 6px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <div style={{ width: 16, height: 1.5, backgroundColor: `${a}cc` }} />
          <div style={{ width: 28, height: 2, backgroundColor: 'rgba(255,255,255,0.8)' }} />
          <div style={{ width: 20, height: 1.5, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        </div>
      </div>
    )
    if (variant === 'timeline') return (
      <div style={{ ...base, justifyContent: 'center', padding: '4px 8px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, alignItems: 'flex-start' }}>
          {[0,1].map(i => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', border: `1.5px solid ${a}60`, flexShrink: 0 }} />
                {i === 0 && <div style={{ width: 0.5, height: 14, backgroundColor: `${a}30` }} />}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, paddingTop: 1 }}>
                <div style={{ width: 24, height: 2, backgroundColor: t }} />
                <div style={{ width: 18, height: 1.5, backgroundColor: `${t}44` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
    if (variant === 'magazine') return (
      <div style={{ ...base, justifyContent: 'flex-start', gap: 0 }}>
        <div style={{ width: '100%', height: 20, background: `${a}22` }} />
        <div style={{ padding: '4px 6px', display: 'flex', gap: 4 }}>
          <div style={{ width: 2, height: 24, backgroundColor: `${a}40` }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ width: 24, height: 2, backgroundColor: t }} />
            <div style={{ width: 18, height: 1.5, backgroundColor: `${t}44` }} />
            <div style={{ width: 14, height: 1.5, backgroundColor: `${t}33` }} />
          </div>
        </div>
      </div>
    )
    if (variant === 'elegant') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <div style={{ width: 20, height: 1.5, backgroundColor: `${a}55` }} />
        <div style={{ width: 28, height: 2, backgroundColor: t }} />
        <div style={{ fontSize: 7, color: `${t}55`, fontStyle: 'italic' }}>·</div>
        <div style={{ width: 20, height: 1.5, backgroundColor: `${a}55` }} />
        <div style={{ width: 24, height: 2, backgroundColor: t }} />
      </div>
    )
  }

  if (type === 'countdown') {
    if (variant === 'default') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 10, height: 14, border: `1px solid ${a}40`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 6, height: 2, backgroundColor: t }} />
            </div>
          ))}
        </div>
        <div style={{ width: 28, height: 0.5, backgroundColor: `${a}44` }} />
      </div>
    )
    if (variant === 'cinematic') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 4, background: `linear-gradient(135deg, ${t}cc, ${t}99)` }}>
        <div style={{ width: 16, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
        <div style={{ display: 'flex', gap: 3 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 10, height: 14, background: 'rgba(0,0,0,0.35)', border: '0.5px solid rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 5, height: 2, backgroundColor: 'rgba(255,255,255,0.8)' }} />
            </div>
          ))}
        </div>
      </div>
    )
    if (variant === 'elegant') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <div style={{ fontSize: 14, fontWeight: 300, color: t, lineHeight: 1 }}>60</div>
        <div style={{ width: 20, height: 0.5, backgroundColor: `${a}40` }} />
        <div style={{ display: 'flex', gap: 6 }}>
          {[0,1,2].map(i => (
            <div key={i} style={{ width: 6, height: 3, backgroundColor: `${t}88` }} />
          ))}
        </div>
      </div>
    )
    if (variant === 'minimal') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <div style={{ display: 'flex', gap: 4, alignItems: 'baseline' }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <div style={{ width: 10, height: 5, backgroundColor: t, opacity: 0.8 }} />
              <div style={{ width: 6, height: 1, backgroundColor: `${a}55` }} />
            </div>
          ))}
        </div>
      </div>
    )
    if (variant === 'rings') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', border: `1.5px solid ${a}55`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 4, height: 2, backgroundColor: t }} />
            </div>
          ))}
        </div>
      </div>
    )
    if (variant === 'magazine') return (
      <div style={{ ...base, justifyContent: 'flex-start', gap: 0 }}>
        <div style={{ width: '100%', height: 22, background: `linear-gradient(135deg, ${a}44, ${a}22)` }} />
        <div style={{ padding: '4px 6px', display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ width: 3, height: 12, backgroundColor: `${a}55` }} />
          <div style={{ display: 'flex', gap: 2 }}>
            {[0,1,2,3].map(i => (
              <div key={i} style={{ width: 8, height: 10, borderTop: `1.5px solid ${a}66`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 5, height: 2, backgroundColor: t }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (type === 'gift') {
    if (variant === 'default') return (
      <div style={{ ...base, justifyContent: 'center', padding: '6px 4px', gap: 3 }}>
        {[0,1].map(i => (
          <div key={i} style={{ width: '100%', height: 20, borderRadius: 4, background: `linear-gradient(135deg, ${a}55, ${a}33)`, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 3, left: 4, width: 8, height: 5, borderRadius: 1.5, backgroundColor: `${a}88`, border: `0.5px solid ${a}` }} />
            <div style={{ position: 'absolute', bottom: 3, left: 4, width: 22, height: 1.5, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 1 }} />
          </div>
        ))}
      </div>
    )
    if (variant === 'swipe') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 36, height: 50 }}>
          <div style={{ position: 'absolute', top: 0, left: 4, right: 4, height: 40, borderRadius: 4, background: `${a}22`, transform: 'scale(0.92)' }} />
          <div style={{ position: 'absolute', top: 4, left: 2, right: 2, height: 40, borderRadius: 4, background: `${a}33`, transform: 'scale(0.96)' }} />
          <div style={{ position: 'absolute', top: 8, left: 0, right: 0, height: 40, borderRadius: 4, background: `linear-gradient(135deg, ${a}66, ${a}44)` }}>
            <div style={{ position: 'absolute', top: 4, left: 4, width: 7, height: 4, borderRadius: 1, backgroundColor: `${a}88` }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 2, marginTop: 4 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: i === 0 ? 8 : 3, height: 3, borderRadius: 1.5, backgroundColor: i === 0 ? a : `${a}44` }} />)}
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

  if (type === 'quote') {
    if (variant === 'default') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <div style={{ width: 20, height: 0.5, background: `linear-gradient(to right, transparent, ${a}50)` }} />
        <div style={{ fontSize: 8, color: `${a}88`, fontFamily: 'serif', direction: 'rtl' as const }}>بسم</div>
        <div style={{ width: 30, height: 1.5, backgroundColor: `${t}44`, fontStyle: 'italic' }} />
        <div style={{ fontSize: 5, color: `${a}55`, letterSpacing: 1, textTransform: 'uppercase' as const }}>QS</div>
        <div style={{ width: 20, height: 0.5, background: `linear-gradient(to left, transparent, ${a}50)` }} />
      </div>
    )
    if (variant === 'cinematic') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 3, background: `linear-gradient(135deg, ${t}dd, ${t}aa)` }}>
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', fontFamily: 'serif', direction: 'rtl' as const }}>بسم</div>
        <div style={{ width: 24, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
        <div style={{ width: 20, height: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />
      </div>
    )
    if (variant === 'elegant') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
        <div style={{ fontSize: 14, color: `${a}30`, fontFamily: 'serif', lineHeight: 1 }}>&ldquo;</div>
        <div style={{ width: 26, height: 1.5, backgroundColor: `${t}55` }} />
        <div style={{ fontSize: 14, color: `${a}30`, fontFamily: 'serif', lineHeight: 1 }}>&rdquo;</div>
      </div>
    )
    if (variant === 'magazine') return (
      <div style={{ ...base, justifyContent: 'center', padding: '6px 6px' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          <div style={{ width: 2, height: 24, background: `linear-gradient(to bottom, ${a}60, ${a}20)` }} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <div style={{ fontSize: 7, color: `${a}77`, fontFamily: 'serif', direction: 'rtl' as const, textAlign: 'right' as const }}>بسم</div>
            <div style={{ width: 22, height: 1.5, backgroundColor: `${t}44` }} />
          </div>
        </div>
      </div>
    )
    if (variant === 'minimal') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <div style={{ width: 12, height: 0.5, backgroundColor: `${a}35` }} />
        <div style={{ width: 24, height: 1.5, backgroundColor: `${t}55` }} />
        <div style={{ width: 18, height: 1, backgroundColor: `${t}33` }} />
        <div style={{ width: 12, height: 0.5, backgroundColor: `${a}35` }} />
      </div>
    )
  }

  if (type === 'video') {
    if (variant === 'default') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <div style={{ width: 20, height: 0.5, backgroundColor: `${a}40` }} />
        <div style={{ width: 36, height: 22, border: `1px solid ${a}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 0, height: 0, borderLeft: `6px solid ${a}55`, borderTop: '4px solid transparent', borderBottom: '4px solid transparent' }} />
        </div>
        <div style={{ width: 24, height: 1, backgroundColor: `${t}33` }} />
      </div>
    )
    if (variant === 'cinematic') return (
      <div style={{ ...base, justifyContent: 'flex-end', gap: 0 }}>
        <div style={{ width: '100%', flex: 1, background: `${t}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 0, height: 0, borderLeft: `7px solid ${a}55`, borderTop: '5px solid transparent', borderBottom: '5px solid transparent' }} />
        </div>
        <div style={{ width: '100%', height: 16, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)', display: 'flex', alignItems: 'flex-end', padding: '0 4px 3px' }}>
          <div style={{ width: 20, height: 1, backgroundColor: 'rgba(255,255,255,0.4)' }} />
        </div>
      </div>
    )
    if (variant === 'magazine') return (
      <div style={{ ...base, justifyContent: 'center', padding: '6px 6px', gap: 3 }}>
        <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
          <div style={{ width: 2, height: 8, backgroundColor: `${a}50` }} />
          <div style={{ width: 18, height: 2, backgroundColor: t }} />
        </div>
        <div style={{ width: '100%', height: 26, border: `1px solid ${a}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 0, height: 0, borderLeft: `5px solid ${a}44`, borderTop: '3px solid transparent', borderBottom: '3px solid transparent' }} />
        </div>
      </div>
    )
    if (variant === 'minimal') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        <div style={{ width: 38, height: 24, border: `0.5px solid ${a}20`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 0, height: 0, borderLeft: `5px solid ${a}35`, borderTop: '3px solid transparent', borderBottom: '3px solid transparent' }} />
        </div>
        <div style={{ width: 16, height: 1, backgroundColor: `${t}25` }} />
      </div>
    )
  }

  if (type === 'gift-registry') {
    if (variant === 'default') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', gap: 3 }}>
          {[0,1].map(i => (
            <div key={i} style={{ width: 20, height: 32, border: `1px solid ${a}25`, display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: 14, background: `${a}12` }} />
              <div style={{ padding: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
                <div style={{ width: 12, height: 1.5, backgroundColor: t }} />
                <div style={{ width: 8, height: 1, backgroundColor: `${t}44` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
    if (variant === 'grid') return (
      <div style={{ ...base, alignItems: 'center', justifyContent: 'center', padding: 6 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3, width: '100%' }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ height: 14, border: `0.5px solid ${a}20`, background: `${a}06` }} />
          ))}
        </div>
      </div>
    )
    if (variant === 'list') return (
      <div style={{ ...base, justifyContent: 'center', padding: '4px 6px', gap: 4 }}>
        {[0,1].map(i => (
          <div key={i} style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            <div style={{ width: 12, height: 12, background: `${a}12`, flexShrink: 0 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <div style={{ width: 20, height: 1.5, backgroundColor: t }} />
              <div style={{ width: 14, height: 1, backgroundColor: `${t}44` }} />
            </div>
          </div>
        ))}
      </div>
    )
    if (variant === 'minimal') return (
      <div style={{ ...base, justifyContent: 'center', padding: '4px 6px', gap: 4 }}>
        {[0,1].map(i => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ width: 22, height: 1.5, backgroundColor: t }} />
            <div style={{ width: 10, height: 6, border: `0.5px solid ${a}30` }} />
          </div>
        ))}
      </div>
    )
  }

  // Default fallback
  return (
    <div style={{ ...base, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, alignItems: 'center' }}>
        <div style={{ width: 32, height: 2.5, backgroundColor: a }} />
        <div style={{ width: 38, height: 2, backgroundColor: `${t}88` }} />
        <div style={{ width: 28, height: 2, backgroundColor: `${t}66` }} />
      </div>
    </div>
  )
}


// Variant yang tersedia per tipe section
const SECTION_VARIANTS: Record<string, { value: string; label: string; desc: string }[]> = {
  hero: [
    { value: 'default',      label: 'Centered',     desc: 'Nama di tengah layar' },
    { value: 'bottom',       label: 'Bottom',        desc: 'Nama di bawah, foto penuh' },
    { value: 'minimal',      label: 'Minimal',       desc: 'Tipografi, tanpa foto bg' },
    { value: 'split',        label: 'Split',          desc: 'Foto kiri, nama kanan' },
    { value: 'overlay-card', label: 'Glass Card',     desc: 'Nama di dalam card transparan' },
    { value: 'editorial',    label: 'Editorial',      desc: 'Teks besar dramatis' },
    { value: 'arch',         label: 'Arch',           desc: 'Frame lengkung ornamental' },
    { value: 'magazine',     label: 'Magazine',       desc: 'Foto circle + layout majalah' },
  ],
  profiles: [
    { value: 'default',  label: 'Portrait',  desc: 'Foto 3:4 berdampingan, badge & tengah' },
    { value: 'card',     label: 'Cinematic', desc: 'Panel full-width, teks overlay bawah' },
    { value: 'vertical', label: 'Vertical',  desc: 'Foto bulat, susun atas-bawah' },
    { value: 'magazine', label: 'Magazine',  desc: 'Foto kiri-kanan bergantian, editorial' },
    { value: 'overlap',  label: 'Overlap',   desc: 'Foto tumpang tindih, nama di bawah' },
  ],
  events: [
    { value: 'default',   label: 'Editorial',  desc: 'Kartu editorial bersih + foto venue' },
    { value: 'cinematic', label: 'Sinematik',  desc: 'Full-bleed foto venue + overlay gelap' },
    { value: 'timeline',  label: 'Timeline',   desc: 'Garis vertikal + titik + foto' },
    { value: 'magazine',  label: 'Majalah',    desc: 'Foto lebar + accent bar kiri' },
    { value: 'elegant',   label: 'Elegan',     desc: 'Centered dengan ornamen pemisah' },
  ],
  countdown: [
    { value: 'default',   label: 'Editorial',   desc: 'Kotak editorial minimalis' },
    { value: 'cinematic', label: 'Sinematik',   desc: 'Full-bleed foto background + overlay' },
    { value: 'elegant',   label: 'Elegan',      desc: 'Angka hari besar fokus + H:M:S' },
    { value: 'minimal',   label: 'Minimal',     desc: 'Tipografi besar bersih' },
    { value: 'rings',     label: 'Lingkaran',   desc: 'Progress ring SVG animasi' },
    { value: 'magazine',  label: 'Majalah',     desc: 'Foto strip atas + countdown bawah' },
  ],
  gift: [
    { value: 'default', label: 'Stack',  desc: 'Kartu vertikal, maks 3' },
    { value: 'swipe',   label: 'Swipe',  desc: 'Kartu tumpuk, geser horizontal' },
  ],
  closing: [
    { value: 'default',   label: 'Simple',    desc: 'Editorial bersih, centered' },
    { value: 'elegant',   label: 'Elegant',   desc: 'Double border frame + corner dots' },
    { value: 'cinematic', label: 'Cinematic', desc: 'Full-screen gelap, foto background' },
    { value: 'magazine',  label: 'Magazine',  desc: 'Left-aligned editorial, tipografi besar' },
    { value: 'card',      label: 'Card',      desc: 'Kartu aksen border atas-bawah' },
    { value: 'poetic',    label: 'Poetic',    desc: 'Kutipan besar dengan tanda petik' },
  ],
  story: [
    { value: 'default',  label: 'Default',  desc: 'IG Stories navigasi per-bab' },
    { value: 'timeline', label: 'Timeline', desc: 'Garis waktu perjalanan (butuh story_timeline)' },
  ],
  gallery: [
    { value: 'default',   label: 'Masonry',   desc: 'Hero foto + 2 kolom staggered' },
    { value: 'dramatic',  label: 'Dramatic',  desc: 'Full-screen, auto-slide, cinematic' },
    { value: 'mosaic',    label: 'Mosaic',    desc: 'Grid asimetris pola majalah' },
    { value: 'filmstrip', label: 'Filmstrip', desc: 'Scroll horizontal strip sinematik' },
    { value: 'collage',   label: 'Collage',   desc: 'Foto tumpuk scattered editorial' },
  ],
  'ig-story': [
    { value: 'default',  label: 'Centered', desc: 'Preview tengah dengan tombol unduh' },
    { value: 'phone',    label: 'Phone',    desc: 'Mockup di dalam frame ponsel' },
    { value: 'minimal',  label: 'Minimal',  desc: 'Foto besar, tombol overlay bawah' },
  ],
  quote: [
    { value: 'default',   label: 'Editorial',  desc: 'Centered dengan ornamen atas-bawah' },
    { value: 'cinematic', label: 'Sinematik',  desc: 'Full-height gelap + teks putih besar' },
    { value: 'elegant',   label: 'Elegan',     desc: 'Tanda kutip besar dekoratif' },
    { value: 'magazine',  label: 'Majalah',    desc: 'Rata kiri + accent bar' },
    { value: 'minimal',   label: 'Minimal',    desc: 'Ultra bersih tanpa heading' },
  ],
  video: [
    { value: 'default',   label: 'Editorial',  desc: 'Frame editorial + caption italic' },
    { value: 'cinematic', label: 'Sinematik',  desc: 'Full-width + caption overlay gradient' },
    { value: 'magazine',  label: 'Majalah',    desc: 'Rata kiri + accent bar atas' },
    { value: 'minimal',   label: 'Minimal',    desc: 'Bersih, border tipis, tanpa header' },
  ],
  'gift-registry': [
    { value: 'default',  label: 'Carousel',  desc: 'Geser horizontal kartu produk' },
    { value: 'grid',     label: 'Grid',       desc: 'Grid 2 kolom kartu kompak' },
    { value: 'list',     label: 'List',       desc: 'Daftar vertikal foto kiri teks kanan' },
    { value: 'minimal',  label: 'Minimal',    desc: 'Teks saja tanpa gambar' },
  ],
}

const ANIM_LABEL: Record<string, string> = {
  'none': 'Tidak Ada', 'fade-in': 'Fade In', 'slide-left': 'Geser Kiri',
  'slide-right': 'Geser Kanan', 'slide-up': 'Naik', 'slide-down': 'Turun',
  'zoom-in': 'Zoom In', 'rotate-in': 'Putar Masuk', 'float': 'Melayang',
}
const HEADING_FONTS = [
  'Playfair Display', 'Cinzel', 'Cormorant Garamond', 'Great Vibes', 'Dancing Script',
  'Libre Baskerville', 'EB Garamond', 'Cinzel Decorative', 'Bodoni Moda', 'Italiana',
  'Tenor Sans', 'Marcellus', 'Yeseva One', 'Poiret One', 'Antic Didone',
  'Gilda Display', 'Cormorant SC', 'Spectral', 'Lora', 'Merriweather',
  'Josefin Sans', 'Montserrat', 'Prata', 'Forum', 'Philosopher',
  'Alex Brush', 'Allura', 'Sacramento', 'Parisienne', 'Tangerine',
]
const BODY_FONTS = [
  'Lato', 'Raleway', 'Nunito', 'Cormorant Garamond', 'Roboto', 'Inter', 'Jost',
  'Spectral', 'Source Serif 4', 'Crimson Text', 'Lora', 'Merriweather',
  'Josefin Sans', 'Montserrat', 'Poppins', 'DM Sans', 'Work Sans',
  'Libre Caslon Text', 'Gentium Book Plus', 'EB Garamond',
]

type ConfigTab = 'identity' | 'colors' | 'style' | 'opening' | 'decor' | 'loading' | 'sections' | 'music'

const SECTION_LABELS: Record<string, string> = {
  hero: 'Hero (Cover)', profiles: 'Profil Pasangan', countdown: 'Hitung Mundur',
  events: 'Detail Acara', story: 'Kisah Cinta', gallery: 'Galeri Foto',
  rsvp: 'RSVP', wishes: 'Buku Ucapan', closing: 'Penutup',
  gift: 'Amplop Digital', livestream: 'Livestream',
  quote: 'Quote / Doa', video: 'Video Sinematik', 'gift-registry': 'Daftar Hadiah',
  'ig-story': 'Template IG Story', qrcode: 'QR Code',
}

//  Helpers 
function makeId() {
  return 'lab-' + Date.now().toString(36)
}

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

//  Main Component 
interface TemplateLabProps {
  onGoToManagement?: () => void
  onTemplateReleased?: (rec: TemplateRecord) => void
  editRecord?: TemplateRecord | null
  categories?: TemplateCategory[]
  palettes?: ColorPalette[]
  templateRecords?: TemplateRecord[]
  onDirtyChange?: (dirty: boolean) => void
}

const DEFAULT_MUSIC_CFG: MusicConfig = {
  enabled: true, autoplay: true, volume: 0.3, loop: true,
  player_style: 'pill', player_position: 'bottom-right',
  player_animation: 'fade-slide', show_title: true, player_size: 'md',
}

export default function TemplateLab({ onGoToManagement, onTemplateReleased, editRecord, categories: categoriesProp, palettes: palettesProp, templateRecords = [], onDirtyChange }: TemplateLabProps) {
  const [config, setConfig] = useState<TemplateRecord>(() => {
    if (editRecord) return deepClone(editRecord)
    return {
      ...deepClone(JAVANESE_GOLD),
      id: makeId(),
      name: 'Template Baru',
      slug: 'template-baru',
    }
  })
  const [isEditMode, setIsEditMode] = useState(!!editRecord)
  const [showSetup, setShowSetup] = useState(() => !editRecord)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [setupName, setSetupName] = useState('')
  const [setupDesc, setSetupDesc] = useState('')
  const [setupCategory, setSetupCategory] = useState('modern')
  const [activeTab, setActiveTab] = useState<ConfigTab>('identity')
  const [previewMode, setPreviewMode] = useState<'invitation' | 'opening' | 'loading'>('opening')
  const [previewGuestName, setPreviewGuestName] = useState('Bapak Budi dan Keluarga')
  const [previewData, setPreviewData] = useState<NewInvitationData>(PREVIEW_DATA_DEFAULT)
  const [showHowTo, setShowHowTo] = useState(false)
  //  Categories: mutable state + inline CRUD 
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
  const [lockedSectionIds, setLockedSectionIds]     = useState<Set<string>>(new Set())
  const [musicLibraryCat, setMusicLibraryCat]       = useState('Semua')
  const [musicPreviewId, setMusicPreviewId]         = useState<string | null>(null)
  const [musicLibrary, setMusicLibrary]             = useState<{ id: string; title: string; artist: string; category: string; url: string }[]>([])
  const [musicLibraryCats, setMusicLibraryCats]     = useState<string[]>([])
  const musicAudioRef = useRef<HTMLAudioElement | null>(null)
  const [previewPlaying, setPreviewPlaying]         = useState(false)
  const [previewLoading, setPreviewLoading]         = useState(false)
  const [decorPreviewKey, setDecorPreviewKey]       = useState(0)
  const [coverPreviewMode, setCoverPreviewMode]    = useState<'static' | 'entry' | 'exit' | 'full-flow'>('static')
  const [decorEditMode, setDecorEditMode]          = useState(false)
  const [selectedAssetId, setSelectedAssetId]      = useState<string | null>(null)
  const [decorScope, setDecorScope]                = useState<'opening' | string>('opening')
  const [sectionReplay, setSectionReplay]           = useState<{ id: string; key: number } | null>(null)
  const [showRelease, setShowRelease]               = useState(false)
  const [releaseSuccess, setReleaseSuccess]         = useState<string | null>(null)
  const [releaseStatus, setReleaseStatus] = useState<'draft' | 'active'>('draft')
  const [releasing, setReleasing] = useState(false)
  const [deleteLabConfirm, setDeleteLabConfirm] = useState<{ id: string; name: string } | null>(null)
  const [changeCount, setChangeCount] = useState(0)
  useEffect(() => { onDirtyChange?.(changeCount > 0) }, [changeCount, onDirtyChange])

  useEffect(() => {
    const allFonts = Array.from(new Set([...HEADING_FONTS, ...BODY_FONTS]))
    const families = allFonts.map(f => `family=${f.replace(/ /g, '+')}:wght@300;400;600;700`).join('&')
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`
    if (document.querySelector('link[data-gf-lab]')) return
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.setAttribute('data-gf-lab', '1')
    document.head.appendChild(link)
  }, [])

  useEffect(() => {
    const customs = config.config.meta.font.custom_fonts ?? []
    customs.forEach(cf => {
      const id = `cf-${cf.name.replace(/\s+/g, '-')}`
      if (document.querySelector(`[data-cf="${id}"]`)) return
      if (cf.url.includes('googleapis')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = cf.url
        link.setAttribute('data-cf', id)
        document.head.appendChild(link)
      } else {
        const ext = cf.url.split('.').pop()?.toLowerCase()
        const format = ext === 'woff2' ? 'woff2' : ext === 'woff' ? 'woff' : ext === 'ttf' ? 'truetype' : 'opentype'
        const style = document.createElement('style')
        style.textContent = `@font-face { font-family: '${cf.name}'; src: url('${cf.url}') format('${format}'); font-display: swap; }`
        style.setAttribute('data-cf', id)
        document.head.appendChild(style)
      }
    })
  }, [config.config.meta.font.custom_fonts])

  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [previewKey, setPreviewKey] = useState(0)
  const [showFullscreen, setShowFullscreen] = useState(false)
  const [fullscreenPhase, setFullscreenPhase] = useState<'opening' | 'loading' | 'main'>('opening')
  const [savedLabs, setSavedLabs] = useState<{ id: string; name: string; config: TemplateRecord; status?: 'draft' | 'released'; savedAt?: string; description?: string }[]>(() => {
    try { return JSON.parse(localStorage.getItem('iaundang-labs') || '[]') }
    catch { return [] }
  })

  useEffect(() => {
    if (editRecord) {
      const cloned = deepClone(editRecord)
      setConfig(cloned)
      setIsEditMode(true)
      setPreviewKey(k => k + 1)
      setDecorPreviewKey(k => k + 1)
      setChangeCount(0)
      setLastSavedAt(null)
      initialConfigRef.current = JSON.stringify(cloned.config)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editRecord?.id])

  useEffect(() => {
    if (activeTab !== 'opening' && activeTab !== 'decor') { setDecorEditMode(false); setSelectedAssetId(null) }
    if (activeTab === 'decor') {
      if (decorScope === 'opening') { setPreviewMode('opening'); setDecorEditMode(true) }
      else { setPreviewMode('invitation'); setDecorEditMode(false) }
    }
    else if (activeTab === 'opening' || activeTab === 'identity' || activeTab === 'colors' || activeTab === 'style') setPreviewMode('opening')
    else if (activeTab === 'loading') setPreviewMode('loading')
    else if (activeTab === 'sections' || activeTab === 'music') setPreviewMode('invitation')
    if (activeTab !== 'music') {
      musicAudioRef.current?.pause()
      setMusicPreviewId(null)
    }
  }, [activeTab, decorScope])

  const toggleMusicPreview = useCallback((songId: string, songUrl: string) => {
    if (musicPreviewId === songId) {
      musicAudioRef.current?.pause()
      setMusicPreviewId(null)
      return
    }
    if (musicAudioRef.current) { musicAudioRef.current.pause(); musicAudioRef.current.src = '' }
    const audio = new Audio(songUrl)
    audio.volume = 0.4
    audio.onended = () => setMusicPreviewId(null)
    audio.onerror = () => { toast.error('Gagal memutar preview. File belum tersedia'); setMusicPreviewId(null) }
    musicAudioRef.current = audio
    audio.play().then(() => setMusicPreviewId(songId)).catch(() => { toast.error('Gagal memutar audio'); setMusicPreviewId(null) })
  }, [musicPreviewId])

  useEffect(() => {
    return () => { musicAudioRef.current?.pause() }
  }, [])

  useEffect(() => {
    fetch('/api/admin/music')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.tracks) setMusicLibrary(data.tracks)
        if (data?.categories?.length) setMusicLibraryCats(data.categories)
      })
      .catch(() => {})
  }, [])

  // Derived
  const cfg = config.config
  const sections = useMemo(
    () => [...cfg.sections].sort((a, b) => a.order - b.order),
    [cfg.sections]
  )

  //  Change tracking + Undo/Redo 
  const initialConfigRef = useRef(JSON.stringify(config.config))
  const historyRef = useRef<string[]>([JSON.stringify(config.config)])
  const historyIndexRef = useRef(0)
  const isUndoRedoRef = useRef(false)
  const MAX_HISTORY = 80

  const changeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const current = JSON.stringify(config.config)

    if (changeTimerRef.current) clearTimeout(changeTimerRef.current)
    changeTimerRef.current = setTimeout(() => {
      if (current !== initialConfigRef.current) {
        const init = JSON.parse(initialConfigRef.current)
        const curr = config.config
        let diffs = 0
        if (JSON.stringify(init.meta) !== JSON.stringify(curr.meta)) diffs++
        if (JSON.stringify(init.opening) !== JSON.stringify(curr.opening)) diffs++
        if (JSON.stringify(init.loading) !== JSON.stringify(curr.loading)) diffs++
        if (JSON.stringify(init.music) !== JSON.stringify(curr.music)) diffs++
        const initSections = init.sections || []
        const currSections = curr.sections || []
        for (let i = 0; i < Math.max(initSections.length, currSections.length); i++) {
          if (JSON.stringify(initSections[i]) !== JSON.stringify(currSections[i])) diffs++
        }
        setChangeCount(Math.max(diffs, 1))
      } else {
        setChangeCount(0)
      }
    }, 400)

    if (!isUndoRedoRef.current) {
      const stack = historyRef.current
      const idx = historyIndexRef.current
      if (stack[idx] !== current) {
        historyRef.current = [...stack.slice(0, idx + 1), current].slice(-MAX_HISTORY)
        historyIndexRef.current = historyRef.current.length - 1
      }
    }
    isUndoRedoRef.current = false
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.config])

  const canUndo = historyIndexRef.current > 0
  const canRedo = historyIndexRef.current < historyRef.current.length - 1

  const undo = useCallback(() => {
    if (historyIndexRef.current <= 0) return
    historyIndexRef.current -= 1
    isUndoRedoRef.current = true
    const restored = JSON.parse(historyRef.current[historyIndexRef.current])
    setConfig(prev => ({ ...prev, config: restored }))
  }, [])

  const redo = useCallback(() => {
    if (historyIndexRef.current >= historyRef.current.length - 1) return
    historyIndexRef.current += 1
    isUndoRedoRef.current = true
    const restored = JSON.parse(historyRef.current[historyIndexRef.current])
    setConfig(prev => ({ ...prev, config: restored }))
  }, [])

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) { e.preventDefault(); redo() }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

  //  Updaters 
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

  const musicCfg: MusicConfig = { ...DEFAULT_MUSIC_CFG, ...cfg.music }

  const updateMusic = useCallback((patch: Partial<MusicConfig>) => {
    setConfig(prev => ({
      ...prev,
      config: {
        ...prev.config,
        music: { ...DEFAULT_MUSIC_CFG, ...(prev.config.music ?? {}), ...patch },
      },
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
      if (lockedSectionIds.has(sorted[swapIdx].id)) return prev
      const newSections = sorted.map((s, i) => ({ ...s, order: i + 1 }))
      const tmp = newSections[idx].order
      newSections[idx] = { ...newSections[idx], order: newSections[swapIdx].order }
      newSections[swapIdx] = { ...newSections[swapIdx], order: tmp }
      return { ...prev, config: { ...prev.config, sections: newSections } }
    })
  }, [lockedSectionIds])

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
    if (lockedSectionIds.has(draggingSectionId) || lockedSectionIds.has(targetId)) return
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
  }, [draggingSectionId, lockedSectionIds])

  //  JSON tab handlers 
  // JSON tab removed - function kept for compatibility but does nothing
  function openJsonTab() {
    // No-op: JSON tab has been replaced with Musik tab
  }

  // applyJson removed - JSON tab replaced with Musik tab

  //  Save/Load lab 
  function saveLabDirect() {
    const labName = config.name.trim()
    if (!labName) {
      toast.error('Nama template belum diisi')
      return
    }
    const now = new Date()
    if (!isEditMode) {
      const existing = savedLabs.find(l => l.name === labName)
      if (existing) {
        const updated = savedLabs.map(l => l.id === existing.id ? { ...l, config, savedAt: now.toISOString(), description: templateDesc } : l)
        setSavedLabs(updated)
        localStorage.setItem('iaundang-labs', JSON.stringify(updated))
      } else {
        const entry = { id: makeId(), name: labName, config, status: 'draft' as const, savedAt: now.toISOString(), description: templateDesc }
        const updated = [...savedLabs, entry]
        setSavedLabs(updated)
        localStorage.setItem('iaundang-labs', JSON.stringify(updated))
      }
    }
    setLastSavedAt(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
    setChangeCount(0)
    initialConfigRef.current = JSON.stringify(config.config)
    toast.success(`"${labName}" tersimpan!`)
  }

  function loadLab(id: string) {
    const entry = savedLabs.find(l => l.id === id)
    if (!entry) return
    setConfig(deepClone(entry.config))
    setPreviewKey(k => k + 1)
    setChangeCount(0)
    initialConfigRef.current = JSON.stringify(entry.config.config)
    toast.success(`"${entry.name}" dimuat`)
  }

  function deleteLab(id: string) {
    const updated = savedLabs.filter(l => l.id !== id)
    setSavedLabs(updated)
    localStorage.setItem('iaundang-labs', JSON.stringify(updated))
  }

  function openReleaseModal() {
    if (!isEditMode && !config.name.trim()) {
      toast.error('Isi nama template terlebih dahulu')
      return
    }
    setReleaseStatus(isEditMode ? (config.status as 'draft' | 'active') || 'draft' : 'draft')
    setShowRelease(true)
  }

  async function submitRelease() {
    const useName = config.name.trim()
    const useSlug = config.slug || useName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')

    if (!useName || !useSlug) {
      toast.error('Nama template wajib diisi')
      return
    }
    if (!/^[a-z0-9-]{3,30}$/.test(useSlug)) {
      toast.error('Slug tidak valid (pastikan nama template minimal 3 karakter)')
      return
    }
    setReleasing(true)
    try {
      const autoThumb = config.config.opening?.cover_photo_url || config.config.opening?.background_image || ''
      const category = config.config.meta.category || 'modern'

      const body: Record<string, unknown> = isEditMode
        ? {
            id: config.id,
            name: useName,
            slug: useSlug,
            category,
            config: config.config,
            thumbnail_url: config.thumbnail_url || autoThumb,
            status: config.status,
          }
        : {
            id: useSlug,
            name: useName,
            slug: useSlug,
            category,
            config: {
              ...config.config,
              meta: {
                ...config.config.meta,
                name: useName,
                slug: useSlug,
                category,
                thumbnail: autoThumb,
              },
            },
            thumbnail_url: autoThumb,
            status: releaseStatus,
          }

      const url = isEditMode
        ? `/api/admin/template-records/${config.id}`
        : '/api/admin/template-records'
      const method = isEditMode ? 'PATCH' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Gagal menyimpan template')
      }

      const savedRecord: TemplateRecord = {
        ...config,
        ...body,
        config: body.config,
      } as unknown as TemplateRecord

      onTemplateReleased?.(savedRecord)
      setShowRelease(false)
      if (isEditMode) {
        toast.success('Perubahan berhasil disimpan!', { duration: 4000, icon: '✅' })
        setShowSetup(true)
        setIsEditMode(false)
      } else {
        toast.success(`"${useName}" berhasil dirilis!`, { duration: 4000, icon: '🎉' })
        setReleaseSuccess(useName)
      }
      setChangeCount(0)
      initialConfigRef.current = JSON.stringify(config.config)
      setLastSavedAt(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }))
      // Mark matching saved lab as released
      const matchIdx = savedLabs.findIndex(l => l.config.slug === config.slug || l.name === useName)
      if (matchIdx >= 0) {
        const updLabs = savedLabs.map((l, i) => i === matchIdx ? { ...l, status: 'released' as const } : l)
        setSavedLabs(updLabs)
        localStorage.setItem('iaundang-labs', JSON.stringify(updLabs))
      }
    } catch (e) {
      toast.error((e as Error).message)
    } finally {
      setReleasing(false)
    }
  }

  //  Setup screen completion 
  function completeSetup() {
    if (!setupName.trim()) { toast.error('Nama template wajib diisi'); return }
    const slug = setupName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    setConfig(prev => ({ ...prev, name: setupName.trim(), slug }))
    setTemplateDesc(setupDesc)
    if (setupCategory) updateMeta({ category: setupCategory as typeof cfg.meta.category })
    setShowSetup(false)
    setActiveTab('identity')
  }

  // 
  //  Setup Screen: home / studio overview 
  if (showSetup && !isEditMode) {
    const allCards: {
      type: 'record' | 'lab'
      id: string
      name: string
      status: string
      category: string
      sectionCount: number
      date: string
      colorScheme?: ColorScheme
      description?: string
      labId?: string
      coverPhoto?: string
      openingType?: string
      coupleNames?: string
      thumbnailUrl?: string
    }[] = []

    // Template records from management
    for (const rec of templateRecords) {
      const cs = rec.config?.meta?.color_scheme
      const enabledSections = rec.config?.sections?.filter((s: { enabled?: boolean }) => s.enabled)?.length ?? 0
      const opening = rec.config?.opening
      allCards.push({
        type: 'record',
        id: rec.id,
        name: rec.name,
        status: rec.status ?? 'draft',
        category: rec.config?.meta?.category ?? '',
        sectionCount: enabledSections,
        date: rec.created_at ?? '',
        colorScheme: cs,
        description: (rec as unknown as Record<string, unknown>).description as string | undefined,
        coverPhoto: opening?.cover_photo_url || opening?.background_image,
        openingType: opening?.type,
        coupleNames: rec.name,
        thumbnailUrl: rec.thumbnail_url,
      })
    }

    // Saved labs from browser localStorage (skip if same name as a Management record)
    const recordNames = new Set(templateRecords.map(r => r.name))
    const recordSlugs = new Set(templateRecords.map(r => r.slug))
    for (const l of savedLabs) {
      if (recordNames.has(l.name) || recordSlugs.has(l.config.slug)) continue
      const cs = l.config.config?.meta?.color_scheme
      const enabledSections = l.config.config?.sections?.filter((s: { enabled?: boolean }) => s.enabled)?.length ?? 0
      const opening = l.config.config?.opening
      allCards.push({
        type: 'lab',
        id: l.id,
        name: l.name,
        status: l.status === 'released' ? 'released' : 'draft',
        category: '',
        sectionCount: enabledSections,
        date: l.savedAt ?? '',
        colorScheme: cs,
        description: l.description,
        labId: l.id,
        coverPhoto: opening?.cover_photo_url || opening?.background_image,
        openingType: opening?.type,
        coupleNames: l.name,
        thumbnailUrl: l.config.thumbnail_url,
      })
    }

    const isEmpty = allCards.length === 0

    return (
      <div className="flex h-full overflow-hidden">
        <div className="flex-1 flex flex-col bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/20 overflow-y-auto">

          {/*  Header  */}
          <div className="px-8 pt-8 pb-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
                <FlaskConical className="w-6 h-6 text-indigo-600" />
                Studio Desain
              </h1>
              <p className="text-sm text-gray-500 mt-1">Kelola dan buat template undangan digital</p>
            </div>
            <button
              onClick={() => { setSetupName(''); setSetupDesc(''); setSetupCategory('modern'); setShowCreateModal(true) }}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Buat Template Baru
            </button>
          </div>

          {/*  Empty State  */}
          {isEmpty && (
            <div className="flex-1 flex items-center justify-center px-8">
              <div className="text-center max-w-sm">
                <svg viewBox="0 0 200 160" className="w-48 h-40 mx-auto mb-6" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Palette body */}
                  <ellipse cx="100" cy="130" rx="70" ry="8" fill="#e0e7ff" opacity="0.6" />
                  <rect x="50" y="40" rx="16" ry="16" width="100" height="80" fill="#eef2ff" stroke="#a5b4fc" strokeWidth="2" />
                  {/* Color dots on palette */}
                  <circle cx="72" cy="65" r="8" fill="#818cf8" />
                  <circle cx="95" cy="65" r="8" fill="#a78bfa" />
                  <circle cx="118" cy="65" r="8" fill="#c4b5fd" />
                  {/* Brush handle */}
                  <rect x="130" y="28" width="8" height="50" rx="4" fill="#6366f1" transform="rotate(25 134 53)" />
                  <rect x="124" y="22" width="20" height="12" rx="4" fill="#4f46e5" transform="rotate(25 134 28)" />
                  {/* Sparkle top-left */}
                  <path d="M38 30 L40 24 L42 30 L48 32 L42 34 L40 40 L38 34 L32 32 Z" fill="#a5b4fc" />
                  {/* Sparkle top-right */}
                  <path d="M158 20 L160 16 L162 20 L166 22 L162 24 L160 28 L158 24 L154 22 Z" fill="#c4b5fd" />
                  {/* Sparkle small */}
                  <path d="M165 55 L166 52 L167 55 L170 56 L167 57 L166 60 L165 57 L162 56 Z" fill="#818cf8" opacity="0.6" />
                  {/* Lines on palette */}
                  <rect x="68" y="85" width="30" height="3" rx="1.5" fill="#c7d2fe" />
                  <rect x="68" y="93" width="50" height="3" rx="1.5" fill="#c7d2fe" />
                  <rect x="68" y="101" width="40" height="3" rx="1.5" fill="#c7d2fe" />
                </svg>
                <h2 className="text-lg font-bold text-gray-900 mb-2">Belum ada template</h2>
                <p className="text-sm text-gray-500 mb-6">Mulai buat desain pertama untuk undangan digital kamu</p>
                <button
                  onClick={() => { setSetupName(''); setSetupDesc(''); setSetupCategory('modern'); setShowCreateModal(true) }}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <Sparkles className="w-4 h-4" /> Buat Template Pertama
                </button>
              </div>
            </div>
          )}

          {/*  Template Cards Grid  */}
          {!isEmpty && (
            <div className="px-8 pb-8 pt-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {allCards.map(card => {
                  const statusMap: Record<string, { label: string; dot: string; text: string }> = {
                    active:   { label: 'Aktif',   dot: 'bg-emerald-500', text: 'text-emerald-700 bg-emerald-50' },
                    draft:    { label: 'Draft',   dot: 'bg-amber-400',   text: 'text-amber-700 bg-amber-50' },
                    archived: { label: 'Arsip',   dot: 'bg-red-400',     text: 'text-red-600 bg-red-50' },
                    released: { label: 'Dirilis', dot: 'bg-emerald-500', text: 'text-emerald-700 bg-emerald-50' },
                  }
                  const st = statusMap[card.status] ?? statusMap.draft
                  const cs = card.colorScheme
                  const textColor = cs?.text || '#fff'
                  const accentColor = cs?.accent || '#d4a574'
                  const primaryColor = cs?.primary || '#1a1a2e'

                  return (
                    <div
                      key={`${card.type}-${card.id}`}
                      className="group rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer relative"
                      onClick={() => {
                        if (card.type === 'record') {
                          const rec = templateRecords.find(r => r.id === card.id)
                          if (rec) { setConfig(deepClone(rec)); setIsEditMode(true); setShowSetup(false) }
                        } else {
                          loadLab(card.id); setShowSetup(false)
                        }
                      }}
                    >
                      {/* Full-card cover   opening style as thumbnail */}
                      <div className="aspect-[9/16] w-full relative overflow-hidden" style={{ background: primaryColor }}>
                        {card.coverPhoto ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={card.coverPhoto} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0" style={{ background: `linear-gradient(to top, ${primaryColor}dd 20%, ${primaryColor}40 50%, transparent 80%)` }} />
                          </>
                        ) : card.thumbnailUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={card.thumbnailUrl} alt="" className="w-full h-full object-cover" />
                        ) : null}

                        {/* Opening-style overlay text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-end pb-5 px-4">
                          <p className="text-[8px] tracking-[0.2em] uppercase opacity-70" style={{ color: textColor }}>Undangan Pernikahan</p>
                          <p className="text-base font-bold text-center mt-1 leading-tight" style={{ color: textColor }}>{card.name}</p>
                          <div className="mt-2 px-4 py-1 rounded-sm" style={{ border: `1px solid ${accentColor}60`, fontSize: 8, color: textColor, letterSpacing: '0.15em' }}>
                            BUKA UNDANGAN
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="absolute top-2.5 left-2.5">
                          <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold backdrop-blur-md ${st.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                            {st.label}
                          </span>
                        </div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                          <span className="text-white text-xs font-semibold bg-black/50 px-4 py-2 rounded-xl backdrop-blur-sm opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all">
                            Edit Desain
                          </span>
                        </div>

                        {/* Delete button for labs only */}
                        {card.type === 'lab' && (
                          <button
                            onClick={e => { e.stopPropagation(); setDeleteLabConfirm({ id: card.id, name: card.name }) }}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/30 text-white/80 hover:bg-red-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all backdrop-blur-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {/* Minimal info bar */}
                      <div className="bg-white px-3 py-2.5 border-t border-gray-100">
                        <h3 className="text-xs font-bold text-gray-900 truncate">{card.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                          <span>{card.sectionCount} seksi</span>
                          {card.date && (
                            <>
                              <span className="w-0.5 h-0.5 rounded-full bg-gray-300" />
                              <span>{new Date(card.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/*  Create New Modal  */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="px-6 pt-6 pb-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">Buat Template Baru</h2>
                <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-6 py-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Nama Template <span className="text-red-400">*</span></label>
                  <input
                    autoFocus
                    value={setupName}
                    onChange={e => setSetupName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && setupName.trim()) { setShowCreateModal(false); completeSetup() } }}
                    placeholder="contoh: Modern Sage, Javanese Royal..."
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                  {setupName.trim() && (
                    <p className="text-[10px] text-gray-400 mt-1">
                      Slug: <span className="font-mono font-semibold text-indigo-600">{setupName.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}</span>
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Deskripsi</label>
                  <textarea
                    value={setupDesc}
                    onChange={e => setSetupDesc(e.target.value)}
                    rows={2}
                    placeholder="Deskripsi singkat tema ini untuk ditampilkan ke user..."
                    className="w-full px-4 py-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">Kategori</label>
                  <div className="flex flex-wrap gap-2">
                    {categoryList.map(c => (
                      <button key={c.slug} onClick={() => setSetupCategory(c.slug)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          setupCategory === c.slug
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                        }`}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="px-6 pb-6">
                <button
                  onClick={() => { setShowCreateModal(false); completeSetup() }}
                  disabled={!setupName.trim()}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-40 transition-colors shadow-sm"
                >
                  <Sparkles className="w-4 h-4" /> Mulai Mendesain
                </button>
              </div>
            </div>
          </div>
        )}

        {/*  Delete Confirmation Modal  */}
        {deleteLabConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setDeleteLabConfirm(null)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
              <div className="px-6 pt-6 pb-4 text-center">
                <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-bold text-gray-900 text-base mb-1">Hapus Draft</h3>
                <p className="text-sm text-gray-500">Draft &ldquo;{deleteLabConfirm.name}&rdquo; akan dihapus permanen dan tidak bisa dipulihkan.</p>
              </div>
              <div className="px-6 pb-6 flex gap-3">
                <button onClick={() => setDeleteLabConfirm(null)} className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">Batal</button>
                <button onClick={() => { deleteLab(deleteLabConfirm.id); setDeleteLabConfirm(null) }} className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl bg-red-600 hover:bg-red-700 transition-colors">Ya, Hapus</button>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex h-full overflow-hidden">

      {/*  Left: Config Editor  */}
      <div className="w-[420px] shrink-0 flex flex-col border-r border-gray-200 bg-white overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-2 mb-3">
            <button onClick={() => {
              if (changeCount > 0 && config.name.trim() && !isEditMode) {
                const now = new Date()
                const existing = savedLabs.find(l => l.name === config.name)
                if (existing) {
                  const updated = savedLabs.map(l => l.id === existing.id ? { ...l, config, savedAt: now.toISOString() } : l)
                  setSavedLabs(updated)
                  localStorage.setItem('iaundang-labs', JSON.stringify(updated))
                } else {
                  const entry = { id: makeId(), name: config.name, config, status: 'draft' as const, savedAt: now.toISOString(), description: templateDesc }
                  const updated = [...savedLabs, entry]
                  setSavedLabs(updated)
                  localStorage.setItem('iaundang-labs', JSON.stringify(updated))
                }
                toast.success('Perubahan tersimpan otomatis')
              }
              setShowSetup(true)
              setIsEditMode(false)
            }} className="p-1.5 -ml-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors" title="Kembali ke Studio">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <FlaskConical className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-gray-900">{isEditMode ? 'Edit Template' : 'Template Lab'}</h2>
            {isEditMode ? (
              <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold ml-1">EDITING</span>
            ) : (
              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-semibold ml-1">BETA</span>
            )}
          </div>
          <input
            value={config.name}
            onChange={e => {
              const name = e.target.value
              const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
              setConfig(prev => ({ ...prev, name, slug }))
            }}
            className="w-full px-3 py-2 text-sm font-medium border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nama template..."
          />
          <p className="text-[9px] text-gray-400 mt-1">
            Slug otomatis: <span className="font-mono font-semibold text-indigo-600">{config.slug || 'template-baru'}</span>
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50 shrink-0">
          {([
            ['identity', LayoutTemplate, 'Identitas'],
            ['colors',   Palette,        'Warna'],
            ['style',    Paintbrush,     'Gaya'],
            ['opening',  Sparkles,       'Opening'],
            ['decor',    Layers,         'Dekorasi'],
            ['loading',  Loader2,        'Loading'],
            ['sections', Type,           'Sections'],
            ['music',    Play,           'Musik'],
          ] as [ConfigTab, React.ElementType, string][]).map(([id, Icon, label]) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
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

          {/*  Identitas  */}
          {activeTab === 'identity' && (
            <div className="space-y-5">

              {/* Info: alur kerja Template Lab   collapsible */}
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

              {/* OLD CATEGORY CRUD - HIDDEN */}
              <div className="hidden">
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

                      {/* Actions   all categories can be edited & deleted */}
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

              {/* OLD TYPOGRAPHY SETTINGS - HIDDEN */}
              <div className="hidden">
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
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input type="number" min={60} max={200} step={5}
                          value={Math.round((cfg.meta.font.heading_scale ?? 1.0) * 100)}
                          onChange={e => { const v = Number(e.target.value) / 100; if (v >= 0.6 && v <= 2.0) updateMeta({ font: { ...cfg.meta.font, heading_scale: v } }) }}
                          className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                        <span className="text-[8px] text-gray-400">%</span>
                      </div>
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
                        Aa · Ikhwal &amp; Fani
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
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input type="number" min={60} max={160} step={5}
                          value={Math.round((cfg.meta.font.body_scale ?? 1.0) * 100)}
                          onChange={e => { const v = Number(e.target.value) / 100; if (v >= 0.6 && v <= 1.6) updateMeta({ font: { ...cfg.meta.font, body_scale: v } }) }}
                          className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                        <span className="text-[8px] text-gray-400">%</span>
                      </div>
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
                  <p className="text-[9px] text-gray-400 mb-2">Tersimpan di browser kamu. Tidak hilang kalau tab ditutup.</p>
                  <div className="space-y-1.5">
                    {savedLabs.map(l => {
                      const sIcon = l.status === 'released'
                        ? <FileCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        : <FileClock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      const sBadge = l.status === 'released'
                        ? <span className="text-[8px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-1 py-0.5 rounded-full font-semibold">Dirilis</span>
                        : <span className="text-[8px] bg-amber-50 text-amber-600 border border-amber-200 px-1 py-0.5 rounded-full font-semibold">Draft</span>
                      const cs = l.config?.config?.meta?.color_scheme
                      return (
                        <div key={l.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl border border-gray-100 group">
                          {cs && (
                            <div className="w-7 h-7 rounded-lg shrink-0"
                              style={{ background: `linear-gradient(135deg, ${cs.primary}, ${cs.accent})` }} />
                          )}
                          {!cs && sIcon}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-gray-700 truncate font-medium">{l.name}</span>
                              {sBadge}
                            </div>
                            {l.savedAt && (
                              <p className="text-[9px] text-gray-400">{new Date(l.savedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                            )}
                          </div>
                          <button onClick={() => loadLab(l.id)} className="text-[10px] text-indigo-600 hover:underline font-semibold shrink-0">Muat</button>
                          <button onClick={() => deleteLab(l.id)} className="text-gray-300 hover:text-red-500 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/*  Warna  */}
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
                {/* Group by category   sumber dari props server (CRUD admin) atau fallback hardcoded */}
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
                  ] as [keyof typeof cfg.meta.color_scheme, string, string][]).map(([key, label, hint]) => {
                    // Inline contrast warning for text/accent against primary
                    let inlineWarning: { ratio: number; level: string } | null = null
                    if (key === 'text') {
                      const r = contrastRatio(cfg.meta.color_scheme.text, cfg.meta.color_scheme.primary)
                      const lv = wcagLevel(r)
                      if (lv === 'FAIL') inlineWarning = { ratio: r, level: lv }
                    } else if (key === 'accent') {
                      const r = contrastRatio(cfg.meta.color_scheme.accent, cfg.meta.color_scheme.primary)
                      const lv = wcagLevelLarge(r)
                      if (lv === 'FAIL') inlineWarning = { ratio: r, level: lv }
                    }

                    return (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-gray-600">{label}</p>
                          <p className="text-[9px] text-gray-400">{hint}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="color"
                            value={cfg.meta.color_scheme[key]}
                            onChange={e => updateColors(key, e.target.value)}
                            className={`w-10 h-9 rounded-lg cursor-pointer border shrink-0 ${inlineWarning ? 'border-red-400 ring-2 ring-red-200' : 'border-gray-200'}`}
                          />
                          <input
                            value={cfg.meta.color_scheme[key]}
                            onChange={e => updateColors(key, e.target.value)}
                            className={inputCls + ' font-mono flex-1 text-xs'}
                            placeholder="#000000"
                          />
                        </div>
                        {inlineWarning && (
                          <p className="text-[9px] text-red-500 mt-1 font-medium">
                            Kontras {inlineWarning.ratio.toFixed(1)}:1 · tidak terbaca di atas latar utama
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/*  Live Contrast Checker  */}
              {(() => {
                const checks = checkColorScheme(cfg.meta.color_scheme)
                const hasFailure = checks.some(c => c.level === 'FAIL')
                const allAAA = checks.every(c => c.level === 'AAA')

                return (
                  <div className={`rounded-2xl border-2 overflow-hidden ${
                    hasFailure ? 'border-red-300 bg-red-50/50' : allAAA ? 'border-emerald-300 bg-emerald-50/50' : 'border-amber-300 bg-amber-50/50'
                  }`}>
                    <div className={`px-4 py-2.5 flex items-center justify-between ${
                      hasFailure ? 'bg-red-100' : allAAA ? 'bg-emerald-100' : 'bg-amber-100'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {hasFailure ? '⚠️' : allAAA ? '✅' : '🔶'}
                        </span>
                        <div>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${
                            hasFailure ? 'text-red-700' : allAAA ? 'text-emerald-700' : 'text-amber-700'
                          }`}>
                            Contrast Check
                          </p>
                          <p className={`text-[9px] ${
                            hasFailure ? 'text-red-600' : allAAA ? 'text-emerald-600' : 'text-amber-600'
                          }`}>
                            {hasFailure ? 'Ada warna tidak terbaca, perlu diperbaiki' : allAAA ? 'Semua warna lolos AAA, sempurna!' : 'Lolos AA, cukup baik'}
                          </p>
                        </div>
                      </div>
                      {hasFailure && (
                        <button
                          onClick={() => {
                            const fixed = autoFixColorScheme(cfg.meta.color_scheme)
                            updateColors('text', fixed.text)
                            updateColors('accent', fixed.accent)
                          }}
                          className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition-colors shrink-0"
                        >
                          Auto-Fix
                        </button>
                      )}
                    </div>

                    <div className="px-4 py-3 space-y-2">
                      {checks.map(c => {
                        const ratioStr = c.ratio.toFixed(1)
                        return (
                          <div key={c.pair} className="flex items-center gap-2.5">
                            {/* Color pair preview */}
                            <div className="w-10 h-6 rounded-md shrink-0 flex items-center justify-center border border-gray-200"
                              style={{ backgroundColor: c.bg }}>
                              <span style={{ color: c.fg, fontSize: 10, fontWeight: 700, lineHeight: 1 }}>Aa</span>
                            </div>
                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              <p className="text-[10px] font-medium text-gray-700 truncate">{c.pair}</p>
                              <p className="text-[9px] text-gray-400">{ratioStr}:1</p>
                            </div>
                            {/* Badges */}
                            <div className="flex gap-1 shrink-0">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                c.level === 'AAA' ? 'bg-emerald-100 text-emerald-700'
                                : c.level === 'AA' ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                              }`}>
                                {c.level === 'FAIL' ? 'GAGAL' : c.level}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${
                                c.levelLarge === 'AAA' ? 'bg-emerald-100 text-emerald-700'
                                : c.levelLarge === 'AA' ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                              }`}>
                                {c.levelLarge === 'FAIL' ? '-' : c.levelLarge} lg
                              </span>
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="px-4 py-2 bg-white/50 border-t border-gray-100">
                      <p className="text-[8px] text-gray-400 leading-relaxed">
                        AA = rasio 4.5:1 (standar minimum) · AAA = rasio 7:1 (ideal) · lg = teks besar (heading)
                      </p>
                    </div>
                  </div>
                )
              })()}
            </div>
          )}

          {/*  Gaya Komponen  */}
          {activeTab === 'style' && (() => {
            const _a = cfg.meta.color_scheme.accent
            const _t = cfg.meta.color_scheme.text
            const _p = cfg.meta.color_scheme.primary
            const _cs = cfg.meta.component_style
            const _brd = _cs?.border ?? 'sharp'
            const _br = _brd === 'pill' ? 999 : _brd === 'rounded' ? 10 : 2
            const _updateStyle = (patch: Record<string, string>) => {
              updateMeta({ component_style: { button: _cs?.button ?? 'outlined', border: _cs?.border ?? 'sharp', ornament: _cs?.ornament ?? 'classic', ...patch } as any })
              setPreviewKey(k => k + 1)
              setDecorPreviewKey(k => k + 1)
            }
            return (
            <div className="space-y-5">

              {/* Preview mode toggle */}
              <div className="flex gap-1.5">
                {([
                  { mode: 'opening' as const, label: 'Preview Opening' },
                  { mode: 'invitation' as const, label: 'Preview Undangan' },
                ] as const).map(pm => (
                  <button key={pm.mode}
                    onClick={() => { setPreviewMode(pm.mode); setPreviewKey(k => k + 1); setDecorPreviewKey(k => k + 1) }}
                    className={`flex-1 py-2 rounded-lg text-[10px] font-semibold transition-all ${
                      previewMode === pm.mode
                        ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-700'
                        : 'bg-gray-50 border border-gray-200 text-gray-500 hover:border-gray-300'
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>

              {/* Live mini preview */}
              <div className="rounded-2xl overflow-hidden" style={{ background: _p, padding: '20px 16px' }}>
                <p className="text-center mb-3" style={{ fontSize: 8, color: `${_t}60`, letterSpacing: '0.2em', textTransform: 'uppercase' }}>Live Preview</p>
                <div className="flex flex-col items-center gap-3">
                  {/* Button with MailOpen icon   opening CTA */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: `8px ${_br > 10 ? 24 : 28}px`,
                    fontSize: 8, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase' as const,
                    borderRadius: _br, cursor: 'default', transition: 'all 0.25s',
                    ...(_cs?.button === 'filled' ? { backgroundColor: _a, color: _t, border: '1px solid transparent' }
                      : _cs?.button === 'pill' ? { borderRadius: 999, backgroundColor: `${_a}20`, color: _t, border: `1px solid ${_a}45` }
                      : _cs?.button === 'ghost' ? { backgroundColor: 'transparent', color: _a, border: '1px solid transparent' }
                      : _cs?.button === 'underline' ? { backgroundColor: 'transparent', color: _t, border: 'none', borderBottom: `1.5px solid ${_a}60`, borderRadius: 0, paddingLeft: 4, paddingRight: 4 }
                      : { backgroundColor: 'transparent', color: _t, border: `1px solid ${_a}50` }),
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
                    BUKA UNDANGAN
                  </div>
                  {/* Button with Send icon   form submit */}
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    padding: `7px ${_br > 10 ? 18 : 22}px`,
                    fontSize: 7.5, fontWeight: 500, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
                    borderRadius: _br, cursor: 'default', transition: 'all 0.25s',
                    ...(_cs?.button === 'filled' ? { backgroundColor: _a, color: _t, border: '1px solid transparent' }
                      : _cs?.button === 'pill' ? { borderRadius: 999, backgroundColor: `${_a}20`, color: _t, border: `1px solid ${_a}45` }
                      : _cs?.button === 'ghost' ? { backgroundColor: 'transparent', color: _a, border: '1px solid transparent' }
                      : _cs?.button === 'underline' ? { backgroundColor: 'transparent', color: _t, border: 'none', borderBottom: `1.5px solid ${_a}60`, borderRadius: 0, paddingLeft: 4, paddingRight: 4 }
                      : { backgroundColor: 'transparent', color: _t, border: `1px solid ${_a}50` }),
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                    KIRIM UCAPAN
                  </div>
                  {/* Input field preview */}
                  <div style={{
                    width: '80%', padding: _brd === 'sharp' ? '8px 0' : '8px 12px',
                    fontSize: 8, color: `${_t}50`, fontStyle: 'italic',
                    background: 'transparent', transition: 'all 0.25s',
                    ...(_brd === 'pill' ? { border: `1px solid ${_a}35`, borderRadius: 999 }
                      : _brd === 'rounded' ? { border: `1px solid ${_a}35`, borderRadius: 10 }
                      : { border: 'none', borderBottom: `1px solid ${_a}35`, borderRadius: 0 }),
                  }}>
                    Nama Anda...
                  </div>
                  {/* Card preview */}
                  <div style={{
                    width: '80%', padding: '10px 14px',
                    background: `${_a}08`, border: `1px solid ${_a}20`,
                    borderRadius: _brd === 'pill' ? 20 : _brd === 'rounded' ? 12 : 0,
                    fontSize: 7.5, color: `${_t}70`, lineHeight: 1.6,
                  }}>
                    Contoh card container untuk RSVP / ucapan section.
                  </div>
                </div>
              </div>

              {/*  Font Pairing  */}
              <details className="group">
                <summary className="flex items-center justify-between cursor-pointer select-none py-1 list-none [&::-webkit-details-marker]:hidden">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pasangan Font</p>
                    <p className="text-[9px] text-gray-400 mt-0.5">Kombinasi heading + body terkurasi   klik untuk buka</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400 transition-transform group-open:rotate-180 shrink-0" />
                </summary>
                <div className="grid grid-cols-1 gap-2 mt-3 mb-4">
                  {([
                    { heading: 'Playfair Display', body: 'Lato',                name: 'Classic Elegance',   desc: 'Serif mewah + sans-serif bersih' },
                    { heading: 'Cinzel',           body: 'Raleway',             name: 'Royal Formal',       desc: 'Romawi agung + modern ringan' },
                    { heading: 'Cormorant Garamond', body: 'Montserrat',        name: 'Refined Modern',     desc: 'Garamond halus + geometris tegas' },
                    { heading: 'Great Vibes',      body: 'Lato',                name: 'Romantic Script',    desc: 'Kaligrafi romantis + body netral' },
                    { heading: 'Bodoni Moda',      body: 'DM Sans',             name: 'High Fashion',       desc: 'Editorial mode + sans-serif kontemporer' },
                    { heading: 'Cinzel Decorative', body: 'EB Garamond',        name: 'Grand Luxury',       desc: 'Dekoratif megah + serif klasik' },
                    { heading: 'Alex Brush',       body: 'Cormorant Garamond',  name: 'Calligraphy Suite',  desc: 'Kaligrafi anggun + serif elegan' },
                    { heading: 'Italiana',         body: 'Spectral',            name: 'Italian Romance',    desc: 'Italia dramatis + serif hangat' },
                    { heading: 'Marcellus',        body: 'Lora',                name: 'Timeless Grace',     desc: 'Serif klasik + serif lembut' },
                    { heading: 'Prata',            body: 'Josefin Sans',        name: 'Chic Contrast',      desc: 'Didone tajam + sans geometris' },
                    { heading: 'Sacramento',       body: 'Work Sans',           name: 'Garden Party',       desc: 'Script kasual elegan + sans modern' },
                    { heading: 'Allura',           body: 'Crimson Text',        name: 'Dreamy Vintage',     desc: 'Script bermimpi + serif klasik' },
                    { heading: 'Gilda Display',    body: 'Nunito',              name: 'Art Deco',           desc: 'Display 1920-an + sans-serif lunak' },
                    { heading: 'Tenor Sans',       body: 'Gentium Book Plus',   name: 'Understated Luxe',   desc: 'Sans elegan + serif sastra' },
                    { heading: 'Cormorant SC',     body: 'Raleway',             name: 'Monumental',         desc: 'Small caps formal + sans ringan' },
                    { heading: 'Philosopher',      body: 'Source Serif 4',      name: 'Intellectual',       desc: 'Unik intelektual + serif modern' },
                  ] as const).map(pair => {
                    const active = cfg.meta.font.heading === pair.heading && cfg.meta.font.body === pair.body
                    return (
                      <button key={pair.name} type="button"
                        onClick={() => {
                          updateFont('heading', pair.heading)
                          updateFont('body', pair.body)
                          setPreviewKey(k => k + 1)
                          setDecorPreviewKey(k => k + 1)
                        }}
                        className={`relative text-left p-3 rounded-xl transition-all border ${
                          active
                            ? 'bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300/30 shadow-sm'
                            : 'bg-white border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className={`text-[10px] font-bold ${active ? 'text-indigo-700' : 'text-gray-600'}`}>{pair.name}</p>
                            <p className="text-[8px] text-gray-400 mt-0.5">{pair.desc}</p>
                          </div>
                          {active && (
                            <div className="w-4 h-4 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="mt-2 px-2 py-1.5 rounded-lg" style={{ backgroundColor: _p }}>
                          <p style={{ fontFamily: `'${pair.heading}', serif`, color: _t, fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>
                            {previewData.groom_name} &amp; {previewData.bride_name}
                          </p>
                          <p style={{ fontFamily: `'${pair.body}', sans-serif`, color: `${_t}99`, fontSize: 9, marginTop: 3, lineHeight: 1.5 }}>
                            Dengan memohon rahmat dan ridho Allah SWT
                          </p>
                        </div>
                        <div className="flex gap-1 mt-1.5">
                          <span className="text-[7px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">{pair.heading}</span>
                          <span className="text-[7px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">{pair.body}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </details>

              {/*  Custom Font Override  */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Pilih &amp; Atur Font
                </p>
                <p className="text-[9px] text-gray-400 mb-3">
                  Pilih dari daftar, atau tambahkan font sendiri via Google Fonts / upload file
                </p>
                <div className="space-y-4">

                  {/*  Font Judul  */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-gray-600">Font Judul</p>
                      <span className="text-[10px] italic" style={{ fontFamily: `'${cfg.meta.font.heading}', serif`, color: _a }}>{cfg.meta.font.heading}</span>
                    </div>
                    <select value={cfg.meta.font.heading} onChange={e => { updateFont('heading', e.target.value); setPreviewKey(k => k + 1); setDecorPreviewKey(k => k + 1) }} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white">
                      {(cfg.meta.font.custom_fonts ?? []).map(f => <option key={`c-${f.name}`} value={f.name}>★ {f.name}</option>)}
                      {HEADING_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>

                    <div className="flex items-center gap-2">
                      <p className="text-[9px] text-gray-500 shrink-0 w-12">Skala</p>
                      <input type="range" min={0.6} max={2.0} step={0.05}
                        value={cfg.meta.font.heading_scale ?? 1.0}
                        onChange={e => updateMeta({ font: { ...cfg.meta.font, heading_scale: Number(e.target.value) } })}
                        className="flex-1 accent-indigo-600 h-1.5" />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input type="number" min={60} max={200} step={5}
                          value={Math.round((cfg.meta.font.heading_scale ?? 1.0) * 100)}
                          onChange={e => { const v = Number(e.target.value) / 100; if (v >= 0.6 && v <= 2.0) updateMeta({ font: { ...cfg.meta.font, heading_scale: v } }) }}
                          className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                        <span className="text-[8px] text-gray-400">%</span>
                      </div>
                      {(cfg.meta.font.heading_scale ?? 1.0) !== 1.0 && (
                        <button onClick={() => updateMeta({ font: { ...cfg.meta.font, heading_scale: 1.0 } })}
                          className="text-[9px] text-gray-400 hover:text-indigo-500 shrink-0">↺</button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] text-gray-500 shrink-0 w-12">Tinggi</p>
                      <input type="range" min={0.8} max={2.0} step={0.05}
                        value={cfg.meta.font.heading_line_height ?? 1.15}
                        onChange={e => updateMeta({ font: { ...cfg.meta.font, heading_line_height: Number(e.target.value) } })}
                        className="flex-1 accent-indigo-600 h-1.5" />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input type="number" min={0.8} max={2.0} step={0.05}
                          value={cfg.meta.font.heading_line_height ?? 1.15}
                          onChange={e => { const v = Number(e.target.value); if (v >= 0.8 && v <= 2.0) updateMeta({ font: { ...cfg.meta.font, heading_line_height: v } }) }}
                          className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] text-gray-500 shrink-0 w-12">Spasi</p>
                      <input type="range" min={-0.05} max={0.3} step={0.01}
                        value={cfg.meta.font.heading_letter_spacing ?? 0}
                        onChange={e => updateMeta({ font: { ...cfg.meta.font, heading_letter_spacing: Number(e.target.value) } })}
                        className="flex-1 accent-indigo-600 h-1.5" />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input type="number" min={-0.05} max={0.3} step={0.01}
                          value={cfg.meta.font.heading_letter_spacing ?? 0}
                          onChange={e => { const v = Number(e.target.value); if (v >= -0.05 && v <= 0.3) updateMeta({ font: { ...cfg.meta.font, heading_letter_spacing: v } }) }}
                          className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                        <span className="text-[8px] text-gray-400">em</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] text-gray-500 shrink-0 w-12">Kata</p>
                      <input type="range" min={-0.05} max={0.5} step={0.01}
                        value={cfg.meta.font.heading_word_spacing ?? 0}
                        onChange={e => updateMeta({ font: { ...cfg.meta.font, heading_word_spacing: Number(e.target.value) } })}
                        className="flex-1 accent-indigo-600 h-1.5" />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input type="number" min={-0.05} max={0.5} step={0.01}
                          value={cfg.meta.font.heading_word_spacing ?? 0}
                          onChange={e => { const v = Number(e.target.value); if (v >= -0.05 && v <= 0.5) updateMeta({ font: { ...cfg.meta.font, heading_word_spacing: v } }) }}
                          className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                        <span className="text-[8px] text-gray-400">em</span>
                      </div>
                    </div>
                  </div>

                  {/*  Font Teks  */}
                  <div className="space-y-2 pt-3 border-t border-gray-50">
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-semibold text-gray-600">Font Teks</p>
                      <span className="text-[10px]" style={{ fontFamily: `'${cfg.meta.font.body}', sans-serif`, color: '#666' }}>{cfg.meta.font.body}</span>
                    </div>
                    <select value={cfg.meta.font.body} onChange={e => { updateFont('body', e.target.value); setPreviewKey(k => k + 1); setDecorPreviewKey(k => k + 1) }} className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white">
                      {(cfg.meta.font.custom_fonts ?? []).map(f => <option key={`c-${f.name}`} value={f.name}>★ {f.name}</option>)}
                      {BODY_FONTS.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>

                    <div className="flex items-center gap-2">
                      <p className="text-[9px] text-gray-500 shrink-0 w-12">Skala</p>
                      <input type="range" min={0.6} max={1.6} step={0.05}
                        value={cfg.meta.font.body_scale ?? 1.0}
                        onChange={e => updateMeta({ font: { ...cfg.meta.font, body_scale: Number(e.target.value) } })}
                        className="flex-1 accent-indigo-600 h-1.5" />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input type="number" min={60} max={160} step={5}
                          value={Math.round((cfg.meta.font.body_scale ?? 1.0) * 100)}
                          onChange={e => { const v = Number(e.target.value) / 100; if (v >= 0.6 && v <= 1.6) updateMeta({ font: { ...cfg.meta.font, body_scale: v } }) }}
                          className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                        <span className="text-[8px] text-gray-400">%</span>
                      </div>
                      {(cfg.meta.font.body_scale ?? 1.0) !== 1.0 && (
                        <button onClick={() => updateMeta({ font: { ...cfg.meta.font, body_scale: 1.0 } })}
                          className="text-[9px] text-gray-400 hover:text-indigo-500 shrink-0">↺</button>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] text-gray-500 shrink-0 w-12">Tinggi</p>
                      <input type="range" min={1.0} max={2.5} step={0.05}
                        value={cfg.meta.font.body_line_height ?? 1.65}
                        onChange={e => updateMeta({ font: { ...cfg.meta.font, body_line_height: Number(e.target.value) } })}
                        className="flex-1 accent-indigo-600 h-1.5" />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input type="number" min={1.0} max={2.5} step={0.05}
                          value={cfg.meta.font.body_line_height ?? 1.65}
                          onChange={e => { const v = Number(e.target.value); if (v >= 1.0 && v <= 2.5) updateMeta({ font: { ...cfg.meta.font, body_line_height: v } }) }}
                          className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] text-gray-500 shrink-0 w-12">Spasi</p>
                      <input type="range" min={-0.02} max={0.15} step={0.005}
                        value={cfg.meta.font.body_letter_spacing ?? 0}
                        onChange={e => updateMeta({ font: { ...cfg.meta.font, body_letter_spacing: Number(e.target.value) } })}
                        className="flex-1 accent-indigo-600 h-1.5" />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input type="number" min={-0.02} max={0.15} step={0.005}
                          value={cfg.meta.font.body_letter_spacing ?? 0}
                          onChange={e => { const v = Number(e.target.value); if (v >= -0.02 && v <= 0.15) updateMeta({ font: { ...cfg.meta.font, body_letter_spacing: v } }) }}
                          className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                        <span className="text-[8px] text-gray-400">em</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] text-gray-500 shrink-0 w-12">Kata</p>
                      <input type="range" min={-0.02} max={0.3} step={0.01}
                        value={cfg.meta.font.body_word_spacing ?? 0}
                        onChange={e => updateMeta({ font: { ...cfg.meta.font, body_word_spacing: Number(e.target.value) } })}
                        className="flex-1 accent-indigo-600 h-1.5" />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input type="number" min={-0.02} max={0.3} step={0.01}
                          value={cfg.meta.font.body_word_spacing ?? 0}
                          onChange={e => { const v = Number(e.target.value); if (v >= -0.02 && v <= 0.3) updateMeta({ font: { ...cfg.meta.font, body_word_spacing: v } }) }}
                          className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                        <span className="text-[8px] text-gray-400">em</span>
                      </div>
                    </div>
                  </div>

                  {/* Live preview with all typography settings */}
                  <div className="px-3 py-3 rounded-xl border border-gray-100" style={{ backgroundColor: _p }}>
                    <p style={{
                      fontFamily: `'${cfg.meta.font.heading}', serif`,
                      color: _t,
                      fontSize: `calc(18px * ${cfg.meta.font.heading_scale ?? 1.0})`,
                      fontWeight: 700,
                      lineHeight: cfg.meta.font.heading_line_height ?? 1.15,
                      letterSpacing: `${cfg.meta.font.heading_letter_spacing ?? 0}em`,
                      wordSpacing: `${cfg.meta.font.heading_word_spacing ?? 0}em`,
                      marginBottom: 6,
                    }}>
                      {previewData.groom_name} &amp; {previewData.bride_name}
                    </p>
                    <p style={{
                      fontFamily: `'${cfg.meta.font.body}', sans-serif`,
                      color: `${_t}88`,
                      fontSize: `calc(10px * ${cfg.meta.font.body_scale ?? 1.0})`,
                      lineHeight: cfg.meta.font.body_line_height ?? 1.65,
                      letterSpacing: `${cfg.meta.font.body_letter_spacing ?? 0}em`,
                      wordSpacing: `${cfg.meta.font.body_word_spacing ?? 0}em`,
                    }}>
                      Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir.
                    </p>
                  </div>

                  {/*  Tambah Font Custom  */}
                  <div className="pt-3 border-t border-gray-50">
                    <p className="text-[10px] font-semibold text-gray-600 mb-2">Tambah Font Sendiri</p>

                    {/* Method 1: Google Fonts name */}
                    <div className="space-y-2 mb-3">
                      <p className="text-[9px] text-gray-400">Ketik nama font dari Google Fonts lalu klik tambah</p>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          id="gf-font-input"
                          placeholder="Nama font, cth: Abril Fatface"
                          className="flex-1 text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.getElementById('gf-font-input') as HTMLInputElement
                            const name = input?.value?.trim()
                            if (!name) { toast.error('Ketik nama font'); return }
                            const existing = cfg.meta.font.custom_fonts ?? []
                            if (existing.some(f => f.name === name) || HEADING_FONTS.includes(name) || BODY_FONTS.includes(name)) {
                              toast.error('Font sudah ada di daftar'); return
                            }
                            const encoded = name.replace(/ /g, '+')
                            const url = `https://fonts.googleapis.com/css2?family=${encoded}:wght@300;400;600;700&display=swap`
                            const link = document.createElement('link')
                            link.rel = 'stylesheet'
                            link.href = url
                            link.setAttribute('data-gf-custom', name)
                            document.head.appendChild(link)
                            const updated = [...existing, { name, url, weight: '300;400;600;700' }]
                            updateMeta({ font: { ...cfg.meta.font, custom_fonts: updated } })
                            input.value = ''
                            toast.success(`Font "${name}" ditambahkan!`)
                          }}
                          className="px-3 py-2 bg-indigo-600 text-white text-[10px] font-semibold rounded-lg hover:bg-indigo-700 transition-colors shrink-0"
                        >
                          + Tambah
                        </button>
                      </div>
                    </div>

                    {/* Method 2: Upload font file */}
                    <div className="space-y-2 mb-3">
                      <p className="text-[9px] text-gray-400">Atau upload file font (.woff2, .ttf, .otf) maks 5MB</p>
                      <label className="flex items-center justify-center gap-2 px-3 py-2.5 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
                        <Upload className="w-3.5 h-3.5 text-gray-400" />
                        <span className="text-[10px] text-gray-500 font-medium">Upload File Font</span>
                        <input
                          type="file"
                          accept=".woff2,.woff,.ttf,.otf"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            e.target.value = ''
                            const ext = file.name.split('.').pop()?.toLowerCase()
                            if (!['woff2', 'woff', 'ttf', 'otf'].includes(ext ?? '')) {
                              toast.error('Format tidak didukung. Gunakan .woff2, .ttf, atau .otf'); return
                            }
                            if (file.size > 5 * 1024 * 1024) { toast.error('File terlalu besar (maks 5MB)'); return }
                            const fontName = file.name.replace(/\.(woff2?|ttf|otf)$/i, '').replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                            const toastId = toast.loading(`Uploading ${fontName}...`)
                            try {
                              const formData = new FormData()
                              formData.append('file', file)
                              formData.append('folder', 'fonts')
                              const res = await fetch('/api/admin/upload', { method: 'POST', body: formData })
                              const data = await res.json()
                              if (!res.ok) throw new Error(data.error ?? 'Upload gagal')
                              const fontUrl = data.url as string
                              const format = ext === 'woff2' ? 'woff2' : ext === 'woff' ? 'woff' : ext === 'ttf' ? 'truetype' : 'opentype'
                              const style = document.createElement('style')
                              style.textContent = `@font-face { font-family: '${fontName}'; src: url('${fontUrl}') format('${format}'); font-display: swap; }`
                              document.head.appendChild(style)
                              const existing = cfg.meta.font.custom_fonts ?? []
                              const updated = [...existing, { name: fontName, url: fontUrl }]
                              updateMeta({ font: { ...cfg.meta.font, custom_fonts: updated } })
                              toast.success(`Font "${fontName}" berhasil diupload!`, { id: toastId })
                            } catch (err) {
                              toast.error((err as Error).message, { id: toastId })
                            }
                          }}
                        />
                      </label>
                    </div>

                    {/* List custom fonts */}
                    {(cfg.meta.font.custom_fonts ?? []).length > 0 && (
                      <div className="space-y-1">
                        <p className="text-[9px] text-gray-400 mb-1">Font yang ditambahkan:</p>
                        {(cfg.meta.font.custom_fonts ?? []).map((cf, i) => (
                          <div key={i} className="flex items-center justify-between px-2.5 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-[9px] text-amber-500 shrink-0">★</span>
                              <span className="text-[10px] font-medium text-gray-700 truncate" style={{ fontFamily: `'${cf.name}', serif` }}>{cf.name}</span>
                              <span className="text-[8px] text-gray-400 shrink-0">{cf.url.includes('googleapis') ? 'Google' : 'Upload'}</span>
                            </div>
                            <button
                              onClick={() => {
                                const updated = (cfg.meta.font.custom_fonts ?? []).filter((_, j) => j !== i)
                                updateMeta({ font: { ...cfg.meta.font, custom_fonts: updated } })
                                toast.success(`Font "${cf.name}" dihapus`)
                              }}
                              className="text-gray-300 hover:text-red-400 shrink-0 ml-2"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>
              </div>

              {/* Button Variant */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Gaya Tombol
                </p>
                <p className="text-[9px] text-gray-400 mb-3">
                  Berlaku untuk semua tombol: RSVP, ucapan, maps, transfer, opening, dsb
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { id: 'outlined',  label: 'Outlined',  desc: 'Garis tepi' },
                    { id: 'filled',    label: 'Filled',    desc: 'Solid penuh' },
                    { id: 'pill',      label: 'Pill',      desc: 'Kapsul blur' },
                    { id: 'ghost',     label: 'Ghost',     desc: 'Transparan' },
                    { id: 'underline', label: 'Underline', desc: 'Garis bawah' },
                  ] as const).map(bv => {
                    const active = (_cs?.button ?? 'outlined') === bv.id
                    const _iconSvg = <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/></svg>
                    const _swatchStyle: React.CSSProperties =
                      bv.id === 'filled' ? { padding: '5px 12px', background: _a, borderRadius: _br, fontSize: 7.5, color: _t, letterSpacing: '0.12em' }
                      : bv.id === 'pill' ? { padding: '5px 12px', border: `1.5px solid ${_a}80`, borderRadius: 999, fontSize: 7.5, color: _t, letterSpacing: '0.12em', background: `${_a}20` }
                      : bv.id === 'ghost' ? { padding: '5px 12px', fontSize: 7.5, color: _a, letterSpacing: '0.12em' }
                      : bv.id === 'underline' ? { padding: '5px 6px', borderBottom: `2px solid ${_a}`, borderRadius: 0, fontSize: 7.5, color: _t, letterSpacing: '0.12em' }
                      : { padding: '5px 12px', border: `1.5px solid ${_a}`, borderRadius: _br, fontSize: 7.5, color: _t, letterSpacing: '0.12em' }
                    return (
                      <button key={bv.id} type="button"
                        onClick={() => _updateStyle({ button: bv.id })}
                        className={`relative p-3 rounded-xl text-center transition-all ${
                          active
                            ? 'bg-indigo-50 border-2 border-indigo-500 ring-1 ring-indigo-500/20'
                            : 'bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <div className="mx-auto mb-2 flex items-center justify-center" style={{ height: 32, background: _p, borderRadius: 8, padding: '0 6px' }}>
                          <div className="flex items-center gap-1.5" style={_swatchStyle}>
                            {_iconSvg}
                            <span>BUKA</span>
                          </div>
                        </div>
                        <p className={`text-[10px] font-semibold leading-tight ${active ? 'text-indigo-700' : 'text-gray-600'}`}>
                          {bv.label}
                        </p>
                        <p className="text-[8px] text-gray-400 mt-0.5">{bv.desc}</p>
                        {active && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-indigo-500 flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Border Variant */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Gaya Sudut / Border
                </p>
                <p className="text-[9px] text-gray-400 mb-3">
                  Pengaruh pada tombol, kartu, input, dan container
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { id: 'sharp',   label: 'Sharp',   desc: 'Sudut tajam', r: '2px', cr: '0px' },
                    { id: 'rounded', label: 'Rounded', desc: 'Sudut bulat', r: '10px', cr: '12px' },
                    { id: 'pill',    label: 'Pill',    desc: 'Super bulat', r: '999px', cr: '20px' },
                  ] as const).map(brd => {
                    const active = (_cs?.border ?? 'sharp') === brd.id
                    return (
                      <button key={brd.id} type="button"
                        onClick={() => _updateStyle({ border: brd.id })}
                        className={`relative p-3 rounded-xl text-center transition-all ${
                          active
                            ? 'bg-indigo-50 border-2 border-indigo-500 ring-1 ring-indigo-500/20'
                            : 'bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <div className="mx-auto mb-2 flex flex-col items-center gap-1.5" style={{ height: 32 }}>
                          <div style={{
                            width: 48, height: 14,
                            border: `1.5px solid ${_a}`,
                            borderRadius: brd.r,
                            background: `${_a}15`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 5.5, color: _t, letterSpacing: '0.1em',
                          }}>BTN</div>
                          <div style={{
                            width: 48, height: 14,
                            border: `1px solid ${_a}30`,
                            borderRadius: brd.cr,
                            background: `${_a}08`,
                          }} />
                        </div>
                        <p className={`text-[10px] font-semibold leading-tight ${active ? 'text-indigo-700' : 'text-gray-600'}`}>
                          {brd.label}
                        </p>
                        <p className="text-[8px] text-gray-400 mt-0.5">{brd.desc}</p>
                        {active && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-indigo-500 flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Ornament Variant */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Gaya Ornamen
                </p>
                <p className="text-[9px] text-gray-400 mb-3">
                  Ornamen dekoratif pada section undangan
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { id: 'classic',   label: 'Classic',   desc: 'Klasik elegan' },
                    { id: 'minimal',   label: 'Minimal',   desc: 'Bersih simple' },
                    { id: 'floral',    label: 'Floral',    desc: 'Motif bunga' },
                    { id: 'geometric', label: 'Geometric', desc: 'Bentuk geometri' },
                    { id: 'none',      label: 'Tanpa',     desc: 'Tanpa ornamen' },
                  ] as const).map(orn => {
                    const active = (_cs?.ornament ?? 'classic') === orn.id
                    return (
                      <button key={orn.id} type="button"
                        onClick={() => _updateStyle({ ornament: orn.id })}
                        className={`relative p-3 rounded-xl text-center transition-all ${
                          active
                            ? 'bg-indigo-50 border-2 border-indigo-500 ring-1 ring-indigo-500/20'
                            : 'bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <p className={`text-[10px] font-semibold leading-tight ${active ? 'text-indigo-700' : 'text-gray-600'}`}>
                          {orn.label}
                        </p>
                        <p className="text-[8px] text-gray-400 mt-0.5">{orn.desc}</p>
                        {active && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-indigo-500 flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Info */}
              <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                <p className="text-[10px] text-blue-700 leading-relaxed">
                  <strong>Info:</strong> Gaya komponen berlaku secara global untuk seluruh section undangan termasuk tombol RSVP, ucapan, maps, transfer, opening, dan download IG Story.
                  Lihat perubahan langsung di mockup preview.
                </p>
              </div>

            </div>
          )})()}

          {/*  Opening  */}
          {activeTab === 'opening' && (
            <div className="space-y-5">

              {/*  Pilih Gaya Opening  */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Gaya Tampilan
                </p>
                <p className="text-[9px] text-gray-400 mb-3">
                  Pilih gaya tampilan animasi saat tamu pertama kali membuka undangan
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {OPENING_TYPES.map(ot => {
                    const m = OPENING_META[ot]
                    const active = cfg.opening.type === ot
                    return (
                      <button key={ot} type="button"
                        onClick={() => { updateOpening({ type: ot as any }); setPreviewMode('opening'); setDecorPreviewKey(k => k + 1) }}
                        className={`relative p-2.5 rounded-xl text-center transition-all ${
                          active
                            ? 'bg-indigo-50 border-2 border-indigo-500 ring-1 ring-indigo-500/20'
                            : 'bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-lg block mb-0.5">{m?.icon}</span>
                        <p className={`text-[10px] font-semibold leading-tight ${active ? 'text-indigo-700' : 'text-gray-600'}`}>
                          {m?.label ?? ot}
                        </p>
                        {active && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-indigo-500 flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/*  Opening Content  */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Konten Opening
                </p>

                <div className="space-y-4">

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

              {/*  Data Preview Nama  */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Data Preview
                </p>
                <div className="space-y-2">
                  <Field label="Nama Mempelai Pria">
                    <input type="text" value={previewData.groom_name}
                      onChange={e => setPreviewData(d => ({ ...d, groom_name: e.target.value }))}
                      placeholder="Nama pria..."
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                  </Field>
                  <Field label="Nama Mempelai Wanita">
                    <input type="text" value={previewData.bride_name}
                      onChange={e => setPreviewData(d => ({ ...d, bride_name: e.target.value }))}
                      placeholder="Nama wanita..."
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                  </Field>
                  <Field label="Nama Tamu Preview">
                    <input type="text" value={previewGuestName}
                      onChange={e => setPreviewGuestName(e.target.value)}
                      placeholder="Nama tamu contoh..."
                      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-400" />
                  </Field>
                </div>
              </div>

              {/*  Typography & Layout  */}
              <div className="pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Tipografi &amp; Layout
                </p>
                <div className="space-y-4">

                  <Field label="Ukuran Font Salam">
                    <div className="flex items-center gap-2">
                      <input type="range" min={8} max={20} step={0.5}
                        value={cfg.opening.greeting_font_size ?? 11}
                        onChange={e => updateOpening({ greeting_font_size: Number(e.target.value) })}
                        className="flex-1 accent-indigo-600"
                      />
                      <div className="flex items-center gap-1">
                        <input type="number" min={8} max={20} step={0.5}
                          value={cfg.opening.greeting_font_size ?? 11}
                          onChange={e => { const v = Number(e.target.value); if (v >= 8 && v <= 20) updateOpening({ greeting_font_size: v }) }}
                          className="w-14 px-1.5 py-1 text-xs text-center border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none"
                        />
                        <span className="text-[9px] text-gray-400">px</span>
                      </div>
                    </div>
                  </Field>

                  <Field label="Ukuran Font Nama">
                    <div className="flex items-center gap-2">
                      <input type="range" min={18} max={50} step={1}
                        value={cfg.opening.couple_name_font_size ?? 32}
                        onChange={e => updateOpening({ couple_name_font_size: Number(e.target.value) })}
                        className="flex-1 accent-indigo-600"
                      />
                      <div className="flex items-center gap-1">
                        <input type="number" min={18} max={50}
                          value={cfg.opening.couple_name_font_size ?? 32}
                          onChange={e => { const v = Number(e.target.value); if (v >= 18 && v <= 50) updateOpening({ couple_name_font_size: v }) }}
                          className="w-14 px-1.5 py-1 text-xs text-center border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none"
                        />
                        <span className="text-[9px] text-gray-400">px</span>
                      </div>
                    </div>
                  </Field>

                  <Field label="Letter Spacing">
                    <div className="flex items-center gap-2">
                      <input type="range" min={0} max={0.25} step={0.01}
                        value={cfg.opening.couple_name_letter_spacing ?? 0.08}
                        onChange={e => updateOpening({ couple_name_letter_spacing: Number(e.target.value) })}
                        className="flex-1 accent-indigo-600"
                      />
                      <div className="flex items-center gap-1">
                        <input type="number" min={0} max={0.25} step={0.01}
                          value={cfg.opening.couple_name_letter_spacing ?? 0.08}
                          onChange={e => { const v = Number(e.target.value); if (v >= 0 && v <= 0.25) updateOpening({ couple_name_letter_spacing: v }) }}
                          className="w-16 px-1.5 py-1 text-xs text-center border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none"
                        />
                        <span className="text-[9px] text-gray-400">em</span>
                      </div>
                    </div>
                  </Field>

                  <Field label="Gaya Huruf Nama">
                    <div className="grid grid-cols-2 gap-1.5">
                      {([
                        { key: 'uppercase', label: 'UPPERCASE', desc: 'SEMUA KAPITAL' },
                        { key: 'capitalize', label: 'Capitalize', desc: 'Huruf Awal Besar' },
                        { key: 'lowercase', label: 'lowercase', desc: 'semua kecil' },
                        { key: 'none', label: 'Asli', desc: 'Sesuai input' },
                      ] as const).map(opt => {
                        const current = cfg.opening.couple_name_text_transform ?? (cfg.opening.couple_name_uppercase !== false ? 'uppercase' : 'none')
                        const active = current === opt.key
                        return (
                          <button key={opt.key} type="button"
                            onClick={() => updateOpening({ couple_name_text_transform: opt.key, couple_name_uppercase: opt.key === 'uppercase' })}
                            className={`px-2 py-2 rounded-xl text-center transition-all border ${
                              active
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                                : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                            }`}
                          >
                            <p className="text-[11px] font-bold">{opt.label}</p>
                            <p className="text-[8px] text-gray-400 mt-0.5">{opt.desc}</p>
                          </button>
                        )
                      })}
                    </div>
                  </Field>

                  <Field label="Ukuran Tombol">
                    <select
                      value={cfg.opening.button_size ?? 'lg'}
                      onChange={e => updateOpening({ button_size: e.target.value as 'sm' | 'md' | 'lg' })}
                      className={inputCls}
                    >
                      <option value="sm">Kecil</option>
                      <option value="md">Sedang</option>
                      <option value="lg">Besar</option>
                    </select>
                  </Field>

                  <Field label="Padding Horizontal">
                    <div className="flex items-center gap-2">
                      <input type="range" min={12} max={56} step={2}
                        value={cfg.opening.content_padding_x ?? 28}
                        onChange={e => updateOpening({ content_padding_x: Number(e.target.value) })}
                        className="flex-1 accent-indigo-600"
                      />
                      <div className="flex items-center gap-1">
                        <input type="number" min={12} max={56} step={2}
                          value={cfg.opening.content_padding_x ?? 28}
                          onChange={e => { const v = Number(e.target.value); if (v >= 12 && v <= 56) updateOpening({ content_padding_x: v }) }}
                          className="w-14 px-1.5 py-1 text-xs text-center border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none"
                        />
                        <span className="text-[9px] text-gray-400">px</span>
                      </div>
                    </div>
                  </Field>

                  <Field label="Padding Bawah">
                    <div className="flex items-center gap-2">
                      <input type="range" min={16} max={80} step={2}
                        value={cfg.opening.content_padding_bottom ?? 48}
                        onChange={e => updateOpening({ content_padding_bottom: Number(e.target.value) })}
                        className="flex-1 accent-indigo-600"
                      />
                      <div className="flex items-center gap-1">
                        <input type="number" min={16} max={80} step={2}
                          value={cfg.opening.content_padding_bottom ?? 48}
                          onChange={e => { const v = Number(e.target.value); if (v >= 16 && v <= 80) updateOpening({ content_padding_bottom: v }) }}
                          className="w-14 px-1.5 py-1 text-xs text-center border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none"
                        />
                        <span className="text-[9px] text-gray-400">px</span>
                      </div>
                    </div>
                  </Field>

                  <Field label="Label Tamu">
                    <input
                      value={cfg.opening.guest_label ?? 'KEPADA YTH.'}
                      onChange={e => updateOpening({ guest_label: e.target.value || undefined })}
                      className={inputCls}
                      placeholder="KEPADA YTH."
                    />
                  </Field>

                  <Field label="Ukuran Font Label Tamu">
                    <div className="flex items-center gap-2">
                      <input type="range" min={6} max={14} step={0.5}
                        value={cfg.opening.guest_label_font_size ?? 8.5}
                        onChange={e => updateOpening({ guest_label_font_size: Number(e.target.value) })}
                        className="flex-1 accent-indigo-600"
                      />
                      <div className="flex items-center gap-1">
                        <input type="number" min={6} max={14} step={0.5}
                          value={cfg.opening.guest_label_font_size ?? 8.5}
                          onChange={e => { const v = Number(e.target.value); if (v >= 6 && v <= 14) updateOpening({ guest_label_font_size: v }) }}
                          className="w-14 px-1.5 py-1 text-xs text-center border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-none"
                        />
                        <span className="text-[9px] text-gray-400">px</span>
                      </div>
                    </div>
                  </Field>

                  <Field label="Gaya Pembatas">
                    <div className="grid grid-cols-3 gap-1.5">
                      {([
                        { key: 'diamond', label: '◆ Diamond' },
                        { key: 'dot', label: '● Dot' },
                        { key: 'line', label: '― Line' },
                        { key: 'floral', label: '❦ Floral' },
                        { key: 'star', label: '✦ Star' },
                        { key: 'wave', label: '〰 Wave' },
                      ] as const).map(s => {
                        const active = (cfg.opening.separator_style ?? 'diamond') === s.key
                        return (
                          <button key={s.key} type="button"
                            onClick={() => updateOpening({ separator_style: s.key })}
                            className={`px-2 py-2 rounded-xl text-[10px] font-semibold transition-all border text-center ${
                              active
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-gray-50 text-gray-500 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                            }`}>
                            {s.label}
                          </button>
                        )
                      })}
                    </div>
                  </Field>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Pembatas Atas</p>
                      <p className="text-[10px] text-gray-400">Garis ornamen setelah salam pembuka</p>
                    </div>
                    <button
                      onClick={() => updateOpening({ show_top_separator: cfg.opening.show_top_separator === false ? true : false })}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                        cfg.opening.show_top_separator !== false ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        cfg.opening.show_top_separator !== false ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <div>
                      <p className="text-xs font-semibold text-gray-500">Pembatas Bawah</p>
                      <p className="text-[10px] text-gray-400">Ornamen diamond sebelum nama pasangan</p>
                    </div>
                    <button
                      onClick={() => updateOpening({ show_bottom_separator: cfg.opening.show_bottom_separator === false ? true : false })}
                      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                        cfg.opening.show_bottom_separator !== false ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                        cfg.opening.show_bottom_separator !== false ? 'translate-x-[18px]' : 'translate-x-0.5'
                      }`} />
                    </button>
                  </div>

                  <Field label="Gaya Penghubung Nama">
                    <p className="text-[10px] text-gray-400 mb-2">Simbol antara nama mempelai pria & wanita</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      {([
                        { key: 'ampersand', label: '& Ampersand' },
                        { key: 'heart', label: '♥ Heart' },
                        { key: 'dot', label: '● Dot' },
                        { key: 'dash', label: '  Dash' },
                        { key: 'ring', label: '◎ Ring' },
                        { key: 'flower', label: '✿ Flower' },
                      ] as const).map(s => {
                        const active = (cfg.opening.couple_name_connector ?? 'ampersand') === s.key
                        return (
                          <button key={s.key} type="button"
                            onClick={() => updateOpening({ couple_name_connector: s.key })}
                            className={`px-2 py-2 rounded-xl text-[10px] font-semibold transition-all border text-center ${
                              active
                                ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm'
                                : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'
                            }`}
                          >
                            {s.label}
                          </button>
                        )
                      })}
                    </div>
                  </Field>

                  <Field label="Ukuran Penghubung">
                    <div className="flex items-center gap-2">
                      <input type="range" min={14} max={40} step={1}
                        value={cfg.opening.couple_name_connector_size ?? 26}
                        onChange={e => updateOpening({ couple_name_connector_size: Number(e.target.value) })}
                        className="flex-1 accent-indigo-600 h-1.5" />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input type="number" min={14} max={40} step={1}
                          value={cfg.opening.couple_name_connector_size ?? 26}
                          onChange={e => { const v = Number(e.target.value); if (v >= 14 && v <= 40) updateOpening({ couple_name_connector_size: v }) }}
                          className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                        <span className="text-[8px] text-gray-400">px</span>
                      </div>
                    </div>
                  </Field>

                  <Field label="Jarak Nama (px)">
                    <div className="flex items-center gap-2">
                      <input type="range" min={0} max={24} step={1}
                        value={cfg.opening.couple_name_gap ?? 3}
                        onChange={e => updateOpening({ couple_name_gap: Number(e.target.value) })}
                        className="flex-1 accent-indigo-600 h-1.5" />
                      <div className="flex items-center gap-0.5 shrink-0">
                        <input type="number" min={0} max={24} step={1}
                          value={cfg.opening.couple_name_gap ?? 3}
                          onChange={e => { const v = Number(e.target.value); if (v >= 0 && v <= 24) updateOpening({ couple_name_gap: v }) }}
                          className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                        <span className="text-[8px] text-gray-400">px</span>
                      </div>
                    </div>
                  </Field>

                </div>
              </div>

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
                      <Field label="Opacity Foto">
                        <div className="flex items-center gap-2">
                          <input type="range" min={5} max={80} step={5}
                            value={cfg.opening.cover_photo_opacity ?? 40}
                            onChange={e => updateOpening({ cover_photo_opacity: Number(e.target.value) })}
                            className="flex-1 accent-indigo-600 h-1.5"
                          />
                          <div className="flex items-center gap-0.5 shrink-0">
                            <input type="number" min={5} max={80} step={5}
                              value={cfg.opening.cover_photo_opacity ?? 40}
                              onChange={e => { const v = Number(e.target.value); if (v >= 5 && v <= 80) updateOpening({ cover_photo_opacity: v }) }}
                              className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                            <span className="text-[8px] text-gray-400">%</span>
                          </div>
                        </div>
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
                      <Field label="Tebal Gradasi Bawah">
                        <div className="flex items-center gap-2">
                          <input type="range" min={20} max={90} step={5}
                            value={cfg.opening.cover_gradient_height ?? 55}
                            onChange={e => updateOpening({ cover_gradient_height: Number(e.target.value) })}
                            className="flex-1 accent-indigo-600 h-1.5"
                          />
                          <div className="flex items-center gap-0.5 shrink-0">
                            <input type="number" min={20} max={90} step={5}
                              value={cfg.opening.cover_gradient_height ?? 55}
                              onChange={e => { const v = Number(e.target.value); if (v >= 20 && v <= 90) updateOpening({ cover_gradient_height: v }) }}
                              className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                            <span className="text-[8px] text-gray-400">%</span>
                          </div>
                        </div>
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

              {/*  Petal Fall Attributes (hanya tampil saat type = petal-fall)  */}
              {cfg.opening.type === 'petal-fall' && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                    Pengaturan Petal Fall
                  </p>
                  <p className="text-[9px] text-gray-400 mb-3">
                    Sesuaikan efek kelopak jatuh, glow tombol, dan Ken Burns
                  </p>
                  <div className="space-y-3 bg-pink-50/50 border border-pink-200/40 rounded-xl p-3">

                    {/* Petal Count */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-gray-600">Jumlah Kelopak</span>
                        <span className="text-[10px] text-gray-400 tabular-nums">{cfg.opening.petal_count ?? 22}</span>
                      </div>
                      <input type="range" min={5} max={50} step={1}
                        value={cfg.opening.petal_count ?? 22}
                        onChange={e => updateOpening({ petal_count: Number(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none accent-pink-500"
                      />
                    </div>

                    {/* Petal Speed */}
                    <div>
                      <span className="text-[10px] font-semibold text-gray-600 block mb-1">Kecepatan Jatuh</span>
                      <div className="flex gap-1.5">
                        {(['slow', 'normal', 'fast'] as const).map(sp => (
                          <button key={sp} type="button"
                            onClick={() => updateOpening({ petal_speed: sp })}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                              (cfg.opening.petal_speed ?? 'normal') === sp
                                ? 'bg-pink-500 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {sp === 'slow' ? 'Lambat' : sp === 'normal' ? 'Normal' : 'Cepat'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Petal Size */}
                    <div>
                      <span className="text-[10px] font-semibold text-gray-600 block mb-1">Ukuran Kelopak</span>
                      <div className="flex gap-1.5">
                        {(['sm', 'md', 'lg'] as const).map(sz => (
                          <button key={sz} type="button"
                            onClick={() => updateOpening({ petal_size: sz })}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                              (cfg.opening.petal_size ?? 'md') === sz
                                ? 'bg-pink-500 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {sz === 'sm' ? 'Kecil' : sz === 'md' ? 'Sedang' : 'Besar'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Petal Shape */}
                    <div>
                      <span className="text-[10px] font-semibold text-gray-600 block mb-1">Bentuk Partikel</span>
                      <div className="grid grid-cols-4 gap-1.5">
                        {([
                          { id: 'petal', label: 'Kelopak', icon: '🌷' },
                          { id: 'sakura', label: 'Sakura', icon: '🌸' },
                          { id: 'leaf', label: 'Daun', icon: '🍃' },
                          { id: 'snowflake', label: 'Salju', icon: '❄️' },
                        ] as const).map(sh => (
                          <button key={sh.id} type="button"
                            onClick={() => updateOpening({ petal_shape: sh.id })}
                            className={`py-2 rounded-lg text-center transition-all ${
                              (cfg.opening.petal_shape ?? 'petal') === sh.id
                                ? 'bg-pink-500 text-white shadow-sm' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <span className="text-sm block">{sh.icon}</span>
                            <span className="text-[8px] font-bold">{sh.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Petal Opacity */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-gray-600">Opacity Kelopak</span>
                        <span className="text-[10px] text-gray-400 tabular-nums">{cfg.opening.petal_opacity ?? 30}%</span>
                      </div>
                      <input type="range" min={5} max={80} step={1}
                        value={cfg.opening.petal_opacity ?? 30}
                        onChange={e => updateOpening({ petal_opacity: Number(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none accent-pink-500"
                      />
                    </div>

                    {/* Petal Sway */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-gray-600">Intensitas Ayunan</span>
                        <span className="text-[10px] text-gray-400 tabular-nums">{cfg.opening.petal_sway ?? 50}%</span>
                      </div>
                      <input type="range" min={0} max={100} step={5}
                        value={cfg.opening.petal_sway ?? 50}
                        onChange={e => updateOpening({ petal_sway: Number(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none accent-pink-500"
                      />
                    </div>

                    {/* Petal Color */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-gray-600">Warna Kelopak</span>
                        <span className="text-[10px] text-gray-400">Kosongkan = warna aksen</span>
                      </div>
                      <div className="flex gap-2 items-center">
                        <input type="color"
                          value={cfg.opening.petal_color ?? cfg.meta.color_scheme.accent}
                          onChange={e => updateOpening({ petal_color: e.target.value })}
                          className="w-8 h-8 rounded-lg border border-gray-200 cursor-pointer"
                        />
                        <input type="text"
                          value={cfg.opening.petal_color ?? ''}
                          onChange={e => updateOpening({ petal_color: e.target.value || undefined })}
                          placeholder="auto (accent)"
                          className="flex-1 px-2 py-1.5 text-[10px] bg-white border border-gray-200 rounded-lg"
                        />
                      </div>
                    </div>

                    {/* Scrim Opacity */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-gray-600">Kegelapan Overlay</span>
                        <span className="text-[10px] text-gray-400 tabular-nums">{cfg.opening.scrim_opacity ?? 33}%</span>
                      </div>
                      <input type="range" min={0} max={80} step={1}
                        value={cfg.opening.scrim_opacity ?? 33}
                        onChange={e => updateOpening({ scrim_opacity: Number(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none accent-gray-500"
                      />
                    </div>

                    {/* Toggles row */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* Button Glow */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <button type="button"
                          onClick={() => updateOpening({ show_button_glow: cfg.opening.show_button_glow === false ? true : false })}
                          className={`w-9 h-5 rounded-full transition-colors relative ${
                            cfg.opening.show_button_glow !== false ? 'bg-pink-500' : 'bg-gray-200'
                          }`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            cfg.opening.show_button_glow !== false ? 'translate-x-[18px]' : 'translate-x-0.5'
                          }`} />
                        </button>
                        <span className="text-[10px] font-semibold text-gray-600">Glow Tombol</span>
                      </label>

                      {/* Scroll Hint */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <button type="button"
                          onClick={() => updateOpening({ show_scroll_hint: cfg.opening.show_scroll_hint === false ? true : false })}
                          className={`w-9 h-5 rounded-full transition-colors relative ${
                            cfg.opening.show_scroll_hint !== false ? 'bg-pink-500' : 'bg-gray-200'
                          }`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            cfg.opening.show_scroll_hint !== false ? 'translate-x-[18px]' : 'translate-x-0.5'
                          }`} />
                        </button>
                        <span className="text-[10px] font-semibold text-gray-600">Scroll Hint</span>
                      </label>

                      {/* Ken Burns */}
                      <label className="flex items-center gap-2 cursor-pointer">
                        <button type="button"
                          onClick={() => updateOpening({ ken_burns_enabled: cfg.opening.ken_burns_enabled === false ? true : false })}
                          className={`w-9 h-5 rounded-full transition-colors relative ${
                            cfg.opening.ken_burns_enabled !== false ? 'bg-pink-500' : 'bg-gray-200'
                          }`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            cfg.opening.ken_burns_enabled !== false ? 'translate-x-[18px]' : 'translate-x-0.5'
                          }`} />
                        </button>
                        <span className="text-[10px] font-semibold text-gray-600">Ken Burns</span>
                      </label>
                    </div>

                    {/* Ken Burns Speed (only if enabled) */}
                    {cfg.opening.ken_burns_enabled !== false && (
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] font-semibold text-gray-600">Ken Burns Durasi</span>
                          <span className="text-[10px] text-gray-400 tabular-nums">{cfg.opening.ken_burns_speed ?? 20}s</span>
                        </div>
                        <input type="range" min={8} max={40} step={2}
                          value={cfg.opening.ken_burns_speed ?? 20}
                          onChange={e => updateOpening({ ken_burns_speed: Number(e.target.value) })}
                          className="w-full h-1.5 bg-gray-200 rounded-full appearance-none accent-pink-500"
                        />
                      </div>
                    )}

                    {/* Exit Blur */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-semibold text-gray-600">Exit Blur</span>
                        <span className="text-[10px] text-gray-400 tabular-nums">{cfg.opening.exit_blur ?? 12}px</span>
                      </div>
                      <input type="range" min={0} max={30} step={1}
                        value={cfg.opening.exit_blur ?? 12}
                        onChange={e => updateOpening({ exit_blur: Number(e.target.value) })}
                        className="w-full h-1.5 bg-gray-200 rounded-full appearance-none accent-gray-500"
                      />
                    </div>

                  </div>
                </div>
              )}

            </div>
          )}

          {/*  Dekorasi  */}
          {activeTab === 'decor' && (() => {
            const isOpening = decorScope === 'opening'
            const scopeSection = !isOpening ? cfg.sections.find(s => s.id === decorScope) : null
            const scopeAssets: DecorationAsset[] = isOpening
              ? (cfg.opening.decoration_assets ?? [])
              : (scopeSection?.decoration_assets ?? [])
            const scopeLabel = isOpening ? 'Opening' : (scopeSection ? (SECTION_LABELS[scopeSection.type] || scopeSection.type) : ' ')

            const updateScopeAssets = (newAssets: DecorationAsset[]) => {
              if (isOpening) updateOpening({ decoration_assets: newAssets })
              else if (scopeSection) updateSection(scopeSection.id, { decoration_assets: newAssets })
            }

            const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0]
              if (!file) return
              const fd = new FormData()
              fd.append('file', file)
              fd.append('folder', 'decorations')
              const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
              const data = await res.json()
              if (!res.ok) { alert(data.error); return }
              const newAsset: DecorationAsset = {
                id: 'deco-' + Date.now().toString(36),
                url: data.url, label: file.name.replace(/\.[^.]+$/, ''),
                position: 'top-left', width: 80, scale: 1, opacity: 100,
                offset_x: 155, offset_y: 380,
                animation: 'fade-in', animation_delay: 200,
                exit_animation: 'none', exit_delay: 0,
                idle_animation: 'none', z_layer: scopeAssets.length,
              }
              updateScopeAssets([...scopeAssets, newAsset])
              setSelectedAssetId(newAsset.id)
              e.target.value = ''
            }

            return (
            <div className="space-y-4">

              {/* Scope selector */}
              <div>
                <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">Dekorasi untuk</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => { setDecorScope('opening'); setSelectedAssetId(null); setPreviewMode('opening'); setDecorEditMode(true) }}
                    className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                      isOpening ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Opening
                  </button>
                  {sections.filter(s => s.enabled).map(s => (
                    <button
                      key={s.id}
                      onClick={() => {
                        setDecorScope(s.id); setSelectedAssetId(null); setDecorEditMode(false)
                        setPreviewMode('invitation')
                        setSectionReplay({ id: s.id, key: Date.now() })
                      }}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                        decorScope === s.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {SECTION_LABELS[s.type] || s.type}
                      {(s.decoration_assets?.length ?? 0) > 0 && (
                        <span className="ml-1 text-[8px] opacity-70">({s.decoration_assets!.length})</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Upload + Moodboard controls */}
              <div className="flex items-center gap-2">
                <label className="flex-1 flex items-center justify-center gap-1.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border-2 border-dashed border-indigo-300 cursor-pointer rounded-xl py-3 hover:bg-indigo-100 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Upload ke {scopeLabel}
                  <input type="file" accept="image/*" className="hidden" onChange={handleUpload} />
                </label>
                {isOpening && (
                  <button
                    onClick={() => { setDecorEditMode(!decorEditMode); setPreviewMode('opening') }}
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-4 py-3 rounded-xl transition-all ${
                      decorEditMode
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Move className="w-3.5 h-3.5" />
                    {decorEditMode ? 'Moodboard ON' : 'Moodboard'}
                  </button>
                )}
              </div>

              {isOpening && decorEditMode && (
                <div className="px-3 py-2 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-2">
                  <Move className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <p className="text-[9px] text-indigo-700 leading-relaxed">
                    Drag aset langsung di mockup. Klik untuk memilih, lalu atur di panel bawah.
                  </p>
                </div>
              )}

              {/* Asset grid */}
              {scopeAssets.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-xl py-10 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-indigo-50 flex items-center justify-center">
                    <Layers className="w-6 h-6 text-indigo-400" />
                  </div>
                  <p className="text-xs font-semibold text-gray-500">Belum ada aset dekorasi</p>
                  <p className="text-[10px] text-gray-400 mt-1">Upload ornamen, bunga, kipas, frame untuk {scopeLabel}</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    {scopeAssets.map(asset => (
                      <button
                        key={asset.id}
                        onClick={() => setSelectedAssetId(asset.id === selectedAssetId ? null : asset.id)}
                        className={`relative w-14 h-14 rounded-xl border-2 overflow-hidden transition-all shrink-0 ${
                          selectedAssetId === asset.id
                            ? 'border-indigo-500 ring-2 ring-indigo-200 shadow-lg scale-110'
                            : 'border-gray-200 hover:border-indigo-300 bg-gray-50'
                        }`}
                        title={asset.label || 'Aset'}
                      >
                        <img src={asset.url} alt="" className="w-full h-full object-contain p-1" />
                        <span className="absolute bottom-0 right-0 bg-gray-900/70 text-white text-[6px] font-bold px-1 rounded-tl-lg">
                          L{asset.z_layer ?? 0}
                        </span>
                      </button>
                    ))}
                  </div>

                  {selectedAssetId && (
                    <DecorationLayerList
                      assets={scopeAssets}
                      onUpdate={updateScopeAssets}
                      onPreview={() => {
                        if (isOpening) { setCoverPreviewMode('entry'); setPreviewMode('opening'); setDecorPreviewKey(k => k + 1) }
                        else if (scopeSection) { setPreviewMode('invitation'); setSectionReplay({ id: scopeSection.id, key: Date.now() }) }
                      }}
                      onPreviewExit={() => {
                        if (isOpening) { setCoverPreviewMode('exit'); setPreviewMode('opening'); setDecorPreviewKey(k => k + 1) }
                      }}
                      focusedId={selectedAssetId}
                      onFocusChange={setSelectedAssetId}
                    />
                  )}

                  {/* Global preview */}
                  {isOpening && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => { setDecorEditMode(false); setCoverPreviewMode('entry'); setPreviewMode('opening'); setDecorPreviewKey(k => k + 1) }}
                        className="flex-1 py-2.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
                      >
                        ▶ Preview Masuk
                      </button>
                      <button
                        onClick={() => { setDecorEditMode(false); setCoverPreviewMode('full-flow'); setPreviewMode('opening'); setDecorPreviewKey(k => k + 1) }}
                        className="flex-1 py-2.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
                      >
                        ▶▶ Full Flow
                      </button>
                    </div>
                  )}
                  {!isOpening && scopeSection && (
                    <button
                      onClick={() => { setPreviewMode('invitation'); setSectionReplay({ id: scopeSection.id, key: Date.now() }) }}
                      className="w-full py-2.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-xl hover:bg-indigo-100 transition-colors"
                    >
                      ▶ Preview {scopeLabel}
                    </button>
                  )}
                </>
              )}

            </div>
            )
          })()}

          {/*  Loading  */}
          {activeTab === 'loading' && (
            <div className="space-y-5">

              {/*  Pilih Gaya Loading  */}
              <div>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Gaya Loading
                </p>
                <p className="text-[9px] text-gray-400 mb-3">
                  Pilih animasi loading yang tampil setelah opening
                </p>
                <div className="grid grid-cols-3 gap-1.5">
                  {([
                    { id: 'dual-ring',       icon: '💫', label: 'Dual Ring' },
                    { id: 'heartbeat',       icon: '💗', label: 'Heartbeat' },
                    { id: 'elegant-spinner', icon: '🌀', label: 'Spinner' },
                    { id: 'petal-cascade',   icon: '🌸', label: 'Kelopak' },
                    { id: 'wave-dots',       icon: '🔵', label: 'Wave Dots' },
                    { id: 'letter-reveal',   icon: '✍️', label: 'Letter' },
                    { id: 'arch-gate',       icon: '🕌', label: 'Arch Gate' },
                    { id: 'candle-glow',     icon: '🕯️', label: 'Lilin' },
                    { id: 'infinity-ribbon', icon: '♾️', label: 'Infinity' },
                    { id: 'shimmer-bar',     icon: '▬', label: 'Shimmer' },
                    { id: 'orbit-rings',     icon: '🪐', label: 'Orbit' },
                    { id: 'ripple-pulse',    icon: '🔘', label: 'Ripple' },
                    { id: 'diamond-spin',    icon: '💎', label: 'Diamond' },
                    { id: 'hourglass',       icon: '⏳', label: 'Hourglass' },
                    { id: 'crescent-moon',   icon: '🌙', label: 'Bulan Sabit' },
                    { id: 'spiral-gold',     icon: '🌀', label: 'Spiral Gold' },
                  ] as const).map(lv => {
                    const active = (cfg.loading.variant ?? 'dual-ring') === lv.id
                    return (
                      <button key={lv.id} type="button"
                        onClick={() => { setConfig(prev => ({
                          ...prev,
                          config: { ...prev.config, loading: { ...prev.config.loading, variant: lv.id as any } },
                        })); setPreviewMode('loading'); setPreviewKey(k => k + 1) }}
                        className={`relative p-2.5 rounded-xl text-center transition-all ${
                          active
                            ? 'bg-indigo-50 border-2 border-indigo-500 ring-1 ring-indigo-500/20'
                            : 'bg-gray-50 border border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        <span className="text-lg block mb-0.5">{lv.icon}</span>
                        <p className={`text-[10px] font-semibold leading-tight ${active ? 'text-indigo-700' : 'text-gray-600'}`}>
                          {lv.label}
                        </p>
                        {active && (
                          <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-indigo-500 flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/*  Settings  */}
              <div className="pt-4 border-t border-gray-100 space-y-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
                  Pengaturan
                </p>

                {/* Teks Loading */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Teks Loading
                  </label>
                  <input
                    value={cfg.loading.text}
                    onChange={e => setConfig(prev => ({
                      ...prev,
                      config: { ...prev.config, loading: { ...prev.config.loading, text: e.target.value } },
                    }))}
                    className={inputCls}
                    placeholder="MEMBUKA UNDANGAN..."
                  />
                </div>

                {/* Tipe Background */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5">
                    Tipe Background
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 mb-3">
                    {([
                      { id: 'solid',    label: 'Solid' },
                      { id: 'gradient', label: 'Gradient' },
                      { id: 'image',    label: 'Foto' },
                    ] as const).map(bt => {
                      const active = (cfg.loading.bg_type ?? 'solid') === bt.id
                      return (
                        <button key={bt.id} type="button"
                          onClick={() => setConfig(prev => ({
                            ...prev,
                            config: { ...prev.config, loading: { ...prev.config.loading, bg_type: bt.id as any } },
                          }))}
                          className={`py-2 rounded-lg text-[10px] font-semibold transition-all ${
                            active
                              ? 'bg-indigo-50 border-2 border-indigo-500 text-indigo-700'
                              : 'bg-gray-50 border border-gray-200 text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {bt.label}
                        </button>
                      )
                    })}
                  </div>

                  {/* Solid / Gradient color */}
                  {(cfg.loading.bg_type ?? 'solid') !== 'image' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">
                          {(cfg.loading.bg_type ?? 'solid') === 'gradient' ? 'Warna Awal' : 'Warna Background'}
                        </label>
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
                            placeholder="#2c4a34"
                          />
                        </div>
                      </div>
                      {cfg.loading.bg_type === 'gradient' && (
                        <>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Warna Akhir</label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={cfg.loading.bg_gradient_to ?? '#000000'}
                                onChange={e => setConfig(prev => ({
                                  ...prev,
                                  config: { ...prev.config, loading: { ...prev.config.loading, bg_gradient_to: e.target.value } },
                                }))}
                                className="w-10 h-9 rounded-lg cursor-pointer border border-gray-200"
                              />
                              <input
                                value={cfg.loading.bg_gradient_to ?? '#000000'}
                                onChange={e => setConfig(prev => ({
                                  ...prev,
                                  config: { ...prev.config, loading: { ...prev.config.loading, bg_gradient_to: e.target.value } },
                                }))}
                                className={inputCls + ' font-mono flex-1'}
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] text-gray-400 mb-1">Sudut Gradient</label>
                            <div className="flex items-center gap-2">
                              <input type="range" min={0} max={360} step={15}
                                value={cfg.loading.bg_gradient_angle ?? 135}
                                onChange={e => setConfig(prev => ({
                                  ...prev,
                                  config: { ...prev.config, loading: { ...prev.config.loading, bg_gradient_angle: Number(e.target.value) } },
                                }))}
                                className="flex-1 accent-indigo-500 h-1.5"
                              />
                              <div className="flex items-center gap-0.5 shrink-0">
                                <input type="number" min={0} max={360} step={15}
                                  value={cfg.loading.bg_gradient_angle ?? 135}
                                  onChange={e => { const v = Number(e.target.value); if (v >= 0 && v <= 360) setConfig(prev => ({ ...prev, config: { ...prev.config, loading: { ...prev.config.loading, bg_gradient_angle: v } } })) }}
                                  className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                                <span className="text-[8px] text-gray-400">°</span>
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Image background */}
                  {cfg.loading.bg_type === 'image' && (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Foto Latar Belakang</label>
                        {cfg.loading.bg_image_url ? (
                          <div className="relative rounded-xl overflow-hidden border border-gray-200" style={{ height: 120 }}>
                            <img src={cfg.loading.bg_image_url} alt="Loading bg" className="w-full h-full object-cover" />
                            <button
                              onClick={() => setConfig(prev => ({
                                ...prev,
                                config: { ...prev.config, loading: { ...prev.config.loading, bg_image_url: undefined } },
                              }))}
                              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70 transition-colors"
                            >
                              <X className="w-3 h-3 text-white" />
                            </button>
                          </div>
                        ) : (
                          <ImageUploadField
                            value=""
                            onChange={(url) => setConfig(prev => ({
                              ...prev,
                              config: { ...prev.config, loading: { ...prev.config.loading, bg_image_url: url } },
                            }))}
                            label="Upload foto loading"
                          />
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">
                          Warna Overlay
                        </label>
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
                      </div>
                      <div>
                        <label className="block text-[10px] text-gray-400 mb-1">Opacity Overlay</label>
                        <div className="flex items-center gap-2">
                          <input type="range" min={0} max={1} step={0.05}
                            value={cfg.loading.overlay_opacity ?? 0.85}
                            onChange={e => setConfig(prev => ({
                              ...prev,
                              config: { ...prev.config, loading: { ...prev.config.loading, overlay_opacity: Number(e.target.value) } },
                            }))}
                            className="flex-1 accent-indigo-500 h-1.5"
                          />
                          <div className="flex items-center gap-0.5 shrink-0">
                            <input type="number" min={0} max={100} step={5}
                              value={Math.round((cfg.loading.overlay_opacity ?? 0.85) * 100)}
                              onChange={e => { const v = Number(e.target.value) / 100; if (v >= 0 && v <= 1) setConfig(prev => ({ ...prev, config: { ...prev.config, loading: { ...prev.config.loading, overlay_opacity: v } } })) }}
                              className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                            <span className="text-[8px] text-gray-400">%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Preview Button */}
              <div>
                <button
                  onClick={() => setPreviewMode('loading')}
                  className="flex items-center gap-2 text-sm font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl px-4 py-2.5 transition-colors"
                >
                  <Play className="w-4 h-4 fill-current" /> Preview Loading di Mockup
                </button>
                <p className="text-[9px] text-gray-400 mt-2">
                  Klik untuk melihat loading screen di mockup preview (kanan).
                </p>
              </div>
            </div>
          )}

          {/*  Sections  */}
          {activeTab === 'sections' && (
            <div className="space-y-3">
              <p className="text-xs text-gray-500">Atur section yang tampil, urutan, dan warna latar masing-masing.</p>

              {sections.map((s, idx) => (
                <div
                  key={s.id}
                  draggable={!lockedSectionIds.has(s.id)}
                  onDragStart={() => { if (!lockedSectionIds.has(s.id)) setDraggingSectionId(s.id) }}
                  onDragOver={e => { e.preventDefault(); if (!lockedSectionIds.has(s.id)) setDragOverSectionId(s.id) }}
                  onDrop={() => handleSectionDrop(s.id)}
                  onDragEnd={() => { setDraggingSectionId(null); setDragOverSectionId(null) }}
                  className={`border rounded-xl overflow-hidden transition-all ${
                    draggingSectionId === s.id
                      ? 'opacity-40 scale-[0.98] border-indigo-300'
                      : dragOverSectionId === s.id && draggingSectionId !== s.id
                      ? 'border-indigo-400 ring-2 ring-indigo-200'
                      : lockedSectionIds.has(s.id)
                      ? 'border-yellow-200'
                      : 'border-gray-100'
                  }`}
                >
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-gray-50">
                    {/* Drag handle   disabled when locked */}
                    <div className={`shrink-0 ${lockedSectionIds.has(s.id) ? 'text-yellow-400 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500'}`}>
                      {lockedSectionIds.has(s.id)
                        ? <Lock className="w-3.5 h-3.5" />
                        : <GripVertical className="w-3.5 h-3.5" />
                      }
                    </div>
                    {/* Reorder arrows (fallback)   disabled when locked */}
                    <div className="flex flex-col gap-0.5">
                      <button onClick={() => moveSection(s.id, 'up')} disabled={idx === 0 || lockedSectionIds.has(s.id) || (idx > 0 && lockedSectionIds.has(sections[idx - 1].id))}
                        className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20">
                        <ChevronUp className="w-3 h-3" />
                      </button>
                      <button onClick={() => moveSection(s.id, 'down')} disabled={idx === sections.length - 1 || lockedSectionIds.has(s.id) || (idx < sections.length - 1 && lockedSectionIds.has(sections[idx + 1].id))}
                        className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20">
                        <ChevronDown className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Background indicator */}
                    {s.background.type === 'color' ? (
                      <input
                        type="color"
                        value={s.background.value ?? cfg.meta.color_scheme.primary}
                        onChange={e => updateSection(s.id, { background: { ...s.background, value: e.target.value } })}
                        className="w-6 h-6 rounded cursor-pointer border border-gray-200 shrink-0"
                        title="Warna latar section"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded border border-gray-200 shrink-0 flex items-center justify-center bg-gray-100"
                        title={s.background.type === 'image' ? 'Latar: gambar/GIF' : 'Latar: video'}>
                        <span className="text-[8px]">{s.background.type === 'image' ? '🖼' : '🎬'}</span>
                      </div>
                    )}

                    {/* Label */}
                    <span className="text-xs font-medium text-gray-700 flex-1 truncate">
                      {SECTION_LABELS[s.type] ?? s.type}
                    </span>

                    {/* Lock drag position */}
                    <button
                      onClick={() => setLockedSectionIds(prev => {
                        const next = new Set(prev)
                        next.has(s.id) ? next.delete(s.id) : next.add(s.id)
                        return next
                      })}
                      className={`p-1 rounded-lg transition-colors ${lockedSectionIds.has(s.id) ? 'text-yellow-500 hover:bg-yellow-50' : 'text-gray-300 hover:bg-gray-100'}`}
                      title={lockedSectionIds.has(s.id) ? 'Unlock posisi' : 'Lock posisi'}
                    >
                      {lockedSectionIds.has(s.id) ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                    </button>

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

                  {/* Advanced controls   hanya tampil saat di-expand */}
                  {s.enabled && expandedSectionId === s.id && (
                    <div className="bg-white border-t border-gray-50 divide-y divide-gray-50">

                      {/* Style variant selector   visual thumbnails */}
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
                                  onClick={() => { updateSection(s.id, { style_variant: v.value }); setPreviewMode('invitation'); setSectionReplay(p => ({ id: s.id, key: (p?.id === s.id ? p.key + 1 : 0) })) }}
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

                      {/* Latar belakang section */}
                      <div className="px-3 py-2.5">
                        <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-2">Latar Belakang</p>
                        <div className="flex gap-1 mb-2.5">
                          {(['color', 'image', 'video'] as const).map(t => (
                            <button key={t} type="button"
                              onClick={() => updateSection(s.id, { background: { ...s.background, type: t, ...(t === 'color' ? { url: undefined } : {}) } })}
                              className={`flex-1 py-1.5 rounded-lg text-[9px] font-semibold transition-colors ${
                                s.background.type === t ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-indigo-50'
                              }`}>
                              {t === 'color' ? 'Warna' : t === 'image' ? 'Gambar / GIF' : 'Video'}
                            </button>
                          ))}
                        </div>
                        {s.background.type === 'color' && (
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={s.background.value ?? cfg.meta.color_scheme.primary}
                              onChange={e => updateSection(s.id, { background: { ...s.background, value: e.target.value } })}
                              className="w-8 h-8 rounded-lg cursor-pointer border border-gray-200 shrink-0"
                            />
                            <input
                              value={s.background.value ?? cfg.meta.color_scheme.primary}
                              onChange={e => updateSection(s.id, { background: { ...s.background, value: e.target.value } })}
                              className="flex-1 text-xs font-mono border border-gray-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                            />
                          </div>
                        )}
                        {s.background.type === 'image' && (
                          <div className="space-y-2">
                            <ImageUploadField
                              value={s.background.url}
                              onChange={url => updateSection(s.id, { background: { ...s.background, url, type: 'image' } })}
                              hint="JPG, PNG, WebP, atau GIF animasi"
                            />
                            {s.background.url && (
                              <div className="flex items-center gap-2">
                                <p className="text-[9px] text-gray-500 shrink-0">Overlay gelap</p>
                                <input type="range" min={0} max={0.9} step={0.05}
                                  value={s.background.overlay_opacity ?? 0.4}
                                  onChange={e => updateSection(s.id, { background: { ...s.background, overlay_opacity: Number(e.target.value) } })}
                                  className="flex-1 accent-indigo-600 h-1" />
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <input type="number" min={0} max={90} step={5}
                                    value={Math.round((s.background.overlay_opacity ?? 0.4) * 100)}
                                    onChange={e => { const v = Number(e.target.value) / 100; if (v >= 0 && v <= 0.9) updateSection(s.id, { background: { ...s.background, overlay_opacity: v } }) }}
                                    className="w-12 px-1 py-0.5 text-[9px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                                  <span className="text-[8px] text-gray-400">%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                        {s.background.type === 'video' && (
                          <div className="space-y-2">
                            <VideoUploadField
                              value={s.background.url}
                              onChange={url => updateSection(s.id, { background: { ...s.background, url, type: 'video' } })}
                              hint="MP4, WebM (maks 50MB) · autoplay, muted, loop"
                            />
                            {s.background.url && (
                              <div className="flex items-center gap-2">
                                <p className="text-[9px] text-gray-500 shrink-0">Overlay gelap</p>
                                <input type="range" min={0} max={0.9} step={0.05}
                                  value={s.background.overlay_opacity ?? 0.45}
                                  onChange={e => updateSection(s.id, { background: { ...s.background, overlay_opacity: Number(e.target.value) } })}
                                  className="flex-1 accent-indigo-600 h-1" />
                                <div className="flex items-center gap-0.5 shrink-0">
                                  <input type="number" min={0} max={90} step={5}
                                    value={Math.round((s.background.overlay_opacity ?? 0.45) * 100)}
                                    onChange={e => { const v = Number(e.target.value) / 100; if (v >= 0 && v <= 0.9) updateSection(s.id, { background: { ...s.background, overlay_opacity: v } }) }}
                                    className="w-12 px-1 py-0.5 text-[9px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
                                  <span className="text-[8px] text-gray-400">%</span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

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
                              title="Preview di mockup, scroll ke section ini"
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

                      {/*  Konten Section  */}
                      <div className="px-3 pb-3 border-t border-violet-50 bg-violet-50/30">
                        <p className="text-[9px] font-bold text-violet-600 uppercase tracking-widest mt-2.5 mb-3">
                          Konten & Foto
                        </p>

                        {/* HERO   editor lengkap */}
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
                                  <p className="text-[8px] text-gray-400 mb-0.5">Durasi (dtk)</p>
                                  <div className="flex items-center gap-1">
                                    <input type="range" min={0.2} max={2.0} step={0.1}
                                      value={s.hero_anim_duration ?? 0.8}
                                      onChange={e => updateSection(s.id, { hero_anim_duration: Number(e.target.value) })}
                                      className="flex-1 h-1 accent-violet-500" />
                                    <input type="number" min={0.2} max={2.0} step={0.1}
                                      value={s.hero_anim_duration ?? 0.8}
                                      onChange={e => { const v = Number(e.target.value); if (v >= 0.2 && v <= 2.0) updateSection(s.id, { hero_anim_duration: v }) }}
                                      className="w-12 px-1 py-0.5 text-[8px] text-center border border-gray-200 rounded focus:border-violet-400 focus:outline-none font-mono" />
                                  </div>
                                </div>
                                <div>
                                  <p className="text-[8px] text-gray-400 mb-0.5">Jeda (stagger)</p>
                                  <div className="flex items-center gap-1">
                                    <input type="range" min={0} max={0.5} step={0.05}
                                      value={s.hero_anim_stagger ?? 0.15}
                                      onChange={e => updateSection(s.id, { hero_anim_stagger: Number(e.target.value) })}
                                      className="flex-1 h-1 accent-violet-500" />
                                    <input type="number" min={0} max={0.5} step={0.05}
                                      value={s.hero_anim_stagger ?? 0.15}
                                      onChange={e => { const v = Number(e.target.value); if (v >= 0 && v <= 0.5) updateSection(s.id, { hero_anim_stagger: v }) }}
                                      className="w-12 px-1 py-0.5 text-[8px] text-center border border-gray-200 rounded focus:border-violet-400 focus:outline-none font-mono" />
                                  </div>
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
                                  <p className="text-[8px] text-gray-400 mb-0.5">Overlay background</p>
                                  <div className="flex items-center gap-1">
                                    <input type="range" min={0} max={0.95} step={0.05}
                                      value={s.hero_overlay ?? 0.52}
                                      onChange={e => updateSection(s.id, { hero_overlay: Number(e.target.value) })}
                                      className="flex-1 h-1 accent-violet-500" />
                                    <div className="flex items-center gap-0.5 shrink-0">
                                      <input type="number" min={0} max={95} step={5}
                                        value={Math.round((s.hero_overlay ?? 0.52) * 100)}
                                        onChange={e => { const v = Number(e.target.value) / 100; if (v >= 0 && v <= 0.95) updateSection(s.id, { hero_overlay: v }) }}
                                        className="w-10 px-0.5 py-0.5 text-[8px] text-center border border-gray-200 rounded focus:border-violet-400 focus:outline-none font-mono" />
                                      <span className="text-[7px] text-gray-400">%</span>
                                    </div>
                                  </div>
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

                            {/*  Akad Nikah  */}
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

                            {/*  Resepsi  */}
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

                        {/* GIFT   amplop digital settings */}
                        {s.type === 'gift' && (() => {
                          const activeSet = new Set(
                            (previewData.gift_accounts ?? []).map(a => a.type === 'bank' ? a.bank : a.platform)
                          )
                          const MAX_GIFT = 3
                          function toggleProvider(name: string) {
                            const b = GIFT_LAB_BRANDS[name]; if (!b) return
                            const cur = previewData.gift_accounts ?? []
                            if (activeSet.has(name)) {
                              setPreviewData(d => ({ ...d, gift_accounts: cur.filter(a => (a.type === 'bank' ? a.bank : a.platform) !== name) }))
                            } else {
                              if (cur.length >= MAX_GIFT) return
                              setPreviewData(d => ({ ...d, gift_accounts: [...cur, makeGiftAccount(name, b)] }))
                            }
                          }
                          return (
                            <div className="space-y-3">

                              {/*  Provider preview picker  */}
                              <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                  <p className="text-[8px] font-bold text-violet-500 uppercase tracking-widest">Preview Provider</p>
                                  <div className="flex gap-1.5">
                                    <button type="button"
                                      onClick={() => setPreviewData(d => ({ ...d, gift_accounts: Object.entries(GIFT_LAB_BRANDS).slice(0, MAX_GIFT).map(([n, b]) => makeGiftAccount(n, b)) }))}
                                      className="text-[7px] font-bold text-violet-500 hover:text-violet-700 transition-colors">
                                      Maks 3
                                    </button>
                                    <span className="text-[7px] text-gray-300">·</span>
                                    <button type="button"
                                      onClick={() => setPreviewData(d => ({ ...d, gift_accounts: [] }))}
                                      className="text-[7px] font-bold text-gray-400 hover:text-red-400 transition-colors">
                                      Reset
                                    </button>
                                  </div>
                                </div>

                                {/* Mini card grid   5 per row */}
                                <div className="grid grid-cols-5 gap-1.5">
                                  {Object.entries(GIFT_LAB_BRANDS).map(([name, b]) => {
                                    const active = activeSet.has(name)
                                    const atMax = !active && activeSet.size >= MAX_GIFT
                                    return (
                                      <button key={name} type="button" onClick={() => toggleProvider(name)}
                                        title={atMax ? `Maks ${MAX_GIFT} provider` : name}
                                        disabled={atMax}
                                        className="relative overflow-hidden rounded-lg transition-all disabled:cursor-not-allowed"
                                        style={{
                                          background: `linear-gradient(135deg, ${b.g[0]}, ${b.g[1]})`,
                                          aspectRatio: '1 / 1',
                                          boxShadow: active ? `0 0 0 2px white, 0 0 0 3.5px ${b.g[0]}` : `0 1px 4px ${b.g[0]}44`,
                                          opacity: active ? 1 : atMax ? 0.2 : 0.45,
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
                                <p className="text-[7px] text-gray-400">Klik provider untuk tampilkan / sembunyi di preview (maks {MAX_GIFT})</p>
                              </div>

                              {/*  Toggles  */}
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

                              {/*  Thank you text  */}
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

          {/*  Musik  */}
          {activeTab === 'music' && (
            <div className="space-y-5">
              <p className="text-xs text-gray-500">
                Konfigurasi musik latar dan kontrol player untuk undangan.
              </p>

              {/* Aktifkan Musik */}
              <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 bg-white">
                <div>
                  <p className="text-sm font-medium text-gray-700">Aktifkan Musik</p>
                  <p className="text-xs text-gray-400 mt-0.5">Tampilkan kontrol musik di undangan</p>
                </div>
                <button
                  onClick={() => updateMusic({ enabled: !musicCfg.enabled })}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${musicCfg.enabled ? 'bg-purple-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${musicCfg.enabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {musicCfg.enabled && (
                <>
                  {/* File Musik   Current Selection */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Musik Terpilih</p>
                    {musicCfg.url ? (
                      <div className="p-3 rounded-xl border border-purple-200 bg-purple-50 flex items-center gap-3">
                        <button
                          onClick={() => toggleMusicPreview('selected', musicCfg.url!)}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                            musicPreviewId === 'selected'
                              ? 'bg-purple-700 text-white scale-105'
                              : 'bg-purple-500 text-white hover:bg-purple-600'
                          }`}
                          title={musicPreviewId === 'selected' ? 'Stop' : 'Preview'}
                        >
                          {musicPreviewId === 'selected' ? (
                            <div className="flex items-end gap-[2px] h-4">
                              {[0, 0.15, 0.3, 0.1].map((d, i) => (
                                <span key={i} className="w-[2.5px] bg-white rounded-full animate-pulse" style={{ height: `${8 + (i % 2) * 8}px`, animationDelay: `${d}s` }} />
                              ))}
                            </div>
                          ) : (
                            <Play className="w-5 h-5 fill-current" />
                          )}
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{musicCfg.title || 'Musik'}</p>
                          <p className="text-[9px] text-gray-400 truncate">
                            {musicPreviewId === 'selected' ? 'Sedang diputar...' : 'Klik ikon play untuk preview'}
                          </p>
                        </div>
                        <button onClick={() => { musicAudioRef.current?.pause(); setMusicPreviewId(null); updateMusic({ url: '', title: '' }) }}
                          className="w-7 h-7 rounded-lg bg-red-100 text-red-500 hover:bg-red-200 flex items-center justify-center transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center">
                        <div className="text-xl mb-1">🎼</div>
                        <p className="text-[10px] text-gray-500">Belum ada musik dipilih. Pilih dari library atau upload di bawah</p>
                      </div>
                    )}

                    <Field label="Judul Lagu">
                      <input value={musicCfg.title ?? ''} onChange={e => updateMusic({ title: e.target.value })}
                        className={inputCls} placeholder="Perfect - Ed Sheeran" />
                    </Field>
                  </div>

                  {/*  Library Musik Admin  */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest mb-1">Perpustakaan Musik</p>
                    <p className="text-[9px] text-gray-400 mb-3">
                      Lagu yang disediakan admin sebagai opsi untuk user. Klik untuk memilih.
                    </p>

                    {(() => {
                      const allCats = ['Semua', ...musicLibraryCats]
                      const filtered = musicLibraryCat === 'Semua' ? musicLibrary : musicLibrary.filter(m => m.category === musicLibraryCat)

                      return (
                        <>
                          {allCats.length > 1 && (
                            <div className="flex gap-1 flex-wrap mb-3">
                              {allCats.map(cat => (
                                <button key={cat} onClick={() => setMusicLibraryCat(cat)}
                                  className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                                    musicLibraryCat === cat
                                      ? 'bg-purple-600 text-white'
                                      : 'bg-gray-100 text-gray-500 hover:bg-purple-50 hover:text-purple-600'
                                  }`}>
                                  {cat}
                                </button>
                              ))}
                            </div>
                          )}

                          {musicLibrary.length === 0 ? (
                            <div className="p-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 text-center">
                              <p className="text-[10px] text-gray-500">Belum ada musik di perpustakaan. Tambahkan melalui tab Musik di sidebar admin.</p>
                            </div>
                          ) : (
                            <div className="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                              {filtered.map(song => {
                                const selected = musicCfg.url === song.url
                                const isPreviewing = musicPreviewId === song.id
                                return (
                                  <div key={song.id}
                                    className={`flex items-center gap-2 p-2.5 rounded-xl transition-all ${
                                      selected
                                        ? 'bg-purple-100 border-2 border-purple-500 ring-1 ring-purple-300'
                                        : 'bg-white border border-gray-100 hover:border-purple-200'
                                    }`}>
                                    <button
                                      onClick={e => { e.stopPropagation(); toggleMusicPreview(song.id, song.url) }}
                                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                                        isPreviewing
                                          ? 'bg-purple-600 text-white scale-105'
                                          : selected
                                            ? 'bg-purple-400 text-white hover:bg-purple-500'
                                            : 'bg-gray-100 text-gray-400 hover:bg-purple-100 hover:text-purple-600'
                                      }`}
                                      title={isPreviewing ? 'Stop preview' : 'Preview lagu'}
                                    >
                                      {isPreviewing ? (
                                        <div className="flex items-end gap-[2px] h-3.5">
                                          {[0, 0.15, 0.3, 0.1].map((d, i) => (
                                            <span key={i} className="w-[2px] bg-white rounded-full animate-pulse" style={{ height: `${8 + (i % 2) * 6}px`, animationDelay: `${d}s` }} />
                                          ))}
                                        </div>
                                      ) : (
                                        <Play className="w-3.5 h-3.5 fill-current" />
                                      )}
                                    </button>
                                    <button
                                      onClick={() => updateMusic({ url: song.url, title: song.title })}
                                      className="flex-1 min-w-0 text-left"
                                    >
                                      <p className={`text-[11px] font-semibold truncate ${selected ? 'text-purple-800' : 'text-gray-700'}`}>
                                        {song.title}
                                      </p>
                                      <p className={`text-[9px] truncate ${selected ? 'text-purple-500' : 'text-gray-400'}`}>
                                        {song.artist} · {song.category}
                                      </p>
                                    </button>
                                    {selected && (
                                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </>
                      )
                    })()}
                  </div>

                  {/* Autoplay & Volume */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Pengaturan Putar</p>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white mb-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700">Autoplay</p>
                        <p className="text-[10px] text-gray-400">Putar otomatis saat undangan dibuka</p>
                      </div>
                      <button onClick={() => updateMusic({ autoplay: !musicCfg.autoplay })}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${musicCfg.autoplay ? 'bg-purple-600' : 'bg-gray-200'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${musicCfg.autoplay ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white mb-3">
                      <div>
                        <p className="text-xs font-medium text-gray-700">Loop</p>
                        <p className="text-[10px] text-gray-400">Ulangi musik dari awal setelah selesai</p>
                      </div>
                      <button onClick={() => updateMusic({ loop: !musicCfg.loop })}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${musicCfg.loop ? 'bg-purple-600' : 'bg-gray-200'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${musicCfg.loop ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>

                    <Field label="Volume Default">
                      <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-gray-400 shrink-0" />
                        <input type="range" min="0" max="100" value={Math.round(musicCfg.volume * 100)}
                          onChange={e => updateMusic({ volume: Number(e.target.value) / 100 })}
                          className="flex-1 h-1.5 bg-gray-200 rounded-full accent-purple-600 cursor-pointer" />
                        <div className="flex items-center gap-0.5 shrink-0">
                          <input type="number" min={0} max={100} step={5}
                            value={Math.round(musicCfg.volume * 100)}
                            onChange={e => { const v = Number(e.target.value); if (v >= 0 && v <= 100) updateMusic({ volume: v / 100 }) }}
                            className="w-14 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-purple-400 focus:outline-none font-mono" />
                          <span className="text-[8px] text-gray-400">%</span>
                        </div>
                      </div>
                    </Field>
                  </div>

                  {/* Gaya Tampilan Player */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Gaya Tampilan Player</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { id: 'pill', icon: '💊', name: 'Pill', desc: 'Tombol + judul lagu' },
                        { id: 'circle', icon: '⭕', name: 'Circle', desc: 'Tombol bulat sederhana' },
                        { id: 'vinyl', icon: '💿', name: 'Vinyl', desc: 'Piringan berputar' },
                        { id: 'minimal', icon: '▶', name: 'Minimal', desc: 'Ikon kecil saja' },
                      ] as const).map(s => {
                        const selected = musicCfg.player_style === s.id
                        return (
                          <button key={s.id} onClick={() => updateMusic({ player_style: s.id })}
                            className={`p-3 rounded-xl text-center transition-all ${selected
                              ? 'bg-purple-50 border-2 border-purple-500 ring-1 ring-purple-500/20'
                              : 'bg-gray-50 border border-gray-200 hover:border-gray-300'}`}>
                            <span className="text-lg block mb-0.5">{s.icon}</span>
                            <p className={`text-[10px] font-semibold ${selected ? 'text-purple-700' : 'text-gray-700'}`}>{s.name}</p>
                            <p className={`text-[9px] ${selected ? 'text-purple-500' : 'text-gray-400'}`}>{s.desc}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Posisi Player */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Posisi Player</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { id: 'bottom-right', name: 'Kanan Bawah', icon: '↘' },
                        { id: 'bottom-left', name: 'Kiri Bawah', icon: '↙' },
                        { id: 'bottom-center', name: 'Tengah Bawah', icon: '↓' },
                        { id: 'top-right', name: 'Kanan Atas', icon: '↗' },
                      ] as const).map(p => {
                        const selected = musicCfg.player_position === p.id
                        return (
                          <button key={p.id} onClick={() => updateMusic({ player_position: p.id })}
                            className={`p-2.5 rounded-xl text-center transition-all ${selected
                              ? 'bg-purple-50 border-2 border-purple-500'
                              : 'bg-gray-50 border border-gray-200 hover:border-gray-300'}`}>
                            <span className="text-sm block">{p.icon}</span>
                            <p className={`text-[10px] font-semibold mt-0.5 ${selected ? 'text-purple-700' : 'text-gray-700'}`}>{p.name}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Animasi Masuk */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Animasi Masuk</p>
                    <div className="grid grid-cols-2 gap-2">
                      {([
                        { id: 'fade-slide', name: 'Fade Slide', desc: 'Muncul halus dari bawah' },
                        { id: 'scale-bounce', name: 'Scale Bounce', desc: 'Membesar dari titik' },
                        { id: 'slide-up', name: 'Slide Up', desc: 'Geser dari bawah layar' },
                        { id: 'none', name: 'Tanpa Animasi', desc: 'Langsung muncul' },
                      ] as const).map(a => {
                        const selected = musicCfg.player_animation === a.id
                        return (
                          <button key={a.id} onClick={() => updateMusic({ player_animation: a.id })}
                            className={`p-2.5 rounded-xl text-left transition-all ${selected
                              ? 'bg-purple-50 border-2 border-purple-500'
                              : 'bg-gray-50 border border-gray-200 hover:border-gray-300'}`}>
                            <p className={`text-[10px] font-semibold ${selected ? 'text-purple-700' : 'text-gray-700'}`}>{a.name}</p>
                            <p className={`text-[9px] ${selected ? 'text-purple-500' : 'text-gray-400'}`}>{a.desc}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Ukuran Player */}
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Ukuran Player</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { id: 'sm', name: 'Kecil' },
                        { id: 'md', name: 'Sedang' },
                        { id: 'lg', name: 'Besar' },
                      ] as const).map(sz => {
                        const selected = musicCfg.player_size === sz.id
                        return (
                          <button key={sz.id} onClick={() => updateMusic({ player_size: sz.id })}
                            className={`py-2 rounded-xl text-center transition-all ${selected
                              ? 'bg-purple-50 border-2 border-purple-500'
                              : 'bg-gray-50 border border-gray-200 hover:border-gray-300'}`}>
                            <p className={`text-[10px] font-semibold ${selected ? 'text-purple-700' : 'text-gray-700'}`}>{sz.name}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Tampilkan Judul */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-gray-200 bg-white">
                      <div>
                        <p className="text-xs font-medium text-gray-700">Tampilkan Judul Lagu</p>
                        <p className="text-[10px] text-gray-400">Pill label di samping tombol player</p>
                      </div>
                      <button onClick={() => updateMusic({ show_title: !musicCfg.show_title })}
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${musicCfg.show_title ? 'bg-purple-600' : 'bg-gray-200'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${musicCfg.show_title ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
                    <p className="text-[10px] text-blue-700 leading-relaxed">
                      <strong>Info:</strong> Musik mulai diputar sejak halaman cover/opening. Jika browser memblokir autoplay,
                      kontrol musik menampilkan animasi pulse mengundang tamu untuk tap. Musik otomatis aktif saat ada interaksi pertama.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 space-y-2 shrink-0">

          {/* Progress indicator + undo/redo */}
          {(changeCount > 0 || lastSavedAt) && (
            <div className="flex items-center justify-between px-1 mb-1">
              {changeCount > 0 ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] text-amber-600 font-medium">{changeCount} perubahan belum tersimpan</span>
                  <div className="flex items-center gap-0.5 ml-2">
                    <button onClick={undo} disabled={!canUndo} title="Undo"
                      className="p-0.5 text-gray-400 hover:text-indigo-600 disabled:opacity-20 transition-colors"><Undo2 className="w-3 h-3" /></button>
                    <button onClick={redo} disabled={!canRedo} title="Redo"
                      className="p-0.5 text-gray-400 hover:text-indigo-600 disabled:opacity-20 transition-colors"><Redo2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ) : lastSavedAt ? (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[10px] text-emerald-600 font-medium">Tersimpan {lastSavedAt}</span>
                </div>
              ) : null}
              {isEditMode && (
                <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">editing: {config.slug}</span>
              )}
            </div>
          )}

          {isEditMode ? (
            <button
              onClick={openReleaseModal}
              className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              <Save className="w-3.5 h-3.5" /> Simpan Perubahan
            </button>
          ) : (
            <>
              <button
                onClick={saveLabDirect}
                className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 text-white text-xs font-semibold py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
              >
                <Save className="w-3.5 h-3.5" /> Simpan Eksperimen
              </button>
              <button
                onClick={openReleaseModal}
                className="w-full flex items-center justify-center gap-1.5 border border-dashed border-indigo-300 text-indigo-600 text-xs font-semibold py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <Rocket className="w-3.5 h-3.5" /> Rilis ke Manajemen
              </button>
            </>
          )}

          {/* Success banner setelah rilis */}
          {releaseSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2.5">
              <span className="text-lg shrink-0">✅</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-emerald-800">
                  &ldquo;{releaseSuccess}&rdquo; berhasil {isEditMode ? 'diperbarui' : 'dirilis'}!
                </p>
                <p className="text-[10px] text-emerald-600 mt-0.5">
                  {isEditMode ? 'Perubahan tersimpan. Data di Manajemen sudah ter-sync.' : 'Template sudah ada di Manajemen. Atur harga & aktifkan agar user bisa memilihnya.'}
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

      {/*  Right: Preview  */}
      <div className="flex-1 bg-slate-100 flex flex-col overflow-hidden">

        {/* Preview toolbar */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-600">Live Preview</span>
            </div>
            {/* Undo / Redo */}
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button onClick={undo} disabled={!canUndo} title="Undo (Ctrl+Z)"
                className="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors">
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button onClick={redo} disabled={!canRedo} title="Redo (Ctrl+Y)"
                className="p-1.5 rounded-md text-gray-500 hover:text-indigo-600 hover:bg-white disabled:opacity-25 disabled:hover:bg-transparent disabled:hover:text-gray-500 transition-colors">
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {previewMode === 'invitation' && (
              <span className="text-xs text-gray-400">
                {sections.filter(s => s.enabled).length} sections
              </span>
            )}
            {/* Tombol Play   preview animasi opening di dalam mockup */}
            <button
              onClick={() => { setPreviewMode('opening'); setPreviewPlaying(true) }}
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
            <button
              onClick={() => {
                const hasOpening = cfg.opening.show_opening !== false
                setFullscreenPhase(hasOpening ? 'opening' : 'loading')
                setShowFullscreen(true)
              }}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 border border-indigo-200 rounded-lg px-3 py-1.5 transition-colors"
            >
              <Maximize2 className="w-3 h-3" /> Full Screen
            </button>
          </div>
        </div>

        {/*
          Phone preview   shell 360px, screen 340×736, zoom 340/390 ≈ 0.872
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

                {/*  Fullscreen + Music overlay   always on top  */}
                <div style={{ position: 'absolute', inset: 0, zIndex: 50, pointerEvents: 'none' }}>
                  {/* Fullscreen icon   top right corner */}
                  <button
                    onClick={() => {
                      const hasOpening = cfg.opening.show_opening !== false
                      setFullscreenPhase(hasOpening ? 'opening' : 'loading')
                      setShowFullscreen(true)
                    }}
                    style={{ position: 'absolute', top: 12, right: 12, pointerEvents: 'auto' }}
                    className="bg-black/40 hover:bg-black/60 text-white/80 hover:text-white rounded-full p-1.5 transition-colors backdrop-blur-sm"
                    title="Full Screen"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Music player */}
                  {musicCfg.enabled && (
                    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                      <FloatingMusicPlayer
                        key={`music-${musicCfg.player_style}-${musicCfg.player_position}-${musicCfg.player_size}-${musicCfg.player_animation}-${musicCfg.show_title}`}
                        config={musicCfg}
                        colors={cfg.meta.color_scheme}
                        static
                      />
                    </div>
                  )}
                </div>

                {/*  Opening preview (live OpeningScene)  */}
                <div style={{
                  position: 'absolute', inset: 0, overflow: 'hidden',
                  visibility: previewMode === 'opening' && !previewPlaying && !previewLoading ? 'visible' : 'hidden',
                  pointerEvents: previewMode === 'opening' && !previewPlaying && !previewLoading ? 'auto' : 'none',
                }}>
                  <div style={{ width: 390, zoom: 340 / 390, height: 845, position: 'relative' }}>
                    <OpeningScene
                      key={`static-opening-${decorPreviewKey}-${cfg.opening.type}`}
                      config={cfg.opening}
                      data={previewData}
                      meta={cfg.meta}
                      positionMode="absolute"
                      onOpen={() => setDecorPreviewKey(k => k + 1)}
                      previewGuestName={previewGuestName}
                    />
                  </div>
                </div>

                {/*  Moodboard overlay   drag decoration assets  */}
                {decorEditMode && previewMode === 'opening' && !previewPlaying && (
                  <div style={{ width: 390, zoom: 340 / 390, height: 845, position: 'absolute', inset: 0, zIndex: 30 }}>
                    <DecorationMoodboard
                      assets={cfg.opening.decoration_assets ?? []}
                      onUpdate={assets => updateOpening({ decoration_assets: assets })}
                      selectedId={selectedAssetId}
                      onSelect={setSelectedAssetId}
                      containerWidth={390}
                      containerHeight={845}
                    />
                  </div>
                )}

                {/*  Invitation preview   scroll-snap, satu section = satu layar  */}
                <div key={previewKey} style={{
                  position: 'absolute', inset: 0,
                  overflowY: 'auto', overflowX: 'hidden', scrollbarWidth: 'none',
                  scrollSnapType: 'y proximity',
                  WebkitOverflowScrolling: 'touch',
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

                {/*  Loading screen preview (static mode)  */}
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

                {/*  Loading screen (flow preview - when triggered)  */}
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
                          setPreviewMode('invitation')
                        }}
                        isPreview={true}
                      />
                    </div>
                  </div>
                )}

                {/*  Cover/Opening preview   click MASUK SEKARANG triggers loading  */}
                {previewPlaying && (
                  <div style={{ position: 'absolute', inset: 0, zIndex: 30, overflow: 'hidden', borderRadius: '2rem' }}>
                    <div style={{ width: 390, zoom: 340 / 390, height: 845, position: 'relative' }}>
                      <AnimatePresence>
                        <OpeningScene
                          config={cfg.opening}
                          data={previewData}
                          meta={cfg.meta}
                          positionMode="absolute"
                          previewGuestName={previewGuestName}
                          onOpen={() => {
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
            <div className="mt-3 flex items-center gap-1 bg-white rounded-xl p-1.5 shadow-sm border border-gray-200">
              <button
                onClick={() => setPreviewMode('opening')}
                className={`flex-1 px-2 py-2 rounded-lg text-[10px] font-semibold transition-all ${
                  previewMode === 'opening'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Opening
              </button>
              <button
                onClick={() => setPreviewMode('loading')}
                className={`flex-1 px-2 py-2 rounded-lg text-[10px] font-semibold transition-all ${
                  previewMode === 'loading'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Loading
              </button>
              <button
                onClick={() => setPreviewMode('invitation')}
                className={`flex-1 px-2 py-2 rounded-lg text-[10px] font-semibold transition-all ${
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

      {/*  Fullscreen Live Preview  */}
      {showFullscreen && (
        <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
          {/* Close button */}
          <button
            onClick={() => {
              setShowFullscreen(false)
              setFullscreenPhase(cfg.opening.show_opening !== false ? 'opening' : 'loading')
            }}
            className="absolute top-4 right-4 z-[110] bg-black/60 hover:bg-black/80 text-white rounded-full p-2.5 transition-colors backdrop-blur-sm"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Phone-width container   simulates real device */}
          <div style={{
            width: '100%',
            maxWidth: 430,
            height: '100dvh',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 0 80px rgba(0,0,0,0.5)',
          }}>
            <InvitationRenderer
              key={`fs-renderer-${showFullscreen}`}
              invitationId="lab-fullscreen"
              invitationData={previewData}
              template={config}
              initialWishes={PREVIEW_WISHES}
              musicUrl={musicCfg.enabled ? musicCfg.url : undefined}
              contained
            />
          </div>
        </div>
      )}


      {/*  Modal Simpan / Rilis Template  */}
      {showRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                {isEditMode ? <Save className="w-4 h-4 text-indigo-600" /> : <Rocket className="w-4 h-4 text-indigo-600" />}
                <h3 className="font-bold text-gray-900 text-sm">{isEditMode ? 'Simpan Perubahan' : 'Rilis Template'}</h3>
              </div>
              <button onClick={() => setShowRelease(false)} className="text-gray-400 hover:text-gray-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            {isEditMode ? (
              <>
                {/* Konfirmasi simpan   tanpa form */}
                <div className="px-6 py-6">
                  <p className="text-sm text-gray-700">
                    Simpan semua perubahan desain ke template <strong>{config.name}</strong>?
                  </p>
                  <p className="text-xs text-gray-400 mt-2">
                    {changeCount} perubahan akan disimpan ke database.
                  </p>
                </div>
                <div className="px-6 pb-5 flex gap-3">
                  <button
                    onClick={() => setShowRelease(false)}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={submitRelease}
                    disabled={releasing}
                    className="flex-1 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    {releasing ? 'Menyimpan...' : 'Simpan Perubahan'}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Konfirmasi rilis — data sudah dari editor */}
                <div className="px-6 py-5 space-y-4">
                  <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Nama</span>
                      <span className="text-sm font-bold text-gray-900">{config.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Slug</span>
                      <span className="text-xs font-mono text-indigo-600">{config.slug || config.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Kategori</span>
                      <span className="text-xs font-medium text-gray-700 capitalize">{config.config.meta.category || 'modern'}</span>
                    </div>
                    {templateDesc && (
                      <div className="flex justify-between items-start gap-4">
                        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider shrink-0">Deskripsi</span>
                        <span className="text-xs text-gray-600 text-right">{templateDesc}</span>
                      </div>
                    )}
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
                            checked={releaseStatus === s}
                            onChange={() => setReleaseStatus(s)}
                            className="accent-indigo-600"
                          />
                          <span className="text-xs font-medium text-gray-700">
                            {s === 'draft' ? 'Draft (tidak tampil ke user)' : 'Aktif (langsung tampil)'}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <p className="text-[10px] text-gray-400">
                    Harga & akses paket diatur di halaman Manajemen setelah rilis.
                  </p>
                </div>

                <div className="px-6 pb-5 flex gap-3">
                  <button
                    onClick={() => setShowRelease(false)}
                    className="flex-1 py-2.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={submitRelease}
                    disabled={releasing}
                    className="flex-1 py-2.5 text-sm font-semibold bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Rocket className="w-3.5 h-3.5" />
                    {releasing ? 'Menyimpan...' : 'Rilis Template'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

//  Decoration Layer List 

const IDLE_LABELS: Record<string, string> = {
  none: 'Tidak Ada', float: 'Melayang', pulse: 'Berdenyut', shimmer: 'Kilap',
  sway: 'Berayun', 'spin-slow': 'Berputar Lambat', heartbeat: 'Detak Jantung', 'drift-right': 'Geser Kanan-Kiri',
}
const ENTRY_LABELS: Record<string, string> = {
  none: 'Langsung', 'fade-in': 'Fade In', 'slide-left': 'Geser Kiri', 'slide-right': 'Geser Kanan',
  'slide-up': 'Naik', 'slide-down': 'Turun', 'zoom-in': 'Zoom In', 'rotate-in': 'Putar Masuk',
  custom: 'Custom Keyframe',
}
const EXIT_LABELS: Record<string, string> = {
  none: 'Tidak Ada', 'fade-out': 'Fade Out', 'slide-out-left': 'Keluar Kiri', 'slide-out-right': 'Keluar Kanan',
  'slide-out-up': 'Keluar Atas', 'slide-out-down': 'Keluar Bawah', 'zoom-out': 'Zoom Out', 'rotate-out': 'Putar Keluar',
  shrink: 'Mengecil', 'blur-out': 'Blur Keluar', custom: 'Custom Keyframe',
}
const EASING_LABELS: Record<string, string> = {
  ease: 'Ease', 'ease-in': 'Ease In', 'ease-out': 'Ease Out',
  'ease-in-out': 'Ease In-Out', spring: 'Spring', linear: 'Linear',
}

function updateAssetInList(
  assets: import('@/lib/types').DecorationAsset[],
  id: string,
  patch: Partial<import('@/lib/types').DecorationAsset>
) {
  return assets.map(a => a.id === id ? { ...a, ...patch } : a)
}

function DecorationLayerList({
  assets, onUpdate, onPreview, onPreviewExit, focusedId, onFocusChange,
}: {
  assets: import('@/lib/types').DecorationAsset[]
  onUpdate: (a: import('@/lib/types').DecorationAsset[]) => void
  onPreview: () => void
  onPreviewExit?: () => void
  focusedId?: string | null
  onFocusChange?: (id: string | null) => void
}) {
  const [showKfEntry, setShowKfEntry] = useState(false)
  const [showKfExit, setShowKfExit] = useState(false)

  const up = (id: string, patch: Partial<import('@/lib/types').DecorationAsset>) =>
    onUpdate(updateAssetInList(assets, id, patch))

  const asset = focusedId ? assets.find(a => a.id === focusedId) : null
  if (!asset) return null

  const maxZ = Math.max(0, ...assets.map(a => a.z_layer ?? 0))
  const minZ = Math.min(0, ...assets.map(a => a.z_layer ?? 0))

  const triggerPreview = () => { onPreview() }
  const triggerExitPreview = () => { onPreviewExit?.() }

  return (
    <div className="rounded-xl border border-gray-200 bg-white overflow-hidden shadow-sm">

      {/*  Header  */}
      <div className="flex items-center gap-2.5 px-3 py-2.5 bg-gradient-to-r from-indigo-50 to-violet-50 border-b border-gray-100">
        <img src={asset.url} alt="" className="w-9 h-9 object-contain rounded-lg border border-indigo-200 bg-white p-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <input
            type="text" value={asset.label ?? ''} placeholder="Nama aset..."
            onChange={e => up(asset.id, { label: e.target.value })}
            className="w-full text-xs font-bold text-gray-800 bg-transparent focus:outline-none placeholder:text-gray-400"
          />
          <div className="flex items-center gap-2 text-[8px] text-gray-400 font-mono mt-0.5">
            <span>{Math.round((asset.scale ?? 1) * 100)}%</span>
            <span>{asset.rotation ?? 0}°</span>
            <span className="text-indigo-500 font-bold">L{asset.z_layer ?? 0}</span>
          </div>
        </div>
        <button onClick={() => onFocusChange?.(null)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/*  Quick Actions  */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 bg-gray-50/80 border-b border-gray-100">
        <QBtn label="Depan" onClick={() => up(asset.id, { z_layer: maxZ + 1 })} icon="⤒" />
        <QBtn label="Maju" onClick={() => up(asset.id, { z_layer: (asset.z_layer ?? 0) + 1 })} icon="↑" />
        <QBtn label="Mundur" onClick={() => up(asset.id, { z_layer: (asset.z_layer ?? 0) - 1 })} icon="↓" />
        <QBtn label="Belakang" onClick={() => up(asset.id, { z_layer: minZ - 1 })} icon="⤓" />
        <div className="w-px h-4 bg-gray-200 mx-0.5" />
        <QBtn label="Flip H" onClick={() => up(asset.id, { flip_h: !asset.flip_h })} icon="↔" active={asset.flip_h} />
        <QBtn label="Flip V" onClick={() => up(asset.id, { flip_v: !asset.flip_v })} icon="↕" active={asset.flip_v} />
        <div className="flex-1" />
        <button onClick={() => { onUpdate(assets.filter(a => a.id !== asset.id)); onFocusChange?.(null) }}
          className="p-1 text-gray-300 hover:text-red-500 rounded transition-colors" title="Hapus">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      <div className="px-3 py-3 space-y-4">

        {/*  TRANSFORM  */}
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Transform</p>
          <DSlider label="Ukuran" value={Math.round((asset.scale ?? 1) * 100)} min={10} max={300} step={5} unit="%"
            onChange={v => up(asset.id, { scale: v / 100 })} />
          <DSlider label="Opacity" value={asset.opacity ?? 100} min={5} max={100} step={5} unit="%"
            onChange={v => up(asset.id, { opacity: v })} />
          <DSlider label="Rotasi" value={asset.rotation ?? 0} min={-180} max={180} step={5} unit="°"
            onChange={v => up(asset.id, { rotation: v })} />
        </div>

        <div className="h-px bg-gray-100" />

        {/*  ANIMASI MASUK  */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <p className="text-[9px] font-bold text-emerald-700 uppercase tracking-widest flex-1">Masuk</p>
            <button onClick={triggerPreview}
              className="text-[8px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-full transition-colors">
              ▶ Preview
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <select value={asset.animation ?? 'fade-in'}
              onChange={e => { up(asset.id, { animation: e.target.value as import('@/lib/types').AssetAnimation }); setTimeout(triggerPreview, 100) }}
              className="col-span-2 text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white">
              {Object.entries(ENTRY_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <div className="flex items-center gap-0.5">
              <input type="number" min={0} max={4000} step={100}
                value={asset.animation_delay ?? 0}
                onChange={e => up(asset.id, { animation_delay: Number(e.target.value) })}
                className="flex-1 w-full text-[11px] border border-gray-200 rounded-lg px-1.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-400 bg-white text-center font-mono"
              />
              <span className="text-[7px] text-gray-400 shrink-0">ms</span>
            </div>
          </div>
          {asset.animation === 'custom' && (
            <KfPanel
              color="emerald"
              keyframes={asset.entry_keyframes ?? { from: { opacity: 0 }, to: { opacity: 1 } }}
              onChange={kf => { up(asset.id, { entry_keyframes: kf }); setTimeout(triggerPreview, 100) }}
              presets={ENTRY_PRESETS}
              expanded={showKfEntry}
              onToggle={() => setShowKfEntry(!showKfEntry)}
            />
          )}
        </div>

        {/*  ANIMASI LOOP  */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
            <p className="text-[9px] font-bold text-indigo-700 uppercase tracking-widest">Loop</p>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <select value={asset.idle_animation ?? 'none'}
              onChange={e => up(asset.id, { idle_animation: e.target.value as import('@/lib/types').AssetIdleAnimation })}
              className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white">
              {Object.entries(IDLE_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            {(asset.idle_animation ?? 'none') !== 'none' && (
              <select value={asset.idle_speed ?? 'normal'}
                onChange={e => up(asset.id, { idle_speed: e.target.value as 'slow' | 'normal' | 'fast' })}
                className="text-[11px] border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white">
                <option value="slow">Lambat</option>
                <option value="normal">Normal</option>
                <option value="fast">Cepat</option>
              </select>
            )}
          </div>
        </div>

        {/*  ANIMASI KELUAR  */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <p className="text-[9px] font-bold text-rose-700 uppercase tracking-widest flex-1">Keluar</p>
            {onPreviewExit && (
              <button onClick={triggerExitPreview}
                className="text-[8px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 px-2 py-0.5 rounded-full transition-colors">
                ◀ Preview
              </button>
            )}
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            <select value={asset.exit_animation ?? 'none'}
              onChange={e => { up(asset.id, { exit_animation: e.target.value as import('@/lib/types').AssetExitAnimation }); if (e.target.value !== 'none') setTimeout(triggerExitPreview, 100) }}
              className="col-span-2 text-[11px] border border-rose-100 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-400 bg-white">
              {Object.entries(EXIT_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <div className="flex items-center gap-0.5">
              <input type="number" min={0} max={4000} step={100}
                value={asset.exit_delay ?? 0}
                onChange={e => up(asset.id, { exit_delay: Number(e.target.value) })}
                className="flex-1 w-full text-[11px] border border-gray-200 rounded-lg px-1.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-400 bg-white text-center font-mono"
              />
              <span className="text-[7px] text-gray-400 shrink-0">ms</span>
            </div>
          </div>
          {asset.exit_animation === 'custom' && (
            <KfPanel
              color="rose"
              keyframes={asset.exit_keyframes ?? { from: { opacity: 1 }, to: { opacity: 0 } }}
              onChange={kf => { up(asset.id, { exit_keyframes: kf }); setTimeout(triggerExitPreview, 100) }}
              presets={EXIT_PRESETS}
              expanded={showKfExit}
              onToggle={() => setShowKfExit(!showKfExit)}
            />
          )}
        </div>

      </div>
    </div>
  )
}

//  Decoration sub-components 

function QBtn({ label, onClick, icon, active }: { label: string; onClick: () => void; icon: string; active?: boolean }) {
  return (
    <button onClick={onClick} title={label}
      className={`w-6 h-6 text-xs font-bold rounded-md border transition-colors flex items-center justify-center ${
        active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-400 border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
      }`}>
      {icon}
    </button>
  )
}

function DSlider({ label, value, min, max, step, unit, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; onChange: (v: number) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-semibold text-gray-500 w-[42px] shrink-0">{label}</span>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-indigo-600 h-1.5" />
      <input type="number" min={min} max={max} step={step} value={value}
        onChange={e => { const v = Number(e.target.value); if (v >= min && v <= max) onChange(v) }}
        className="w-12 px-1 py-0.5 text-[10px] text-center border border-gray-200 rounded-md focus:border-indigo-400 focus:outline-none font-mono" />
      <span className="text-[8px] text-gray-400 w-[10px]">{unit}</span>
    </div>
  )
}

//  Keyframe Presets & Panel 

type KfConfig = import('@/lib/types').AssetKeyframeConfig

const ENTRY_PRESETS: { label: string; icon: string; kf: KfConfig }[] = [
  { label: 'Fade Naik', icon: '↑', kf: { from: { opacity: 0, y: 40 }, to: { opacity: 1, y: 0 }, duration: 800, easing: 'ease-out' } },
  { label: 'Fade Turun', icon: '↓', kf: { from: { opacity: 0, y: -40 }, to: { opacity: 1, y: 0 }, duration: 800, easing: 'ease-out' } },
  { label: 'Fade Kiri', icon: '←', kf: { from: { opacity: 0, x: -60 }, to: { opacity: 1, x: 0 }, duration: 800, easing: 'ease-out' } },
  { label: 'Fade Kanan', icon: '→', kf: { from: { opacity: 0, x: 60 }, to: { opacity: 1, x: 0 }, duration: 800, easing: 'ease-out' } },
  { label: 'Zoom Blur', icon: '◎', kf: { from: { opacity: 0, scale: 0.3, blur: 10 }, to: { opacity: 1, scale: 1, blur: 0 }, duration: 1000, easing: 'ease' } },
  { label: 'Putar Masuk', icon: '↻', kf: { from: { opacity: 0, rotate: -90, scale: 0.5 }, to: { opacity: 1, rotate: 0, scale: 1 }, duration: 900, easing: 'spring' } },
  { label: 'Pop Elastis', icon: '◉', kf: { from: { opacity: 0, scale: 0 }, to: { opacity: 1, scale: 1 }, duration: 600, easing: 'spring' } },
  { label: 'Muncul Halus', icon: '○', kf: { from: { opacity: 0 }, to: { opacity: 1 }, duration: 1200, easing: 'ease-in-out' } },
]

const EXIT_PRESETS: { label: string; icon: string; kf: KfConfig }[] = [
  { label: 'Fade Naik', icon: '↑', kf: { from: { opacity: 1, y: 0 }, to: { opacity: 0, y: -50 }, duration: 600, easing: 'ease-in' } },
  { label: 'Fade Turun', icon: '↓', kf: { from: { opacity: 1, y: 0 }, to: { opacity: 0, y: 50 }, duration: 600, easing: 'ease-in' } },
  { label: 'Zoom Blur', icon: '◎', kf: { from: { opacity: 1, scale: 1, blur: 0 }, to: { opacity: 0, scale: 1.5, blur: 12 }, duration: 700, easing: 'ease-in' } },
  { label: 'Putar Keluar', icon: '↺', kf: { from: { opacity: 1, rotate: 0, scale: 1 }, to: { opacity: 0, rotate: 90, scale: 0.3 }, duration: 700, easing: 'ease-in' } },
  { label: 'Mengecil', icon: '·', kf: { from: { opacity: 1, scale: 1 }, to: { opacity: 0, scale: 0 }, duration: 500, easing: 'ease-in' } },
  { label: 'Blur Hilang', icon: '◌', kf: { from: { opacity: 1, blur: 0 }, to: { opacity: 0, blur: 20 }, duration: 800, easing: 'ease' } },
]

function KfPanel({ color, keyframes, onChange, presets, expanded, onToggle }: {
  color: 'emerald' | 'rose'
  keyframes: KfConfig
  onChange: (kf: KfConfig) => void
  presets: typeof ENTRY_PRESETS
  expanded: boolean
  onToggle: () => void
}) {
  const accent = color === 'emerald' ? 'emerald' : 'rose'
  const bg = color === 'emerald' ? 'bg-emerald-50/60 border-emerald-200' : 'bg-rose-50/60 border-rose-200'
  const activeBtn = color === 'emerald' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-rose-500 text-white shadow-sm'

  const updateState = (side: 'from' | 'to', patch: Partial<import('@/lib/types').AssetKeyframeState>) =>
    onChange({ ...keyframes, [side]: { ...keyframes[side], ...patch } })
  const clearProp = (side: 'from' | 'to', prop: keyof import('@/lib/types').AssetKeyframeState) => {
    const copy = { ...keyframes[side] }
    delete copy[prop]
    onChange({ ...keyframes, [side]: copy })
  }

  return (
    <div className={`${bg} border rounded-xl p-2.5 space-y-2`}>
      {/* Preset grid */}
      <div className="grid grid-cols-4 gap-1">
        {presets.map(p => {
          const isActive = JSON.stringify(keyframes.from) === JSON.stringify(p.kf.from) &&
            JSON.stringify(keyframes.to) === JSON.stringify(p.kf.to)
          return (
            <button key={p.label} type="button"
              onClick={() => onChange(p.kf)}
              className={`py-1.5 px-1 rounded-lg text-center transition-all ${
                isActive ? activeBtn : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-sm block leading-none">{p.icon}</span>
              <span className="text-[7px] font-bold block mt-0.5 leading-tight">{p.label}</span>
            </button>
          )
        })}
      </div>

      {/* Duration & Easing */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <p className="text-[8px] font-semibold text-gray-500 mb-0.5">Durasi</p>
          <div className="flex items-center gap-1">
            <input type="range" min={100} max={3000} step={50}
              value={keyframes.duration ?? 900}
              onChange={e => onChange({ ...keyframes, duration: Number(e.target.value) })}
              className={`flex-1 h-1.5 accent-${accent}-500`}
            />
            <span className="text-[9px] text-gray-500 font-mono w-[30px] text-right">{keyframes.duration ?? 900}</span>
            <span className="text-[7px] text-gray-400">ms</span>
          </div>
        </div>
        <div>
          <p className="text-[8px] font-semibold text-gray-500 mb-0.5">Easing</p>
          <select value={keyframes.easing ?? 'ease'}
            onChange={e => onChange({ ...keyframes, easing: e.target.value as import('@/lib/types').AssetKeyframeEasing })}
            className="w-full text-[10px] border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-400 bg-white">
            {Object.entries(EASING_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      {/* Summary / expand toggle */}
      <button onClick={onToggle}
        className="w-full flex items-center justify-between px-2 py-1.5 bg-white/60 rounded-lg text-[8px] text-gray-400 font-mono hover:bg-white/80 transition-colors">
        <span>
          <span className="text-gray-500 font-bold">From:</span>{' '}
          <KfBrief state={keyframes.from} />
          <span className="text-gray-300 mx-1">→</span>
          <span className="text-gray-500 font-bold">To:</span>{' '}
          <KfBrief state={keyframes.to} />
        </span>
        <span className="text-[9px] ml-2">{expanded ? '▲' : '▼'}</span>
      </button>

      {/* Manual detail editor */}
      {expanded && (
        <div className="space-y-2 pt-1 border-t border-gray-200/60">
          <KfFields label="DARI (From)" state={keyframes.from} color={color}
            onUpdate={p => updateState('from', p)} onClear={p => clearProp('from', p)} />
          <div className="flex items-center gap-1 px-2">
            <div className="flex-1 h-px bg-gray-300/50" />
            <span className="text-[10px] text-gray-400">▼</span>
            <div className="flex-1 h-px bg-gray-300/50" />
          </div>
          <KfFields label="KE (To)" state={keyframes.to} color={color}
            onUpdate={p => updateState('to', p)} onClear={p => clearProp('to', p)} />
        </div>
      )}
    </div>
  )
}

function KfBrief({ state }: { state: import('@/lib/types').AssetKeyframeState }) {
  const p: string[] = []
  if (state.opacity !== undefined) p.push(`op:${state.opacity}`)
  if (state.x !== undefined) p.push(`x:${state.x}`)
  if (state.y !== undefined) p.push(`y:${state.y}`)
  if (state.scale !== undefined) p.push(`s:${state.scale}`)
  if (state.rotate !== undefined) p.push(`r:${state.rotate}°`)
  if (state.blur !== undefined) p.push(`b:${state.blur}`)
  return <span className="truncate">{p.length ? p.join(' ') : ' '}</span>
}

const KF_FIELDS: { key: keyof import('@/lib/types').AssetKeyframeState; label: string; min: number; max: number; step: number; unit: string }[] = [
  { key: 'opacity', label: 'Opacity', min: 0, max: 1, step: 0.05, unit: '' },
  { key: 'x', label: 'X', min: -300, max: 300, step: 5, unit: 'px' },
  { key: 'y', label: 'Y', min: -300, max: 300, step: 5, unit: 'px' },
  { key: 'scale', label: 'Scale', min: 0, max: 3, step: 0.1, unit: 'x' },
  { key: 'rotate', label: 'Rotate', min: -360, max: 360, step: 15, unit: '°' },
  { key: 'blur', label: 'Blur', min: 0, max: 30, step: 1, unit: 'px' },
]

function KfFields({ label, state, color, onUpdate, onClear }: {
  label: string; state: import('@/lib/types').AssetKeyframeState; color: 'emerald' | 'rose'
  onUpdate: (p: Partial<import('@/lib/types').AssetKeyframeState>) => void
  onClear: (p: keyof import('@/lib/types').AssetKeyframeState) => void
}) {
  const titleColor = color === 'emerald' ? 'text-emerald-700' : 'text-rose-700'
  return (
    <div>
      <p className={`text-[8px] font-bold ${titleColor} uppercase tracking-wider mb-1`}>{label}</p>
      <div className="grid grid-cols-2 gap-x-3 gap-y-1">
        {KF_FIELDS.map(f => {
          const val = state[f.key]
          const hasValue = val !== undefined
          return (
            <div key={f.key} className="flex items-center gap-1">
              <span className={`text-[8px] w-[36px] shrink-0 ${hasValue ? 'font-bold text-gray-600' : 'text-gray-300'}`}>{f.label}</span>
              {hasValue ? (
                <>
                  <input type="range" min={f.min} max={f.max} step={f.step}
                    value={val} onChange={e => onUpdate({ [f.key]: Number(e.target.value) })}
                    className="flex-1 h-1 accent-indigo-500" />
                  <span className="text-[8px] text-gray-500 font-mono w-[28px] text-right">{val}{f.unit}</span>
                  <button onClick={() => onClear(f.key)} className="text-[9px] text-gray-300 hover:text-red-400 leading-none">×</button>
                </>
              ) : (
                <button onClick={() => onUpdate({ [f.key]: f.key === 'opacity' ? 1 : 0 })}
                  className="text-[8px] text-indigo-400 hover:text-indigo-600 font-semibold">+ Tambah</button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

//  Helper components 

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
