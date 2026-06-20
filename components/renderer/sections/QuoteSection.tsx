'use client'

import { motion } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import SectionWrapper, { resolveFont, fsh, fsb } from '../SectionWrapper'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
}

type StyleCtx = {
  accent: string
  text: string
  headingFont: string
  bodyFont: string
  arabic: string
  translation: string
  source: string
}

const ARABIC_FONT_STACK = `'Amiri', 'Scheherazade New', 'Traditional Arabic', 'Noto Naskh Arabic', serif`

//  Shared ornaments 

function Ornament({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div style={{ width: 5, height: 5, borderRadius: '50%', border: `0.5px solid ${accent}40` }} />
    </div>
  )
}

function FooterOrnament({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-3" style={{ marginTop: 24 }}>
      <div style={{ width: 5, height: 5, borderRadius: '50%', border: `0.5px solid ${accent}40` }} />
    </div>
  )
}

//  DEFAULT: Centered, ornament top/bottom 

function DefaultView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, arabic, translation, source } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto text-center w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
      >
        <motion.div variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}>
          <Ornament accent={accent} />
        </motion.div>

        {arabic && (
          <motion.p
            dir="rtl"
            style={{
              fontFamily: ARABIC_FONT_STACK,
              fontSize: fsh(22),
              color: accent,
              lineHeight: 2,
              marginTop: 20,
            }}
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
          >
            {arabic}
          </motion.p>
        )}

        {translation && (
          <motion.p
            style={{
              fontSize: fsb(11),
              fontStyle: 'italic',
              color: `${text}bb`,
              fontFamily: bodyFont,
              lineHeight: 1.9,
              marginTop: 16,
            }}
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          >
            &ldquo;{translation}&rdquo;
          </motion.p>
        )}

        {source && (
          <motion.p
            style={{
              fontSize: fsb(8),
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: `${accent}70`,
              fontFamily: bodyFont,
              marginTop: 12,
            }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          >
            {source}
          </motion.p>
        )}

        <motion.div variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}>
          <FooterOrnament accent={accent} />
        </motion.div>
      </motion.div>
    </SectionWrapper>
  )
}

//  CINEMATIC: Full-height dark overlay, dramatic 

function CinematicView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, arabic, translation, source } = ctx

  // Use section.background for the image  SectionWrapper handles overlay rendering
  const sectionCfg: SectionConfig = {
    ...section,
    background: section.background?.type === 'image'
      ? { ...section.background, overlay_opacity: section.background.overlay_opacity ?? 0.55 }
      : { type: 'color', value: '#0a0a0a' },
  }

  return (
    <SectionWrapper section={sectionCfg} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto text-center w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
      >
        {arabic && (
          <motion.p
            dir="rtl"
            style={{
              fontFamily: ARABIC_FONT_STACK,
              fontSize: fsh(28),
              color: '#ffffff',
              lineHeight: 2,
            }}
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          >
            {arabic}
          </motion.p>
        )}

        {translation && (
          <motion.p
            style={{
              fontSize: fsb(12),
              fontStyle: 'italic',
              color: 'rgba(255,255,255,0.82)',
              fontFamily: bodyFont,
              lineHeight: 2,
            }}
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          >
            &ldquo;{translation}&rdquo;
          </motion.p>
        )}

        {source && (
          <motion.p
            style={{
              fontSize: fsb(8),
              letterSpacing: '0.25em',
              textTransform: 'uppercase',
              color: `${accent}88`,
              fontFamily: bodyFont,
              marginTop: 16,
            }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          >
            {source}
          </motion.p>
        )}

      </motion.div>
    </SectionWrapper>
  )
}

//  ELEGANT: Large decorative quotes, diamond divider 

function ElegantView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, arabic, translation, source } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto text-center w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
      >
        {arabic && (
          <motion.p
            dir="rtl"
            style={{
              fontFamily: ARABIC_FONT_STACK,
              fontSize: fsh(20),
              color: accent,
              lineHeight: 2,
            }}
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
          >
            {arabic}
          </motion.p>
        )}

        {/* Diamond divider */}
        {arabic && translation && (
          <motion.div
            className="flex items-center justify-center gap-3"
            style={{ margin: '18px 0' }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          >
            <div style={{
              width: 7, height: 7,
              border: `0.5px solid ${accent}50`,
              transform: 'rotate(45deg)',
            }} />
          </motion.div>
        )}

        {translation && (
          <motion.div
            variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
          >
            {/* Opening decorative quote */}
            <p style={{
              fontSize: fsh(48),
              fontWeight: 400,
              color: `${accent}25`,
              fontFamily: headingFont,
              lineHeight: 0.6,
              marginBottom: 6,
            }}>
              &ldquo;
            </p>

            <p style={{
              fontSize: fsb(11),
              fontStyle: 'italic',
              color: `${text}99`,
              fontFamily: bodyFont,
              lineHeight: 1.9,
            }}>
              {translation}
            </p>

            {/* Closing decorative quote */}
            <p style={{
              fontSize: fsh(48),
              fontWeight: 400,
              color: `${accent}25`,
              fontFamily: headingFont,
              lineHeight: 0.6,
              marginTop: 6,
            }}>
              &rdquo;
            </p>
          </motion.div>
        )}

        {source && (
          <motion.p
            style={{
              fontSize: fsb(8),
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: `${accent}70`,
              fontFamily: bodyFont,
              marginTop: 14,
            }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          >
            {source}
          </motion.p>
        )}
      </motion.div>
    </SectionWrapper>
  )
}

