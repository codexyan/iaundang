'use client'

import { motion } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta, EventDetail } from '@/lib/types'
import SectionWrapper, { resolveFont, fsh, fsb } from '../SectionWrapper'
import { format, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { MapPin, Clock, CalendarDays, Navigation, Compass } from 'lucide-react'

interface Props { section: SectionConfig; data: NewInvitationData; meta: TemplateMeta }
interface EventItem { title: string; event: EventDetail; index: number }

function fmt(d: string) {
  try { return format(parseISO(d), 'EEEE, d MMMM yyyy', { locale: localeId }) }
  catch { return d }
}

// ─── Maps pill ────────────────────────────────────────────────────────────────

function MapsPill({ url, accent }: { url: string; accent: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-2xl transition-all active:scale-[0.97]"
      style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, padding: '9px 16px', boxShadow: `0 4px 14px ${accent}44`, textDecoration: 'none' }}>
      <Navigation size={12} color="white" />
      <span style={{ fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.06em' }}>Lihat Peta</span>
    </a>
  )
}

// ─── Variant: Cards — premium gradient cards ──────────────────────────────────

function CardDefault({ title, event, accent, text, font, delay }: EventItem & { accent: string; text: string; font: { heading: string; body: string }; delay: number }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0, transition: { delay, duration: 0.6 } } }}
      className="w-full overflow-hidden rounded-3xl"
      style={{ background: `linear-gradient(160deg, ${accent}12 0%, ${accent}06 100%)`, border: `1.5px solid ${accent}28`, boxShadow: `0 4px 24px ${accent}14` }}>
      <div style={{ height: 3, background: `linear-gradient(to right, ${accent}66, ${accent}, ${accent}66)` }} />
      <div className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}aa)` }}>
            <CalendarDays size={15} color="white" />
          </div>
          <h3 style={{ fontSize: fsh(18), fontWeight: 700, color: accent, fontFamily: `'${font.heading}', serif`, lineHeight: 1.2 }}>{title}</h3>
        </div>
        <div className="space-y-3.5">
          <div className="flex items-start gap-3">
            <CalendarDays size={14} style={{ color: `${accent}80`, marginTop: 2, flexShrink: 0 }} />
            <p style={{ fontSize: fsb(12), color: `${text}cc`, fontFamily: `'${font.body}', serif`, lineHeight: 1.5 }} className="capitalize">{fmt(event.date)}</p>
          </div>
          <div className="flex items-center gap-3">
            <Clock size={14} style={{ color: `${accent}80`, flexShrink: 0 }} />
            <p style={{ fontSize: fsb(12), color: `${text}cc`, fontFamily: `'${font.body}', serif` }}>{event.time} WIB</p>
          </div>
          <div className="flex items-start gap-3">
            <MapPin size={14} style={{ color: `${accent}80`, marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: fsb(13), fontWeight: 600, color: text, fontFamily: `'${font.body}', serif` }}>{event.venue_name}</p>
              {event.venue_address && <p style={{ fontSize: fsb(11), color: `${text}66`, fontFamily: `'${font.body}', serif`, lineHeight: 1.55, marginTop: 3 }}>{event.venue_address}</p>}
            </div>
          </div>
        </div>
        {event.maps_url && <div className="mt-5"><MapsPill url={event.maps_url} accent={accent} /></div>}
      </div>
    </motion.div>
  )
}

// ─── Variant: Foto — full-bleed cinematic panel ────────────────────────────────

function CardPhoto({ title, event, index, accent, primary, font, delay }: EventItem & { accent: string; primary: string; font: { heading: string; body: string }; delay: number }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1, transition: { delay, duration: 0.7, ease: 'easeOut' } } }}
      className="relative w-full overflow-hidden"
      style={{ minHeight: '78dvh', borderRadius: 28, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', boxShadow: `0 16px 48px rgba(0,0,0,0.22)` }}>

      {/* Full-bleed photo */}
      {event.venue_photo_url
        ? <img src={event.venue_photo_url} alt={event.venue_name}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        : <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(160deg, ${accent}44 0%, ${primary} 100%)` }} />
      }

      {/* Cinematic multi-layer gradient */}
      <div style={{ position: 'absolute', inset: 0,
        background: `linear-gradient(to bottom,
          transparent 0%,
          transparent 20%,
          ${primary}55 55%,
          ${primary}cc 75%,
          ${primary}f2 90%,
          ${primary} 100%)` }} />
      {/* Side vignette */}
      <div style={{ position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 100%, transparent 40%, ${primary}88 100%)` }} />

      {/* Left accent stripe */}
      <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 4,
        background: `linear-gradient(to bottom, transparent 10%, ${accent} 50%, transparent 90%)` }} />

      {/* Top label */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <div className="flex items-center gap-2 rounded-full px-3 py-1.5"
          style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}>
          <Compass size={11} color={`${accent}cc`} />
          <span style={{ fontSize: 9, fontWeight: 700, color: `${accent}cc`, letterSpacing: '0.2em', textTransform: 'uppercase' }}>{title}</span>
        </div>
        <div className="rounded-full px-2.5 py-1"
          style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(6px)' }}>
          <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.12em' }}>
            {String(index + 1).padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Bottom content */}
      <div style={{ position: 'relative', zIndex: 1, padding: '0 24px 36px' }}>
        <h2 style={{ fontSize: fsh(28), fontWeight: 800, color: '#fff', fontFamily: `'${font.heading}', serif`, lineHeight: 1.15, marginBottom: 14, textShadow: `0 2px 16px ${primary}88` }}>
          {event.venue_name}
        </h2>
        <div className="flex flex-wrap gap-x-5 gap-y-2 mb-5">
          <div className="flex items-center gap-2">
            <CalendarDays size={12} color={`${accent}bb`} />
            <p style={{ fontSize: fsb(11), color: 'rgba(255,255,255,0.72)', fontFamily: `'${font.body}', serif` }} className="capitalize">{fmt(event.date)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} color={`${accent}bb`} />
            <p style={{ fontSize: fsb(11), color: 'rgba(255,255,255,0.72)', fontFamily: `'${font.body}', serif` }}>{event.time} WIB</p>
          </div>
        </div>
        {event.venue_address && (
          <p style={{ fontSize: fsb(11), color: 'rgba(255,255,255,0.5)', fontFamily: `'${font.body}', serif`, lineHeight: 1.55, marginBottom: 20 }}>
            <MapPin size={10} style={{ display: 'inline', marginRight: 4, verticalAlign: 'middle' }} color={`${accent}88`} />
            {event.venue_address}
          </p>
        )}
        {event.maps_url && <MapsPill url={event.maps_url} accent={accent} />}
      </div>
    </motion.div>
  )
}

// ─── Variant: Timeline — editorial number + detail split ──────────────────────

function CardTimeline({ title, event, index, accent, text, font, delay, isLast }: EventItem & { accent: string; text: string; font: { heading: string; body: string }; delay: number; isLast: boolean }) {
  const num = String(index + 1).padStart(2, '0')
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, x: -20 }, visible: { opacity: 1, x: 0, transition: { delay, duration: 0.6, ease: 'easeOut' } } }}
      className="flex gap-0">

      {/* Left: number column */}
      <div className="flex flex-col items-center shrink-0" style={{ width: 56 }}>
        <div className="flex flex-col items-center gap-1">
          <span style={{ fontSize: 32, fontWeight: 900, color: accent, fontFamily: `'${font.heading}', serif`, lineHeight: 1 }}>{num}</span>
          <div style={{ height: 2, width: 20, background: accent, borderRadius: 1 }} />
          <p style={{ fontSize: 8, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: `${accent}70`, writingMode: 'vertical-lr', transform: 'rotate(180deg)', marginTop: 4, fontFamily: `'${font.body}', serif` }}>
            {title}
          </p>
        </div>
        {!isLast && (
          <div style={{ flex: 1, width: 1, minHeight: 32, marginTop: 12, background: `linear-gradient(to bottom, ${accent}44, transparent)` }} />
        )}
      </div>

      {/* Right: content */}
      <div style={{ flex: 1, paddingLeft: 16, paddingBottom: isLast ? 0 : 40 }}>
        <div className="rounded-2xl overflow-hidden"
          style={{ border: `1.5px solid ${accent}22`, background: `${accent}07` }}>
          <div style={{ height: 2, background: `linear-gradient(to right, ${accent}, ${accent}44)` }} />
          <div className="p-4 space-y-2.5">
            <h3 style={{ fontSize: fsh(17), fontWeight: 700, color: accent, fontFamily: `'${font.heading}', serif`, lineHeight: 1.25 }}>
              {event.venue_name}
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CalendarDays size={12} style={{ color: `${accent}70`, flexShrink: 0 }} />
                <p style={{ fontSize: fsb(11), color: `${text}bb`, fontFamily: `'${font.body}', serif` }} className="capitalize">{fmt(event.date)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={12} style={{ color: `${accent}70`, flexShrink: 0 }} />
                <p style={{ fontSize: fsb(11), color: `${text}bb`, fontFamily: `'${font.body}', serif` }}>{event.time} WIB</p>
              </div>
              {event.venue_address && (
                <div className="flex items-start gap-2">
                  <MapPin size={12} style={{ color: `${accent}70`, flexShrink: 0, marginTop: 2 }} />
                  <p style={{ fontSize: fsb(10.5), color: `${text}66`, fontFamily: `'${font.body}', serif`, lineHeight: 1.55 }}>{event.venue_address}</p>
                </div>
              )}
            </div>
            {event.maps_url && <div className="pt-1"><MapsPill url={event.maps_url} accent={accent} /></div>}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// ─── Variant: Compact — boarding pass / ticket style ──────────────────────────

function CardCompact({ title, event, index, accent, text, primary, font, delay }: EventItem & { accent: string; text: string; primary: string; font: { heading: string; body: string }; delay: number }) {
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay, duration: 0.5 } } }}
      className="relative w-full overflow-hidden"
      style={{ borderRadius: 20 }}>

      {/* Ticket border — dashed */}
      <div style={{
        position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none',
        border: `2px dashed ${accent}40`,
      }} />

      {/* Stub cutouts — left and right circles */}
      <div style={{ position: 'absolute', left: -10, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: primary, zIndex: 10 }} />
      <div style={{ position: 'absolute', right: -10, top: '50%', transform: 'translateY(-50%)', width: 20, height: 20, borderRadius: '50%', background: primary, zIndex: 10 }} />

      <div className="flex" style={{ background: `${accent}09` }}>
        {/* Left stub — event number + title */}
        <div className="flex flex-col items-center justify-center shrink-0 py-5"
          style={{ width: 64, borderRight: `2px dashed ${accent}35`, gap: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 900, color: accent, fontFamily: `'${font.heading}', serif`, lineHeight: 1 }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{ fontSize: 7.5, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: `${accent}77`, textAlign: 'center', lineHeight: 1.4, maxWidth: 48, writingMode: 'horizontal-tb', fontFamily: `'${font.body}', serif` }}>
            {title}
          </span>
        </div>

        {/* Right — details */}
        <div className="flex-1 py-4 px-4 space-y-1.5">
          <p style={{ fontSize: fsh(15), fontWeight: 700, color: text, fontFamily: `'${font.heading}', serif`, lineHeight: 1.25, marginBottom: 8 }}>
            {event.venue_name}
          </p>
          <div className="flex items-center gap-2">
            <CalendarDays size={11} style={{ color: `${accent}77`, flexShrink: 0 }} />
            <p style={{ fontSize: fsb(10.5), color: `${text}99`, fontFamily: `'${font.body}', serif` }} className="capitalize">{fmt(event.date)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={11} style={{ color: `${accent}77`, flexShrink: 0 }} />
            <p style={{ fontSize: fsb(10.5), color: `${text}99`, fontFamily: `'${font.body}', serif` }}>{event.time} WIB</p>
          </div>
          {event.venue_address && (
            <div className="flex items-start gap-2">
              <MapPin size={11} style={{ color: `${accent}77`, flexShrink: 0, marginTop: 1.5 }} />
              <p style={{ fontSize: fsb(10), color: `${text}66`, fontFamily: `'${font.body}', serif`, lineHeight: 1.5 }}>{event.venue_address}</p>
            </div>
          )}
          {event.maps_url && <div className="pt-2"><MapsPill url={event.maps_url} accent={accent} /></div>}
        </div>
      </div>
    </motion.div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header({ accent, font }: { accent: string; font: { body: string } }) {
  return (
    <div className="text-center mb-8">
      <motion.p variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
        style={{ fontSize: fsb(10), letterSpacing: '0.36em', textTransform: 'uppercase', color: `${accent}80`, fontFamily: `'${font.body}', serif`, marginBottom: 14 }}>
        Detail Acara
      </motion.p>
      <motion.div variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { delay: 0.1, duration: 0.6 } } }}
        className="h-px w-12 mx-auto"
        style={{ background: `linear-gradient(to right, transparent, ${accent}55, transparent)` }} />
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function EventsSection({ section, data, meta }: Props) {
  const { accent, text, primary } = meta.color_scheme
  const font    = resolveFont(meta, section)
  const variant = section.style_variant ?? 'default'

  const events: EventItem[] = [
    data.akad    ? { title: 'Akad Nikah', event: data.akad,    index: 0 } : null,
    data.resepsi ? { title: 'Resepsi',    event: data.resepsi, index: 1 } : null,
  ].filter(Boolean) as EventItem[]

  // Photo variant: full-bleed, no wrapper padding
  if (variant === 'photo') {
    return (
      <SectionWrapper section={section}>
        <div className="w-full py-10">
          <div className="px-6 max-w-sm mx-auto">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
              <Header accent={accent} font={font} />
            </motion.div>
          </div>
          <div className="px-4 max-w-sm mx-auto space-y-6">
            {events.map(({ title, event, index }) => (
              <motion.div key={title}
                initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: index * 0.2, duration: 0.7, ease: 'easeOut' }}>
                <CardPhoto title={title} event={event as EventDetail & { index: number }} index={index} accent={accent} primary={primary} font={font} delay={0} />
              </motion.div>
            ))}
          </div>
        </div>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper section={section} className="px-6">
      <div className="max-w-sm mx-auto w-full py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>
          <Header accent={accent} font={font} />

          {variant === 'timeline' && (
            <div>
              {events.map(({ title, event, index }) => (
                <CardTimeline key={title} title={title} event={event as EventDetail & { index: number }} index={index}
                  accent={accent} text={text} font={font} delay={0.12 + index * 0.18} isLast={index === events.length - 1} />
              ))}
            </div>
          )}

          {variant === 'compact' && (
            <div className="space-y-5">
              {events.map(({ title, event, index }) => (
                <CardCompact key={title} title={title} event={event as EventDetail & { index: number }} index={index}
                  accent={accent} text={text} primary={primary} font={font} delay={0.12 + index * 0.15} />
              ))}
            </div>
          )}

          {(variant === 'default' || !['photo','timeline','compact'].includes(variant)) && (
            <div className="space-y-4">
              {events.map(({ title, event, index }) => (
                <CardDefault key={title} title={title} event={event as EventDetail & { index: number }} index={index}
                  accent={accent} text={text} font={font} delay={0.12 + index * 0.18} />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
