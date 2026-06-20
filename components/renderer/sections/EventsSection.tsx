'use client'

import { motion } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta, EventDetail } from '@/lib/types'
import SectionWrapper, { resolveFont, fsh, fsb, cardBg } from '../SectionWrapper'
import { getComponentStyle, btnStyle } from '@/lib/component-styles'
import { format, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { MapPin, Clock, CalendarDays } from 'lucide-react'

interface Props { section: SectionConfig; data: NewInvitationData; meta: TemplateMeta }
interface EventItem { title: string; event: EventDetail; index: number }

type StyleCtx = {
  accent: string; text: string; primary: string
  headingFont: string; bodyFont: string
  events: EventItem[]
  cs: ReturnType<typeof getComponentStyle>
}

function fmt(d: string) {
  try { return format(parseISO(d), 'EEEE, d MMMM yyyy', { locale: localeId }) }
  catch { return d }
}

//  Shared components 

function Ornament({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div style={{ width: 5, height: 5, borderRadius: '50%', border: `0.5px solid ${accent}40` }} />
    </div>
  )
}

function FooterOrnament({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-2" style={{ marginTop: 28 }}>
      <div style={{ width: 3, height: 3, borderRadius: '50%', background: `${accent}35` }} />
    </div>
  )
}

function EditorialHeader({ accent, text, headingFont, bodyFont }: {
  accent: string; text: string; headingFont: string; bodyFont: string
}) {
  return (
    <div className="text-center" style={{ marginBottom: 32 }}>
      <motion.div variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}>
        <Ornament accent={accent} />
      </motion.div>
      <motion.p
        style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginTop: 20, marginBottom: 10 }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        Detail Acara
      </motion.p>
      <motion.h2
        style={{ fontSize: fsh(20), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3 }}
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
        Rangkaian Acara
      </motion.h2>
    </div>
  )
}

function MapsButton({ url, accent, text, bodyFont, light, cs }: { url: string; accent: string; text: string; bodyFont: string; light?: boolean; cs: ReturnType<typeof getComponentStyle> }) {
  if (light) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-2"
        style={{
          padding: '10px 20px', border: '1px solid rgba(255,255,255,0.25)',
          color: '#fff', fontSize: fsb(8.5), fontWeight: 500, letterSpacing: '0.18em',
          textTransform: 'uppercase' as const, fontFamily: bodyFont,
          textDecoration: 'none', transition: 'all 0.3s',
        }}>
        <MapPin size={12} style={{ opacity: 0.6 }} />
        Lihat Peta
      </a>
    )
  }
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      style={{
        ...btnStyle(cs.button, cs.border, accent, text, { size: 'sm' }),
        fontFamily: bodyFont,
        textDecoration: 'none',
      }}>
      <MapPin size={12} style={{ opacity: 0.6 }} />
      Lihat Peta
    </a>
  )
}

function EventInfo({ event, accent, text, bodyFont, light }: {
  event: EventDetail; accent: string; text: string; bodyFont: string; light?: boolean
}) {
  const labelColor = light ? 'rgba(255,255,255,0.6)' : `${text}65`
  const valueColor = light ? 'rgba(255,255,255,0.9)' : `${text}95`
  const subColor = light ? 'rgba(255,255,255,0.6)' : `${text}65`
  const iconColor = light ? 'rgba(255,255,255,0.5)' : `${accent}70`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="flex items-center gap-3">
        <CalendarDays size={13} style={{ color: iconColor, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: fsb(7), letterSpacing: '0.2em', textTransform: 'uppercase', color: labelColor, fontFamily: bodyFont, marginBottom: 3 }}>Tanggal</p>
          <p style={{ fontSize: fsb(10.5), color: valueColor, fontFamily: bodyFont, lineHeight: 1.5 }} className="capitalize">{fmt(event.date)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Clock size={13} style={{ color: iconColor, flexShrink: 0 }} />
        <div>
          <p style={{ fontSize: fsb(7), letterSpacing: '0.2em', textTransform: 'uppercase', color: labelColor, fontFamily: bodyFont, marginBottom: 3 }}>Waktu</p>
          <p style={{ fontSize: fsb(10.5), color: valueColor, fontFamily: bodyFont }}>{event.time} WIB</p>
        </div>
      </div>
      <div className="flex items-start gap-3">
        <MapPin size={13} style={{ color: iconColor, flexShrink: 0, marginTop: 2 }} />
        <div>
          <p style={{ fontSize: fsb(7), letterSpacing: '0.2em', textTransform: 'uppercase', color: labelColor, fontFamily: bodyFont, marginBottom: 3 }}>Lokasi</p>
          <p style={{ fontSize: fsb(10.5), color: valueColor, fontFamily: bodyFont, lineHeight: 1.5 }}>{event.venue_name}</p>
          {event.venue_address && (
            <p style={{ fontSize: fsb(9), color: subColor, fontFamily: bodyFont, lineHeight: 1.7, marginTop: 3 }}>{event.venue_address}</p>
          )}
        </div>
      </div>
    </div>
  )
}

