'use client'

import { motion } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import SectionWrapper, { resolveFont, fsh, fsb } from '../SectionWrapper'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
}

// ─── Photo frame ──────────────────────────────────────────────────────────────

function PhotoFrame({ photoUrl, accent, name, size, side }: {
  photoUrl?: string; accent: string; name: string; size: number; side: 'left' | 'right'
}) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {/* Outer decorative ring */}
      <div style={{
        position: 'absolute', inset: -3, borderRadius: '50%',
        background: `conic-gradient(${accent}cc 0deg, ${accent}33 90deg, ${accent}cc 180deg, ${accent}33 270deg, ${accent}cc 360deg)`,
      }} />
      {/* Inner white gap */}
      <div style={{ position: 'absolute', inset: -1, borderRadius: '50%', background: 'white', opacity: 0.15 }} />
      {/* Photo / placeholder */}
      <div style={{
        position: 'absolute', inset: 3, borderRadius: '50%',
        overflow: 'hidden', background: `${accent}18`,
        boxShadow: `0 4px 20px ${accent}44`,
      }}>
        {photoUrl ? (
          <img src={photoUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.35, color: `${accent}55`,
          }}>
            {side === 'left' ? '🤵' : '👰'}
          </div>
        )}
      </div>
      {/* Bottom accent dot */}
      <div style={{
        position: 'absolute', bottom: -4, left: '50%', transform: 'translateX(-50%)',
        width: 10, height: 10, borderRadius: '50%',
        background: `linear-gradient(135deg, ${accent}, ${accent}88)`,
        boxShadow: `0 2px 6px ${accent}66`,
      }} />
    </div>
  )
}

// ─── "&" / "dan" connector — ornate centerpiece ───────────────────────────────

function AndConnector({ accent, font, vertical = false, large = false }: {
  accent: string; font: { heading: string }; vertical?: boolean; large?: boolean
}) {
  const sz = large ? 36 : 28

  if (vertical) {
    // Vertical connector: line — & — line (stacked)
    return (
      <motion.div
        variants={{ hidden: { opacity: 0, scaleY: 0 }, visible: { opacity: 1, scaleY: 1, transition: { delay: 0.4, duration: 0.6 } } }}
        style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
          padding: '8px 0',
        }}>
        <div style={{ width: 1, height: 36, background: `linear-gradient(to bottom, transparent, ${accent}55)` }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ height: 1, width: 28, background: `${accent}44` }} />
          <span style={{ fontSize: sz, fontStyle: 'italic', color: accent, fontFamily: `'${font.heading}', serif`, lineHeight: 1 }}>&amp;</span>
          <div style={{ height: 1, width: 28, background: `${accent}44` }} />
        </div>
        <div style={{ width: 1, height: 36, background: `linear-gradient(to top, transparent, ${accent}55)` }} />
      </motion.div>
    )
  }

  // Horizontal connector: sits between two columns
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, scale: 0.7 }, visible: { opacity: 1, scale: 1, transition: { delay: 0.35, duration: 0.5 } } }}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
        flexShrink: 0, paddingTop: 10,
      }}>
      <div style={{ width: 1, height: 32, background: `linear-gradient(to bottom, transparent, ${accent}44)` }} />
      {/* Ornate diamond */}
      <div style={{
        width: 6, height: 6, borderRadius: 1,
        background: accent, transform: 'rotate(45deg)',
        boxShadow: `0 0 8px ${accent}77`,
      }} />
      <span style={{
        fontSize: sz, fontStyle: 'italic', color: accent,
        fontFamily: `'${font.heading}', serif`, lineHeight: 1,
        textShadow: `0 2px 12px ${accent}44`,
      }}>&amp;</span>
      <div style={{
        width: 6, height: 6, borderRadius: 1,
        background: accent, transform: 'rotate(45deg)',
        boxShadow: `0 0 8px ${accent}77`,
      }} />
      <div style={{ width: 1, height: 32, background: `linear-gradient(to top, transparent, ${accent}44)` }} />
    </motion.div>
  )
}

// ─── Variant: Default — portrait frames side by side, "&" badge center ────────

