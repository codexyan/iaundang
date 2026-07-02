'use client'

import { useState, useRef, useCallback, useMemo } from 'react'
import { Reorder, motion, AnimatePresence, useDragControls } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  GripVertical, ChevronDown, Loader2, Check,
  ExternalLink, Sparkles, Users, Timer, Heart, MapPin, Image as ImageIcon, Gift,
  CheckSquare, MessageSquare, Video, BookOpen, Clock,
  Upload, Trash2, ChevronUp, Plus, Eye, EyeOff,
  Camera, Music, Palette, FileText, ArrowRight, X,
  MonitorSmartphone, Maximize2, Globe, Radio,
} from 'lucide-react'
import type { Invitation, NewInvitationData, TemplateRecord, GiftAccount, SectionType, StoryChapter } from '@/lib/types'
import InvitationPreview from '@/components/renderer/InvitationPreview'
import ImageUploadField from '@/components/admin/ImageUploadField'

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

const SICONS: Record<string, React.ElementType> = {
  hero: Sparkles, profiles: Users, countdown: Timer, story: Heart,
  events: MapPin, gallery: ImageIcon, gift: Gift, rsvp: CheckSquare,
  wishes: MessageSquare, livestream: Radio, closing: BookOpen,
}

const SLABELS: Record<string, string> = {
  hero: 'Cover / Hero', profiles: 'Profil Mempelai', countdown: 'Hitung Mundur',
  story: 'Kisah Cinta', events: 'Detail Acara', gallery: 'Galeri Foto',
  gift: 'Amplop Digital', rsvp: 'Konfirmasi Hadir', wishes: 'Buku Ucapan',
  livestream: 'Live Streaming', closing: 'Penutup',
}

const SDESC: Record<string, string> = {
  hero: 'Nama pasangan, foto, dan tagline utama',
  profiles: 'Nama orang tua, bio, dan foto mempelai',
  countdown: 'Hitung mundur otomatis ke hari H',
  story: 'Timeline atau cerita perjalanan cinta',
  events: 'Detail akad nikah dan resepsi',
  gallery: 'Koleksi foto prewedding',
  gift: 'Rekening bank dan e-wallet untuk hadiah',
  rsvp: 'Form konfirmasi kehadiran tamu',
  wishes: 'Kolom ucapan dan doa dari tamu',
  livestream: 'Link live streaming acara',
  closing: 'Kalimat penutup dan terima kasih',
}

