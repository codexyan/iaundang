'use client'

import { useState, useEffect } from 'react'
import { Loader2, Receipt, CheckCircle2, Clock, XCircle } from 'lucide-react'
import type { Invitation } from '@/lib/types'

interface Props {
  invitation: Invitation
}

interface PaymentProof {
  id: string
  slug: string
  amount: number
  bank_name: string
  transfer_date: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes: string
  created_at: string
  reviewed_at: string | null
}

const STATUS_MAP: Record<string, { label: string; cls: string; icon: React.ElementType }> = {
  pending:  { label: 'Menunggu',  cls: 'bg-amber-100 text-amber-700', icon: Clock },
  approved: { label: 'Disetujui', cls: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Ditolak',   cls: 'bg-red-100 text-red-700',     icon: XCircle },
}

export default function TransactionHistory({ invitation }: Props) {
  const [proofs, setProofs] = useState<PaymentProof[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/payment/proof')
      .then(r => r.json())
      .then(data => setProofs(data.proofs ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-rose-500 font-semibold">Riwayat Transaksi</p>
            <h2 className="mt-2 text-2xl font-semibold text-gray-900">Catatan pembayaran Anda</h2>
            <p className="mt-2 text-sm text-gray-500">Semua transaksi terkait undangan Anda ditampilkan di sini.</p>
          </div>
          <div className="rounded-3xl bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Slug: <span className="font-medium text-gray-900">{invitation.slug}.iaundang.id</span>
          </div>
        </div>

        {loading ? (
          <div className="mt-8 flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-stone-300" />
          </div>
        ) : proofs.length === 0 ? (
          <div className="mt-8 flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-stone-100 flex items-center justify-center mb-3">
              <Receipt size={24} className="text-stone-400" />
            </div>
            <p className="text-sm font-medium text-stone-600">Belum ada transaksi</p>
            <p className="text-xs text-stone-400 mt-1">Riwayat pembayaran akan muncul di sini setelah Anda melakukan transfer.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-left text-sm text-gray-700">
              <thead className="border-b border-gray-200 text-xs uppercase tracking-[0.2em] text-gray-500">
                <tr>
                  <th className="py-3 pr-6">ID</th>
                  <th className="py-3 pr-6">Tanggal</th>
                  <th className="py-3 pr-6">Jumlah</th>
                  <th className="py-3 pr-6">Bank</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {proofs.map(p => {
                  const st = STATUS_MAP[p.status] ?? STATUS_MAP.pending
                  const StIcon = st.icon
                  return (
                    <tr key={p.id}>
                      <td className="py-4 pr-6 font-mono text-xs text-gray-500">{p.id.slice(0, 8)}</td>
                      <td className="py-4 pr-6">
                        {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-4 pr-6 font-medium text-gray-900">
                        Rp {p.amount.toLocaleString('id-ID')}
                      </td>
                      <td className="py-4 pr-6">{p.bank_name || '-'}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>
                          <StIcon size={12} />
                          {st.label}
                        </span>
                        {p.admin_notes && p.status === 'rejected' && (
                          <p className="text-xs text-red-500 mt-1">{p.admin_notes}</p>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
