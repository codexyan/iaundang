'use client'

import { useState, useMemo } from 'react'
import {
  Mail, Search, Eye, EyeOff, CheckCircle2, Ban, ExternalLink,
  Clock, AlertCircle, Filter, ArrowUpDown, ChevronLeft, ChevronRight,
  Loader2, Calendar, Zap,
} from 'lucide-react'
import { TEMPLATES } from '@/lib/types'

//  Types 

interface AdminInvitation {
  id: string
  slug: string
  template_id: string
  user_id: string
  user_email: string
  is_published: boolean
  is_paid: boolean
  expires_at: string | null
  created_at: string
}

interface InvitationsTabProps {
  invitations: AdminInvitation[]
  onOverridePaid: (id: string, paid: boolean) => Promise<void>
  onTogglePublished: (id: string, published: boolean) => Promise<void>
}

//  Helpers 

type InvFilter = 'all' | 'live' | 'draft' | 'paid' | 'unpaid' | 'expired'
type SortMode = 'newest' | 'oldest' | 'slug-az'

function timeAgo(dateString: string): string {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diff = now - then

  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)
  const years = Math.floor(days / 365)

  if (seconds < 60) return 'baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days < 7) return `${days} hari lalu`
  if (weeks < 5) return `${weeks} minggu lalu`
  if (months < 12) return `${months} bulan lalu`
  return `${years} tahun lalu`
}

function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() < Date.now()
}

function isExpiringSoon(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  const diff = new Date(expiresAt).getTime() - Date.now()
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000
}

function templateLabel(id: string): string {
  return TEMPLATES.find((t) => t.id === id)?.name || id
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

//  Sub-components 

function SummaryCard({
  label,
  count,
  color,
  icon: Icon,
}: {
  label: string
  count: number
  color: 'stone' | 'green' | 'amber' | 'red'
  icon: React.ElementType
}) {
  const styles = {
    stone: 'bg-stone-50 border-stone-200 text-stone-700',
    green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-red-50 border-red-200 text-red-700',
  }
  const iconStyles = {
    stone: 'text-stone-400',
    green: 'text-emerald-500',
    amber: 'text-amber-500',
    red: 'text-red-500',
  }

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${styles[color]}`}>
      <Icon className={`w-5 h-5 ${iconStyles[color]}`} />
      <div>
        <p className="text-2xl font-bold leading-none">{count}</p>
        <p className="text-xs mt-0.5 opacity-70">{label}</p>
      </div>
    </div>
  )
}

function StatusDot({ inv }: { inv: AdminInvitation }) {
  let color = 'bg-stone-300'
  if (isExpired(inv.expires_at)) {
    color = 'bg-red-500'
  } else if (inv.is_published && inv.is_paid) {
    color = 'bg-emerald-500'
  } else if (inv.is_paid && !inv.is_published) {
    color = 'bg-amber-500'
  }
  return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${color}`} />
}

function ExpiryInfo({ expiresAt }: { expiresAt: string | null }) {
  if (!expiresAt) {
    return <span className="text-stone-400">-</span>
  }

  if (isExpired(expiresAt)) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600">
        <AlertCircle className="w-3 h-3" />
        Kadaluarsa
      </span>
    )
  }

  if (isExpiringSoon(expiresAt)) {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600">
        <Clock className="w-3 h-3" />
        Segera kadaluarsa
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 text-xs text-stone-400">
      <Calendar className="w-3 h-3" />
      {formatDate(expiresAt)}
    </span>
  )
}

function Badge({
  variant,
  children,
}: {
  variant: 'green' | 'amber' | 'red' | 'stone' | 'blue'
  children: React.ReactNode
}) {
  const styles = {
    green: 'bg-emerald-100 text-emerald-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    stone: 'bg-stone-100 text-stone-600',
    blue: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  )
}

//  Pagination 

const PAGE_SIZE = 15

