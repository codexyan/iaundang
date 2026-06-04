'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  FlaskConical, ExternalLink, Eye, EyeOff, Save, Trash2,
  Crown, Sparkles, ChevronDown, ChevronUp, Archive,
  Package, TrendingUp, CheckCircle2, Clock,
} from 'lucide-react'
import type { TemplateRecord, TemplatePackageRequirement } from '@/lib/types'

interface Props {
  records: TemplateRecord[]
  onRecordsUpdate: (records: TemplateRecord[]) => void
  onGoToLab?: () => void
  globalPrice?: number
  packageName?: string
  packageDuration?: number
  onPricingUpdate?: (p: { price: number; packageName: string; packageDuration: number }) => void
}

type Filter = 'all' | 'draft' | 'active' | 'archived'

const PACKAGE_OPTIONS: { value: TemplatePackageRequirement; label: string; color: string }[] = [
  { value: 'all',      label: 'Semua User',      color: 'bg-gray-100 text-gray-600' },
  { value: 'starter',  label: 'Starter+',        color: 'bg-blue-100 text-blue-700' },
  { value: 'premium',  label: 'Premium+',        color: 'bg-amber-100 text-amber-700' },
  { value: 'ultimate', label: 'Ultimate only',   color: 'bg-purple-100 text-purple-700' },
]

function formatRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'active')   return <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />Aktif</span>
  if (status === 'draft')    return <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-gray-100 text-gray-500"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />Draft</span>
  return                            <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full font-semibold bg-red-100 text-red-500"><span className="w-1.5 h-1.5 rounded-full bg-red-400 inline-block" />Arsip</span>
}