function ProfilesDefault({ data, meta, accent, text }: {
  data: NewInvitationData; meta: TemplateMeta; accent: string; text: string
}) {
  const font    = meta.font
  const primary = meta.color_scheme.primary
  const people  = [
    { name: data.groom_name, parents: data.groom_parents, photo: data.groom_photo_url, bio: data.groom_bio, side: 'left'  as const, role: 'Pengantin Pria'   },
    { name: data.bride_name, parents: data.bride_parents, photo: data.bride_photo_url, bio: data.bride_bio, side: 'right' as const, role: 'Pengantin Wanita' },
  ]

  return (
    <div style={{ width: '100%', maxWidth: 380 }}>

      {/* ── Two portrait frames with "&" badge ── */}
      <div style={{ position: 'relative', display: 'flex', gap: 10 }}>
        {people.map((p, i) => (
          <motion.div key={p.side}
            variants={{ hidden: { opacity: 0, y: 20, scale: 0.94 }, visible: { opacity: 1, y: 0, scale: 1, transition: { delay: 0.15 + i * 0.18, duration: 0.65, ease: 'easeOut' } } }}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {/* Portrait photo frame */}
            <div style={{
              position: 'relative', width: '100%', aspectRatio: '3 / 4',
              borderRadius: 20, overflow: 'hidden',
              border: `1.5px solid ${accent}30`,
              boxShadow: `0 8px 28px ${accent}22`,
            }}>
              {p.photo ? (
                <img src={p.photo} alt={p.name}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{
                  position: 'absolute', inset: 0,
                  background: `linear-gradient(160deg, ${accent}22, ${primary})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 56, opacity: 0.3,
                }}>
                  {p.side === 'left' ? '🤵' : '👰'}
                </div>
              )}
              {/* Bottom gradient overlay */}
              <div style={{
                position: 'absolute', inset: '45% 0 0 0',
                background: `linear-gradient(to bottom, transparent, ${primary}dd)`,
              }} />
              {/* Name on photo bottom */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 12px 14px', textAlign: 'center' }}>
                <p style={{
                  fontSize: 8, letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: `${accent}cc`, fontFamily: `'${font.body}', serif`, marginBottom: 3,
                }}>
                  {p.role}
                </p>
                <h3 style={{
                  fontSize: fsh(15), fontWeight: 700, color: '#fff',
                  fontFamily: `'${font.heading}', serif`, lineHeight: 1.2,
                  textShadow: `0 1px 8px ${primary}88`,
                }}>
                  {p.name}
                </h3>
              </div>
            </div>

            {/* Parents below frame */}
            {p.parents && (
              <div style={{ marginTop: 10, textAlign: 'center', padding: '0 4px' }}>
                <p style={{
                  fontSize: fsb(9), lineHeight: 1.6, color: `${text}60`,
                  fontFamily: `'${font.body}', serif`,
                }}>
                  {p.side === 'left' ? 'Putra' : 'Putri'} dari<br />
                  <span style={{ color: `${accent}bb`, fontWeight: 500, fontSize: fsb(9.5) }}>{p.parents}</span>
                </p>
              </div>
            )}
          </motion.div>
        ))}

        {/* "&" badge — absolute center between the two frames */}
        <motion.div
          variants={{ hidden: { opacity: 0, scale: 0.5 }, visible: { opacity: 1, scale: 1, transition: { delay: 0.4, duration: 0.45, type: 'spring', stiffness: 260, damping: 20 } } }}
          style={{
            position: 'absolute', left: '50%', top: '38%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            width: 44, height: 44,
            borderRadius: '50%',
            background: primary,
            border: `2px solid ${accent}88`,
            boxShadow: `0 4px 16px ${accent}44, 0 0 0 4px ${primary}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{
            fontSize: fsh(20), fontStyle: 'italic', color: accent,
            fontFamily: `'${font.heading}', serif`, lineHeight: 1,
          }}>
            &amp;
          </span>
        </motion.div>
      </div>

    </div>
  )
}

// ─── Variant: Card — dua panel full-width, foto penuh, teks overlay ──────────

function ProfilesCard({ data, meta, accent, text }: {
  data: NewInvitationData; meta: TemplateMeta; accent: string; text: string
}) {
  const font   = meta.font
  const primary = meta.color_scheme.primary
  const panels = [
    { name: data.groom_name, parents: data.groom_parents, photo: data.groom_photo_url, bio: data.groom_bio, side: 'left'  as const, role: 'Pengantin Pria' },
    { name: data.bride_name, parents: data.bride_parents, photo: data.bride_photo_url, bio: data.bride_bio, side: 'right' as const, role: 'Pengantin Wanita' },
  ]

  return (
    <div style={{ width: '100%' }}>
      {panels.map((p, i) => (
        <div key={p.side}>

          {/* ── Full-width photo panel ── */}
          <motion.div
            variants={{
              hidden: { opacity: 0, y: 28 },
              visible: { opacity: 1, y: 0, transition: { delay: 0.12 + i * 0.2, duration: 0.7, ease: 'easeOut' } },
            }}
            style={{ position: 'relative', width: '100%', borderRadius: 24, overflow: 'hidden', aspectRatio: '3 / 4' }}
          >
            {/* Photo / placeholder background */}
            {p.photo ? (
              <img
                src={p.photo} alt={p.name}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                position: 'absolute', inset: 0,
                background: `linear-gradient(160deg, ${accent}28 0%, ${primary} 100%)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 80, opacity: 0.25,
              }}>
                {p.side === 'left' ? '🤵' : '👰'}
              </div>
            )}

            {/* Multi-layer cinematic overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(to bottom,
                transparent 0%,
                transparent 30%,
                ${primary}88 60%,
                ${primary}f0 80%,
                ${primary} 100%)`,
            }} />

            {/* Side vignette */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `radial-gradient(ellipse at 50% 110%, transparent 45%, ${primary}66 100%)`,
            }} />

            {/* Top accent stripe */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 3,
              background: `linear-gradient(to right, transparent, ${accent}88, transparent)`,
            }} />

            {/* Text content — bottom */}
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 24px 28px' }}>
              {/* Role label */}
              <p style={{
                fontSize: 9, letterSpacing: '0.28em', textTransform: 'uppercase',
                color: `${accent}cc`, fontFamily: `'${font.body}', serif`,
                marginBottom: 8,
              }}>
                {p.role}
              </p>

              {/* Name */}
              <h2 style={{
                fontSize: fsh(26), fontWeight: 700, color: '#ffffff',
                fontFamily: `'${font.heading}', serif`, lineHeight: 1.15,
                marginBottom: 8,
                textShadow: `0 2px 16px ${primary}88`,
              }}>
                {p.name}
              </h2>

              {/* Accent divider */}
              <div style={{
                height: 1.5, width: 40,
                background: `linear-gradient(to right, ${accent}, ${accent}44)`,
                marginBottom: 10,
              }} />

              {/* Parents */}
              {p.parents && (
                <p style={{
                  fontSize: fsb(10.5), lineHeight: 1.65, color: 'rgba(255,255,255,0.72)',
                  fontFamily: `'${font.body}', serif`,
                }}>
                  {p.side === 'left' ? 'Putra' : 'Putri'} dari{' '}
                  <span style={{ color: `${accent}ee`, fontWeight: 500 }}>{p.parents}</span>
                </p>
              )}

              {/* Bio */}
              {p.bio && (
                <p style={{
                  fontSize: fsb(10), lineHeight: 1.7, fontStyle: 'italic',
                  color: 'rgba(255,255,255,0.5)', marginTop: 6,
                  fontFamily: `'${font.body}', serif`,
                }}>
                  {p.bio}
                </p>
              )}
            </div>
          </motion.div>

          {/* ── "&" connector antara dua panel ── */}
          {i === 0 && (
            <motion.div
              variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { delay: 0.38, duration: 0.45 } } }}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, padding: '14px 0' }}
            >
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, transparent, ${accent}44)` }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: 1, background: accent, transform: 'rotate(45deg)', opacity: 0.6 }} />
                <span style={{
                  fontSize: fsh(30), fontStyle: 'italic', color: accent,
                  fontFamily: `'${font.heading}', serif`, lineHeight: 1,
                  textShadow: `0 2px 10px ${accent}44`,
                }}>
                  &amp;
                </span>
                <div style={{ width: 5, height: 5, borderRadius: 1, background: accent, transform: 'rotate(45deg)', opacity: 0.6 }} />
              </div>
              <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, transparent, ${accent}44)` }} />
            </motion.div>
          )}

        </div>
      ))}
    </div>
  )
}

