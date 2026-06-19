'use client'

import { useState } from 'react'
import { Save, Package, ToggleLeft, ToggleRight, Crown, Sparkles, Rocket } from 'lucide-react'
import toast from 'react-hot-toast'
import type { PriceTier, TierFeatures } from '@/lib/types'

interface Props {
  priceTiers: PriceTier[]
  onSave: (tiers: PriceTier[]) => Promise<void>
}

const TIER_ICONS: Record<string, typeof Crown> = {
  rocket: Rocket,
  crown: Crown,
  gem: Sparkles,
}

const FEATURE_LABELS: { key: keyof TierFeatures; label: string; type: 'boolean' | 'number' | 'select' }[] = [
  { key: 'max_photos', label: 'Maks Foto', type: 'number' },
  { key: 'music', label: 'Musik', type: 'boolean' },
  { key: 'custom_music', label: 'Musik Kustom', type: 'boolean' },
  { key: 'opening_animation', label: 'Animasi Opening', type: 'boolean' },
  { key: 'opening_styles', label: 'Gaya Opening', type: 'select' },
  { key: 'rsvp', label: 'RSVP', type: 'boolean' },
  { key: 'wishes', label: 'Ucapan', type: 'boolean' },
  { key: 'countdown', label: 'Hitung Mundur', type: 'boolean' },
  { key: 'gallery', label: 'Galeri', type: 'boolean' },
  { key: 'gift', label: 'Hadiah', type: 'boolean' },
  { key: 'gift_registry', label: 'Registri Hadiah', type: 'boolean' },
  { key: 'story', label: 'Cerita', type: 'boolean' },
  { key: 'video', label: 'Video', type: 'boolean' },
  { key: 'livestream', label: 'Livestream', type: 'boolean' },
  { key: 'ig_story', label: 'IG Story', type: 'boolean' },
  { key: 'qrcode', label: 'QR Code', type: 'boolean' },
  { key: 'custom_domain', label: 'Domain Kustom', type: 'boolean' },
  { key: 'remove_watermark', label: 'Hapus Watermark', type: 'boolean' },
  { key: 'analytics', label: 'Analitik', type: 'boolean' },
  { key: 'priority_support', label: 'Support Prioritas', type: 'boolean' },
  { key: 'validity_days', label: 'Masa Aktif (hari)', type: 'number' },
  { key: 'decoration_editing', label: 'Edit Dekorasi', type: 'boolean' },
  { key: 'max_decoration_assets', label: 'Maks Dekorasi/Section', type: 'number' },
  { key: 'custom_animations', label: 'Animasi Kustom', type: 'boolean' },
]

type SubTab = 'overview' | 'features' | 'sections'