function initData(inv: Invitation): NewInvitationData {
  const d = inv.data as unknown as NewInvitationData
  return {
    groom_name: d.groom_name ?? '', bride_name: d.bride_name ?? '',
    groom_parents: d.groom_parents ?? '', bride_parents: d.bride_parents ?? '',
    tagline: d.tagline ?? '', groom_photo_url: d.groom_photo_url ?? '',
    bride_photo_url: d.bride_photo_url ?? '', groom_bio: d.groom_bio ?? '',
    bride_bio: d.bride_bio ?? '', couple_photo_url: d.couple_photo_url ?? '',
    hero_video_url: d.hero_video_url ?? '',
    akad: d.akad ?? { date: '', time: '08:00', venue_name: '', venue_address: '' },
    resepsi: d.resepsi ?? { date: '', time: '11:00', venue_name: '', venue_address: '' },
    story_title: d.story_title ?? '', story_text: d.story_text ?? '',
    closing_text: d.closing_text ?? '', thank_you_message: d.thank_you_message ?? '',
    gift_accounts: d.gift_accounts ?? [], gallery_photos: d.gallery_photos ?? [],
    story_chapters: d.story_chapters ?? [], music_url: d.music_url ?? '',
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

function getSectionFill(type: SectionType, data: NewInvitationData): number {
  switch (type) {
    case 'hero': {
      let n = 0
      if (data.groom_name) n++
      if (data.bride_name) n++
      if (data.couple_photo_url || data.hero_video_url) n++
      return Math.round((n / 3) * 100)
    }
    case 'profiles': {
      let n = 0
      if (data.groom_parents) n++
      if (data.bride_parents) n++
      if (data.groom_photo_url) n++
      if (data.bride_photo_url) n++
      return Math.round((n / 4) * 100)
    }
    case 'events': {
      let n = 0
      if (data.akad?.date) n++
      if (data.akad?.venue_name) n++
      if (data.resepsi?.date) n++
      if (data.resepsi?.venue_name) n++
      return Math.round((n / 4) * 100)
    }
    case 'story': return (data.story_text || (data.story_chapters?.length ?? 0) > 0 || (data.story_timeline?.length ?? 0) > 0) ? 100 : 0
    case 'gift': return (data.gift_accounts?.length ?? 0) > 0 ? 100 : 0
    case 'closing': return data.closing_text ? 100 : 0
    case 'livestream': return data.livestream_url ? 100 : 0
    default: return 100
  }
}

const inputCls = 'w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 bg-white placeholder:text-gray-300 transition-all'
const textareaCls = `${inputCls} resize-none`

function Label({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div className="mb-1.5">
      <label className="text-xs font-semibold text-gray-600">
        {children} {required && <span className="text-rose-400">*</span>}
      </label>
      {hint && <p className="text-[11px] text-gray-400 mt-0.5">{hint}</p>}
    </div>
  )
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label required={required} hint={hint}>{label}</Label>
      {children}
    </div>
  )
}

function InfoBox({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3 bg-gray-50 rounded-xl text-xs text-gray-500 border border-gray-100">
      <Icon size={14} className="shrink-0 text-gray-400" />
      <span>{text}</span>
    </div>
  )
}

function SectionForm({ type, data, onChange }: {
  type: SectionType; data: NewInvitationData; onChange: (p: Partial<NewInvitationData>) => void
}) {
  const akad = data.akad ?? { date: '', time: '08:00', venue_name: '', venue_address: '' }
  const resepsi = data.resepsi ?? { date: '', time: '11:00', venue_name: '', venue_address: '' }

  switch (type) {
    case 'hero': return <HeroForm data={data} onChange={onChange} />
    case 'profiles': return <ProfilesForm data={data} onChange={onChange} />
    case 'countdown': return <InfoBox icon={Clock} text="Otomatis dihitung dari tanggal akad. Isi di bagian Detail Acara." />
    case 'events': return <EventsForm data={data} onChange={onChange} akad={akad} resepsi={resepsi} />
    case 'story': return <StoryForm data={data} onChange={onChange} />
    case 'gallery': return <InfoBox icon={ImageIcon} text="Kelola foto di tab Galeri pada sidebar (upload, hapus, atur urutan)." />
    case 'gift': return <GiftForm data={data} onChange={onChange} />
    case 'rsvp': return <InfoBox icon={CheckSquare} text="Form RSVP otomatis tampil di undangan. Lihat hasilnya di tab RSVP." />
    case 'wishes': return <InfoBox icon={MessageSquare} text="Buku ucapan otomatis tampil. Tamu bisa menulis ucapan dan doa." />
    case 'livestream': return (
      <Field label="Link Live Stream" hint="YouTube Live, Instagram Live, atau Zoom">
        <input className={inputCls} value={data.livestream_url ?? ''} onChange={e => onChange({ livestream_url: e.target.value })} placeholder="https://youtube.com/live/..." />
      </Field>
    )
    case 'closing': return (
      <div className="space-y-4">
        <Field label="Kalimat Penutup">
          <textarea className={textareaCls} rows={3} value={data.closing_text ?? ''} onChange={e => onChange({ closing_text: e.target.value })} placeholder="Merupakan suatu kehormatan apabila Bapak/Ibu berkenan hadir..." />
        </Field>
        <Field label="Pesan Terima Kasih">
          <input className={inputCls} value={data.thank_you_message ?? ''} onChange={e => onChange({ thank_you_message: e.target.value })} placeholder="Terima kasih atas doa dan kehadiran Anda" />
        </Field>
      </div>
    )
    default: return null
  }
}

function HeroForm({ data, onChange }: { data: NewInvitationData; onChange: (p: Partial<NewInvitationData>) => void }) {
  const [uploading, setUploading] = useState<'photo' | 'video' | null>(null)
  const photoRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)

  async function upload(file: File, type: 'photo' | 'video') {
    setUploading(type)
    const form = new FormData(); form.append('file', file); form.append('folder', 'hero')
    const res = await fetch('/api/user/upload', { method: 'POST', body: form })
    setUploading(null)
    if (!res.ok) { toast.error('Gagal upload'); return }
    const { url, type: fileType } = await res.json()
    if (fileType === 'video') onChange({ hero_video_url: url, couple_photo_url: '' })
    else onChange({ couple_photo_url: url, hero_video_url: '' })
    toast.success('Background terupload')
  }

  const hasVideo = !!data.hero_video_url
  const hasPhoto = !!data.couple_photo_url && !hasVideo

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nama Pria" required>
          <input className={inputCls} value={data.groom_name} onChange={e => onChange({ groom_name: e.target.value })} placeholder="Budi Santoso" />
        </Field>
        <Field label="Nama Wanita" required>
          <input className={inputCls} value={data.bride_name} onChange={e => onChange({ bride_name: e.target.value })} placeholder="Ani Rahayu" />
        </Field>
      </div>
      <Field label="Tagline / Ayat" hint="Tampil di bawah nama pasangan">
        <textarea className={textareaCls} rows={2} value={data.tagline ?? ''} onChange={e => onChange({ tagline: e.target.value })} placeholder="Dan di antara tanda-tanda kekuasaan-Nya..." />
      </Field>

      <div>
        <Label hint="Foto (maks 8MB) atau video pendek (maks 80MB)">Background Hero</Label>
        <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f, 'photo') }} />
        <input ref={videoRef} type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) upload(f, 'video') }} />

        {hasVideo ? (
          <div className="relative rounded-2xl overflow-hidden bg-black aspect-video">
            <video src={data.hero_video_url} muted loop autoPlay playsInline className="w-full h-full object-cover opacity-75" />
            <div className="absolute inset-0 flex items-center justify-center gap-2">
              <button onClick={() => videoRef.current?.click()} className="flex items-center gap-1.5 bg-white/90 text-gray-800 text-xs font-semibold px-3 py-2 rounded-xl shadow-sm hover:bg-white transition-colors">
                <Upload size={12} /> Ganti Video
              </button>
              <button onClick={() => onChange({ hero_video_url: '' })} className="flex items-center gap-1 bg-red-500/90 text-white text-xs font-semibold px-2.5 py-2 rounded-xl hover:bg-red-600 transition-colors">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ) : hasPhoto ? (
          <div className="relative rounded-2xl overflow-hidden aspect-video group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={data.couple_photo_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center gap-2 transition-all">
              <button onClick={() => photoRef.current?.click()} className="flex items-center gap-1.5 bg-white/90 text-gray-800 text-xs font-semibold px-3 py-2 rounded-xl shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={12} /> Ganti Foto
              </button>
              <button onClick={() => videoRef.current?.click()} className="flex items-center gap-1.5 bg-gray-900/80 text-white text-xs font-semibold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                <Video size={12} /> Pakai Video
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => photoRef.current?.click()} disabled={!!uploading}
              className="py-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-2 text-gray-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/30 transition-all disabled:opacity-50">
              {uploading === 'photo' ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
              <span className="text-xs font-medium">{uploading === 'photo' ? 'Mengupload...' : 'Upload Foto'}</span>
            </button>
            <button onClick={() => videoRef.current?.click()} disabled={!!uploading}
              className="py-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center gap-2 text-gray-400 hover:border-indigo-300 hover:text-indigo-500 hover:bg-indigo-50/30 transition-all disabled:opacity-50">
              {uploading === 'video' ? <Loader2 size={20} className="animate-spin" /> : <Video size={20} />}
              <span className="text-xs font-medium">{uploading === 'video' ? 'Mengupload...' : 'Upload Video'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function ProfilesForm({ data, onChange }: { data: NewInvitationData; onChange: (p: Partial<NewInvitationData>) => void }) {
  return (
    <div className="space-y-5">
      <div className="bg-blue-50/60 rounded-2xl p-4 border border-blue-100/60 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-blue-500 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">P</span>
          </div>
          <span className="text-xs font-bold text-blue-700">Mempelai Pria</span>
        </div>
        <Field label="Nama Orang Tua">
          <input className={inputCls} value={data.groom_parents ?? ''} onChange={e => onChange({ groom_parents: e.target.value })} placeholder="Bpk. Ahmad & Ibu Sri" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Foto" hint="URL atau upload">
            <div className="flex items-center gap-2">
              <input className={`${inputCls} flex-1`} value={data.groom_photo_url ?? ''} onChange={e => onChange({ groom_photo_url: e.target.value })} placeholder="https://..." />
              {data.groom_photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.groom_photo_url} alt="" className="w-9 h-9 rounded-xl object-cover border border-gray-200 shrink-0" onError={e => { e.currentTarget.style.display = 'none' }} />
              )}
            </div>
          </Field>
          <Field label="Bio (opsional)">
            <input className={inputCls} value={data.groom_bio ?? ''} onChange={e => onChange({ groom_bio: e.target.value })} placeholder="Software Engineer" />
          </Field>
        </div>
      </div>

      <div className="bg-rose-50/60 rounded-2xl p-4 border border-rose-100/60 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-rose-500 flex items-center justify-center">
            <span className="text-white text-[10px] font-bold">W</span>
          </div>
          <span className="text-xs font-bold text-rose-700">Mempelai Wanita</span>
        </div>
        <Field label="Nama Orang Tua">
          <input className={inputCls} value={data.bride_parents ?? ''} onChange={e => onChange({ bride_parents: e.target.value })} placeholder="Bpk. Hendra & Ibu Dewi" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Foto" hint="URL atau upload">
            <div className="flex items-center gap-2">
              <input className={`${inputCls} flex-1`} value={data.bride_photo_url ?? ''} onChange={e => onChange({ bride_photo_url: e.target.value })} placeholder="https://..." />
              {data.bride_photo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={data.bride_photo_url} alt="" className="w-9 h-9 rounded-xl object-cover border border-gray-200 shrink-0" onError={e => { e.currentTarget.style.display = 'none' }} />
              )}
            </div>
          </Field>
          <Field label="Bio (opsional)">
            <input className={inputCls} value={data.bride_bio ?? ''} onChange={e => onChange({ bride_bio: e.target.value })} placeholder="Desainer, 25 thn" />
          </Field>
        </div>
      </div>
    </div>
  )
}

