'use client'

import { useEffect, useState } from 'react'
import {
  FileEdit, Images, Music, Users, Copy, Share2,
  CheckCircle2, ExternalLink, CalendarDays,
  TrendingUp, Heart, MessageCircle, ArrowRight,
  Zap, Globe, Eye,
} from 'lucide-react'
import type { Invitation, NewInvitationData } from '@/lib/types'
import { LEGACY_TEMPLATE_IDS as LTI } from '@/lib/types'
import { getInvitationUrl } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Props {
  invitation: Invitation
  onNavigate: (tab: string) => void
  onTogglePublish: () => void
}

interface Stats {
  totalRsvp: number
  totalHadir: number
  totalUcapan: number
}

interface DisplayData {
  groomName: string
  brideName: string
  akadDate: string
  akadVenue: string
  resepsiDate: string
  resepsiVenue: string
  musicUrl: string
}

function normalizeData(inv: Invitation): DisplayData {
  const isLegacy = (LTI as string[]).includes(inv.template_id)
  if (isLegacy) {
    const d = inv.data
    return {
      groomName: d.groomName || '',
      brideName: d.brideName || '',
      akadDate: d.akadDate || '',
      akadVenue: d.akadVenue || '',
      resepsiDate: d.resepsiDate || '',
      resepsiVenue: d.resepsiVenue || '',
      musicUrl: d.musicUrl || '',
    }
  }
  const d = inv.data as unknown as NewInvitationData
  return {
    groomName: d.groom_name || '',
    brideName: d.bride_name || '',
    akadDate: d.akad?.date || '',
    akadVenue: d.akad?.venue_name || '',
    resepsiDate: d.resepsi?.date || '',
    resepsiVenue: d.resepsi?.venue_name || '',
    musicUrl: d.music_url || '',
  }
}

