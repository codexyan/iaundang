'use client'

import { motion } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import SectionWrapper, { resolveFont, fsh, fsb } from '../SectionWrapper'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
}

type Person = {
  name: string; parents?: string; photo?: string; bio?: string
  side: 'groom' | 'bride'; role: string
}

type StyleCtx = {
  accent: string; text: string; primary: string
  headingFont: string; bodyFont: string
  groom: Person; bride: Person
}

function Ornament({ accent }: { accent: string }) {
  return (
    <div className="flex items-center justify-center gap-3">
      <div style={{ width: 5, height: 5, borderRadius: '50%', border: `0.5px solid ${accent}40` }} />
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
        Mempelai
      </motion.p>
      <motion.h2
        style={{ fontSize: fsh(20), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em', lineHeight: 1.3 }}
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0 } }}>
        Pasangan Pengantin
      </motion.h2>
    </div>
  )
}

function PhotoPlaceholder({ accent, side }: { accent: string; side: 'groom' | 'bride' }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: `linear-gradient(145deg, ${accent}18, ${accent}0c)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: `1px solid ${accent}20`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 18, color: `${accent}30`,
      }}>
        {side === 'groom' ? '♂' : '♀'}
      </div>
    </div>
  )
}

function AndDivider({ accent, headingFont, style: s }: {
  accent: string; headingFont: string; style?: 'vertical' | 'horizontal'
}) {
  if (s === 'horizontal') {
    return (
      <motion.div
        className="flex items-center justify-center gap-3"
        style={{ margin: '4px 0' }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        <span style={{ fontSize: fsh(14), fontStyle: 'italic', color: `${accent}80`, fontFamily: headingFont }}>&amp;</span>
      </motion.div>
    )
  }
  return (
    <motion.div
      className="flex flex-col items-center"
      style={{ padding: '16px 0' }}
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
      <div style={{ margin: '8px 0' }}>
        <span style={{ fontSize: fsh(16), fontStyle: 'italic', color: `${accent}70`, fontFamily: headingFont }}>&amp;</span>
      </div>
    </motion.div>
  )
}

//  DEFAULT: Side-by-side editorial portraits 

function DefaultView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, groom, bride } = ctx
  const people = [groom, bride]

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

        <EditorialHeader accent={accent} text={text} headingFont={headingFont} bodyFont={bodyFont} />

        {/* Photos row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {people.map((p, i) => (
            <motion.div key={p.side} style={{ flex: 1 }}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: i * 0.12 } } }}>
              <div style={{ width: '100%', aspectRatio: '3 / 4', overflow: 'hidden' }}>
                {p.photo ? (
                  <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <PhotoPlaceholder accent={accent} side={p.side} />
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* & divider between names */}
        <AndDivider accent={accent} headingFont={headingFont} style="horizontal" />

        {/* Names & info stacked */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          {people.map((p, i) => (
            <motion.div key={p.side} style={{ flex: 1 }}
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.2 + i * 0.1 } } }}>
              <div className="text-center">
                <p style={{ fontSize: fsb(8), letterSpacing: '0.25em', textTransform: 'uppercase', color: `${accent}60`, fontFamily: bodyFont, marginBottom: 6 }}>
                  {p.role}
                </p>
                <h3 style={{ fontSize: fsh(16), fontWeight: 400, color: text, fontFamily: headingFont, lineHeight: 1.25, marginBottom: 8 }}>
                  {p.name}
                </h3>

                {p.parents && (
                  <p style={{ fontSize: fsb(8.5), color: `${text}75`, fontFamily: bodyFont, lineHeight: 1.7 }}>
                    {p.side === 'groom' ? 'Putra' : 'Putri'} dari<br />
                    <span style={{ color: `${text}70` }}>{p.parents}</span>
                  </p>
                )}
                {p.bio && (
                  <p style={{ fontSize: fsb(8.5), color: `${text}70`, fontFamily: bodyFont, lineHeight: 1.7, fontStyle: 'italic', marginTop: 8 }}>
                    {p.bio}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2" style={{ marginTop: 24 }}>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: `${accent}25` }} />
        </div>
      </motion.div>
    </SectionWrapper>
  )
}

//  CARD: Full-width cinematic panels stacked 

function CardView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, primary, headingFont, bodyFont, groom, bride } = ctx
  const people = [groom, bride]

  return (
    <SectionWrapper section={section}>
      <div className="w-full py-14">
        <div className="px-6 max-w-[300px] mx-auto">
          <EditorialHeader accent={accent} text={text} headingFont={headingFont} bodyFont={bodyFont} />
        </div>

        <motion.div
          initial="hidden" whileInView="visible" viewport={{ once: true }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
          style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

          {people.map((p, i) => (
            <div key={p.side}>
              <motion.div
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
                style={{ position: 'relative', width: '100%', aspectRatio: '3 / 4', overflow: 'hidden' }}>

                {p.photo ? (
                  <img src={p.photo} alt={p.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ position: 'absolute', inset: 0 }}>
                    <PhotoPlaceholder accent={accent} side={p.side} />
                  </div>
                )}

                {/* Gradient overlay */}
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7) 100%)',
                }} />

                {/* Content overlay */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 28px' }}>
                  <p style={{
                    fontSize: fsb(8), letterSpacing: '0.3em', textTransform: 'uppercase',
                    color: `${accent}bb`, fontFamily: bodyFont, marginBottom: 8,
                  }}>
                    {p.role}
                  </p>
                  <h2 style={{
                    fontSize: fsh(24), fontWeight: 400, color: '#fff', fontFamily: headingFont,
                    textShadow: '0 2px 16px rgba(0,0,0,0.5)', marginBottom: 8, letterSpacing: '-0.01em',
                  }}>
                    {p.name}
                  </h2>

                  {p.parents && (
                    <p style={{ fontSize: fsb(9.5), color: 'rgba(255,255,255,0.6)', fontFamily: bodyFont, lineHeight: 1.7 }}>
                      {p.side === 'groom' ? 'Putra' : 'Putri'} dari {p.parents}
                    </p>
                  )}
                  {p.bio && (
                    <p style={{ fontSize: fsb(9), color: 'rgba(255,255,255,0.4)', fontFamily: bodyFont, lineHeight: 1.7, fontStyle: 'italic', marginTop: 6 }}>
                      {p.bio}
                    </p>
                  )}
                </div>
              </motion.div>

              {/* Divider between */}
              {i === 0 && (
                <div className="px-6 max-w-[300px] mx-auto">
                  <AndDivider accent={accent} headingFont={headingFont} style="vertical" />
                </div>
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </SectionWrapper>
  )
}

//  VERTICAL: Centered stacked with circle frames 

function VerticalView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, groom, bride } = ctx
  const people = [groom, bride]

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[280px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

        <EditorialHeader accent={accent} text={text} headingFont={headingFont} bodyFont={bodyFont} />

        {people.map((p, i) => (
          <div key={p.side}>
            <motion.div
              className="flex flex-col items-center text-center"
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>

              {/* Circle photo */}
              <div style={{
                width: 140, height: 140, borderRadius: '50%', overflow: 'hidden',
                border: `1px solid ${accent}25`, marginBottom: 16,
                boxShadow: `0 0 0 6px ${accent}12`,
              }}>
                {p.photo ? (
                  <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <PhotoPlaceholder accent={accent} side={p.side} />
                )}
              </div>

              <p style={{ fontSize: fsb(8), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}60`, fontFamily: bodyFont, marginBottom: 8 }}>
                {p.role}
              </p>
              <h3 style={{ fontSize: fsh(22), fontWeight: 400, color: text, fontFamily: headingFont, lineHeight: 1.25, marginBottom: 10, letterSpacing: '-0.01em' }}>
                {p.name}
              </h3>

              {p.parents && (
                <p style={{ fontSize: fsb(9), color: `${text}75`, fontFamily: bodyFont, lineHeight: 1.8 }}>
                  {p.side === 'groom' ? 'Putra' : 'Putri'} dari<br />
                  <span style={{ color: `${text}70` }}>{p.parents}</span>
                </p>
              )}
              {p.bio && (
                <p style={{ fontSize: fsb(9), color: `${text}70`, fontFamily: bodyFont, lineHeight: 1.8, fontStyle: 'italic', marginTop: 8, maxWidth: 220 }}>
                  {p.bio}
                </p>
              )}
            </motion.div>

            {i === 0 && <AndDivider accent={accent} headingFont={headingFont} style="vertical" />}
          </div>
        ))}

        <div className="flex items-center justify-center gap-2" style={{ marginTop: 20 }}>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: `${accent}25` }} />
        </div>
      </motion.div>
    </SectionWrapper>
  )
}