// ─── Variant: Vertical — stacked, large photos ────────────────────────────────

function ProfilesVertical({ data, meta, accent, text }: {
  data: NewInvitationData; meta: TemplateMeta; accent: string; text: string
}) {
  const font = meta.font
  const people = [
    { name: data.groom_name, parents: data.groom_parents, photo: data.groom_photo_url, bio: data.groom_bio, side: 'left' as const },
    { name: data.bride_name, parents: data.bride_parents, photo: data.bride_photo_url, bio: data.bride_bio, side: 'right' as const },
  ]

  return (
    <div style={{ width: '100%', maxWidth: 280, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {people.map((p, i) => (
        <div key={p.side} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <motion.div
            variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: { delay: 0.15 + i * 0.22, duration: 0.75, ease: 'easeOut' } } }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', width: '100%' }}
          >
            <PhotoFrame photoUrl={p.photo} accent={accent} name={p.name} size={148} side={p.side} />

            <div style={{ marginTop: 20 }}>
              <h3 style={{
                fontSize: fsh(22), fontWeight: 700, color: text,
                fontFamily: `'${font.heading}', serif`, lineHeight: 1.25,
                marginBottom: 6,
              }}>
                {p.name}
              </h3>
              {/* Accent line */}
              <div style={{
                width: 32, height: 1.5,
                background: `linear-gradient(to right, transparent, ${accent}, transparent)`,
                margin: '0 auto 10px',
              }} />
              {p.parents && (
                <p style={{
                  fontSize: fsb(11), lineHeight: 1.7, color: `${text}66`,
                  fontFamily: `'${font.body}', serif`,
                }}>
                  Putra/i dari<br />
                  <span style={{ color: `${accent}cc`, fontWeight: 500 }}>{p.parents}</span>
                </p>
              )}
              {p.bio && (
                <p style={{
                  fontSize: fsb(10.5), lineHeight: 1.7, fontStyle: 'italic',
                  color: `${text}44`, marginTop: 8, fontFamily: `'${font.body}', serif`,
                }}>
                  {p.bio}
                </p>
              )}
            </div>
          </motion.div>

          {/* "&" between the two profiles */}
          {i === 0 && <AndConnector accent={accent} font={font} vertical large />}
        </div>
      ))}
    </div>
  )
}

