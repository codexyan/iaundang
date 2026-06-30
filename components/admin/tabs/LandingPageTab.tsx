'use client'

import { useState, useEffect, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  Sparkles, BarChart3, Megaphone, MessageSquareQuote, HelpCircle,
  Eye, Save, Loader2, Plus, Trash2,
  ChevronDown, ChevronUp, RotateCcw,
  PenLine, ExternalLink,
  EyeOff, Star, Tag, FileText,
  CheckCircle, Info, GripVertical, ArrowUp, ArrowDown, LayoutGrid,
} from 'lucide-react'

interface HeroContent {
  headline: string; subheadline: string; ctaPrimary: string; ctaSecondary: string
  socialProofCount: string; socialProofRating: string
}
interface TrustBarItem { value: string; label: string }
interface TestimonialItem { names: string; date: string; template: string; quote: string; initial: string; color: string }
interface FAQItem { q: string; a: string }
interface HowItWorksStep { title: string; description: string }

interface HeroMockup { groomName: string; brideName: string; date: string; venue: string }
interface TemplateShowcaseFeatured { name: string; tagline: string; coverPhoto: string; primary: string; accent: string; href: string }
interface TemplateShowcaseComingSoon { label: string; accent: string; bg: string }
interface PersonalisasiMockup { guestName: string; groomName: string; brideName: string }

interface LandingPageSettings {
  hero: HeroContent
  trustBar: { items: TrustBarItem[] }
  testimonials: { items: TestimonialItem[] }
  faq: { items: FAQItem[] }
  howItWorks: { steps: HowItWorksStep[] }
  heroMockup: HeroMockup
  templateShowcase: { featured: TemplateShowcaseFeatured; comingSoon: TemplateShowcaseComingSoon[] }
  personalisasiMockup: PersonalisasiMockup
}

interface LandingSectionConfigItem {
  id: string; label: string; visible: boolean; order: number
}

type SectionId = 'hero' | 'trustBar' | 'testimonials' | 'faq' | 'howItWorks' | 'heroMockup' | 'templateShowcase' | 'personalisasiMockup'

const SECTIONS: { id: SectionId; icon: React.ElementType; title: string; desc: string }[] = [
  { id: 'hero', icon: Sparkles, title: 'Hero', desc: 'Headline, subheadline, CTA' },
  { id: 'heroMockup', icon: Eye, title: 'Hero Mockup', desc: 'Nama pasangan, tanggal, venue di mockup' },
  { id: 'trustBar', icon: BarChart3, title: 'Trust Bar', desc: 'Statistik sosial proof' },
  { id: 'templateShowcase', icon: Star, title: 'Koleksi Template', desc: 'Featured template & coming soon' },
  { id: 'personalisasiMockup', icon: Tag, title: 'Personalisasi Mockup', desc: 'Nama tamu & pasangan di preview' },
  { id: 'howItWorks', icon: Megaphone, title: 'Cara Kerja', desc: '3 langkah' },
  { id: 'testimonials', icon: MessageSquareQuote, title: 'Testimoni', desc: 'Review pasangan' },
  { id: 'faq', icon: HelpCircle, title: 'FAQ', desc: 'Pertanyaan umum' },
]

const TESTIMONIAL_COLORS = ['#2c4a34', '#9a7d3f', '#4a6355', '#5d7a6a', '#3a5a40', '#b8954d']

const SECTION_ICONS: Record<string, React.ElementType> = {
  hero: Sparkles, trustBar: BarChart3, templatePreview: Eye,
  featureShowcase: Star, howItWorks: Megaphone,
  testimonials: MessageSquareQuote, pricing: Tag,
  blogShowcase: FileText, faq: HelpCircle, closingCta: CheckCircle,
}

function getInitials(names: string): string {
  return names.split(/[&\s]+/).filter(Boolean).map(w => w[0]?.toUpperCase() ?? '').join('').slice(0, 2)
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="block text-xs font-semibold text-gray-600 mb-1.5">{children}</label>
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-forest-400 focus:ring-1 focus:ring-forest-200 outline-none transition-colors" />
}

