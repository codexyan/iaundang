'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import SectionWrapper, { resolveFont, fsh, fsb, cardBg } from '../SectionWrapper'
import { format, parseISO, differenceInSeconds } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { usePreviewContext } from '../PreviewContext'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
}

interface TimeLeft { days: number; hours: number; minutes: number; seconds: number }
interface Unit     { label: string; value: number }

type StyleCtx = {
  accent: string; text: string
  headingFont: string; bodyFont: string
  formattedDate: string | null
  timeLeft: TimeLeft | null
  units: Unit[]
  isPassed: boolean
  bgImage: string | null
}

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

//  Shared components 


function EventPassed({ accent, headingFont, bodyFont, formattedDate }: {
  accent: string; headingFont: string; bodyFont: string; formattedDate: string | null
}) {
  return (
    <motion.div className="text-center py-4"
      variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { delay: 0.2 } } }}>
      <h3 style={{ fontSize: fsh(22), fontWeight: 400, color: accent, fontFamily: headingFont, marginBottom: 8 }}>
        Alhamdulillah
      </h3>
      {formattedDate && (
        <p style={{ fontSize: fsb(11), color: `${accent}80`, fontFamily: bodyFont }} className="capitalize">
          {formattedDate}
        </p>
      )}
      <p style={{ fontSize: fsb(10), color: `${accent}70`, fontFamily: bodyFont, marginTop: 8, lineHeight: 1.8, fontStyle: 'italic' }}>
        Semoga menjadi keluarga<br />sakinah, mawaddah, warahmah
      </p>
    </motion.div>
  )
}

//  DEFAULT: Editorial boxes 

function DefaultView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, formattedDate, units, isPassed } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>

        <div className="text-center" style={{ marginBottom: 32 }}>
          <motion.p
            style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginBottom: 10 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            Menuju Hari Bahagia
          </motion.p>
          <motion.h2
            style={{ fontSize: fsh(20), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 12 }}
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
            Hitung Mundur
          </motion.h2>
          {formattedDate && (
            <motion.p
              className="capitalize"
              style={{ fontSize: fsb(10), color: `${text}70`, fontFamily: bodyFont, lineHeight: 1.7, fontStyle: 'italic' }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              {formattedDate}
            </motion.p>
          )}
        </div>

        {isPassed ? (
          <EventPassed accent={accent} headingFont={headingFont} bodyFont={bodyFont} formattedDate={formattedDate} />
        ) : (
          <div className="grid grid-cols-4 gap-3 w-full">
            {units.map((u, i) => (
              <motion.div key={u.label} className="flex flex-col items-center"
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.08 } } }}>
                <div className="w-full flex flex-col items-center justify-center py-4 mb-2"
                  style={{ border: `1px solid ${accent}30`, background: `${accent}0a`, ...cardBg(section.background) }}>
                  <AnimatePresence mode="popLayout">
                    <motion.span key={u.value}
                      initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ fontSize: fsh(26), fontWeight: 400, color: text, fontFamily: headingFont, lineHeight: 1, display: 'block' }}>
                      {pad(u.value)}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span style={{ fontSize: fsb(7.5), letterSpacing: '0.2em', textTransform: 'uppercase', color: `${text}75`, fontFamily: bodyFont }}>
                  {u.label}
                </span>
              </motion.div>
            ))}
          </div>
        )}

      </motion.div>
    </SectionWrapper>
  )
}

//  CINEMATIC: Full-bleed background image + overlay countdown 