function Pagination({
  page,
  totalPages,
  totalItems,
  onPageChange,
}: {
  page: number
  totalPages: number
  totalItems: number
  onPageChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const start = (page - 1) * PAGE_SIZE + 1
  const end = Math.min(page * PAGE_SIZE, totalItems)

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-stone-500">
        Menampilkan {start}-{end} dari {totalItems}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-3 py-1.5 text-xs font-medium text-stone-600">
          {page} / {totalPages}
        </span>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1.5 rounded-lg border border-stone-200 text-stone-500 hover:bg-stone-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

//  Main Component 

export default function InvitationsTab({
  invitations,
  onOverridePaid,
  onTogglePublished,
}: InvitationsTabProps) {
  const [filter, setFilter] = useState<InvFilter>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortMode>('newest')
  const [page, setPage] = useState(1)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  //  Computed counts 

  const counts = useMemo(() => {
    const all = invitations.length
    const live = invitations.filter((i) => i.is_published && i.is_paid).length
    const draft = invitations.filter((i) => !i.is_published).length
    const paid = invitations.filter((i) => i.is_paid).length
    const unpaid = invitations.filter((i) => !i.is_paid).length
    const expired = invitations.filter((i) => isExpired(i.expires_at)).length
    return { all, live, draft, paid, unpaid, expired }
  }, [invitations])

  //  Filtering 

  const filtered = useMemo(() => {
    let result = invitations.filter((inv) => {
      const q = search.toLowerCase()
      const matchSearch =
        !q || inv.slug.toLowerCase().includes(q) || inv.user_email.toLowerCase().includes(q)

      let matchFilter = true
      switch (filter) {
        case 'live':
          matchFilter = inv.is_published && inv.is_paid
          break
        case 'draft':
          matchFilter = !inv.is_published
          break
        case 'paid':
          matchFilter = inv.is_paid
          break
        case 'unpaid':
          matchFilter = !inv.is_paid
          break
        case 'expired':
          matchFilter = isExpired(inv.expires_at)
          break
      }

      return matchSearch && matchFilter
    })

    // Sort
    result = [...result].sort((a, b) => {
      switch (sort) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'slug-az':
          return a.slug.localeCompare(b.slug)
        default:
          return 0
      }
    })

    return result
  }, [invitations, search, filter, sort])

  // Reset page when filter/search changes
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const safePage = Math.min(page, totalPages || 1)
  if (safePage !== page) setPage(safePage)

  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  //  Actions 

  async function handleTogglePaid(inv: AdminInvitation) {
    const key = inv.id + '-pay'
    setLoadingAction(key)
    try {
      await onOverridePaid(inv.id, !inv.is_paid)
    } finally {
      setLoadingAction(null)
    }
  }

  async function handleTogglePublish(inv: AdminInvitation) {
    const key = inv.id + '-pub'
    setLoadingAction(key)
    try {
      await onTogglePublished(inv.id, !inv.is_published)
    } finally {
      setLoadingAction(null)
    }
  }

  //  Filter config 

  const FILTERS: { id: InvFilter; label: string; count: number }[] = [
    { id: 'all', label: 'Semua', count: counts.all },
    { id: 'live', label: 'Live', count: counts.live },
    { id: 'draft', label: 'Draft', count: counts.draft },
    { id: 'paid', label: 'Lunas', count: counts.paid },
    { id: 'unpaid', label: 'Belum Bayar', count: counts.unpaid },
    { id: 'expired', label: 'Kadaluarsa', count: counts.expired },
  ]

  const SORTS: { id: SortMode; label: string }[] = [
    { id: 'newest', label: 'Terbaru' },
    { id: 'oldest', label: 'Terlama' },
    { id: 'slug-az', label: 'Slug A-Z' },
  ]

  //  Render 

  return (
    <div>
      {/* Header */}
      <div className="px-8 pt-8 pb-2">
        <h2 className="text-xl font-bold text-stone-900">Undangan</h2>
        <p className="text-sm text-stone-500 mt-1">
          {counts.all} total, {counts.live} aktif, {counts.draft} draft, {counts.unpaid} belum bayar
        </p>
      </div>

      <div className="px-8 pb-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <SummaryCard label="Total Undangan" count={counts.all} color="stone" icon={Mail} />
          <SummaryCard label="Live & Lunas" count={counts.live} color="green" icon={Zap} />
          <SummaryCard label="Draft" count={counts.draft} color="stone" icon={EyeOff} />
          <SummaryCard label="Belum Bayar" count={counts.unpaid} color="amber" icon={Clock} />
          <SummaryCard label="Kadaluarsa" count={counts.expired} color="red" icon={AlertCircle} />
        </div>

        {/* Toolbar: Filters + Search + Sort */}
        <div className="flex flex-col gap-3">
          {/* Filter pills */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="w-4 h-4 text-stone-400" />
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => { setFilter(f.id); setPage(1) }}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filter === f.id
                    ? 'bg-stone-800 text-white shadow-sm'
                    : 'bg-white border border-stone-200 text-stone-600 hover:border-stone-300 hover:text-stone-800'
                }`}
              >
                {f.label}
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    filter === f.id
                      ? 'bg-white/20 text-white'
                      : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Cari slug atau email..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                className="w-full pl-9 pr-4 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 bg-white placeholder:text-stone-400"
              />
            </div>
            <div className="relative">
              <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortMode)}
                className="pl-9 pr-8 py-2 text-sm border border-stone-200 rounded-xl bg-white text-stone-700 focus:outline-none focus:ring-2 focus:ring-stone-400 appearance-none cursor-pointer"
              >
                {SORTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Info note */}
        <p className="text-xs text-stone-400 flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Menandai lunas otomatis mem-publish undangan
        </p>

        {/* Invitation Cards */}
        {paginated.length > 0 ? (
          <div className="space-y-3">
            {paginated.map((inv) => (
              <div
                key={inv.id}
                className="flex items-start gap-4 px-5 py-4 border border-stone-200 rounded-xl bg-white hover:border-stone-300 hover:shadow-sm transition-all"
              >
                {/* Status dot */}
                <div className="pt-1.5">
                  <StatusDot inv={inv} />
                </div>

                {/* Main content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  {/* Row 1: Slug + Link + Template */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-sm text-stone-900 truncate">
                      /{inv.slug}
                    </span>
                    <a
                      href={`/?slug=${inv.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-400 hover:text-stone-600 transition-colors"
                      title="Lihat undangan"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <Badge variant="stone">{templateLabel(inv.template_id)}</Badge>
                  </div>

                  {/* Row 2: Email + time */}
                  <div className="flex items-center gap-3 text-xs text-stone-500">
                    <span className="truncate">{inv.user_email}</span>
                    <span className="text-stone-300">|</span>
                    <span>{timeAgo(inv.created_at)}</span>
                  </div>

                  {/* Row 3: Status badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={inv.is_paid ? 'green' : 'amber'}>
                      {inv.is_paid ? 'Lunas' : 'Belum Bayar'}
                    </Badge>
                    <Badge variant={inv.is_published ? 'blue' : 'stone'}>
                      {inv.is_published ? 'Live' : 'Draft'}
                    </Badge>
                    <ExpiryInfo expiresAt={inv.expires_at} />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Toggle paid */}
                  <button
                    onClick={() => handleTogglePaid(inv)}
                    disabled={loadingAction === inv.id + '-pay'}
                    title={inv.is_paid ? 'Revoke pembayaran' : 'Tandai lunas'}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                      inv.is_paid
                        ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
                        : 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    {loadingAction === inv.id + '-pay' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : inv.is_paid ? (
                      <Ban className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </button>

                  {/* Toggle publish */}
                  <button
                    onClick={() => handleTogglePublish(inv)}
                    disabled={loadingAction === inv.id + '-pub'}
                    title={inv.is_published ? 'Sembunyikan' : 'Publish'}
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                      inv.is_published
                        ? 'text-stone-400 hover:bg-stone-100 hover:text-stone-600'
                        : 'text-blue-400 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                  >
                    {loadingAction === inv.id + '-pub' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : inv.is_published ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}

            {/* Pagination */}
            <Pagination
              page={safePage}
              totalPages={totalPages}
              totalItems={filtered.length}
              onPageChange={setPage}
            />
          </div>
        ) : (
          /* Empty states */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-stone-400" />
            </div>
            {search || filter !== 'all' ? (
              <>
                <p className="text-sm font-medium text-stone-700">Tidak ada undangan yang cocok</p>
                <p className="text-xs text-stone-400 mt-1">
                  Coba sesuaikan filter atau kata kunci pencarian
                </p>
                <button
                  onClick={() => { setSearch(''); setFilter('all') }}
                  className="mt-3 text-xs font-medium text-stone-600 hover:text-stone-800 underline underline-offset-2"
                >
                  Reset filter
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-stone-700">Belum ada undangan</p>
                <p className="text-xs text-stone-400 mt-1">
                  Undangan akan muncul di sini setelah pengguna membuatnya
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
