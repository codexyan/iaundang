'use client'

import { useState, useEffect } from 'react'
import { FlaskConical, Plus, Trash2, BarChart3, Loader2, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'

interface Experiment {
  id: string
  key: string
  name: string
  description: string
  variants: Record<string, { weight: number; value: unknown }>
  traffic: number
  is_active: boolean
  created_at: string
}

interface VariantStats {
  variant: string
  views: number
  conversions: number
  conversionRate: number
}

interface Report {
  experiment: Experiment
  stats: VariantStats[]
  totalEvents: number
}

export default function ExperimentsTab() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ key: '', name: '', description: '' })

  useEffect(() => {
    fetch('/api/experiments')
      .then(r => r.json())
      .then(d => setExperiments(d.experiments ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function createExperiment() {
    if (!form.key || !form.name) { toast.error('Key dan Name wajib diisi'); return }
    const res = await fetch('/api/experiments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        variants: {
          control: { weight: 50, value: null },
          variant_a: { weight: 50, value: null },
        },
      }),
    })
    if (!res.ok) { toast.error('Gagal membuat experiment'); return }
    const { experiment } = await res.json()
    setExperiments(prev => [experiment, ...prev])
    setForm({ key: '', name: '', description: '' })
    setShowCreate(false)
    toast.success('Experiment dibuat!')
  }

  async function toggleExperiment(exp: Experiment) {
    const res = await fetch(`/api/experiments/${exp.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !exp.is_active }),
    })
    if (!res.ok) return
    setExperiments(prev => prev.map(e => e.id === exp.id ? { ...e, is_active: !e.is_active } : e))
  }

  async function deleteExperiment(id: string) {
    await fetch(`/api/experiments/${id}`, { method: 'DELETE' })
    setExperiments(prev => prev.filter(e => e.id !== id))
    if (selectedReport?.experiment.id === id) setSelectedReport(null)
    toast.success('Experiment dihapus')
  }

  async function viewReport(id: string) {
    const res = await fetch(`/api/experiments/${id}`)
    if (!res.ok) return
    setSelectedReport(await res.json())
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-stone-300" /></div>
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900">A/B Experiments</h2>
          <p className="text-sm text-stone-400 mt-0.5">Kelola dan pantau hasil eksperimen</p>
        </div>
        <button
          onClick={() => setShowCreate(p => !p)}
          className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-semibold rounded-xl hover:bg-stone-800"
        >
          <Plus size={14} /> Buat Experiment
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-3">
          <h3 className="text-sm font-bold text-stone-900">Experiment Baru</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-stone-500 font-medium block mb-1">Key (unik)</label>
              <input value={form.key} onChange={e => setForm(p => ({ ...p, key: e.target.value }))}
                placeholder="cta_color_test" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm" />
            </div>
            <div>
              <label className="text-xs text-stone-500 font-medium block mb-1">Nama</label>
              <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                placeholder="CTA Button Color Test" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs text-stone-500 font-medium block mb-1">Deskripsi</label>
            <input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              placeholder="Test warna CTA di landing page" className="w-full px-3 py-2 border border-stone-200 rounded-xl text-sm" />
          </div>
          <p className="text-[10px] text-stone-400">Default: 2 variant (control + variant_a), 50/50 split.</p>
          <div className="flex gap-2">
            <button onClick={createExperiment} className="px-4 py-2 bg-stone-900 text-white text-sm font-semibold rounded-xl">Buat</button>
            <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-stone-400">Batal</button>
          </div>
        </div>
      )}

      {/* Experiment list */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-50 flex items-center gap-2">
          <FlaskConical size={16} className="text-indigo-500" />
          <h3 className="text-sm font-bold text-stone-900">Experiments ({experiments.length})</h3>
        </div>

        {experiments.length === 0 ? (
          <div className="p-8 text-center text-sm text-stone-400">Belum ada experiment</div>
        ) : (
          <div className="divide-y divide-stone-50">
            {experiments.map(exp => (
              <div key={exp.id} className="px-5 py-4 flex items-center gap-4">
                <button onClick={() => toggleExperiment(exp)} className="shrink-0">
                  {exp.is_active
                    ? <ToggleRight size={24} className="text-green-500" />
                    : <ToggleLeft size={24} className="text-stone-300" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-stone-900">{exp.name}</p>
                    <span className="text-[10px] font-mono bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded">{exp.key}</span>
                  </div>
                  {exp.description && <p className="text-xs text-stone-400 mt-0.5">{exp.description}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-stone-300">
                      {Object.keys(exp.variants).length} variants · {exp.traffic}% traffic
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => viewReport(exp.id)} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-lg hover:bg-indigo-100">
                    <BarChart3 size={12} /> Report
                  </button>
                  <button onClick={() => deleteExperiment(exp.id)} className="p-1.5 text-stone-300 hover:text-red-400">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report view */}
      {selectedReport && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">Report: {selectedReport.experiment.name}</h3>
            <span className="text-xs text-stone-400">{selectedReport.totalEvents} total events</span>
          </div>

          {selectedReport.stats.length === 0 ? (
            <p className="text-sm text-stone-400">Belum ada data</p>
          ) : (
            <div className="space-y-3">
              {selectedReport.stats.map(s => (
                <div key={s.variant} className="bg-stone-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-stone-900">{s.variant}</span>
                    <span className={`text-sm font-bold ${s.conversionRate >= 5 ? 'text-green-600' : 'text-stone-600'}`}>
                      {s.conversionRate}%
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-stone-500">
                    <span>{s.views} views</span>
                    <span>{s.conversions} conversions</span>
                  </div>
                  <div className="mt-2 w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(s.conversionRate, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
