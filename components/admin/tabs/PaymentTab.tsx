'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  Plus, Trash2, Save, CheckCircle2, XCircle, Clock, CreditCard,
  Landmark, QrCode, MessageSquare, Eye,
} from 'lucide-react'
import type { BankAccount, PaymentProof } from '@/lib/db'
import { formatPrice } from '@/lib/utils'

// Types

interface PaymentConfig {
  bankAccounts: BankAccount[]
  qrisImageUrl: string
  paymentInstructions: string
  confirmationWhatsapp: string
}

interface Props {
  config: PaymentConfig
  proofs: PaymentProof[]
  packageDuration: number
  onConfigUpdate: (config: PaymentConfig) => void
  onProofReview: (proofId: string, status: 'approved' | 'rejected', notes: string) => Promise<void>
}

type SubTab = 'config' | 'proofs'

// Main

export default function PaymentTab({ config, proofs, packageDuration, onConfigUpdate, onProofReview }: Props) {
  const [subTab, setSubTab] = useState<SubTab>('config')
  const pendingCount = proofs.filter((p) => p.status === 'pending').length

  return (
    <div>
      <div className="px-8 py-6 border-b border-gray-200 bg-white">
        <h1 className="text-xl font-bold text-gray-900">Pembayaran</h1>
        <p className="text-sm text-gray-500 mt-0.5">Konfigurasi rekening, QRIS, dan verifikasi transfer manual</p>
      </div>

      {/* Sub-tab switcher */}
      <div className="px-8 pt-5">
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          <button
            onClick={() => setSubTab('config')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${subTab === 'config' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <span className="flex items-center gap-2"><Landmark className="w-4 h-4" />Rekening & QRIS</span>
          </button>
          <button
            onClick={() => setSubTab('proofs')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${subTab === 'proofs' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Clock className="w-4 h-4" />
            Verifikasi Transfer
            {pendingCount > 0 && (
              <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ml-1">
                {pendingCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="p-8">
        {subTab === 'config' && (
          <PaymentConfigTab config={config} onUpdate={onConfigUpdate} />
        )}
        {subTab === 'proofs' && (
          <ProofsTab proofs={proofs} packageDuration={packageDuration} onReview={onProofReview} />
        )}
      </div>
    </div>
  )
}

// Payment Config

function PaymentConfigTab({ config, onUpdate }: { config: PaymentConfig; onUpdate: (c: PaymentConfig) => void }) {
  const [accounts, setAccounts] = useState<BankAccount[]>(config.bankAccounts)
  const [qrisUrl, setQrisUrl] = useState(config.qrisImageUrl)
  const [instructions, setInstructions] = useState(config.paymentInstructions)
  const [wa, setWa] = useState(config.confirmationWhatsapp)
  const [saving, setSaving] = useState(false)

  const [showAddBank, setShowAddBank] = useState(false)
  const [newBank, setNewBank] = useState({ bankName: '', accountNumber: '', accountName: '', logoUrl: '' })
  const [editingId, setEditingId] = useState<string | null>(null)

  async function save() {
    setSaving(true)
    const res = await fetch('/api/admin/payment-config', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        bankAccounts: accounts,
        qrisImageUrl: qrisUrl,
        paymentInstructions: instructions,
        confirmationWhatsapp: wa,
      }),
    })
    setSaving(false)
    if (!res.ok) { toast.error('Gagal simpan'); return }
    onUpdate({ bankAccounts: accounts, qrisImageUrl: qrisUrl, paymentInstructions: instructions, confirmationWhatsapp: wa })
    toast.success('Konfigurasi pembayaran tersimpan!')
  }

  function addBank() {
    if (!newBank.bankName || !newBank.accountNumber || !newBank.accountName) {
      toast.error('Nama bank, nomor rekening, dan nama pemilik wajib diisi')
      return
    }
    const account: BankAccount = {
      id: crypto.randomUUID(),
      ...newBank,
      isActive: true,
    }
    setAccounts([...accounts, account])
    setNewBank({ bankName: '', accountNumber: '', accountName: '', logoUrl: '' })
    setShowAddBank(false)
  }

  function removeBank(id: string) {
    setAccounts(accounts.filter((a) => a.id !== id))
  }

  function toggleActive(id: string) {
    setAccounts(accounts.map((a) => a.id === id ? { ...a, isActive: !a.isActive } : a))
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Bank Accounts */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Landmark className="w-4 h-4 text-indigo-500" />
            Rekening Bank
          </h3>
          <button
            onClick={() => setShowAddBank(!showAddBank)}
            className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Tambah Rekening
          </button>
        </div>

        {showAddBank && (
          <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/30 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Nama Bank *</label>
                <input value={newBank.bankName} onChange={(e) => setNewBank({ ...newBank, bankName: e.target.value })}
                  placeholder="BCA, Mandiri, BNI..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Nomor Rekening *</label>
                <input value={newBank.accountNumber} onChange={(e) => setNewBank({ ...newBank, accountNumber: e.target.value })}
                  placeholder="1234567890" type="text"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Atas Nama *</label>
                <input value={newBank.accountName} onChange={(e) => setNewBank({ ...newBank, accountName: e.target.value })}
                  placeholder="Nama pemilik rekening"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">URL Logo (opsional)</label>
                <input value={newBank.logoUrl} onChange={(e) => setNewBank({ ...newBank, logoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={addBank} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-indigo-700">
                Tambahkan
              </button>
              <button onClick={() => setShowAddBank(false)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">
                Batal
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {accounts.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-4">Belum ada rekening yang ditambahkan</p>
          )}
          {accounts.map((acc) => (
            <div key={acc.id} className={`flex items-center gap-4 p-4 rounded-xl border ${acc.isActive ? 'border-gray-100 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <CreditCard className="w-5 h-5 text-indigo-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{acc.bankName}</p>
                <p className="font-mono text-sm text-gray-600">{acc.accountNumber}</p>
                <p className="text-xs text-gray-400">a/n {acc.accountName}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => toggleActive(acc.id)}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${acc.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>
                  {acc.isActive ? 'Aktif' : 'Nonaktif'}
                </button>
                <button onClick={() => removeBank(acc.id)} className="p-1.5 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* QRIS */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <QrCode className="w-4 h-4 text-indigo-500" />
          QRIS
        </h3>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">URL Gambar QR Code</label>
          <input
            type="text"
            value={qrisUrl}
            onChange={(e) => setQrisUrl(e.target.value)}
            placeholder="https://... atau /uploads/qris.jpg"
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <p className="text-xs text-gray-400 mt-1.5">Upload gambar QRIS ke server, lalu tempel URL-nya di sini</p>
        </div>
        {qrisUrl && (
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrisUrl} alt="QRIS preview" className="w-20 h-20 object-contain rounded-lg border border-gray-200 bg-white" />
            <p className="text-xs text-gray-500">Preview QRIS</p>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-500" />
          Instruksi Pembayaran
        </h3>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Pesan yang ditampilkan ke user</label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            rows={4}
            className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 block mb-1.5">Nomor WhatsApp Konfirmasi</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">+</span>
            <input
              value={wa}
              onChange={(e) => setWa(e.target.value)}
              placeholder="6281234567890"
              className="w-full pl-7 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">Format internasional tanpa +, contoh: 6281234567890</p>
        </div>
      </div>

      <button
        onClick={save}
        disabled={saving}
        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 shadow-sm"
      >
        <Save className="w-4 h-4" />
        {saving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
      </button>
    </div>
  )
}

// Proofs Verification

type ProofFilter = 'all' | 'pending' | 'approved' | 'rejected'

function ProofsTab({ proofs, packageDuration, onReview }: {
  proofs: PaymentProof[]
  packageDuration: number
  onReview: (id: string, status: 'approved' | 'rejected', notes: string) => Promise<void>
}) {
  const [filter, setFilter] = useState<ProofFilter>('pending')
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const filtered = proofs.filter((p) => filter === 'all' || p.status === filter)

  async function handleReview(proof: PaymentProof, status: 'approved' | 'rejected') {
    setLoading(true)
    await onReview(proof.id, status, adminNotes)
    setLoading(false)
    setReviewingId(null)
    setAdminNotes('')
  }

  const FILTERS: { id: ProofFilter; label: string }[] = [
    { id: 'pending', label: 'Menunggu' },
    { id: 'approved', label: 'Disetujui' },
    { id: 'rejected', label: 'Ditolak' },
    { id: 'all', label: 'Semua' },
  ]

  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all flex items-center gap-1.5 ${filter === f.id ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {f.label}
            {f.id === 'pending' && proofs.filter(p => p.status === 'pending').length > 0 && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${filter === 'pending' ? 'bg-white text-indigo-600' : 'bg-amber-500 text-white'}`}>
                {proofs.filter(p => p.status === 'pending').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <CheckCircle2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">
            {filter === 'pending' ? 'Tidak ada bukti transfer yang menunggu verifikasi' : 'Tidak ada data'}
          </p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map((proof) => (
          <div key={proof.id} className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
            proof.status === 'pending' ? 'border-amber-200' :
            proof.status === 'approved' ? 'border-emerald-200' : 'border-red-200'
          }`}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      proof.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      proof.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {proof.status === 'pending' ? '⏳ Menunggu' : proof.status === 'approved' ? '✓ Disetujui' : '✗ Ditolak'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(proof.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                    <div><span className="text-gray-400 text-xs">Email</span><p className="font-medium text-gray-800">{proof.user_email}</p></div>
                    <div><span className="text-gray-400 text-xs">Link Undangan</span><p className="font-mono text-gray-800">/{proof.slug}</p></div>
                    <div><span className="text-gray-400 text-xs">Jumlah Transfer</span><p className="font-semibold text-gray-900">{formatPrice(proof.amount)}</p></div>
                    <div><span className="text-gray-400 text-xs">Bank</span><p className="text-gray-800">{proof.bank_name}</p></div>
                    <div><span className="text-gray-400 text-xs">Tanggal Transfer</span><p className="text-gray-800">{proof.transfer_date}</p></div>
                    {proof.notes && <div className="col-span-2"><span className="text-gray-400 text-xs">Catatan User</span><p className="text-gray-800">{proof.notes}</p></div>}
                    {proof.admin_notes && <div className="col-span-2"><span className="text-gray-400 text-xs">Catatan Admin</span><p className="text-gray-700 italic">{proof.admin_notes}</p></div>}
                  </div>

                  {proof.proof_url && (
                    <a href={proof.proof_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs text-indigo-600 hover:underline">
                      <Eye className="w-3.5 h-3.5" /> Lihat bukti transfer
                    </a>
                  )}
                </div>

                {/* Actions */}
                {proof.status === 'pending' && reviewingId !== proof.id && (
                  <div className="flex flex-col gap-2 shrink-0">
                    <button
                      onClick={() => { setReviewingId(proof.id); setAdminNotes('') }}
                      className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-medium hover:bg-emerald-700 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Setujui
                    </button>
                    <button
                      onClick={() => { setReviewingId(proof.id + '-reject'); setAdminNotes('') }}
                      className="flex items-center gap-1.5 bg-red-50 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-xs font-medium hover:bg-red-100 transition-colors"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Tolak
                    </button>
                  </div>
                )}
              </div>

              {/* Review form - Approve */}
              {reviewingId === proof.id && (
                <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-emerald-800">✓ Setujui Transfer</p>
                  <p className="text-xs text-emerald-700">Undangan <strong>/{proof.slug}</strong> akan langsung diaktifkan selama {packageDuration} bulan.</p>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Catatan untuk user (opsional)..."
                    rows={2}
                    className="w-full px-3 py-2 text-sm border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleReview(proof, 'approved')} disabled={loading}
                      className="bg-emerald-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
                      {loading ? 'Memproses...' : 'Konfirmasi Setujui'}
                    </button>
                    <button onClick={() => setReviewingId(null)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Batal</button>
                  </div>
                </div>
              )}

              {/* Review form - Reject */}
              {reviewingId === proof.id + '-reject' && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-800">✗ Tolak Transfer</p>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Alasan penolakan (wajib diisi agar user mengerti)..."
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleReview(proof, 'rejected')} disabled={loading || !adminNotes.trim()}
                      className="bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                      {loading ? 'Memproses...' : 'Konfirmasi Tolak'}
                    </button>
                    <button onClick={() => setReviewingId(null)} className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700">Batal</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