//  MAGAZINE: Left-aligned, accent bar 

function MagazineView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, arabic, translation, source } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
      >
        <div style={{ display: 'flex', gap: 16 }}>
          {/* Accent bar on left */}
          <motion.div
            style={{
              width: 2,
              flexShrink: 0,
              background: `linear-gradient(to bottom, ${accent}55, ${accent}15)`,
            }}
            variants={{ hidden: { scaleY: 0, opacity: 0 }, visible: { scaleY: 1, opacity: 1 } }}
          />

          <div style={{ flex: 1 }}>
            {arabic && (
              <motion.p
                dir="rtl"
                style={{
                  fontFamily: ARABIC_FONT_STACK,
                  fontSize: fsh(19),
                  color: accent,
                  lineHeight: 2,
                  textAlign: 'right',
                }}
                variants={{ hidden: { opacity: 0, x: 12 }, visible: { opacity: 1, x: 0 } }}
              >
                {arabic}
              </motion.p>
            )}

            {translation && (
              <motion.p
                style={{
                  fontSize: fsb(11),
                  fontStyle: 'italic',
                  color: `${text}99`,
                  fontFamily: bodyFont,
                  lineHeight: 1.9,
                  textAlign: 'left',
                }}
                variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}
              >
                &ldquo;{translation}&rdquo;
              </motion.p>
            )}

            {source && (
              <motion.p
                style={{
                  fontSize: fsb(8),
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: `${accent}60`,
                  fontFamily: bodyFont,
                  marginTop: 10,
                  textAlign: 'left',
                }}
                variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              >
                {source}
              </motion.p>
            )}
          </div>
        </div>
      </motion.div>
    </SectionWrapper>
  )
}

//  MINIMAL: Ultra-clean, just content 

function MinimalView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, arabic, translation, source } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto text-center w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
      >
        {arabic && (
          <motion.p
            dir="rtl"
            style={{
              fontFamily: ARABIC_FONT_STACK,
              fontSize: fsh(18),
              color: `${accent}cc`,
              lineHeight: 2,
            }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          >
            {arabic}
          </motion.p>
        )}

        {translation && (
          <motion.p
            style={{
              fontSize: fsb(10.5),
              fontStyle: 'italic',
              color: `${text}99`,
              fontFamily: bodyFont,
              lineHeight: 1.9,
              marginTop: arabic ? 14 : 0,
            }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          >
            &ldquo;{translation}&rdquo;
          </motion.p>
        )}

        {source && (
          <motion.p
            style={{
              fontSize: fsb(7.5),
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: `${text}75`,
              fontFamily: bodyFont,
              marginTop: 10,
            }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          >
            {source}
          </motion.p>
        )}

      </motion.div>
    </SectionWrapper>
  )
}

//  Main QuoteSection 

export default function QuoteSection({ section, data, meta }: Props) {
  const { accent, text } = meta.color_scheme
  const font = resolveFont(meta, section)
  const variant = section.style_variant ?? 'default'

  const arabic      = data.quote_arabic ?? ''
  const translation = data.quote_translation ?? ''
  const source      = data.quote_source ?? ''

  if (!arabic && !translation && !source) return null

  const headingFont = `'${font.heading}', serif`
  const bodyFont    = `'${font.body}', serif`

  const ctx: StyleCtx = { accent, text, headingFont, bodyFont, arabic, translation, source }

  switch (variant) {
    case 'cinematic': return <CinematicView section={section} ctx={ctx} />
    case 'elegant':   return <ElegantView   section={section} ctx={ctx} />
    case 'magazine':  return <MagazineView  section={section} ctx={ctx} />
    case 'minimal':   return <MinimalView   section={section} ctx={ctx} />
    default:          return <DefaultView   section={section} ctx={ctx} />
  }
}
