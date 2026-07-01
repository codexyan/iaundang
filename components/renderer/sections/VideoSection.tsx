'use client'

import { motion } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import SectionWrapper, { resolveFont, fsh, fsb } from '../SectionWrapper'
import SectionOrnament from '../SectionOrnament'

//  Types 

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
}

interface StyleCtx {
  section: SectionConfig
  data: NewInvitationData
  font: ReturnType<typeof resolveFont>
  accent: string
  text: string
  embed: string | null
  url: string
  caption?: string
}

//  Embed URL builder 

function buildEmbedUrl(url: string): string | null {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&?/]+)/)
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`
  const vimeo = url.match(/vimeo\.com\/(\d+)/)
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`
  return null
}

//  Shared video player 

function VideoPlayer({ embed, url, caption, style }: {
  embed: string | null
  url: string
  caption?: string
  style?: React.CSSProperties
}) {
  return embed ? (
    <iframe
      src={embed}
      title={caption || 'Video'}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full"
      style={style}
    />
  ) : (
    <video src={url} controls className="w-full h-full object-cover" style={style} />
  )
}

//  Variant: Default (editorial ornament header + sharp frame) 

function VideoDefault({ section, data, font, accent, text, embed, url, caption }: StyleCtx) {
  const dur = 0.6

  return (
    <SectionWrapper section={section} className="px-6 py-16">
      <div className="max-w-[300px] mx-auto">
        {/* Ornament header */}
        <div className="text-center mb-8">
          <motion.div
            className="mb-5"
            variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1, transition: { duration: 0.5 } } }}
          >
            <SectionOrnament accent={accent} />
          </motion.div>

          <motion.p
            style={{
              fontSize: fsb(9),
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
              color: `${accent}80`,
              fontFamily: `'${font.body}', serif`,
              marginBottom: 10,
            }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.06 } } }}
          >
            Video Sinematik
          </motion.p>

          <motion.h2
            style={{
              fontSize: fsh(18),
              fontWeight: 400,
              color: text,
              fontFamily: `'${font.heading}', serif`,
              letterSpacing: '-0.01em',
            }}
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { delay: 0.1 } } }}
          >
            Our Moment
          </motion.h2>
        </div>

        {/* Video in sharp-edge frame */}
        <motion.div
          className="aspect-video w-full overflow-hidden"
          style={{ border: `1px solid ${accent}33` }}
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { delay: 0.2, duration: dur } } }}
        >
          <VideoPlayer embed={embed} url={url} caption={caption} />
        </motion.div>

        {/* Caption italic below */}
        {caption && (
          <motion.p
            className="text-center mt-5"
            style={{
              fontSize: fsb(10.5),
              fontStyle: 'italic',
              color: `${text}99`,
              fontFamily: `'${font.body}', serif`,
              lineHeight: 1.8,
            }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.35 } } }}
          >
            {caption}
          </motion.p>
        )}
      </div>
    </SectionWrapper>
  )
}

//  Variant: Cinematic (full-width, caption overlay with gradient) 

function VideoCinematic({ section, data, font, accent, text, embed, url, caption }: StyleCtx) {
  return (
    <SectionWrapper section={section}>
      <div className="max-w-[300px] mx-auto">
        {/* Thin accent line + label above */}
        <motion.div
          className="px-6 mb-3"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.5 } } }}
        >
          <div style={{ height: 1, width: 24, backgroundColor: accent, marginBottom: 8 }} />
          <p style={{
            fontSize: fsb(8),
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: `${accent}99`,
            fontFamily: `'${font.body}', serif`,
          }}>
            Cinematic Film
          </p>
        </motion.div>

        {/* Full-width video (no padding) */}
        <motion.div
          className="relative w-full aspect-video overflow-hidden"
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.15, duration: 0.6 } } }}
        >
          <VideoPlayer embed={embed} url={url} caption={caption} />

          {/* Caption overlay at bottom with gradient */}
          {caption && (
            <div
              className="absolute bottom-0 left-0 right-0 px-4 pb-3 pt-8"
              style={{
                background: `linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 100%)`,
                pointerEvents: 'none',
              }}
            >
              <p style={{
                fontSize: fsb(9),
                fontStyle: 'italic',
                color: 'rgba(255,255,255,0.85)',
                fontFamily: `'${font.body}', serif`,
                lineHeight: 1.7,
              }}>
                {caption}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </SectionWrapper>
  )
}

