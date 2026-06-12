'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import {
  Users, Search, Trash2, Crown, UserPlus, ChevronLeft, ChevronRight,
  Filter, ArrowUpDown, ExternalLink, ChevronDown,
  KeyRound, Eye, Calendar, Package, Palette, Clock, Globe,
  CheckCircle2, XCircle, Loader2, Mail, AlertTriangle,
  Copy, Hash, X, EyeOff, Info,
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────

interface AdminUserInvitation {
  id: string
  slug: string
  template_id: string
  is_published: boolean
  is_paid: boolean
  package_tier: string | null
  expires_at: string | null
  created_at: string
}

interface TemplateInfo {
  id: string
  name: string
}

interface AdminUser {
  id: string
  email: string
  created_at: string
  invitation: AdminUserInvitation | null
}

interface UsersTabProps {
  users: AdminUser[]
  templates: TemplateInfo[]
  onDelete: (id: string) => Promise<void>
  onGoToTab: (tab: string) => void
}

// ─── Helpers ─────────────────────────────────────────────────

function timeAgo(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diff = now - then
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return 'baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days < 30) return `${days} hari lalu`
  if (months < 12) return `${months} bulan lalu`
  return `${years} tahun lalu`
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function isExpired(dateString: string | null): boolean {
  if (!dateString) return false
  return new Date(dateString).getTime() < Date.now()
}

function daysUntilExpiry(dateString: string | null): number | null {
  if (!dateString) return null
  return Math.ceil((new Date(dateString).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
}

const TIER_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  starter: { label: 'Starter', color: 'text-stone-700', bg: 'bg-stone-100' },
  premium: { label: 'Premium', color: 'text-blue-700', bg: 'bg-blue-100' },
  exclusive: { label: 'Exclusive', color: 'text-amber-700', bg: 'bg-amber-100' },
}

type FilterKey = 'all' | 'paid' | 'unpaid' | 'no-invitation' | 'expired'
type SortKey = 'newest' | 'oldest' | 'email-asc'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'paid', label: 'Sudah Bayar' },
  { key: 'unpaid', label: 'Belum Bayar' },
  { key: 'no-invitation', label: 'Belum Buat' },
  { key: 'expired', label: 'Kedaluwarsa' },
]

const ITEMS_PER_PAGE = 20

// ─── Modal Backdrop ──────────────────────────────────────────

function ModalBackdrop({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onEsc(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onEsc)
    return () => document.removeEventListener('keydown', onEsc)
  }, [onClose])

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    >
      {children}
    </div>
  )
}

// ─── Component ───────────────────────────────────────────────