function CinematicView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, headingFont, bodyFont, formattedDate, units, isPassed, bgImage } = ctx

  const sectionWithBg = bgImage
    ? { ...section, background: { type: 'image' as const, url: bgImage, overlay_opacity: 0.55 } }
    : section

  return (
    <SectionWrapper section={sectionWithBg}>
      <motion.div
        className="w-full"
        style={{ minHeight: 420, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px' }}
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

        <motion.p
          style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)', fontFamily: bodyFont, marginTop: 24, marginBottom: 10, textAlign: 'center' }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          Menuju Hari Bahagia
        </motion.p>

        <motion.h2
          style={{ fontSize: fsh(22), fontWeight: 400, color: '#fff', fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 14, textAlign: 'center', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
          Hitung Mundur
        </motion.h2>

        {formattedDate && (
          <motion.p
            className="capitalize"
            style={{ fontSize: fsb(10), color: 'rgba(255,255,255,0.6)', fontFamily: bodyFont, lineHeight: 1.7, fontStyle: 'italic', marginBottom: 36, textAlign: 'center' }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            {formattedDate}
          </motion.p>
        )}

        {isPassed ? (
          <motion.div className="text-center"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <h3 style={{ fontSize: fsh(24), fontWeight: 400, color: '#fff', fontFamily: headingFont, textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
              Alhamdulillah
            </h3>
            <p style={{ fontSize: fsb(10), color: 'rgba(255,255,255,0.5)', fontFamily: bodyFont, marginTop: 10, fontStyle: 'italic', lineHeight: 1.8 }}>
              Semoga menjadi keluarga<br />sakinah, mawaddah, warahmah
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-4 gap-4 w-full max-w-[300px]">
            {units.map((u, i) => (
              <motion.div key={u.label} className="flex flex-col items-center"
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.08 } } }}>
                <div className="w-full flex flex-col items-center justify-center py-5"
                  style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <AnimatePresence mode="popLayout">
                    <motion.span key={u.value}
                      initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 10, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ fontSize: fsh(28), fontWeight: 400, color: '#fff', fontFamily: headingFont, lineHeight: 1, display: 'block', textShadow: '0 2px 12px rgba(0,0,0,0.4)' }}>
                      {pad(u.value)}
                    </motion.span>
                  </AnimatePresence>
                </div>
                <span style={{ fontSize: fsb(7.5), letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontFamily: bodyFont, marginTop: 8 }}>
                  {u.label}
                </span>
              </motion.div>
            ))}
          </div>
        )}

      </motion.div>
    </SectionWrapper>
  )
}

//  ELEGANT: Large focal days + smaller H:M:S row 

