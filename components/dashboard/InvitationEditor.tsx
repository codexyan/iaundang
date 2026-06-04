'use client'

import { useState, useRef, useCallback } from 'react'
import { Reorder, motion, AnimatePresence, useDragControls } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  GripVertical, ChevronDown, ToggleLeft, ToggleRight, Loader2, Check,
  ExternalLink, Sparkles, Users, Timer, Heart, MapPin, Image, Gift,
  CheckSquare, MessageSquare, Video, BookOpen, Clock,
  Upload, Trash2, ChevronUp, Plus,
} from 'lucide-react'
import type { Invitation, NewInvitationData, TemplateRecord, GiftAccount, SectionType, StoryChapter } from '@/lib/types'
import InvitationPreview from '@/components/renderer/InvitationPreview'

// ── Types ──────────────────────────────────────────────────────

interface EditorSection {
  id: string
  type: SectionType
  enabled: boolean
  order: number
}

interface Props {
  invitation: Invitation
  template: TemplateRecord
  onSaved: (inv: Invitation) => void
}

// ── Section icons (lucide — no emojis) ────────────────────────

const SICONS: Record<string, React.ElementType> = {
  hero: Sparkles, profiles: Users, countdown: Timer, story: Heart,
  events: MapPin, gallery: Image, gift: Gift, rsvp: CheckSquare,
  wishes: MessageSquare, livestream: Video, closing: BookOpen,
}

const SLABELS: Record<string, string> = {
  hero: 'Cover / Hero', profiles: 'Profil Mempelai', countdown: 'Hitung Mundur',
  story: 'Kisah Cinta', events: 'Detail Acara', gallery: 'Galeri Foto',
  gift: 'Amplop Digital', rsvp: 'Konfirmasi Hadir', wishes: 'Buku Ucapan',
  livestream: 'Live Streaming', closing: 'Penutup',
}

// ── Helpers ────────────────────────────────────────────────────

function initData(inv: Invitation): NewInvitationData {
  const d = inv.data as unknown as NewInvitationData
  return {
    groom_name: d.groom_name ?? '',
    bride_name: d.bride_name ?? '',
    groom_parents: d.groom_parents ?? '',
    bride_parents: d.bride_parents ?? '',
    tagline: d.tagline ?? '',
    groom_photo_url: d.groom_photo_url ?? '',
    bride_photo_url: d.bride_photo_url ?? '',
    groom_bio: d.groom_bio ?? '',
    bride_bio: d.bride_bio ?? '',
    couple_photo_url: d.couple_photo_url ?? '',
    hero_video_url: d.hero_video_url ?? '',
    akad: d.akad ?? { date: '', time: '08:00', venue_name: '', venue_address: '' },
    resepsi: d.resepsi ?? { date: '', time: '11:00', venue_name: '', venue_address: '' },
    story_title: d.story_title ?? '',
    story_text: d.story_text ?? '',
    closing_text: d.closing_text ?? '',
    thank_you_message: d.thank_you_message ?? '',
    gift_accounts: d.gift_accounts ?? [],
    gallery_photos: d.gallery_photos ?? [],
    story_chapters: d.story_chapters ?? [],
    music_url: d.music_url ?? '',
    livestream_url: d.livestream_url ?? '',
  }
}

function initSections(
  template: TemplateRecord,
  saved?: { id: string; type: SectionType; enabled: boolean; order: number }[]
): EditorSection[] {
  const source = saved && saved.length > 0
    ? saved.sort((a, b) => a.order - b.order)
    : [...template.config.sections].sort((a, b) => a.order - b.order)
  return source.map((s, i) => ({ id: s.id, type: s.type, enabled: s.enabled, order: i + 1 }))
}

// ── Tiny input helpers ─────────────────────────────────────────

const ic = 'w-full px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-rose-400 bg-white placeholder:text-gray-300 transition-all'

function F({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      {children}
      {hint && <p className="text-[9px] text-gray-400">{hint}</p>}
    </div>
  )
}

function InfoBox({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg text-xs text-gray-500">
      <Icon size={12} className="shrink-0" />
      <span>{text}</span>
    </div>
  )
}

// ── Section form per type ──────────────────────────────────────

