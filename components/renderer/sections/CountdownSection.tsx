'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import SectionWrapper, { resolveFont, fsh, fsb } from '../SectionWrapper'
import { format, parseISO, differenceInSeconds } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
}

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }
interface Unit     { label: string; value: number }

function pad(n: number) { return String(Math.max(0, n)).padStart(2, '0') }

function getTimeLeft(target: string): TimeLeft {
  const diff = differenceInSeconds(parseISO(target), new Date())
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days:    Math.floor(diff / 86400),
    hours:   Math.floor((diff % 86400) / 3600),
    minutes: Math.floor((diff % 3600) / 60),
    seconds: diff % 60,
  }
}

// ─── Section header ───────────────────────────────────────────────────────────

function Header({ accent, font, formattedDate, text }: {
  accent: string; font: { body: string; heading: string }
  formattedDate: string | null; text: string
}) {
  return (
    <div className="text-center mb-8">
      <motion.p
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        style={{ fontSize: fsb(10), letterSpacing: '0.36em', textTransform: 'uppercase', color: `${accent}80`, fontFamily: `'${font.body}', serif`, marginBottom: 14 }}>
        Menuju Hari Bahagia
      </motion.p>
      {formattedDate && (
        <motion.p
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { delay: 0.12 } } }}
          className="capitalize"
          style={{ fontSize: fsh(15), color: accent, fontFamily: `'${font.heading}', serif`, lineHeight: 1.4 }}>
          {formattedDate}
        </motion.p>
      )}
      <motion.div
        variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { delay: 0.18, duration: 0.6 } } }}
        className="h-px w-12 mx-auto mt-4"
        style={{ background: `linear-gradient(to right, transparent, ${accent}55, transparent)` }} />
    </div>
  )
}

// ─── Variant 1: boxes ─────────────────────────────────────────────────────────

