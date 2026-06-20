'use client'

import { motion } from 'framer-motion'
import { Download, Instagram } from 'lucide-react'
import type { SectionConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import SectionWrapper, { resolveFont, fsh, fsb } from '../SectionWrapper'
import { getComponentStyle, btnStyle } from '@/lib/component-styles'
import { usePreviewContext } from '../PreviewContext'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
}

type StyleCtx = {
  accent: string; text: string
  headingFont: string; bodyFont: string
  url: string; filename: string
  hasImage: boolean
  cs: ReturnType<typeof getComponentStyle>
}

function Ornament({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div style={{ width: 5, height: 5, borderRadius: '50%', border: `0.5px solid ${accent}40` }} />
    </div>
  )
}

function Placeholder({ accent, text, bodyFont }: { accent: string; text: string; bodyFont: string }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
      background: `${accent}10`,
    }}>
      <Instagram size={28} style={{ color: `${accent}30` }} />
      <p style={{ fontSize: fsb(9), color: `${text}65`, fontFamily: bodyFont, letterSpacing: '0.1em', textAlign: 'center', padding: '0 24px' }}>
        Upload template IG Story di dashboard
      </p>
    </div>
  )
}

function FooterOrnament({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-2" style={{ marginTop: 20 }}>
      <div style={{ width: 3, height: 3, borderRadius: '50%', background: `${accent}25` }} />
    </div>
  )
}

function DownloadButton({ ctx, disabled }: { ctx: StyleCtx; disabled?: boolean }) {
  const { accent, text, bodyFont, url, filename, hasImage, cs } = ctx
  if (!hasImage || disabled) {
    return (
      <div style={{
        ...btnStyle(cs.button, cs.border, accent, text, { disabled: true, icon: true }),
        width: '100%', fontFamily: bodyFont,
      }}>
        <Download size={14} />
        Unduh Template
      </div>
    )
  }
  return (
    <a href={url} download={filename} style={{
      ...btnStyle(cs.button, cs.border, accent, text, { icon: true }),
      width: '100%', fontFamily: bodyFont,
      textDecoration: 'none',
    }}>
      <Download size={14} />
      Unduh Template
      <Instagram size={14} style={{ opacity: 0.6 }} />
    </a>
  )
}

//  DEFAULT: Centered editorial 

function DefaultView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, url, hasImage } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

        {/* Header */}
        <div className="text-center" style={{ marginBottom: 28 }}>
          <motion.div variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}>
            <Ornament accent={accent} />
          </motion.div>
          <motion.p
            style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginTop: 20, marginBottom: 10 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            Bagikan Momen
          </motion.p>
          <motion.h2
            style={{ fontSize: fsh(20), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 12 }}
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
            Template IG Story
          </motion.h2>
          <motion.p
            style={{ fontSize: fsb(10), color: `${text}70`, fontFamily: bodyFont, lineHeight: 1.9, fontStyle: 'italic' }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            Unduh dan bagikan kabar<br />bahagia ini di Instagram Anda.
          </motion.p>
        </div>

        {/* Preview */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          style={{ position: 'relative', overflow: 'hidden', aspectRatio: '9 / 16', border: `1px solid ${accent}25`, marginBottom: 20 }}>
          {hasImage ? (
            <>
              <img src={url} alt="IG Story" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }} />
            </>
          ) : (
            <Placeholder accent={accent} text={text} bodyFont={bodyFont} />
          )}
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
          <DownloadButton ctx={ctx} />
        </motion.div>

        <FooterOrnament accent={accent} />
      </motion.div>
    </SectionWrapper>
  )
}

//  PHONE: Mockup inside phone frame 

