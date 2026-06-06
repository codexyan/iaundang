'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Guest, Wish } from '@/lib/types'

interface Props {
  invitationId: string
}

export default function RSVPList({ invitationId }: Props) {
  const [guests, setGuests] = useState<Guest[]>([])
  const [wishes, setWishes] = useState<Wish[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    const [gRes, wRes] = await Promise.all([
      fetch(`/api/rsvp?invitationId=${invitationId}`),
      fetch(`/api/wishes?invitationId=${invitationId}`),
    ])
    const [{ guests: g }, { wishes: w }] = await Promise.all([gRes.json(), wRes.json()])
    setGuests(g || [])
    setWishes(w || [])
    setLoading(false)
  }, [invitationId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const totalAttending = guests.filter((g) => g.attending).reduce((acc, g) => acc + g.total_guests, 0)
  const totalNotAttending = guests.filter((g) => !g.attending).length

  if (loading) {
    return <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-gray-400 text-sm">Memuat...</div>
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total RSVP', value: guests.length },
          { label: 'Hadir', value: totalAttending },
          { label: 'Tidak Hadir', value: totalNotAttending },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-bold text-gold-600">{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          onClick={fetchData}
          className="text-xs text-gold-600 hover:underline"
        >
          Refresh data
        </button>
      </div>

      {/* RSVP list */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Daftar RSVP</h3>
        {guests.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-4">Belum ada RSVP masuk.</p>
        ) : (
          <div className="space-y-2">
            {guests.map((g) => (
              <div key={g.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                <span className={`w-2 h-2 rounded-full shrink-0 ${g.attending ? 'bg-green-500' : 'bg-red-400'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{g.name}</p>
                  <p className="text-xs text-gray-400">
                    {g.attending ? `Hadir • ${g.total_guests} orang` : 'Tidak hadir'}
                  </p>
                </div>
                <span className="text-xs text-gray-300">
                  {new Date(g.created_at).toLocaleDateString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Wishes */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Ucapan Masuk ({wishes.length})</h3>
        {wishes.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-4">Belum ada ucapan masuk.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {wishes.map((w) => (
              <div key={w.id} className="border border-gray-100 rounded-xl p-4">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <p className="font-medium text-sm">{w.name}</p>
                  <p className="text-xs text-gray-300 shrink-0">
                    {new Date(w.created_at).toLocaleDateString('id-ID')}
                  </p>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{w.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
