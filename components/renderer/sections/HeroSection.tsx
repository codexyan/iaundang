'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import SectionWrapper, { resolveFont } from '../SectionWrapper'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
}

// ─── Arabic font loader ────────────────────────────────────────────────────
function useArabicFont() {
  useEffect(() => {
    const id = 'arabic-font-amiri'
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&display=swap'
    document.head.appendChild(link)
  }, [])
}

// ─── Bismillah component ───────────────────────────────────────────────────
function Bismillah({ section, font, accent, delay }: {
  section: SectionConfig
  font: ReturnType<typeof resolveFont>
  accent: string
  delay: number
}) {
  useArabicFont()

  const style = section.hero_bismillah ?? 'text'
  if (style === 'none') return null

  const labelSz = section.hero_label_size ?? 9
  const dur = section.hero_anim_duration ?? 0.7

  if (style === 'arabic') {
    return (
      <motion.div
        variants={{ hidden: { opacity: 0, y: -6 }, visible: { opacity: 1, y: 0, transition: { delay, duration: dur } } }}
        style={{ textAlign: 'center', marginBottom: 18 }}
      >
        <p style={{
          fontFamily: "'Amiri', serif",
          fontSize: (section.hero_label_size ?? 20),
          color: `${accent}cc`,
          lineHeight: 1.6,
          direction: 'rtl',
          letterSpacing: 0,
        }}>
          بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
        </p>
        <p style={{
          fontSize: labelSz,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: `${accent}66`,
          fontFamily: `'${font.body}', serif`,
          marginTop: 4,
        }}>
          Bismillahirrahmanirrahim
        </p>
      </motion.div>
    )
  }

  const txt = section.hero_bismillah_custom || 'Bismillahirrahmanirrahim'
  return (
    <motion.p
      variants={{ hidden: { opacity: 0, y: -6 }, visible: { opacity: 1, y: 0, transition: { delay, duration: dur } } }}
      style={{
        fontSize: labelSz,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: `${accent}bb`,
        fontFamily: `'${font.body}', serif`,
        marginBottom: 20,
      }}
    >
      {txt}
    </motion.p>
  )
}

// ─── Divider component ─────────────────────────────────────────────────────
function Divider({ accent, delay, dur }: { accent: string; delay: number; dur: number }) {
  return (
    <motion.div
      variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { delay, duration: dur } } }}
      style={{ height: 1, width: 60, backgroundColor: `${accent}77`, margin: '0 auto 20px' }}
    />
  )
}

// ─── Variant: Default (centered, foto/video background) ───────────────────
function HeroDefault({ section, data, font, accent, text }: {
  section: SectionConfig
  data: NewInvitationData
  font: ReturnType<typeof resolveFont>
  accent: string
  text: string
}) {
  const titleSz   = section.hero_title_size   ?? 36
  const andSz     = section.hero_and_size     ?? 22
  const taglineSz = section.hero_tagline_size ?? 11
  const dur       = section.hero_anim_duration  ?? 0.8
  const stagger   = section.hero_anim_stagger   ?? 0.15
  const shadow    = section.hero_text_shadow !== false
  const padT      = section.hero_padding_top    ?? 0
  const padB      = section.hero_padding_bottom ?? 0
  const showScroll = section.hero_show_scroll !== false

  const ts = (n: number) => ({ delay: n * stagger, duration: dur })

  return (
    <div style={{
      textAlign: 'center', width: '100%', maxWidth: 360, margin: '0 auto',
      paddingTop: padT, paddingBottom: padB,
    }}>
      <Bismillah section={section} font={font} accent={accent} delay={stagger * 0.5} />

      <Divider accent={accent} delay={stagger * 1} dur={dur * 0.8} />

      <motion.h1
        variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: ts(2) } }}
        style={{
          fontSize: titleSz, fontWeight: font.hw as number,
          lineHeight: 1.1, color: text,
          fontFamily: `'${font.heading}', serif`,
          letterSpacing: '-0.01em', margin: 0,
          textShadow: shadow ? '0 2px 16px rgba(0,0,0,0.35)' : 'none',
        }}
      >{data.groom_name}</motion.h1>

      <motion.p
        variants={{ hidden: { opacity: 0, scale: 0.7 }, visible: { opacity: 1, scale: 1, transition: ts(3) } }}
        style={{ fontSize: andSz, margin: '8px 0', fontWeight: font.bw as number, fontStyle: 'italic', color: accent, fontFamily: `'${font.heading}', serif` }}
      >&amp;</motion.p>

      <motion.h1
        variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: ts(4) } }}
        style={{
          fontSize: titleSz, fontWeight: font.hw as number,
          lineHeight: 1.1, color: text,
          fontFamily: `'${font.heading}', serif`,
          letterSpacing: '-0.01em', margin: 0,
          textShadow: shadow ? '0 2px 16px rgba(0,0,0,0.35)' : 'none',
        }}
      >{data.bride_name}</motion.h1>

      <Divider accent={accent} delay={stagger * 5} dur={dur * 0.8} />

      {data.tagline && (
        <motion.p
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: ts(6) } }}
          style={{ fontSize: taglineSz, lineHeight: 1.9, fontStyle: 'italic', color: `${text}aa`, fontFamily: `'${font.body}', serif`, maxWidth: 270, margin: '0 auto' }}
        >{data.tagline}</motion.p>
      )}

      {showScroll && (
        <motion.div
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: ts(8) } }}
          style={{ marginTop: 44, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
        >
          <p style={{ fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: `${text}44` }}>Scroll</p>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            style={{ width: 1, height: 26, backgroundColor: `${accent}55` }} />
        </motion.div>
      )}
    </div>
  )
}

