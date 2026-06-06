'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, FileEdit, Images, Music, Users, LogOut,
  ExternalLink, Copy, Menu, X, ChevronRight, Eye, Send,
  Settings, CreditCard, Check, Sparkles, ChevronDown,
} from 'lucide-react'
import type { Invitation, NewInvitationData } from '@/lib/types'
import { LEGACY_TEMPLATE_IDS, PRICE_FORMATTED } from '@/lib/types'
import { getInvitationUrl, isExpired } from '@/lib/utils'
import { generateSlugSuggestions } from '@/lib/slug-generator'
import { Button } from '@/components/ui/Button'
import Logo from '@/components/ui/Logo'
import GalleryManager from './GalleryManager'
import MusicManager from './MusicManager'
import RSVPList from './RSVPList'
import DashboardOverview from './DashboardOverview'
import GuestManager from './GuestManager'
import SettingsPanel from './SettingsPanel'
import TransactionHistory from './TransactionHistory'
import TemplateModule from './TemplateModule'
import OnboardingWizard from './OnboardingWizard'

// ── Types ──────────────────────────────────────────────────────

export interface TemplateInfo {
  id: string
  name: string
  category: string
  thumbnailUrl: string
  demoUrl: string
  isNew: boolean
}

interface Props {
  user: { id: string; email: string }
  invitation: Invitation | null
  selectedTemplateId: string
  allTemplates: TemplateInfo[]
}

type Tab = 'overview' | 'undangan' | 'gallery' | 'music' | 'guest' | 'rsvp' | 'transactions' | 'settings'

const NAV: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview',     label: 'Beranda',    icon: LayoutDashboard },
  { id: 'undangan',     label: 'Undangan',   icon: FileEdit },
  { id: 'gallery',      label: 'Galeri',     icon: Images },
  { id: 'music',        label: 'Musik',      icon: Music },
  { id: 'guest',        label: 'Tamu',       icon: Send },
  { id: 'rsvp',         label: 'RSVP',       icon: Users },
  { id: 'transactions', label: 'Transaksi',  icon: CreditCard },
  { id: 'settings',     label: 'Settings',   icon: Settings },
]

// ── Helpers ────────────────────────────────────────────────────

function getDisplayNames(inv: Invitation): { groom: string; bride: string } {
  const isLegacy = (LEGACY_TEMPLATE_IDS as string[]).includes(inv.template_id)
  if (isLegacy) {
    return { groom: inv.data.groomName || '', bride: inv.data.brideName || '' }
  }
  const d = inv.data as unknown as NewInvitationData
  return { groom: d.groom_name || '', bride: d.bride_name || '' }
}

function isNewTemplate(templateId: string): boolean {
  return !(LEGACY_TEMPLATE_IDS as string[]).includes(templateId)
}

// ── Main Component ─────────────────────────────────────────────

