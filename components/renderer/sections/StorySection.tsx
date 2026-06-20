'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta, StoryChapter } from '@/lib/types'
import SectionWrapper, { resolveFont, fsh, fsb } from '../SectionWrapper'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
}

function Ornament({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div style={{ width: 5, height: 5, borderRadius: '50%', border: `0.5px solid ${accent}40` }} />
    </div>
  )
}

//  IG Stories-style progress bars 

function ProgressBars({ total, current, progress, accent }: {
  total: number; current: number; progress: number; accent: string
}) {
  return (
    <div style={{ display: 'flex', gap: 3, padding: '0 12px' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 2.5, borderRadius: 2,
          background: 'rgba(255,255,255,0.2)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%', borderRadius: 2,
            background: i < current ? '#fff' : i === current ? accent : 'transparent',
            width: i < current ? '100%' : i === current ? `${progress}%` : '0%',
            transition: i === current ? 'width 0.1s linear' : 'none',
          }} />
        </div>
      ))}
    </div>
  )
}

//  Stories viewer 

const STORY_DURATION = 6000

function StoriesViewer({ chapters, accent, text, font }: {
  chapters: StoryChapter[]; accent: string; text: string
  font: { heading: string; body: string }
}) {
  const [idx, setIdx] = useState(0)
  const [progress, setProgress] = useState(0)
  const [paused, setPaused] = useState(false)

  const total = chapters.length
  const ch = chapters[idx]
  const hasBg = !!ch.photo_url || !!ch.video_url
  const hasVideo = !!ch.video_url
  const overlay = ch.overlay_opacity ?? 0.55

  const goNext = useCallback(() => {
    setProgress(0)
    setIdx(i => (i + 1) % total)
  }, [total])

  const goPrev = useCallback(() => {
    setProgress(0)
    setIdx(i => (i - 1 + total) % total)
  }, [total])

  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { goNext(); return 0 }
        return p + (100 / (STORY_DURATION / 50))
      })
    }, 50)
    return () => clearInterval(interval)
  }, [paused, goNext, idx])

  return (
    <div
      style={{
        position: 'relative', width: '100%',
        aspectRatio: '9 / 16', minHeight: 0,
        overflow: 'hidden',
        backgroundColor: '#111',
        display: 'flex', flexDirection: 'column',
      }}
      onPointerDown={() => setPaused(true)}
      onPointerUp={() => setPaused(false)}
      onPointerLeave={() => setPaused(false)}
    >
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: 0,
            ...(ch.photo_url && !hasVideo ? {
              backgroundImage: `url(${ch.photo_url})`,
              backgroundSize: 'cover', backgroundPosition: 'center',
            } : {}),
          }}>
          {hasVideo && (
            <video src={ch.video_url} autoPlay muted loop playsInline
              className="absolute inset-0 w-full h-full object-cover" />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 1,
        background: hasBg
          ? `linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,${overlay * 0.3}) 30%, rgba(0,0,0,${Math.min(overlay + 0.3, 0.92)}) 100%)`
          : `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.7) 100%)`,
      }} />

      {/* Touch zones */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 10, display: 'flex' }}>
        <div style={{ flex: 1 }} onClick={goPrev} />
        <div style={{ flex: 1 }} onClick={goNext} />
      </div>

      {/* Progress bars */}
      <div style={{ position: 'relative', zIndex: 20, paddingTop: 14 }}>
        <ProgressBars total={total} current={idx} progress={progress} accent={accent} />
      </div>

      {/* Counter */}
      <div style={{ position: 'relative', zIndex: 20, textAlign: 'right', padding: '10px 16px 0' }}>
        <span style={{ fontSize: 9, fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.15em' }}>
          {String(idx + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
        </span>
      </div>

      {/* Content  anchored to bottom */}
      <div style={{
        position: 'relative', zIndex: 15, marginTop: 'auto',
        padding: '0 24px 32px',
        maxWidth: 340,
      }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}>

            {ch.date && (
              <p style={{
                fontSize: fsb(8.5), letterSpacing: '0.28em', textTransform: 'uppercase',
                color: `${accent}cc`, fontFamily: `'${font.body}', serif`, marginBottom: 10,
              }}>
                {ch.date}
              </p>
            )}

            {ch.title && (
              <h2 style={{
                fontSize: fsh(22), fontWeight: 400, lineHeight: 1.25,
                color: '#fff', fontFamily: `'${font.heading}', serif`,
                textShadow: '0 2px 20px rgba(0,0,0,0.5)',
                marginBottom: 12, letterSpacing: '-0.01em',
              }}>
                {ch.title}
              </h2>
            )}

            {ch.text && (
              <p style={{
                fontSize: fsb(10.5), lineHeight: 1.85,
                color: 'rgba(255,255,255,0.72)', fontFamily: `'${font.body}', serif`,
              }}>
                {ch.text}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pause indicator */}
      <AnimatePresence>
        {paused && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)', zIndex: 25,
              display: 'flex', gap: 6,
            }}>
            <div style={{ width: 4, height: 22, borderRadius: 2, background: 'rgba(255,255,255,0.6)' }} />
            <div style={{ width: 4, height: 22, borderRadius: 2, background: 'rgba(255,255,255,0.6)' }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

//  Default: Stories inside section wrapper 

function DefaultView({ section, data, meta }: Props) {
  const font = resolveFont(meta, section)
  const { accent, text } = meta.color_scheme
  const chapters = data.story_chapters ?? []
  const hasChapters = chapters.length > 0
  const bodyFont = `'${font.body}', serif`
  const headingFont = `'${font.heading}', serif`

  return (
    <SectionWrapper section={section}>
      <div className="w-full py-14">

        {/* Header */}
        <div className="text-center px-6 max-w-[300px] mx-auto" style={{ marginBottom: hasChapters ? 24 : 36 }}>
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}>
            <Ornament accent={accent} />
          </motion.div>

          <motion.p
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginTop: 20, marginBottom: 10 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            Kisah Kami
          </motion.p>

          <motion.h2
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{ fontSize: fsh(20), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 12 }}
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
            {data.story_title || 'Perjalanan Cinta'}
          </motion.h2>

          {!hasChapters && data.story_text && (
            <motion.p
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              style={{ fontSize: fsb(10.5), color: `${text}75`, fontFamily: bodyFont, lineHeight: 1.9, fontStyle: 'italic' }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              {data.story_text}
            </motion.p>
          )}
        </div>

        {/* No chapters fallback */}
        {!hasChapters && data.couple_photo_url && (
          <motion.div
            className="mx-auto overflow-hidden"
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            style={{
              width: 140, height: 140, borderRadius: '50%',
              border: `1px solid ${accent}30`,
              boxShadow: `0 0 0 6px ${accent}18`,
              marginBottom: 24,
            }}
            variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1 } }}>
            <img src={data.couple_photo_url} alt="Couple" className="w-full h-full object-cover" />
          </motion.div>
        )}

        {/* Stories viewer */}
        {hasChapters && (
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            style={{ maxWidth: 340, margin: '0 auto', borderRadius: 4, overflow: 'hidden' }}>
            <StoriesViewer chapters={chapters} accent={accent} text={text} font={font} />
          </motion.div>
        )}

        {/* Footer ornament */}
        <motion.div
          className="flex items-center justify-center gap-2 px-6"
          style={{ marginTop: 24 }}
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: `${accent}25` }} />
        </motion.div>

        {hasChapters && (
          <p className="text-center" style={{
            fontSize: fsb(8), color: `${text}60`, fontFamily: bodyFont,
            letterSpacing: '0.1em', marginTop: 12,
          }}>
            Ketuk untuk navigasi
          </p>
        )}
      </div>
    </SectionWrapper>
  )
}

