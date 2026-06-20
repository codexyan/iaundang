'use client'

import { useState, useEffect, useRef } from 'react'
import toast from 'react-hot-toast'
import {
  LayoutDashboard, Users, ShoppingCart, Settings, LogOut,
  Globe, Music, Package, CreditCard, FlaskConical,
  PanelLeftClose, PanelLeftOpen, AlertTriangle, X, Megaphone,
  FileText, PenLine, Home, ExternalLink,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'
import type { AdminTemplateConfig, BankAccount, PaymentProof } from '@/lib/db'
import type { TemplateRecord, TemplateCategory, ColorPalette, PriceTier, FlashSale, Coupon } from '@/lib/types'
import DashboardTab from './tabs/DashboardTab'
import UsersTab from './tabs/UsersTab'
// InvitationsTab merged into UsersTab
import TemplatesTab from './tabs/TemplatesTab'
import PaymentTab from './tabs/PaymentTab'
import TemplateLab from './tabs/TemplateLab'
import MusicLibraryTab from './tabs/MusicLibraryTab'
import LandingPageTab from './tabs/LandingPageTab'
import ArticlesTab from './tabs/ArticlesTab'
import WriterTab from './tabs/WriterTab'
import AffiliatesTab from './tabs/AffiliatesTab'
// PackagesTab removed  tier management consolidated into TemplatesTab config drawer
import NewSettingsTab from './tabs/SettingsTab'
import type { SiteSettings } from './tabs/SettingsTab'

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

interface AdminUser {
  id: string
  email: string
  role: string
  created_at: string
  invitations: AdminUserInvitation[]
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
  priceTiers: PriceTier[]
  flashSales: FlashSale[]
  coupons: Coupon[]
  deletedCategoryIds: string[]
  deletedTierIds: string[]
  bankAccounts: BankAccount[]
  qrisImageUrl: string
  paymentInstructions: string
  confirmationWhatsapp: string
  siteName: string
  siteTagline: string
  logoHorizontalUrl: string
  logoVerticalUrl: string
  contactEmail: string
  socialInstagram: string
  socialTwitter: string
  socialGithub: string
  appDomain: string
  demoSubdomain: string
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

type NavTab = 'dashboard' | 'users' | 'template' | 'lab' | 'music' | 'orders' | 'payment' | 'landing' | 'articles' | 'writers' | 'affiliates' | 'settings'

const VALID_TABS: NavTab[] = ['dashboard', 'users', 'template', 'lab', 'music', 'orders', 'payment', 'landing', 'articles', 'writers', 'affiliates', 'settings']

//  Main Component 

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
  const [labEditRecord, setLabEditRecord] = useState<TemplateRecord | null>(null)
  const [labDirty, setLabDirty] = useState(false)
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [pendingTab, setPendingTab] = useState<NavTab | null>(null)
  const [transitioning, setTransitioning] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)

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

  // Browser close/refresh guard
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (labDirty) { e.preventDefault() }
    }
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [labDirty])

  function handleTabChange(tab: NavTab) {
    if (tab === activeTab) return
    if (activeTab === 'lab' && labDirty && tab !== 'lab') {
      setPendingTab(tab)
      return
    }
    applyTabChange(tab)
  }

  function applyTabChange(tab: NavTab) {
    setTransitioning(true)
    setTimeout(() => {
      setActiveTab(tab)
      const url = new URL(window.location.href)
      url.searchParams.set('tab', tab)
      window.history.pushState({}, '', url.toString())
      requestAnimationFrame(() => setTransitioning(false))
    }, 150)
  }

  function confirmLeaveStudio() {
    setLabDirty(false)
    const tab = pendingTab!
    setPendingTab(null)
    applyTabChange(tab)
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
    const newUsers = users.map((u) => ({
      ...u,
      invitations: u.invitations.map((inv) =>
        inv.id === invId ? { ...inv, is_paid: paid } : inv
      ),
    }))
    setInvitations(newInvs)
    setUsers(newUsers)
    recalc(newInvs, newUsers)
    toast.success(paid ? '�� Ditandai lunas & dipublish' : 'Status direset ke belum bayar')
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

  async function handleChangeRole(userId: string, role: string) {
    const res = await fetch(`/api/admin/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    })
    if (!res.ok) {
      const data = await res.json()
      toast.error(data.error || 'Gagal ubah role')
      return
    }
    setUsers(users.map(u => u.id === userId ? { ...u, role } : u))
    toast.success(`Role diubah ke ${role}`)
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
        siteName={appSettings.siteName ?? 'iaundang'}
        logoVerticalUrl={appSettings.logoVerticalUrl ?? '/logos/logo-vertical.png'}
      />

      <main className={`flex-1 ${activeTab === 'lab' ? 'overflow-hidden flex flex-col' : 'overflow-y-auto'}`}>
        <div
          ref={contentRef}
          className={`h-full transition-opacity duration-150 ease-in-out ${transitioning ? 'opacity-0 translate-y-1' : 'opacity-100 translate-y-0'}`}
          style={{ transition: 'opacity 150ms ease, transform 150ms ease' }}
        >
        {activeTab === 'dashboard' && (
          <DashboardTab stats={stats} users={users} invitations={invitations} pendingProofs={pendingProofs} onGoToTab={(t) => handleTabChange(t as NavTab)} />
        )}
        {activeTab === 'users' && (
          <UsersTab
            users={users}
            templates={appSettings.templates}
            onDelete={handleDeleteUser}
            onOverridePaid={handleOverridePaid}
            onTogglePublished={handleTogglePublished}
          />
        )}
        {activeTab === 'template' && (
          <TemplatesTab
            records={templateRecords}
            onRecordsUpdate={(recs) => setTemplateRecords(recs)}
            onGoToLab={() => handleTabChange('lab')}
            onEditInLab={(rec) => { setLabEditRecord(rec); handleTabChange('lab') }}
            categories={appSettings.categories}
            deletedCategoryIds={appSettings.deletedCategoryIds}
            deletedTierIds={appSettings.deletedTierIds}
            onCategoriesUpdate={(cats, deletedIds) => handleSaveSettings({ ...appSettings, categories: cats, deletedCategoryIds: deletedIds ?? appSettings.deletedCategoryIds })}
            priceTiers={appSettings.priceTiers}
            onPriceTiersUpdate={(tiers, deletedIds) => handleSaveSettings({ ...appSettings, priceTiers: tiers, deletedTierIds: deletedIds ?? appSettings.deletedTierIds })}
            flashSales={appSettings.flashSales}
            onFlashSalesUpdate={(sales) => handleSaveSettings({ ...appSettings, flashSales: sales })}
            coupons={appSettings.coupons}
            onCouponsUpdate={(cpns) => handleSaveSettings({ ...appSettings, coupons: cpns })}
          />
        )}
        {activeTab === 'lab' && (
          <TemplateLab
            onGoToManagement={() => handleTabChange('template')}
            editRecord={labEditRecord}
            templateRecords={templateRecords}
            onTemplateReleased={(rec) => {
              setTemplateRecords(prev => {
                const idx = prev.findIndex(r => r.id === rec.id)
                if (idx >= 0) return prev.map(r => r.id === rec.id ? rec : r)
                return [...prev, rec]
              })
              setLabEditRecord(null)
              setLabDirty(false)
              toast.success('Template berhasil disimpan!', { duration: 4000, icon: '��' })
            }}
            onDirtyChange={setLabDirty}
            categories={appSettings.categories}
            palettes={appSettings.colorPalettes}
          />
        )}
        {activeTab === 'music' && <MusicLibraryTab />}
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
        {activeTab === 'landing' && <LandingPageTab />}
        {activeTab === 'articles' && <ArticlesTab />}
        {activeTab === 'writers' && <WriterTab />}
        {activeTab === 'affiliates' && <AffiliatesTab />}
        {activeTab === 'settings' && (
          <NewSettingsTab
            settings={{
              siteName: appSettings.siteName ?? 'iaundang',
              siteTagline: appSettings.siteTagline ?? 'Digital Wedding Invitation',
              logoHorizontalUrl: appSettings.logoHorizontalUrl ?? '/logos/logo-horizontal.png',
              logoVerticalUrl: appSettings.logoVerticalUrl ?? '/logos/logo-vertical.png',
              contactEmail: appSettings.contactEmail ?? 'halo@iaundang.id',
              contactWhatsapp: appSettings.confirmationWhatsapp ?? '628123456789',
              socialInstagram: appSettings.socialInstagram ?? 'iaundang.id',
              socialTwitter: appSettings.socialTwitter ?? 'iaundang',
              socialGithub: appSettings.socialGithub ?? 'iaundang',
              appDomain: appSettings.appDomain ?? 'iaundang.id',
              demoSubdomain: appSettings.demoSubdomain ?? 'demo',
            }}
            adminEmail={adminEmail}
            onSave={async (siteSettings) => {
              await handleSaveSettings({
                ...appSettings,
                siteName: siteSettings.siteName,
                siteTagline: siteSettings.siteTagline,
                logoHorizontalUrl: siteSettings.logoHorizontalUrl,
                logoVerticalUrl: siteSettings.logoVerticalUrl,
                contactEmail: siteSettings.contactEmail,
                confirmationWhatsapp: siteSettings.contactWhatsapp,
                socialInstagram: siteSettings.socialInstagram,
                socialTwitter: siteSettings.socialTwitter,
                socialGithub: siteSettings.socialGithub,
                appDomain: siteSettings.appDomain,
                demoSubdomain: siteSettings.demoSubdomain,
              })
            }}
          />
        )}
        </div>

        {/* Unsaved changes confirmation modal */}
        {pendingTab && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 px-5 pt-5 pb-3">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Perubahan Belum Disimpan</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Perubahan di Studio Desain akan hilang jika kamu pergi.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-5 pb-5 pt-3 justify-end">
                <button
                  onClick={() => setPendingTab(null)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Kembali
                </button>
                <button
                  onClick={confirmLeaveStudio}
                  className="px-4 py-2 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                >
                  Tinggalkan
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

//  Sidebar 

const NAV_GROUPS = [
  {
    label: 'Utama',
    items: [
      { id: 'dashboard'   as NavTab, label: 'Dashboard',          icon: LayoutDashboard, desc: 'Statistik & aktivitas' },
      { id: 'users'       as NavTab, label: 'Pengguna',           icon: Users,           desc: 'Kelola pengguna & undangan' },
    ],
  },
  {
    label: 'Konten',
    items: [
      { id: 'landing'     as NavTab, label: 'Landing Page',       icon: Globe,           desc: 'Konten & layout halaman utama' },
      { id: 'articles'    as NavTab, label: 'Artikel',            icon: FileText,        desc: 'Blog, SEO & manajemen konten' },
      { id: 'writers'     as NavTab, label: 'Writer',             icon: PenLine,         desc: 'Kelola penulis konten' },
    ],
  },
  {
    label: 'Template',
    items: [
      { id: 'lab'         as NavTab, label: 'Studio Desain',      icon: FlaskConical,    desc: 'Buat & eksperimen template' },
      { id: 'template'    as NavTab, label: 'Manajemen',          icon: Package,         desc: 'Review, harga & publikasi tema' },
      { id: 'music'       as NavTab, label: 'Musik',              icon: Music,           desc: 'Perpustakaan musik undangan' },
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
    label: 'Marketing',
    items: [
      { id: 'affiliates'  as NavTab, label: 'Afiliasi',           icon: Megaphone,       desc: 'Kelola program affiliate' },
    ],
  },
  {
    label: 'Sistem',
    items: [
      { id: 'settings'    as NavTab, label: 'Pengaturan',         icon: Settings,        desc: 'Branding, akun & kontak' },
    ],
  },
]

function Sidebar({
  activeTab, onTabChange, adminEmail, onLogout, stats, pendingProofs, siteName, logoVerticalUrl,
}: {
  activeTab: NavTab
  onTabChange: (t: NavTab) => void
  adminEmail: string
  onLogout: () => void
  stats: Stats
  pendingProofs: number
  siteName: string
  logoVerticalUrl: string
}) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside className={`${collapsed ? 'w-[68px]' : 'w-56'} flex flex-col shrink-0 border-r border-gray-100 bg-white transition-all duration-200 ease-in-out`}>
      {/* Brand */}
      <div className={`${collapsed ? 'px-3' : 'px-5'} py-4 border-b border-gray-100`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 rounded-xl shrink-0 overflow-hidden flex items-center justify-center">
            <Image src="/logos/icons.png" alt={siteName} width={32} height={32} className="object-contain" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-gray-900 text-sm leading-tight truncate">{siteName}</p>
              <p className="text-[10px] text-gray-400 leading-tight">Admin Console</p>
            </div>
          )}
        </div>
      </div>

      {/* Nav groups */}
      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto overflow-x-hidden">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[.15em] px-2 mb-1.5">
                {group.label}
              </p>
            )}
            {collapsed && <div className="h-px bg-gray-100 mx-1 mb-1.5" />}
            <div className="space-y-0.5">
              {group.items.map(({ id, label, icon: Icon, desc }) => {
                const isActive = activeTab === id
                const badge =
                  id === 'users'       ? (stats.totalUsers   > 0 ? stats.totalUsers   : null) :
                  id === 'payment'     ? (pendingProofs      > 0 ? pendingProofs      : null) : null
                return (
                  <button
                    key={id}
                    data-tab={id}
                    onClick={() => onTabChange(id)}
                    title={collapsed ? label : undefined}
                    className={`w-full flex items-center ${collapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-2.5 py-2'} rounded-xl transition-all duration-150 relative ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100'
                        : 'text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-indigo-600' : ''}`} />
                    {!collapsed && (
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-[13px] font-medium leading-tight truncate">{label}</p>
                      </div>
                    )}
                    {badge != null && (
                      <span className={`${collapsed ? 'absolute -top-0.5 -right-0.5 w-4 h-4 text-[8px] flex items-center justify-center' : 'text-[10px] px-1.5 py-0.5 min-w-[18px] text-center'} font-bold rounded-full leading-none shrink-0 ${
                        id === 'payment' ? 'bg-red-100 text-red-600 animate-pulse' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {collapsed ? '' : badge}
                        {collapsed && <span className="w-1.5 h-1.5 rounded-full bg-current" />}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Quick links */}
      <div className="px-2 py-2 border-t border-gray-100">
        {!collapsed && (
          <p className="text-[9px] font-bold text-gray-300 uppercase tracking-[.15em] px-2 mb-1.5">
            Pintasan
          </p>
        )}
        {collapsed && <div className="h-px bg-gray-100 mx-1 mb-1.5" />}
        <div className="space-y-0.5">
          {[
            { href: '/', label: 'Halaman Utama', icon: Home },
            { href: '/dashboard', label: 'Dashboard User', icon: LayoutDashboard },
            { href: '/writer', label: 'Panel Writer', icon: PenLine },
            { href: '/affiliate', label: 'Panel Affiliate', icon: Megaphone },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`w-full flex items-center ${collapsed ? 'justify-center px-0 py-2' : 'gap-2.5 px-2.5 py-1.5'} rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-all duration-150 group`}
            >
              <Icon className="w-[16px] h-[16px] shrink-0" />
              {!collapsed && (
                <span className="flex-1 text-[12px] font-medium leading-tight truncate">{label}</span>
              )}
              {!collapsed && (
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* Collapse toggle */}
      <div className="px-2 py-1.5 border-t border-gray-100">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-center gap-2 px-2 py-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          title={collapsed ? 'Perluas sidebar' : 'Perkecil sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
          {!collapsed && <span className="text-[11px] font-medium">Perkecil</span>}
        </button>
      </div>

      {/* Footer */}
      <div className={`${collapsed ? 'px-2' : 'px-3'} py-3 border-t border-gray-100`}>
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2 px-2 py-2 rounded-xl bg-gray-50/80 mb-1.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-white uppercase">
                  {adminEmail.charAt(0)}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 truncate flex-1">{adminEmail}</p>
            </div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 text-xs font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Keluar
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center" title={adminEmail}>
              <span className="text-[11px] font-bold text-white uppercase">{adminEmail.charAt(0)}</span>
            </div>
            <button onClick={onLogout} className="p-2 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Keluar">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

//  Page Header 

function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="px-8 py-5 border-b border-gray-100 bg-white">
      <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  )
}

//  Badge 

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

//  Orders Tab 

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
                  <td className="px-5 py-4 font-mono text-xs text-gray-600">{o.order_id ?? ''}</td>
                  <td className="px-5 py-4 font-medium">{o.amount ? formatPrice(o.amount) : ''}</td>
                  <td className="px-5 py-4">
                    <Badge
                      variant={
                        o.status === 'success' ? 'green'
                        : o.status === 'pending' ? 'yellow'
                        : o.status === 'failed' ? 'red'
                        : 'gray'
                      }
                    >
                      {o.status ?? ''}
                    </Badge>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{o.payment_type ?? ''}</td>
                  <td className="px-5 py-4 text-gray-500 text-xs">
                    {o.created_at
                      ? new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
                      : ''}
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