export default function DashboardClient({ user, invitation, selectedTemplateId, allTemplates }: Props) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('overview')
  const [inv, setInv] = useState<Invitation | null>(invitation)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const isPaid = inv?.is_paid ?? false
  const isPublished = inv?.is_published ?? false
  const expired = isExpired(inv?.expires_at ?? null)

  const names = inv ? getDisplayNames(inv) : null

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
    router.refresh()
  }

  async function togglePublish() {
    if (!inv) return
    const res = await fetch(`/api/invitations/${inv.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: !inv.is_published }),
    })
    if (!res.ok) { toast.error('Gagal mengubah status'); return }
    const { invitation: updated } = await res.json()
    setInv(updated)
    toast.success(updated.is_published ? 'Undangan dipublikasikan! 🎉' : 'Undangan disembunyikan')
  }

  async function handleSimulatePay() {
    if (!inv) return
    const expiresAt = new Date()
    expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    const res = await fetch(`/api/invitations/${inv.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_paid: true, expires_at: expiresAt.toISOString() }),
    })
    if (!res.ok) { toast.error('Gagal'); return }
    const { invitation: updated } = await res.json()
    setInv(updated)
    toast.success('Simulasi pembayaran berhasil! 🎉')
  }

  function navTo(id: Tab) {
    if (!isPaid && id !== 'overview') return
    setTab(id)
    setSidebarOpen(false)
  }

  const statusBadge = expired
    ? { cls: 'bg-red-100 text-red-600', label: 'Expired' }
    : isPublished && isPaid
    ? { cls: 'bg-green-100 text-green-700', label: '● Aktif' }
    : isPaid
    ? { cls: 'bg-blue-100 text-blue-700', label: 'Siap diedit' }
    : { cls: 'bg-amber-100 text-amber-700', label: 'Menunggu Bayar' }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Sidebar overlay mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ─────────────────────────────────────────── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-stone-200/50 flex flex-col
        transition-transform duration-200 ease-in-out shadow-xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:static md:translate-x-0 md:flex md:shadow-none
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-stone-200/50">
          <Logo variant="horizontal" size="sm" />
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-stone-400">
            <X size={18} />
          </button>
        </div>

        {/* User + status */}
        <div className="px-4 py-4 border-b border-stone-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gold-gradient flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-md">
              {user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-stone-900 truncate">{user.email}</p>
              {inv && (
                <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${statusBadge.cls}`}>
                  {statusBadge.label}
                </span>
              )}
            </div>
          </div>
          {inv?.slug && (
            <div className="bg-gradient-to-br from-gold-50 to-champagne-50 rounded-lg px-3 py-2 border border-gold-200/50">
              <p className="text-[10px] text-stone-500 uppercase tracking-wide mb-0.5">Link undangan</p>
              <p className="text-xs font-mono text-gold-700 truncate font-semibold">{inv.slug}.akundang.id</p>
              {inv.expires_at && (
                <p className="text-[10px] text-stone-500 mt-0.5">
                  Aktif s/d {new Date(inv.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const locked = !isPaid && id !== 'overview'
            const active = tab === id
            return (
              <button
                key={id}
                onClick={() => navTo(id)}
                disabled={locked}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                  active
                    ? 'bg-gradient-to-r from-gold-50 to-champagne-50 text-gold-700 border border-gold-200/50 shadow-sm'
                    : locked
                    ? 'text-stone-300 cursor-not-allowed'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <Icon size={17} strokeWidth={active ? 2 : 1.5} />
                <span className="flex-1">{label}</span>
                {locked && <span className="text-[10px] text-stone-300">🔒</span>}
                {active && <ChevronRight size={13} className="text-gold-500" />}
              </button>
            )
          })}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 pb-4 pt-3 space-y-1 border-t border-stone-100">
          {inv?.is_paid && (
            <a
              href={getInvitationUrl(inv.slug)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              <Eye size={17} strokeWidth={1.5} />
              Preview Undangan
              <ExternalLink size={12} className="ml-auto text-stone-300" />
            </a>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-stone-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={17} strokeWidth={1.5} />
            Keluar
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile header */}
        <header className="md:hidden h-14 bg-white border-b border-stone-200/50 flex items-center justify-between px-4 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-stone-500">
            <Menu size={20} />
          </button>
          <Logo variant="horizontal" size="sm" />
          <div className="w-8" />
        </header>

        {/* Page header */}
        <div className="bg-white border-b border-stone-200/50 px-5 py-4 shrink-0">
          <div className="flex items-center justify-between gap-4 max-w-4xl">
            <div>
              <h1 className="font-serif text-lg font-bold text-stone-900">
                {NAV.find(n => n.id === tab)?.label}
              </h1>
              {inv?.is_paid && names?.groom && (
                <p className="text-sm text-stone-500 mt-0.5">
                  {names.groom} & {names.bride}
                </p>
              )}
            </div>

            {inv?.is_paid && tab === 'overview' && (
              <div className="flex items-center gap-2">
                {inv.is_published && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => { navigator.clipboard.writeText(getInvitationUrl(inv.slug)); toast.success('Link disalin!') }}
                  >
                    <Copy size={13} className="mr-1.5" /> Salin Link
                  </Button>
                )}
                <Button
                  size="sm"
                  variant={isPublished ? 'ghost' : 'primary'}
                  onClick={togglePublish}
                >
                  {isPublished ? 'Sembunyikan' : '🚀 Publish'}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">

            {/* Onboarding wizard (new user or unpaid) */}
            {(!inv || !inv.is_paid) && (
              <OnboardingWizard
                invitation={inv}
                onInvitationCreated={setInv}
                onSimulatePay={handleSimulatePay}
              />
            )}

            {/* Dashboard tabs (paid only) */}
            {inv && inv.is_paid && (
              <>
                {tab === 'overview' && (
                  <DashboardOverview invitation={inv} onNavigate={(t) => setTab(t as Tab)} onTogglePublish={togglePublish} />
                )}
                {tab === 'undangan' && (
                  <TemplateModule
                    invitation={inv}
                    allTemplates={allTemplates}
                    onInvitationUpdate={(updated) => setInv(updated)}
                  />
                )}
                {tab === 'gallery' && <GalleryManager invitation={inv} />}
                {tab === 'music' && <MusicManager invitation={inv} />}
                {tab === 'guest' && <GuestManager invitation={inv} />}
                {tab === 'rsvp' && <RSVPList invitationId={inv.id} />}
                {tab === 'transactions' && <TransactionHistory invitation={inv} />}
                {tab === 'settings' && <SettingsPanel invitation={inv} />}
              </>
            )}
          </div>
        </main>

        {/* Mobile bottom nav */}
        {inv?.is_paid && (
          <nav className="md:hidden bg-white border-t border-stone-200/50 flex shrink-0">
            {NAV.slice(0, 5).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => navTo(id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  tab === id ? 'text-gold-600' : 'text-stone-400'
                }`}
              >
                <Icon size={18} strokeWidth={tab === id ? 2 : 1.5} />
                {label.split(' ')[0]}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  )
}