export default function PackagesTab({ priceTiers, onSave }: Props) {
  const [tiers, setTiers] = useState<PriceTier[]>(priceTiers)
  const [saving, setSaving] = useState(false)
  const [subTab, setSubTab] = useState<SubTab>('overview')
  const [dirty, setDirty] = useState(false)

  function updateTier(id: string, patch: Partial<PriceTier>) {
    setTiers(prev => prev.map(t => t.id === id ? { ...t, ...patch } : t))
    setDirty(true)
  }

  function updateFeature(tierId: string, key: keyof TierFeatures, value: unknown) {
    setTiers(prev => prev.map(t => {
      if (t.id !== tierId) return t
      return { ...t, features: { ...t.features!, [key]: value } }
    }))
    setDirty(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await onSave(tiers)
      setDirty(false)
      toast.success('Konfigurasi paket berhasil disimpan!')
    } catch {
      toast.error('Gagal menyimpan')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-800">Manajemen Paket</h2>
          <p className="text-sm text-stone-500">Konfigurasi tier, harga, dan fitur per paket</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!dirty || saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            dirty
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
              : 'bg-stone-100 text-stone-400 cursor-not-allowed'
          }`}
        >
          <Save size={14} />
          {saving ? 'Menyimpan...' : 'Simpan'}
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
        {([
          { id: 'overview' as SubTab, label: 'Ikhtisar' },
          { id: 'features' as SubTab, label: 'Matriks Fitur' },
        ]).map(st => (
          <button
            key={st.id}
            onClick={() => setSubTab(st.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              subTab === st.id
                ? 'bg-white text-stone-800 shadow-sm'
                : 'text-stone-500 hover:text-stone-700'
            }`}
          >
            {st.label}
          </button>
        ))}
      </div>

      {subTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map(tier => {
            const TierIcon = TIER_ICONS[tier.icon ?? 'rocket'] ?? Package
            return (
              <div
                key={tier.id}
                className={`rounded-2xl border-2 p-5 space-y-4 transition-all ${
                  tier.highlight ? 'border-violet-300 bg-violet-50/30 shadow-lg' : 'border-stone-200 bg-white'
                }`}
              >
                {/* Tier header */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${tier.color}20`, color: tier.color }}
                  >
                    <TierIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <input
                      value={tier.label}
                      onChange={(e) => updateTier(tier.id, { label: e.target.value })}
                      className="text-base font-bold text-stone-800 bg-transparent border-none outline-none w-full"
                    />
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Harga</label>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs text-stone-500">Rp</span>
                    <input
                      type="number"
                      value={tier.price}
                      onChange={(e) => updateTier(tier.id, { price: parseInt(e.target.value) || 0 })}
                      className="text-xl font-bold text-stone-800 bg-transparent border-none outline-none w-full"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Deskripsi</label>
                  <textarea
                    value={tier.description ?? ''}
                    onChange={(e) => updateTier(tier.id, { description: e.target.value })}
                    rows={2}
                    className="w-full mt-1 text-xs text-stone-600 bg-stone-50 rounded-lg border border-stone-200 px-3 py-2 resize-none"
                  />
                </div>

                {/* Color */}
                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider">Warna</label>
                  <input
                    type="color"
                    value={tier.color ?? '#3b82f6'}
                    onChange={(e) => updateTier(tier.id, { color: e.target.value })}
                    className="w-6 h-6 rounded border-0 cursor-pointer"
                  />
                </div>

                {/* Highlight toggle */}
                <label className="flex items-center gap-2 cursor-pointer">
                  <button
                    onClick={() => updateTier(tier.id, { highlight: !tier.highlight })}
                    className="text-stone-400"
                  >
                    {tier.highlight ? <ToggleRight size={20} className="text-violet-500" /> : <ToggleLeft size={20} />}
                  </button>
                  <span className="text-xs text-stone-600">Sorot sebagai rekomendasi</span>
                </label>

                {/* Feature summary */}
                <div className="pt-3 border-t border-stone-100">
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Ringkasan Fitur</p>
                  <div className="space-y-1">
                    {FEATURE_LABELS.filter(f => f.type === 'boolean').slice(0, 8).map(f => {
                      const val = tier.features?.[f.key]
                      return (
                        <div key={f.key} className="flex items-center gap-1.5 text-[11px]">
                          <span className={val ? 'text-emerald-500' : 'text-stone-300'}>
                            {val ? '✓' : '✗'}
                          </span>
                          <span className={val ? 'text-stone-600' : 'text-stone-400'}>{f.label}</span>
                        </div>
                      )
                    })}
                    <p className="text-[10px] text-stone-400 mt-1">
                      + {FEATURE_LABELS.filter(f => f.type === 'boolean').length - 8} fitur lainnya →
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {subTab === 'features' && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200">
                <th className="text-left py-3 px-4 text-xs font-semibold text-stone-500 uppercase tracking-wider w-48">
                  Fitur
                </th>
                {tiers.map(t => (
                  <th key={t.id} className="text-center py-3 px-4 text-xs font-semibold uppercase tracking-wider" style={{ color: t.color }}>
                    {t.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_LABELS.map((feat, idx) => (
                <tr key={feat.key} className={idx % 2 === 0 ? 'bg-stone-50/50' : ''}>
                  <td className="py-2.5 px-4 text-xs font-medium text-stone-700">{feat.label}</td>
                  {tiers.map(t => {
                    const val = t.features?.[feat.key]
                    return (
                      <td key={t.id} className="py-2.5 px-4 text-center">
                        {feat.type === 'boolean' ? (
                          <button
                            onClick={() => updateFeature(t.id, feat.key, !val)}
                            className="mx-auto"
                          >
                            {val
                              ? <ToggleRight size={20} className="text-emerald-500" />
                              : <ToggleLeft size={20} className="text-stone-300" />
                            }
                          </button>
                        ) : feat.type === 'number' ? (
                          <input
                            type="number"
                            value={(val as number) ?? 0}
                            onChange={(e) => updateFeature(t.id, feat.key, parseInt(e.target.value) || 0)}
                            className="w-16 text-center text-xs rounded-lg border border-stone-200 px-2 py-1.5 bg-white"
                          />
                        ) : feat.key === 'opening_styles' ? (
                          <select
                            value={(val as string) ?? 'basic'}
                            onChange={(e) => updateFeature(t.id, feat.key, e.target.value)}
                            className="text-xs rounded-lg border border-stone-200 px-2 py-1.5 bg-white"
                          >
                            <option value="basic">Basic</option>
                            <option value="all">Semua</option>
                          </select>
                        ) : null}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
