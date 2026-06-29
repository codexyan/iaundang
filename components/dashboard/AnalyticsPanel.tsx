'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Eye, Users, Heart, MessageCircle, TrendingUp,
  Calendar, ExternalLink, Loader2, BarChart3,
  UserCheck, UserX, Clock,
} from 'lucide-react'
import type { Invitation } from '@/lib/types'

interface Props {
  invitation: Invitation
}

interface AnalyticsData {
  totalViews: number
  viewsThisWeek: number
  dailyViews: { date: string; count: number }[]
  topReferrers: { referrer: string; count: number }[]
  rsvp: { total: number; attending: number; declined: number; pending: number }
  wishes: number
}

function StatCard({ label, value, icon: Icon, color, sub }: {
  label: string; value: number | string; icon: React.ElementType; color: string; sub?: string
}) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    green: 'bg-green-50 text-green-600 border-green-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
  }
  return (
    <div className={`rounded-2xl border p-4 ${colors[color] ?? colors.blue}`}>
      <Icon size={16} className="mb-2 opacity-70" />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs opacity-70 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] opacity-50 mt-0.5">{sub}</p>}
    </div>
  )
}

function MiniBarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1)
  const recent = data.slice(-14)

  return (
    <div className="flex items-end gap-[3px] h-20">
      {recent.map((d, i) => {
        const h = Math.max((d.count / max) * 100, 4)
        const isToday = i === recent.length - 1
        return (
          <motion.div
            key={d.date}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ duration: 0.4, delay: i * 0.03 }}
            className={`flex-1 rounded-t-sm ${isToday ? 'bg-blue-500' : 'bg-blue-200'}`}
            title={`${d.date}: ${d.count} views`}
          />
        )
      })}
    </div>
  )
}

export default function AnalyticsPanel({ invitation }: Props) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [range, setRange] = useState<'7' | '14' | '30'>('30')

  useEffect(() => {
    setLoading(true)
    fetch(`/api/analytics?invitation_id=${invitation.id}&days=${range}`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [invitation.id, range])

  const rsvpRate = useMemo(() => {
    if (!data || data.rsvp.total === 0) return null
    return Math.round((data.rsvp.attending / data.rsvp.total) * 100)
  }, [data])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-stone-300" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-gray-400 text-sm">Gagal memuat data analytics.</div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Analitik Undangan</h2>
          <p className="text-xs text-gray-400 mt-0.5">Statistik performa undangan kamu</p>
        </div>
        <select
          value={range}
          onChange={e => setRange(e.target.value as typeof range)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-600 outline-none focus:ring-2 focus:ring-blue-400 bg-white"
        >
          <option value="7">7 hari</option>
          <option value="14">14 hari</option>
          <option value="30">30 hari</option>
        </select>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Total Views"
          value={data.totalViews}
          icon={Eye}
          color="blue"
          sub={`${data.viewsThisWeek} minggu ini`}
        />
        <StatCard
          label="RSVP"
          value={data.rsvp.total}
          icon={Users}
          color="green"
          sub={rsvpRate !== null ? `${rsvpRate}% hadir` : undefined}
        />
        <StatCard
          label="Akan Hadir"
          value={data.rsvp.attending}
          icon={Heart}
          color="rose"
        />
        <StatCard
          label="Ucapan"
          value={data.wishes}
          icon={MessageCircle}
          color="violet"
        />
      </div>

      {/* View chart */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BarChart3 size={16} className="text-blue-500" />
            <h3 className="font-bold text-gray-900 text-sm">Views Harian</h3>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <TrendingUp size={12} />
            <span>{data.viewsThisWeek} views / 7 hari</span>
          </div>
        </div>
        <MiniBarChart data={data.dailyViews} />
        <div className="flex justify-between mt-2 text-[10px] text-gray-300">
          <span>{data.dailyViews[Math.max(0, data.dailyViews.length - 14)]?.date.slice(5)}</span>
          <span>Hari ini</span>
        </div>
      </div>

      {/* RSVP breakdown */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
          <Users size={16} className="text-green-500" />
          Ringkasan RSVP
        </h3>
        <div className="space-y-3">
          {[
            { label: 'Akan Hadir', value: data.rsvp.attending, icon: UserCheck, color: 'text-green-500', bg: 'bg-green-500' },
            { label: 'Berhalangan', value: data.rsvp.declined, icon: UserX, color: 'text-red-400', bg: 'bg-red-400' },
            { label: 'Belum RSVP', value: data.rsvp.pending, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-400' },
          ].map(item => {
            const pct = data.rsvp.total > 0 ? Math.round((item.value / data.rsvp.total) * 100) : 0
            return (
              <div key={item.label} className="flex items-center gap-3">
                <item.icon size={14} className={item.color} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{item.label}</span>
                    <span className="text-xs text-gray-400">{item.value} ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6 }}
                      className={`h-full rounded-full ${item.bg}`}
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Top referrers */}
      {data.topReferrers.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2">
            <ExternalLink size={16} className="text-indigo-500" />
            Sumber Pengunjung
          </h3>
          <div className="space-y-2">
            {data.topReferrers.map((ref, i) => (
              <div key={ref.referrer} className="flex items-center gap-3 py-1.5">
                <span className="text-xs text-gray-300 w-5 text-right font-mono">{i + 1}</span>
                <span className="flex-1 text-sm text-gray-700 truncate font-mono">{ref.referrer}</span>
                <span className="text-xs text-gray-400 font-semibold">{ref.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {data.totalViews === 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-6 text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-bold text-blue-900 text-sm mb-1">Belum ada data views</h3>
          <p className="text-xs text-blue-700">
            Bagikan link undangan kamu dan data analytics akan mulai tercatat di sini.
          </p>
        </div>
      )}
    </div>
  )
}