// ── Payment Gate ───────────────────────────────────────────────

interface PaymentGateProps {
  invitation: Invitation | null
  selectedTemplateId: string
  allTemplates: TemplateInfo[]
  onInvitationCreated: (inv: Invitation) => void
  onSimulatePay: () => void
}

function PaymentGate({ invitation, selectedTemplateId, allTemplates, onInvitationCreated, onSimulatePay }: PaymentGateProps) {
  const defaultTemplate = allTemplates.find(t => t.id === selectedTemplateId) ?? allTemplates[0]
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateInfo>(defaultTemplate)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [creating, setCreating] = useState(false)
  const [slug, setSlug] = useState('')
  const [slugError, setSlugError] = useState('')
  const [slugStatus, setSlugStatus] = useState<'idle' | 'checking' | 'ok' | 'taken'>('idle')
  const [groomInput, setGroomInput] = useState('')
  const [brideInput, setBrideInput] = useState('')

  const slugSuggestions = generateSlugSuggestions(groomInput, brideInput)

  async function checkSlug(value: string) {
    if (!value || value.length < 3) { setSlugStatus('idle'); return }
    setSlugStatus('checking')
    const res = await fetch(`/api/invitations/check-slug?slug=${encodeURIComponent(value)}`)
    const { available } = await res.json()
    setSlugStatus(available ? 'ok' : 'taken')
  }

  function handleSlugChange(value: string) {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setSlug(clean)
    setSlugError('')
    setSlugStatus('idle')
    clearTimeout((window as unknown as { _slugTimer?: ReturnType<typeof setTimeout> })._slugTimer)
    ;(window as unknown as { _slugTimer?: ReturnType<typeof setTimeout> })._slugTimer = setTimeout(() => checkSlug(clean), 500)
  }

  async function handleCreate() {
    if (!slug.trim()) { setSlugError('Pilih nama link dulu'); return }
    if (slugStatus === 'taken') { setSlugError('Nama ini sudah dipakai'); return }
    if (!/^[a-z0-9-]{3,30}$/.test(slug)) { setSlugError('Hanya huruf kecil, angka, tanda hubung (min 3)'); return }

    setCreating(true)
    setSlugError('')
    const res = await fetch('/api/invitations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, template_id: selectedTemplate.id, data: {} }),
    })
    setCreating(false)

    if (!res.ok) {
      const { error } = await res.json()
      if (error?.includes('Slug')) setSlugError('Nama ini sudah dipakai, coba yang lain')
      else toast.error(error || 'Gagal membuat undangan')
      return
    }
    const { invitation: created } = await res.json()
    onInvitationCreated(created)
  }

  // State: sudah ada undangan tapi belum bayar → tampilkan payment info
  if (invitation && !invitation.is_paid) {
    return (
      <div className="max-w-lg space-y-4">
        {/* Payment header */}
        <div className="bg-gradient-to-br from-rose-600 to-pink-600 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-2xl">💳</div>
            <div>
              <h2 className="font-bold text-lg">Satu langkah lagi!</h2>
              <p className="text-white/70 text-sm">Bayar untuk mengaktifkan undangan</p>
            </div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Template</span>
              <span className="font-semibold capitalize">{invitation.template_id.replace(/-/g, ' ')}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-white/70">Link</span>
              <span className="font-mono font-semibold">{invitation.slug}.akundang.id</span>
            </div>
            <div className="h-px bg-white/20" />
            <div className="flex justify-between">
              <span className="font-medium">Total</span>
              <span className="font-bold text-lg">{PRICE_FORMATTED}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm text-gray-500 mb-4">Hubungi admin untuk info rekening pembayaran.</p>
          <a
            href="https://wa.me/628123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white text-sm font-semibold rounded-xl hover:bg-green-600 transition-colors"
          >
            💬 Konfirmasi via WhatsApp
          </a>
        </div>

        <div className="border-t border-dashed border-gray-200 pt-4 text-center">
          <p className="text-xs text-gray-400 mb-2">⚙️ Mode Development</p>
          <Button variant="secondary" size="sm" className="w-full" onClick={onSimulatePay}>
            Simulasi Bayar (Dev Only)
          </Button>
        </div>
      </div>
    )
  }

  // State: belum punya undangan → wizard buat baru
  return (
    <div className="max-w-2xl space-y-5">
      {/* Welcome hero */}
      <div className="bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 rounded-3xl p-7 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/4 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/4 -translate-x-1/4" />
        <div className="relative z-10">
          <div className="text-4xl mb-3">💌</div>
          <h2 className="font-serif text-2xl font-bold mb-2">Buat Undangan Pernikahan</h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-md">
            Pilih template, tentukan link undangan, dan isi detail pernikahan kalian. Selesai dalam hitungan menit.
          </p>
        </div>
      </div>

      {/* Steps preview */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { step: 1, icon: '🎨', label: 'Pilih Template' },
          { step: 2, icon: '🔗', label: 'Tentukan Link' },
          { step: 3, icon: '✍️', label: 'Isi Data & Bayar' },
        ].map(s => (
          <div key={s.step} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-xs font-semibold text-gray-700">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Template selector */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Sparkles size={16} className="text-rose-500" />
          Template Undangan
        </h3>

        {/* Selected template display */}
        <button
          onClick={() => setShowTemplatePicker(!showTemplatePicker)}
          className="w-full flex items-center gap-4 p-4 border-2 border-gold-200 rounded-2xl bg-gold-50 hover:bg-gold-100 transition-colors"
        >
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-300 to-pink-400 shrink-0 overflow-hidden">
            {selectedTemplate.thumbnailUrl && (
              <img src={selectedTemplate.thumbnailUrl} alt="" className="w-full h-full object-cover" onError={() => {}} />
            )}
          </div>
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900 text-sm">{selectedTemplate.name}</p>
              {selectedTemplate.isNew && (
                <span className="text-[10px] bg-gold-500 text-white px-1.5 py-0.5 rounded-full font-bold">NEW</span>
              )}
            </div>
            <p className="text-xs text-gray-500 capitalize mt-0.5">{selectedTemplate.category}</p>
          </div>
          <ChevronDown size={16} className={`text-gray-400 transition-transform ${showTemplatePicker ? 'rotate-180' : ''}`} />
        </button>

        {/* Template grid picker */}
        <AnimatePresence>
          {showTemplatePicker && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mt-3"
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
                {allTemplates.map(t => (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTemplate(t); setShowTemplatePicker(false) }}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all text-left ${
                      selectedTemplate.id === t.id ? 'border-rose-500 shadow-md' : 'border-gray-100 hover:border-rose-300'
                    }`}
                  >
                    <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200">
                      {t.thumbnailUrl && (
                        <img src={t.thumbnailUrl} alt={t.name} className="w-full h-full object-cover" onError={() => {}} />
                      )}
                    </div>
                    <div className="px-2.5 py-2">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold text-gray-800 truncate">{t.name}</p>
                        {t.isNew && <span className="text-[9px] bg-gold-500 text-white px-1 py-0.5 rounded font-bold shrink-0">NEW</span>}
                      </div>
                    </div>
                    {selectedTemplate.id === t.id && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-gold-500 rounded-full flex items-center justify-center">
                        <Check size={11} className="text-white" />
                      </div>
                    )}
                    <a
                      href={t.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="absolute bottom-10 left-2 right-2 bg-black/60 text-white text-[10px] text-center py-1 rounded-lg opacity-0 hover:opacity-100 transition-opacity"
                    >
                      Preview
                    </a>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Slug creator */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          🔗 Link Undangan Kalian
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama pria</label>
            <input
              value={groomInput}
              onChange={e => setGroomInput(e.target.value)}
              placeholder="Ahmad"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Nama wanita</label>
            <input
              value={brideInput}
              onChange={e => setBrideInput(e.target.value)}
              placeholder="Siti"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>
        </div>

        {slugSuggestions.length > 0 && (
          <div>
            <p className="text-xs text-gray-400 mb-2">Rekomendasi:</p>
            <div className="flex flex-wrap gap-2">
              {slugSuggestions.map(s => (
                <button
                  key={s}
                  onClick={() => handleSlugChange(s)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all font-medium ${
                    slug === s
                      ? 'bg-gold-600 text-white border-rose-600'
                      : 'border-gray-200 text-gray-600 hover:border-rose-400 hover:text-gold-600'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1.5">Atau tulis sendiri</label>
          <div className={`flex items-center border rounded-xl overflow-hidden focus-within:ring-2 transition-all ${
            slugStatus === 'ok' ? 'border-green-400 focus-within:ring-green-300'
            : slugStatus === 'taken' ? 'border-red-400 focus-within:ring-red-300'
            : 'border-gray-200 focus-within:ring-rose-400'
          }`}>
            <input
              value={slug}
              onChange={e => handleSlugChange(e.target.value)}
              placeholder="budi-dan-ani"
              className="flex-1 px-4 py-3 text-sm outline-none bg-white"
            />
            <div className="flex items-center px-3 gap-2 bg-gray-50 border-l border-gray-200 h-full py-3">
              <span className="text-xs text-gray-400 shrink-0">.akundang.id</span>
              {slugStatus === 'checking' && <div className="w-3 h-3 border-2 border-gray-300 border-t-rose-500 rounded-full animate-spin" />}
              {slugStatus === 'ok' && <Check size={13} className="text-green-500 shrink-0" />}
              {slugStatus === 'taken' && <X size={13} className="text-red-500 shrink-0" />}
            </div>
          </div>
          {slugError && <p className="text-xs text-red-500 mt-1">{slugError}</p>}
          {slugStatus === 'ok' && !slugError && (
            <p className="text-xs text-green-600 mt-1 font-medium">✓ Link tersedia!</p>
          )}
          {slugStatus === 'taken' && (
            <p className="text-xs text-red-500 mt-1">Nama ini sudah dipakai, coba yang lain</p>
          )}
        </div>

        {/* Price + CTA */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Paket Lengkap · 1 Tahun Aktif</p>
            <p className="text-xl font-bold text-gold-600">{PRICE_FORMATTED}</p>
          </div>
          <Button
            size="lg"
            loading={creating}
            onClick={handleCreate}
            disabled={slugStatus === 'taken'}
          >
            Buat Undangan →
          </Button>
        </div>
        <p className="text-xs text-center text-gray-400">Data acara diisi setelah pembayaran selesai.</p>
      </div>
    </div>
  )
}
