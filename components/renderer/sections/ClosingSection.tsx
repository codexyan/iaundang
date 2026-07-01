'use client'

import { motion } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import SectionWrapper, { resolveFont, fsh, fsb } from '../SectionWrapper'
import SectionOrnament from '../SectionOrnament'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
}

type StyleCtx = {
  accent: string; text: string
  headingFont: string; bodyFont: string
  closingText: string; thankYouText: string
  data: NewInvitationData
}

function Ornament({ accent }: { accent: string }) {
  return <SectionOrnament accent={accent} />
}

function CoupleNames({ data, headingFont, accent, text, size = 24 }: {
  data: NewInvitationData; headingFont: string; accent: string; text: string; size?: number
}) {
  return (
    <>
      <motion.h2
        style={{ fontSize: fsh(size), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3 }}
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        {data.groom_name}
      </motion.h2>
      <motion.div
        className="flex items-center justify-center gap-3"
        style={{ margin: '8px 0' }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        <span style={{ fontSize: fsh(size * 0.58), fontStyle: 'italic', color: `${accent}80`, fontFamily: headingFont }}>&amp;</span>
      </motion.div>
      <motion.h2
        style={{ fontSize: fsh(size), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3 }}
        variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
        {data.bride_name}
      </motion.h2>
    </>
  )
}

function ParentsBlock({ data, accent, text, bodyFont }: {
  data: NewInvitationData; accent: string; text: string; bodyFont: string
}) {
  if (!data.groom_parents && !data.bride_parents) return null
  return (
    <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
      {data.groom_parents && (
        <p style={{ fontSize: fsb(9.5), color: `${text}70`, fontFamily: bodyFont, lineHeight: 1.8, marginBottom: 4 }}>
          {data.groom_parents}
        </p>
      )}
      {data.bride_parents && (
        <p style={{ fontSize: fsb(9.5), color: `${text}70`, fontFamily: bodyFont, lineHeight: 1.8 }}>
          {data.bride_parents}
        </p>
      )}
    </motion.div>
  )
}

function BrandFooter({ text, bodyFont }: { text: string; bodyFont: string }) {
  return (
    <motion.p
      style={{ fontSize: fsb(7.5), color: `${text}50`, fontFamily: bodyFont, letterSpacing: '0.15em', marginTop: 32 }}
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
      iaundang
    </motion.p>
  )
}

//  DEFAULT: Clean editorial 

function DefaultView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, closingText, thankYouText, data } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto text-center w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

        <motion.div variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}>
          <Ornament accent={accent} />
        </motion.div>

        <motion.p
          style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginTop: 20, marginBottom: 10 }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          Penutup
        </motion.p>

        <motion.p
          style={{ fontSize: fsb(10.5), color: `${text}77`, fontFamily: bodyFont, lineHeight: 1.9, fontStyle: 'italic', maxWidth: 260, margin: '0 auto' }}
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
          {closingText}
        </motion.p>

        <motion.p
          style={{ fontSize: fsb(8.5), letterSpacing: '0.25em', textTransform: 'uppercase', color: `${text}65`, fontFamily: bodyFont, marginBottom: 12 }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          Dengan segenap cinta
        </motion.p>

        <CoupleNames data={data} headingFont={headingFont} accent={accent} text={text} />

        <div style={{ marginTop: 28 }}>
          <ParentsBlock data={data} accent={accent} text={text} bodyFont={bodyFont} />
        </div>

        <motion.div style={{ marginTop: 36 }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          <p style={{ fontSize: fsb(9), color: `${text}70`, fontFamily: bodyFont, fontStyle: 'italic', lineHeight: 1.8 }}>
            {thankYouText}
          </p>
        </motion.div>

        <BrandFooter text={text} bodyFont={bodyFont} />
      </motion.div>
    </SectionWrapper>
  )
}

//  ELEGANT: Double border frame with corner dots 