//  Timeline: Vertical timeline with photos 

function TimelineView({ section, data, meta }: Props) {
  const font = resolveFont(meta, section)
  const { accent, text } = meta.color_scheme
  const timeline = data.story_timeline ?? []
  const headingFont = `'${font.heading}', serif`
  const bodyFont = `'${font.body}', serif`

  return (
    <SectionWrapper section={section}>
      <div className="w-full max-w-[300px] mx-auto px-6 py-14">

        {/* Header */}
        <div className="text-center" style={{ marginBottom: 36 }}>
          <motion.div variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}>
            <Ornament accent={accent} />
          </motion.div>

          <motion.p
            style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginTop: 20, marginBottom: 10 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            Kisah Kami
          </motion.p>

          <motion.h2
            style={{ fontSize: fsh(20), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em', marginBottom: 12, lineHeight: 1.3 }}
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
            {data.story_title || 'Perjalanan Cinta'}
          </motion.h2>

          {data.story_text && (
            <motion.p
              style={{ fontSize: fsb(10), color: `${text}70`, fontFamily: bodyFont, lineHeight: 1.9, fontStyle: 'italic' }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              {data.story_text}
            </motion.p>
          )}
        </div>

        {/* Timeline */}
        <div style={{ position: 'relative', paddingLeft: 28 }}>
          <div style={{
            position: 'absolute', top: 8, bottom: 8, left: 5,
            width: 1, background: `linear-gradient(to bottom, ${accent}50, ${accent}10)`,
          }} />

          {timeline.map((item, i) => (
            <motion.div key={i}
              style={{ position: 'relative', paddingBottom: i < timeline.length - 1 ? 32 : 0 }}
              variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0, transition: { delay: 0.1 + i * 0.12, duration: 0.5 } } }}>

              <div style={{
                position: 'absolute', left: -28, top: 6,
                width: 11, height: 11, borderRadius: '50%',
                background: accent, boxShadow: `0 0 0 4px ${accent}25`,
              }}>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 4, height: 4, borderRadius: '50%',
                  background: '#fff', opacity: 0.8,
                }} />
              </div>

              <p style={{
                fontSize: fsb(8), letterSpacing: '0.2em', textTransform: 'uppercase',
                color: accent, fontFamily: bodyFont, fontWeight: 600, marginBottom: 6,
              }}>
                {item.date}
              </p>

              <h3 style={{
                fontSize: fsh(16), fontWeight: 400, color: text,
                fontFamily: headingFont, lineHeight: 1.3, marginBottom: 8,
              }}>
                {item.title}
              </h3>

              {item.photo_url && (
                <div style={{
                  width: '100%', height: 140,
                  borderRadius: 2, overflow: 'hidden',
                  marginBottom: 10, border: `1px solid ${accent}20`,
                }}>
                  <img src={item.photo_url} alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}

              {item.description && (
                <p style={{
                  fontSize: fsb(10.5), lineHeight: 1.85,
                  color: `${text}75`, fontFamily: bodyFont, fontStyle: 'italic',
                }}>
                  {item.description}
                </p>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div className="flex items-center justify-center gap-2" style={{ marginTop: 28 }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: `${accent}25` }} />
        </motion.div>
      </div>
    </SectionWrapper>
  )
}

//  Main 

export default function StorySection({ section, data, meta }: Props) {
  const variant = section.style_variant ?? 'default'

  if (variant === 'timeline' && (data.story_timeline ?? []).length > 0) {
    return <TimelineView section={section} data={data} meta={meta} />
  }

  return <DefaultView section={section} data={data} meta={meta} />
}