//  Variant: Magazine (left-aligned editorial) 

function VideoMagazine({ section, data, font, accent, text, embed, url, caption }: StyleCtx) {
  return (
    <SectionWrapper section={section} className="px-6 py-16">
      <div className="max-w-[300px] mx-auto">
        {/* Accent bar + label top, left-aligned */}
        <motion.div
          className="mb-6"
          variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0, transition: { duration: 0.5 } } }}
        >
          <div style={{ height: 1, width: 32, backgroundColor: accent, marginBottom: 10 }} />
          <p style={{
            fontSize: fsb(8),
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: `${accent}88`,
            fontFamily: `'${font.body}', serif`,
            marginBottom: 4,
          }}>
            Video
          </p>
          <h2 style={{
            fontSize: fsh(16),
            fontWeight: 400,
            color: text,
            fontFamily: `'${font.heading}', serif`,
            letterSpacing: '-0.01em',
          }}>
            Our Film
          </h2>
        </motion.div>

        {/* Video below */}
        <motion.div
          className="aspect-video w-full overflow-hidden"
          style={{ border: `1px solid ${accent}22` }}
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: 0.15, duration: 0.6 } } }}
        >
          <VideoPlayer embed={embed} url={url} caption={caption} />
        </motion.div>

        {/* Caption italic left-aligned */}
        {caption && (
          <motion.p
            className="mt-5"
            style={{
              fontSize: fsb(10.5),
              fontStyle: 'italic',
              color: `${text}88`,
              fontFamily: `'${font.body}', serif`,
              lineHeight: 1.8,
              textAlign: 'left',
            }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.3 } } }}
          >
            {caption}
          </motion.p>
        )}
      </div>
    </SectionWrapper>
  )
}

//  Variant: Minimal (no header, thin border, small caption centered) 

function VideoMinimal({ section, data, font, accent, text, embed, url, caption }: StyleCtx) {
  return (
    <SectionWrapper section={section} className="px-6 py-14">
      <div className="max-w-[300px] mx-auto">
        {/* Video with thin border, no header */}
        <motion.div
          className="aspect-video w-full overflow-hidden"
          style={{ border: `1px solid ${accent}22` }}
          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
        >
          <VideoPlayer embed={embed} url={url} caption={caption} />
        </motion.div>

        {/* Caption small centered below */}
        {caption && (
          <motion.p
            className="text-center mt-4"
            style={{
              fontSize: fsb(9),
              color: `${text}77`,
              fontFamily: `'${font.body}', serif`,
              lineHeight: 1.7,
            }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.2 } } }}
          >
            {caption}
          </motion.p>
        )}
      </div>
    </SectionWrapper>
  )
}

//  Main export 

export default function VideoSection({ section, data, meta }: Props) {
  const { accent, text } = meta.color_scheme
  const font = resolveFont(meta, section)
  const variant = section.style_variant ?? 'default'
  const url = data.video_embed_url

  if (!url) return null

  const embed = buildEmbedUrl(url)
  const caption = data.video_caption

  const ctx: StyleCtx = { section, data, font, accent, text, embed, url, caption }

  return (
    <>
      {variant === 'cinematic' && <VideoCinematic {...ctx} />}
      {variant === 'magazine'  && <VideoMagazine  {...ctx} />}
      {variant === 'minimal'   && <VideoMinimal   {...ctx} />}
      {variant !== 'cinematic' && variant !== 'magazine' && variant !== 'minimal' && (
        <VideoDefault {...ctx} />
      )}
    </>
  )
}