// ─── Variant: Bottom (foto/video penuh, teks di bawah) ────────────────────
function HeroBottom({ section, data, font, accent, text, primary }: {
  section: SectionConfig
  data: NewInvitationData
  font: ReturnType<typeof resolveFont>
  accent: string
  text: string
  primary: string
}) {
  const titleSz   = section.hero_title_size   ?? 38
  const andSz     = section.hero_and_size     ?? 20
  const taglineSz = section.hero_tagline_size ?? 10
  const dur       = section.hero_anim_duration  ?? 0.9
  const stagger   = section.hero_anim_stagger   ?? 0.15
  const shadow    = section.hero_text_shadow !== false
  const padB      = section.hero_padding_bottom ?? 0

  const ts = (n: number) => ({ delay: n * stagger, duration: dur })

  return (
    <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingBottom: `calc(8vh + ${padB}px)`, position: 'relative' }}>
      <div style={{
        position: 'absolute', inset: '30% 0 0 0',
        background: `linear-gradient(to bottom, transparent, ${primary}ee 55%, ${primary} 100%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingLeft: 32, paddingRight: 32 }}>
        <Bismillah section={section} font={font} accent={accent} delay={stagger * 1} />
        <Divider accent={accent} delay={stagger * 2} dur={dur * 0.7} />

        <motion.h1
          variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: ts(3) } }}
          style={{
            fontSize: titleSz, fontWeight: font.hw as number,
            lineHeight: 1, color: '#fff',
            fontFamily: `'${font.heading}', serif`,
            letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0,
            textShadow: shadow ? '0 2px 24px rgba(0,0,0,0.6)' : 'none',
          }}
        >{data.groom_name}</motion.h1>

        <motion.p
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: ts(4) } }}
          style={{ fontSize: andSz, margin: '6px 0', fontStyle: 'italic', fontWeight: font.bw as number, color: accent, fontFamily: `'${font.heading}', serif` }}
        >&amp;</motion.p>

        <motion.h1
          variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0, transition: ts(5) } }}
          style={{
            fontSize: titleSz, fontWeight: font.hw as number,
            lineHeight: 1, color: '#fff',
            fontFamily: `'${font.heading}', serif`,
            letterSpacing: '0.04em', textTransform: 'uppercase', margin: 0,
            textShadow: shadow ? '0 2px 24px rgba(0,0,0,0.6)' : 'none',
          }}
        >{data.bride_name}</motion.h1>

        {data.tagline && (
          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: ts(7) } }}
            style={{ fontSize: taglineSz, lineHeight: 1.8, marginTop: 14, fontStyle: 'italic', color: 'rgba(255,255,255,0.72)', fontFamily: `'${font.body}', serif`, maxWidth: 270, margin: '14px auto 0' }}
          >{data.tagline}</motion.p>
        )}
      </div>
    </div>
  )
}

// ─── Variant: Minimal (tipografis, tanpa foto) ────────────────────────────
function HeroMinimal({ section, data, font, accent, text }: {
  section: SectionConfig
  data: NewInvitationData
  font: ReturnType<typeof resolveFont>
  accent: string
  text: string
}) {
  const titleSz   = section.hero_title_size   ?? 32
  const taglineSz = section.hero_tagline_size ?? 10
  const dur       = section.hero_anim_duration  ?? 0.8
  const stagger   = section.hero_anim_stagger   ?? 0.15
  const padT      = section.hero_padding_top    ?? 0
  const padB      = section.hero_padding_bottom ?? 0
  const ts = (n: number) => ({ delay: n * stagger, duration: dur })

  return (
    <div style={{ textAlign: 'center', maxWidth: 300, margin: '0 auto', paddingLeft: 24, paddingRight: 24, width: '100%', paddingTop: padT, paddingBottom: padB }}>
      <motion.div
        variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: ts(1) } }}
        style={{ border: `1px solid ${accent}44`, padding: '36px 24px', position: 'relative' }}
      >
        {[{ top: -4, left: -4 }, { top: -4, right: -4 }, { bottom: -4, left: -4 }, { bottom: -4, right: -4 }].map((pos, i) => (
          <div key={i} style={{ position: 'absolute', ...pos, width: 8, height: 8, backgroundColor: accent, opacity: 0.7 }} />
        ))}

        <Bismillah section={section} font={font} accent={accent} delay={stagger * 2} />

        <motion.h1
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: ts(3) } }}
          style={{ fontSize: titleSz, fontWeight: font.hw as number, lineHeight: 1.1, color: text, fontFamily: `'${font.heading}', serif`, margin: 0 }}
        >{data.groom_name}</motion.h1>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '10px 0' }}>
          <div style={{ flex: 1, height: '0.5px', backgroundColor: `${accent}44` }} />
          <motion.span
            variants={{ hidden: { opacity: 0, rotate: -180 }, visible: { opacity: 1, rotate: 0, transition: ts(4) } }}
            style={{ fontSize: 14, color: accent }}
          >✦</motion.span>
          <div style={{ flex: 1, height: '0.5px', backgroundColor: `${accent}44` }} />
        </div>

        <motion.h1
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: ts(5) } }}
          style={{ fontSize: titleSz, fontWeight: font.hw as number, lineHeight: 1.1, color: text, fontFamily: `'${font.heading}', serif`, margin: 0 }}
        >{data.bride_name}</motion.h1>

        {data.tagline && (
          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: ts(7) } }}
            style={{ fontSize: taglineSz, lineHeight: 1.8, marginTop: 16, fontStyle: 'italic', color: `${text}88`, fontFamily: `'${font.body}', serif` }}
          >{data.tagline}</motion.p>
        )}
      </motion.div>
    </div>
  )
}

// ─── Main HeroSection ─────────────────────────────────────────────────────
export default function HeroSection({ section, data, meta }: Props) {
  const { primary, accent, text } = meta.color_scheme
  const variant = section.style_variant ?? 'default'
  const font = resolveFont(meta, section)

  const overlay = section.hero_overlay ?? (variant === 'bottom' ? 0.15 : 0.52)
  const hasVideo = !!data.hero_video_url
  const hasPhoto = !!data.couple_photo_url && !hasVideo

  // Build section config — inject background (photo or video handled separately)
  let sectionCfg: SectionConfig = { ...section }
  if (hasPhoto) {
    sectionCfg = { ...sectionCfg, background: { type: 'image', url: data.couple_photo_url, overlay_opacity: overlay } }
  }
  if (variant === 'bottom') {
    sectionCfg = { ...sectionCfg, content_layout: 'full-bleed' as const }
  }

  const sharedProps = { section, data, font, accent, text }

  return (
    <SectionWrapper section={sectionCfg} className={variant !== 'bottom' ? 'px-6' : ''}>
      {/* Video background */}
      {hasVideo && (
        <>
          <video
            src={data.hero_video_url}
            autoPlay muted loop playsInline
            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
          />
          <div className="absolute inset-0 z-[1]"
            style={{ backgroundColor: `rgba(0,0,0,${overlay})` }} />
        </>
      )}

      {/* Content */}
      <div style={{ position: 'relative', zIndex: 2, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {variant === 'default' && <HeroDefault {...sharedProps} />}
        {variant === 'bottom'  && <HeroBottom  {...sharedProps} primary={primary} />}
        {variant === 'minimal' && <HeroMinimal {...sharedProps} />}
      </div>
    </SectionWrapper>
  )
}
