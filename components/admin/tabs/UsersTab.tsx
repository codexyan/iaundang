'use client'

import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import {
  Users, Search, Trash2, ChevronLeft, ChevronRight,
  Filter, ArrowUpDown, ExternalLink, ChevronDown,
  KeyRound, Eye, Calendar, Package, Palette, Clock, Globe,
  CheckCircle2, XCircle, Loader2, Mail, AlertTriangle,
  Copy, Hash, X, EyeOff, Ban,
  MessageSquare, Send, LayoutDashboard, Zap,
} from 'lucide-react'

//  Types 

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

interface TicketReply {
  id: string
  message: string
  is_admin: boolean
  created_at: string
}

interface SupportTicket {
  id: string
  subject: string
  message: string
  status: string
  priority: string
  created_at: string
  closed_at: string | null
  replies: TicketReply[]
}

interface TemplateInfo {
  id: string
  name: string
}

interface AdminUser {
  id: string
  email: string
  role: string
  created_at: string
  invitations: AdminUserInvitation[]
  tickets?: SupportTicket[]
}

interface UsersTabProps {
  users: AdminUser[]
  templates: TemplateInfo[]
  onDelete: (id: string) => Promise<void>
  onOverridePaid: (invId: string, paid: boolean) => Promise<void>
  onTogglePublished: (invId: string, published: boolean) => Promise<void>
}

//  Helpers 

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
  if (!dateString) return ''
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
  popular: { label: 'Popular', color: 'text-blue-700', bg: 'bg-blue-100' },
  eksklusif: { label: 'Eksklusif', color: 'text-amber-700', bg: 'bg-amber-100' },
}

type FilterKey = 'all' | 'active' | 'expired' | 'unpaid' | 'no-template' | 'has-ticket'
type SortKey = 'newest' | 'oldest' | 'email-asc'

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'Semua' },
  { key: 'active', label: 'Aktif' },
  { key: 'expired', label: 'Kedaluwarsa' },
  { key: 'unpaid', label: 'Belum Bayar' },
  { key: 'no-template', label: 'Belum Beli' },
  { key: 'has-ticket', label: 'Ada Tiket' },
]

const ITEMS_PER_PAGE = 20

const TICKET_STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: 'Baru', color: 'text-blue-700', bg: 'bg-blue-100' },
  in_progress: { label: 'Diproses', color: 'text-amber-700', bg: 'bg-amber-100' },
  resolved: { label: 'Selesai', color: 'text-emerald-700', bg: 'bg-emerald-100' },
  closed: { label: 'Ditutup', color: 'text-stone-600', bg: 'bg-stone-100' },
}

//  Modal Backdrop 

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

//  Detail item sub-component 

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

//  Component 