function ElegantView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, formattedDate, timeLeft, isPassed } = ctx
  const sub = [
    { label: 'Jam',   value: timeLeft?.hours ?? 0 },
    { label: 'Menit', value: timeLeft?.minutes ?? 0 },
    { label: 'Detik', value: timeLeft?.seconds ?? 0 },
  ]

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>

        <div className="text-center" style={{ marginBottom: 36 }}>
          <motion.p
            style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginBottom: 10 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            Menuju Hari Bahagia
          </motion.p>
          {formattedDate && (
            <motion.p
              className="capitalize"
              style={{ fontSize: fsb(10), color: `${text}70`, fontFamily: bodyFont, lineHeight: 1.7, fontStyle: 'italic' }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              {formattedDate}
            </motion.p>
          )}
        </div>

        {isPassed ? (
          <EventPassed accent={accent} headingFont={headingFont} bodyFont={bodyFont} formattedDate={formattedDate} />
        ) : (
          <div className="flex flex-col items-center">
            {/* Large days focal */}
            <motion.div className="flex flex-col items-center" style={{ marginBottom: 28 }}
              variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}>
              <AnimatePresence mode="popLayout">
                <motion.span key={timeLeft?.days ?? 0}
                  initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ fontSize: fsh(64), fontWeight: 300, color: text, fontFamily: headingFont, lineHeight: 1, display: 'block' }}>
                  {pad(timeLeft?.days ?? 0)}
                </motion.span>
              </AnimatePresence>
              <p style={{ fontSize: fsb(10), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}60`, fontFamily: bodyFont, marginTop: 12 }}>
                Hari Lagi
              </p>
            </motion.div>

            {/* H:M:S row */}
            <div className="flex items-center gap-8">
              {sub.map((u, i) => (
                <motion.div key={u.label} className="flex flex-col items-center"
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { delay: 0.2 + i * 0.06 } } }}>
                  <AnimatePresence mode="popLayout">
                    <motion.span key={u.value}
                      initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      style={{ fontSize: fsh(24), fontWeight: 400, color: text, fontFamily: headingFont, lineHeight: 1, display: 'block' }}>
                      {pad(u.value)}
                    </motion.span>
                  </AnimatePresence>
                  <span style={{ fontSize: fsb(7.5), letterSpacing: '0.2em', textTransform: 'uppercase', color: `${text}70`, fontFamily: bodyFont, marginTop: 8 }}>
                    {u.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

      </motion.div>
    </SectionWrapper>
  )
}

//  MINIMAL: Clean large typography, no decoration 

function MinimalView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, formattedDate, units, isPassed } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>

        <div className="text-center" style={{ marginBottom: 36 }}>
          <motion.p
            style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginBottom: 10 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            Menuju Hari Bahagia
          </motion.p>
          {formattedDate && (
            <motion.p
              className="capitalize"
              style={{ fontSize: fsb(10), color: `${text}75`, fontFamily: bodyFont, lineHeight: 1.7, fontStyle: 'italic', marginTop: 14 }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              {formattedDate}
            </motion.p>
          )}
        </div>

        {isPassed ? (
          <EventPassed accent={accent} headingFont={headingFont} bodyFont={bodyFont} formattedDate={formattedDate} />
        ) : (
          <div className="flex justify-center items-baseline gap-2 w-full">
            {units.map((u, i) => (
              <motion.div key={u.label} className="flex flex-col items-center"
                variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.06 } } }}
                style={{ flex: 1, maxWidth: 64 }}>
                <AnimatePresence mode="popLayout">
                  <motion.span key={u.value}
                    initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    style={{ fontSize: fsh(36), fontWeight: 300, color: text, fontFamily: headingFont, lineHeight: 1, display: 'block' }}>
                    {pad(u.value)}
                  </motion.span>
                </AnimatePresence>
                <span style={{ fontSize: fsb(7), letterSpacing: '0.2em', textTransform: 'uppercase', color: `${text}70`, fontFamily: bodyFont, marginTop: 10 }}>
                  {u.label}
                </span>
                {i < units.length - 1 && (
                  <div style={{ position: 'absolute', right: -4, top: 4, fontSize: fsh(20), color: `${text}50`, fontFamily: headingFont }}>:</div>
                )}
              </motion.div>
            ))}
          </div>
        )}

      </motion.div>
    </SectionWrapper>
  )
}

//  RINGS: SVG circular progress 

function RingsView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, formattedDate, units, isPassed } = ctx
  const maxValues = [365, 23, 59, 59]
  const R = 26
  const circ = 2 * Math.PI * R

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>

        <div className="text-center" style={{ marginBottom: 32 }}>
          <motion.p
            style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginBottom: 10 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            Menuju Hari Bahagia
          </motion.p>
          <motion.h2
            style={{ fontSize: fsh(20), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 12 }}
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
            Hitung Mundur
          </motion.h2>
          {formattedDate && (
            <motion.p
              className="capitalize"
              style={{ fontSize: fsb(10), color: `${text}70`, fontFamily: bodyFont, lineHeight: 1.7, fontStyle: 'italic' }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              {formattedDate}
            </motion.p>
          )}
        </div>

        {isPassed ? (
          <EventPassed accent={accent} headingFont={headingFont} bodyFont={bodyFont} formattedDate={formattedDate} />
        ) : (
          <div className="grid grid-cols-4 gap-2 w-full">
            {units.map((u, i) => {
              const pct = Math.max(0, Math.min(1, u.value / maxValues[i]))
              const dash = circ * pct
              return (
                <motion.div key={u.label} className="flex flex-col items-center"
                  variants={{ hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1, transition: { delay: i * 0.1 } } }}>
                  <div style={{ position: 'relative', width: 62, height: 62 }}>
                    <svg width="62" height="62" viewBox="0 0 62 62">
                      <circle cx="31" cy="31" r={R} fill="none" stroke={`${accent}25`} strokeWidth="1.5" />
                      <motion.circle cx="31" cy="31" r={R} fill="none" stroke={`${accent}80`} strokeWidth="1.5"
                        strokeLinecap="round"
                        transform="rotate(-90 31 31)"
                        initial={{ strokeDasharray: `0 ${circ}` }}
                        animate={{ strokeDasharray: `${dash} ${circ}` }}
                        transition={{ duration: 0.8, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                      />
                    </svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <AnimatePresence mode="popLayout">
                        <motion.span key={u.value}
                          initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.7, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          style={{ fontSize: fsh(16), fontWeight: 400, color: text, fontFamily: headingFont, display: 'block' }}>
                          {pad(u.value)}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                  </div>
                  <span style={{ fontSize: fsb(7), letterSpacing: '0.16em', textTransform: 'uppercase', color: `${text}70`, fontFamily: bodyFont, marginTop: 6 }}>
                    {u.label}
                  </span>
                </motion.div>
              )
            })}
          </div>
        )}

      </motion.div>
    </SectionWrapper>
  )
}

//  MAGAZINE: Split layout  image left, countdown right 

function MagazineView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, formattedDate, units, isPassed, bgImage } = ctx

  return (
    <SectionWrapper section={section}>
      <div className="w-full py-14">
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

          {/* Image strip */}
          {bgImage && (
            <motion.div
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              style={{ width: '100%', height: 200, overflow: 'hidden', marginBottom: 0 }}>
              <img src={bgImage} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </motion.div>
          )}

          <div className="px-6 max-w-[300px] mx-auto" style={{ paddingTop: bgImage ? 28 : 0 }}>
            {/* Left-aligned header */}
            <motion.div style={{ marginBottom: 28 }}
              variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
              <div style={{ width: 28, height: 3, background: `${accent}60`, marginBottom: 16 }} />
              <p style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginBottom: 8 }}>
                Menuju Hari Bahagia
              </p>
              <h2 style={{ fontSize: fsh(24), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 10 }}>
                Hitung Mundur
              </h2>
              {formattedDate && (
                <p className="capitalize"
                  style={{ fontSize: fsb(10), color: `${text}65`, fontFamily: bodyFont, fontStyle: 'italic' }}>
                  {formattedDate}
                </p>
              )}
            </motion.div>

            {isPassed ? (
              <EventPassed accent={accent} headingFont={headingFont} bodyFont={bodyFont} formattedDate={formattedDate} />
            ) : (
              <div className="flex gap-3 w-full">
                {units.map((u, i) => (
                  <motion.div key={u.label} className="flex flex-col items-center" style={{ flex: 1 }}
                    variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.06 } } }}>
                    <div className="w-full flex flex-col items-center justify-center py-5"
                      style={{ borderTop: `2px solid ${accent}40`, borderBottom: `1px solid ${accent}25` }}>
                      <AnimatePresence mode="popLayout">
                        <motion.span key={u.value}
                          initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 8, opacity: 0 }}
                          transition={{ duration: 0.18 }}
                          style={{ fontSize: fsh(24), fontWeight: 400, color: text, fontFamily: headingFont, lineHeight: 1, display: 'block' }}>
                          {pad(u.value)}
                        </motion.span>
                      </AnimatePresence>
                    </div>
                    <span style={{ fontSize: fsb(7), letterSpacing: '0.2em', textTransform: 'uppercase', color: `${text}70`, fontFamily: bodyFont, marginTop: 8 }}>
                      {u.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}

              </div>
        </motion.div>
      </div>
    </SectionWrapper>
  )
}

//  MAIN 

export default function CountdownSection({ section, data, meta }: Props) {
  const { accent, text } = meta.color_scheme
  const variant = section.style_variant ?? 'default'
  const font    = resolveFont(meta, section)
  const target  = data.akad?.date ? `${data.akad.date}T${data.akad.time || '00:00'}:00` : null
  const { isPreview } = usePreviewContext()

  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    if (!target) return
    setTimeLeft(getTimeLeft(target))
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

  const bgImage = data.couple_photo_url || (isPreview ? 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop' : null)

  const ctx: StyleCtx = {
    accent, text,
    headingFont: `'${font.heading}', serif`,
    bodyFont: `'${font.body}', serif`,
    formattedDate, timeLeft, units, isPassed,
    bgImage,
  }

  switch (variant) {
    case 'cinematic': return <CinematicView section={section} ctx={ctx} />
    case 'elegant':   return <ElegantView   section={section} ctx={ctx} />
    case 'minimal':   return <MinimalView   section={section} ctx={ctx} />
    case 'rings':     return <RingsView     section={section} ctx={ctx} />
    case 'magazine':  return <MagazineView  section={section} ctx={ctx} />
    default:          return <DefaultView   section={section} ctx={ctx} />
  }
}