function ElegantView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, closingText, thankYouText, data } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: { opacity: 0, scale: 0.97 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } } }}
        style={{
          position: 'relative', padding: '4px',
          border: `1px solid ${accent}30`,
          maxWidth: 320, width: '100%', margin: '0 auto',
        }}>
        <div style={{ position: 'absolute', inset: -8, border: `1px solid ${accent}25` }} />
        {[{ top: -4, left: -4 }, { top: -4, right: -4 }, { bottom: -4, left: -4 }, { bottom: -4, right: -4 }].map((pos, i) => (
          <div key={i} style={{ position: 'absolute', ...pos, width: 6, height: 6, backgroundColor: `${accent}50` }} />
        ))}

        <motion.div
          className="text-center w-full py-14 px-4"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } } }}>

          <motion.div variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}>
            <Ornament accent={accent} />
          </motion.div>

          <motion.p
            style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginTop: 20, marginBottom: 10 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            Penutup
          </motion.p>

          <motion.p
            style={{ fontSize: fsb(10.5), color: `${text}77`, fontFamily: bodyFont, lineHeight: 1.9, fontStyle: 'italic', maxWidth: 260, margin: '0 auto' }}
            variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
            {closingText}
          </motion.p>

          <CoupleNames data={data} headingFont={headingFont} accent={accent} text={text} />

          <div style={{ marginTop: 28 }}>
            <ParentsBlock data={data} accent={accent} text={text} bodyFont={bodyFont} />
          </div>

          <motion.div style={{ marginTop: 36 }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <p style={{ fontSize: fsb(9), color: `${text}70`, fontFamily: bodyFont, fontStyle: 'italic', lineHeight: 1.8 }}>{thankYouText}</p>
          </motion.div>

          <BrandFooter text={text} bodyFont={bodyFont} />
        </motion.div>
      </motion.div>
    </SectionWrapper>
  )
}

//  CINEMATIC: Full-screen dark overlay with photo background 

