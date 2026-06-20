'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import toast from 'react-hot-toast'
import {
  Globe, Sparkles, BarChart3, Megaphone,
  MessageSquareQuote, HelpCircle,
  Eye, Save, Loader2, Plus, Trash2,
  ChevronDown, ChevronUp, RotateCcw,
  FileText, PenLine, ExternalLink,
  CheckCircle2, Clock, X, EyeOff,
  Heart, MessageCircle, Tag, Search,
  BarChart2, Settings2, ArrowLeft, Image as ImageIcon,
  Bold, Italic, List, Link2, Heading, Quote, Minus,
  Table, Code, ListOrdered, ShieldCheck, Ban,
  AlertCircle, CheckCircle, XCircle, Info,
  Megaphone as AdIcon, Link as LinkIcon,
  Star, Pin, Lock, MessageSquare, Hash, Type,
  GripVertical, ArrowUp, ArrowDown, LayoutGrid,
} from 'lucide-react'

// 
// TYPES
// 

interface HeroContent {
  headline: string; subheadline: string; ctaPrimary: string; ctaSecondary: string
  socialProofCount: string; socialProofRating: string
}
interface TrustBarItem { value: string; label: string }
interface TestimonialItem { names: string; date: string; template: string; quote: string; initial: string; color: string }
interface FAQItem { q: string; a: string }
interface HowItWorksStep { title: string; description: string }

interface LandingPageSettings {
  hero: HeroContent
  trustBar: { items: TrustBarItem[] }
  testimonials: { items: TestimonialItem[] }
  faq: { items: FAQItem[] }
  howItWorks: { steps: HowItWorksStep[] }
}

interface ArticleSettings {
  comments: {
    moderation: 'auto' | 'manual'
    bannedWords: string
    closeAfterDays: number
    requireLogin: boolean
    allowReplies: boolean
    maxLength: number
  }
  seo: {
    focusKeyword: string
    canonicalUrl: string
    ogImageUrl: string
    noIndex: boolean
  }
  ads: {
    enabled: boolean
    positions: string[]
    adCode: string
  }
  backlinks: {
    internal: string[]
    external: string[]
  }
  featured: boolean
  pinned: boolean
}

const DEFAULT_SETTINGS: ArticleSettings = {
  comments: { moderation: 'auto', bannedWords: '', closeAfterDays: 0, requireLogin: false, allowReplies: true, maxLength: 500 },
  seo: { focusKeyword: '', canonicalUrl: '', ogImageUrl: '', noIndex: false },
  ads: { enabled: false, positions: [], adCode: '' },
  backlinks: { internal: [], external: [] },
  featured: false,
  pinned: false,
}

interface ArticleData {
  id: string; title: string; slug: string; excerpt: string; content: string
  coverUrl: string; authorId: string | null; authorName: string; authorAvatar: string
  isPublished: boolean; publishedAt: string | null
  allowLikes: boolean; allowComments: boolean; likesCount: number; viewsCount: number
  metaTitle: string; metaDesc: string; tags: string; settings: ArticleSettings
  createdAt: string; updatedAt: string
}

interface LandingSectionConfigItem {
  id: string; label: string; visible: boolean; order: number
}

type SubTab = 'landing' | 'articles'
type SectionId = 'hero' | 'trustBar' | 'testimonials' | 'faq' | 'howItWorks'

const SECTIONS: { id: SectionId; icon: React.ElementType; title: string; desc: string }[] = [
  { id: 'hero', icon: Sparkles, title: 'Hero', desc: 'Headline, subheadline, CTA' },
  { id: 'trustBar', icon: BarChart3, title: 'Trust Bar', desc: 'Statistik sosial proof' },
  { id: 'howItWorks', icon: Megaphone, title: 'Cara Kerja', desc: '3 langkah' },
  { id: 'testimonials', icon: MessageSquareQuote, title: 'Testimoni', desc: 'Review pasangan' },
  { id: 'faq', icon: HelpCircle, title: 'FAQ', desc: 'Pertanyaan umum' },
]

const TESTIMONIAL_COLORS = ['#2c4a34', '#9a7d3f', '#4a6355', '#5d7a6a', '#3a5a40', '#b8954d']

function getInitials(names: string): string {
  return names.split(/[&\s]+/).filter(Boolean).map(w => w[0]?.toUpperCase() ?? '').join('').slice(0, 2)
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

function readTime(text: string): number {
  return Math.max(1, Math.ceil(wordCount(text) / 200))
}

// 
// MARKDOWN PREVIEW (reuses parser logic inline for admin preview)
// 

function parseMarkdownPreview(md: string): string {
  const lines = md.split('\n')
  const output: string[] = []
  let i = 0
  while (i < lines.length) {
    if (lines[i].includes('|') && i + 1 < lines.length && /^\|?\s*[-:]+[-|\s:]*$/.test(lines[i + 1])) {
      const hCells = lines[i].split('|').map(c => c.trim()).filter(Boolean)
      const alLine = lines[i + 1].split('|').map(c => c.trim()).filter(Boolean)
      const aligns = alLine.map(c => c.startsWith(':') && c.endsWith(':') ? 'center' : c.endsWith(':') ? 'right' : 'left')
      let t = '<table><thead><tr>'
      hCells.forEach((c, ci) => { t += `<th style="text-align:${aligns[ci]||'left'}">${inl(esc(c))}</th>` })
      t += '</tr></thead><tbody>'
      i += 2
      while (i < lines.length && lines[i].includes('|')) {
        const cells = lines[i].split('|').map(c => c.trim()).filter(Boolean)
        t += '<tr>'
        cells.forEach((c, ci) => { t += `<td style="text-align:${aligns[ci]||'left'}">${inl(esc(c))}</td>` })
        t += '</tr>'; i++
      }
      t += '</tbody></table>'; output.push(t); continue
    }
    const line = lines[i]
    if (line.startsWith('### ')) { output.push(`<h3>${inl(esc(line.slice(4)))}</h3>`); i++; continue }
    if (line.startsWith('## ')) { output.push(`<h2>${inl(esc(line.slice(3)))}</h2>`); i++; continue }
    if (line.startsWith('# ')) { output.push(`<h1>${inl(esc(line.slice(2)))}</h1>`); i++; continue }
    if (/^---+$/.test(line.trim())) { output.push('<hr />'); i++; continue }
    const imgM = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/)
    if (imgM) { output.push(`<figure><img src="${esc(imgM[2])}" alt="${esc(imgM[1])}" style="max-width:100%;border-radius:8px" />${imgM[1]?`<figcaption style="text-align:center;font-size:12px;color:#a8a29e;margin-top:4px">${esc(imgM[1])}</figcaption>`:''}</figure>`); i++; continue }
    if (line.startsWith('> ')) { output.push(`<blockquote>${inl(esc(line.slice(2)))}</blockquote>`); i++; continue }
    if (/^[-*] /.test(line)) {
      let l = '<ul>'; while (i < lines.length && /^[-*] /.test(lines[i])) { l += `<li>${inl(esc(lines[i].replace(/^[-*] /, '')))}</li>`; i++ }
      l += '</ul>'; output.push(l); continue
    }
    if (/^\d+\. /.test(line)) {
      let l = '<ol>'; while (i < lines.length && /^\d+\. /.test(lines[i])) { l += `<li>${inl(esc(lines[i].replace(/^\d+\. /, '')))}</li>`; i++ }
      l += '</ol>'; output.push(l); continue
    }
    if (line.trim() === '') { i++; continue }
    let para = ''
    while (i < lines.length && lines[i].trim() !== '' && !/^#{1,3} |^[-*] |^\d+\. |^> |^---+$|^!\[/.test(lines[i]) && !(lines[i].includes('|') && i + 1 < lines.length && /^\|?\s*[-:]+[-|\s:]*$/.test(lines[i + 1]))) {
      if (para) para += ' '; para += lines[i]; i++
    }
    if (para) output.push(`<p>${inl(esc(para))}</p>`)
  }
  return output.join('\n')
}
function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
function inl(s: string) {
  return s
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" style="max-width:100%;border-radius:4px" />')
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background:#f5f5f4;padding:1px 4px;border-radius:3px;font-size:0.875em">$1</code>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" style="color:#2c4a34;text-decoration:underline">$1</a>')
}