//  DEFAULT: Clean editorial cards 

function DefaultView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, events, cs } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

        <EditorialHeader accent={accent} text={text} headingFont={headingFont} bodyFont={bodyFont} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {events.map(({ title, event, index }) => (
            <motion.div key={title}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: index * 0.12 } } }}>

              <div style={{ border: `1px solid ${accent}28`, padding: 24, ...cardBg(section.background) }}>
                {/* Title bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <div style={{ width: 3, height: 28, background: `${accent}50` }} />
                  <div>
                    <p style={{ fontSize: fsb(7.5), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}60`, fontFamily: bodyFont, marginBottom: 4 }}>
                      {String(index + 1).padStart(2, '0')}
                    </p>
                    <h3 style={{ fontSize: fsh(17), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em' }}>
                      {title}
                    </h3>
                  </div>
                </div>

                {/* Venue photo */}
                {event.venue_photo_url && (
                  <div style={{ width: '100%', height: 140, overflow: 'hidden', marginBottom: 20 }}>
                    <img src={event.venue_photo_url} alt={event.venue_name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  </div>
                )}

                <EventInfo event={event} accent={accent} text={text} bodyFont={bodyFont} />

                {event.maps_url && (
                  <div style={{ marginTop: 20 }}>
                    <MapsButton url={event.maps_url} accent={accent} text={text} bodyFont={bodyFont} cs={cs} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <FooterOrnament accent={accent} />
      </motion.div>
    </SectionWrapper>
  )
}

//  CINEMATIC: Full-bleed venue photos with overlay 

function CinematicView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, headingFont, bodyFont, events, cs } = ctx

  return (
    <SectionWrapper section={section}>
      <div className="w-full py-14">
        <div className="px-6 max-w-[300px] mx-auto" style={{ marginBottom: 32 }}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
            <div className="text-center">
              <motion.div variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}>
                <div className="flex items-center justify-center gap-3">
                  <div style={{ width: 5, height: 5, borderRadius: '50%', border: '0.5px solid rgba(255,255,255,0.15)' }} />
                </div>
              </motion.div>
              <motion.p
                style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontFamily: bodyFont, marginTop: 20, marginBottom: 10 }}
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
                Detail Acara
              </motion.p>
              <motion.h2
                style={{ fontSize: fsh(20), fontWeight: 400, color: '#fff', fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3 }}
                variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
                Rangkaian Acara
              </motion.h2>
            </div>
          </motion.div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {events.map(({ title, event, index }) => (
            <motion.div key={title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: index * 0.15 }}
              style={{ position: 'relative', width: '100%', minHeight: 380, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>

              {/* Background */}
              {event.venue_photo_url ? (
                <img src={event.venue_photo_url} alt={event.venue_name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ position: 'absolute', inset: 0, background: `${accent}15` }} />
              )}

              {/* Gradient overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 30%, rgba(0,0,0,0.75) 100%)' }} />

              {/* Number tag */}
              <div style={{
                position: 'absolute', top: 24, left: 24,
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span style={{ fontSize: fsb(8), letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', fontFamily: bodyFont }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
              </div>

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1, padding: '0 24px 32px' }}>
                <p style={{ fontSize: fsb(8), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}cc`, fontFamily: bodyFont, marginBottom: 8 }}>
                  {title}
                </p>
                <h3 style={{ fontSize: fsh(22), fontWeight: 400, color: '#fff', fontFamily: headingFont, lineHeight: 1.25, marginBottom: 20, textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
                  {event.venue_name}
                </h3>

                <EventInfo event={event} accent={accent} text="#ffffff" bodyFont={bodyFont} light />

                {event.maps_url && (
                  <div style={{ marginTop: 20 }}>
                    <MapsButton url={event.maps_url} accent={accent} text="#ffffff" bodyFont={bodyFont} light cs={cs} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center justify-center gap-2" style={{ marginTop: 28 }}>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: `${accent}35` }} />
        </div>
      </div>
    </SectionWrapper>
  )
}

//  TIMELINE: Vertical line with dots 

function TimelineView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, events, cs } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

        <EditorialHeader accent={accent} text={text} headingFont={headingFont} bodyFont={bodyFont} />

        <div style={{ position: 'relative', paddingLeft: 28 }}>
          {/* Vertical line */}
          <div style={{ position: 'absolute', left: 5, top: 8, bottom: 8, width: '0.5px', background: `${accent}35` }} />

          {events.map(({ title, event, index }) => (
            <motion.div key={title}
              variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0, transition: { delay: index * 0.15 } } }}
              style={{ marginBottom: index < events.length - 1 ? 36 : 0, position: 'relative' }}>

              {/* Dot */}
              <div style={{
                position: 'absolute', left: -28, top: 6,
                width: 11, height: 11, borderRadius: '50%',
                border: `1.5px solid ${accent}50`, background: `${accent}15`,
              }}>
                <div style={{ position: 'absolute', inset: 3, borderRadius: '50%', background: `${accent}60` }} />
              </div>

              {/* Event label */}
              <p style={{ fontSize: fsb(8), letterSpacing: '0.25em', textTransform: 'uppercase', color: `${accent}60`, fontFamily: bodyFont, marginBottom: 6 }}>
                {title}
              </p>
              <h3 style={{ fontSize: fsh(17), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 16 }}>
                {event.venue_name}
              </h3>

              {/* Venue photo */}
              {event.venue_photo_url && (
                <div style={{ width: '100%', height: 120, overflow: 'hidden', marginBottom: 16 }}>
                  <img src={event.venue_photo_url} alt={event.venue_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}

              <EventInfo event={event} accent={accent} text={text} bodyFont={bodyFont} />

              {event.maps_url && (
                <div style={{ marginTop: 16 }}>
                  <MapsButton url={event.maps_url} accent={accent} text={text} bodyFont={bodyFont} cs={cs} />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        <FooterOrnament accent={accent} />
      </motion.div>
    </SectionWrapper>
  )
}

//  MAGAZINE: Left-aligned with accent bar 

function MagazineView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, events, cs } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

        {/* Left-aligned header */}
        <motion.div style={{ marginBottom: 36 }}
          variants={{ hidden: { opacity: 0, x: -10 }, visible: { opacity: 1, x: 0 } }}>
          <div style={{ width: 28, height: 3, background: `${accent}60`, marginBottom: 16 }} />
          <p style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginBottom: 8 }}>
            Detail Acara
          </p>
          <h2 style={{ fontSize: fsh(24), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3 }}>
            Rangkaian Acara
          </h2>
        </motion.div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {events.map(({ title, event, index }) => (
            <motion.div key={title}
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { delay: index * 0.12 } } }}>

              {/* Venue photo full-width */}
              {event.venue_photo_url && (
                <div style={{ width: '100%', height: 160, overflow: 'hidden', marginBottom: 20 }}>
                  <img src={event.venue_photo_url} alt={event.venue_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: 16 }}>
                {/* Accent bar */}
                <div style={{ width: 3, background: `${accent}40`, flexShrink: 0 }} />

                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: fsb(7.5), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}60`, fontFamily: bodyFont, marginBottom: 6 }}>
                    {String(index + 1).padStart(2, '0')}  {title}
                  </p>
                  <h3 style={{ fontSize: fsh(18), fontWeight: 400, color: text, fontFamily: headingFont, lineHeight: 1.3, marginBottom: 16 }}>
                    {event.venue_name}
                  </h3>

                  <EventInfo event={event} accent={accent} text={text} bodyFont={bodyFont} />

                  {event.maps_url && (
                    <div style={{ marginTop: 16 }}>
                      <MapsButton url={event.maps_url} accent={accent} text={text} bodyFont={bodyFont} cs={cs} />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <FooterOrnament accent={accent} />
      </motion.div>
    </SectionWrapper>
  )
}

//  ELEGANT: Centered with ornamental dividers 

function ElegantView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, events, cs } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

        <EditorialHeader accent={accent} text={text} headingFont={headingFont} bodyFont={bodyFont} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {events.map(({ title, event, index }) => (
            <motion.div key={title} className="text-center"
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: { delay: index * 0.15 } } }}>

              {/* Divider between events */}
              {index > 0 && (
                <div className="flex items-center justify-center gap-3" style={{ margin: '28px 0' }}>
                  <div style={{ width: 5, height: 5, transform: 'rotate(45deg)', border: `0.5px solid ${accent}30` }} />
                </div>
              )}

              {/* Venue photo */}
              {event.venue_photo_url && (
                <div style={{ width: '100%', height: 160, overflow: 'hidden', marginBottom: 20 }}>
                  <img src={event.venue_photo_url} alt={event.venue_name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}

              <p style={{ fontSize: fsb(8), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}60`, fontFamily: bodyFont, marginBottom: 8 }}>
                {title}
              </p>
              <h3 style={{ fontSize: fsh(20), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 6 }}>
                {event.venue_name}
              </h3>
              <p style={{ fontSize: fsb(10), color: `${text}70`, fontFamily: bodyFont, fontStyle: 'italic', marginBottom: 20 }} className="capitalize">
                {fmt(event.date)}  {event.time} WIB
              </p>

              {event.venue_address && (
                <p style={{ fontSize: fsb(9.5), color: `${text}60`, fontFamily: bodyFont, lineHeight: 1.8, marginBottom: 16 }}>
                  {event.venue_address}
                </p>
              )}

              {event.maps_url && (
                <MapsButton url={event.maps_url} accent={accent} text={text} bodyFont={bodyFont} cs={cs} />
              )}
            </motion.div>
          ))}
        </div>

        <FooterOrnament accent={accent} />
      </motion.div>
    </SectionWrapper>
  )
}

//  MAIN 

export default function EventsSection({ section, data, meta }: Props) {
  const { accent, text, primary } = meta.color_scheme
  const font    = resolveFont(meta, section)
  const variant = section.style_variant ?? 'default'

  const events: EventItem[] = [
    data.akad    ? { title: 'Akad Nikah', event: data.akad,    index: 0 } : null,
    data.resepsi ? { title: 'Resepsi',    event: data.resepsi, index: 1 } : null,
  ].filter(Boolean) as EventItem[]

  const cs = getComponentStyle(meta.component_style)
  const ctx: StyleCtx = {
    accent, text, primary,
    headingFont: `'${font.heading}', serif`,
    bodyFont: `'${font.body}', serif`,
    events,
    cs,
  }

  switch (variant) {
    case 'cinematic': return <CinematicView section={section} ctx={ctx} />
    case 'timeline':  return <TimelineView  section={section} ctx={ctx} />
    case 'magazine':  return <MagazineView  section={section} ctx={ctx} />
    case 'elegant':   return <ElegantView   section={section} ctx={ctx} />
    default:          return <DefaultView   section={section} ctx={ctx} />
  }
}