function SectionForm({ type, data, onChange }: {
  type: SectionType
  data: NewInvitationData
  onChange: (p: Partial<NewInvitationData>) => void
}) {
  const akad = data.akad ?? { date: '', time: '08:00', venue_name: '', venue_address: '' }
  const resepsi = data.resepsi ?? { date: '', time: '11:00', venue_name: '', venue_address: '' }

  switch (type) {
    case 'hero': return <HeroForm data={data} onChange={onChange} />

    case 'profiles': return (
      <div className="space-y-3">
        <div className="p-2.5 bg-blue-50 rounded-lg space-y-2">
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">Pria</p>
          <F label="Nama Orang Tua">
            <input className={ic} value={data.groom_parents ?? ''} onChange={e => onChange({ groom_parents: e.target.value })} placeholder="Bpk. Ahmad & Ibu Sri" />
          </F>
          <div className="grid grid-cols-2 gap-2">
            <F label="URL Foto">
              <div className="flex gap-1.5">
                <input className={ic} value={data.groom_photo_url ?? ''} onChange={e => onChange({ groom_photo_url: e.target.value })} placeholder="https://..." />
                {data.groom_photo_url && <div className="w-7 h-7 rounded-full overflow-hidden border shrink-0"><img src={data.groom_photo_url} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} /></div>}
              </div>
            </F>
            <F label="Bio (opsional)">
              <input className={ic} value={data.groom_bio ?? ''} onChange={e => onChange({ groom_bio: e.target.value })} placeholder="Software Engineer" />
            </F>
          </div>
        </div>
        <div className="p-2.5 bg-rose-50 rounded-lg space-y-2">
          <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wide">Wanita</p>
          <F label="Nama Orang Tua">
            <input className={ic} value={data.bride_parents ?? ''} onChange={e => onChange({ bride_parents: e.target.value })} placeholder="Bpk. Hendra & Ibu Dewi" />
          </F>
          <div className="grid grid-cols-2 gap-2">
            <F label="URL Foto">
              <div className="flex gap-1.5">
                <input className={ic} value={data.bride_photo_url ?? ''} onChange={e => onChange({ bride_photo_url: e.target.value })} placeholder="https://..." />
                {data.bride_photo_url && <div className="w-7 h-7 rounded-full overflow-hidden border shrink-0"><img src={data.bride_photo_url} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none' }} /></div>}
              </div>
            </F>
            <F label="Bio (opsional)">
              <input className={ic} value={data.bride_bio ?? ''} onChange={e => onChange({ bride_bio: e.target.value })} placeholder="Desainer, 25 thn" />
            </F>
          </div>
        </div>
      </div>
    )

    case 'countdown': return (
      <InfoBox icon={Clock} text="Otomatis dihitung dari tanggal akad. Isi di bagian Detail Acara." />
    )

    case 'events': return (
      <div className="space-y-3">
        <div className="space-y-2">
          <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Akad Nikah</p>
          <div className="grid grid-cols-2 gap-2">
            <F label="Tanggal *"><input type="date" className={ic} value={akad.date} onChange={e => onChange({ akad: { ...akad, date: e.target.value } })} /></F>
            <F label="Waktu *"><input type="time" className={ic} value={akad.time} onChange={e => onChange({ akad: { ...akad, time: e.target.value } })} /></F>
          </div>
          <F label="Nama Tempat *"><input className={ic} value={akad.venue_name} onChange={e => onChange({ akad: { ...akad, venue_name: e.target.value } })} placeholder="Masjid Al-Ikhlas" /></F>
          <F label="Alamat *"><textarea className={`${ic} resize-none`} rows={2} value={akad.venue_address} onChange={e => onChange({ akad: { ...akad, venue_address: e.target.value } })} placeholder="Jl. Mawar No. 12..." /></F>
          <F label="Google Maps"><input className={ic} value={akad.maps_url ?? ''} onChange={e => onChange({ akad: { ...akad, maps_url: e.target.value } })} placeholder="https://maps.google.com/..." /></F>
        </div>
        <div className="border-t border-gray-100 pt-3 space-y-2">
          <div className="flex items-center gap-3">
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Resepsi</p>
            <label className="flex items-center gap-1 text-[10px] text-gray-400 cursor-pointer">
              <input type="checkbox" className="w-3 h-3 accent-rose-500" checked={resepsi.date === akad.date && !!akad.date} onChange={e => e.target.checked && onChange({ resepsi: { ...resepsi, date: akad.date } })} />
              Tanggal sama
            </label>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <F label="Tanggal *"><input type="date" className={ic} value={resepsi.date} onChange={e => onChange({ resepsi: { ...resepsi, date: e.target.value } })} /></F>
            <F label="Waktu *"><input type="time" className={ic} value={resepsi.time} onChange={e => onChange({ resepsi: { ...resepsi, time: e.target.value } })} /></F>
          </div>
          <F label="Nama Tempat *"><input className={ic} value={resepsi.venue_name} onChange={e => onChange({ resepsi: { ...resepsi, venue_name: e.target.value } })} placeholder="Ballroom Hotel Grand" /></F>
          <F label="Alamat *"><textarea className={`${ic} resize-none`} rows={2} value={resepsi.venue_address} onChange={e => onChange({ resepsi: { ...resepsi, venue_address: e.target.value } })} placeholder="Jl. Sudirman No. 86..." /></F>
          <F label="Google Maps"><input className={ic} value={resepsi.maps_url ?? ''} onChange={e => onChange({ resepsi: { ...resepsi, maps_url: e.target.value } })} placeholder="https://maps.google.com/..." /></F>
        </div>
      </div>
    )

    case 'story': return <StoryForm data={data} onChange={onChange} />

    case 'gallery': return (
      <InfoBox icon={Image} text="Kelola foto di tab Galeri (upload, hapus, lihat limit)." />
    )

    case 'gift': return <GiftForm data={data} onChange={onChange} />

    case 'rsvp': return (
      <InfoBox icon={CheckSquare} text="Form RSVP otomatis tampil. Lihat hasilnya di tab RSVP." />
    )

    case 'wishes': return (
      <InfoBox icon={MessageSquare} text="Buku ucapan otomatis tampil dan tamu bisa menulis." />
    )

    case 'livestream': return (
      <F label="Link Live Stream">
        <input className={ic} value={data.livestream_url ?? ''} onChange={e => onChange({ livestream_url: e.target.value })} placeholder="https://youtube.com/live/..." />
      </F>
    )

    case 'closing': return (
      <div className="space-y-2">
        <F label="Kalimat Penutup">
          <textarea className={`${ic} resize-none`} rows={3} value={data.closing_text ?? ''} onChange={e => onChange({ closing_text: e.target.value })} placeholder="Merupakan suatu kehormatan..." />
        </F>
        <F label="Pesan Terima Kasih">
          <input className={ic} value={data.thank_you_message ?? ''} onChange={e => onChange({ thank_you_message: e.target.value })} placeholder="Terima kasih atas doa dan kehadiran Anda" />
        </F>
      </div>
    )

    default: return null
  }
}

