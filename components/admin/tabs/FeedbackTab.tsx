'use client'

import { useState, useEffect } from 'react'
import { MessageSquarePlus, TrendingUp, TrendingDown, Minus, Loader2 } from 'lucide-react'

interface NpsData {
  average: number
  total: number
  promoters: number
  passives: number
  detractors: number
}

interface FeedbackItem {
  id: string
  user_id: string
  type: string
  score: number
  comment: string
  page: string
  created_at: string
}

export default function FeedbackTab() {
  const [nps, setNps] = useState<NpsData | null>(null)
  const [feedback, setFeedback] = useState<FeedbackItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/feedback')
      .then(r => r.json())
      .then(d => { setNps(d.nps); setFeedback(d.feedback ?? []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-stone-300" /></div>
  }

  const scoreColor = (s: number) => s >= 9 ? 'text-green-600 bg-green-50' : s >= 7 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50'

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-bold text-stone-900">Customer Feedback</h2>
        <p className="text-sm text-stone-400 mt-0.5">NPS score dan feedback dari pengguna</p>
      </div>

      {/* NPS Overview */}
      {nps && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="col-span-2 sm:col-span-1 bg-white rounded-2xl border border-stone-100 p-5">
            <div className="flex items-center gap-2 mb-2">
              {nps.average >= 50 ? <TrendingUp size={16} className="text-green-500" /> :
               nps.average >= 0 ? <Minus size={16} className="text-amber-500" /> :
               <TrendingDown size={16} className="text-red-500" />}
              <span className="text-xs text-stone-400 font-medium">NPS Score</span>
            </div>
            <p className={`text-3xl font-bold ${nps.average >= 50 ? 'text-green-600' : nps.average >= 0 ? 'text-amber-600' : 'text-red-600'}`}>
              {nps.average}
            </p>
          </div>
          {[
            { label: 'Total', value: nps.total, color: 'text-stone-900' },
            { label: 'Promoters (9-10)', value: nps.promoters, color: 'text-green-600' },
            { label: 'Passives (7-8)', value: nps.passives, color: 'text-amber-600' },
            { label: 'Detractors (0-6)', value: nps.detractors, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl border border-stone-100 p-4">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-stone-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* NPS Distribution Bar */}
      {nps && nps.total > 0 && (
        <div className="bg-white rounded-2xl border border-stone-100 p-5">
          <h3 className="text-sm font-bold text-stone-900 mb-3">Distribusi NPS</h3>
          <div className="flex rounded-full overflow-hidden h-4">
            {nps.promoters > 0 && (
              <div className="bg-green-500 transition-all" style={{ width: `${(nps.promoters / nps.total) * 100}%` }} title={`Promoters: ${nps.promoters}`} />
            )}
            {nps.passives > 0 && (
              <div className="bg-amber-400 transition-all" style={{ width: `${(nps.passives / nps.total) * 100}%` }} title={`Passives: ${nps.passives}`} />
            )}
            {nps.detractors > 0 && (
              <div className="bg-red-500 transition-all" style={{ width: `${(nps.detractors / nps.total) * 100}%` }} title={`Detractors: ${nps.detractors}`} />
            )}
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-stone-400">
            <span className="text-green-600">{nps.total > 0 ? Math.round((nps.promoters / nps.total) * 100) : 0}% Promoters</span>
            <span className="text-amber-600">{nps.total > 0 ? Math.round((nps.passives / nps.total) * 100) : 0}% Passives</span>
            <span className="text-red-600">{nps.total > 0 ? Math.round((nps.detractors / nps.total) * 100) : 0}% Detractors</span>
          </div>
        </div>
      )}

      {/* Feedback List */}
      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-50 flex items-center gap-2">
          <MessageSquarePlus size={16} className="text-rose-500" />
          <h3 className="text-sm font-bold text-stone-900">Semua Feedback ({feedback.length})</h3>
        </div>

        {feedback.length === 0 ? (
          <div className="p-8 text-center text-sm text-stone-400">Belum ada feedback</div>
        ) : (
          <div className="divide-y divide-stone-50 max-h-[500px] overflow-y-auto">
            {feedback.map(f => (
              <div key={f.id} className="px-5 py-4 flex items-start gap-4">
                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${scoreColor(f.score)}`}>
                  {f.score}
                </div>
                <div className="flex-1 min-w-0">
                  {f.comment ? (
                    <p className="text-sm text-stone-700">{f.comment}</p>
                  ) : (
                    <p className="text-sm text-stone-300 italic">Tanpa komentar</p>
                  )}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-[10px] text-stone-400 font-mono">{f.user_id.slice(0, 8)}</span>
                    {f.page && <span className="text-[10px] bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded">{f.page}</span>}
                    <span className="text-[10px] text-stone-300">
                      {new Date(f.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
