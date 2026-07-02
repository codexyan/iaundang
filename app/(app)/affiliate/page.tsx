'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  TrendingUp, DollarSign, MousePointer, Users, Copy, Check,
  Wallet, ArrowDownToLine, Clock, CheckCircle, XCircle,
  ExternalLink, Building2, Save,
} from 'lucide-react'

interface AffiliateData {
  id: string; referralCode: string; commissionRate: number
  totalEarnings: number; pendingBalance: number; paidBalance: number
  totalClicks: number; totalConversions: number; isActive: boolean
  bankName: string; accountNo: string; accountName: string
}

interface ReferralData {
  id: string; buyerEmail: string; packageTier: string
  saleAmount: number; commission: number; status: string; createdAt: string
}

interface WithdrawalData {
  id: string; amount: number; status: string; createdAt: string; processedAt: string | null
}

export default function AffiliateDashboard() {
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null)
  const [referralsList, setReferrals] = useState<ReferralData[]>([])
  const [withdrawals, setWithdrawals] = useState<WithdrawalData[]>([])
  const [tab, setTab] = useState<'overview' | 'referrals' | 'withdrawals' | 'settings'>('overview')
  const [copied, setCopied] = useState(false)
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [bankName, setBankName] = useState('')
  const [accountNo, setAccountNo] = useState('')
  const [accountName, setAccountName] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/affiliate')
    if (res.ok) {
      const data = await res.json()
      setAffiliate(data.affiliate)
      setReferrals(data.referrals)
      setWithdrawals(data.withdrawals)
      if (data.affiliate) {
        setBankName(data.affiliate.bankName)
        setAccountNo(data.affiliate.accountNo)
        setAccountName(data.affiliate.accountName)
      }
    }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const [referralLink, setReferralLink] = useState('')

  useEffect(() => {
    if (affiliate && typeof window !== 'undefined') {
      setReferralLink(`${window.location.origin}/?ref=${affiliate.referralCode}`)
    }
  }, [affiliate])

  function copyLink() {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleWithdraw() {
    if (!withdrawAmount) return
    setSaving(true)
    try {
      const res = await fetch('/api/affiliate/withdrawals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(withdrawAmount) }),
      })
      if (res.ok) {
        setWithdrawAmount('')
        await fetchData()
      } else {
        const data = await res.json()
        alert(data.error)
      }
    } finally {
      setSaving(false)
    }
  }

  async function handleSaveBank() {
    setSaving(true)
    try {
      await fetch('/api/affiliate', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bankName, accountNo, accountName }),
      })
      await fetchData()
    } finally {
      setSaving(false)
    }
  }

  function formatRupiah(n: number) {
    return 'Rp ' + n.toLocaleString('id-ID')
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <Users className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-stone-800 mb-2">Akun Affiliate Belum Aktif</h1>
          <p className="text-stone-500 text-sm">
            Akun affiliate kamu belum diaktifkan oleh admin. Hubungi admin untuk mengaktifkan program affiliate.
          </p>
          <Link href="/" className="inline-flex items-center gap-2 mt-6 text-sm text-emerald-600 hover:text-emerald-700">
            <ExternalLink className="w-4 h-4" /> Kembali ke beranda
          </Link>
        </div>
      </div>
    )
  }

  const conversionRate = affiliate.totalClicks > 0
    ? ((affiliate.totalConversions / affiliate.totalClicks) * 100).toFixed(1)
    : '0'

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-stone-900">Affiliate Dashboard</h1>
            <p className="text-sm text-stone-400 mt-0.5">Kelola referral dan pendapatan kamu</p>
          </div>

          {/* Referral Link */}
          <div className="bg-emerald-50 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-emerald-700 mb-1">Link Referral Kamu</p>
              <p className="text-sm text-emerald-800 font-mono truncate">{referralLink}</p>
            </div>
            <button
              onClick={copyLink}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 whitespace-nowrap"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Tersalin!' : 'Salin Link'}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Total Klik', value: affiliate.totalClicks.toString(), icon: MousePointer, color: 'text-blue-600' },
              { label: 'Konversi', value: `${affiliate.totalConversions} (${conversionRate}%)`, icon: TrendingUp, color: 'text-emerald-600' },
              { label: 'Saldo Pending', value: formatRupiah(affiliate.pendingBalance), icon: Wallet, color: 'text-amber-600' },
              { label: 'Total Dibayar', value: formatRupiah(affiliate.paidBalance), icon: DollarSign, color: 'text-green-600' },
            ].map(s => (
              <div key={s.label} className="bg-stone-50 rounded-xl px-4 py-3">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs text-stone-400">{s.label}</span>
                </div>
                <p className="text-sm sm:text-base font-bold text-stone-700">{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { id: 'overview' as const, label: 'Ringkasan' },
            { id: 'referrals' as const, label: 'Riwayat Referral' },
            { id: 'withdrawals' as const, label: 'Pencairan' },
            { id: 'settings' as const, label: 'Pengaturan Bank' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2 text-sm rounded-lg whitespace-nowrap ${
                tab === t.id ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-800 mb-4">Cara Kerja Affiliate</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { step: '1', title: 'Bagikan Link', desc: 'Kirim link referral ke calon pengantin lewat sosial media atau langsung' },
                  { step: '2', title: 'Mereka Beli Paket', desc: 'Saat mereka membeli paket premium melalui link kamu, penjualan tercatat' },
                  { step: '3', title: `Dapat ${affiliate.commissionRate}% Komisi`, desc: 'Komisi otomatis masuk ke saldo dan bisa dicairkan kapan saja' },
                ].map(s => (
                  <div key={s.step} className="text-center p-4">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center mx-auto mb-3">
                      {s.step}
                    </div>
                    <h3 className="font-medium text-stone-800 mb-1">{s.title}</h3>
                    <p className="text-xs text-stone-400">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-800 mb-2">Total Pendapatan</h2>
              <p className="text-3xl font-bold text-emerald-600">{formatRupiah(affiliate.totalEarnings)}</p>
              <p className="text-sm text-stone-400 mt-1">Komisi {affiliate.commissionRate}% dari setiap penjualan paket premium</p>
            </div>
          </div>
        )}

        {tab === 'referrals' && (
          <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
            {referralsList.length === 0 ? (
              <div className="text-center py-16">
                <MousePointer className="w-10 h-10 text-stone-200 mx-auto mb-3" />
                <p className="text-stone-500 font-medium">Belum ada referral</p>
                <p className="text-sm text-stone-400 mt-1">Mulai bagikan link referral kamu!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-stone-50 text-xs text-stone-500 uppercase">
                    <tr>
                      <th className="text-left px-4 py-3">Pembeli</th>
                      <th className="text-left px-4 py-3">Paket</th>
                      <th className="text-right px-4 py-3">Penjualan</th>
                      <th className="text-right px-4 py-3">Komisi</th>
                      <th className="text-center px-4 py-3">Status</th>
                      <th className="text-right px-4 py-3">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {referralsList.map(r => (
                      <tr key={r.id}>
                        <td className="px-4 py-3 text-stone-700">{r.buyerEmail || ''}</td>
                        <td className="px-4 py-3 text-stone-500">{r.packageTier || ''}</td>
                        <td className="px-4 py-3 text-right text-stone-700">{formatRupiah(r.saleAmount)}</td>
                        <td className="px-4 py-3 text-right font-medium text-emerald-600">{formatRupiah(r.commission)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            r.status === 'converted' ? 'bg-emerald-50 text-emerald-700' : 'bg-stone-100 text-stone-500'
                          }`}>
                            {r.status === 'converted' ? 'Terkonversi' : r.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-stone-400">
                          {new Date(r.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === 'withdrawals' && (
          <div className="space-y-4">
            {/* Withdraw Form */}
            <div className="bg-white rounded-xl border border-stone-100 p-6">
              <h2 className="font-semibold text-stone-800 mb-4">Cairkan Saldo</h2>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="text-xs text-stone-400 mb-1 block">Jumlah (min. Rp 50.000)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(e.target.value)}
                    placeholder="50000"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-emerald-300"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleWithdraw}
                    disabled={saving || !withdrawAmount || Number(withdrawAmount) < 50000}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    <ArrowDownToLine className="w-4 h-4" />
                    Cairkan
                  </button>
                </div>
              </div>
              <p className="text-xs text-stone-400 mt-2">Saldo tersedia: <span className="font-medium text-stone-600">{formatRupiah(affiliate.pendingBalance)}</span></p>
            </div>

            {/* Withdrawal History */}
            <div className="bg-white rounded-xl border border-stone-100 overflow-hidden">
              <h2 className="font-semibold text-stone-800 px-6 pt-5 pb-3">Riwayat Pencairan</h2>
              {withdrawals.length === 0 ? (
                <div className="text-center py-12 pb-8">
                  <Wallet className="w-10 h-10 text-stone-200 mx-auto mb-3" />
                  <p className="text-stone-400 text-sm">Belum ada pencairan</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-50">
                  {withdrawals.map(w => (
                    <div key={w.id} className="flex items-center justify-between px-6 py-4">
                      <div>
                        <p className="font-medium text-stone-700">{formatRupiah(w.amount)}</p>
                        <p className="text-xs text-stone-400">{new Date(w.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full flex items-center gap-1 ${
                        w.status === 'approved' ? 'bg-emerald-50 text-emerald-700' :
                        w.status === 'rejected' ? 'bg-red-50 text-red-700' :
                        'bg-amber-50 text-amber-700'
                      }`}>
                        {w.status === 'approved' ? <CheckCircle className="w-3 h-3" /> :
                         w.status === 'rejected' ? <XCircle className="w-3 h-3" /> :
                         <Clock className="w-3 h-3" />}
                        {w.status === 'approved' ? 'Dibayar' : w.status === 'rejected' ? 'Ditolak' : 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'settings' && (
          <div className="bg-white rounded-xl border border-stone-100 p-6">
            <h2 className="font-semibold text-stone-800 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-stone-400" />
              Informasi Bank untuk Pencairan
            </h2>
            <div className="space-y-4 max-w-md">
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Nama Bank</label>
                <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} placeholder="BCA, BNI, Mandiri..." className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-emerald-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Nomor Rekening</label>
                <input type="text" value={accountNo} onChange={e => setAccountNo(e.target.value)} placeholder="1234567890" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-emerald-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-stone-500 mb-1 block">Nama Pemilik Rekening</label>
                <input type="text" value={accountName} onChange={e => setAccountName(e.target.value)} placeholder="Nama sesuai buku tabungan" className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm outline-none focus:border-emerald-300" />
              </div>
              <button
                onClick={handleSaveBank}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
