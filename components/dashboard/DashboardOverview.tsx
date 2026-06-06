'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileEdit, Images, Music, Users, Copy, Share2, CheckCircle2, Circle, ExternalLink, CalendarDays } from 'lucide-react'
import type { Invitation, NewInvitationData } from '@/lib/types'
import { LEGACY_TEMPLATE_IDS as LTI } from '@/lib/types'
import { getPackage, type PackageTier } from '@/lib/packages'
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

// Normalized display data from either old or new format
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

  // Checklist kelengkapan undangan — with clear action per item
  const checklist = [
    {
      label: 'Nama mempelai',
      done: !!(d.groomName && d.brideName),
      doneText: d.groomName && d.brideName ? `${d.groomName} & ${d.brideName}` : '',
      todoText: 'Isi nama mempelai pria & wanita',
      tab: 'undangan',
      action: () => onNavigate('undangan'),
    },
    {
      label: 'Foto mempelai',
      done: false, // checked via data, legacy always false as we can't check couple_photo here
      doneText: 'Sudah diisi',
      todoText: 'Upload foto di tab Undangan → section Profil Mempelai',
      tab: 'undangan',
      action: () => onNavigate('undangan'),
    },
    {
      label: 'Detail acara (akad & resepsi)',
      done: !!(d.akadDate && d.akadVenue),
      doneText: d.akadDate ? `${new Date(d.akadDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} · ${d.akadVenue}` : '',
      todoText: 'Isi tanggal, waktu, dan lokasi akad & resepsi',
      tab: 'undangan',
      action: () => onNavigate('undangan'),
    },
    {
      label: 'Galeri foto',
      done: false,
      doneText: 'Foto sudah diupload',
      todoText: 'Upload minimal 5 foto di tab Galeri',
      tab: 'gallery',
      action: () => onNavigate('gallery'),
    },
    {
      label: 'Musik background',
      done: !!d.musicUrl,
      doneText: 'Musik terpasang',
      todoText: 'Upload file MP3 di tab Musik',
      tab: 'music',
      action: () => onNavigate('music'),
    },
    {
      label: 'Publish undangan',
      done: invitation.is_published,
      doneText: '✓ Live — tamu bisa membuka undangan',
      todoText: 'Klik tombol Publish di header dashboard',
      tab: '',
      action: onTogglePublish,
    },
  ]
  const doneCount = checklist.filter(c => c.done).length
  const progress = Math.round((doneCount / checklist.length) * 100)

  return (
    <div className="space-y-5">

      {/* Countdown + link */}
      {invitation.is_published ? (
        <div className="bg-gradient-to-r from-rose-600 to-rose-500 rounded-2xl p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-rose-200 text-xs font-medium uppercase tracking-wider mb-1">Undangan Aktif</p>
              <p className="font-mono text-sm font-semibold truncate">{invitation.slug}.akundang.id</p>
              {invitation.expires_at && (
                <p className="text-rose-300 text-xs mt-1">
                  Aktif hingga {new Date(invitation.expires_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => { navigator.clipboard.writeText(invUrl); toast.success('Link disalin!') }}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors"
              >
                <Copy size={12} /> Salin
              </button>
              <a
                href={`https://wa.me/?text=Yuk lihat undangan pernikahan kami! ${invUrl}`}
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-medium px-3 py-2 rounded-xl transition-colors"
              >
                <Share2 size={12} /> Share
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-xl shrink-0">📋</div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">Undangan belum dipublish</p>
              <p className="text-xs text-amber-700 mt-0.5">Lengkapi data di bawah lalu klik Publish untuk mengaktifkan link undangan.</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Countdown */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 col-span-2 sm:col-span-1">
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={14} className="text-rose-400" strokeWidth={1.5} />
            <p className="text-xs text-gray-400">Hari menuju acara</p>
          </div>
          {daysUntil !== null ? (
            <>
              <p className={`text-3xl font-bold ${daysUntil <= 30 ? 'text-gold-600' : 'text-gray-900'}`}>
                {daysUntil > 0 ? daysUntil : daysUntil === 0 ? '🎉' : 'Selesai'}
              </p>
              {daysUntil > 0 && <p className="text-xs text-gray-400">hari lagi</p>}
              {d.akadDate && (
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(d.akadDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </>
          ) : (
            <p className="text-sm text-gray-400 mt-1">Belum diisi</p>
          )}
        </div>

        {[
          { label: 'Total RSVP', value: stats?.totalRsvp, sub: 'tamu merespons' },
          { label: 'Akan Hadir', value: stats?.totalHadir, sub: 'orang konfirmasi' },
          { label: 'Ucapan', value: stats?.totalUcapan, sub: 'pesan masuk' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-gray-100 rounded-2xl p-4">
            <p className="text-xs text-gray-400 mb-1">{s.label}</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats !== null ? s.value : '—'}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Checklist kelengkapan */}
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="px-5 pt-4 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">Kelengkapan Undangan</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              {doneCount === checklist.length
                ? '🎉 Undangan siap dipublish!'
                : `${doneCount} dari ${checklist.length} selesai`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gold-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs font-bold text-gray-500">{progress}%</span>
          </div>
        </div>

        <div className="divide-y divide-gray-50">
          {checklist.map((item, i) => (
            <button
              key={item.label}
              onClick={item.action}
              className={`w-full flex items-start gap-3 px-5 py-3.5 text-left transition-colors group ${item.done ? 'bg-green-50/40' : 'hover:bg-gold-50/30'}`}
            >
              {/* Icon */}
              <div className={`mt-0.5 shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${item.done ? 'bg-green-500' : 'border-2 border-gray-200 group-hover:border-rose-300'} transition-colors`}>
                {item.done && <CheckCircle2 size={12} className="text-white" />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {item.label}
                </p>
                {item.done ? (
                  <p className="text-xs text-green-600 mt-0.5 truncate">{item.doneText}</p>
                ) : (
                  <p className="text-xs text-gray-400 mt-0.5">{item.todoText}</p>
                )}
              </div>

              {/* CTA */}
              {!item.done && (
                <span className="shrink-0 text-xs text-rose-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                  {item.tab ? `Buka tab ${item.tab === 'undangan' ? 'Undangan' : item.tab === 'gallery' ? 'Galeri' : 'Musik'} →` : 'Klik Publish →'}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => onNavigate('undangan')}
          className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 hover:border-gold-200 hover:bg-gold-50/50 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center group-hover:bg-gold-100 transition-colors">
            <FileEdit size={18} className="text-rose-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Edit Undangan</p>
            <p className="text-xs text-gray-400">Nama, tanggal, lokasi</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('gallery')}
          className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 hover:border-gold-200 hover:bg-gold-50/50 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center group-hover:bg-gold-100 transition-colors">
            <Images size={18} className="text-rose-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Galeri</p>
            <p className="text-xs text-gray-400">Upload foto undangan</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('music')}
          className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 hover:border-gold-200 hover:bg-gold-50/50 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center group-hover:bg-gold-100 transition-colors">
            <Music size={18} className="text-rose-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Musik</p>
            <p className="text-xs text-gray-400">Pilih atau upload musik</p>
          </div>
        </button>

        <button
          onClick={() => onNavigate('rsvp')}
          className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl p-4 hover:border-gold-200 hover:bg-gold-50/50 transition-all text-left group"
        >
          <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center group-hover:bg-gold-100 transition-colors">
            <Users size={18} className="text-rose-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">RSVP & Ucapan</p>
            <p className="text-xs text-gray-400">Lihat siapa yang hadir</p>
          </div>
        </button>
      </div>

      {/* Info undangan */}
      {(d.groomName || d.akadDate) && (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 text-sm">Ringkasan Undangan</h3>
            <button onClick={() => onNavigate('undangan')} className="text-xs text-gold-600 hover:underline">Edit</button>
          </div>
          <dl className="divide-y divide-gray-50">
            {[
              { label: 'Mempelai Pria', value: d.groomName },
              { label: 'Mempelai Wanita', value: d.brideName },
              { label: 'Tanggal Akad', value: d.akadDate ? new Date(d.akadDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null },
              { label: 'Lokasi Akad', value: d.akadVenue },
              { label: 'Tanggal Resepsi', value: d.resepsiDate ? new Date(d.resepsiDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : null },
              { label: 'Lokasi Resepsi', value: d.resepsiVenue },
            ].map((item) => item.value && (
              <div key={item.label} className="py-2.5 flex gap-4">
                <dt className="text-xs text-gray-400 w-32 shrink-0 pt-0.5">{item.label}</dt>
                <dd className="text-sm text-gray-800 font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
