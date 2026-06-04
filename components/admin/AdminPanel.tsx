'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, Users, Mail, ShoppingCart, Settings, LogOut,
  TrendingUp, CheckCircle2, Clock, Trash2, Eye, EyeOff, Search,
  Save, Crown, AlertCircle, ExternalLink, Ban,
  ToggleLeft, ToggleRight, Package, CreditCard, FlaskConical,
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'
import { TEMPLATES } from '@/lib/types'
import type { AdminTemplateConfig, BankAccount, PaymentProof } from '@/lib/db'
import type { TemplateRecord, TemplateCategory, ColorPalette } from '@/lib/types'
import TemplatesTab from './tabs/TemplatesTab'
import PaymentTab from './tabs/PaymentTab'
import TemplateLab from './tabs/TemplateLab'

// ─── Types ────────────────────────────────────────────────────

interface AdminUserInvitation {
  id: string
  slug: string
  template_id: string
  is_published: boolean
  is_paid: boolean
  expires_at: string | null
  created_at: string
}

interface AdminUser {
  id: string
  email: string
  created_at: string
  invitation: AdminUserInvitation | null
}

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

interface AdminOrder {
  id?: string
  order_id?: string
  amount?: number
  status?: string
  payment_type?: string
  created_at?: string
}

interface LocalAppSettings {
  price: number
  packageName: string
  packageDuration: number
  templates: AdminTemplateConfig[]
  categories: TemplateCategory[]
  colorPalettes: ColorPalette[]
  bankAccounts: BankAccount[]
  qrisImageUrl: string
  paymentInstructions: string
  confirmationWhatsapp: string
}

interface Stats {
  totalUsers: number
  totalInvitations: number
  totalActive: number
  totalPaid: number
  totalUnpaid: number
  totalRevenue: number
}

interface Props {
  users: AdminUser[]
  invitations: AdminInvitation[]
  orders: AdminOrder[]
  proofs: PaymentProof[]
  stats: Stats
  settings: LocalAppSettings
  templateRecords: TemplateRecord[]
  adminEmail: string
}

type NavTab = 'dashboard' | 'users' | 'invitations' | 'template' | 'lab' | 'orders' | 'payment' | 'settings'

const VALID_TABS: NavTab[] = ['dashboard', 'users', 'invitations', 'template', 'lab', 'orders', 'payment', 'settings']

// ─── Main Component ───────────────────────────────────────────