export default function TemplatesTab({
  records, onRecordsUpdate, onGoToLab,
  globalPrice = 129000, packageName = 'Premium', packageDuration = 6, onPricingUpdate,
}: Props) {
  const [filter, setFilter]           = useState<Filter>('all')
  const [editingId, setEditingId]     = useState<string | null>(null)
  const [editData, setEditData]       = useState<Partial<TemplateRecord>>({})
  const [saving, setSaving]           = useState(false)
  const [savingPricing, setSavingPricing] = useState(false)
  const [showPricing, setShowPricing] = useState(false)
  const [localPrice, setLocalPrice]   = useState(globalPrice)
  const [localPkg, setLocalPkg]       = useState(packageName)
  const [localDur, setLocalDur]       = useState(packageDuration)

  const sorted = [...records].sort((a, b) => a.sort_order - b.sort_order)
  const counts = {
    all: sorted.length,
    active: sorted.filter(r => r.status === 'active').length,
    draft: sorted.filter(r => r.status === 'draft').length,
    archived: sorted.filter(r => r.status === 'archived').length,
  }
  const filtered = filter === 'all' ? sorted : sorted.filter(r => r.status === filter)

  function openEdit(rec: TemplateRecord) {
    setEditingId(rec.id)
    setEditData({ name: rec.name, thumbnail_url: rec.thumbnail_url, price: rec.price, required_package: rec.required_package, sort_order: rec.sort_order })
  }

  async function toggleStatus(rec: TemplateRecord) {
    const next = rec.status === 'active' ? 'draft' : 'active'
    const res = await fetch(`/api/admin/template-records/${rec.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next }),
    })
    if (!res.ok) { toast.error('Gagal mengubah status'); return }
    onRecordsUpdate(records.map(r => r.id === rec.id ? { ...r, status: next } : r))
    toast.success(next === 'active' ? 'Tema dipublikasi ke landing page' : 'Tema ditarik ke draft')
  }

  async function archiveRecord(id: string) {
    if (!confirm('Arsipkan tema ini? Tidak akan tampil ke user, tapi data tersimpan.')) return
    const res = await fetch(`/api/admin/template-records/${id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'archived' }),
    })
    if (!res.ok) { toast.error('Gagal mengarsipkan'); return }
    onRecordsUpdate(records.map(r => r.id === id ? { ...r, status: 'archived' } : r))
    toast.success('Tema diarsipkan')
  }

  async function deleteRecord(id: string) {
    if (!confirm('Hapus permanen? Undangan yang sudah pakai tema ini tetap berfungsi.')) return
    const res = await fetch(`/api/admin/template-records/${id}`, { method: 'DELETE' })
    if (!res.ok) { toast.error('Gagal menghapus'); return }
    onRecordsUpdate(records.filter(r => r.id !== id))
    toast.success('Tema dihapus')
  }

  async function saveEdit() {
    if (!editingId) return
    setSaving(true)
    const res = await fetch(`/api/admin/template-records/${editingId}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData),
    })
    setSaving(false)
    if (!res.ok) { toast.error('Gagal menyimpan'); return }
    onRecordsUpdate(records.map(r => r.id === editingId ? { ...r, ...editData } : r))
    setEditingId(null)
    toast.success('Tersimpan')
  }

  async function savePricing() {
    if (!onPricingUpdate) return
    setSavingPricing(true)
    await onPricingUpdate({ price: localPrice, packageName: localPkg, packageDuration: localDur })
    setSavingPricing(false)
    toast.success('Harga default tersimpan')
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Header ── */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Manajemen Tema</h1>
              <p className="text-sm text-gray-500 mt-0.5">Review, atur harga, dan publikasi tema dari Studio Desain</p>
            </div>
            {onGoToLab && (
              <button onClick={onGoToLab}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm">
                <FlaskConical className="w-4 h-4" />
                Buka Studio Desain
              </button>
            )}
          </div>

          {/* Stats strip */}
          <div className="flex items-center gap-6 mt-5">
            {[
              { icon: Package,      label: 'Total',  value: counts.all,      color: 'text-gray-600' },
              { icon: CheckCircle2, label: 'Aktif',  value: counts.active,   color: 'text-emerald-600' },
              { icon: Clock,        label: 'Draft',  value: counts.draft,    color: 'text-amber-600' },
              { icon: Archive,      label: 'Arsip',  value: counts.archived, color: 'text-red-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-2">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-sm font-semibold text-gray-900">{value}</span>
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter + pricing toggle */}
        <div className="px-8 pb-0 flex items-center justify-between">
          <div className="flex gap-1">
            {(['all','draft','active','archived'] as Filter[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  filter === f
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                {f === 'all' ? 'Semua' : f === 'draft' ? 'Draft' : f === 'active' ? 'Aktif' : 'Arsip'}
                <span className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full ${
                  filter === f ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-500'
                }`}>{counts[f]}</span>
              </button>
            ))}
          </div>
          <button onClick={() => setShowPricing(!showPricing)}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 pb-2.5 transition-colors">
            <Crown className="w-3.5 h-3.5" />
            Harga Default
            {showPricing ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ── Pricing panel (collapsible) ── */}
      {showPricing && (
        <div className="mx-8 mt-5 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-bold text-gray-900">Harga & Paket Default</p>
              <p className="text-xs text-gray-400 mt-0.5">Berlaku untuk tema dengan harga = 0 (mengikuti default).</p>
            </div>
            <button onClick={savePricing} disabled={savingPricing}
              className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors">
              <Save className="w-3.5 h-3.5" />
              {savingPricing ? 'Menyimpan...' : 'Simpan'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Harga Default</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rp</span>
                <input type="number" min={0} step={1000} value={localPrice}
                  onChange={e => setLocalPrice(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </div>
              <p className="text-[10px] text-gray-400 mt-1">{formatRp(localPrice)}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Paket</label>
              <input type="text" value={localPkg} onChange={e => setLocalPkg(e.target.value)}
                placeholder="contoh: Premium"
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Durasi Akses (bulan)</label>
              <input type="number" min={1} max={24} value={localDur}
                onChange={e => setLocalDur(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              <p className="text-[10px] text-gray-400 mt-1">Aktif {localDur} bulan setelah bayar</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Template list ── */}
      <div className="p-8">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-16 text-center">
            <FlaskConical className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-gray-400">
              {filter === 'all' ? 'Belum ada tema dari Studio Desain' : `Tidak ada tema dengan status "${filter}"`}
            </p>
            {filter === 'all' && onGoToLab && (
              <button onClick={onGoToLab}
                className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                Mulai desain tema baru →
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(rec => (
              <div key={rec.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden transition-all ${
                editingId === rec.id ? 'border-indigo-300 shadow-indigo-50' : 'border-gray-100 hover:border-gray-200'
              }`}>
                {/* Card row */}
                <div className="flex items-center gap-4 px-5 py-4">

                  {/* Accent swatch */}
                  <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden flex items-center justify-center text-white text-sm font-bold shadow-sm"
                    style={{ background: `linear-gradient(135deg, ${rec.config.meta.color_scheme.primary}, ${rec.config.meta.color_scheme.accent})` }}>
                    {rec.name.slice(0, 2).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{rec.name}</span>
                      <code className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded font-mono">{rec.slug}</code>
                      <StatusBadge status={rec.status} />
                      {rec.required_package !== 'all' && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ${PACKAGE_OPTIONS.find(o => o.value === rec.required_package)?.color}`}>
                          <Crown className="w-2.5 h-2.5" />
                          {PACKAGE_OPTIONS.find(o => o.value === rec.required_package)?.label}
                        </span>
                      )}
                      <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-medium ${rec.price > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {rec.price > 0 ? formatRp(rec.price) : 'harga default'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {rec.category} · {rec.config.sections.filter(s => s.enabled).length}/{rec.config.sections.length} section · {rec.config.meta.font.heading}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    <a href={`/demo/renderer?id=${rec.id}`} target="_blank" rel="noopener noreferrer"
                      title="Preview tema"
                      className="p-2 text-gray-300 hover:text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                      <ExternalLink className="w-4 h-4" />
                    </a>

                    <button onClick={() => toggleStatus(rec)}
                      title={rec.status === 'active' ? 'Tarik ke Draft' : 'Publikasi'}
                      className={`p-2 rounded-lg transition-colors ${
                        rec.status === 'active'
                          ? 'text-emerald-500 bg-emerald-50 hover:bg-emerald-100'
                          : 'text-gray-300 hover:text-emerald-500 hover:bg-emerald-50'
                      }`}>
                      {rec.status === 'active' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => editingId === rec.id ? setEditingId(null) : openEdit(rec)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        editingId === rec.id
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'
                      }`}>
                      {editingId === rec.id ? 'Tutup' : 'Edit'}
                    </button>

                    {rec.status !== 'archived' && (
                      <button onClick={() => archiveRecord(rec.id)} title="Arsipkan"
                        className="p-2 text-gray-300 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-colors">
                        <Archive className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => deleteRecord(rec.id)} title="Hapus permanen"
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* ── Inline edit panel ── */}
                {editingId === rec.id && (
                  <div className="border-t border-indigo-100 bg-indigo-50/20 px-5 py-5">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Nama Tampilan</label>
                        <input value={editData.name ?? ''} onChange={e => setEditData({ ...editData, name: e.target.value })}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">URL Thumbnail</label>
                        <input value={editData.thumbnail_url ?? ''} onChange={e => setEditData({ ...editData, thumbnail_url: e.target.value })}
                          placeholder="https://... atau /images/..."
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white" />
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-gray-200 p-4 grid grid-cols-3 gap-4 mb-4">
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Harga (Rp)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rp</span>
                          <input type="number" min={0} step={1000} value={editData.price ?? 0}
                            onChange={e => setEditData({ ...editData, price: Math.max(0, Number(e.target.value)) })}
                            className="w-full pl-8 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-1">
                          {!editData.price ? 'Ikuti harga default' : formatRp(editData.price)}
                        </p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Akses Paket</label>
                        <select value={editData.required_package ?? 'all'}
                          onChange={e => setEditData({ ...editData, required_package: e.target.value as TemplatePackageRequirement })}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400">
                          {PACKAGE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">Urutan Tampil</label>
                        <input type="number" min={0} value={editData.sort_order ?? 0}
                          onChange={e => setEditData({ ...editData, sort_order: Number(e.target.value) })}
                          className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400" />
                        <p className="text-[10px] text-gray-400 mt-1">Angka lebih kecil tampil lebih dulu</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={saveEdit} disabled={saving}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-sm">
                        <Save className="w-4 h-4" />
                        {saving ? 'Menyimpan...' : 'Simpan'}
                      </button>
                      <button onClick={() => setEditingId(null)}
                        className="px-4 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                        Batal
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Workflow guide (bottom) ── */}
      <div className="mx-8 mb-8 rounded-2xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 p-5">
        <p className="text-xs font-bold text-indigo-700 mb-3 flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" />
          Alur Publikasi Tema
        </p>
        <div className="flex items-center gap-3 flex-wrap text-xs text-indigo-600">
          {[
            { icon: '🎨', text: 'Desain di Studio' },
            { icon: '→', text: '' },
            { icon: '🚀', text: 'Rilis → Draft' },
            { icon: '→', text: '' },
            { icon: '💰', text: 'Atur harga & tier' },
            { icon: '→', text: '' },
            { icon: '✅', text: 'Aktifkan → Landing Page' },
            { icon: '→', text: '' },
            { icon: '🛍️', text: 'User beli & pakai' },
          ].map((s, i) => s.text
            ? <span key={i} className="flex items-center gap-1.5"><span>{s.icon}</span><span className="font-medium">{s.text}</span></span>
            : <span key={i} className="text-indigo-300">{s.icon}</span>
          )}
        </div>
      </div>

    </div>
  )
}