// ─── Main ProfilesSection ──────────────────────────────────────────────────────

export default function ProfilesSection({ section, data, meta }: Props) {
  const { accent, text } = meta.color_scheme
  const variant = section.style_variant ?? 'default'
  const font = resolveFont(meta, section)
  const metaWithFont: TemplateMeta = { ...meta, font: { heading: font.heading, body: font.body } }

  return (
    <SectionWrapper section={section} className={variant === 'card' ? '' : 'px-6'}>
      <div className={`w-full py-10 ${variant === 'card' ? 'max-w-sm mx-auto px-5' : 'max-w-sm mx-auto'}`}>

        {/* Header */}
        <div className="text-center mb-10">
          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            style={{
              fontSize: fsb(10), letterSpacing: '0.36em', textTransform: 'uppercase',
              color: `${accent}80`, fontFamily: `'${font.body}', serif`, marginBottom: 14,
            }}>
            Mempelai
          </motion.p>
          <motion.div
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.1 } } }}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
            <div style={{ height: 1, flex: 1, maxWidth: 40, background: `linear-gradient(to right, transparent, ${accent}55)` }} />
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 12px', borderRadius: 20,
              border: `1px solid ${accent}22`,
              background: `${accent}08`,
            }}>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent, opacity: 0.5 }} />
              <span style={{ fontSize: fsh(11), color: `${accent}66`, fontFamily: `'${font.heading}', serif` }}>✦</span>
              <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent, opacity: 0.5 }} />
            </div>
            <div style={{ height: 1, flex: 1, maxWidth: 40, background: `linear-gradient(to left, transparent, ${accent}55)` }} />
          </motion.div>
        </div>

        <motion.div
          initial="hidden" whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

          {variant === 'default'  && <ProfilesDefault  data={data} meta={metaWithFont} accent={accent} text={text} />}
          {variant === 'card'     && <ProfilesCard      data={data} meta={metaWithFont} accent={accent} text={text} />}
          {variant === 'vertical' && <ProfilesVertical  data={data} meta={metaWithFont} accent={accent} text={text} />}

        </motion.div>
      </div>
    </SectionWrapper>
  )
}