function TextArea({ value, onChange, rows = 3, placeholder }: { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return <textarea value={value} onChange={e => onChange(e.target.value)} rows={rows} placeholder={placeholder}
    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-forest-400 focus:ring-1 focus:ring-forest-200 outline-none transition-colors resize-none" />
}

function HeroEditor({ hero, onChange }: { hero: HeroContent; onChange: (v: HeroContent) => void }) {
  const set = (key: keyof HeroContent, value: string) => onChange({ ...hero, [key]: value })
  return (
    <div className="space-y-4">
      <div><FieldLabel>Headline</FieldLabel><TextInput value={hero.headline} onChange={v => set('headline', v)} /></div>
      <div><FieldLabel>Subheadline</FieldLabel><TextArea value={hero.subheadline} onChange={v => set('subheadline', v)} rows={3} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><FieldLabel>Tombol CTA Utama</FieldLabel><TextInput value={hero.ctaPrimary} onChange={v => set('ctaPrimary', v)} /></div>
        <div><FieldLabel>Tombol CTA Sekunder</FieldLabel><TextInput value={hero.ctaSecondary} onChange={v => set('ctaSecondary', v)} /></div>
      </div>
    </div>
  )
}

function TrustBarEditor({ items, onChange }: { items: TrustBarItem[]; onChange: (items: TrustBarItem[]) => void }) {
  const updateItem = (i: number, key: keyof TrustBarItem, value: string) => { const next = [...items]; next[i] = { ...next[i], [key]: value }; onChange(next) }
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="grid grid-cols-[1fr_2fr] gap-2 bg-gray-50 rounded-lg p-3">
          <div><label className="text-[10px] text-gray-400">Nilai</label><TextInput value={item.value} onChange={v => updateItem(i, 'value', v)} /></div>
          <div><label className="text-[10px] text-gray-400">Label</label><TextInput value={item.label} onChange={v => updateItem(i, 'label', v)} /></div>
        </div>
      ))}
    </div>
  )
}

function HowItWorksEditor({ steps, onChange }: { steps: HowItWorksStep[]; onChange: (steps: HowItWorksStep[]) => void }) {
  const updateStep = (i: number, key: keyof HowItWorksStep, value: string) => { const next = [...steps]; next[i] = { ...next[i], [key]: value }; onChange(next) }
  return (
    <div className="space-y-2">
      {steps.map((step, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-6 h-6 rounded-full bg-forest-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">{i + 1}</span>
            <TextInput value={step.title} onChange={v => updateStep(i, 'title', v)} placeholder="Judul" />
          </div>
          <TextArea value={step.description} onChange={v => updateStep(i, 'description', v)} rows={2} placeholder="Deskripsi" />
        </div>
      ))}
    </div>
  )
}

function TestimonialsEditor({ items, onChange }: { items: TestimonialItem[]; onChange: (items: TestimonialItem[]) => void }) {
  const updateItem = (i: number, key: keyof TestimonialItem, value: string) => {
    const next = [...items]; const updated = { ...next[i], [key]: value }
    if (key === 'names') updated.initial = getInitials(value)
    next[i] = updated; onChange(next)
  }
  const addItem = () => onChange([...items, { names: '', date: '', template: 'Modern', quote: '', initial: '', color: TESTIMONIAL_COLORS[items.length % TESTIMONIAL_COLORS.length] }])
  const removeItem = (i: number) => { if (items.length <= 1) return; onChange(items.filter((_, idx) => idx !== i)) }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0" style={{ backgroundColor: item.color }}>{item.initial || '?'}</div>
              <span className="text-xs font-semibold text-gray-700">{item.names || 'Baru'}</span>
            </div>
            <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div><label className="text-[10px] text-gray-400">Nama</label><TextInput value={item.names} onChange={v => updateItem(i, 'names', v)} placeholder="Rizky & Aulia" /></div>
            <div><label className="text-[10px] text-gray-400">Tanggal</label><TextInput value={item.date} onChange={v => updateItem(i, 'date', v)} placeholder="Maret 2026" /></div>
            <div><label className="text-[10px] text-gray-400">Template</label><TextInput value={item.template} onChange={v => updateItem(i, 'template', v)} placeholder="Modern" /></div>
          </div>
          <div><label className="text-[10px] text-gray-400">Kutipan</label><TextArea value={item.quote} onChange={v => updateItem(i, 'quote', v)} rows={2} /></div>
        </div>
      ))}
      <button onClick={addItem} className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-forest-600 hover:text-forest-700 border border-dashed border-gray-200 hover:border-forest-300 rounded-lg py-2.5 transition-colors"><Plus className="w-3.5 h-3.5" /> Tambah Testimoni</button>
    </div>
  )
}