function PhoneView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, url, hasImage } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

        {/* Header */}
        <div className="text-center" style={{ marginBottom: 28 }}>
          <motion.div variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}>
            <Ornament accent={accent} />
          </motion.div>
          <motion.p
            style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginTop: 20, marginBottom: 10 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            Bagikan Momen
          </motion.p>
          <motion.h2
            style={{ fontSize: fsh(20), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3, marginBottom: 12 }}
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
            Template IG Story
          </motion.h2>
        </div>

        {/* Phone frame */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <div style={{
            position: 'relative', width: 200,
            padding: '12px 10px', borderRadius: 28,
            background: '#1a1a1a',
            boxShadow: '0 12px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.08)',
          }}>
            {/* Notch */}
            <div style={{
              position: 'absolute', top: 8, left: '50%', transform: 'translateX(-50%)',
              width: 50, height: 5, borderRadius: 3, background: '#000',
            }} />

            {/* Screen */}
            <div style={{
              borderRadius: 18, overflow: 'hidden',
              aspectRatio: '9 / 16', background: '#000',
            }}>
              {hasImage ? (
                <img src={url} alt="IG Story" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              ) : (
                <Placeholder accent={accent} text={text} bodyFont={bodyFont} />
              )}
            </div>

            {/* Home indicator */}
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: 'rgba(255,255,255,0.15)',
              margin: '8px auto 0',
            }} />
          </div>
        </motion.div>

        {/* Description */}
        <motion.p
          className="text-center"
          style={{ fontSize: fsb(10), color: `${text}65`, fontFamily: bodyFont, lineHeight: 1.9, fontStyle: 'italic', marginBottom: 20, maxWidth: 240, margin: '0 auto 20px' }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          Unduh dan bagikan kabar bahagia ini di Instagram Story Anda.
        </motion.p>

        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
          <DownloadButton ctx={ctx} />
        </motion.div>

        <FooterOrnament accent={accent} />
      </motion.div>
    </SectionWrapper>
  )
}

//  MINIMAL: Large image, overlay button at bottom 

function MinimalView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, url, filename, hasImage } = ctx

  return (
    <SectionWrapper section={section}>
      <div className="w-full py-14">
        {/* Compact header */}
        <motion.div
          className="text-center px-6"
          style={{ marginBottom: 20 }}
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
          <motion.p
            style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginBottom: 8 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            Bagikan Momen
          </motion.p>
        </motion.div>

        {/* Full-width image with overlay */}
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
          style={{ position: 'relative', margin: '0 16px', overflow: 'hidden' }}>

          <div style={{ aspectRatio: '9 / 16' }}>
            {hasImage ? (
              <img src={url} alt="IG Story" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <Placeholder accent={accent} text={text} bodyFont={bodyFont} />
            )}
          </div>

          {/* Bottom overlay with button */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '48px 20px 20px',
            background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 60%, transparent 100%)',
          }}>
            <p style={{
              fontSize: fsh(16), fontWeight: 400, color: '#fff', fontFamily: headingFont,
              textShadow: '0 1px 12px rgba(0,0,0,0.5)', marginBottom: 6,
            }}>
              Template IG Story
            </p>
            <p style={{
              fontSize: fsb(9), color: 'rgba(255,255,255,0.5)', fontFamily: bodyFont,
              fontStyle: 'italic', marginBottom: 16,
            }}>
              Bagikan undangan ini di Instagram
            </p>

            {hasImage ? (
              <a href={url} download={filename} style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px',
                border: '1px solid rgba(255,255,255,0.3)',
                color: '#fff', fontSize: fsb(9), fontWeight: 500,
                letterSpacing: '0.18em', textTransform: 'uppercase' as const,
                fontFamily: bodyFont, textDecoration: 'none',
                cursor: 'pointer',
              }}>
                <Download size={13} />
                Unduh
              </a>
            ) : (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px', border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.3)', fontSize: fsb(9), fontWeight: 500,
                letterSpacing: '0.18em', textTransform: 'uppercase' as const, fontFamily: bodyFont,
              }}>
                <Download size={13} />
                Unduh
              </span>
            )}
          </div>
        </motion.div>

        <FooterOrnament accent={accent} />
      </div>
    </SectionWrapper>
  )
}

//  MAIN 

export default function IGStorySection({ section, data, meta }: Props) {
  const { accent, text } = meta.color_scheme
  const font = resolveFont(meta, section)
  const url = data.ig_story_image_url ?? ''
  const { isPreview } = usePreviewContext()
  const hasImage = !!url

  if (!hasImage && !isPreview) return null

  const cs = getComponentStyle(meta.component_style)
  const ctx: StyleCtx = {
    accent, text,
    headingFont: `'${font.heading}', serif`,
    bodyFont: `'${font.body}', serif`,
    url, hasImage, cs,
    filename: `undangan-${data.groom_name || 'kami'}-${data.bride_name || ''}-ig-story.jpg`
      .toLowerCase().replace(/\s+/g, '-'),
  }

  const variant = section.style_variant ?? 'default'

  switch (variant) {
    case 'phone':   return <PhoneView   section={section} ctx={ctx} />
    case 'minimal': return <MinimalView section={section} ctx={ctx} />
    default:        return <DefaultView section={section} ctx={ctx} />
  }
}