// ── Hero Form ──────────────────────────────────────────────────

function HeroForm({ data, onChange }: { data: NewInvitationData; onChange: (p: Partial<NewInvitationData>) => void }) {
  const [uploading, setUploading] = useState<'photo' | 'video' | null>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  async function upload(file: File, type: 'photo' | 'video') {
    setUploading(type)
    const form = new FormData()
    form.append('file', file)
    form.append('folder', 'hero')
    const res = await fetch('/api/user/upload', { method: 'POST', body: form })
    setUploading(null)
    if (!res.ok) { toast.error('Gagal upload'); return }
    const { url, type: fileType } = await res.json()
    if (fileType === 'video') {
      onChange({ hero_video_url: url, couple_photo_url: '' })
    } else {
      onChange({ couple_photo_url: url, hero_video_url: '' })
    }
    toast.success('Background terupload')
  }

  const hasVideo = !!data.hero_video_url
  const hasPhoto = !!data.couple_photo_url && !hasVideo

  return (
    <div className="space-y-2.5">
      {/* Nama & tagline */}
      <div className="grid grid-cols-2 gap-2">
        <F label="Nama Pria *">
          <input className={ic} value={data.groom_name} onChange={e => onChange({ groom_name: e.target.value })} placeholder="Budi Santoso" />
        </F>
        <F label="Nama Wanita *">
          <input className={ic} value={data.bride_name} onChange={e => onChange({ bride_name: e.target.value })} placeholder="Ani Rahayu" />
        </F>
      </div>
      <F label="Tagline / Ayat">
        <textarea className={`${ic} resize-none`} rows={2} value={data.tagline ?? ''}
          onChange={e => onChange({ tagline: e.target.value })} placeholder="Dan di antara tanda-tanda kekuasaan-Nya..." />
      </F>

      {/* Background foto / video */}
      <div>
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">
          Background Hero
          <span className="ml-1 font-normal normal-case text-[9px]">Foto (8MB) atau Video pendek (80MB)</span>
        </p>
        <input ref={photoRef} type="file" accept="image/*" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f, 'photo') }} />
        <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) upload(f, 'video') }} />

        {hasVideo ? (
          <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '16/7' }}>
            <video src={data.hero_video_url} muted loop className="w-full h-full object-cover opacity-75" />
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              <button onClick={() => videoRef.current?.click()}
                className="flex items-center gap-1 bg-white/90 text-gray-800 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg">
                <Upload size={10} /> Ganti Video
              </button>
              <button onClick={() => onChange({ hero_video_url: '' })}
                className="flex items-center gap-1 bg-red-500/90 text-white text-[10px] font-semibold px-2 py-1.5 rounded-lg">
                <Trash2 size={10} />
              </button>
            </div>
          </div>
        ) : hasPhoto ? (
          <div className="relative rounded-xl overflow-hidden" style={{ aspectRatio: '16/7' }}>
            <img src={data.couple_photo_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center gap-2 opacity-0 hover:opacity-100 transition-opacity">
              <button onClick={() => photoRef.current?.click()}
                className="flex items-center gap-1 bg-white/90 text-gray-800 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg">
                <Upload size={10} /> Ganti Foto
              </button>
              <button onClick={() => videoRef.current?.click()}
                className="flex items-center gap-1 bg-gray-900/90 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg">
                ▶ Pakai Video
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => photoRef.current?.click()} disabled={!!uploading}
              className="flex-1 py-5 border border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-1.5 text-gray-400 hover:border-rose-300 hover:text-rose-400 transition-colors disabled:opacity-50">
              {uploading === 'photo' ? <><Loader2 size={16} className="animate-spin" /><span className="text-[9px]">Upload...</span></>
                : <><Image size={16} /><span className="text-[9px] font-medium">Upload Foto</span></>}
            </button>
            <button onClick={() => videoRef.current?.click()} disabled={!!uploading}
              className="flex-1 py-5 border border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-1.5 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-colors disabled:opacity-50">
              {uploading === 'video' ? <><Loader2 size={16} className="animate-spin" /><span className="text-[9px]">Upload...</span></>
                : <><span className="text-base">▶</span><span className="text-[9px] font-medium">Upload Video</span></>}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Story Form ─────────────────────────────────────────────────

type StoryMode = 'text' | 'timeline' | 'cinematic'

function StoryForm({ data, onChange }: { data: NewInvitationData; onChange: (p: Partial<NewInvitationData>) => void }) {
  const chapters  = data.story_chapters  ?? []
  const timeline  = data.story_timeline  ?? []

  const mode: StoryMode =
    chapters.length  > 0 ? 'cinematic' :
    timeline.length  > 0 ? 'timeline'  : 'text'

  const [expandedIdx, setExpandedIdx]   = useState<number | null>(0)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const [uploadType, setUploadType]     = useState<Record<number, 'photo' | 'video'>>({})
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  // ─── mode switch ───────────────────────────────────────────
  function setMode(m: StoryMode) {
    if (m === 'cinematic') {
      onChange({ story_timeline: [], story_chapters: chapters.length ? chapters : [{ title: '', text: '', date: '' }] })
    } else if (m === 'timeline') {
      onChange({ story_chapters: [], story_timeline: timeline.length ? timeline : [{ date: '', title: '', description: '' }] })
    } else {
      onChange({ story_chapters: [], story_timeline: [] })
    }
    setExpandedIdx(0)
  }

  // ─── timeline helpers ──────────────────────────────────────
  function updateItem(i: number, patch: Partial<typeof timeline[number]>) {
    onChange({ story_timeline: timeline.map((t, j) => j === i ? { ...t, ...patch } : t) })
  }
  function addItem() {
    const next = [...timeline, { date: '', title: '', description: '' }]
    onChange({ story_timeline: next })
    setExpandedIdx(next.length - 1)
  }
  function removeItem(i: number) {
    const next = timeline.filter((_, j) => j !== i)
    onChange({ story_timeline: next.length ? next : [] })
    if (next.length === 0) onChange({ story_timeline: [] })
    setExpandedIdx(null)
  }
  function moveItem(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= timeline.length) return
    const next = [...timeline];
    [next[i], next[j]] = [next[j], next[i]]
    onChange({ story_timeline: next })
    setExpandedIdx(j)
  }

  // ─── chapter helpers ───────────────────────────────────────
  function updateChapter(i: number, patch: Partial<StoryChapter>) {
    onChange({ story_chapters: chapters.map((c, j) => j === i ? { ...c, ...patch } : c) })
  }
  function addChapter() {
    const next = [...chapters, { title: '', text: '', date: '' }]
    onChange({ story_chapters: next })
    setExpandedIdx(next.length - 1)
  }
  function removeChapter(i: number) {
    const next = chapters.filter((_, j) => j !== i)
    onChange({ story_chapters: next })
    setExpandedIdx(null)
  }
  function moveChapter(i: number, dir: -1 | 1) {
    const j = i + dir
    if (j < 0 || j >= chapters.length) return
    const next = [...chapters];
    [next[i], next[j]] = [next[j], next[i]]
    onChange({ story_chapters: next })
    setExpandedIdx(j)
  }

  async function uploadMedia(i: number, file: File) {
    setUploadingIdx(i)
    const form = new FormData()
    form.append('file', file)
    form.append('folder', 'stories')
    const res = await fetch('/api/user/upload', { method: 'POST', body: form })
    setUploadingIdx(null)
    if (!res.ok) { toast.error('Gagal upload'); return }
    const { url, type } = await res.json()
    if (type === 'video') {
      updateChapter(i, { video_url: url, photo_url: '' })
      setUploadType(t => ({ ...t, [i]: 'video' }))
      toast.success('Video terupload')
    } else {
      updateChapter(i, { photo_url: url, video_url: '' })
      setUploadType(t => ({ ...t, [i]: 'photo' }))
      toast.success('Foto terupload')
    }
  }

  const MODES: { id: StoryMode; label: string }[] = [
    { id: 'text',      label: '✍ Teks' },
    { id: 'timeline',  label: '📅 Timeline' },
    { id: 'cinematic', label: '🎬 Sinematik' },
  ]

  return (
    <div className="space-y-2.5">
      {/* Mode toggle */}
      <div className="flex rounded-lg overflow-hidden border border-gray-200 text-[10px] font-semibold">
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`flex-1 py-1.5 transition-colors ${mode === m.id ? 'bg-rose-500 text-white' : 'bg-white text-gray-400 hover:text-gray-600'}`}>
            {m.label}
          </button>
        ))}
      </div>

      {/* ── TEKS ── */}
      {mode === 'text' && (
        <div className="space-y-2">
          <F label="Judul">
            <input className={ic} value={data.story_title ?? ''} onChange={e => onChange({ story_title: e.target.value })} placeholder="Kisah Kami" />
          </F>
          <F label="Cerita" hint={`${(data.story_text ?? '').length}/600`}>
            <textarea className={`${ic} resize-none`} rows={5} maxLength={600} value={data.story_text ?? ''}
              onChange={e => onChange({ story_text: e.target.value })} placeholder="Kami pertama kali bertemu di..." />
          </F>
        </div>
      )}

      {/* ── TIMELINE ── */}
      {mode === 'timeline' && (
        <div className="space-y-1.5">
          <p className="text-[9px] text-gray-400">Tambah poin perjalanan sebanyak yang kamu mau.</p>
          {timeline.map((item, i) => (
            <div key={i} className={`rounded-lg border overflow-hidden transition-all ${expandedIdx === i ? 'border-rose-200' : 'border-gray-100'}`}>
              <div className="flex items-center h-8 px-2 gap-1.5 bg-white">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-20"><ChevronUp size={10} /></button>
                  <button onClick={() => moveItem(i, 1)} disabled={i === timeline.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-20"><ChevronDown size={10} /></button>
                </div>
                <button className="flex-1 text-left" onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}>
                  <span className="text-[10px] font-medium text-gray-600 truncate block">
                    {item.date ? <span className="text-rose-400 mr-1">{item.date}</span> : null}{item.title || `Poin ${i + 1}`}
                  </span>
                </button>
                <button onClick={() => removeItem(i)} className="text-gray-200 hover:text-red-400 shrink-0"><Trash2 size={11} /></button>
                <button onClick={() => setExpandedIdx(expandedIdx === i ? null : i)} className="shrink-0">
                  <ChevronDown size={10} className={`text-gray-300 transition-transform ${expandedIdx === i ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <AnimatePresence>
                {expandedIdx === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.13 }} className="overflow-hidden">
                    <div className="px-2.5 pb-2.5 pt-1.5 border-t border-gray-50 space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <F label="Tanggal / Tahun *">
                          <input className={ic} value={item.date} onChange={e => updateItem(i, { date: e.target.value })} placeholder="2019" />
                        </F>
                        <F label="Judul *">
                          <input className={ic} value={item.title} onChange={e => updateItem(i, { title: e.target.value })} placeholder="Pertama Bertemu" />
                        </F>
                      </div>
                      <F label="Keterangan" hint="Opsional">
                        <textarea className={`${ic} resize-none`} rows={2} value={item.description ?? ''}
                          onChange={e => updateItem(i, { description: e.target.value })} placeholder="Cerita singkat..." />
                      </F>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <button onClick={addItem}
            className="w-full py-2 border border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-semibold text-gray-400 hover:border-rose-300 hover:text-rose-500 transition-colors">
            <Plus size={12} /> Tambah Poin
          </button>
        </div>
      )}

      {/* ── SINEMATIK ── */}
      {mode === 'cinematic' && (
        <div className="space-y-1.5">
          <p className="text-[9px] text-gray-400">Tiap bab = layar penuh. Foto atau video sebagai background.</p>
          {chapters.map((ch, i) => (
            <div key={i} className={`rounded-lg border overflow-hidden transition-all ${expandedIdx === i ? 'border-rose-200' : 'border-gray-100'}`}>
              {/* header */}
              <div className="flex items-center h-8 px-2 gap-1.5 bg-white">
                <div className="flex flex-col gap-0.5">
                  <button onClick={() => moveChapter(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-20"><ChevronUp size={10} /></button>
                  <button onClick={() => moveChapter(i, 1)} disabled={i === chapters.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-20"><ChevronDown size={10} /></button>
                </div>
                <button className="flex-1 text-left flex items-center gap-1.5" onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}>
                  {ch.video_url
                    ? <span className="w-5 h-5 rounded bg-gray-900 flex items-center justify-center shrink-0 text-[8px] text-white font-bold">▶</span>
                    : ch.photo_url
                      ? <img src={ch.photo_url} alt="" className="w-5 h-5 rounded object-cover border border-gray-200 shrink-0" />
                      : <div className="w-5 h-5 rounded bg-gray-100 shrink-0 flex items-center justify-center"><Image size={9} className="text-gray-400" /></div>
                  }
                  <span className="text-[10px] font-medium text-gray-600 truncate">
                    {ch.title || `Bab ${i + 1}`}
                    {ch.video_url && <span className="ml-1 text-[8px] text-gray-400">video</span>}
                  </span>
                </button>
                <button onClick={() => removeChapter(i)} className="text-gray-200 hover:text-red-400 shrink-0"><Trash2 size={11} /></button>
                <button onClick={() => setExpandedIdx(expandedIdx === i ? null : i)} className="shrink-0">
                  <ChevronDown size={10} className={`text-gray-300 transition-transform ${expandedIdx === i ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* body */}
              <AnimatePresence>
                {expandedIdx === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.13 }} className="overflow-hidden">
                    <div className="px-2.5 pb-2.5 pt-1.5 border-t border-gray-50 space-y-2">

                      {/* Media upload */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide">Background</p>
                          <p className="text-[8px] text-gray-300">Foto 8MB · Video 80MB</p>
                        </div>
                        <input
                          ref={el => { fileRefs.current[i] = el }}
                          type="file" accept="image/*,video/mp4,video/webm,video/quicktime" className="hidden"
                          onChange={e => { const f = e.target.files?.[0]; if (f) uploadMedia(i, f) }}
                        />

                        {ch.video_url ? (
                          <div className="relative rounded-lg overflow-hidden bg-black" style={{ aspectRatio: '16/7' }}>
                            <video src={ch.video_url} muted loop className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <button onClick={() => fileRefs.current[i]?.click()}
                                className="flex items-center gap-1 bg-white/90 text-gray-800 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg">
                                <Upload size={10} /> Ganti Video
                              </button>
                            </div>
                          </div>
                        ) : ch.photo_url ? (
                          <div className="relative rounded-lg overflow-hidden" style={{ aspectRatio: '16/7' }}>
                            <img src={ch.photo_url} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                              <button onClick={() => fileRefs.current[i]?.click()}
                                className="flex items-center gap-1 bg-white/90 text-gray-800 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg">
                                <Upload size={10} /> Ganti Foto
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => fileRefs.current[i]?.click()} disabled={uploadingIdx === i}
                            className="w-full py-5 border border-dashed border-gray-200 rounded-lg flex flex-col items-center gap-1.5 text-gray-400 hover:border-rose-300 hover:text-rose-400 transition-colors disabled:opacity-50">
                            {uploadingIdx === i
                              ? <><Loader2 size={16} className="animate-spin" /><span className="text-[9px]">Mengupload...</span></>
                              : <><Upload size={16} /><span className="text-[9px] font-medium">Pilih Foto atau Video</span><span className="text-[8px]">MP4/WebM/MOV · JPG/PNG/WebP</span></>
                            }
                          </button>
                        )}

                        {(ch.photo_url || ch.video_url) && (
                          <div className="mt-2 space-y-0.5">
                            <div className="flex items-center justify-between">
                              <p className="text-[9px] text-gray-400">Kegelapan overlay</p>
                              <span className="text-[9px] font-mono text-gray-500">{Math.round((ch.overlay_opacity ?? 0.45) * 100)}%</span>
                            </div>
                            <input type="range" min={0.1} max={0.9} step={0.05}
                              value={ch.overlay_opacity ?? 0.45}
                              onChange={e => updateChapter(i, { overlay_opacity: Number(e.target.value) })}
                              className="w-full accent-rose-500 h-1" />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <F label="Tanggal / Tahun">
                          <input className={ic} value={ch.date ?? ''} onChange={e => updateChapter(i, { date: e.target.value })} placeholder="2019" />
                        </F>
                        <F label="Judul Bab">
                          <input className={ic} value={ch.title ?? ''} onChange={e => updateChapter(i, { title: e.target.value })} placeholder="Pertama Bertemu" />
                        </F>
                      </div>
                      <F label="Teks / Narasi" hint={`${(ch.text ?? '').length}/300`}>
                        <textarea className={`${ic} resize-none`} rows={3} maxLength={300}
                          value={ch.text ?? ''} onChange={e => updateChapter(i, { text: e.target.value })}
                          placeholder="Kami pertama bertemu di..." />
                      </F>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <button onClick={addChapter}
            className="w-full py-2 border border-dashed border-gray-200 rounded-lg flex items-center justify-center gap-1.5 text-[10px] font-semibold text-gray-400 hover:border-rose-300 hover:text-rose-500 transition-colors">
            <Plus size={12} /> Tambah Bab
          </button>
        </div>
      )}
    </div>
  )
}

// ── Gift Form ──────────────────────────────────────────────────

function GiftForm({ data, onChange }: { data: NewInvitationData; onChange: (p: Partial<NewInvitationData>) => void }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<GiftAccount>({ type: 'bank', bank: '', number: '', name: '' })
  const accounts = data.gift_accounts ?? []

  function add() {
    if (!form.number.trim() || !form.name.trim()) return
    onChange({ gift_accounts: [...accounts, { ...form }] })
    setForm({ type: 'bank', bank: '', number: '', name: '' })
    setAdding(false)
  }

  return (
    <div className="space-y-1.5">
      {accounts.map((acc, i) => (
        <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-bold text-gray-500 uppercase">{acc.type === 'bank' ? acc.bank : acc.platform}</p>
            <p className="text-xs font-mono text-gray-800 truncate">{acc.number}</p>
            <p className="text-[10px] text-gray-400">a.n. {acc.name}</p>
          </div>
          <button onClick={() => onChange({ gift_accounts: accounts.filter((_, j) => j !== i) })} className="text-gray-300 hover:text-red-400 text-[10px] shrink-0">✕</button>
        </div>
      ))}
      {adding ? (
        <div className="border border-gray-200 rounded-lg p-2.5 bg-gray-50 space-y-2">
          <div className="flex gap-1">
            {(['bank', 'ewallet'] as const).map(t => (
              <button key={t} onClick={() => setForm(f => ({ ...f, type: t }))} className={`flex-1 py-1 text-[10px] font-semibold rounded transition-all ${form.type === t ? 'bg-gray-800 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}>
                {t === 'bank' ? 'Bank' : 'E-Wallet'}
              </button>
            ))}
          </div>
          <input className={ic} placeholder={form.type === 'bank' ? 'BCA / Mandiri' : 'GoPay / OVO'} value={form.type === 'bank' ? (form.bank ?? '') : (form.platform ?? '')} onChange={e => setForm(f => form.type === 'bank' ? { ...f, bank: e.target.value } : { ...f, platform: e.target.value })} />
          <input className={ic} placeholder="No. rekening / HP" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} />
          <input className={ic} placeholder="Nama pemilik" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <div className="flex gap-1.5">
            <button onClick={add} className="flex-1 py-1.5 bg-gray-900 text-white text-[10px] font-bold rounded-lg">Tambah</button>
            <button onClick={() => setAdding(false)} className="px-2 text-[10px] text-gray-400">Batal</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setAdding(true)} className="w-full py-1.5 border border-dashed border-gray-200 rounded-lg text-[10px] text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-all">
          + Tambah rekening / e-wallet
        </button>
      )}
    </div>
  )
}

// ── Phone mockup ───────────────────────────────────────────────

function PhoneMockup({ children, slug }: { children: React.ReactNode; slug: string }) {
  const SCREEN_W = 248
  const SCREEN_H = 538
  const scale = SCREEN_W / 390
  const contentH = Math.round(SCREEN_H / scale)

  return (
    <div className="flex flex-col items-center gap-2.5">
      <div className="relative bg-gray-900 shadow-xl" style={{ width: 272, borderRadius: 40, padding: '10px 12px 14px' }}>
        {/* Notch */}
        <div className="flex justify-center mb-1"><div className="w-16 h-3.5 bg-black rounded-full" /></div>
        {/* Screen */}
        <div className="overflow-hidden bg-white" style={{ width: SCREEN_W, height: SCREEN_H, borderRadius: 22 }}>
          <div style={{ width: 390, height: contentH, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
            {children}
          </div>
        </div>
        {/* Home bar */}
        <div className="flex justify-center mt-2"><div className="w-14 h-0.5 bg-gray-600 rounded-full" /></div>
        {/* Volume */}
        <div className="absolute bg-gray-700 rounded-l-sm" style={{ left: -2, top: 72, width: 2, height: 22 }} />
        <div className="absolute bg-gray-700 rounded-l-sm" style={{ left: -2, top: 102, width: 2, height: 36 }} />
        <div className="absolute bg-gray-700 rounded-l-sm" style={{ left: -2, top: 146, width: 2, height: 36 }} />
        {/* Power */}
        <div className="absolute bg-gray-700 rounded-r-sm" style={{ right: -2, top: 112, width: 2, height: 48 }} />
      </div>
      <a href={`/invitation/${slug}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-rose-500 transition-colors">
        <ExternalLink size={10} /> Buka di tab baru
      </a>
    </div>
  )
}

// ── Draggable section row ──────────────────────────────────────

function SectionRow({
  section, isExpanded, onToggleExpand, onToggle, data, onChange,
}: {
  section: EditorSection
  isExpanded: boolean
  onToggleExpand: () => void
  onToggle: () => void
  data: NewInvitationData
  onChange: (p: Partial<NewInvitationData>) => void
}) {
  const controls = useDragControls()
  const Icon = SICONS[section.type] ?? BookOpen

  return (
    <Reorder.Item
      value={section}
      dragListener={false}
      dragControls={controls}
      className="list-none"
      style={{ position: 'relative' }}
    >
      <div className={`rounded-lg border bg-white transition-all ${isExpanded ? 'border-rose-200 shadow-sm' : 'border-gray-100'} ${!section.enabled ? 'opacity-40' : ''}`}>
        {/* Row header */}
        <div className="flex items-center h-9 px-2 gap-2">
          {/* Drag handle — touch-none is critical for Framer Motion drag */}
          <div
            className="flex items-center justify-center w-5 h-5 cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 shrink-0 touch-none"
            onPointerDown={e => controls.start(e)}
          >
            <GripVertical size={13} />
          </div>

          {/* Icon + label — click to expand */}
          <button
            className="flex items-center gap-1.5 flex-1 min-w-0 text-left"
            onClick={onToggleExpand}
          >
            <Icon size={12} className="text-gray-400 shrink-0" />
            <span className="text-xs font-medium text-gray-700 truncate">
              {SLABELS[section.type] ?? section.type}
            </span>
          </button>

          {/* Toggle on/off */}
          <button
            className="shrink-0 flex items-center"
            onClick={e => { e.stopPropagation(); onToggle() }}
          >
            {section.enabled
              ? <ToggleRight size={18} className="text-rose-500" />
              : <ToggleLeft size={18} className="text-gray-200" />
            }
          </button>

          {/* Chevron */}
          <button onClick={onToggleExpand} className="shrink-0">
            <ChevronDown size={12} className={`text-gray-300 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Form body */}
        <AnimatePresence>
          {isExpanded && section.enabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="overflow-hidden"
            >
              <div className="px-2.5 pb-2.5 pt-1.5 border-t border-gray-50">
                <SectionForm type={section.type} data={data} onChange={onChange} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reorder.Item>
  )
}

// ── Main editor ────────────────────────────────────────────────

export default function InvitationEditor({ invitation, template, onSaved }: Props) {
  const savedOverrides = (() => {
    const d = invitation.data as unknown as NewInvitationData & {
      _section_overrides?: { id: string; type: SectionType; enabled: boolean; order: number }[]
    }
    return d._section_overrides
  })()

  const [data, setData] = useState<NewInvitationData>(() => initData(invitation))
  const [sections, setSections] = useState<EditorSection[]>(() => initSections(template, savedOverrides))
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const timer = useRef<ReturnType<typeof setTimeout>>()

  const previewTemplate: TemplateRecord = {
    ...template,
    config: {
      ...template.config,
      sections: sections.map(s => ({
        ...template.config.sections.find(ts => ts.id === s.id)!,
        enabled: s.enabled,
        order: s.order,
      })).filter(Boolean),
    },
  }

  const scheduleSave = useCallback((d: NewInvitationData, s: EditorSection[]) => {
    clearTimeout(timer.current)
    setSaveStatus('saving')
    timer.current = setTimeout(async () => {
      const overrides = s.map(x => ({ id: x.id, type: x.type, enabled: x.enabled, order: x.order }))
      const res = await fetch(`/api/invitations/${invitation.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: { ...d, _section_overrides: overrides } }),
      })
      if (!res.ok) { toast.error('Gagal menyimpan'); setSaveStatus('idle'); return }
      const { invitation: updated } = await res.json()
      onSaved(updated)
      setSaveStatus('saved')
      setTimeout(() => setSaveStatus('idle'), 2000)
    }, 800)
  }, [invitation.id, onSaved])

  function handleDataChange(patch: Partial<NewInvitationData>) {
    const next = { ...data, ...patch }
    setData(next)
    scheduleSave(next, sections)
  }

  function handleReorder(newOrder: EditorSection[]) {
    const withOrder = newOrder.map((s, i) => ({ ...s, order: i + 1 }))
    setSections(withOrder)
    scheduleSave(data, withOrder)
  }

  function toggleSection(id: string) {
    const updated = sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s)
    setSections(updated)
    scheduleSave(data, updated)
  }

  return (
    <div className="flex gap-5">
      {/* ── Left: sections editor ─────────────── */}
      <div className="flex-1 min-w-0 space-y-1">
        {/* Status row */}
        <div className="flex items-center justify-between h-5 mb-1">
          <p className="text-[10px] text-gray-400">Seret ≡ untuk ubah urutan · Toggle untuk tampilkan/sembunyikan</p>
          <div className={`flex items-center gap-1 text-[10px] transition-opacity ${saveStatus === 'idle' ? 'opacity-0' : 'opacity-100'}`}>
            {saveStatus === 'saving' && <><Loader2 size={10} className="animate-spin text-gray-400" /><span className="text-gray-400">Menyimpan...</span></>}
            {saveStatus === 'saved' && <><Check size={10} className="text-green-500" /><span className="text-green-600">Tersimpan</span></>}
          </div>
        </div>

        <Reorder.Group
          axis="y"
          values={sections}
          onReorder={handleReorder}
          className="space-y-1"
        >
          {sections.map(section => (
            <SectionRow
              key={section.id}
              section={section}
              isExpanded={expandedId === section.id}
              onToggleExpand={() => setExpandedId(expandedId === section.id ? null : section.id)}
              onToggle={() => toggleSection(section.id)}
              data={data}
              onChange={handleDataChange}
            />
          ))}
        </Reorder.Group>
      </div>

      {/* ── Right: phone preview ──────────────── */}
      <div className="hidden lg:block shrink-0">
        <div className="sticky top-4">
          <PhoneMockup slug={invitation.slug}>
            <InvitationPreview
              template={previewTemplate}
              data={data}
              invitationId={invitation.id}
            />
          </PhoneMockup>
        </div>
      </div>
    </div>
  )
}