function HeroMockupEditor({ data, onChange }: { data: HeroMockup; onChange: (v: HeroMockup) => void }) {
  const set = (key: keyof HeroMockup, value: string) => onChange({ ...data, [key]: value })
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div><FieldLabel>Nama Mempelai Pria</FieldLabel><TextInput value={data.groomName} onChange={v => set('groomName', v)} placeholder="Rizky" /></div>
        <div><FieldLabel>Nama Mempelai Wanita</FieldLabel><TextInput value={data.brideName} onChange={v => set('brideName', v)} placeholder="Aulia" /></div>
      </div>
      <div><FieldLabel>Tanggal</FieldLabel><TextInput value={data.date} onChange={v => set('date', v)} placeholder="12 · 04 · 2026" /></div>
      <div><FieldLabel>Venue</FieldLabel><TextInput value={data.venue} onChange={v => set('venue', v)} placeholder="Hotel Grand Ballroom, Jakarta" /></div>
    </div>
  )
}

function TemplateShowcaseEditor({ data, onChange }: { data: LandingPageSettings['templateShowcase']; onChange: (v: LandingPageSettings['templateShowcase']) => void }) {
  const setFeatured = (key: keyof TemplateShowcaseFeatured, value: string) => onChange({ ...data, featured: { ...data.featured, [key]: value } })
  const updateComingSoon = (i: number, key: keyof TemplateShowcaseComingSoon, value: string) => {
    const next = [...data.comingSoon]; next[i] = { ...next[i], [key]: value }; onChange({ ...data, comingSoon: next })
  }
  const addComingSoon = () => onChange({ ...data, comingSoon: [...data.comingSoon, { label: '', accent: '#64ffda', bg: '#060e1f' }] })
  const removeComingSoon = (i: number) => { if (data.comingSoon.length <= 1) return; onChange({ ...data, comingSoon: data.comingSoon.filter((_, idx) => idx !== i) }) }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-bold text-gray-700 mb-3">Featured Template</p>
        <div className="space-y-3 bg-gray-50 rounded-lg p-3">
          <div className="grid grid-cols-2 gap-3">
            <div><FieldLabel>Nama Template</FieldLabel><TextInput value={data.featured.name} onChange={v => setFeatured('name', v)} placeholder="Javanese Gold" /></div>
            <div><FieldLabel>Tagline</FieldLabel><TextInput value={data.featured.tagline} onChange={v => setFeatured('tagline', v)} /></div>
          </div>
          <div><FieldLabel>URL Cover Photo</FieldLabel><TextInput value={data.featured.coverPhoto} onChange={v => setFeatured('coverPhoto', v)} placeholder="https://..." /></div>
          <div className="grid grid-cols-3 gap-3">
            <div><FieldLabel>Primary Color</FieldLabel><TextInput value={data.featured.primary} onChange={v => setFeatured('primary', v)} placeholder="#1a4a1a" /></div>
            <div><FieldLabel>Accent Color</FieldLabel><TextInput value={data.featured.accent} onChange={v => setFeatured('accent', v)} placeholder="#d4af37" /></div>
            <div><FieldLabel>Link Demo</FieldLabel><TextInput value={data.featured.href} onChange={v => setFeatured('href', v)} placeholder="/demo/renderer?id=..." /></div>
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-gray-700 mb-3">Coming Soon</p>
        <div className="space-y-2">
          {data.comingSoon.map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-lg p-3 flex items-end gap-2">
              <div className="flex-1"><FieldLabel>Label</FieldLabel><TextInput value={item.label} onChange={v => updateComingSoon(i, 'label', v)} placeholder="Modern Minimal" /></div>
              <div className="w-28"><FieldLabel>Accent</FieldLabel><TextInput value={item.accent} onChange={v => updateComingSoon(i, 'accent', v)} placeholder="#64ffda" /></div>
              <div className="w-28"><FieldLabel>Background</FieldLabel><TextInput value={item.bg} onChange={v => updateComingSoon(i, 'bg', v)} placeholder="#060e1f" /></div>
              <button onClick={() => removeComingSoon(i)} className="text-gray-400 hover:text-red-500 p-2 mb-0.5"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
          <button onClick={addComingSoon} className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-forest-600 hover:text-forest-700 border border-dashed border-gray-200 hover:border-forest-300 rounded-lg py-2.5 transition-colors"><Plus className="w-3.5 h-3.5" /> Tambah Template</button>
        </div>
      </div>
    </div>
  )
}

