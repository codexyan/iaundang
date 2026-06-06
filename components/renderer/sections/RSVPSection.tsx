'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import SectionWrapper, { resolveFont, fsb } from '../SectionWrapper'
import { Check, Plus, Minus, Loader2, User, Users } from 'lucide-react'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
  invitationId: string
}

export default function RSVPSection({ section, data, meta, invitationId }: Props) {
  const { accent, text } = meta.color_scheme
  const font = resolveFont(meta, section)

  const [name,        setName]        = useState('')
  const [attending,   setAttending]   = useState<boolean | null>(null)
  const [totalGuests, setTotalGuests] = useState(1)
  const [loading,     setLoading]     = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [error,       setError]       = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || attending === null) { setError('Mohon isi nama dan pilih konfirmasi kehadiran'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invitationId, name: name.trim(), attending, totalGuests: attending ? totalGuests : 0 }),
      })
      if (!res.ok) throw new Error('Gagal mengirim')
      setSubmitted(true)
    } catch { setError('Terjadi kesalahan, coba lagi') }
    finally   { setLoading(false) }
  }

  const attendOpts = [
    { val: true,  label: 'Hadir',       sub: 'Insya Allah akan hadir',    emoji: '🎉' },
    { val: false, label: 'Tidak Hadir', sub: 'Mohon maaf berhalangan',    emoji: '🙏' },
  ] as const

  return (
    <SectionWrapper section={section} className="px-6">
      <div className="max-w-sm mx-auto w-full py-12">

        {/* ── Header ── */}
        <div className="text-center mb-10">
          <motion.div className="flex items-center justify-center gap-3 mb-5"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <div className="h-px flex-1 max-w-10" style={{ background: `linear-gradient(to right, transparent, ${accent}55)` }} />
            <p style={{ fontSize: fsb(10), letterSpacing: '0.36em', textTransform: 'uppercase', color: `${accent}80`, fontFamily: `'${font.body}', serif` }}>
              Konfirmasi Kehadiran
            </p>
            <div className="h-px flex-1 max-w-10" style={{ background: `linear-gradient(to left, transparent, ${accent}55)` }} />
          </motion.div>
          <motion.p style={{ fontSize: fsb(13), color: `${text}70`, fontFamily: `'${font.body}', serif`, lineHeight: 1.7 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.12 } } }}>
            Kehadiran Anda adalah anugerah<br />terindah di hari bahagia kami
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {submitted ? (
            /* ── Success state ── */
            <motion.div key="success"
              initial={{ opacity: 0, scale: 0.88, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              className="flex flex-col items-center text-center py-6">

              {/* Pulsing ring + emoji */}
              <div className="relative mb-7">
                <motion.div className="absolute inset-0 rounded-full"
                  style={{ border: `2px solid ${accent}55` }}
                  initial={{ scale: 1, opacity: 0.8 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }} />
                <motion.div className="relative w-24 h-24 rounded-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${accent}25, ${accent}12)`, border: `1.5px solid ${accent}30` }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 18, delay: 0.05 }}>
                  <span style={{ fontSize: 44, lineHeight: 1 }}>{attending ? '🎉' : '🙏'}</span>
                </motion.div>
              </div>

              <motion.h3
                style={{ fontSize: 22, fontWeight: 700, color: accent, fontFamily: `'${font.heading}', serif`, marginBottom: 8 }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
                Terima Kasih!
              </motion.h3>

              <motion.p
                style={{ fontSize: 13, color: `${text}70`, fontFamily: `'${font.body}', serif`, lineHeight: 1.75, maxWidth: 260 }}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}>
                {attending
                  ? `Jazakumullahu khairan! Kami sangat menantikan kehadiran ${totalGuests > 1 ? `Anda bersama ${totalGuests - 1} orang lainnya` : 'Anda'}. Sampai jumpa di hari bahagia kami 💕`
                  : 'Jazakumullahu khairan atas perhatian Anda. Doa dan ucapan Anda sangat berarti bagi kami. 🙏'
                }
              </motion.p>

              {/* Decorative line */}
              <motion.div className="mt-6 h-px w-16" style={{ background: `${accent}40` }}
                initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.35, duration: 0.5 }} />
            </motion.div>

          ) : (
            /* ── Form ── */
            <motion.form key="form" onSubmit={handleSubmit}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: 0.2, staggerChildren: 0.08 } } }}
              className="space-y-5">

              {/* Name input */}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: `${text}66`, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8, fontFamily: `'${font.body}', serif` }}>
                  Nama Anda
                </p>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <User size={15} color={`${accent}66`} />
                  </div>
                  <input
                    type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="Nama lengkap Anda"
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm transition-all"
                    style={{
                      background: `${accent}0a`, border: `1.5px solid ${accent}22`,
                      color: text, fontFamily: `'${font.body}', serif`, outline: 'none',
                    }}
                    onFocus={e => { e.target.style.borderColor = `${accent}66`; e.target.style.background = `${accent}12` }}
                    onBlur={e  => { e.target.style.borderColor = `${accent}22`; e.target.style.background = `${accent}0a` }}
                  />
                </div>
              </motion.div>

              {/* Attendance selection */}
              <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                <p style={{ fontSize: 10, fontWeight: 600, color: `${text}66`, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8, fontFamily: `'${font.body}', serif` }}>
                  Kehadiran
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {attendOpts.map(opt => {
                    const active = attending === opt.val
                    return (
                      <button key={opt.label} type="button" onClick={() => setAttending(opt.val)}
                        className="relative flex flex-col items-center gap-2.5 py-5 px-3 rounded-2xl transition-all"
                        style={{
                          border: `2px solid ${active ? accent : `${accent}18`}`,
                          background: active ? `linear-gradient(145deg, ${accent}18, ${accent}08)` : `${accent}06`,
                          boxShadow: active ? `0 4px 20px ${accent}20` : 'none',
                          transform: active ? 'scale(1.03)' : 'scale(1)',
                          transition: 'all 0.2s ease',
                        }}>
                        <span style={{ fontSize: 30, lineHeight: 1 }}>{opt.emoji}</span>
                        <div className="text-center">
                          <p style={{ fontSize: 13, fontWeight: 700, color: active ? accent : `${text}66`, lineHeight: 1.2, fontFamily: `'${font.body}', serif` }}>
                            {opt.label}
                          </p>
                          <p style={{ fontSize: 9.5, color: `${text}44`, marginTop: 2 }}>{opt.sub}</p>
                        </div>
                        {active && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                            style={{ background: accent }}>
                            <Check size={10} color="white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </motion.div>

              {/* Guest count stepper */}
              <AnimatePresence>
                {attending && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28 }}
                    style={{ overflow: 'hidden' }}>
                    <div className="rounded-2xl py-5 px-4" style={{ background: `${accent}08`, border: `1.5px solid ${accent}18` }}>
                      <p style={{ fontSize: 10, fontWeight: 600, color: `${text}66`, letterSpacing: '0.14em', textTransform: 'uppercase', textAlign: 'center', marginBottom: 14, fontFamily: `'${font.body}', serif` }}>
                        Jumlah Tamu
                      </p>
                      <div className="flex items-center justify-center gap-7">
                        <button type="button" onClick={() => setTotalGuests(g => Math.max(1, g - 1))}
                          className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
                          style={{ background: `${accent}18`, border: `1.5px solid ${accent}28` }}>
                          <Minus size={18} color={accent} />
                        </button>
                        <div className="text-center" style={{ minWidth: 56 }}>
                          <motion.p key={totalGuests}
                            initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                            style={{ fontSize: 42, fontWeight: 800, color: accent, lineHeight: 1, fontFamily: `'${font.heading}', serif` }}>
                            {totalGuests}
                          </motion.p>
                          <p style={{ fontSize: 11, color: `${text}55`, marginTop: 2 }}>
                            {totalGuests === 1 ? 'orang' : 'orang'}
                          </p>
                        </div>
                        <button type="button" onClick={() => setTotalGuests(g => Math.min(10, g + 1))}
                          className="w-11 h-11 rounded-full flex items-center justify-center transition-all active:scale-90"
                          style={{ background: `${accent}18`, border: `1.5px solid ${accent}28` }}>
                          <Plus size={18} color={accent} />
                        </button>
                      </div>
                      {totalGuests > 1 && (
                        <div className="flex items-center justify-center gap-1.5 mt-3">
                          <Users size={11} color={`${accent}66`} />
                          <p style={{ fontSize: 10, color: `${accent}77` }}>Total {totalGuests} orang hadir</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <p className="text-xs" style={{ color: '#ef4444' }}>{error}</p>
              )}

              {/* Submit button */}
              <motion.button
                type="submit" disabled={loading || attending === null || !name.trim()}
                className="w-full py-4 rounded-2xl text-white font-semibold transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  boxShadow: `0 4px 20px ${accent}44`,
                  fontSize: 14, letterSpacing: '0.04em',
                  fontFamily: `'${font.body}', serif`,
                }}
                whileTap={{ scale: 0.98 }}
                variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
                {loading
                  ? <><Loader2 size={16} className="animate-spin" />Mengirim...</>
                  : 'Kirim Konfirmasi'
                }
              </motion.button>

            </motion.form>
          )}
        </AnimatePresence>

      </div>
    </SectionWrapper>
  )
}