export default function UsersTab({ users, templates, onDelete, onGoToTab }: UsersTabProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Modals
  const [resetModal, setResetModal] = useState<AdminUser | null>(null)
  const [deleteModal, setDeleteModal] = useState<AdminUser | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const templateMap = useMemo(() => {
    const m = new Map<string, string>()
    templates.forEach((t) => m.set(t.id, t.name))
    return m
  }, [templates])

  // ── Stats (admin already excluded from server) ───────────
  const stats = useMemo(() => {
    const total = users.length
    const withInvitation = users.filter((u) => u.invitation).length
    const paid = users.filter((u) => u.invitation?.is_paid).length
    const noInvitation = total - withInvitation
    const expired = users.filter((u) => u.invitation?.expires_at && isExpired(u.invitation.expires_at)).length
    return { total, withInvitation, paid, noInvitation, expired }
  }, [users])

  // ── Filtered + sorted list ───────────────────────────────
  const filtered = useMemo(() => {
    let list = [...users]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((u) =>
        u.email.toLowerCase().includes(q) ||
        u.invitation?.slug?.toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      )
    }
    if (filter === 'paid') list = list.filter((u) => u.invitation?.is_paid)
    else if (filter === 'unpaid') list = list.filter((u) => u.invitation && !u.invitation.is_paid)
    else if (filter === 'no-invitation') list = list.filter((u) => !u.invitation)
    else if (filter === 'expired') list = list.filter((u) => u.invitation?.expires_at && isExpired(u.invitation.expires_at))

    list.sort((a, b) => {
      if (sort === 'email-asc') return a.email.localeCompare(b.email)
      const ta = new Date(a.created_at).getTime()
      const tb = new Date(b.created_at).getTime()
      return sort === 'newest' ? tb - ta : ta - tb
    })
    return list
  }, [users, search, filter, sort])

  // ── Pagination ───────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)
  const resetPage = () => setPage(1)

  // ── Reset password (modal) ───────────────────────────────
  function openResetModal(user: AdminUser) {
    setResetModal(user)
    setResetPassword('')
    setShowPassword(false)
    setResetError(null)
    setResetSuccess(null)
  }

  async function doResetPassword() {
    if (!resetModal) return
    if (resetPassword.length < 6) {
      setResetError('Password minimal 6 karakter')
      return
    }
    setResetting(true)
    setResetError(null)
    try {
      const res = await fetch(`/api/admin/users/${resetModal.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword }),
      })
      if (!res.ok) {
        const data = await res.json()
        setResetError(data.error || 'Gagal reset password')
        return
      }
      setResetSuccess(resetModal.id)
      setResetModal(null)
      setResetPassword('')
      setTimeout(() => setResetSuccess(null), 4000)
    } finally {
      setResetting(false)
    }
  }

  // ── Delete (modal with confirmation) ─────────────────────
  function openDeleteModal(user: AdminUser) {
    setDeleteModal(user)
    setDeleteConfirmText('')
  }

  async function doDelete() {
    if (!deleteModal) return
    setDeleting(true)
    try {
      await onDelete(deleteModal.id)
      setDeleteModal(null)
    } finally {
      setDeleting(false)
    }
  }

  // ── Copy ID ──────────────────────────────────────────────
  function copyId(id: string) {
    navigator.clipboard.writeText(id)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ── Avatar color ─────────────────────────────────────────
  function avatarColor(user: AdminUser): string {
    if (user.invitation) {
      if (user.invitation.expires_at && isExpired(user.invitation.expires_at)) return 'bg-red-100 text-red-600'
      if (user.invitation.is_paid) return 'bg-emerald-100 text-emerald-700'
      return 'bg-amber-100 text-amber-700'
    }
    return 'bg-stone-100 text-stone-500'
  }

  function statusLabel(user: AdminUser): { text: string; color: string } {
    if (!user.invitation) return { text: 'Belum buat undangan', color: 'text-stone-400' }
    if (user.invitation.expires_at && isExpired(user.invitation.expires_at)) return { text: 'Kedaluwarsa', color: 'text-red-500' }
    if (user.invitation.is_paid && user.invitation.is_published) return { text: 'Aktif & Live', color: 'text-emerald-600' }
    if (user.invitation.is_paid) return { text: 'Lunas, Draft', color: 'text-blue-600' }
    return { text: 'Belum Bayar', color: 'text-amber-600' }
  }

  const summaryCards = [
    { icon: Users, label: 'Total Pengguna', value: stats.total, color: 'text-stone-600', bg: 'bg-stone-50' },
    { icon: Mail, label: 'Punya Undangan', value: stats.withInvitation, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Crown, label: 'Sudah Bayar', value: stats.paid, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: UserPlus, label: 'Belum Buat', value: stats.noInvitation, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div>
      {/* ── Header ──────────────────────────────────────────── */}
      <div className="px-8 py-5 border-b border-stone-200 bg-white">
        <h1 className="text-lg font-bold text-stone-900 tracking-tight">Pengguna</h1>
        <p className="text-xs text-stone-400 mt-0.5">
          {stats.total} pengguna terdaftar &middot; {stats.paid} aktif berbayar
          {stats.expired > 0 && <span className="text-red-500"> &middot; {stats.expired} kedaluwarsa</span>}
        </p>
      </div>

      <div className="p-8 space-y-6">
        {/* ── Summary Cards ───────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {summaryCards.map((card) => (
            <div key={card.label} className="flex items-center gap-3 px-4 py-3 bg-white border border-stone-200 rounded-xl">
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${card.bg}`}>
                <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
              </div>
              <div>
                <div className="text-xl font-bold text-stone-900 leading-tight">{card.value}</div>
                <div className="text-xs text-stone-400">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filter + Search + Sort Row ──────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-stone-400 mr-1 hidden sm:block" />
            {FILTERS.map((f) => {
              const count = f.key === 'all' ? stats.total
                : f.key === 'paid' ? stats.paid
                : f.key === 'unpaid' ? stats.withInvitation - stats.paid
                : f.key === 'expired' ? stats.expired
                : stats.noInvitation
              return (
                <button
                  key={f.key}
                  onClick={() => { setFilter(f.key); resetPage() }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                    filter === f.key
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {f.label}
                  {count > 0 && <span className="ml-1 opacity-70">{count}</span>}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Cari email, slug, atau ID..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage() }}
                className="w-full sm:w-60 pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 bg-white"
              />
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value as SortKey); resetPage() }}
                className="pl-9 pr-8 py-2 text-sm border border-stone-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 appearance-none cursor-pointer text-stone-700"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="email-asc">Email A-Z</option>
              </select>
              <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none rotate-90" />
            </div>
          </div>
        </div>

        {/* ── User Cards List ─────────────────────────────────── */}
        {paginated.length > 0 ? (
          <div className="space-y-2">
            {paginated.map((user) => {
              const isExpanded = expandedId === user.id
              const inv = user.invitation
              const tierInfo = inv?.package_tier ? TIER_LABELS[inv.package_tier] || { label: inv.package_tier, color: 'text-stone-600', bg: 'bg-stone-100' } : null
              const expired = inv ? isExpired(inv.expires_at) : false
              const daysLeft = inv ? daysUntilExpiry(inv.expires_at) : null
              const status = statusLabel(user)

              return (
                <div
                  key={user.id}
                  className={`bg-white border rounded-xl transition-all ${
                    isExpanded ? 'border-stone-300 shadow-sm' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {/* ── Main row (clickable) ─────────────────── */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : user.id)}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarColor(user)}`}>
                      {user.email[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-stone-900 truncate block">{user.email}</span>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Bergabung {timeAgo(user.created_at)}
                        <span className={`ml-2 font-medium ${status.color}`}>&middot; {status.text}</span>
                      </p>
                    </div>

                    {/* Quick badges (desktop) */}
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                      {inv ? (
                        <>
                          <span className="inline-flex items-center gap-1 text-xs font-mono bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg">
                            <Globe className="w-3 h-3" />/{inv.slug}
                          </span>
                          {tierInfo && (
                            <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${tierInfo.bg} ${tierInfo.color}`}>
                              {tierInfo.label}
                            </span>
                          )}
                          {expired && (
                            <span className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600">
                              Expired
                            </span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs text-stone-400 italic">Belum buat undangan</span>
                      )}
                    </div>

                    <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Quick badges (mobile, collapsed only) */}
                  {!isExpanded && inv && (
                    <div className="flex sm:hidden items-center gap-2 px-5 pb-3 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs font-mono bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg">
                        <Globe className="w-3 h-3" />/{inv.slug}
                      </span>
                      {tierInfo && (
                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${tierInfo.bg} ${tierInfo.color}`}>
                          {tierInfo.label}
                        </span>
                      )}
                    </div>
                  )}

                  {/* ── Expanded detail panel ────────────────── */}
                  {isExpanded && (
                    <div className="border-t border-stone-100">
                      {/* Account info (always shown) */}
                      <div className="px-5 pt-4 pb-2">
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Informasi Akun</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div className="flex items-center gap-2.5 p-2.5 bg-stone-50 rounded-lg">
                            <Hash className="w-4 h-4 text-stone-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-stone-400">User ID</p>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-mono text-stone-600 truncate">{user.id}</p>
                                <button
                                  onClick={(e) => { e.stopPropagation(); copyId(user.id) }}
                                  className="flex-shrink-0 text-stone-400 hover:text-stone-600 transition-colors"
                                  title="Salin ID"
                                >
                                  {copiedId === user.id
                                    ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                    : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                            </div>
                          </div>
                          <DetailItem icon={Mail} label="Email" value={user.email} />
                          <DetailItem icon={Clock} label="Terdaftar" value={formatDateTime(user.created_at)} />
                        </div>
                      </div>

                      {inv ? (
                        <div className="px-5 py-3 space-y-4">
                          <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Detail Undangan</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            <DetailItem icon={Globe} label="Subdomain" value={`/${inv.slug}`} mono />
                            <DetailItem icon={Palette} label="Desain Template" value={templateMap.get(inv.template_id) || inv.template_id} />
                            <DetailItem icon={Package} label="Paket" value={tierInfo?.label || 'Belum dipilih'} valueColor={tierInfo?.color} />
                            <DetailItem
                              icon={Calendar}
                              label="Masa Aktif"
                              value={inv.expires_at ? formatDate(inv.expires_at) : 'Selamanya'}
                              extra={
                                inv.expires_at
                                  ? expired
                                    ? <span className="text-red-500 text-xs font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Kedaluwarsa</span>
                                    : daysLeft !== null && daysLeft <= 30
                                      ? <span className="text-amber-600 text-xs font-medium">{daysLeft} hari lagi</span>
                                      : daysLeft !== null
                                        ? <span className="text-emerald-600 text-xs">{daysLeft} hari tersisa</span>
                                        : null
                                  : null
                              }
                            />
                            <DetailItem
                              icon={Crown}
                              label="Pembayaran"
                              value={inv.is_paid ? 'Lunas' : 'Belum Bayar'}
                              valueColor={inv.is_paid ? 'text-emerald-600' : 'text-amber-600'}
                            />
                            <DetailItem
                              icon={Eye}
                              label="Status Publish"
                              value={inv.is_published ? 'Live (Publik)' : 'Draft (Privat)'}
                              valueColor={inv.is_published ? 'text-blue-600' : 'text-stone-500'}
                            />
                            <DetailItem icon={Clock} label="Undangan Dibuat" value={formatDate(inv.created_at)} />
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {inv.is_published && (
                              <a
                                href={`/${inv.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Lihat Undangan Live
                              </a>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); onGoToTab('invitations') }}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-800 px-3 py-2 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                            >
                              <Info className="w-3.5 h-3.5" /> Kelola di Undangan
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); openResetModal(user) }}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 px-3 py-2 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5" /> Reset Password
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); openDeleteModal(user) }}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus Pengguna
                            </button>
                          </div>

                          {resetSuccess === user.id && (
                            <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Password berhasil direset
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="px-5 py-3 space-y-4">
                          <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg border border-stone-100">
                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-stone-200/60">
                              <Mail className="w-5 h-5 text-stone-400" />
                            </div>
                            <div>
                              <p className="text-sm text-stone-600 font-medium">Belum membuat undangan</p>
                              <p className="text-xs text-stone-400 mt-0.5">User terdaftar sejak {formatDateTime(user.created_at)} tapi belum membuat undangan digital</p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); openResetModal(user) }}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 px-3 py-2 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
                            >
                              <KeyRound className="w-3.5 h-3.5" /> Reset Password
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); openDeleteModal(user) }}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-red-500 hover:text-red-600 px-3 py-2 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus Pengguna
                            </button>
                          </div>

                          {resetSuccess === user.id && (
                            <p className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Password berhasil direset
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-xl py-16 text-center">
            {search || filter !== 'all' ? (
              <div>
                <Search className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <p className="text-sm text-stone-500 font-medium">Tidak ditemukan</p>
                <p className="text-xs text-stone-400 mt-1">Coba ubah kata kunci atau hapus filter yang aktif</p>
                <button
                  onClick={() => { setSearch(''); setFilter('all'); resetPage() }}
                  className="mt-4 text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  Hapus semua filter
                </button>
              </div>
            ) : (
              <div>
                <Users className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <p className="text-sm text-stone-500 font-medium">Belum ada pengguna</p>
                <p className="text-xs text-stone-400 mt-1">Pengguna yang mendaftar akan muncul di sini</p>
              </div>
            )}
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-stone-400">
              Menampilkan {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} pengguna
            </p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(safePage - 2, totalPages - 4))
                const pageNum = start + i
                if (pageNum > totalPages) return null
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      pageNum === safePage
                        ? 'bg-stone-900 text-white'
                        : 'border border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          MODAL: Reset Password
         ══════════════════════════════════════════════════════════ */}
      {resetModal && (
        <ModalBackdrop onClose={() => setResetModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100">
                  <KeyRound className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Reset Password</h3>
                  <p className="text-xs text-stone-400">{resetModal.email}</p>
                </div>
              </div>
              <button onClick={() => setResetModal(null)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Perhatian:</strong> Password lama user akan diganti. Pastikan untuk menginformasikan password baru ke user melalui email atau chat.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">Password Baru</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Minimal 6 karakter"
                    value={resetPassword}
                    onChange={(e) => { setResetPassword(e.target.value); setResetError(null) }}
                    onKeyDown={(e) => { if (e.key === 'Enter') doResetPassword() }}
                    className="w-full px-4 py-2.5 pr-10 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {resetPassword.length > 0 && resetPassword.length < 6 && (
                  <p className="text-xs text-amber-600 mt-1.5">Minimal 6 karakter ({6 - resetPassword.length} lagi)</p>
                )}
              </div>

              {resetError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-700">{resetError}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
              <button
                onClick={() => setResetModal(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={doResetPassword}
                disabled={resetting || resetPassword.length < 6}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                {resetting ? 'Menyimpan...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* ══════════════════════════════════════════════════════════
          MODAL: Delete User Confirmation
         ══════════════════════════════════════════════════════════ */}
      {deleteModal && (
        <ModalBackdrop onClose={() => setDeleteModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">Hapus Pengguna</h3>
                  <p className="text-xs text-stone-400">{deleteModal.email}</p>
                </div>
              </div>
              <button onClick={() => setDeleteModal(null)} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="p-4 bg-red-50 border border-red-100 rounded-lg space-y-2">
                <p className="text-xs text-red-800 font-semibold">Tindakan ini tidak dapat dibatalkan! Data berikut akan dihapus permanen:</p>
                <ul className="text-xs text-red-700 space-y-1 ml-4 list-disc">
                  <li>Akun pengguna <strong>{deleteModal.email}</strong></li>
                  {deleteModal.invitation && (
                    <>
                      <li>Subdomain undangan <strong className="font-mono">/{deleteModal.invitation.slug}</strong> tidak bisa diakses lagi</li>
                      <li>Seluruh data undangan (tamu, ucapan, galeri, RSVP)</li>
                      <li>Riwayat pembayaran terkait akun ini</li>
                    </>
                  )}
                  {!deleteModal.invitation && (
                    <li>Seluruh data akun pengguna</li>
                  )}
                </ul>
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1.5">
                  Ketik <strong className="text-red-600 font-mono">{deleteModal.email}</strong> untuk konfirmasi
                </label>
                <input
                  type="text"
                  placeholder={deleteModal.email}
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && deleteConfirmText === deleteModal.email) doDelete() }}
                  className="w-full px-4 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-400 font-mono"
                  autoFocus
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
              <button
                onClick={() => setDeleteModal(null)}
                className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={doDelete}
                disabled={deleting || deleteConfirmText !== deleteModal.email}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                {deleting ? 'Menghapus...' : 'Hapus Permanen'}
              </button>
            </div>
          </div>
        </ModalBackdrop>
      )}
    </div>
  )
}

// ─── Detail item sub-component ──────────────────────────────

function DetailItem({ icon: Icon, label, value, mono, valueColor, extra }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  mono?: boolean
  valueColor?: string
  extra?: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-2.5 p-2.5 bg-stone-50 rounded-lg">
      <Icon className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-xs text-stone-400">{label}</p>
        <p className={`text-sm font-medium truncate ${mono ? 'font-mono' : ''} ${valueColor || 'text-stone-800'}`}>{value}</p>
        {extra}
      </div>
    </div>
  )
}