// 
// SEO ANALYSIS
// 

interface SeoCheck { label: string; pass: boolean; hint: string }

function analyzeSeo(form: ArticleData): { score: number; checks: SeoCheck[]; grade: 'good' | 'ok' | 'poor' } {
  const kw = (form.settings.seo.focusKeyword || '').toLowerCase().trim()
  const title = (form.metaTitle || form.title).toLowerCase()
  const desc = (form.metaDesc || form.excerpt).toLowerCase()
  const content = form.content.toLowerCase()
  const titleLen = (form.metaTitle || form.title).length
  const descLen = (form.metaDesc || form.excerpt).length
  const wc = wordCount(form.content)
  const hasImages = /!\[.*?\]\(.*?\)/.test(form.content)
  const hasInternal = /\[.*?\]\(\//.test(form.content)
  const hasExternal = /\[.*?\]\(https?:\/\//.test(form.content)
  const firstPara = content.split('\n').find(l => l.trim() && !l.startsWith('#') && !l.startsWith('>') && !l.startsWith('-')) || ''

  const checks: SeoCheck[] = [
    { label: 'Focus keyword ditentukan', pass: !!kw, hint: 'Tentukan kata kunci utama yang ingin ditarget di halaman pencarian' },
    { label: 'Keyword ada di judul', pass: !!kw && title.includes(kw), hint: 'Pastikan kata kunci muncul di judul artikel untuk ranking lebih baik' },
    { label: 'Keyword ada di meta description', pass: !!kw && desc.includes(kw), hint: 'Meta description dengan keyword membantu click-through rate di Google' },
    { label: 'Keyword di paragraf pertama', pass: !!kw && firstPara.includes(kw), hint: 'Sebutkan keyword di 100 kata pertama agar Google memahami topik utama' },
    { label: 'Keyword di subjudul (H2/H3)', pass: !!kw && /^#{2,3}\s.*$/m.test(form.content) && form.content.split('\n').some(l => /^#{2,3}\s/.test(l) && l.toLowerCase().includes(kw)), hint: 'Gunakan keyword di minimal satu subjudul' },
    { label: `Panjang judul optimal (${titleLen}/50-60)`, pass: titleLen >= 30 && titleLen <= 65, hint: 'Judul 50-60 karakter agar tidak terpotong di hasil pencarian Google' },
    { label: `Meta description (${descLen}/150-160)`, pass: descLen >= 120 && descLen <= 165, hint: 'Deskripsi 150-160 karakter optimal untuk snippet Google' },
    { label: `Konten cukup panjang (${wc} kata)`, pass: wc >= 300, hint: 'Artikel minimal 300 kata. 1000+ kata lebih baik untuk ranking' },
    { label: 'Memiliki gambar', pass: hasImages, hint: 'Tambah minimal 1 gambar. Gambar meningkatkan engagement dan SEO' },
    { label: 'Ada internal link', pass: hasInternal, hint: 'Link ke halaman lain di website kamu (misal: /blog/artikel-lain)' },
    { label: 'Ada external link', pass: hasExternal, hint: 'Link ke sumber terpercaya meningkatkan kredibilitas artikel' },
    { label: 'Slug mengandung keyword', pass: !!kw && form.slug.includes(kw.replace(/\s+/g, '-')), hint: 'URL yang mengandung keyword membantu ranking pencarian' },
  ]

  const passed = checks.filter(c => c.pass).length
  const score = Math.round((passed / checks.length) * 100)
  const grade = score >= 75 ? 'good' : score >= 45 ? 'ok' : 'poor'
  return { score, checks, grade }
}

// 
// MAIN COMPONENT
// 

export default function WebsiteTab() {
  const [subTab, setSubTab] = useState<SubTab>('landing')

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 pt-5 pb-0 border-b border-gray-100 bg-white sticky top-0 z-20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">Website</h1>
            <p className="text-xs text-gray-400 mt-0.5">Kelola konten landing page & artikel</p>
          </div>
          <a href="/" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
            <Eye className="w-3.5 h-3.5" />Lihat Site
          </a>
        </div>
        <div className="flex gap-1">
          {([['landing', Globe, 'Landing Page'], ['articles', FileText, 'Artikel']] as const).map(([id, Icon, label]) => (
            <button key={id} onClick={() => setSubTab(id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${subTab === id ? 'border-forest-500 text-forest-700 bg-forest-50/50' : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              <Icon className="w-3.5 h-3.5 inline mr-1.5 -mt-0.5" />{label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {subTab === 'landing' ? <LandingSectionsPanel /> : <ArticlesPanel />}
      </div>
    </div>
  )
}

// 
// LANDING SECTIONS PANEL
// 

function LandingSectionsPanel() {
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
      <div className="p-6 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
            <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-lg bg-gray-100" /><div className="flex-1 space-y-1.5"><div className="h-4 w-24 bg-gray-100 rounded" /><div className="h-3 w-40 bg-gray-50 rounded" /></div></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Mode toggle */}
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
        <a href="/" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors">
          <Eye className="w-3.5 h-3.5" />Preview
        </a>
      </div>

      {/* Layout mode */}
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
                  const SECTION_ICONS: Record<string, React.ElementType> = {
                    hero: Sparkles, trustBar: BarChart3, templatePreview: Eye,
                    featureShowcase: Star, howItWorks: Megaphone,
                    testimonials: MessageSquareQuote, pricing: Tag,
                    blogShowcase: FileText, faq: HelpCircle, closingCta: CheckCircle,
                  }
                  const Icon = SECTION_ICONS[section.id] || Globe
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

      {/* Content mode */}
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
                      {section.id === 'trustBar' && <TrustBarEditor items={landing.trustBar.items} onChange={items => update('trustBar', { items })} />}
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
  )
}

// 
// ARTICLES PANEL
// 

function ArticlesPanel() {
  const [articlesList, setArticlesList] = useState<ArticleData[]>([])
  const [loading, setLoading] = useState(true)
  const [editingArticle, setEditingArticle] = useState<ArticleData | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [filterText, setFilterText] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')

  const fetchArticles = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/articles')
      if (!res.ok) throw new Error()
      setArticlesList((await res.json()).articles)
    } catch { toast.error('Gagal memuat artikel') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { fetchArticles() }, [fetchArticles])

  const handleNew = () => {
    setIsNew(true)
    setEditingArticle({
      id: '', title: '', slug: '', excerpt: '', content: '', coverUrl: '',
      authorId: null, authorName: 'Admin', authorAvatar: '',
      isPublished: false, publishedAt: null,
      allowLikes: true, allowComments: true, likesCount: 0, viewsCount: 0,
      metaTitle: '', metaDesc: '', tags: '',
      settings: { ...DEFAULT_SETTINGS, comments: { ...DEFAULT_SETTINGS.comments }, seo: { ...DEFAULT_SETTINGS.seo }, ads: { ...DEFAULT_SETTINGS.ads }, backlinks: { ...DEFAULT_SETTINGS.backlinks } },
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    })
  }

  if (editingArticle) {
    return <ArticleEditor article={editingArticle} isNew={isNew} onBack={() => { setEditingArticle(null); fetchArticles() }} />
  }

  if (loading) {
    return (
      <div className="p-6 lg:p-8 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-100 p-4 animate-pulse">
            <div className="flex gap-3"><div className="w-20 h-20 rounded-lg bg-gray-100 shrink-0" /><div className="flex-1 space-y-2"><div className="h-4 w-48 bg-gray-100 rounded" /><div className="h-3 w-full bg-gray-50 rounded" /><div className="h-3 w-24 bg-gray-50 rounded" /></div></div>
          </div>
        ))}
      </div>
    )
  }

  const published = articlesList.filter(a => a.isPublished).length
  const draft = articlesList.length - published
  const totalViews = articlesList.reduce((s, a) => s + a.viewsCount, 0)
  const totalLikes = articlesList.reduce((s, a) => s + a.likesCount, 0)

  const filtered = articlesList.filter(a => {
    if (filterStatus === 'published' && !a.isPublished) return false
    if (filterStatus === 'draft' && a.isPublished) return false
    if (filterText && !a.title.toLowerCase().includes(filterText.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-6 lg:p-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total', value: articlesList.length, icon: FileText, color: 'text-gray-600 bg-gray-50' },
          { label: 'Dipublikasi', value: published, icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Views', value: totalViews, icon: Eye, color: 'text-blue-600 bg-blue-50' },
          { label: 'Likes', value: totalLikes, icon: Heart, color: 'text-pink-600 bg-pink-50' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.color}`}><stat.icon className="w-4.5 h-4.5" /></div>
              <div><p className="text-lg font-bold text-gray-900">{stat.value}</p><p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">{stat.label}</p></div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input type="text" value={filterText} onChange={e => setFilterText(e.target.value)} placeholder="Cari artikel..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400 transition-colors" />
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            {(['all', 'published', 'draft'] as const).map(s => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors ${filterStatus === s ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                {s === 'all' ? `Semua (${articlesList.length})` : s === 'published' ? `Live (${published})` : `Draft (${draft})`}
              </button>
            ))}
          </div>
        </div>
        <button onClick={handleNew}
          className="flex items-center gap-1.5 text-xs font-semibold bg-forest-500 text-white hover:bg-forest-600 px-4 py-2.5 rounded-lg transition-colors shrink-0">
          <Plus className="w-3.5 h-3.5" />Artikel Baru
        </button>
      </div>

      {filtered.length > 0 ? (
        <div className="space-y-2">
          {filtered.map(article => (
            <button key={article.id} onClick={() => { setIsNew(false); setEditingArticle({ ...article }) }}
              className="w-full text-left bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm p-4 transition-all group">
              <div className="flex items-start gap-4">
                {article.coverUrl ? (
                  <img src={article.coverUrl} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0 bg-gray-100" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-50 flex items-center justify-center shrink-0"><FileText className="w-7 h-7 text-gray-300" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-forest-700 transition-colors">{article.title || 'Tanpa judul'}</h3>
                    {article.settings?.featured && <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />}
                    {article.settings?.pinned && <Pin className="w-3 h-3 text-indigo-400 shrink-0" />}
                    {article.isPublished ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-full shrink-0"><CheckCircle2 className="w-2.5 h-2.5" />Live</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded-full shrink-0"><Clock className="w-2.5 h-2.5" />Draft</span>
                    )}
                  </div>
                  {article.excerpt && <p className="text-xs text-gray-400 line-clamp-2 mb-2">{article.excerpt}</p>}
                  <div className="flex items-center gap-4 text-[11px] text-gray-400">
                    <span>/blog/{article.slug}</span>
                    <span>{formatDate(article.updatedAt)}</span>
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{article.viewsCount}</span>
                    <span className="flex items-center gap-1"><Heart className="w-3 h-3" />{article.likesCount}</span>
                    {article.tags && <span className="flex items-center gap-1"><Tag className="w-3 h-3" />{article.tags.split(',').filter(Boolean).length}</span>}
                  </div>
                </div>
                <PenLine className="w-4 h-4 text-gray-300 group-hover:text-forest-500 transition-colors shrink-0 mt-1" />
              </div>
            </button>
          ))}
        </div>
      ) : articlesList.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-100 py-16 text-center">
          <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-sm text-gray-500 font-medium">Belum ada artikel</p>
          <p className="text-xs text-gray-400 mt-1 mb-4">Tulis artikel pertama untuk meningkatkan SEO dan engagement</p>
          <button onClick={handleNew} className="inline-flex items-center gap-1.5 text-xs font-semibold bg-forest-500 text-white hover:bg-forest-600 px-4 py-2 rounded-lg transition-colors"><Plus className="w-3.5 h-3.5" />Tulis Artikel</button>
        </div>
      ) : (
        <div className="text-center py-12 text-sm text-gray-400">Tidak ada artikel yang sesuai filter</div>
      )}
    </div>
  )
}

// 
// ARTICLE EDITOR  full professional writing interface
// 

type EditorPanel = 'write' | 'preview' | 'settings'
type SettingsSection = 'engagement' | 'comments' | 'seo' | 'ads' | 'meta'

function ArticleEditor({ article, isNew, onBack }: { article: ArticleData; isNew: boolean; onBack: () => void }) {
  const [form, setForm] = useState(article)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [activePanel, setActivePanel] = useState<EditorPanel>('write')
  const [showTableModal, setShowTableModal] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showLinkModal, setShowLinkModal] = useState(false)
  const [settingsSection, setSettingsSection] = useState<SettingsSection>('engagement')
  const titleRef = useRef<HTMLInputElement>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { if (isNew) titleRef.current?.focus() }, [isNew])

  const set = (key: keyof ArticleData, value: unknown) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'title' && isNew) next.slug = slugify(value as string)
      return next
    })
  }

  const updateSettings = (path: string, value: unknown) => {
    setForm(prev => {
      const s = JSON.parse(JSON.stringify(prev.settings)) as ArticleSettings
      const keys = path.split('.')
      let obj: Record<string, unknown> = s as unknown as Record<string, unknown>
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]] as Record<string, unknown>
      obj[keys[keys.length - 1]] = value
      return { ...prev, settings: s }
    })
  }

  const insertAt = (prefix: string, suffix = '') => {
    const ta = contentRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = form.content.substring(start, end)
    const newText = form.content.substring(0, start) + prefix + selected + suffix + form.content.substring(end)
    set('content', newText)
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + prefix.length, start + prefix.length + selected.length) }, 0)
  }

  const handleSave = async (publish?: boolean) => {
    if (!form.title.trim()) { toast.error('Judul wajib diisi'); return }
    if (!form.slug.trim()) { toast.error('Slug wajib diisi'); return }
    setSaving(true)
    try {
      const data: Record<string, unknown> = {
        title: form.title, slug: form.slug, excerpt: form.excerpt, content: form.content,
        coverUrl: form.coverUrl, allowLikes: form.allowLikes, allowComments: form.allowComments,
        metaTitle: form.metaTitle, metaDesc: form.metaDesc, tags: form.tags, settings: form.settings,
      }
      if (publish !== undefined) {
        data.isPublished = publish
        data.publishedAt = publish ? new Date().toISOString() : null
      }
      const url = isNew ? '/api/admin/articles' : `/api/admin/articles/${form.id}`
      const res = await fetch(url, { method: isNew ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
      if (!res.ok) { const err = await res.json(); toast.error(err.error || 'Gagal menyimpan'); return }
      toast.success(publish ? 'Artikel dipublikasikan!' : 'Artikel tersimpan')
      onBack()
    } catch { toast.error('Gagal menyimpan') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try { await fetch(`/api/admin/articles/${form.id}`, { method: 'DELETE' }); toast.success('Artikel dihapus'); onBack() }
    catch { toast.error('Gagal menghapus') }
    finally { setDeleting(false); setShowDeleteConfirm(false) }
  }

  const handleTogglePublish = async () => {
    if (isNew) return
    setSaving(true)
    try {
      const newState = !form.isPublished
      const res = await fetch(`/api/admin/articles/${form.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: newState, publishedAt: newState ? new Date().toISOString() : null }),
      })
      if (!res.ok) throw new Error()
      toast.success(newState ? 'Artikel dipublikasikan!' : 'Artikel dijadikan draft')
      onBack()
    } catch { toast.error('Gagal mengubah status') }
    finally { setSaving(false) }
  }

  const wc = wordCount(form.content)
  const rt = readTime(form.content)
  const seo = useMemo(() => analyzeSeo(form), [form])

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 lg:px-6 py-2.5 bg-white border-b border-gray-100 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors p-1">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
            {([['write', PenLine, 'Tulis'], ['preview', Eye, 'Preview'], ['settings', Settings2, 'Pengaturan']] as const).map(([id, Icon, label]) => (
              <button key={id} onClick={() => setActivePanel(id)}
                className={`px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors flex items-center gap-1 ${activePanel === id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                <Icon className="w-3 h-3" />{label}
              </button>
            ))}
          </div>
          {/* SEO score badge */}
          <div className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full ${seo.grade === 'good' ? 'bg-emerald-50 text-emerald-600' : seo.grade === 'ok' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'}`}>
            {seo.grade === 'good' ? <CheckCircle className="w-3 h-3" /> : seo.grade === 'ok' ? <AlertCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
            SEO {seo.score}%
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-gray-400 hidden lg:inline">{wc} kata &middot; {rt} mnt baca</span>
          {!isNew && (
            <>
              <button onClick={handleTogglePublish} disabled={saving}
                className={`flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 ${form.isPublished ? 'text-gray-600 border-gray-200 hover:bg-gray-50' : 'text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}>
                {form.isPublished ? <><EyeOff className="w-3.5 h-3.5" />Draft</> : <><Eye className="w-3.5 h-3.5" />Publish</>}
              </button>
              {form.isPublished && (
                <a href={`/blog/${form.slug}`} target="_blank" rel="noopener noreferrer"
                  className="p-1.5 text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-lg transition-colors"><ExternalLink className="w-3.5 h-3.5" /></a>
              )}
              <button onClick={() => setShowDeleteConfirm(true)} className="p-1.5 text-red-500 border border-red-200 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
            </>
          )}
          <button onClick={() => handleSave(isNew ? false : undefined)} disabled={saving}
            className="flex items-center gap-1.5 text-xs font-semibold bg-forest-500 text-white hover:bg-forest-600 px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}Simpan
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        {activePanel === 'write' && <WritePanel form={form} set={set} insertAt={insertAt} titleRef={titleRef} contentRef={contentRef} isNew={isNew} onShowTable={() => setShowTableModal(true)} onShowImage={() => setShowImageModal(true)} onShowLink={() => setShowLinkModal(true)} />}
        {activePanel === 'preview' && <PreviewPanel form={form} />}
        {activePanel === 'settings' && <SettingsPanel form={form} set={set} updateSettings={updateSettings} seo={seo} isNew={isNew} settingsSection={settingsSection} setSettingsSection={setSettingsSection} onDelete={() => setShowDeleteConfirm(true)} />}
      </div>

      {/* Table builder modal */}
      {showTableModal && <TableBuilderModal onInsert={md => { insertAt(md); setShowTableModal(false) }} onClose={() => setShowTableModal(false)} />}
      {showImageModal && <ImageInsertModal onInsert={md => { insertAt(md); setShowImageModal(false) }} onClose={() => setShowImageModal(false)} />}
      {showLinkModal && <LinkInsertModal onInsert={md => { insertAt(md); setShowLinkModal(false) }} onClose={() => setShowLinkModal(false)} />}

      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center"><Trash2 className="w-5 h-5 text-red-500" /></div>
              <div><h3 className="text-sm font-bold text-gray-900">Hapus Artikel?</h3><p className="text-xs text-gray-500">Tindakan ini tidak dapat dibatalkan.</p></div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50">
                {deleting && <Loader2 className="w-3.5 h-3.5 animate-spin inline mr-1" />}Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

//  Write Panel 

function WritePanel({ form, set, insertAt, titleRef, contentRef, isNew, onShowTable, onShowImage, onShowLink }: {
  form: ArticleData; set: (k: keyof ArticleData, v: unknown) => void; insertAt: (p: string, s?: string) => void
  titleRef: React.RefObject<HTMLInputElement>; contentRef: React.RefObject<HTMLTextAreaElement>; isNew: boolean
  onShowTable: () => void; onShowImage: () => void; onShowLink: () => void
}) {
  return (
    <div className="max-w-4xl mx-auto px-6 lg:px-8 py-6">
      <input ref={titleRef} type="text" value={form.title} onChange={e => set('title', e.target.value)}
        placeholder="Judul artikel..." className="w-full text-2xl lg:text-3xl font-bold text-gray-900 placeholder:text-gray-300 border-0 outline-none bg-transparent mb-3" />

      <div className="flex items-center gap-2 mb-6">
        <span className="text-xs text-gray-400 shrink-0">/blog/</span>
        <input type="text" value={form.slug} onChange={e => set('slug', slugify(e.target.value as string))}
          placeholder="url-slug" className="flex-1 text-sm font-mono text-gray-600 placeholder:text-gray-300 border border-gray-200 rounded-lg px-3 py-1.5 outline-none focus:border-forest-400" />
      </div>

      {/* Cover */}
      <div className="mb-6">
        <FieldLabel>Cover Image URL</FieldLabel>
        <input type="text" value={form.coverUrl} onChange={e => set('coverUrl', e.target.value)} placeholder="https://images.unsplash.com/..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400 transition-colors" />
        {form.coverUrl ? (
          <div className="mt-2 relative group">
            <img src={form.coverUrl} alt="" className="w-full h-48 object-cover rounded-lg bg-gray-100" />
            <button onClick={() => set('coverUrl', '')} className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
          </div>
        ) : (
          <div className="mt-2 w-full h-28 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-400">
            <ImageIcon className="w-6 h-6 mb-1" /><span className="text-xs">Tempel URL gambar di atas</span>
          </div>
        )}
      </div>

      {/* Excerpt */}
      <div className="mb-6">
        <FieldLabel>Ringkasan</FieldLabel>
        <textarea value={form.excerpt} onChange={e => set('excerpt', e.target.value)} rows={2} placeholder="Ringkasan singkat untuk preview & SEO (150-160 karakter optimal)..."
          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400 transition-colors resize-none" />
        <p className={`text-[10px] mt-1 ${form.excerpt.length > 160 ? 'text-red-400' : form.excerpt.length >= 120 ? 'text-emerald-500' : 'text-gray-400'}`}>{form.excerpt.length}/160 karakter</p>
      </div>

      {/* Content with rich toolbar */}
      <div className="mb-6">
        <FieldLabel>Konten</FieldLabel>
        <div className="flex items-center gap-0.5 border border-gray-200 border-b-0 rounded-t-lg bg-gray-50 px-2 py-1.5 flex-wrap">
          <TBtn icon={Heading} title="Heading (H2)" onClick={() => insertAt('## ')} />
          <TBtn icon={Type} title="Heading 3" onClick={() => insertAt('### ')} />
          <Sep />
          <TBtn icon={Bold} title="Bold" onClick={() => insertAt('**', '**')} />
          <TBtn icon={Italic} title="Italic" onClick={() => insertAt('*', '*')} />
          <TBtn icon={Code} title="Inline Code" onClick={() => insertAt('`', '`')} />
          <Sep />
          <TBtn icon={List} title="Bullet List" onClick={() => insertAt('- ')} />
          <TBtn icon={ListOrdered} title="Numbered List" onClick={() => insertAt('1. ')} />
          <TBtn icon={Quote} title="Blockquote" onClick={() => insertAt('> ')} />
          <Sep />
          <TBtn icon={ImageIcon} title="Sisipkan Gambar" onClick={onShowImage} accent />
          <TBtn icon={Table} title="Buat Tabel" onClick={onShowTable} accent />
          <TBtn icon={Link2} title="Sisipkan Link" onClick={onShowLink} accent />
          <Sep />
          <TBtn icon={Minus} title="Separator" onClick={() => insertAt('\n---\n')} />
        </div>
        <textarea ref={contentRef} value={form.content} onChange={e => set('content', e.target.value)} rows={24}
          placeholder={"Tulis konten artikel di sini...\n\nMendukung Markdown:\n## Subjudul\n**Bold** dan *Italic*\n`kode`\n- Bullet list\n1. Numbered list\n![alt](url gambar)\n[Link text](url)\n> Kutipan\n\nTabel:\n| Kolom 1 | Kolom 2 |\n|---------|--------|\n| Data    | Data   |"}
          className="w-full px-4 py-3 text-sm font-mono leading-relaxed border border-gray-200 rounded-b-lg outline-none focus:border-forest-400 transition-colors resize-y"
          style={{ minHeight: 450 }} />
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[10px] text-gray-400">Mendukung: Heading, Bold, Italic, Code, List, Image, Tabel, Link, Blockquote, HR</p>
          <p className="text-[10px] text-gray-400">{wordCount(form.content)} kata &middot; {readTime(form.content)} mnt baca</p>
        </div>
      </div>
    </div>
  )
}

//  Preview Panel 

function PreviewPanel({ form }: { form: ArticleData }) {
  const html = useMemo(() => parseMarkdownPreview(form.content), [form.content])
  const rt = readTime(form.content)

  return (
    <div className="max-w-3xl mx-auto px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Cover */}
        {form.coverUrl && (
          <div className="aspect-[2/1] overflow-hidden bg-gray-100">
            <img src={form.coverUrl} alt={form.title} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="px-8 py-8 sm:px-10 sm:py-10">
          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
            {form.publishedAt && <span>{formatDate(form.publishedAt)}</span>}
            <span>{rt} menit baca</span>
            {form.tags && form.tags.split(',').filter(Boolean).map((tag, i) => (
              <span key={i} className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full text-[10px]">{tag.trim()}</span>
            ))}
          </div>
          {/* Title */}
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', fontWeight: 700, color: '#1c1917', lineHeight: 1.25, marginBottom: '0.75rem' }}>
            {form.title || 'Judul Artikel'}
          </h1>
          {form.excerpt && <p style={{ fontSize: '1.1rem', color: '#a8a29e', lineHeight: 1.6, marginBottom: '2rem' }}>{form.excerpt}</p>}

          {/* Content */}
          <div className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />

          {/* Engagement preview */}
          <div className="mt-10 pt-6 border-t border-gray-100 flex items-center gap-4">
            {form.allowLikes && (
              <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-pink-500 transition-colors">
                <Heart className="w-4 h-4" /> {form.likesCount} Suka
              </button>
            )}
            {form.allowComments && (
              <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-forest-600 transition-colors">
                <MessageCircle className="w-4 h-4" /> Komentar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Google preview */}
      <div className="mt-6 bg-white rounded-xl border border-gray-100 p-5">
        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-3">Preview Hasil Pencarian Google</p>
        <div className="space-y-0.5">
          <p className="text-lg text-blue-700 font-medium truncate">{form.metaTitle || form.title || 'Judul Artikel'}</p>
          <p className="text-sm text-emerald-700">iaundang.vercel.app/blog/{form.slug || 'slug'}</p>
          <p className="text-sm text-gray-500 line-clamp-2">{form.metaDesc || form.excerpt || 'Deskripsi artikel akan muncul di sini...'}</p>
        </div>
      </div>
    </div>
  )
}

//  Settings Panel 

function SettingsPanel({ form, set, updateSettings, seo, isNew, settingsSection, setSettingsSection, onDelete }: {
  form: ArticleData; set: (k: keyof ArticleData, v: unknown) => void; updateSettings: (path: string, v: unknown) => void
  seo: ReturnType<typeof analyzeSeo>; isNew: boolean; settingsSection: SettingsSection; setSettingsSection: (s: SettingsSection) => void
  onDelete: () => void
}) {
  const NAV: { id: SettingsSection; icon: React.ElementType; label: string }[] = [
    { id: 'engagement', icon: Heart, label: 'Engagement' },
    { id: 'comments', icon: MessageSquare, label: 'Komentar' },
    { id: 'seo', icon: Search, label: 'SEO & Meta' },
    { id: 'ads', icon: AdIcon, label: 'Iklan & Backlink' },
    { id: 'meta', icon: Settings2, label: 'Lainnya' },
  ]

  return (
    <div className="flex h-full">
      {/* Settings nav */}
      <div className="w-48 shrink-0 border-r border-gray-100 bg-gray-50/50 py-4 px-2">
        {NAV.map(n => (
          <button key={n.id} onClick={() => setSettingsSection(n.id)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs font-medium transition-colors mb-0.5 ${settingsSection === n.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700 hover:bg-white/60'}`}>
            <n.icon className="w-3.5 h-3.5" />{n.label}
            {n.id === 'seo' && (
              <span className={`ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full ${seo.grade === 'good' ? 'bg-emerald-100 text-emerald-600' : seo.grade === 'ok' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>{seo.score}%</span>
            )}
          </button>
        ))}
      </div>

      {/* Settings content */}
      <div className="flex-1 overflow-y-auto p-6 lg:p-8">
        <div className="max-w-2xl">
          {settingsSection === 'engagement' && (
            <div className="space-y-5">
              <SectionHeader icon={Heart} title="Engagement" desc="Kontrol interaksi pengunjung" />
              <Card>
                <ToggleRow label="Like / Suka" desc="Pengunjung dapat memberikan like pada artikel" icon={<Heart className="w-4 h-4" />} checked={form.allowLikes} onChange={v => set('allowLikes', v)} />
                <ToggleRow label="Komentar" desc="Pengunjung dapat memberikan komentar pada artikel" icon={<MessageCircle className="w-4 h-4" />} checked={form.allowComments} onChange={v => set('allowComments', v)} />
                <ToggleRow label="Artikel Unggulan" desc="Tampilkan dengan badge bintang di daftar artikel" icon={<Star className="w-4 h-4" />} checked={form.settings.featured} onChange={v => updateSettings('featured', v)} />
                <ToggleRow label="Sematkan (Pin)" desc="Artikel akan selalu muncul di posisi teratas" icon={<Pin className="w-4 h-4" />} checked={form.settings.pinned} onChange={v => updateSettings('pinned', v)} />
              </Card>
              {!isNew && (
                <Card>
                  <p className="text-xs font-semibold text-gray-600 mb-3">Statistik</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-gray-900">{form.viewsCount}</p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase">Views</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-gray-900">{form.likesCount}</p>
                      <p className="text-[10px] text-gray-400 font-medium uppercase">Likes</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {settingsSection === 'comments' && (
            <div className="space-y-5">
              <SectionHeader icon={MessageSquare} title="Pengaturan Komentar" desc="Moderasi dan filter komentar pengunjung" />
              <Card>
                <p className="text-xs font-semibold text-gray-600 mb-3">Mode Moderasi</p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {([['auto', 'Otomatis', 'Komentar langsung tampil tanpa persetujuan'], ['manual', 'Manual', 'Semua komentar harus disetujui admin']] as const).map(([val, label, desc]) => (
                    <button key={val} onClick={() => updateSettings('comments.moderation', val)}
                      className={`text-left p-3 rounded-lg border-2 transition-all ${form.settings.comments.moderation === val ? 'border-forest-400 bg-forest-50' : 'border-gray-100 hover:border-gray-200'}`}>
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">{desc}</p>
                    </button>
                  ))}
                </div>

                <ToggleRow label="Wajib Login" desc="Pengunjung harus login untuk berkomentar" icon={<Lock className="w-4 h-4" />} checked={form.settings.comments.requireLogin} onChange={v => updateSettings('comments.requireLogin', v)} />
                <ToggleRow label="Izinkan Balasan" desc="Pengunjung bisa membalas komentar lain" icon={<MessageCircle className="w-4 h-4" />} checked={form.settings.comments.allowReplies} onChange={v => updateSettings('comments.allowReplies', v)} />
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Ban className="w-4 h-4 text-red-500" />
                  <p className="text-xs font-semibold text-gray-600">Kata-kata Terlarang</p>
                </div>
                <p className="text-[11px] text-gray-400 mb-2">Komentar yang mengandung kata-kata ini akan otomatis ditolak atau ditahan untuk review. Pisahkan dengan koma.</p>
                <textarea value={form.settings.comments.bannedWords} onChange={e => updateSettings('comments.bannedWords', e.target.value)} rows={3}
                  placeholder="spam, promosi, judi, togel, pinjol, bodong, tipu, scam"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400 transition-colors resize-none font-mono" />
                {form.settings.comments.bannedWords && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.settings.comments.bannedWords.split(',').map((w, i) => w.trim() && (
                      <span key={i} className="text-[10px] font-medium bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full">{w.trim()}</span>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <p className="text-xs font-semibold text-gray-600 mb-3">Batasan</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FieldLabel>Maks. panjang komentar</FieldLabel>
                    <div className="flex items-center gap-2">
                      <input type="number" value={form.settings.comments.maxLength} onChange={e => updateSettings('comments.maxLength', parseInt(e.target.value) || 500)} min={50} max={5000}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400" />
                      <span className="text-xs text-gray-400 shrink-0">karakter</span>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Tutup komentar setelah</FieldLabel>
                    <div className="flex items-center gap-2">
                      <input type="number" value={form.settings.comments.closeAfterDays} onChange={e => updateSettings('comments.closeAfterDays', parseInt(e.target.value) || 0)} min={0} max={365}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400" />
                      <span className="text-xs text-gray-400 shrink-0">hari (0 = tidak pernah)</span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {settingsSection === 'seo' && (
            <div className="space-y-5">
              <SectionHeader icon={Search} title="SEO & Meta" desc="Optimasi agar artikel muncul di halaman 1 Google" />

              {/* SEO Score & Checklist */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${seo.grade === 'good' ? 'bg-emerald-100 text-emerald-600' : seo.grade === 'ok' ? 'bg-amber-100 text-amber-600' : 'bg-red-100 text-red-600'}`}>
                      {seo.score}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">
                        {seo.grade === 'good' ? 'SEO Bagus!' : seo.grade === 'ok' ? 'Perlu Perbaikan' : 'SEO Lemah'}
                      </p>
                      <p className="text-[11px] text-gray-400">{seo.checks.filter(c => c.pass).length}/{seo.checks.length} kriteria terpenuhi</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-1.5">
                  {seo.checks.map((check, i) => (
                    <div key={i} className="flex items-start gap-2 py-1.5">
                      {check.pass ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />}
                      <div>
                        <p className={`text-xs font-medium ${check.pass ? 'text-gray-700' : 'text-gray-900'}`}>{check.label}</p>
                        {!check.pass && <p className="text-[10px] text-gray-400 mt-0.5">{check.hint}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Focus keyword */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Hash className="w-4 h-4 text-indigo-500" />
                  <p className="text-xs font-semibold text-gray-600">Focus Keyword</p>
                </div>
                <p className="text-[11px] text-gray-400 mb-2">Kata kunci utama yang ingin kamu targetkan di Google. Pilih 1 keyword per artikel.</p>
                <input type="text" value={form.settings.seo.focusKeyword} onChange={e => updateSettings('seo.focusKeyword', e.target.value)}
                  placeholder="contoh: undangan digital murah"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400 transition-colors" />
                {form.settings.seo.focusKeyword && (
                  <div className="mt-2 p-2.5 bg-blue-50 rounded-lg">
                    <p className="text-[10px] text-blue-700 font-medium">Tips penggunaan keyword:</p>
                    <ul className="text-[10px] text-blue-600 mt-1 space-y-0.5 list-disc pl-4">
                      <li>Gunakan di judul artikel (di awal lebih baik)</li>
                      <li>Sebutkan di paragraf pertama secara natural</li>
                      <li>Masukkan di minimal 1 subjudul (H2/H3)</li>
                      <li>Gunakan variasi keyword (sinonim, long-tail)</li>
                      <li>Jangan berlebihan (keyword stuffing = penalti Google)</li>
                    </ul>
                  </div>
                )}
              </Card>

              {/* Meta fields */}
              <Card>
                <p className="text-xs font-semibold text-gray-600 mb-3">Meta Tags</p>
                <div className="space-y-4">
                  <div>
                    <FieldLabel>Meta Title</FieldLabel>
                    <input type="text" value={form.metaTitle} onChange={e => set('metaTitle', e.target.value)}
                      placeholder={form.title || 'Judul untuk mesin pencari...'} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400 transition-colors" />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-gray-400">Optimal: 50-60 karakter. Lebih dari 60 akan terpotong di Google.</p>
                      <p className={`text-[10px] font-medium ${(form.metaTitle || form.title).length > 65 ? 'text-red-400' : (form.metaTitle || form.title).length >= 30 ? 'text-emerald-500' : 'text-gray-400'}`}>{(form.metaTitle || form.title).length}/60</p>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Meta Description</FieldLabel>
                    <textarea value={form.metaDesc} onChange={e => set('metaDesc', e.target.value)} rows={3}
                      placeholder={form.excerpt || 'Deskripsi 150-160 karakter yang menarik pengunjung klik...'} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400 transition-colors resize-none" />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-[10px] text-gray-400">Buat deskripsi yang menarik + mengandung keyword. Ini yang muncul di Google.</p>
                      <p className={`text-[10px] font-medium ${(form.metaDesc || form.excerpt).length > 165 ? 'text-red-400' : (form.metaDesc || form.excerpt).length >= 120 ? 'text-emerald-500' : 'text-gray-400'}`}>{(form.metaDesc || form.excerpt).length}/160</p>
                    </div>
                  </div>
                  <div>
                    <FieldLabel>Canonical URL (opsional)</FieldLabel>
                    <input type="text" value={form.settings.seo.canonicalUrl} onChange={e => updateSettings('seo.canonicalUrl', e.target.value)}
                      placeholder="https://iaundang.vercel.app/blog/..."
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400 transition-colors" />
                    <p className="text-[10px] text-gray-400 mt-1">Isi jika konten ini duplikat dari URL lain. Biarkan kosong jika ini konten original.</p>
                  </div>
                  <div>
                    <FieldLabel>OG Image URL (opsional)</FieldLabel>
                    <input type="text" value={form.settings.seo.ogImageUrl} onChange={e => updateSettings('seo.ogImageUrl', e.target.value)}
                      placeholder={form.coverUrl || 'URL gambar untuk social share'}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400 transition-colors" />
                    <p className="text-[10px] text-gray-400 mt-1">Gambar yang muncul saat artikel di-share di sosial media. Default: cover image.</p>
                  </div>
                  <ToggleRow label="No Index" desc="Sembunyikan artikel ini dari mesin pencari" icon={<EyeOff className="w-4 h-4" />} checked={form.settings.seo.noIndex} onChange={v => updateSettings('seo.noIndex', v)} />
                </div>
              </Card>

              {/* Tags */}
              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <Tag className="w-4 h-4 text-indigo-500" />
                  <p className="text-xs font-semibold text-gray-600">Tags</p>
                </div>
                <input type="text" value={form.tags} onChange={e => set('tags', e.target.value)}
                  placeholder="pernikahan, tips, undangan digital (pisahkan dengan koma)"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400 transition-colors" />
                {form.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {form.tags.split(',').map((tag, i) => tag.trim() && (
                      <span key={i} className="text-[10px] font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">{tag.trim()}</span>
                    ))}
                  </div>
                )}
              </Card>

              {/* Google preview */}
              <Card>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mb-3">Preview Hasil Google</p>
                <div className="space-y-0.5 p-3 bg-white rounded-lg border border-gray-100">
                  <p className="text-lg text-blue-700 font-medium truncate">{form.metaTitle || form.title || 'Judul Artikel'}</p>
                  <p className="text-sm text-emerald-700">iaundang.vercel.app/blog/{form.slug || 'slug'}</p>
                  <p className="text-sm text-gray-500 line-clamp-2">{form.metaDesc || form.excerpt || 'Deskripsi artikel akan muncul di sini...'}</p>
                </div>
              </Card>
            </div>
          )}

          {settingsSection === 'ads' && (
            <div className="space-y-5">
              <SectionHeader icon={AdIcon} title="Iklan & Backlink" desc="Monetisasi dan manajemen link" />

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <AdIcon className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-semibold text-gray-600">Iklan In-Article</p>
                </div>
                <ToggleRow label="Tampilkan Iklan" desc="Sisipkan iklan di antara paragraf konten" icon={<AdIcon className="w-4 h-4" />} checked={form.settings.ads.enabled} onChange={v => updateSettings('ads.enabled', v)} />

                {form.settings.ads.enabled && (
                  <div className="mt-3 space-y-3">
                    <div>
                      <FieldLabel>Posisi Iklan</FieldLabel>
                      <p className="text-[10px] text-gray-400 mb-2">Pilih di mana iklan akan ditampilkan</p>
                      <div className="space-y-1.5">
                        {[
                          { id: 'after-p2', label: 'Setelah paragraf ke-2' },
                          { id: 'after-p4', label: 'Setelah paragraf ke-4' },
                          { id: 'middle', label: 'Tengah artikel' },
                          { id: 'end', label: 'Akhir artikel' },
                        ].map(pos => (
                          <label key={pos.id} className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={form.settings.ads.positions.includes(pos.id)}
                              onChange={e => {
                                const positions = e.target.checked
                                  ? [...form.settings.ads.positions, pos.id]
                                  : form.settings.ads.positions.filter(p => p !== pos.id)
                                updateSettings('ads.positions', positions)
                              }}
                              className="w-4 h-4 rounded border-gray-300 text-forest-500 focus:ring-forest-400" />
                            {pos.label}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <FieldLabel>Kode Iklan (HTML/Script)</FieldLabel>
                      <textarea value={form.settings.ads.adCode} onChange={e => updateSettings('ads.adCode', e.target.value)} rows={4}
                        placeholder={"<!-- Google AdSense atau kode iklan lainnya -->\n<ins class=\"adsbygoogle\" ...></ins>"}
                        className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg outline-none focus:border-forest-400 transition-colors resize-none" />
                    </div>
                  </div>
                )}
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <LinkIcon className="w-4 h-4 text-blue-500" />
                  <p className="text-xs font-semibold text-gray-600">Internal Links (Backlink)</p>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">Link ke halaman lain di website kamu. Internal link membantu SEO dan navigasi pengunjung.</p>
                <div className="space-y-2">
                  {form.settings.backlinks.internal.map((link, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="text" value={link} onChange={e => {
                        const links = [...form.settings.backlinks.internal]; links[i] = e.target.value; updateSettings('backlinks.internal', links)
                      }} placeholder="/blog/artikel-terkait" className="flex-1 px-3 py-1.5 text-sm font-mono border border-gray-200 rounded-lg outline-none focus:border-forest-400" />
                      <button onClick={() => updateSettings('backlinks.internal', form.settings.backlinks.internal.filter((_, j) => j !== i))} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => updateSettings('backlinks.internal', [...form.settings.backlinks.internal, ''])}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-forest-600 hover:text-forest-700 border border-dashed border-gray-200 hover:border-forest-300 rounded-lg py-2 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Tambah Internal Link
                  </button>
                </div>
              </Card>

              <Card>
                <div className="flex items-center gap-2 mb-3">
                  <ExternalLink className="w-4 h-4 text-violet-500" />
                  <p className="text-xs font-semibold text-gray-600">External Links</p>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">Link ke sumber terpercaya (Wikipedia, studi, situs otoritas). Membangun kredibilitas artikel.</p>
                <div className="space-y-2">
                  {form.settings.backlinks.external.map((link, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input type="text" value={link} onChange={e => {
                        const links = [...form.settings.backlinks.external]; links[i] = e.target.value; updateSettings('backlinks.external', links)
                      }} placeholder="https://sumber-terpercaya.com/artikel" className="flex-1 px-3 py-1.5 text-sm font-mono border border-gray-200 rounded-lg outline-none focus:border-forest-400" />
                      <button onClick={() => updateSettings('backlinks.external', form.settings.backlinks.external.filter((_, j) => j !== i))} className="p-1.5 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                  <button onClick={() => updateSettings('backlinks.external', [...form.settings.backlinks.external, ''])}
                    className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 border border-dashed border-gray-200 hover:border-violet-300 rounded-lg py-2 transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Tambah External Link
                  </button>
                </div>
              </Card>
            </div>
          )}

          {settingsSection === 'meta' && (
            <div className="space-y-5">
              <SectionHeader icon={Settings2} title="Pengaturan Lainnya" desc="Informasi tambahan dan aksi berbahaya" />

              <Card>
                <p className="text-xs font-semibold text-gray-600 mb-3">Informasi Artikel</p>
                <div className="grid grid-cols-2 gap-3 text-xs text-gray-500">
                  <div><span className="text-gray-400">Dibuat:</span> {formatDate(form.createdAt)}</div>
                  <div><span className="text-gray-400">Diperbarui:</span> {formatDate(form.updatedAt)}</div>
                  <div><span className="text-gray-400">ID:</span> <span className="font-mono text-[10px]">{form.id || '(baru)'}</span></div>
                  <div><span className="text-gray-400">Status:</span> {form.isPublished ? 'Dipublikasi' : 'Draft'}</div>
                </div>
              </Card>

              {!isNew && (
                <div className="bg-white rounded-xl border border-red-100 p-5">
                  <h3 className="text-sm font-semibold text-red-600 mb-2">Zona Bahaya</h3>
                  <p className="text-xs text-gray-500 mb-3">Tindakan di bawah ini tidak dapat dibatalkan.</p>
                  <button onClick={onDelete}
                    className="flex items-center gap-1.5 text-xs font-medium text-red-500 border border-red-200 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />Hapus Artikel
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 
// TABLE BUILDER MODAL
// 

function TableBuilderModal({ onInsert, onClose }: { onInsert: (md: string) => void; onClose: () => void }) {
  const [cols, setCols] = useState(3)
  const [rows, setRows] = useState(3)
  const [headers, setHeaders] = useState<string[]>(['Kolom 1', 'Kolom 2', 'Kolom 3'])
  const [cells, setCells] = useState<string[][]>([['', '', ''], ['', '', '']])

  const updateSize = (newCols: number, newRows: number) => {
    setCols(newCols); setRows(newRows)
    setHeaders(Array.from({ length: newCols }, (_, i) => headers[i] || `Kolom ${i + 1}`))
    setCells(Array.from({ length: newRows - 1 }, (_, r) => Array.from({ length: newCols }, (_, c) => cells[r]?.[c] || '')))
  }

  const generate = () => {
    const hdr = '| ' + headers.slice(0, cols).join(' | ') + ' |'
    const sep = '| ' + headers.slice(0, cols).map(() => '---').join(' | ') + ' |'
    const body = cells.map(row => '| ' + row.slice(0, cols).join(' | ') + ' |').join('\n')
    onInsert('\n' + hdr + '\n' + sep + '\n' + body + '\n')
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2"><Table className="w-4 h-4 text-indigo-600" /><h3 className="font-bold text-gray-900 text-sm">Buat Tabel</h3></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <div className="flex items-center gap-4">
            <div><FieldLabel>Kolom</FieldLabel><input type="number" value={cols} onChange={e => updateSize(Math.min(6, Math.max(2, parseInt(e.target.value) || 2)), rows)} min={2} max={6} className="w-20 px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none" /></div>
            <div><FieldLabel>Baris (termasuk header)</FieldLabel><input type="number" value={rows} onChange={e => updateSize(cols, Math.min(10, Math.max(2, parseInt(e.target.value) || 2)))} min={2} max={10} className="w-20 px-3 py-1.5 text-sm border border-gray-200 rounded-lg outline-none" /></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr>
                  {headers.slice(0, cols).map((h, i) => (
                    <th key={i} className="border border-gray-200 p-0">
                      <input type="text" value={h} onChange={e => { const nh = [...headers]; nh[i] = e.target.value; setHeaders(nh) }}
                        className="w-full px-2 py-1.5 text-xs font-semibold outline-none bg-gray-50 text-center" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cells.map((row, r) => (
                  <tr key={r}>
                    {row.slice(0, cols).map((cell, c) => (
                      <td key={c} className="border border-gray-200 p-0">
                        <input type="text" value={cell} onChange={e => { const nc = cells.map(r => [...r]); nc[r][c] = e.target.value; setCells(nc) }}
                          className="w-full px-2 py-1.5 text-xs outline-none text-center" placeholder="..." />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
          <button onClick={generate} className="px-4 py-2 text-xs font-semibold bg-forest-500 text-white hover:bg-forest-600 rounded-lg transition-colors">Sisipkan Tabel</button>
        </div>
      </div>
    </div>
  )
}

// 
// IMAGE INSERT MODAL
// 

function ImageInsertModal({ onInsert, onClose }: { onInsert: (md: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState('')
  const [alt, setAlt] = useState('')

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2"><ImageIcon className="w-4 h-4 text-indigo-600" /><h3 className="font-bold text-gray-900 text-sm">Sisipkan Gambar</h3></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div>
            <FieldLabel>URL Gambar</FieldLabel>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400" autoFocus />
          </div>
          <div>
            <FieldLabel>Alt Text (deskripsi gambar)</FieldLabel>
            <input type="text" value={alt} onChange={e => setAlt(e.target.value)} placeholder="Deskripsi singkat gambar untuk SEO & aksesibilitas"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400" />
            <p className="text-[10px] text-gray-400 mt-1">Alt text penting untuk SEO dan pembaca screen reader</p>
          </div>
          {url && (
            <div className="rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
              <img src={url} alt={alt} className="w-full h-32 object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
          <button onClick={() => { if (url) onInsert(`\n![${alt}](${url})\n`) }} disabled={!url}
            className="px-4 py-2 text-xs font-semibold bg-forest-500 text-white hover:bg-forest-600 rounded-lg transition-colors disabled:opacity-50">Sisipkan</button>
        </div>
      </div>
    </div>
  )
}

// 
// LINK INSERT MODAL
// 

function LinkInsertModal({ onInsert, onClose }: { onInsert: (md: string) => void; onClose: () => void }) {
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2"><Link2 className="w-4 h-4 text-indigo-600" /><h3 className="font-bold text-gray-900 text-sm">Sisipkan Link</h3></div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-3">
          <div className="flex items-center bg-gray-100 rounded-lg p-0.5 mb-1">
            <button onClick={() => setIsInternal(false)} className={`flex-1 px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors ${!isInternal ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>External Link</button>
            <button onClick={() => setIsInternal(true)} className={`flex-1 px-3 py-1.5 text-[11px] font-medium rounded-md transition-colors ${isInternal ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>Internal Link</button>
          </div>
          <div>
            <FieldLabel>URL</FieldLabel>
            <input type="text" value={url} onChange={e => setUrl(e.target.value)}
              placeholder={isInternal ? '/blog/artikel-lain' : 'https://...'} autoFocus
              className="w-full px-3 py-2 text-sm font-mono border border-gray-200 rounded-lg outline-none focus:border-forest-400" />
          </div>
          <div>
            <FieldLabel>Teks yang ditampilkan</FieldLabel>
            <input type="text" value={text} onChange={e => setText(e.target.value)} placeholder="Klik di sini"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:border-forest-400" />
          </div>
          {isInternal && (
            <div className="p-2.5 bg-blue-50 rounded-lg">
              <p className="text-[10px] text-blue-700"><strong>Tips:</strong> Internal link membantu SEO! Link ke artikel terkait, halaman pricing, atau landing page.</p>
            </div>
          )}
        </div>
        <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Batal</button>
          <button onClick={() => { if (url && text) onInsert(`[${text}](${url})`) }} disabled={!url || !text}
            className="px-4 py-2 text-xs font-semibold bg-forest-500 text-white hover:bg-forest-600 rounded-lg transition-colors disabled:opacity-50">Sisipkan</button>
        </div>
      </div>
    </div>
  )
}

// 
// SHARED COMPONENTS
// 

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

function TBtn({ icon: Icon, title, onClick, accent }: { icon: React.ElementType; title: string; onClick: () => void; accent?: boolean }) {
  return <button type="button" onClick={onClick} title={title}
    className={`p-1.5 rounded hover:bg-gray-200 transition-colors ${accent ? 'text-indigo-500 hover:text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}>
    <Icon className="w-3.5 h-3.5" />
  </button>
}

function Sep() { return <div className="w-px h-4 bg-gray-200 mx-1" /> }

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-gray-100 p-5">{children}</div>
}

function SectionHeader({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <Icon className="w-5 h-5 text-gray-400" />
      <div><h2 className="text-sm font-bold text-gray-900">{title}</h2><p className="text-[11px] text-gray-400">{desc}</p></div>
    </div>
  )
}

function ToggleRow({ label, desc, icon, checked, onChange }: {
  label: string; desc: string; icon: React.ReactNode; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center gap-3">
        <div className="text-gray-400">{icon}</div>
        <div><p className="text-sm font-medium text-gray-800">{label}</p><p className="text-[11px] text-gray-400">{desc}</p></div>
      </div>
      <button type="button" onClick={() => onChange(!checked)}
        className={`relative w-10 h-6 rounded-full transition-colors shrink-0 ${checked ? 'bg-forest-500' : 'bg-gray-200'}`}>
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${checked ? 'translate-x-[18px]' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

// 
// SECTION EDITORS (Landing Page)
// 

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
      <div className="grid grid-cols-2 gap-3">
        <div><FieldLabel>Jumlah Pasangan</FieldLabel><TextInput value={hero.socialProofCount} onChange={v => set('socialProofCount', v)} placeholder="500+" /></div>
        <div><FieldLabel>Rating</FieldLabel><TextInput value={hero.socialProofRating} onChange={v => set('socialProofRating', v)} placeholder="4.9" /></div>
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