export default function UsersTab({ users, templates, onDelete, onOverridePaid, onTogglePublished }: UsersTabProps) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sort, setSort] = useState<SortKey>('newest')
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detailTab, setDetailTab] = useState<'templates' | 'tickets'>('templates')

  // Modals
  const [resetModal, setResetModal] = useState<AdminUser | null>(null)
  const [deleteModal, setDeleteModal] = useState<AdminUser | null>(null)
  const [resetting, setResetting] = useState(false)
  const [resetResult, setResetResult] = useState<{ password: string; email: string } | null>(null)
  const [resetError, setResetError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  // Ticket reply
  const [replyingTicketId, setReplyingTicketId] = useState<string | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)
  const [localTickets, setLocalTickets] = useState<Record<string, SupportTicket[]>>({})

  const templateMap = useMemo(() => {
    const m = new Map<string, string>()
    templates.forEach((t) => m.set(t.id, t.name))
    return m
  }, [templates])

  const fetchUserTickets = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users?tickets_for=${userId}`)
      if (res.ok) {
        const data = await res.json()
        const user = data.users?.find((u: AdminUser) => u.id === userId)
        if (user?.tickets) {
          setLocalTickets(prev => ({ ...prev, [userId]: user.tickets }))
        }
      }
    } catch { /* ignore */ }
  }, [])

  const getUserTickets = useCallback((user: AdminUser): SupportTicket[] => {
    return localTickets[user.id] ?? user.tickets ?? []
  }, [localTickets])

  //  Stats 
  const stats = useMemo(() => {
    const total = users.length
    const withInvitation = users.filter((u) => u.invitations.length > 0).length
    const paid = users.filter((u) => u.invitations.some(i => i.is_paid)).length
    const active = users.filter((u) => u.invitations.some(i => i.is_paid && i.is_published)).length
    const noTemplate = total - withInvitation
    const expired = users.filter((u) => u.invitations.some(i => i.expires_at && isExpired(i.expires_at))).length
    const hasTicket = users.filter((u) => getUserTickets(u).some(t => t.status === 'open' || t.status === 'in_progress')).length
    return { total, withInvitation, paid, active, noTemplate, expired, hasTicket }
  }, [users, getUserTickets])

  //  Filtered + sorted list 
  const filtered = useMemo(() => {
    let list = [...users]
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((u) =>
        u.email.toLowerCase().includes(q) ||
        u.invitations.some(i => i.slug?.toLowerCase().includes(q)) ||
        u.id.toLowerCase().includes(q)
      )
    }
    if (filter === 'active') list = list.filter((u) => u.invitations.some(i => i.is_paid && i.is_published && (!i.expires_at || !isExpired(i.expires_at))))
    else if (filter === 'expired') list = list.filter((u) => u.invitations.some(i => i.expires_at && isExpired(i.expires_at)))
    else if (filter === 'unpaid') list = list.filter((u) => u.invitations.some(i => !i.is_paid))
    else if (filter === 'no-template') list = list.filter((u) => u.invitations.length === 0)
    else if (filter === 'has-ticket') list = list.filter((u) => getUserTickets(u).some(t => t.status === 'open' || t.status === 'in_progress'))

    list.sort((a, b) => {
      if (sort === 'email-asc') return a.email.localeCompare(b.email)
      const ta = new Date(a.created_at).getTime()
      const tb = new Date(b.created_at).getTime()
      return sort === 'newest' ? tb - ta : ta - tb
    })
    return list
  }, [users, search, filter, sort, getUserTickets])

  //  Pagination 
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE)
  const resetPage = () => setPage(1)

  //  Reset password (auto-generate) 
  function openResetModal(user: AdminUser) {
    setResetModal(user)
    setResetError(null)
    setResetResult(null)
  }

  async function doResetPassword() {
    if (!resetModal) return
    setResetting(true)
    setResetError(null)
    try {
      const res = await fetch(`/api/admin/users/${resetModal.id}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      const data = await res.json()
      if (!res.ok) {
        setResetError(data.error || 'Gagal reset password')
        return
      }
      setResetResult({ password: data.password, email: data.email })
    } catch {
      setResetError('Terjadi kesalahan jaringan')
    } finally {
      setResetting(false)
    }
  }

  //  Delete (modal with confirmation) 
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

  //  Copy ID 
  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text)
    setCopiedId(key)
    setTimeout(() => setCopiedId(null), 2000)
  }

  //  Ticket reply 
  async function sendTicketReply(ticketId: string, userId: string) {
    if (!replyMessage.trim()) return
    setSendingReply(true)
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage }),
      })
      if (res.ok) {
        setReplyMessage('')
        setReplyingTicketId(null)
        await fetchUserTickets(userId)
      }
    } finally {
      setSendingReply(false)
    }
  }

  async function updateTicketStatus(ticketId: string, status: string, userId: string) {
    await fetch(`/api/admin/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    await fetchUserTickets(userId)
  }

  //  Avatar & status helpers 
  function avatarColor(user: AdminUser): string {
    const primaryInv = user.invitations[0]
    if (primaryInv) {
      if (primaryInv.expires_at && isExpired(primaryInv.expires_at)) return 'bg-red-100 text-red-600'
      if (primaryInv.is_paid) return 'bg-emerald-100 text-emerald-700'
      return 'bg-amber-100 text-amber-700'
    }
    return 'bg-stone-100 text-stone-500'
  }

  function statusLabel(user: AdminUser): { text: string; color: string } {
    if (user.invitations.length === 0) return { text: 'Belum beli template', color: 'text-stone-400' }
    const primaryInv = user.invitations[0]
    if (primaryInv.expires_at && isExpired(primaryInv.expires_at)) return { text: 'Kedaluwarsa', color: 'text-red-500' }
    if (primaryInv.is_paid && primaryInv.is_published) return { text: 'Aktif & Live', color: 'text-emerald-600' }
    if (primaryInv.is_paid) return { text: 'Lunas, Draft', color: 'text-blue-600' }
    return { text: 'Belum Bayar', color: 'text-amber-600' }
  }

  const summaryCards = [
    { icon: Users, label: 'Total Pembeli', value: stats.total, color: 'text-stone-600', bg: 'bg-stone-50' },
    { icon: Zap, label: 'Aktif & Live', value: stats.active, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { icon: Package, label: 'Sudah Bayar', value: stats.paid, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: MessageSquare, label: 'Tiket Aktif', value: stats.hasTicket, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div>
      {/*  Header  */}
      <div className="px-8 py-5 border-b border-stone-200 bg-white">
        <h1 className="text-lg font-bold text-stone-900 tracking-tight">Pengguna</h1>
        <p className="text-xs text-stone-400 mt-0.5">
          {stats.total} pembeli &middot; {stats.active} aktif &middot; {stats.paid} lunas
          {stats.expired > 0 && <span className="text-red-500"> &middot; {stats.expired} kedaluwarsa</span>}
          {stats.hasTicket > 0 && <span className="text-orange-500"> &middot; {stats.hasTicket} tiket aktif</span>}
        </p>
      </div>

      <div className="p-8 space-y-6">
        {/*  Summary Cards  */}
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

        {/*  Filter + Search + Sort Row  */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-stone-400 mr-1 hidden sm:block" />
            {FILTERS.map((f) => {
              const count = f.key === 'all' ? stats.total
                : f.key === 'active' ? stats.active
                : f.key === 'expired' ? stats.expired
                : f.key === 'unpaid' ? stats.withInvitation - stats.paid
                : f.key === 'no-template' ? stats.noTemplate
                : stats.hasTicket
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
                placeholder="Cari email, subdomain, atau ID..."
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

        {/*  User Cards List  */}
        {paginated.length > 0 ? (
          <div className="space-y-2">
            {paginated.map((user) => {
              const isExpanded = expandedId === user.id
              const primaryInv = user.invitations[0] ?? null
              const tierInfo = primaryInv?.package_tier ? TIER_LABELS[primaryInv.package_tier] || { label: primaryInv.package_tier, color: 'text-stone-600', bg: 'bg-stone-100' } : null
              const expired = primaryInv ? isExpired(primaryInv.expires_at) : false
              const status = statusLabel(user)
              const tickets = getUserTickets(user)
              const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length

              return (
                <div
                  key={user.id}
                  className={`bg-white border rounded-xl transition-all ${
                    isExpanded ? 'border-stone-300 shadow-sm' : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {/*  Main row (clickable)  */}
                  <button
                    type="button"
                    onClick={() => {
                      if (!isExpanded) {
                        setDetailTab('templates')
                        fetchUserTickets(user.id)
                      }
                      setExpandedId(isExpanded ? null : user.id)
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 text-left"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${avatarColor(user)}`}>
                      {user.email[0].toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-stone-900 truncate block">
                        {user.email}
                        {user.invitations.length > 1 && (
                          <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-medium">
                            {user.invitations.length} template
                          </span>
                        )}
                      </span>
                      <p className="text-xs text-stone-400 mt-0.5">
                        Bergabung {timeAgo(user.created_at)}
                        <span className={`ml-2 font-medium ${status.color}`}>&middot; {status.text}</span>
                      </p>
                    </div>

                    {/* Quick badges (desktop) */}
                    <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                      {openTickets > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                          <MessageSquare className="w-3 h-3" />{openTickets}
                        </span>
                      )}
                      {primaryInv ? (
                        <>
                          <span className="inline-flex items-center gap-1 text-xs font-mono bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg">
                            <Globe className="w-3 h-3" />/{primaryInv.slug}
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
                        <span className="text-xs text-stone-400 italic">Belum beli template</span>
                      )}
                    </div>

                    <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Quick badges (mobile, collapsed only) */}
                  {!isExpanded && primaryInv && (
                    <div className="flex sm:hidden items-center gap-2 px-5 pb-3 flex-wrap">
                      <span className="inline-flex items-center gap-1 text-xs font-mono bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg">
                        <Globe className="w-3 h-3" />/{primaryInv.slug}
                      </span>
                      {tierInfo && (
                        <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${tierInfo.bg} ${tierInfo.color}`}>
                          {tierInfo.label}
                        </span>
                      )}
                    </div>
                  )}

                  {/*  Expanded detail panel  */}
                  {isExpanded && (
                    <div className="border-t border-stone-100">
                      {/* Account info */}
                      <div className="px-5 pt-4 pb-2">
                        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider mb-3">Informasi Akun</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                          <div className="flex items-center gap-2.5 p-2.5 bg-stone-50 rounded-lg">
                            <Hash className="w-4 h-4 text-stone-400 flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <p className="text-xs text-stone-400">User ID</p>
                              <div className="flex items-center gap-1.5">
                                <p className="text-xs font-mono text-stone-600 truncate">{user.id}</p>
                                <button
                                  onClick={(e) => { e.stopPropagation(); copyToClipboard(user.id, user.id) }}
                                  className="flex-shrink-0 text-stone-400 hover:text-stone-600 transition-colors"
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
                          <DetailItem icon={Package} label="Total Template" value={`${user.invitations.length} template dibeli`} />
                        </div>
                      </div>

                      {/*  Detail Tabs  */}
                      <div className="px-5 pt-3">
                        <div className="flex items-center gap-1 border-b border-stone-100">
                          <button
                            onClick={() => setDetailTab('templates')}
                            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                              detailTab === 'templates'
                                ? 'border-stone-900 text-stone-900'
                                : 'border-transparent text-stone-400 hover:text-stone-600'
                            }`}
                          >
                            <Palette className="w-3.5 h-3.5 inline mr-1.5" />
                            Template & Undangan ({user.invitations.length})
                          </button>
                          <button
                            onClick={() => setDetailTab('tickets')}
                            className={`px-4 py-2.5 text-xs font-medium border-b-2 transition-colors ${
                              detailTab === 'tickets'
                                ? 'border-stone-900 text-stone-900'
                                : 'border-transparent text-stone-400 hover:text-stone-600'
                            }`}
                          >
                            <MessageSquare className="w-3.5 h-3.5 inline mr-1.5" />
                            Tiket Support
                            {openTickets > 0 && (
                              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-orange-100 text-orange-700">
                                {openTickets}
                              </span>
                            )}
                          </button>
                        </div>
                      </div>

                      {/*  Template Tab Content  */}
                      {detailTab === 'templates' && (
                        <div className="px-5 py-4 space-y-3">
                          {user.invitations.length > 0 ? (
                            user.invitations.map((inv) => {
                              const invTier = inv.package_tier ? TIER_LABELS[inv.package_tier] || { label: inv.package_tier, color: 'text-stone-600', bg: 'bg-stone-100' } : null
                              const invExpired = isExpired(inv.expires_at)
                              const invDaysLeft = daysUntilExpiry(inv.expires_at)

                              return (
                                <div key={inv.id} className="border border-stone-200 rounded-xl p-4 space-y-3">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div className="flex items-center gap-2">
                                      <span className="inline-flex items-center gap-1 text-xs font-mono bg-stone-100 text-stone-600 px-2.5 py-1 rounded-lg">
                                        <Globe className="w-3 h-3" />/{inv.slug}
                                      </span>
                                      {invTier && (
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${invTier.bg} ${invTier.color}`}>
                                          {invTier.label}
                                        </span>
                                      )}
                                      {invExpired && (
                                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-red-100 text-red-600">Expired</span>
                                      )}
                                      {inv.is_paid && inv.is_published && !invExpired && (
                                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700">Live</span>
                                      )}
                                      {inv.is_paid && !inv.is_published && (
                                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">Draft</span>
                                      )}
                                      {!inv.is_paid && (
                                        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">Belum Bayar</span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <DetailItem icon={Palette} label="Template" value={templateMap.get(inv.template_id) || inv.template_id} />
                                    <DetailItem icon={Calendar} label="Dibuat" value={formatDate(inv.created_at)} />
                                    <DetailItem
                                      icon={Calendar}
                                      label="Masa Aktif Sampai"
                                      value={inv.expires_at ? formatDate(inv.expires_at) : 'Selamanya'}
                                      extra={
                                        inv.expires_at
                                          ? invExpired
                                            ? <span className="text-red-500 text-xs font-medium flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Kedaluwarsa</span>
                                            : invDaysLeft !== null && invDaysLeft <= 30
                                              ? <span className="text-amber-600 text-xs font-medium">{invDaysLeft} hari lagi</span>
                                              : invDaysLeft !== null
                                                ? <span className="text-emerald-600 text-xs">{invDaysLeft} hari tersisa</span>
                                                : null
                                          : null
                                      }
                                    />
                                    <DetailItem
                                      icon={Package}
                                      label="Pembayaran"
                                      value={inv.is_paid ? 'Lunas' : 'Belum Bayar'}
                                      valueColor={inv.is_paid ? 'text-emerald-600' : 'text-amber-600'}
                                    />
                                  </div>

                                  {/* Invitation action buttons */}
                                  <div className="flex flex-wrap items-center gap-2 pt-1">
                                    {inv.is_published && (
                                      <a
                                        href={`/${inv.slug}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" /> Lihat Undangan
                                      </a>
                                    )}
                                    <a
                                      href={`/dashboard?as=${user.id}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 px-3 py-2 rounded-lg border border-indigo-200 hover:bg-indigo-50 transition-colors"
                                    >
                                      <LayoutDashboard className="w-3.5 h-3.5" /> Masuk Dashboard
                                    </a>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation()
                                        setLoadingAction(inv.id + '-pay')
                                        try { await onOverridePaid(inv.id, !inv.is_paid) } finally { setLoadingAction(null) }
                                      }}
                                      disabled={loadingAction === inv.id + '-pay'}
                                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors disabled:opacity-50 ${
                                        inv.is_paid
                                          ? 'text-red-500 hover:text-red-600 border-red-200 hover:bg-red-50'
                                          : 'text-emerald-600 hover:text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                                      }`}
                                    >
                                      {loadingAction === inv.id + '-pay'
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        : inv.is_paid ? <Ban className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                                      {inv.is_paid ? 'Revoke Bayar' : 'Tandai Lunas'}
                                    </button>
                                    <button
                                      onClick={async (e) => {
                                        e.stopPropagation()
                                        setLoadingAction(inv.id + '-pub')
                                        try { await onTogglePublished(inv.id, !inv.is_published) } finally { setLoadingAction(null) }
                                      }}
                                      disabled={loadingAction === inv.id + '-pub'}
                                      className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border transition-colors disabled:opacity-50 ${
                                        inv.is_published
                                          ? 'text-stone-600 hover:text-stone-800 border-stone-200 hover:bg-stone-50'
                                          : 'text-indigo-600 hover:text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                                      }`}
                                    >
                                      {loadingAction === inv.id + '-pub'
                                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        : inv.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                      {inv.is_published ? 'Sembunyikan' : 'Publish'}
                                    </button>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg border border-stone-100">
                              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-stone-200/60">
                                <Package className="w-5 h-5 text-stone-400" />
                              </div>
                              <div>
                                <p className="text-sm text-stone-600 font-medium">Belum membeli template</p>
                                <p className="text-xs text-stone-400 mt-0.5">User terdaftar sejak {formatDateTime(user.created_at)} tapi belum membeli template apapun</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/*  Tickets Tab Content  */}
                      {detailTab === 'tickets' && (
                        <div className="px-5 py-4 space-y-3">
                          {tickets.length > 0 ? (
                            tickets.map((ticket) => {
                              const statusInfo = TICKET_STATUS_LABELS[ticket.status] || TICKET_STATUS_LABELS.open
                              const isReplying = replyingTicketId === ticket.id

                              return (
                                <div key={ticket.id} className="border border-stone-200 rounded-xl overflow-hidden">
                                  <div className="p-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-semibold text-stone-900">{ticket.subject}</h4>
                                        <p className="text-xs text-stone-400 mt-0.5">{timeAgo(ticket.created_at)}</p>
                                      </div>
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                                          {statusInfo.label}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-stone-600 leading-relaxed">{ticket.message}</p>

                                    {/* Replies */}
                                    {ticket.replies.length > 0 && (
                                      <div className="space-y-2 mt-3 pt-3 border-t border-stone-100">
                                        {ticket.replies.map((reply) => (
                                          <div key={reply.id} className={`p-3 rounded-lg text-sm ${
                                            reply.is_admin
                                              ? 'bg-indigo-50 border border-indigo-100'
                                              : 'bg-stone-50 border border-stone-100'
                                          }`}>
                                            <div className="flex items-center gap-2 mb-1">
                                              <span className={`text-xs font-semibold ${reply.is_admin ? 'text-indigo-700' : 'text-stone-600'}`}>
                                                {reply.is_admin ? 'Admin' : 'Pengguna'}
                                              </span>
                                              <span className="text-xs text-stone-400">{timeAgo(reply.created_at)}</span>
                                            </div>
                                            <p className="text-stone-700 leading-relaxed">{reply.message}</p>
                                          </div>
                                        ))}
                                      </div>
                                    )}

                                    {/* Reply input */}
                                    {isReplying && (
                                      <div className="mt-3 pt-3 border-t border-stone-100">
                                        <textarea
                                          placeholder="Tulis balasan..."
                                          value={replyMessage}
                                          onChange={(e) => setReplyMessage(e.target.value)}
                                          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 resize-none"
                                          rows={3}
                                          autoFocus
                                        />
                                        <div className="flex items-center justify-end gap-2 mt-2">
                                          <button
                                            onClick={() => { setReplyingTicketId(null); setReplyMessage('') }}
                                            className="px-3 py-1.5 text-xs font-medium text-stone-500 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors"
                                          >
                                            Batal
                                          </button>
                                          <button
                                            onClick={() => sendTicketReply(ticket.id, user.id)}
                                            disabled={sendingReply || !replyMessage.trim()}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                          >
                                            {sendingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                                            Kirim
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  {/* Ticket action bar */}
                                  <div className="flex items-center gap-2 px-4 py-2.5 bg-stone-50 border-t border-stone-100">
                                    {!isReplying && (
                                      <button
                                        onClick={() => { setReplyingTicketId(ticket.id); setReplyMessage('') }}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-colors"
                                      >
                                        <MessageSquare className="w-3.5 h-3.5" /> Balas
                                      </button>
                                    )}
                                    {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                                      <button
                                        onClick={() => updateTicketStatus(ticket.id, 'resolved', user.id)}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition-colors"
                                      >
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Selesai
                                      </button>
                                    )}
                                    {ticket.status !== 'closed' && (
                                      <button
                                        onClick={() => updateTicketStatus(ticket.id, 'closed', user.id)}
                                        className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-700 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
                                      >
                                        <X className="w-3.5 h-3.5" /> Tutup
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-lg border border-stone-100">
                              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-stone-200/60">
                                <MessageSquare className="w-5 h-5 text-stone-400" />
                              </div>
                              <div>
                                <p className="text-sm text-stone-600 font-medium">Tidak ada tiket support</p>
                                <p className="text-xs text-stone-400 mt-0.5">Pengguna ini belum pernah mengirim tiket bantuan</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/*  User Action Buttons  */}
                      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-t border-stone-100 bg-stone-50/50">
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
                <p className="text-sm text-stone-500 font-medium">Belum ada pembeli</p>
                <p className="text-xs text-stone-400 mt-1">Pengguna yang membeli template akan muncul di sini</p>
              </div>
            )}
          </div>
        )}

        {/*  Pagination  */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-stone-400">
              Menampilkan {(safePage - 1) * ITEMS_PER_PAGE + 1} s/d {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} dari {filtered.length} pengguna
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

      {/* 
          MODAL: Reset Password (Auto-generate)
          */}
      {resetModal && (
        <ModalBackdrop onClose={() => { setResetModal(null); setResetResult(null) }}>
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
              <button onClick={() => { setResetModal(null); setResetResult(null) }} className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors">
                <X className="w-4 h-4 text-stone-400" />
              </button>
            </div>

            <div className="px-6 py-5 space-y-4">
              {!resetResult ? (
                <>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                    <p className="text-xs text-amber-700 leading-relaxed">
                      <strong>Perhatian:</strong> Password lama akan diganti dengan password baru yang di-generate otomatis. Password baru akan dikirimkan ke email pengguna.
                    </p>
                  </div>

                  {resetError && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-lg">
                      <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                      <p className="text-xs text-red-700">{resetError}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <p className="text-xs text-emerald-700 font-medium">Password berhasil direset!</p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-lg">
                    <p className="text-xs text-stone-500 mb-2">Password baru untuk <strong>{resetResult.email}</strong>:</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm font-mono text-stone-900 select-all">
                        {resetResult.password}
                      </code>
                      <button
                        onClick={() => copyToClipboard(resetResult.password, 'reset-pw')}
                        className="px-3 py-2 text-xs font-medium text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
                      >
                        {copiedId === 'reset-pw' ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[11px] text-stone-400 mt-2">
                      <Mail className="w-3 h-3 inline mr-1" />
                      Password baru akan dikirim ke email pengguna
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-stone-100 bg-stone-50 rounded-b-2xl">
              {!resetResult ? (
                <>
                  <button
                    onClick={() => setResetModal(null)}
                    className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-800 rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    onClick={doResetPassword}
                    disabled={resetting}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {resetting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                    {resetting ? 'Mereset...' : 'Generate & Reset Password'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => { setResetModal(null); setResetResult(null) }}
                  className="px-4 py-2 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors"
                >
                  Selesai
                </button>
              )}
            </div>
          </div>
        </ModalBackdrop>
      )}

      {/* 
          MODAL: Delete User Confirmation
          */}
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
                  {deleteModal.invitations.length > 0 && (
                    <>
                      <li>
                        {deleteModal.invitations.length} undangan:{' '}
                        {deleteModal.invitations.map(i => <strong key={i.id} className="font-mono">/{i.slug}</strong>).reduce((prev, curr, idx) => idx === 0 ? [curr] : [...prev, ', ', curr], [] as React.ReactNode[])}
                      </li>
                      <li>Seluruh data undangan (tamu, ucapan, galeri, RSVP)</li>
                      <li>Riwayat pembayaran terkait akun ini</li>
                    </>
                  )}
                  {deleteModal.invitations.length === 0 && (
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