function EventsForm({ data, onChange, akad, resepsi }: {
  data: NewInvitationData; onChange: (p: Partial<NewInvitationData>) => void
  akad: NonNullable<NewInvitationData['akad']>; resepsi: NonNullable<NewInvitationData['resepsi']>
}) {
  return (
    <div className="space-y-5">
      <div className="bg-amber-50/50 rounded-2xl p-4 border border-amber-100/60 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-amber-500 flex items-center justify-center">
            <BookOpen size={12} className="text-white" />
          </div>
          <span className="text-xs font-bold text-amber-700">Akad Nikah</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal" required><input type="date" className={inputCls} value={akad.date} onChange={e => onChange({ akad: { ...akad, date: e.target.value } })} /></Field>
          <Field label="Waktu" required><input type="time" className={inputCls} value={akad.time} onChange={e => onChange({ akad: { ...akad, time: e.target.value } })} /></Field>
        </div>
        <Field label="Nama Tempat" required><input className={inputCls} value={akad.venue_name} onChange={e => onChange({ akad: { ...akad, venue_name: e.target.value } })} placeholder="Masjid Al-Ikhlas" /></Field>
        <Field label="Alamat" required><textarea className={textareaCls} rows={2} value={akad.venue_address} onChange={e => onChange({ akad: { ...akad, venue_address: e.target.value } })} placeholder="Jl. Mawar No. 12..." /></Field>
        <Field label="Google Maps URL"><input className={inputCls} value={akad.maps_url ?? ''} onChange={e => onChange({ akad: { ...akad, maps_url: e.target.value } })} placeholder="https://maps.app.goo.gl/..." /></Field>
        <Field label="Foto Lokasi" hint="Foto gedung / masjid, tampil di kartu acara">
          <ImageUploadField value={akad.venue_photo_url} onChange={url => onChange({ akad: { ...akad, venue_photo_url: url } })} hint="" />
        </Field>
      </div>

      <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/60 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-500 flex items-center justify-center">
              <MapPin size={12} className="text-white" />
            </div>
            <span className="text-xs font-bold text-emerald-700">Resepsi</span>
          </div>
          <label className="flex items-center gap-1.5 text-[11px] text-gray-400 cursor-pointer select-none">
            <input type="checkbox" className="w-3.5 h-3.5 accent-emerald-500 rounded" checked={resepsi.date === akad.date && !!akad.date} onChange={e => e.target.checked && onChange({ resepsi: { ...resepsi, date: akad.date } })} />
            Tanggal sama
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tanggal" required><input type="date" className={inputCls} value={resepsi.date} onChange={e => onChange({ resepsi: { ...resepsi, date: e.target.value } })} /></Field>
          <Field label="Waktu" required><input type="time" className={inputCls} value={resepsi.time} onChange={e => onChange({ resepsi: { ...resepsi, time: e.target.value } })} /></Field>
        </div>
        <Field label="Nama Tempat" required><input className={inputCls} value={resepsi.venue_name} onChange={e => onChange({ resepsi: { ...resepsi, venue_name: e.target.value } })} placeholder="Ballroom Hotel Grand" /></Field>
        <Field label="Alamat" required><textarea className={textareaCls} rows={2} value={resepsi.venue_address} onChange={e => onChange({ resepsi: { ...resepsi, venue_address: e.target.value } })} placeholder="Jl. Sudirman No. 86..." /></Field>
        <Field label="Google Maps URL"><input className={inputCls} value={resepsi.maps_url ?? ''} onChange={e => onChange({ resepsi: { ...resepsi, maps_url: e.target.value } })} placeholder="https://maps.app.goo.gl/..." /></Field>
        <Field label="Foto Lokasi" hint="Foto gedung / ballroom, tampil di kartu acara">
          <ImageUploadField value={resepsi.venue_photo_url} onChange={url => onChange({ resepsi: { ...resepsi, venue_photo_url: url } })} hint="" />
        </Field>
      </div>
    </div>
  )
}

type StoryMode = 'text' | 'timeline' | 'cinematic'