function getDaysUntil(dateStr: string): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export default function DashboardOverview({ invitation, onNavigate, onTogglePublish }: Props) {
  const [stats, setStats] = useState<Stats | null>(null)
  const d = normalizeData(invitation)

  useEffect(() => {
    Promise.all([
      fetch(`/api/rsvp?invitationId=${invitation.id}`).then(r => r.json()),
      fetch(`/api/wishes?invitationId=${invitation.id}`).then(r => r.json()),
    ]).then(([{ guests }, { wishes }]) => {
      const hadir = (guests || []).filter((g: { attending: boolean; total_guests: number }) => g.attending)
        .reduce((acc: number, g: { total_guests: number }) => acc + g.total_guests, 0)
      setStats({
        totalRsvp: (guests || []).length,
        totalHadir: hadir,
        totalUcapan: (wishes || []).length,
      })
    })
  }, [invitation.id])

  const daysUntil = d.akadDate ? getDaysUntil(d.akadDate) : null
  const invUrl = getInvitationUrl(invitation.slug)

  const checklist = [
    {
      label: 'Nama mempelai',
      done: !!(d.groomName && d.brideName),
      doneText: d.groomName && d.brideName ? `${d.groomName} & ${d.brideName}` : '',
      todoText: 'Isi nama mempelai pria & wanita',
      action: () => onNavigate('undangan'),
    },
    {
      label: 'Foto mempelai',
      done: false,
      doneText: 'Sudah diisi',
      todoText: 'Upload foto di section Profil',
      action: () => onNavigate('undangan'),
    },
    {
      label: 'Detail acara',
      done: !!(d.akadDate && d.akadVenue),
      doneText: d.akadDate ? `${new Date(d.akadDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · ${d.akadVenue}` : '',
      todoText: 'Isi tanggal, waktu, dan lokasi',
      action: () => onNavigate('undangan'),
    },
    {
      label: 'Galeri foto',
      done: false,
      doneText: 'Foto sudah diupload',
      todoText: 'Upload foto di section Galeri',
      action: () => onNavigate('undangan'),
    },
    {
      label: 'Musik background',
      done: !!d.musicUrl,
      doneText: 'Musik terpasang',
      todoText: 'Pilih musik di tab Undangan → Musik',
      action: () => onNavigate('undangan'),
    },
    {
      label: 'Publish undangan',
      done: invitation.is_published,
      doneText: invitation.is_paid ? 'Live & aktif' : 'Live (watermark)',
      todoText: 'Publish untuk mengaktifkan link',
      action: onTogglePublish,
    },
  ]
  const doneCount = checklist.filter(c => c.done).length
  const progress = Math.round((doneCount / checklist.length) * 100)

  return (
    <div className="space-y-6">

      {/* Hero status card */}
      {invitation.is_published ? (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 p-6 text-white">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                  <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider">Undangan Aktif</p>
                </div>
                <p className="font-mono text-base font-semibold truncate text-white/95">{invitation.slug}.iaundang.id</p>
                {invitation.expires_at && (
                  <p className="text-emerald-200/70 text-xs mt-1.5">
                    Aktif hingga {new Date(invitation.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => { navigator.clipboard.writeText(invUrl); toast.success('Link disalin!') }}
                  className="flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-all backdrop-blur-sm"
                >
                  <Copy size={12} /> Salin
                </button>
                <a
                  href={`https://wa.me/?text=Yuk lihat undangan pernikahan kami! ${invUrl}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 bg-white text-emerald-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all hover:bg-emerald-50"
                >
                  <Share2 size={12} /> Share WA
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-stone-50 to-amber-50/50 border border-amber-200/60 p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100/40 rounded-full -translate-y-1/2 translate-x-1/3" />
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center shrink-0">
              <Globe size={22} className="text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-stone-800">Undangan belum dipublish</p>
              <p className="text-xs text-stone-500 mt-0.5">Lengkapi data lalu klik Publish untuk mengaktifkan link undangan.</p>
            </div>
            <button
              onClick={onTogglePublish}
              className="shrink-0 flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:shadow-lg hover:shadow-amber-500/20 transition-all"
            >
              <Zap size={13} /> Publish
            </button>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Countdown */}
        <div className="relative overflow-hidden bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
          <div className="absolute top-3 right-3 w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center">
            <CalendarDays size={14} className="text-rose-400" />
          </div>
          <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wider mb-1">Countdown</p>
          {daysUntil !== null ? (
            <>
              <p className={`text-3xl font-bold tracking-tight ${daysUntil <= 30 ? 'text-amber-600' : 'text-stone-800'}`}>
                {daysUntil > 0 ? daysUntil : daysUntil === 0 ? '0' : '—'}
              </p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {daysUntil > 0 ? 'hari lagi' : daysUntil === 0 ? 'Hari ini!' : 'Sudah lewat'}
              </p>
            </>
          ) : (
            <p className="text-sm text-stone-300 mt-2">Belum diisi</p>
          )}
        </div>

        {[
          { label: 'Total RSVP', value: stats?.totalRsvp, icon: Users, color: 'blue' },
          { label: 'Akan Hadir', value: stats?.totalHadir, icon: Heart, color: 'rose' },
          { label: 'Ucapan', value: stats?.totalUcapan, icon: MessageCircle, color: 'violet' },
        ].map((s) => (
          <div key={s.label} className="relative overflow-hidden bg-white rounded-2xl p-5 border border-stone-100 shadow-sm">
            <div className={`absolute top-3 right-3 w-8 h-8 rounded-lg bg-${s.color}-50 flex items-center justify-center`}>
              <s.icon size={14} className={`text-${s.color}-400`} />
            </div>
            <p className="text-[11px] text-stone-400 font-medium uppercase tracking-wider mb-1">{s.label}</p>
            <p className="text-3xl font-bold text-stone-800 tracking-tight">
              {stats !== null ? (s.value ?? 0) : '—'}
            </p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              {stats !== null ? 'total' : 'memuat...'}
            </p>
          </div>
        ))}
      </div>

      {/* Progress + Checklist */}
      <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="px-6 pt-5 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-stone-800 text-sm">Kelengkapan Undangan</h3>
              <p className="text-[11px] text-stone-400 mt-0.5">
                {doneCount === checklist.length ? 'Semua lengkap!' : `${doneCount}/${checklist.length} selesai`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-bold text-stone-500 tabular-nums">{progress}%</span>
            </div>
          </div>
        </div>

        <div className="divide-y divide-stone-50">
          {checklist.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-center gap-3.5 px-6 py-3.5 text-left transition-all group ${
                item.done ? 'bg-emerald-50/40' : 'hover:bg-amber-50/40'
              }`}
            >
              <div className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                item.done
                  ? 'bg-emerald-500 shadow-sm shadow-emerald-500/30'
                  : 'border-2 border-stone-200 group-hover:border-amber-400'
              }`}>
                {item.done && <CheckCircle2 size={11} className="text-white" strokeWidth={3} />}
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-[13px] font-medium ${item.done ? 'text-stone-400 line-through' : 'text-stone-700'}`}>
                  {item.label}
                </p>
                <p className={`text-[11px] mt-0.5 truncate ${item.done ? 'text-emerald-600' : 'text-stone-400'}`}>
                  {item.done ? item.doneText : item.todoText}
                </p>
              </div>

              {!item.done && (
                <ArrowRight size={14} className="shrink-0 text-stone-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: FileEdit, label: 'Edit Undangan', sub: 'Semua konten', tab: 'undangan', gradient: 'from-amber-500 to-orange-500' },
          { icon: Images, label: 'Galeri', sub: 'Upload foto', tab: 'undangan', gradient: 'from-rose-500 to-pink-500' },
          { icon: Users, label: 'RSVP', sub: 'Tamu & respons', tab: 'rsvp', gradient: 'from-blue-500 to-indigo-500' },
          { icon: Eye, label: 'Preview', sub: 'Lihat undangan', tab: 'undangan', gradient: 'from-violet-500 to-purple-500' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate(item.tab)}
            className="flex items-center gap-3 bg-white border border-stone-100 rounded-2xl p-4 hover:shadow-md hover:border-stone-200 transition-all text-left group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow`}>
              <item.icon size={18} className="text-white" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-stone-800">{item.label}</p>
              <p className="text-[11px] text-stone-400">{item.sub}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Invitation summary */}
      {(d.groomName || d.akadDate) && (
        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-800 text-sm">Ringkasan Undangan</h3>
            <button onClick={() => onNavigate('undangan')} className="text-[11px] text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 transition-colors">
              Edit <ArrowRight size={11} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Mempelai Pria', value: d.groomName },
              { label: 'Mempelai Wanita', value: d.brideName },
              { label: 'Tanggal Akad', value: d.akadDate ? new Date(d.akadDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null },
              { label: 'Lokasi Akad', value: d.akadVenue },
              { label: 'Tanggal Resepsi', value: d.resepsiDate ? new Date(d.resepsiDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null },
              { label: 'Lokasi Resepsi', value: d.resepsiVenue },
            ].filter(item => item.value).map((item) => (
              <div key={item.label} className="bg-stone-50/80 rounded-xl px-4 py-3">
                <p className="text-[10px] text-stone-400 uppercase tracking-wider font-medium mb-0.5">{item.label}</p>
                <p className="text-[13px] text-stone-700 font-medium">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