function CinematicView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, headingFont, bodyFont, closingText, thankYouText, data } = ctx
  const bg = section.background
  const hasBg = bg?.type === 'image' && bg.url

  return (
    <div style={{
      position: 'relative', width: '100%', minHeight: '100dvh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', background: '#0a0a0a',
    }}>
      {hasBg && (
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url(${bg.url})`,
          backgroundSize: 'cover', backgroundPosition: 'center',
        }} />
      )}
      <div style={{
        position: 'absolute', inset: 0,
        background: hasBg
          ? `linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.65) 50%, rgba(0,0,0,0.85) 100%)`
          : `linear-gradient(135deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.8) 100%)`,
      }} />

      <motion.div
        className="text-center w-full px-8"
        style={{ position: 'relative', zIndex: 2, maxWidth: 320, padding: '60px 0' }}
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}>

        <motion.p
          style={{ fontSize: fsb(9), letterSpacing: '0.35em', textTransform: 'uppercase', color: `${accent}99`, fontFamily: bodyFont, marginBottom: 20 }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          Penutup
        </motion.p>

        <motion.p
          style={{ fontSize: fsb(11), color: 'rgba(255,255,255,0.6)', fontFamily: bodyFont, lineHeight: 2, fontStyle: 'italic', maxWidth: 280, margin: '0 auto' }}
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
          {closingText}
        </motion.p>

        <motion.p
          style={{ fontSize: fsb(8.5), letterSpacing: '0.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', fontFamily: bodyFont, marginBottom: 14 }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          Dengan segenap cinta
        </motion.p>

        <motion.h2
          style={{ fontSize: fsh(28), fontWeight: 400, color: '#fff', fontFamily: headingFont, letterSpacing: '-0.01em', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
          {data.groom_name}
        </motion.h2>
        <motion.div className="flex items-center justify-center gap-3" style={{ margin: '6px 0' }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          <span style={{ fontSize: fsh(16), fontStyle: 'italic', color: `${accent}aa`, fontFamily: headingFont }}>&amp;</span>
        </motion.div>
        <motion.h2
          style={{ fontSize: fsh(28), fontWeight: 400, color: '#fff', fontFamily: headingFont, letterSpacing: '-0.01em', textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
          variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
          {data.bride_name}
        </motion.h2>

        {(data.groom_parents || data.bride_parents) && (
          <motion.div style={{ marginTop: 28 }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            {data.groom_parents && (
              <p style={{ fontSize: fsb(9.5), color: 'rgba(255,255,255,0.5)', fontFamily: bodyFont, lineHeight: 1.8, marginBottom: 4 }}>
                {data.groom_parents}
              </p>
            )}
            {data.bride_parents && (
              <p style={{ fontSize: fsb(9.5), color: 'rgba(255,255,255,0.5)', fontFamily: bodyFont, lineHeight: 1.8 }}>
                {data.bride_parents}
              </p>
            )}
          </motion.div>
        )}

        <motion.div style={{ marginTop: 36 }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          <p style={{ fontSize: fsb(9), color: 'rgba(255,255,255,0.3)', fontFamily: bodyFont, fontStyle: 'italic', lineHeight: 1.8 }}>
            {thankYouText}
          </p>
        </motion.div>

        <motion.p
          style={{ fontSize: fsb(7.5), color: 'rgba(255,255,255,0.1)', fontFamily: bodyFont, letterSpacing: '0.15em', marginTop: 32 }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          iaundang
        </motion.p>
      </motion.div>
    </div>
  )
}

//  MAGAZINE: Left-aligned editorial layout 

function MagazineView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, closingText, thankYouText, data } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="w-full py-14"
        style={{ maxWidth: 300, marginLeft: 'auto', marginRight: 'auto' }}
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

        {/* Left-aligned accent line */}
        <motion.div
          style={{ width: 40, height: 2, background: accent, marginBottom: 24, opacity: 0.6 }}
          variants={{ hidden: { scaleX: 0, originX: 0 }, visible: { scaleX: 1, originX: 0 } }} />

        <motion.p
          style={{ fontSize: fsb(8.5), letterSpacing: '0.35em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginBottom: 16 }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          Penutup
        </motion.p>

        <motion.p
          style={{ fontSize: fsb(11), color: `${text}77`, fontFamily: bodyFont, lineHeight: 2.1, fontStyle: 'italic', maxWidth: 280 }}
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
          {closingText}
        </motion.p>

        {/* Names  large, left-aligned */}
        <motion.div style={{ marginTop: 36 }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          <p style={{ fontSize: fsb(8), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${text}65`, fontFamily: bodyFont, marginBottom: 14 }}>
            Dengan segenap cinta
          </p>

          <motion.h2
            style={{ fontSize: fsh(32), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.02em', lineHeight: 1.15 }}
            variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}>
            {data.groom_name}
          </motion.h2>

          <div style={{ margin: '6px 0' }}>
            <span style={{ fontSize: fsh(16), fontStyle: 'italic', color: `${accent}70`, fontFamily: headingFont }}>&amp;</span>
          </div>

          <motion.h2
            style={{ fontSize: fsh(32), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.02em', lineHeight: 1.15 }}
            variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0 } }}>
            {data.bride_name}
          </motion.h2>
        </motion.div>

        {/* Parents */}
        {(data.groom_parents || data.bride_parents) && (
          <motion.div style={{ marginTop: 28, paddingLeft: 0 }}
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            {data.groom_parents && (
              <p style={{ fontSize: fsb(9.5), color: `${text}70`, fontFamily: bodyFont, lineHeight: 1.8, marginBottom: 4 }}>
                {data.groom_parents}
              </p>
            )}
            {data.bride_parents && (
              <p style={{ fontSize: fsb(9.5), color: `${text}70`, fontFamily: bodyFont, lineHeight: 1.8 }}>
                {data.bride_parents}
              </p>
            )}
          </motion.div>
        )}

        {/* Thank you */}
        <motion.div style={{ marginTop: 36 }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          <p style={{ fontSize: fsb(9), color: `${text}70`, fontFamily: bodyFont, fontStyle: 'italic', lineHeight: 1.8 }}>
            {thankYouText}
          </p>
        </motion.div>

        <BrandFooter text={text} bodyFont={bodyFont} />
      </motion.div>
    </SectionWrapper>
  )
}

//  CARD: Centered card with accent border top 