function StoryForm({ data, onChange }: { data: NewInvitationData; onChange: (p: Partial<NewInvitationData>) => void }) {
  const chapters = data.story_chapters ?? []
  const timeline = data.story_timeline ?? []
  const mode: StoryMode = chapters.length > 0 ? 'cinematic' : timeline.length > 0 ? 'timeline' : 'text'
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0)
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null)
  const fileRefs = useRef<(HTMLInputElement | null)[]>([])

  function setMode(m: StoryMode) {
    if (m === 'cinematic') onChange({ story_timeline: [], story_chapters: chapters.length ? chapters : [{ title: '', text: '', date: '' }] })
    else if (m === 'timeline') onChange({ story_chapters: [], story_timeline: timeline.length ? timeline : [{ date: '', title: '', description: '' }] })
    else onChange({ story_chapters: [], story_timeline: [] })
    setExpandedIdx(0)
  }

  function updateItem(i: number, patch: Partial<typeof timeline[number]>) { onChange({ story_timeline: timeline.map((t, j) => j === i ? { ...t, ...patch } : t) }) }
  function addItem() { const next = [...timeline, { date: '', title: '', description: '' }]; onChange({ story_timeline: next }); setExpandedIdx(next.length - 1) }
  function removeItem(i: number) { onChange({ story_timeline: timeline.filter((_, j) => j !== i) }); setExpandedIdx(null) }
  function moveItem(i: number, dir: -1 | 1) { const j = i + dir; if (j < 0 || j >= timeline.length) return; const next = [...timeline]; [next[i], next[j]] = [next[j], next[i]]; onChange({ story_timeline: next }); setExpandedIdx(j) }

  function updateChapter(i: number, patch: Partial<StoryChapter>) { onChange({ story_chapters: chapters.map((c, j) => j === i ? { ...c, ...patch } : c) }) }
  function addChapter() { const next = [...chapters, { title: '', text: '', date: '' }]; onChange({ story_chapters: next }); setExpandedIdx(next.length - 1) }
  function removeChapter(i: number) { onChange({ story_chapters: chapters.filter((_, j) => j !== i) }); setExpandedIdx(null) }
  function moveChapter(i: number, dir: -1 | 1) { const j = i + dir; if (j < 0 || j >= chapters.length) return; const next = [...chapters]; [next[i], next[j]] = [next[j], next[i]]; onChange({ story_chapters: next }); setExpandedIdx(j) }

  async function uploadMedia(i: number, file: File) {
    setUploadingIdx(i)
    const form = new FormData(); form.append('file', file); form.append('folder', 'stories')
    const res = await fetch('/api/user/upload', { method: 'POST', body: form })
    setUploadingIdx(null)
    if (!res.ok) { toast.error('Gagal upload'); return }
    const { url, type } = await res.json()
    if (type === 'video') { updateChapter(i, { video_url: url, photo_url: '' }); toast.success('Video terupload') }
    else { updateChapter(i, { photo_url: url, video_url: '' }); toast.success('Foto terupload') }
  }

  const MODES: { id: StoryMode; label: string; icon: React.ElementType }[] = [
    { id: 'text', label: 'Teks', icon: FileText },
    { id: 'timeline', label: 'Timeline', icon: Clock },
    { id: 'cinematic', label: 'Sinematik', icon: Video },
  ]

  return (
    <div className="space-y-4">
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${
              mode === m.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
            }`}>
            <m.icon size={13} /> {m.label}
          </button>
        ))}
      </div>

      {mode === 'text' && (
        <div className="space-y-3">
          <Field label="Judul"><input className={inputCls} value={data.story_title ?? ''} onChange={e => onChange({ story_title: e.target.value })} placeholder="Kisah Kami" /></Field>
          <Field label="Cerita" hint={`${(data.story_text ?? '').length}/600 karakter`}>
            <textarea className={textareaCls} rows={5} maxLength={600} value={data.story_text ?? ''} onChange={e => onChange({ story_text: e.target.value })} placeholder="Kami pertama kali bertemu di..." />
          </Field>
        </div>
      )}

      {mode === 'timeline' && (
        <div className="space-y-2">
          {timeline.map((item, i) => (
            <div key={i} className={`rounded-xl border overflow-hidden transition-all ${expandedIdx === i ? 'border-rose-200 bg-rose-50/30' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center px-3 py-2.5 gap-2">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => moveItem(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-20"><ChevronUp size={11} /></button>
                  <button onClick={() => moveItem(i, 1)} disabled={i === timeline.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-20"><ChevronDown size={11} /></button>
                </div>
                <button className="flex-1 text-left" onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}>
                  <span className="text-xs font-medium text-gray-700">{item.date ? <span className="text-rose-500 mr-1.5">{item.date}</span> : null}{item.title || `Poin ${i + 1}`}</span>
                </button>
                <button onClick={() => removeItem(i)} className="text-gray-300 hover:text-red-400 shrink-0 p-1 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={12} /></button>
                <ChevronDown size={12} className={`text-gray-300 transition-transform shrink-0 ${expandedIdx === i ? 'rotate-180' : ''}`} />
              </div>
              <AnimatePresence>
                {expandedIdx === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }} className="overflow-hidden">
                    <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Tanggal / Tahun" required><input className={inputCls} value={item.date} onChange={e => updateItem(i, { date: e.target.value })} placeholder="2019" /></Field>
                        <Field label="Judul" required><input className={inputCls} value={item.title} onChange={e => updateItem(i, { title: e.target.value })} placeholder="Pertama Bertemu" /></Field>
                      </div>
                      <Field label="Keterangan" hint="Opsional">
                        <textarea className={textareaCls} rows={2} value={item.description ?? ''} onChange={e => updateItem(i, { description: e.target.value })} placeholder="Cerita singkat..." />
                      </Field>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <button onClick={addItem} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/30 transition-all">
            <Plus size={14} /> Tambah Poin
          </button>
        </div>
      )}

      {mode === 'cinematic' && (
        <div className="space-y-2">
          <p className="text-[11px] text-gray-400">Tiap bab tampil satu layar penuh dengan background foto/video.</p>
          {chapters.map((ch, i) => (
            <div key={i} className={`rounded-xl border overflow-hidden transition-all ${expandedIdx === i ? 'border-rose-200 bg-rose-50/30' : 'border-gray-100 bg-white'}`}>
              <div className="flex items-center px-3 py-2.5 gap-2">
                <div className="flex flex-col gap-0.5 shrink-0">
                  <button onClick={() => moveChapter(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-gray-500 disabled:opacity-20"><ChevronUp size={11} /></button>
                  <button onClick={() => moveChapter(i, 1)} disabled={i === chapters.length - 1} className="text-gray-300 hover:text-gray-500 disabled:opacity-20"><ChevronDown size={11} /></button>
                </div>
                <button className="flex-1 text-left flex items-center gap-2" onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}>
                  {ch.video_url ? (
                    <span className="w-6 h-6 rounded-lg bg-gray-900 flex items-center justify-center shrink-0"><Video size={10} className="text-white" /></span>
                  ) : ch.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={ch.photo_url} alt="" className="w-6 h-6 rounded-lg object-cover border shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-gray-100 shrink-0 flex items-center justify-center"><ImageIcon size={10} className="text-gray-400" /></div>
                  )}
                  <span className="text-xs font-medium text-gray-700 truncate">{ch.title || `Bab ${i + 1}`}</span>
                </button>
                <button onClick={() => removeChapter(i)} className="text-gray-300 hover:text-red-400 shrink-0 p-1 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={12} /></button>
                <ChevronDown size={12} className={`text-gray-300 transition-transform shrink-0 ${expandedIdx === i ? 'rotate-180' : ''}`} />
              </div>
              <AnimatePresence>
                {expandedIdx === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} transition={{ duration: 0.2, ease: [0.25, 1, 0.5, 1] }} className="overflow-hidden">
                    <div className="px-3 pb-3 pt-1 border-t border-gray-100 space-y-3">
                      <div>
                        <Label hint="Foto (8MB) atau Video (80MB)">Background</Label>
                        <input ref={el => { fileRefs.current[i] = el }} type="file" accept="image/*,video/mp4,video/webm,video/quicktime" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadMedia(i, f) }} />
                        {ch.video_url ? (
                          <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                            <video src={ch.video_url} muted loop autoPlay playsInline className="w-full h-full object-cover opacity-80" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <button onClick={() => fileRefs.current[i]?.click()} className="flex items-center gap-1.5 bg-white/90 text-gray-800 text-xs font-semibold px-3 py-2 rounded-xl"><Upload size={12} /> Ganti</button>
                            </div>
                          </div>
                        ) : ch.photo_url ? (
                          <div className="relative rounded-xl overflow-hidden aspect-video group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={ch.photo_url} alt="" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-all">
                              <button onClick={() => fileRefs.current[i]?.click()} className="flex items-center gap-1.5 bg-white/90 text-gray-800 text-xs font-semibold px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><Upload size={12} /> Ganti</button>
                            </div>
                          </div>
                        ) : (
                          <button onClick={() => fileRefs.current[i]?.click()} disabled={uploadingIdx === i}
                            className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center gap-2 text-gray-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/30 transition-all disabled:opacity-50">
                            {uploadingIdx === i ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                            <span className="text-xs font-medium">{uploadingIdx === i ? 'Mengupload...' : 'Pilih Foto atau Video'}</span>
                          </button>
                        )}
                        {(ch.photo_url || ch.video_url) && (
                          <div className="mt-2.5 flex items-center gap-3">
                            <span className="text-[11px] text-gray-400 shrink-0">Gelap overlay</span>
                            <input type="range" min={0.1} max={0.9} step={0.05} value={ch.overlay_opacity ?? 0.45} onChange={e => updateChapter(i, { overlay_opacity: Number(e.target.value) })} className="flex-1 accent-rose-500 h-1" />
                            <span className="text-[11px] font-mono text-gray-500 w-8 text-right">{Math.round((ch.overlay_opacity ?? 0.45) * 100)}%</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="Tanggal"><input className={inputCls} value={ch.date ?? ''} onChange={e => updateChapter(i, { date: e.target.value })} placeholder="2019" /></Field>
                        <Field label="Judul Bab"><input className={inputCls} value={ch.title ?? ''} onChange={e => updateChapter(i, { title: e.target.value })} placeholder="Pertama Bertemu" /></Field>
                      </div>
                      <Field label="Narasi" hint={`${(ch.text ?? '').length}/300`}>
                        <textarea className={textareaCls} rows={3} maxLength={300} value={ch.text ?? ''} onChange={e => updateChapter(i, { text: e.target.value })} placeholder="Kami pertama bertemu di..." />
                      </Field>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
          <button onClick={addChapter} className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/30 transition-all">
            <Plus size={14} /> Tambah Bab
          </button>
        </div>
      )}
    </div>
  )
}

const BANKS = ['BRI', 'BCA', 'BNI', 'Mandiri', 'BSI', 'Blu', 'Bank lainnya']
const EWALLETS = ['GoPay', 'DANA', 'ShopeePay', 'OVO', 'E-wallet lainnya']

interface ProviderBrand { gradient: [string, string]; logoText: string; accent: string }
const PROVIDER_BRANDS: Record<string, ProviderBrand> = {
  'BRI': { gradient: ['#003B8E', '#00529B'], logoText: 'BRI', accent: '#64B5F6' },
  'BCA': { gradient: ['#003087', '#00509E'], logoText: 'BCA', accent: '#90CAF9' },
  'BNI': { gradient: ['#003087', '#0050A0'], logoText: 'BNI', accent: '#F47920' },
  'Mandiri': { gradient: ['#003368', '#005099'], logoText: 'mandiri', accent: '#F4A020' },
  'BSI': { gradient: ['#006633', '#00884A'], logoText: 'BSI', accent: '#A5D6A7' },
  'Blu': { gradient: ['#0077CC', '#00AAFF'], logoText: 'blu', accent: '#B3E5FC' },
  'GoPay': { gradient: ['#00880F', '#00AA15'], logoText: 'GoPay', accent: '#CCFF99' },
  'DANA': { gradient: ['#118EEA', '#1565C0'], logoText: 'DANA', accent: '#90CAF9' },
  'ShopeePay': { gradient: ['#D73211', '#EE4D2D'], logoText: 'Shopee', accent: '#FFCCBC' },
  'OVO': { gradient: ['#4B0080', '#6A1B9A'], logoText: 'OVO', accent: '#E1BEE7' },
}

const BRAND_COLORS: Record<string, string> = {
  bri: '#003B8E', bca: '#003087', bni: '#003087', mandiri: '#003368',
  bsi: '#006633', blu: '#0077CC',
  gopay: '#00880F', dana: '#118EEA', shopee: '#EE4D2D', shopeepay: '#EE4D2D', ovo: '#4B0080',
}

function getBrandColor(name: string): string {
  const key = name.toLowerCase().replace(/\s/g, '').replace('pay', '').replace('bank', '')
  return BRAND_COLORS[key] || BRAND_COLORS[name.toLowerCase()] || '#374151'
}

const PROVIDER_LOGO_FILES: Record<string, string> = {
  'BRI': '/logos/bri.svg', 'BCA': '/logos/bca.svg', 'BNI': '/logos/bni.svg',
  'Mandiri': '/logos/mandiri.svg', 'BSI': '/logos/bsi.svg', 'Blu': '/logos/blu.svg',
  'GoPay': '/logos/gopay.svg', 'DANA': '/logos/dana.svg',
  'ShopeePay': '/logos/shopee.svg', 'OVO': '/logos/ovo.svg',
}

function ProviderCard({ name, isSelected, onClick }: { name: string; isSelected: boolean; onClick: () => void }) {
  const brand = PROVIDER_BRANDS[name]
  if (!brand) return (
    <button type="button" onClick={onClick}
      className={`rounded-xl py-3 px-2 text-[10px] font-semibold transition-all border ${isSelected ? 'bg-gray-800 text-white border-gray-700 shadow-md' : 'bg-gray-50 text-gray-400 border-dashed border-gray-200 hover:border-gray-300 hover:text-gray-500'}`}>
      {name}
    </button>
  )
  const [g1, g2] = brand.gradient
  const logoFile = PROVIDER_LOGO_FILES[name]
  const isEwallet = ['GoPay', 'DANA', 'ShopeePay', 'OVO'].includes(name)
  return (
    <button type="button" onClick={onClick}
      className="relative overflow-hidden rounded-xl transition-all group"
      style={{
        background: `linear-gradient(135deg, ${g1} 0%, ${g2} 100%)`,
        aspectRatio: '1.6 / 1',
        boxShadow: isSelected ? `0 0 0 2.5px white, 0 0 0 4.5px ${g1}, 0 6px 20px ${g1}55` : `0 2px 12px ${g1}40`,
        transform: isSelected ? 'scale(0.94)' : 'scale(1)',
      }}>
      <div style={{ position: 'absolute', right: -14, top: -14, width: 52, height: 52, borderRadius: '50%', border: `10px solid ${brand.accent}25` }} />
      <div style={{ position: 'absolute', left: -8, bottom: -10, width: 36, height: 36, borderRadius: '50%', background: `${brand.accent}18` }} />
      <div style={{ position: 'absolute', top: 7, left: 8, width: 14, height: 10, borderRadius: 2, background: `${brand.accent}35`, border: `1px solid ${brand.accent}40` }} />
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ paddingTop: 4 }}>
        {logoFile ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoFile} alt={name} style={{ height: 18, width: 'auto', maxWidth: '78%', objectFit: 'contain', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))' }} />
        ) : (
          <p style={{ fontSize: 11, fontWeight: 900, color: 'white', letterSpacing: '0.05em', textShadow: '0 1px 4px rgba(0,0,0,0.35)', lineHeight: 1 }}>{brand.logoText}</p>
        )}
        <p style={{ fontSize: 5.5, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.16em', marginTop: 3 }}>{isEwallet ? 'E-WALLET' : 'BANK'}</p>
      </div>
      {isSelected && (
        <div className="absolute top-1.5 right-1.5 rounded-full flex items-center justify-center" style={{ width: 14, height: 14, background: 'white', boxShadow: `0 1px 4px ${g1}80` }}>
          <Check size={8} color={g1} strokeWidth={3} />
        </div>
      )}
    </button>
  )
}