export default function AdminPanel({
  users: initialUsers,
  invitations: initialInvitations,
  orders,
  proofs: initialProofs,
  stats: initialStats,
  settings: initialSettings,
  templateRecords: initialTemplateRecords,
  adminEmail,
}: Props) {
  const [templateRecords, setTemplateRecords] = useState<TemplateRecord[]>(initialTemplateRecords)
  // Selalu mulai dengan 'dashboard' agar server & client match (hindari hydration error).
  // URL dibaca di useEffect setelah hydration selesai.
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')

  // Baca URL setelah hydration + sinkronisasi back/forward
  useEffect(() => {
    function syncFromUrl() {
      const p = new URLSearchParams(window.location.search).get('tab') as NavTab
      setActiveTab(VALID_TABS.includes(p) ? p : 'dashboard')
    }
    syncFromUrl()
    window.addEventListener('popstate', syncFromUrl)
    return () => window.removeEventListener('popstate', syncFromUrl)
  }, [])

  // Sync URL saat klik tab
  function handleTabChange(tab: NavTab) {
    setActiveTab(tab)
    const url = new URL(window.location.href)
    url.searchParams.set('tab', tab)
    window.history.pushState({}, '', url.toString())
  }
  const [users, setUsers] = useState(initialUsers)
  const [invitations, setInvitations] = useState(initialInvitations)
  const [proofs, setProofs] = useState(initialProofs)
  const [stats, setStats] = useState(initialStats)
  const [appSettings, setAppSettings] = useState(initialSettings)

  function recalc(invs: AdminInvitation[], usrs: AdminUser[], price = appSettings.price) {
    const paid = invs.filter((i) => i.is_paid)
    setStats({
      totalUsers: usrs.length,
      totalInvitations: invs.length,
      totalActive: invs.filter((i) => i.is_published && i.is_paid).length,
      totalPaid: paid.length,
      totalUnpaid: invs.filter((i) => !i.is_paid).length,
      totalRevenue: paid.length * price,
    })
  }

  async function handleOverridePaid(invId: string, paid: boolean) {
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + appSettings.packageDuration)

    const res = await fetch(`/api/admin/invitations/${invId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_paid: paid,
        ...(paid ? { is_published: true, expires_at: expiresAt.toISOString() } : {}),
      }),
    })
    if (!res.ok) { toast.error('Gagal update status'); return }

    const newInvs = invitations.map((i) =>
      i.id === invId
        ? { ...i, is_paid: paid, ...(paid ? { is_published: true, expires_at: expiresAt.toISOString() } : {}) }
        : i
    )
    const newUsers = users.map((u) =>
      u.invitation?.id === invId
        ? { ...u, invitation: { ...u.invitation, is_paid: paid } }
        : u
    )
    setInvitations(newInvs)
    setUsers(newUsers)
    recalc(newInvs, newUsers)
    toast.success(paid ? '✓ Ditandai lunas & dipublish' : 'Status direset ke belum bayar')
  }

  async function handleTogglePublished(invId: string, published: boolean) {
    const res = await fetch(`/api/admin/invitations/${invId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_published: published }),
    })
    if (!res.ok) { toast.error('Gagal update'); return }

    const newInvs = invitations.map((i) =>
      i.id === invId ? { ...i, is_published: published } : i
    )
    setInvitations(newInvs)
    recalc(newInvs, users)
    toast.success(published ? 'Undangan dipublish' : 'Undangan di-draft')
  }

  async function handleDeleteUser(userId: string) {
    const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error || 'Gagal hapus user')
      return
    }
    const newUsers = users.filter((u) => u.id !== userId)
    const newInvs = invitations.filter((i) => i.user_id !== userId)
    setUsers(newUsers)
    setInvitations(newInvs)
    recalc(newInvs, newUsers)
    toast.success('User dihapus')
  }

  async function handleSaveSettings(newSettings: LocalAppSettings) {
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSettings),
    })
    if (!res.ok) { toast.error('Gagal simpan pengaturan'); return }
    setAppSettings(newSettings)
    recalc(invitations, users, newSettings.price)
    toast.success('Pengaturan tersimpan!')
  }

  async function handleProofReview(proofId: string, status: 'approved' | 'rejected', notes: string) {
    const res = await fetch(`/api/admin/proofs/${proofId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, admin_notes: notes, packageDuration: appSettings.packageDuration }),
    })
    if (!res.ok) { toast.error('Gagal memproses'); return }
    const updatedProofs = proofs.map((p) => p.id === proofId ? { ...p, status, admin_notes: notes, reviewed_at: new Date().toISOString() } : p)
    setProofs(updatedProofs)
    if (status === 'approved') {
      const proof = proofs.find((p) => p.id === proofId)
      if (proof) {
        const newInvs = invitations.map((i) => i.id === proof.invitation_id ? { ...i, is_paid: true, is_published: true } : i)
        setInvitations(newInvs)
        recalc(newInvs, users)
      }
      toast.success('Transfer disetujui! Undangan langsung aktif.')
    } else {
      toast.success('Transfer ditolak. User akan diberitahu.')
    }
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const pendingProofs = proofs.filter((p) => p.status === 'pending').length

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        adminEmail={adminEmail}
        onLogout={handleLogout}
        stats={stats}
        pendingProofs={pendingProofs}
      />

      <main className={`flex-1 ${activeTab === 'lab' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
        {activeTab === 'dashboard' && (
          <DashboardTab stats={stats} users={users} invitations={invitations} pendingProofs={pendingProofs} />
        )}
        {activeTab === 'users' && (
          <UsersTab users={users} adminEmail={adminEmail} onDelete={handleDeleteUser} />
        )}
        {activeTab === 'invitations' && (
          <InvitationsTab
            invitations={invitations}
            onOverridePaid={handleOverridePaid}
            onTogglePublished={handleTogglePublished}
          />
        )}
        {activeTab === 'template' && (
          <TemplatesTab
            records={templateRecords}
            onRecordsUpdate={(recs) => setTemplateRecords(recs)}
            onGoToLab={() => handleTabChange('lab')}
            globalPrice={appSettings.price}
            packageName={appSettings.packageName}
            packageDuration={appSettings.packageDuration}
            onPricingUpdate={(pricing) => handleSaveSettings({ ...appSettings, ...pricing })}
          />
        )}
        {activeTab === 'lab' && (
          <TemplateLab
            onGoToManagement={() => handleTabChange('template')}
            categories={appSettings.categories}
            palettes={appSettings.colorPalettes}
          />
        )}
        {activeTab === 'orders' && <OrdersTab orders={orders} />}
        {activeTab === 'payment' && (
          <PaymentTab
            config={{
              bankAccounts: appSettings.bankAccounts,
              qrisImageUrl: appSettings.qrisImageUrl,
              paymentInstructions: appSettings.paymentInstructions,
              confirmationWhatsapp: appSettings.confirmationWhatsapp,
            }}
            proofs={proofs}
            packageDuration={appSettings.packageDuration}
            onConfigUpdate={(cfg) => setAppSettings({ ...appSettings, ...cfg })}
            onProofReview={handleProofReview}
          />
        )}
        {activeTab === 'settings' && (
          <SettingsTab settings={appSettings} onSave={handleSaveSettings} />
        )}
      </main>
    </div>
  )
}

// ─── Sidebar ─────────────────────────────────────────────────

const NAV_GROUPS = [
  {
    label: 'Utama',
    items: [
      { id: 'dashboard'   as NavTab, label: 'Dashboard',          icon: LayoutDashboard, desc: 'Statistik & aktivitas' },
      { id: 'users'       as NavTab, label: 'Pengguna',           icon: Users,           desc: 'Kelola akun user' },
      { id: 'invitations' as NavTab, label: 'Undangan',           icon: Mail,            desc: 'Semua undangan' },
    ],
  },
  {
    label: 'Template',
    items: [
      { id: 'lab'         as NavTab, label: 'Studio Desain',      icon: FlaskConical,    desc: 'Buat & eksperimen template' },
      { id: 'template'    as NavTab, label: 'Manajemen',          icon: Package,         desc: 'Review, harga & publikasi tema' },
    ],
  },
  {
    label: 'Transaksi',
    items: [
      { id: 'payment'     as NavTab, label: 'Pembayaran',         icon: CreditCard,      desc: 'Bank, QRIS & verifikasi' },
      { id: 'orders'      as NavTab, label: 'Pesanan',            icon: ShoppingCart,    desc: 'Riwayat transaksi' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { id: 'settings'    as NavTab, label: 'Pengaturan',         icon: Settings,        desc: 'Info & panduan modul' },
    ],
  },
]

function Sidebar({
  activeTab, onTabChange, adminEmail, onLogout, stats, pendingProofs,
}: {
  activeTab: NavTab
  onTabChange: (t: NavTab) => void
  adminEmail: string
  onLogout: () => void
  stats: Stats
  pendingProofs: number
}) {
  return (
    <aside className="w-52 flex flex-col shrink-0 border-r border-gray-100 bg-white">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
            <Crown className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-none">Akundang</p>
            <p className="text-gray-400 text-[10px] mt-0.5">Admin Console</p>
          </div>
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest px-2 mb-1">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(({ id, label, icon: Icon, desc }) => {
                const isActive = activeTab === id
                const badge =
                  id === 'users'       ? (stats.totalUsers   > 0 ? stats.totalUsers   : null) :
                  id === 'invitations' ? (stats.totalUnpaid  > 0 ? stats.totalUnpaid  : null) :
                  id === 'payment'     ? (pendingProofs      > 0 ? pendingProofs      : null) : null
                return (
                  <button
                    key={id}
                    data-tab={id}
                    onClick={() => onTabChange(id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-all ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-indigo-600' : ''}`} />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{label}</p>
                      {desc && <p className={`text-[9px] mt-0.5 truncate ${isActive ? 'text-indigo-500' : 'text-gray-400'}`}>{desc}</p>}
                    </div>
                    {badge != null && (
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none shrink-0 ${
                        id === 'payment' ? 'bg-red-100 text-red-600 animate-pulse' :
                        id === 'invitations' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2 px-2 py-2 rounded-lg bg-gray-50 mb-1">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-indigo-600 uppercase">
              {adminEmail.charAt(0)}
            </span>
          </div>
          <p className="text-[10px] text-gray-500 truncate flex-1">{adminEmail}</p>
        </div>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 text-xs font-medium transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Keluar
        </button>
      </div>
    </aside>
  )
}

// ─── Page Header ─────────────────────────────────────────────

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-8 py-5 border-b border-gray-100 bg-white">
      <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, color, accent,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  accent?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-black text-gray-900 tabular-nums">{value}</p>
      {accent && (
        <div className={`h-0.5 rounded-full mt-3 ${accent}`} />
      )}
    </div>
  )
}

// ─── Badge ───────────────────────────────────────────────────

function Badge({ variant, children }: { variant: 'green' | 'yellow' | 'red' | 'gray' | 'blue'; children: React.ReactNode }) {
  const styles = {
    green: 'bg-emerald-100 text-emerald-700',
    yellow: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    gray: 'bg-gray-100 text-gray-600',
    blue: 'bg-blue-100 text-blue-700',
  }
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full ${styles[variant]}`}>
      {children}
    </span>
  )
}

// ─── Dashboard Tab ───────────────────────────────────────────

function DashboardTab({
  stats, users, invitations, pendingProofs,
}: {
  stats: Stats
  users: AdminUser[]
  invitations: AdminInvitation[]
  pendingProofs: number
}) {
  const recentUsers = [...users].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5)

  const recentInvitations = [...invitations].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5)

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Ringkasan aktivitas platform Akundang" />
      <div className="p-8 space-y-8">
        {/* Alert bukti transfer pending */}
        {pendingProofs > 0 && (
          <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                {pendingProofs} bukti transfer menunggu verifikasi
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Segera verifikasi agar undangan user bisa aktif.
              </p>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          <StatCard label="Total Pengguna"    value={stats.totalUsers}              icon={Users}         color="bg-blue-100 text-blue-600"     accent="bg-blue-400" />
          <StatCard label="Total Undangan"    value={stats.totalInvitations}        icon={Mail}          color="bg-purple-100 text-purple-600" accent="bg-purple-400" />
          <StatCard label="Aktif & Lunas"     value={stats.totalActive}             icon={CheckCircle2}  color="bg-emerald-100 text-emerald-600" accent="bg-emerald-400" />
          <StatCard label="Belum Bayar"       value={stats.totalUnpaid}             icon={AlertCircle}   color="bg-amber-100 text-amber-600"   accent="bg-amber-400" />
          <StatCard label="Total Lunas"       value={stats.totalPaid}               icon={TrendingUp}    color="bg-indigo-100 text-indigo-600" accent="bg-indigo-400" />
          <StatCard label="Total Pendapatan"  value={formatPrice(stats.totalRevenue)} icon={Crown}       color="bg-yellow-100 text-yellow-600" accent="bg-yellow-400" />
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Pengguna Terbaru</h3>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="divide-y divide-gray-50">
              {recentUsers.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">Belum ada pengguna</p>
              )}
              {recentUsers.map((u) => (
                <div key={u.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{u.email}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  {u.invitation ? (
                    <Badge variant={u.invitation.is_paid ? 'green' : 'yellow'}>
                      {u.invitation.is_paid ? 'Lunas' : 'Belum bayar'}
                    </Badge>
                  ) : (
                    <Badge variant="gray">Belum buat</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Recent Invitations */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 text-sm">Undangan Terbaru</h3>
              <Mail className="w-4 h-4 text-gray-400" />
            </div>
            <div className="divide-y divide-gray-50">
              {recentInvitations.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">Belum ada undangan</p>
              )}
              {recentInvitations.map((inv) => (
                <div key={inv.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">/{inv.slug}</p>
                    <p className="text-xs text-gray-400 mt-0.5 truncate">{inv.user_email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={inv.is_paid ? 'green' : 'yellow'}>
                      {inv.is_paid ? 'Lunas' : 'Unpaid'}
                    </Badge>
                    <Badge variant={inv.is_published ? 'blue' : 'gray'}>
                      {inv.is_published ? 'Live' : 'Draft'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Users Tab ───────────────────────────────────────────────

function UsersTab({
  users, adminEmail, onDelete,
}: {
  users: AdminUser[]
  adminEmail: string
  onDelete: (id: string) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const filtered = users.filter((u) =>
    u.email.toLowerCase().includes(search.toLowerCase())
  )

  async function doDelete(id: string) {
    setDeleting(true)
    await onDelete(id)
    setDeleting(false)
    setConfirmId(null)
  }

  return (
    <div>
      <PageHeader
        title="Manajemen Pengguna"
        subtitle={`${users.length} pengguna terdaftar`}
      />
      <div className="p-8 space-y-5">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
          />
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Bergabung</th>
                <th className="text-left px-5 py-3 font-medium">Undangan</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">{u.email}</span>
                      {u.email === adminEmail && (
                        <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-medium">Admin</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-gray-500">
                    {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4">
                    {u.invitation ? (
                      <span className="font-mono text-gray-700">/{u.invitation.slug}</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {u.invitation ? (
                      <Badge variant={u.invitation.is_paid ? 'green' : 'yellow'}>
                        {u.invitation.is_paid ? '✓ Lunas' : 'Belum bayar'}
                      </Badge>
                    ) : (
                      <Badge variant="gray">Belum buat undangan</Badge>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {u.email === adminEmail ? (
                      <span className="text-gray-300 text-xs">—</span>
                    ) : confirmId === u.id ? (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => doDelete(u.id)}
                          disabled={deleting}
                          className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 disabled:opacity-50 font-medium"
                        >
                          {deleting ? 'Menghapus...' : 'Ya, hapus'}
                        </button>
                        <button
                          onClick={() => setConfirmId(null)}
                          className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1.5"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmId(u.id)}
                        className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Hapus
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-10 text-sm">
              {search ? 'Tidak ada pengguna yang cocok' : 'Belum ada pengguna'}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Invitations Tab ─────────────────────────────────────────

type InvFilter = 'all' | 'paid' | 'unpaid' | 'published' | 'draft'

function InvitationsTab({
  invitations,
  onOverridePaid,
  onTogglePublished,
}: {
  invitations: AdminInvitation[]
  onOverridePaid: (id: string, paid: boolean) => Promise<void>
  onTogglePublished: (id: string, published: boolean) => Promise<void>
}) {
  const [filter, setFilter] = useState<InvFilter>('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = invitations.filter((inv) => {
    const matchSearch =
      inv.slug.includes(search.toLowerCase()) ||
      inv.user_email.toLowerCase().includes(search.toLowerCase())

    const matchFilter =
      filter === 'all' ||
      (filter === 'paid' && inv.is_paid) ||
      (filter === 'unpaid' && !inv.is_paid) ||
      (filter === 'published' && inv.is_published) ||
      (filter === 'draft' && !inv.is_published)

    return matchSearch && matchFilter
  })

  const FILTERS: { id: InvFilter; label: string }[] = [
    { id: 'all', label: 'Semua' },
    { id: 'unpaid', label: 'Belum Bayar' },
    { id: 'paid', label: 'Lunas' },
    { id: 'published', label: 'Live' },
    { id: 'draft', label: 'Draft' },
  ]

  async function togglePaid(inv: AdminInvitation) {
    setLoading(inv.id + '-pay')
    await onOverridePaid(inv.id, !inv.is_paid)
    setLoading(null)
  }

  async function togglePublish(inv: AdminInvitation) {
    setLoading(inv.id + '-pub')
    await onTogglePublished(inv.id, !inv.is_published)
    setLoading(null)
  }

  function templateLabel(id: string) {
    const found = TEMPLATES.find((t) => t.id === id)
    return found ? found.name : id
  }

  return (
    <div>
      <PageHeader
        title="Manajemen Undangan"
        subtitle={`${invitations.length} undangan dibuat`}
      />
      <div className="p-8 space-y-5">
        {/* Filters + Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  filter === f.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari slug atau email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white w-64"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Slug</th>
                <th className="text-left px-5 py-3 font-medium">Template</th>
                <th className="text-left px-5 py-3 font-medium">Pengguna</th>
                <th className="text-left px-5 py-3 font-medium">Bayar</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Kadaluarsa</th>
                <th className="text-left px-5 py-3 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-medium text-gray-900">/{inv.slug}</span>
                      <a
                        href={`/?slug=${inv.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Lihat undangan"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(inv.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </td>
                  <td className="px-5 py-4 text-gray-600">{templateLabel(inv.template_id)}</td>
                  <td className="px-5 py-4 text-gray-600 text-xs">{inv.user_email}</td>
                  <td className="px-5 py-4">
                    <Badge variant={inv.is_paid ? 'green' : 'yellow'}>
                      {inv.is_paid ? '✓ Lunas' : 'Belum'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4">
                    <Badge variant={inv.is_published ? 'blue' : 'gray'}>
                      {inv.is_published ? 'Live' : 'Draft'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {inv.expires_at
                      ? new Date(inv.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      {/* Toggle Paid */}
                      <button
                        onClick={() => togglePaid(inv)}
                        disabled={loading === inv.id + '-pay'}
                        title={inv.is_paid ? 'Revoke pembayaran' : 'Tandai lunas'}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          inv.is_paid
                            ? 'text-red-400 hover:bg-red-50 hover:text-red-600'
                            : 'text-emerald-500 hover:bg-emerald-50 hover:text-emerald-700'
                        }`}
                      >
                        {inv.is_paid ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                      </button>

                      {/* Toggle Published */}
                      <button
                        onClick={() => togglePublish(inv)}
                        disabled={loading === inv.id + '-pub'}
                        title={inv.is_published ? 'Sembunyikan' : 'Publish'}
                        className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                          inv.is_published
                            ? 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                            : 'text-blue-400 hover:bg-blue-50 hover:text-blue-600'
                        }`}
                      >
                        {inv.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-10 text-sm">
              {search || filter !== 'all' ? 'Tidak ada undangan yang cocok' : 'Belum ada undangan'}
            </p>
          )}
        </div>

        {/* Legend */}
        <div className="flex gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Tandai lunas + publish
          </span>
          <span className="flex items-center gap-1.5">
            <Ban className="w-3.5 h-3.5 text-red-400" /> Revoke status lunas
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-blue-400" /> Toggle publish/draft
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── Orders Tab ──────────────────────────────────────────────

function OrdersTab({ orders }: { orders: AdminOrder[] }) {
  return (
    <div>
      <PageHeader title="Pesanan" subtitle="Data transaksi pembayaran" />
      <div className="p-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Order ID</th>
                <th className="text-left px-5 py-3 font-medium">Jumlah</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Metode</th>
                <th className="text-left px-5 py-3 font-medium">Tanggal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {orders.map((o, i) => (
                <tr key={o.order_id ?? i} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-mono text-xs text-gray-600">{o.order_id ?? '—'}</td>
                  <td className="px-5 py-4 font-medium">{o.amount ? formatPrice(o.amount) : '—'}</td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={
                        o.status === 'success' ? 'green'
                        : o.status === 'pending' ? 'yellow'
                        : o.status === 'failed' ? 'red'
                        : 'gray'
                      }
                    >
                      {o.status ?? '—'}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{o.payment_type ?? '—'}</td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {o.created_at
                      ? new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-16">
              <ShoppingCart className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Belum ada pesanan</p>
              <p className="text-gray-300 text-xs mt-1">Payment akan aktif di Minggu 4</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Settings Tab ─────────────────────────────────────────────

function SettingsTab({
  settings,
  onSave,
}: {
  settings: LocalAppSettings
  onSave: (s: LocalAppSettings) => Promise<void>
}) {
  // Settings hanya untuk info sistem — harga & paket pindah ke Manajemen Template

  return (
    <div>
      <PageHeader title="Pengaturan" subtitle="Informasi sistem — harga & template dikelola di modul masing-masing" />
      <div className="p-8 max-w-xl space-y-4">

        {/* Panduan modul */}
        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: '🎨', tab: 'lab', title: 'Template Lab', desc: 'Desain & eksperimen template baru. Rilis ke Manajemen saat siap.', color: 'indigo' },
            { icon: '📦', tab: 'template', title: 'Manajemen Template', desc: 'Atur harga, paket akses, dan aktifkan template untuk user.', color: 'purple' },
            { icon: '💳', tab: 'payment', title: 'Pembayaran', desc: 'Rekening bank, QRIS, instruksi bayar, dan verifikasi bukti transfer.', color: 'emerald' },
          ].map(item => (
            <div key={item.tab} className={`flex items-center gap-4 p-4 rounded-2xl border bg-${item.color}-50 border-${item.color}-200`}>
              <span className="text-2xl">{item.icon}</span>
              <div className="flex-1">
                <p className={`text-sm font-bold text-${item.color}-800`}>{item.title}</p>
                <p className={`text-xs text-${item.color}-600 mt-0.5`}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <p className="text-sm font-semibold text-gray-700 mb-3">Info Konfigurasi</p>
          <div className="space-y-2 text-xs text-gray-500">
            <p>Tidak ada pengaturan yang bisa diubah di halaman ini.</p>
            <p>Semua konfigurasi penting sudah dipindahkan ke modul yang relevan di atas untuk memudahkan navigasi.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