function CardView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, closingText, thankYouText, data } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <div className="w-full py-14" style={{ maxWidth: 320, margin: '0 auto' }}>
        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
          style={{
            position: 'relative',
            background: `${accent}0a`,
            border: `1px solid ${accent}22`,
            padding: '40px 24px 36px',
            overflow: 'hidden',
          }}>

          {/* Top accent bar */}
          <div style={{
            position: 'absolute', top: 0, left: '20%', right: '20%', height: 3,
            background: `linear-gradient(to right, transparent, ${accent}, transparent)`,
            opacity: 0.5,
          }} />

          <motion.div
            className="text-center"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } } }}>

            <motion.div variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1 } }}>
              <Ornament accent={accent} />
            </motion.div>

            <motion.p
              style={{ fontSize: fsb(9), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}70`, fontFamily: bodyFont, marginTop: 20, marginBottom: 10 }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              Penutup
            </motion.p>

            <motion.p
              style={{ fontSize: fsb(10.5), color: `${text}77`, fontFamily: bodyFont, lineHeight: 1.9, fontStyle: 'italic', maxWidth: 250, margin: '0 auto' }}
              variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
              {closingText}
            </motion.p>

            <motion.p
              style={{ fontSize: fsb(8.5), letterSpacing: '0.25em', textTransform: 'uppercase', color: `${text}65`, fontFamily: bodyFont, marginBottom: 12 }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              Dengan segenap cinta
            </motion.p>

            <CoupleNames data={data} headingFont={headingFont} accent={accent} text={text} />

            {(data.groom_parents || data.bride_parents) && (
              <div style={{ marginTop: 28 }}>
                <ParentsBlock data={data} accent={accent} text={text} bodyFont={bodyFont} />
              </div>
            )}

            <motion.div style={{ marginTop: 32 }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
              <p style={{ fontSize: fsb(9), color: `${text}70`, fontFamily: bodyFont, fontStyle: 'italic', lineHeight: 1.8 }}>
                {thankYouText}
              </p>
            </motion.div>
          </motion.div>

          {/* Bottom accent bar */}
          <div style={{
            position: 'absolute', bottom: 0, left: '20%', right: '20%', height: 2,
            background: `linear-gradient(to right, transparent, ${accent}30, transparent)`,
          }} />
        </motion.div>

        <div className="text-center">
          <BrandFooter text={text} bodyFont={bodyFont} />
        </div>
      </div>
    </SectionWrapper>
  )
}

//  POETIC: Large quote-style typography 

function PoeticView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, closingText, thankYouText, data } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="w-full py-16 text-center"
        style={{ maxWidth: 300, margin: '0 auto' }}
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}>

        {/* Large opening quote mark */}
        <motion.div
          style={{ fontSize: fsh(64), fontFamily: headingFont, color: `${accent}15`, lineHeight: 0.6, marginBottom: 8 }}
          variants={{ hidden: { opacity: 0, scale: 0.7 }, visible: { opacity: 1, scale: 1 } }}>
          &ldquo;
        </motion.div>

        {/* Closing text as large poetic quote */}
        <motion.p
          style={{
            fontSize: fsh(15), color: `${text}70`, fontFamily: headingFont,
            lineHeight: 2.2, fontWeight: 400, letterSpacing: '0.02em',
            maxWidth: 280, margin: '0 auto',
          }}
          variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
          {closingText}
        </motion.p>

        {/* Closing quote mark */}
        <motion.div
          style={{ fontSize: fsh(64), fontFamily: headingFont, color: `${accent}15`, lineHeight: 0.5, marginTop: 12, marginBottom: 4 }}
          variants={{ hidden: { opacity: 0, scale: 0.7 }, visible: { opacity: 1, scale: 1 } }}>
          &rdquo;
        </motion.div>

        {/* Accent dot divider */}
        <motion.div style={{ margin: '24px auto' }}
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          <SectionOrnament accent={accent} placement="footer" />
        </motion.div>

        {/* Couple names */}
        <CoupleNames data={data} headingFont={headingFont} accent={accent} text={text} size={22} />

        <div style={{ marginTop: 24 }}>
          <ParentsBlock data={data} accent={accent} text={text} bodyFont={bodyFont} />
        </div>

        <motion.div style={{ marginTop: 32 }} variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
          <p style={{ fontSize: fsb(9), color: `${text}70`, fontFamily: bodyFont, fontStyle: 'italic', lineHeight: 1.8 }}>
            {thankYouText}
          </p>
        </motion.div>

        <BrandFooter text={text} bodyFont={bodyFont} />
      </motion.div>
    </SectionWrapper>
  )
}

//  MAIN 

export default function ClosingSection({ section, data, meta }: Props) {
  const { accent, text } = meta.color_scheme
  const font = resolveFont(meta, section)
  const variant = section.style_variant ?? 'default'

  const ctx: StyleCtx = {
    accent, text,
    headingFont: `'${font.heading}', serif`,
    bodyFont: `'${font.body}', serif`,
    closingText: data.closing_text || 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.',
    thankYouText: data.thank_you_message || 'Atas kehadiran dan doa restu Anda, kami ucapkan terima kasih.',
    data,
  }

  switch (variant) {
    case 'elegant':   return <ElegantView   section={section} ctx={ctx} />
    case 'cinematic': return <CinematicView section={section} ctx={ctx} />
    case 'magazine':  return <MagazineView  section={section} ctx={ctx} />
    case 'card':      return <CardView      section={section} ctx={ctx} />
    case 'poetic':    return <PoeticView    section={section} ctx={ctx} />
    default:          return <DefaultView   section={section} ctx={ctx} />
  }
}