function GiftForm({ data, onChange }: { data: NewInvitationData; onChange: (p: Partial<NewInvitationData>) => void }) {
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<GiftAccount>({ type: 'bank', bank: 'BCA', number: '', name: '' })
  const accounts = data.gift_accounts ?? []

  function add() {
    if (!form.number.trim() || !form.name.trim()) return
    onChange({ gift_accounts: [...accounts, { ...form }] })
    setForm({ type: 'bank', bank: 'BCA', number: '', name: '' })
    setAdding(false)
  }

  const providerName = form.type === 'bank' ? (form.bank ?? '') : (form.platform ?? '')
  const brandColor = getBrandColor(providerName)

  return (
    <div className="space-y-3">
      <AnimatePresence>
        {accounts.map((acc, i) => {
          const name = acc.type === 'bank' ? acc.bank : acc.platform
          const color = getBrandColor(name ?? '')
          return (
            <motion.div key={i} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.2 }}
              className="flex items-center gap-3 rounded-xl px-4 py-3" style={{ background: `linear-gradient(135deg, ${color}14, ${color}06)`, border: `1px solid ${color}25` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-white text-[9px] font-black" style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
                {(name ?? '?').slice(0, 3).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase" style={{ color }}>{name}</p>
                <p className="text-sm font-mono text-gray-700 truncate tracking-wider">{acc.number}</p>
                <p className="text-[10px] text-gray-400">a.n. {acc.name}</p>
              </div>
              <button onClick={() => onChange({ gift_accounts: accounts.filter((_, j) => j !== i) })}
                className="p-1.5 text-gray-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition-colors shrink-0">
                <Trash2 size={13} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>

      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
            className="overflow-hidden">
            <div className="border border-gray-200 rounded-2xl p-4 bg-white space-y-4 shadow-sm">
              <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                {(['bank', 'ewallet'] as const).map(t => (
                  <button key={t} onClick={() => setForm(f => ({ ...f, type: t, bank: t === 'bank' ? 'BCA' : undefined, platform: t === 'ewallet' ? 'GoPay' : undefined }))}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${form.type === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
                    {t === 'bank' ? 'Bank' : 'E-Wallet'}
                  </button>
                ))}
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-2 font-medium">Pilih provider</p>
                <div className="grid grid-cols-3 gap-2">
                  {(form.type === 'bank' ? BANKS : EWALLETS).map(name => (
                    <ProviderCard key={name} name={name} isSelected={(form.type === 'bank' ? form.bank : form.platform) === name}
                      onClick={() => setForm(f => f.type === 'bank' ? { ...f, bank: name } : { ...f, platform: name })} />
                  ))}
                </div>
              </div>

              {(providerName.includes('lainnya') || providerName.includes('Lainnya')) && (
                <Field label={form.type === 'bank' ? 'Nama Bank' : 'Nama E-Wallet'}>
                  <input className={inputCls} value={form.type === 'bank' ? (form.bank ?? '') : (form.platform ?? '')}
                    onChange={e => setForm(f => f.type === 'bank' ? { ...f, bank: e.target.value } : { ...f, platform: e.target.value })}
                    placeholder={form.type === 'bank' ? 'contoh: Bank Jago' : 'contoh: LinkAja'} />
                </Field>
              )}

              {providerName && !providerName.includes('lainnya') && (() => {
                const pb = PROVIDER_BRANDS[providerName]
                const [g1, g2] = pb ? pb.gradient : [brandColor, `${brandColor}cc`]
                const accent = pb?.accent ?? '#ffffff'
                const logoFile = PROVIDER_LOGO_FILES[providerName]
                const formatted = form.number.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()
                return (
                  <div className="relative overflow-hidden rounded-2xl" style={{ background: `linear-gradient(135deg, ${g1} 0%, ${g2} 100%)`, boxShadow: `0 8px 28px ${g1}55, 0 2px 8px rgba(0,0,0,0.2)`, aspectRatio: '1.75 / 1' }}>
                    <div style={{ position: 'absolute', right: -24, top: -24, width: 110, height: 110, borderRadius: '50%', border: `22px solid ${accent}20` }} />
                    <div style={{ position: 'absolute', right: 18, bottom: -30, width: 80, height: 80, borderRadius: '50%', border: `16px solid ${accent}15` }} />
                    <div style={{ position: 'absolute', left: -20, bottom: -10, width: 70, height: 70, borderRadius: '50%', background: `${accent}12` }} />
                    <div className="absolute flex items-center gap-2" style={{ top: 16, left: 16 }}>
                      <div style={{ width: 28, height: 20, borderRadius: 3, background: `${accent}44`, border: `1px solid ${accent}50`, position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '33%', left: 0, right: 0, height: 1, background: `${accent}60` }} />
                        <div style={{ position: 'absolute', left: '38%', top: 0, bottom: 0, width: 1, background: `${accent}60` }} />
                      </div>
                    </div>
                    <div className="absolute" style={{ top: 14, right: 14 }}>
                      {logoFile ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={logoFile} alt={providerName} style={{ height: 22, width: 'auto', maxWidth: 80, objectFit: 'contain', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.35))' }} />
                      ) : (
                        <p style={{ fontSize: 13, fontWeight: 900, color: 'white', letterSpacing: '0.06em', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>{pb?.logoText ?? providerName.slice(0, 3)}</p>
                      )}
                      <p style={{ fontSize: 6, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.14em', textAlign: 'right', marginTop: 2 }}>{form.type === 'bank' ? 'BANK' : 'E-WALLET'}</p>
                    </div>
                    <p style={{ position: 'absolute', bottom: 30, left: 16, fontSize: 12, fontWeight: 700, letterSpacing: '0.2em', color: 'rgba(255,255,255,0.95)', fontFamily: 'monospace', textShadow: '0 1px 6px rgba(0,0,0,0.45)' }}>{formatted || '•••• •••• ••••'}</p>
                    <div className="absolute flex items-end justify-between" style={{ bottom: 10, left: 16, right: 14 }}>
                      <div>
                        <p style={{ fontSize: 6, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>{form.type === 'bank' ? 'Atas Nama' : 'Akun'}</p>
                        <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.92)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{form.name || 'NAMA PEMILIK'}</p>
                      </div>
                    </div>
                  </div>
                )
              })()}

              <Field label="No. Rekening / No. HP">
                <input className={`${inputCls} font-mono tracking-widest`} placeholder="0123 4567 8901" value={form.number} onChange={e => setForm(f => ({ ...f, number: e.target.value }))} />
              </Field>
              <Field label="Nama Pemilik">
                <input className={`${inputCls} uppercase`} placeholder="BUDI SANTOSO" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value.toUpperCase() }))} />
              </Field>

              <div className="flex gap-2 pt-1">
                <button onClick={add} disabled={!form.number.trim() || !form.name.trim()}
                  className="flex-1 py-2.5 text-sm font-bold rounded-xl text-white transition-all disabled:opacity-40"
                  style={{ background: `linear-gradient(135deg, ${brandColor}, ${brandColor}cc)` }}>
                  Tambah
                </button>
                <button onClick={() => setAdding(false)} className="px-4 text-sm text-gray-400 hover:text-gray-600 font-medium">Batal</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!adding && (
        <button onClick={() => setAdding(true)}
          className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-xs font-semibold text-gray-400 hover:border-rose-300 hover:text-rose-500 hover:bg-rose-50/30 transition-all flex items-center justify-center gap-1.5">
          <Plus size={14} /> Tambah rekening / e-wallet
        </button>
      )}
    </div>
  )
}

function PhoneMockup({ children, slug }: { children: React.ReactNode; slug: string }) {
  const SCREEN_W = 248
  const SCREEN_H = 538
  const scale = SCREEN_W / 390
  const contentH = Math.round(SCREEN_H / scale)

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative bg-gray-900 shadow-2xl" style={{ width: 272, borderRadius: 40, padding: '10px 12px 14px' }}>
        <div className="flex justify-center mb-1"><div className="w-16 h-3.5 bg-black rounded-full" /></div>
        <div className="overflow-hidden bg-white" style={{ width: SCREEN_W, height: SCREEN_H, borderRadius: 22 }}>
          <div style={{ width: 390, height: contentH, transform: `scale(${scale})`, transformOrigin: 'top left', overflow: 'hidden' }}>
            {children}
          </div>
        </div>
        <div className="flex justify-center mt-2"><div className="w-14 h-0.5 bg-gray-600 rounded-full" /></div>
        <div className="absolute bg-gray-700 rounded-l-sm" style={{ left: -2, top: 72, width: 2, height: 22 }} />
        <div className="absolute bg-gray-700 rounded-l-sm" style={{ left: -2, top: 102, width: 2, height: 36 }} />
        <div className="absolute bg-gray-700 rounded-l-sm" style={{ left: -2, top: 146, width: 2, height: 36 }} />
        <div className="absolute bg-gray-700 rounded-r-sm" style={{ right: -2, top: 112, width: 2, height: 48 }} />
      </div>
      <a href={`/invitation/${slug}`} target="_blank" rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-rose-500 transition-colors font-medium">
        <ExternalLink size={12} /> Buka di tab baru
      </a>
    </div>
  )
}

function SectionRow({
  section, isExpanded, onToggleExpand, onToggle, data, onChange,
}: {
  section: EditorSection; isExpanded: boolean; onToggleExpand: () => void; onToggle: () => void
  data: NewInvitationData; onChange: (p: Partial<NewInvitationData>) => void
}) {
  const controls = useDragControls()
  const Icon = SICONS[section.type] ?? BookOpen
  const on = section.enabled
  const fill = getSectionFill(section.type, data)

  return (
    <Reorder.Item value={section} dragListener={false} dragControls={controls} className="list-none" style={{ position: 'relative' }}>
      <motion.div
        layout
        className={`rounded-2xl border overflow-hidden transition-colors duration-200 ${
          isExpanded
            ? 'border-rose-200 shadow-lg shadow-rose-100/40 bg-white'
            : on ? 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm' : 'border-dashed border-gray-200 bg-gray-50/60'
        }`}
      >
        {isExpanded && <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl bg-rose-400 z-10" />}

        <div className={`flex items-center px-4 py-3.5 gap-3 transition-colors ${isExpanded ? 'bg-rose-50/40' : ''}`}>
          <div className="flex items-center justify-center w-5 cursor-grab active:cursor-grabbing shrink-0 touch-none text-gray-300 hover:text-gray-500 transition-colors"
            onPointerDown={e => controls.start(e)}>
            <GripVertical size={14} />
          </div>

          <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isExpanded ? 'bg-rose-100 text-rose-500' : on ? 'bg-gray-100 text-gray-500' : 'bg-gray-100 text-gray-300'
          }`}>
            <Icon size={14} />
          </div>

          <button className="flex-1 min-w-0 text-left" onClick={onToggleExpand}>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold truncate transition-colors ${isExpanded ? 'text-gray-900' : on ? 'text-gray-700' : 'text-gray-400'}`}>
                {SLABELS[section.type] ?? section.type}
              </span>
              {!on && <span className="text-[9px] bg-gray-200/80 text-gray-400 px-1.5 py-0.5 rounded-md font-bold tracking-wide shrink-0">OFF</span>}
              {on && fill < 100 && fill > 0 && <span className="text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md font-bold shrink-0">{fill}%</span>}
              {on && fill === 100 && <Check size={12} className="text-emerald-500 shrink-0" />}
            </div>
            {!isExpanded && on && (
              <p className="text-[11px] text-gray-400 mt-0.5 truncate">{SDESC[section.type]}</p>
            )}
          </button>

          <button title={on ? 'Nonaktifkan' : 'Aktifkan'} onClick={e => { e.stopPropagation(); onToggle() }}
            className="shrink-0 p-1 rounded-lg hover:bg-gray-100 transition-colors">
            {on ? <Eye size={16} className="text-emerald-500" /> : <EyeOff size={16} className="text-gray-300" />}
          </button>

          <button onClick={onToggleExpand} className="shrink-0 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronDown size={14} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-rose-400' : 'text-gray-300'}`} />
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.25, 1, 0.5, 1] }}
              className="overflow-hidden"
            >
              {!on ? (
                <div className="px-5 py-5 border-t border-gray-100 bg-gray-50/80">
                  <p className="text-sm text-gray-500 mb-3">
                    Section ini <strong className="text-gray-700">tidak aktif</strong> dan tidak akan tampil di undangan.
                  </p>
                  <button onClick={onToggle}
                    className="flex items-center gap-2 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors">
                    <Eye size={15} /> Aktifkan section ini
                  </button>
                </div>
              ) : (
                <div className="px-5 pb-5 pt-3 border-t border-rose-100/60">
                  <SectionForm type={section.type} data={data} onChange={onChange} />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </Reorder.Item>
  )
}

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
  const [showMobilePreview, setShowMobilePreview] = useState(false)

  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const previewTemplate: TemplateRecord = useMemo(() => ({
    ...template,
    config: {
      ...template.config,
      sections: sections.map(s => ({
        ...template.config.sections.find(ts => ts.id === s.id)!,
        enabled: s.enabled, order: s.order,
      })).filter(Boolean),
    },
  }), [template, sections])

  const scheduleSave = useCallback((d: NewInvitationData, s: EditorSection[]) => {
    clearTimeout(timer.current)
    setSaveStatus('saving')
    timer.current = setTimeout(async () => {
      const overrides = s.map(x => ({ id: x.id, type: x.type, enabled: x.enabled, order: x.order }))
      const res = await fetch(`/api/invitations/${invitation.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
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
    const next = { ...data, ...patch }; setData(next); scheduleSave(next, sections)
  }
  function handleReorder(newOrder: EditorSection[]) {
    const withOrder = newOrder.map((s, i) => ({ ...s, order: i + 1 })); setSections(withOrder); scheduleSave(data, withOrder)
  }
  function toggleSection(id: string) {
    const updated = sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s); setSections(updated); scheduleSave(data, updated)
  }

  const enabledCount = sections.filter(s => s.enabled).length
  const totalFill = useMemo(() => {
    const relevant = sections.filter(s => s.enabled)
    if (relevant.length === 0) return 0
    return Math.round(relevant.reduce((sum, s) => sum + getSectionFill(s.type, data), 0) / relevant.length)
  }, [sections, data])

  return (
    <div>
      {/* Header bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-5 overflow-hidden">
        <div className="px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-200/50">
              <FileText size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Editor Undangan</h2>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-[11px] text-gray-400">{enabledCount} section aktif</span>
                <span className="text-[11px] text-gray-400">Kelengkapan {totalFill}%</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <AnimatePresence mode="wait">
              {saveStatus === 'saving' && (
                <motion.div key="saving" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg">
                  <Loader2 size={12} className="animate-spin" /> Menyimpan...
                </motion.div>
              )}
              {saveStatus === 'saved' && (
                <motion.div key="saved" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg font-medium">
                  <Check size={12} /> Tersimpan
                </motion.div>
              )}
            </AnimatePresence>
            <button onClick={() => setShowMobilePreview(true)}
              className="lg:hidden flex items-center gap-1.5 bg-gray-100 text-gray-600 px-3 py-2 rounded-xl text-xs font-semibold hover:bg-gray-200 transition-colors">
              <MonitorSmartphone size={14} /> Preview
            </button>
          </div>
        </div>
        <div className="h-1 bg-gray-100">
          <motion.div className="h-full bg-gradient-to-r from-rose-400 to-pink-500 rounded-r-full" initial={{ width: 0 }} animate={{ width: `${totalFill}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} />
        </div>
      </div>

      {/* Instruction */}
      <p className="text-xs text-gray-400 mb-3 px-1">Seret untuk ubah urutan. Klik untuk edit konten. Ikon mata untuk tampilkan/sembunyikan.</p>

      <div className="flex gap-6">
        {/* Section list */}
        <div className="flex-1 min-w-0">
          <Reorder.Group axis="y" values={sections} onReorder={handleReorder} className="space-y-2">
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

        {/* Desktop phone preview */}
        <div className="hidden lg:block shrink-0">
          <div className="sticky top-6">
            <PhoneMockup slug={invitation.slug}>
              <InvitationPreview template={previewTemplate} data={data} invitationId={invitation.id} />
            </PhoneMockup>
          </div>
        </div>
      </div>

      {/* Mobile preview overlay */}
      <AnimatePresence>
        {showMobilePreview && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col"
          >
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
              <p className="text-white/80 text-sm font-semibold">Preview Undangan</p>
              <button onClick={() => setShowMobilePreview(false)} className="w-8 h-8 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 flex items-start justify-center overflow-y-auto py-4">
              <PhoneMockup slug={invitation.slug}>
                <InvitationPreview template={previewTemplate} data={data} invitationId={invitation.id} />
              </PhoneMockup>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