function PersonalisasiMockupEditor({ data, onChange }: { data: PersonalisasiMockup; onChange: (v: PersonalisasiMockup) => void }) {
  const set = (key: keyof PersonalisasiMockup, value: string) => onChange({ ...data, [key]: value })
  return (
    <div className="space-y-4">
      <div><FieldLabel>Nama Tamu (tampil di &quot;Kepada Yth.&quot;)</FieldLabel><TextInput value={data.guestName} onChange={v => set('guestName', v)} placeholder="Bapak & Ibu Hendra" /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><FieldLabel>Nama Mempelai Pria</FieldLabel><TextInput value={data.groomName} onChange={v => set('groomName', v)} placeholder="Rizky" /></div>
        <div><FieldLabel>Nama Mempelai Wanita</FieldLabel><TextInput value={data.brideName} onChange={v => set('brideName', v)} placeholder="Aulia" /></div>
      </div>
    </div>
  )
}

function FAQEditor({ items, onChange }: { items: FAQItem[]; onChange: (items: FAQItem[]) => void }) {
  const updateItem = (i: number, key: keyof FAQItem, value: string) => { const next = [...items]; next[i] = { ...next[i], [key]: value }; onChange(next) }
  const addItem = () => onChange([...items, { q: '', a: '' }])
  const removeItem = (i: number) => { if (items.length <= 1) return; onChange(items.filter((_, idx) => idx !== i)) }

  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">FAQ {i + 1}</span>
            <button onClick={() => removeItem(i)} className="text-gray-400 hover:text-red-500 p-1"><Trash2 className="w-3.5 h-3.5" /></button>
          </div>
          <TextInput value={item.q} onChange={v => updateItem(i, 'q', v)} placeholder="Pertanyaan..." />
          <TextArea value={item.a} onChange={v => updateItem(i, 'a', v)} rows={2} placeholder="Jawaban..." />
        </div>
      ))}
      <button onClick={addItem} className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-forest-600 hover:text-forest-700 border border-dashed border-gray-200 hover:border-forest-300 rounded-lg py-2.5 transition-colors"><Plus className="w-3.5 h-3.5" /> Tambah FAQ</button>
    </div>
  )
}

