'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta, Wish } from '@/lib/types'
import SectionWrapper, { resolveFont, fsb } from '../SectionWrapper'
import { Send, MessageCircle, Loader2, Feather } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
  invitationId: string
  initialWishes?: Wish[]
}

// Warna avatar berputar sesuai index
const AVATAR_GRADIENTS: [string, string][] = [
  ['#8B5CF6', '#6D28D9'],
  ['#EC4899', '#BE185D'],
  ['#3B82F6', '#1D4ED8'],
  ['#10B981', '#047857'],
  ['#F59E0B', '#B45309'],
  ['#EF4444', '#B91C1C'],
  ['#06B6D4', '#0E7490'],
  ['#84CC16', '#4D7C0F'],
]

function avatarGradient(_name: string, idx: number): [string, string] {
  return AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
}

export default function WishesSection({ section, data, meta, invitationId, initialWishes = [] }: Props) {
  const { accent, text, primary } = meta.color_scheme
  const font = resolveFont(meta, section)

  const [wishes,  setWishes]  = useState<Wish[]>(initialWishes)
  const [name,    setName]    = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [justSent, setJustSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !message.trim()) { setError('Mohon isi nama dan ucapan terlebih dahulu'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/wishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId, name: name.trim(), message: message.trim() }),
      })
      if (!res.ok) throw new Error('Gagal mengirim')
      const { wish } = await res.json()
      setWishes(prev => [wish, ...prev])
      setName(''); setMessage('')
      setJustSent(true)
      setTimeout(() => setJustSent(false), 3000)
    } catch { setError('Terjadi kesalahan, coba lagi') }
    finally   { setLoading(false) }
  }

  const MAX_MSG = 300

  return (
    <SectionWrapper section={section} className="px-6">
      <div className="max-w-sm mx-auto w-full py-12">

        {/* ── Header ── */}
        <div className="text-center mb-8">
          <motion.div className="flex items-center justify-center gap-3 mb-5"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <div className="h-px flex-1 max-w-10" style={{ background: `linear-gradient(to right, transparent, ${accent}55)` }} />
            <p style={{ fontSize: fsb(10), letterSpacing: '0.36em', textTransform: 'uppercase', color: `${accent}80`, fontFamily: `'${font.body}', serif` }}>
              Buku Ucapan
            </p>
            <div className="h-px flex-1 max-w-10" style={{ background: `linear-gradient(to left, transparent, ${accent}55)` }} />
          </motion.div>
          <motion.p style={{ fontSize: fsb(13), color: `${text}70`, fontFamily: `'${font.body}', serif`, lineHeight: 1.7 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.1 } } }}>
            Tuliskan doa dan harapan terbaik<br />untuk pasangan yang berbahagia ini
          </motion.p>
        </div>

        {/* ── Form card ── */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: 0.18 } } }}
          className="rounded-3xl overflow-hidden mb-7"
          style={{
            background: `linear-gradient(145deg, ${accent}0e, ${accent}06)`,
            border: `1.5px solid ${accent}22`,
            boxShadow: `0 4px 24px ${accent}12`,
          }}>

          {/* Form header */}
          <div className="flex items-center gap-2.5 px-4 pt-4 pb-3"
            style={{ borderBottom: `1px solid ${accent}15` }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}>
              <Feather size={13} color="white" />
            </div>
            <p style={{ fontSize: 12, fontWeight: 700, color: accent, letterSpacing: '0.04em', fontFamily: `'${font.body}', serif` }}>
              Kirim Ucapan
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-4 space-y-3">
            {/* Name */}
            <input
              type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Nama Anda..."
              className="w-full px-4 py-2.5 rounded-xl text-sm transition-all"
              style={{
                background: `${accent}10`, border: `1.5px solid ${accent}20`,
                color: text, fontFamily: `'${font.body}', serif`, outline: 'none',
                fontSize: 13,
              }}
              onFocus={e => { e.target.style.borderColor = `${accent}55`; e.target.style.background = `${accent}16` }}
              onBlur={e  => { e.target.style.borderColor = `${accent}20`; e.target.style.background = `${accent}10` }}
            />

            {/* Message */}
            <div className="relative">
              <textarea
                value={message} onChange={e => setMessage(e.target.value.slice(0, MAX_MSG))}
                placeholder="Tuliskan doa, harapan, dan ucapan selamat untuk pasangan yang berbahagia..."
                rows={3}
                className="w-full px-4 pt-3 pb-8 rounded-xl text-sm resize-none transition-all"
                style={{
                  background: `${accent}10`, border: `1.5px solid ${accent}20`,
                  color: text, fontFamily: `'${font.body}', serif`, outline: 'none',
                  fontSize: 13, lineHeight: 1.6,
                }}
                onFocus={e => { e.target.style.borderColor = `${accent}55`; e.target.style.background = `${accent}16` }}
                onBlur={e  => { e.target.style.borderColor = `${accent}20`; e.target.style.background = `${accent}10` }}
              />
              {/* Char count */}
              <p className="absolute bottom-2.5 left-4"
                style={{ fontSize: 9, color: message.length > MAX_MSG * 0.9 ? '#f87171' : `${text}35` }}>
                {message.length}/{MAX_MSG}
              </p>
            </div>

            {error && <p style={{ fontSize: 11, color: '#ef4444' }}>{error}</p>}

            {/* Send button */}
            <button type="submit" disabled={loading || !name.trim() || !message.trim()}
              className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all disabled:opacity-40 active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                color: 'white', fontSize: 13,
                boxShadow: `0 3px 14px ${accent}40`,
                fontFamily: `'${font.body}', serif`,
              }}>
              {loading
                ? <><Loader2 size={14} className="animate-spin" />Mengirim...</>
                : <><Send size={13} />Kirim Ucapan</>
              }
            </button>

            {/* Just sent toast */}
            <AnimatePresence>
              {justSent && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                  className="flex items-center justify-center gap-1.5"
                  style={{ color: accent }}>
                  <span style={{ fontSize: 14 }}>💌</span>
                  <p style={{ fontSize: 11, fontWeight: 600 }}>Terima kasih! Ucapan Anda sangat berarti 🤍</p>
                </motion.div>
              )}
            </AnimatePresence>
          </form>
        </motion.div>

        {/* ── Wish list ── */}
        {wishes.length === 0 ? (
          <motion.div
            className="text-center py-8"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.3 } } }}>
            <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3"
              style={{ background: `${accent}10` }}>
              <MessageCircle size={22} color={`${accent}60`} />
            </div>
            <p style={{ fontSize: 12, color: `${text}44`, fontFamily: `'${font.body}', serif` }}>
              Jadilah yang pertama<br />mengucapkan selamat! ✨
            </p>
          </motion.div>
        ) : (
          <motion.div
            className="space-y-4"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.25, staggerChildren: 0.07 } } }}>

            {wishes.map((wish, i) => {
              const [g1, g2] = avatarGradient(wish.name, i)
              const initial  = wish.name.trim().charAt(0).toUpperCase()

              return (
                <motion.div key={wish.id}
                  variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}
                  className="flex gap-3 items-start">

                  {/* Avatar */}
                  <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm"
                    style={{
                      background: `linear-gradient(135deg, ${g1}, ${g2})`,
                      boxShadow: `0 2px 8px ${g1}55`,
                      fontSize: 13,
                    }}>
                    {initial}
                  </div>

                  {/* Bubble */}
                  <div className="flex-1 min-w-0">
                    {/* Name + time row */}
                    <div className="flex items-baseline justify-between mb-1.5 gap-2">
                      <p style={{ fontSize: 12, fontWeight: 700, color: accent, fontFamily: `'${font.body}', serif`, flexShrink: 0 }}>
                        {wish.name}
                      </p>
                      <p style={{ fontSize: 9, color: `${text}38`, whiteSpace: 'nowrap' }}>
                        {formatDistanceToNow(parseISO(wish.created_at), { addSuffix: true, locale: localeId })}
                      </p>
                    </div>

                    {/* Message bubble */}
                    <div className="relative rounded-2xl rounded-tl-md px-4 py-3"
                      style={{
                        background: `${accent}0c`,
                        border: `1px solid ${accent}18`,
                      }}>
                      {/* Opening quote */}
                      <span className="absolute" style={{ top: 2, left: 12, fontSize: 22, color: `${accent}30`, lineHeight: 1, fontFamily: 'Georgia, serif', userSelect: 'none' }}>&ldquo;</span>
                      <p style={{
                        fontSize: 13, color: `${text}cc`,
                        lineHeight: 1.65, fontFamily: `'${font.body}', serif`,
                        paddingLeft: 10, paddingTop: 6,
                      }}>
                        {wish.message}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {/* Footer flourish */}
            {wishes.length >= 3 && (
              <motion.div className="text-center pt-2"
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
                <p style={{ fontSize: 10, color: `${accent}55`, letterSpacing: '0.14em', fontFamily: `'${font.body}', serif` }}>
                  ✦ {wishes.length} orang telah mengucapkan selamat ✦
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

      </div>
    </SectionWrapper>
  )
}
