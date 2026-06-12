'use client'

import { useState, useMemo } from 'react'
import {
  Users, Search, Trash2, Crown, UserPlus, ChevronLeft, ChevronRight,
  Filter, ArrowUpDown, ExternalLink, Shield, Mail, ChevronDown,
  KeyRound, Eye, Calendar, Package, Palette, Clock, Globe,
  CheckCircle2, XCircle, Loader2,
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
  adminEmail: string
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

type FilterKey = 'all' | 'paid' | 'unpaid' | 'no-invitation'
type SortKey = 'newest' | 'oldest'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'paid', label: 'Sudah Bayar' },
  { key: 'unpaid', label: 'Belum Bayar' },
  { key: 'no-invitation', label: 'Belum Buat Undangan' },
]

const ITEMS_PER_PAGE = 20

// ─── Component ───────────────────────────────────────────────

export default function UsersTab({ users, adminEmail, templates, onDelete, onGoToTab }: UsersTabProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [resetId, setResetId] = useState<string | null>(null)
  const [resetPassword, setResetPassword] = useState('')
  const [resetting, setResetting] = useState(false)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)

  const templateMap = useMemo(() => {
    const m = new Map<string, string>()
    templates.forEach((t) => m.set(t.id, t.name))
    return m
  }, [templates])

  // ── Stats ────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = users.length
    const withInvitation = users.filter((u) => u.invitation).length
    const paid = users.filter((u) => u.invitation?.is_paid).length
    const noInvitation = total - withInvitation
    return { total, withInvitation, paid, noInvitation }
  }, [users])

  // ── Filtered + sorted list ───────────────────────────────
  const filtered = useMemo(() => {
    let list = [...users]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((u) =>
        u.email.toLowerCase().includes(q) ||
        u.invitation?.slug?.toLowerCase().includes(q)
      )
    }
    if (filter === 'paid') list = list.filter((u) => u.invitation?.is_paid)
    else if (filter === 'unpaid') list = list.filter((u) => u.invitation && !u.invitation.is_paid)
    else if (filter === 'no-invitation') list = list.filter((u) => !u.invitation)

    list.sort((a, b) => {
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

  // ── Delete ───────────────────────────────────────────────
  async function doDelete(id: string) {
    setDeleting(true)
    try { await onDelete(id) } finally { setDeleting(false); setConfirmId(null) }
  }

  // ── Reset password ───────────────────────────────────────
  async function doResetPassword(userId: string) {
    if (resetPassword.length < 6) {
      setResetError('Password minimal 6 karakter')
      return
    }
    setResetting(true)
    setResetError(null)
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: resetPassword }),
      })
      if (!res.ok) {
        const data = await res.json()
        setResetError(data.error || 'Gagal reset password')
        return
      }
      setResetSuccess(userId)
      setResetPassword('')
      setResetId(null)
      setTimeout(() => setResetSuccess(null), 3000)
    } finally {
      setResetting(false)
    }
  }

  // ── Avatar color ─────────────────────────────────────────
  function avatarColor(user: AdminUser): string {
    if (user.invitation?.is_paid) return 'bg-emerald-100 text-emerald-700'
    if (user.invitation) return 'bg-amber-100 text-amber-700'
    return 'bg-stone-100 text-stone-500'
  }

  const summaryCards = [
    { icon: Users, label: 'Total Terdaftar', value: stats.total, color: 'text-stone-600', bg: 'bg-stone-50' },
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
          {stats.total} terdaftar, {stats.withInvitation} sudah buat undangan, {stats.paid} sudah bayar
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
            {FILTERS.map((f) => (
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
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 sm:ml-auto w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Cari email atau slug..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage() }}
                className="w-full sm:w-56 pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 bg-white"
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
              </select>
              <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none rotate-90" />
            </div>
          </div>
        </div>

        {/* ── User Cards List ─────────────────────────────────── */}
        {paginated.length > 0 ? (
          <div className="space-y-2">
            {paginated.map((user) => {
              const isAdminUser = user.email === adminEmail
              const isExpanded = expandedId === user.id
              const isConfirming = confirmId === user.id
              const inv = user.invitation
              const tierInfo = inv?.package_tier ? TIER_LABELS[inv.package_tier] || { label: inv.package_tier, color: 'text-stone-600', bg: 'bg-stone-100' } : null
              const expired = inv ? isExpired(inv.expires_at) : false
              const daysLeft = inv ? daysUntilExpiry(inv.expires_at) : null

              return (
                <div
                  key={user.id}
                  className={`bg-white border rounded-xl transition-colors ${
                    isConfirming ? 'border-red-200' : isExpanded ? 'border-stone-300 shadow-sm' : 'border-stone-200 hover:border-stone-300'
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
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-stone-900 truncate">{user.email}</span>
                        {isAdminUser && (
                          <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                            <Shield className="w-3 h-3" /> Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-400 mt-0.5">Bergabung {timeAgo(user.created_at)}</p>
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
                          <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                            inv.is_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {inv.is_paid ? 'Lunas' : 'Belum Bayar'}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs text-stone-400">Belum buat undangan</span>
                      )}
                    </div>

                    <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Quick badges (mobile) */}
                  {!isExpanded && inv && (
                    <div className="flex sm:hidden items-center gap-2 px-5 pb-3 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs font-mono bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg">
                        <Globe className="w-3 h-3" />/{inv.slug}
                      </span>
                      <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${
                        inv.is_paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {inv.is_paid ? 'Lunas' : 'Belum Bayar'}
                      </span>
                    </div>
                  )}

                  {/* ── Expanded detail panel ────────────────── */}
                  {isExpanded && (
                    <div className="border-t border-stone-100">
                      {inv ? (
                        <div className="px-5 py-4 space-y-4">
                          {/* Detail grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            <DetailItem icon={Globe} label="Subdomain" value={`/${inv.slug}`} mono />
                            <DetailItem icon={Palette} label="Desain" value={templateMap.get(inv.template_id) || inv.template_id} />
                            <DetailItem icon={Package} label="Paket" value={tierInfo?.label || 'Belum dipilih'} />
                            <DetailItem
                              icon={Calendar}
                              label="Masa Aktif"
                              value={inv.expires_at ? formatDate(inv.expires_at) : 'Tidak ada'}
                              extra={
                                inv.expires_at
                                  ? expired
                                    ? <span className="text-red-500 text-xs font-medium">Kedaluwarsa</span>
                                    : daysLeft !== null && daysLeft <= 30
                                      ? <span className="text-amber-600 text-xs font-medium">{daysLeft} hari lagi</span>
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
                              label="Status"
                              value={inv.is_published ? 'Live' : 'Draft'}
                              valueColor={inv.is_published ? 'text-blue-600' : 'text-stone-500'}
                            />
                            <DetailItem icon={Clock} label="Dibuat" value={formatDate(inv.created_at)} />
                          </div>

                          {/* Action buttons */}
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            {inv.is_published && (
                              <a
                                href={`/${inv.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                              >
                                <ExternalLink className="w-3.5 h-3.5" /> Lihat Undangan
                              </a>
                            )}
                            <button
                              onClick={(e) => { e.stopPropagation(); onGoToTab('invitations') }}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-600 hover:text-stone-800 px-3 py-1.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-colors"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Kelola di Undangan
                            </button>

                            {!isAdminUser && (
                              <>
                                {resetId === user.id ? (
                                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <input
                                      type="password"
                                      placeholder="Password baru (min. 6)"
                                      value={resetPassword}
                                      onChange={(e) => { setResetPassword(e.target.value); setResetError(null) }}
                                      className="w-44 px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                                      autoFocus
                                    />
                                    <button
                                      onClick={() => doResetPassword(user.id)}
                                      disabled={resetting}
                                      className="inline-flex items-center gap-1 text-xs font-medium bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
                                    >
                                      {resetting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                      Simpan
                                    </button>
                                    <button
                                      onClick={() => { setResetId(null); setResetPassword(''); setResetError(null) }}
                                      className="text-xs text-stone-500 hover:text-stone-700 px-2 py-1.5 transition-colors"
                                    >
                                      Batal
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setResetId(user.id); setResetPassword('') }}
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
                                  >
                                    <KeyRound className="w-3.5 h-3.5" /> Reset Password
                                  </button>
                                )}
                              </>
                            )}
                          </div>

                          {resetError && (
                            <p className="flex items-center gap-1.5 text-xs text-red-600">
                              <XCircle className="w-3.5 h-3.5" /> {resetError}
                            </p>
                          )}
                          {resetSuccess === user.id && (
                            <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Password berhasil direset
                            </p>
                          )}
                        </div>
                      ) : (
                        /* No invitation */
                        <div className="px-5 py-4 space-y-3">
                          <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-lg">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-stone-100">
                              <Mail className="w-4 h-4 text-stone-400" />
                            </div>
                            <div>
                              <p className="text-sm text-stone-600 font-medium">Belum membuat undangan</p>
                              <p className="text-xs text-stone-400">User terdaftar tapi belum membuat undangan digital</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <DetailItem icon={Clock} label="Bergabung" value={formatDate(user.created_at)} />
                          </div>

                          {!isAdminUser && (
                            <div className="flex items-center gap-2 pt-1">
                              {resetId === user.id ? (
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="password"
                                    placeholder="Password baru (min. 6)"
                                    value={resetPassword}
                                    onChange={(e) => { setResetPassword(e.target.value); setResetError(null) }}
                                    className="w-44 px-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                                    autoFocus
                                  />
                                  <button
                                    onClick={() => doResetPassword(user.id)}
                                    disabled={resetting}
                                    className="inline-flex items-center gap-1 text-xs font-medium bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors"
                                  >
                                    {resetting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                                    Simpan
                                  </button>
                                  <button
                                    onClick={() => { setResetId(null); setResetPassword(''); setResetError(null) }}
                                    className="text-xs text-stone-500 hover:text-stone-700 px-2 py-1.5 transition-colors"
                                  >
                                    Batal
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={(e) => { e.stopPropagation(); setResetId(user.id); setResetPassword('') }}
                                  className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700 px-3 py-1.5 rounded-lg border border-amber-200 hover:bg-amber-50 transition-colors"
                                >
                                  <KeyRound className="w-3.5 h-3.5" /> Reset Password
                                </button>
                              )}
                            </div>
                          )}

                          {resetError && (
                            <p className="flex items-center gap-1.5 text-xs text-red-600">
                              <XCircle className="w-3.5 h-3.5" /> {resetError}
                            </p>
                          )}
                          {resetSuccess === user.id && (
                            <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Password berhasil direset
                            </p>
                          )}
                        </div>
                      )}

                      {/* Delete (inside expanded, non-admin only) */}
                      {!isAdminUser && (
                        <div className="px-5 pb-4">
                          {isConfirming ? (
                            <div className="flex items-center justify-between gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
                              <p className="text-xs text-red-700 font-medium">Hapus user ini beserta semua datanya?</p>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <button
                                  onClick={() => setConfirmId(null)}
                                  disabled={deleting}
                                  className="text-xs text-stone-600 hover:text-stone-800 px-3 py-1.5 rounded-lg hover:bg-white transition-colors font-medium"
                                >
                                  Batal
                                </button>
                                <button
                                  onClick={() => doDelete(user.id)}
                                  disabled={deleting}
                                  className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-medium"
                                >
                                  {deleting ? 'Menghapus...' : 'Ya, Hapus'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); setConfirmId(user.id) }}
                              className="inline-flex items-center gap-1.5 text-xs text-stone-400 hover:text-red-500 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus pengguna
                            </button>
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
            <p className="text-xs text-stone-400">Halaman {safePage} dari {totalPages}</p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="flex items-center justify-center w-8 h-8 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
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