//  MAGAZINE: Alternating left-right editorial layout 

function MagazineView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, groom, bride } = ctx
  const people = [groom, bride]

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

        <EditorialHeader accent={accent} text={text} headingFont={headingFont} bodyFont={bodyFont} />

        {people.map((p, i) => {
          const isRight = i % 2 === 1
          return (
            <div key={p.side}>
              <motion.div
                variants={{ hidden: { opacity: 0, x: isRight ? 12 : -12 }, visible: { opacity: 1, x: 0 } }}
                style={{
                  display: 'flex', gap: 14,
                  flexDirection: isRight ? 'row-reverse' : 'row',
                  alignItems: 'flex-start',
                }}>

                {/* Photo */}
                <div style={{
                  width: '45%', flexShrink: 0, aspectRatio: '3 / 4', overflow: 'hidden',
                }}>
                  {p.photo ? (
                    <img src={p.photo} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                  ) : (
                    <PhotoPlaceholder accent={accent} side={p.side} />
                  )}
                </div>

                {/* Text */}
                <div style={{ flex: 1, paddingTop: 8, textAlign: isRight ? 'right' : 'left' }}>
                  <p style={{ fontSize: fsb(7.5), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}60`, fontFamily: bodyFont, marginBottom: 6 }}>
                    {p.role}
                  </p>
                  <h3 style={{ fontSize: fsh(18), fontWeight: 400, color: text, fontFamily: headingFont, lineHeight: 1.25, marginBottom: 8, letterSpacing: '-0.01em' }}>
                    {p.name}
                  </h3>
                  {p.parents && (
                    <p style={{ fontSize: fsb(8.5), color: `${text}75`, fontFamily: bodyFont, lineHeight: 1.8 }}>
                      {p.side === 'groom' ? 'Putra' : 'Putri'} dari<br />
                      <span style={{ color: `${text}70` }}>{p.parents}</span>
                    </p>
                  )}
                  {p.bio && (
                    <p style={{ fontSize: fsb(8), color: `${text}70`, fontFamily: bodyFont, lineHeight: 1.8, fontStyle: 'italic', marginTop: 8 }}>
                      {p.bio}
                    </p>
                  )}
                </div>
              </motion.div>

              {i === 0 && <AndDivider accent={accent} headingFont={headingFont} style="vertical" />}
            </div>
          )
        })}

        <div className="flex items-center justify-center gap-2" style={{ marginTop: 20 }}>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: `${accent}25` }} />
        </div>
      </motion.div>
    </SectionWrapper>
  )
}

//  OVERLAP: Overlapping photos with centered names 

function OverlapView({ section, ctx }: { section: SectionConfig; ctx: StyleCtx }) {
  const { accent, text, headingFont, bodyFont, groom, bride } = ctx

  return (
    <SectionWrapper section={section} className="px-6">
      <motion.div
        className="max-w-[300px] mx-auto w-full py-14"
        initial="hidden" whileInView="visible" viewport={{ once: true }}
        variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}>

        <EditorialHeader accent={accent} text={text} headingFont={headingFont} bodyFont={bodyFont} />

        {/* Overlapping photos */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          style={{ position: 'relative', height: 320, marginBottom: 28 }}>

          {/* Groom   left, slightly back */}
          <div style={{
            position: 'absolute', top: 0, left: 0,
            width: '58%', aspectRatio: '3 / 4', overflow: 'hidden',
            zIndex: 1, boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
          }}>
            {groom.photo ? (
              <img src={groom.photo} alt={groom.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <PhotoPlaceholder accent={accent} side="groom" />
            )}
          </div>

          {/* Bride   right, overlapping */}
          <div style={{
            position: 'absolute', top: 40, right: 0,
            width: '58%', aspectRatio: '3 / 4', overflow: 'hidden',
            zIndex: 2, boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
            border: `2px solid ${accent}25`,
          }}>
            {bride.photo ? (
              <img src={bride.photo} alt={bride.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            ) : (
              <PhotoPlaceholder accent={accent} side="bride" />
            )}
          </div>
        </motion.div>

        {/* Names centered below */}
        <div className="text-center">
          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <p style={{ fontSize: fsb(8), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}60`, fontFamily: bodyFont, marginBottom: 8 }}>
              {groom.role}
            </p>
            <h3 style={{ fontSize: fsh(22), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em' }}>
              {groom.name}
            </h3>
            {groom.parents && (
              <p style={{ fontSize: fsb(8.5), color: `${text}75`, fontFamily: bodyFont, lineHeight: 1.7, marginTop: 4 }}>
                Putra dari {groom.parents}
              </p>
            )}
          </motion.div>

          <AndDivider accent={accent} headingFont={headingFont} style="horizontal" />

          <motion.div variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
            <p style={{ fontSize: fsb(8), letterSpacing: '0.3em', textTransform: 'uppercase', color: `${accent}60`, fontFamily: bodyFont, marginBottom: 8, marginTop: 4 }}>
              {bride.role}
            </p>
            <h3 style={{ fontSize: fsh(22), fontWeight: 400, color: text, fontFamily: headingFont, letterSpacing: '-0.01em' }}>
              {bride.name}
            </h3>
            {bride.parents && (
              <p style={{ fontSize: fsb(8.5), color: `${text}75`, fontFamily: bodyFont, lineHeight: 1.7, marginTop: 4 }}>
                Putri dari {bride.parents}
              </p>
            )}
          </motion.div>
        </div>

        <div className="flex items-center justify-center gap-2" style={{ marginTop: 24 }}>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: `${accent}25` }} />
        </div>
      </motion.div>
    </SectionWrapper>
  )
}

//  MAIN 

export default function ProfilesSection({ section, data, meta }: Props) {
  const { accent, text, primary } = meta.color_scheme
  const font = resolveFont(meta, section)
  const variant = section.style_variant ?? 'default'

  const ctx: StyleCtx = {
    accent, text, primary,
    headingFont: `'${font.heading}', serif`,
    bodyFont: `'${font.body}', serif`,
    groom: {
      name: data.groom_name, parents: data.groom_parents,
      photo: data.groom_photo_url, bio: data.groom_bio,
      side: 'groom', role: 'Pengantin Pria',
    },
    bride: {
      name: data.bride_name, parents: data.bride_parents,
      photo: data.bride_photo_url, bio: data.bride_bio,
      side: 'bride', role: 'Pengantin Wanita',
    },
  }

  switch (variant) {
    case 'card':     return <CardView     section={section} ctx={ctx} />
    case 'vertical': return <VerticalView section={section} ctx={ctx} />
    case 'magazine': return <MagazineView section={section} ctx={ctx} />
    case 'overlap':  return <OverlapView  section={section} ctx={ctx} />
    default:         return <DefaultView  section={section} ctx={ctx} />
  }
}