export default function LandingPageTab() {
  const [landing, setLanding] = useState<LandingPageSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [openSection, setOpenSection] = useState<SectionId | null>('hero')
  const [mode, setMode] = useState<'content' | 'layout'>('content')
  const [layoutSections, setLayoutSections] = useState<LandingSectionConfigItem[]>([])
  const [layoutLoading, setLayoutLoading] = useState(false)
  const [layoutDirty, setLayoutDirty] = useState(false)
  const [layoutSaving, setLayoutSaving] = useState(false)

  const fetchLanding = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/landing')
      if (!res.ok) throw new Error()
      setLanding((await res.json()).landing)
    } catch { toast.error('Gagal memuat data') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchLanding() }, [fetchLanding])

  const fetchLayout = useCallback(async () => {
    setLayoutLoading(true)
    try {
      const res = await fetch('/api/admin/landing-sections')
      if (!res.ok) throw new Error()
      setLayoutSections((await res.json()).sections)
    } catch { toast.error('Gagal memuat layout') }
    finally { setLayoutLoading(false) }
  }, [])

  useEffect(() => { if (mode === 'layout') fetchLayout() }, [mode, fetchLayout])

  // Warn before leaving the page (refresh/close/navigate) when there are unsaved changes
  useEffect(() => {
    if (!dirty && !layoutDirty) return
    const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [dirty, layoutDirty])

  const handleSave = async () => {
    if (!landing) return
    setSaving(true)
    try {
      const res = await fetch('/api/admin/landing', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(landing) })
      if (!res.ok) throw new Error()
      toast.success('Tersimpan!'); setDirty(false)
    } catch { toast.error('Gagal menyimpan') }
    finally { setSaving(false) }
  }

  const handleSaveLayout = async () => {
    setLayoutSaving(true)
    try {
      const res = await fetch('/api/admin/landing-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sections: layoutSections }),
      })
      if (!res.ok) throw new Error()
      toast.success('Layout tersimpan!'); setLayoutDirty(false)
    } catch { toast.error('Gagal menyimpan layout') }
    finally { setLayoutSaving(false) }
  }

  const update = <K extends keyof LandingPageSettings>(key: K, value: LandingPageSettings[K]) => {
    setLanding(prev => prev ? { ...prev, [key]: value } : prev); setDirty(true)
  }

  const moveSection = (index: number, dir: -1 | 1) => {
    const target = index + dir
    if (target < 0 || target >= layoutSections.length) return
    const next = [...layoutSections]
    ;[next[index], next[target]] = [next[target], next[index]]
    next.forEach((s, i) => s.order = i)
    setLayoutSections(next)
    setLayoutDirty(true)
  }

  const toggleVisibility = (index: number) => {
    const next = [...layoutSections]
    next[index] = { ...next[index], visible: !next[index].visible }
    setLayoutSections(next)
    setLayoutDirty(true)
  }

  if (loading || !landing) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-8 pt-5 pb-4 border-b border-gray-100 bg-white">
          <div className="h-5 w-32 bg-gray-100 rounded animate-pulse mb-1" />
          <div className="h-3 w-48 bg-gray-50 rounded animate-pulse" />
        </div>
        <div className="p-6 lg:p-8 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-4 w-24 bg-gray-100 rounded" />
                  <div className="h-3 w-40 bg-gray-50 rounded" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-5 pb-4 border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Landing Page</h1>
            <p className="text-xs text-gray-400 mt-0.5">Kelola konten & tata letak halaman utama</p>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-forest-600 hover:text-forest-800 bg-forest-50 hover:bg-forest-100 px-3 py-1.5 rounded-lg transition-colors">
            <ExternalLink className="w-3.5 h-3.5" />Preview
          </a>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button onClick={() => setMode('content')}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${mode === 'content' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <PenLine className="w-3.5 h-3.5" />Konten
              </button>
              <button onClick={() => setMode('layout')}
                className={`px-4 py-2 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${mode === 'layout' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <LayoutGrid className="w-3.5 h-3.5" />Tata Letak
              </button>
            </div>
          </div>

          {mode === 'layout' && (
            <>
              {layoutDirty && (
                <div className="mb-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />Layout berubah, belum disimpan
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { fetchLayout(); setLayoutDirty(false) }} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-white transition-colors"><RotateCcw className="w-3.5 h-3.5 inline mr-1" />Batal</button>
                    <button onClick={handleSaveLayout} disabled={layoutSaving}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-forest-500 text-white hover:bg-forest-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                      {layoutSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Simpan Layout
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl border border-gray-100 p-5 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <LayoutGrid className="w-4 h-4 text-forest-600" />
                  <h3 className="text-sm font-bold text-gray-900">Atur Urutan & Visibilitas Section</h3>
                </div>
                <p className="text-xs text-gray-400 mb-4">Gunakan tombol panah untuk mengubah urutan. Toggle untuk menyembunyikan/menampilkan section di landing page.</p>

                {layoutLoading ? (
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => <div key={i} className="h-14 bg-gray-50 rounded-lg animate-pulse" />)}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {layoutSections.map((section, idx) => {
                      const Icon = SECTION_ICONS[section.id] || Sparkles
                      return (
                        <div key={section.id}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                            section.visible ? 'bg-white border-gray-100 hover:border-gray-200' : 'bg-gray-50/50 border-gray-50 opacity-60'
                          }`}>
                          <GripVertical className="w-4 h-4 text-gray-300 shrink-0" />
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${section.visible ? 'bg-forest-50' : 'bg-gray-100'}`}>
                            <Icon className={`w-4 h-4 ${section.visible ? 'text-forest-600' : 'text-gray-400'}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-semibold ${section.visible ? 'text-gray-900' : 'text-gray-400'}`}>{section.label}</p>
                            <p className="text-[10px] text-gray-400">{section.id}</p>
                          </div>
                          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                            section.visible ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {section.visible ? 'Tampil' : 'Tersembunyi'}
                          </span>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button onClick={() => moveSection(idx, -1)} disabled={idx === 0}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => moveSection(idx, 1)} disabled={idx === layoutSections.length - 1}
                              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 disabled:opacity-30 disabled:hover:bg-transparent transition-colors">
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button onClick={() => toggleVisibility(idx)}
                            className={`p-2 rounded-lg transition-colors shrink-0 ${section.visible ? 'hover:bg-red-50 text-gray-400 hover:text-red-500' : 'hover:bg-emerald-50 text-gray-400 hover:text-emerald-500'}`}
                            title={section.visible ? 'Sembunyikan' : 'Tampilkan'}>
                            {section.visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-700">
                  <p className="font-semibold mb-1">Tips:</p>
                  <ul className="space-y-0.5 list-disc pl-4 text-blue-600">
                    <li>Section yang disembunyikan tidak akan tampil di landing page</li>
                    <li>Urutan di sini menentukan urutan tampilan di halaman utama</li>
                    <li>Untuk mengubah konten section, beralih ke tab &quot;Konten&quot;</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {mode === 'content' && (
            <>
              {dirty && (
                <div className="mb-4 flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                  <div className="flex items-center gap-2 text-sm text-amber-700">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />Ada perubahan belum disimpan
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { fetchLanding(); setDirty(false) }} className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-white transition-colors"><RotateCcw className="w-3.5 h-3.5 inline mr-1" />Batal</button>
                    <button onClick={handleSave} disabled={saving}
                      className="flex items-center gap-1.5 text-xs font-semibold bg-forest-500 text-white hover:bg-forest-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                      {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Simpan
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
                {SECTIONS.map(section => {
                  const isOpen = openSection === section.id
                  const Icon = section.icon
                  return (
                    <div key={section.id} className={`bg-white rounded-xl border transition-all ${isOpen ? 'border-forest-200 shadow-sm xl:col-span-2' : 'border-gray-100 hover:border-gray-200'}`}>
                      <button onClick={() => setOpenSection(isOpen ? null : section.id)} className="w-full px-4 py-3.5 flex items-center gap-3 text-left">
                        <div className={`shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ${isOpen ? 'bg-forest-100' : 'bg-gray-50'}`}>
                          <Icon className={`w-4.5 h-4.5 ${isOpen ? 'text-forest-600' : 'text-gray-400'}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${isOpen ? 'text-forest-800' : 'text-gray-800'}`}>{section.title}</p>
                          <p className="text-xs text-gray-400">{section.desc}</p>
                        </div>
                        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 border-t border-gray-50 pt-4">
                          {section.id === 'hero' && <HeroEditor hero={landing.hero} onChange={v => update('hero', v)} />}
                          {section.id === 'heroMockup' && <HeroMockupEditor data={landing.heroMockup} onChange={v => update('heroMockup', v)} />}
                          {section.id === 'trustBar' && <TrustBarEditor items={landing.trustBar.items} onChange={items => update('trustBar', { items })} />}
                          {section.id === 'templateShowcase' && <TemplateShowcaseEditor data={landing.templateShowcase} onChange={v => update('templateShowcase', v)} />}
                          {section.id === 'personalisasiMockup' && <PersonalisasiMockupEditor data={landing.personalisasiMockup} onChange={v => update('personalisasiMockup', v)} />}
                          {section.id === 'howItWorks' && <HowItWorksEditor steps={landing.howItWorks.steps} onChange={steps => update('howItWorks', { steps })} />}
                          {section.id === 'testimonials' && <TestimonialsEditor items={landing.testimonials.items} onChange={items => update('testimonials', { items })} />}
                          {section.id === 'faq' && <FAQEditor items={landing.faq.items} onChange={items => update('faq', { items })} />}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