function CountdownBoxes({ units, accent, text, font }: { units: Unit[]; accent: string; text: string; font: { heading: string; body: string } }) {
  return (
    <div className="grid grid-cols-4 gap-2.5 w-full">
      {units.map((u, i) => (
        <motion.div key={u.label} className="flex flex-col items-center"
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: 0.22 + i * 0.08, duration: 0.5 } } }}>
          <div className="w-full flex flex-col items-center justify-center rounded-2xl py-3 mb-2"
            style={{
              background: `linear-gradient(145deg, ${accent}16, ${accent}08)`,
              border: `1.5px solid ${accent}30`,
              boxShadow: `0 4px 16px ${accent}18`,
            }}>
            <AnimatePresence mode="popLayout">
              <motion.span key={u.value}
                initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }}
                transition={{ duration: 0.22 }}
                style={{ fontSize: fsh(28), fontWeight: 800, color: accent, fontFamily: `'${font.heading}', serif`, lineHeight: 1, display: 'block' }}>
                {pad(u.value)}
              </motion.span>
            </AnimatePresence>
          </div>
          <span style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${text}55` }}>
            {u.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

// ─── Variant 2: minimal — large numbers, no box ───────────────────────────────

function CountdownMinimal({ units, accent, text, font }: { units: Unit[]; accent: string; text: string; font: { heading: string; body: string } }) {
  return (
    <div className="flex justify-center items-end gap-2 w-full">
      {units.map((u, i) => (
        <motion.div key={u.label}
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: 0.2 + i * 0.08, duration: 0.5 } } }}
          className="flex flex-col items-center">
          <AnimatePresence mode="popLayout">
            <motion.span key={u.value}
              initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.2 }}
              style={{ fontSize: fsh(44), fontWeight: 900, color: text, fontFamily: `'${font.heading}', serif`, lineHeight: 1, display: 'block', tabularNums: true } as React.CSSProperties}>
              {pad(u.value)}
            </motion.span>
          </AnimatePresence>
          <span style={{ fontSize: 8.5, letterSpacing: '0.2em', textTransform: 'uppercase', color: `${accent}77`, marginTop: 4 }}>
            {u.label}
          </span>
          {i < units.length - 1 && (
            <span style={{ position: 'absolute', fontSize: fsh(36), color: `${text}22`, fontFamily: `'${font.heading}', serif`, marginTop: -6 }}>:</span>
          )}
        </motion.div>
      ))}
    </div>
  )
}

// ─── Variant 3: rings — circular SVG progress ────────────────────────────────

function CountdownRings({ units, accent, text, font }: { units: Unit[]; accent: string; text: string; font: { heading: string; body: string } }) {
  const maxValues = [365, 23, 59, 59]
  const R = 30
  const circ = 2 * Math.PI * R

  return (
    <div className="grid grid-cols-4 gap-2 w-full">
      {units.map((u, i) => {
        const pct  = Math.max(0, Math.min(1, u.value / maxValues[i]))
        const dash = circ * pct
        return (
          <motion.div key={u.label} className="flex flex-col items-center gap-1.5"
            variants={{ hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1, transition: { delay: 0.2 + i * 0.1, duration: 0.55, type: 'spring', stiffness: 220, damping: 22 } } }}>
            <div style={{ position: 'relative', width: 70, height: 70 }}>
              <svg width="70" height="70" viewBox="0 0 70 70">
                {/* Track */}
                <circle cx="35" cy="35" r={R} fill="none" stroke={`${accent}20`} strokeWidth="4" />
                {/* Progress */}
                <motion.circle cx="35" cy="35" r={R} fill="none" stroke={accent} strokeWidth="4"
                  strokeLinecap="round"
                  transform="rotate(-90 35 35)"
                  initial={{ strokeDasharray: `0 ${circ}` }}
                  animate={{ strokeDasharray: `${dash} ${circ}` }}
                  transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                />
                {/* Inner accent dot at progress end */}
              </svg>
              {/* Center number */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AnimatePresence mode="popLayout">
                  <motion.span key={u.value}
                    initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ fontSize: fsh(18), fontWeight: 800, color: text, fontFamily: `'${font.heading}', serif`, display: 'block' }}>
                    {pad(u.value)}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
            <span style={{ fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: `${accent}77` }}>
              {u.label}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}

// ─── Variant 4: elegant — hari focal + H/M/S row ─────────────────────────────

function CountdownElegant({ timeLeft, accent, text, font }: { timeLeft: TimeLeft; accent: string; text: string; font: { heading: string; body: string } }) {
  const sub = [
    { label: 'Jam',   value: timeLeft.hours },
    { label: 'Menit', value: timeLeft.minutes },
    { label: 'Detik', value: timeLeft.seconds },
  ]
  return (
    <div className="flex flex-col items-center gap-6 w-full">

      {/* Days — large focal */}
      <motion.div className="flex flex-col items-center"
        variants={{ hidden: { opacity: 0, scale: 0.88 }, visible: { opacity: 1, scale: 1, transition: { delay: 0.2, duration: 0.6, type: 'spring', stiffness: 200, damping: 20 } } }}>
        <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {/* Decorative ring behind number */}
          <div style={{
            position: 'absolute', inset: -16,
            borderRadius: '50%',
            border: `1px solid ${accent}22`,
            boxShadow: `0 0 40px ${accent}18`,
          }} />
          <div style={{
            position: 'absolute', inset: -8,
            borderRadius: '50%',
            border: `1px solid ${accent}33`,
          }} />
          <AnimatePresence mode="popLayout">
            <motion.span key={timeLeft.days}
              initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                fontSize: fsh(72), fontWeight: 900, color: accent,
                fontFamily: `'${font.heading}', serif`, lineHeight: 1,
                display: 'block', position: 'relative',
                textShadow: `0 4px 24px ${accent}44`,
              }}>
              {pad(timeLeft.days)}
            </motion.span>
          </AnimatePresence>
        </div>
        <p style={{
          fontSize: fsb(11), letterSpacing: '0.28em', textTransform: 'uppercase',
          color: `${text}66`, fontFamily: `'${font.body}', serif`, marginTop: 16,
        }}>
          Hari Lagi
        </p>
      </motion.div>

      {/* Divider */}
      <motion.div className="flex items-center gap-3 w-full max-w-[180px]"
        variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1, transition: { delay: 0.35, duration: 0.5 } } }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${accent}44)` }} />
        <div style={{ width: 5, height: 5, borderRadius: 1, background: accent, transform: 'rotate(45deg)', opacity: 0.6 }} />
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${accent}44)` }} />
      </motion.div>

      {/* H / M / S row */}
      <div className="flex items-end gap-6">
        {sub.map((u, i) => (
          <motion.div key={u.label} className="flex flex-col items-center"
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { delay: 0.38 + i * 0.08, duration: 0.45 } } }}>
            <AnimatePresence mode="popLayout">
              <motion.span key={u.value}
                initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}
                transition={{ duration: 0.18 }}
                style={{ fontSize: fsh(30), fontWeight: 800, color: text, fontFamily: `'${font.heading}', serif`, lineHeight: 1, display: 'block' }}>
                {pad(u.value)}
              </motion.span>
            </AnimatePresence>
            <span style={{ fontSize: 8.5, letterSpacing: '0.16em', textTransform: 'uppercase', color: `${accent}70`, marginTop: 4 }}>
              {u.label}
            </span>
          </motion.div>
        ))}
      </div>

    </div>
  )
}

// ─── Past event state ─────────────────────────────────────────────────────────

function EventPassed({ accent, font, formattedDate }: { accent: string; font: { heading: string; body: string }; formattedDate: string | null }) {
  return (
    <motion.div className="text-center py-4"
      variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { delay: 0.2 } } }}>
      <div className="text-4xl mb-4">🎊</div>
      <h3 style={{ fontSize: fsh(22), fontWeight: 700, color: accent, fontFamily: `'${font.heading}', serif`, marginBottom: 8 }}>
        Alhamdulillah
      </h3>
      {formattedDate && (
        <p style={{ fontSize: fsb(13), color: `${accent}88`, fontFamily: `'${font.body}', serif` }} className="capitalize">
          {formattedDate}
        </p>
      )}
      <p style={{ fontSize: fsb(12), color: `${accent}66`, fontFamily: `'${font.body}', serif`, marginTop: 6, lineHeight: 1.7 }}>
        Semoga menjadi keluarga sakinah,<br />mawaddah, warahmah 🤍
      </p>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CountdownSection({ section, data, meta }: Props) {
  const { accent, text } = meta.color_scheme
  const variant = section.style_variant ?? 'default'
  const font    = resolveFont(meta, section)
  const target  = data.akad?.date ? `${data.akad.date}T${data.akad.time || '00:00'}:00` : null

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(target ? getTimeLeft(target) : null)

  useEffect(() => {
    if (!target) return
    const id = setInterval(() => setTimeLeft(getTimeLeft(target)), 1000)
    return () => clearInterval(id)
  }, [target])

  const formattedDate = data.akad?.date
    ? format(parseISO(data.akad.date), 'EEEE, d MMMM yyyy', { locale: localeId })
    : null

  const units: Unit[] = [
    { label: 'Hari',  value: timeLeft?.days    ?? 0 },
    { label: 'Jam',   value: timeLeft?.hours   ?? 0 },
    { label: 'Menit', value: timeLeft?.minutes ?? 0 },
    { label: 'Detik', value: timeLeft?.seconds ?? 0 },
  ]

  const isPassed = timeLeft !== null &&
    timeLeft.days === 0 && timeLeft.hours === 0 &&
    timeLeft.minutes === 0 && timeLeft.seconds === 0

  return (
    <SectionWrapper section={section} className="px-6">
      <div className="max-w-sm mx-auto w-full py-10">
        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="flex flex-col items-center">

          <Header accent={accent} font={font} formattedDate={formattedDate} text={text} />

          {!target ? (
            <p style={{ fontSize: fsb(12), color: `${text}44`, fontFamily: `'${font.body}', serif` }}>
              Tanggal belum ditentukan
            </p>
          ) : isPassed ? (
            <EventPassed accent={accent} font={font} formattedDate={formattedDate} />
          ) : (
            <>
              {variant === 'boxes'   && <CountdownBoxes   units={units} accent={accent} text={text} font={font} />}
              {variant === 'minimal' && <CountdownMinimal units={units} accent={accent} text={text} font={font} />}
              {variant === 'rings'   && <CountdownRings   units={units} accent={accent} text={text} font={font} />}
              {variant === 'elegant' && <CountdownElegant timeLeft={timeLeft!} accent={accent} text={text} font={font} />}
              {/* default = boxes */}
              {!['boxes','minimal','rings','elegant'].includes(variant) && (
                <CountdownBoxes units={units} accent={accent} text={text} font={font} />
              )}
            </>
          )}

        </motion.div>
      </div>
    </SectionWrapper>
  )
}
