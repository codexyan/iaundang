'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import SectionWrapper, { resolveFont } from '../SectionWrapper'
import { usePreviewContext } from '../PreviewContext'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
}

//  Arabic font loader 
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

//  Bismillah component 
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

//  Hero Icon/Logo component
function HeroIcon({ section, delay, dur }: { section: SectionConfig; delay: number; dur: number }) {
  if (!section.hero_icon_url) return null
  const size = section.hero_icon_size ?? 40
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { delay, duration: dur } } }}
      style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}
    >
      <img
        src={section.hero_icon_url}
        alt=""
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    </motion.div>
  )
}

//  Divider component
function Divider({ accent, delay, dur }: { accent: string; delay: number; dur: number }) {
  return (
    <motion.div
      variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: { delay, duration: dur } } }}
      style={{ height: 1, width: 60, backgroundColor: `${accent}77`, margin: '0 auto 20px' }}
    />
  )
}

//  Variant: Default (centered, foto/video background) 
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
      <HeroIcon section={section} delay={stagger * 0.3} dur={dur} />

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
          <p style={{ fontSize: 8, letterSpacing: '0.3em', textTransform: 'uppercase', color: `${text}66` }}>Scroll</p>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
            style={{ width: 1, height: 26, backgroundColor: `${accent}55` }} />
        </motion.div>
      )}
    </div>
  )
}

//  Variant: Bottom (foto/video penuh, teks anchor ke bawah) 
function HeroBottom({ section, data, font, accent, text, primary }: {
  section: SectionConfig
  data: NewInvitationData
  font: ReturnType<typeof resolveFont>
  accent: string
  text: string
  primary: string
}) {
  const { isPreview } = usePreviewContext()
  const titleSz   = section.hero_title_size   ?? 38
  const andSz     = section.hero_and_size     ?? 20
  const taglineSz = section.hero_tagline_size ?? 10
  const labelSz   = section.hero_label_size   ?? 9
  const dur       = section.hero_anim_duration  ?? 0.9
  const stagger   = section.hero_anim_stagger   ?? 0.15
  const shadow    = section.hero_text_shadow !== false
  const padB      = section.hero_padding_bottom ?? 0

  // Preview: pakai fixed px; live: pakai dvh-safe padding
  const bottomPad = isPreview ? 72 + padB : `calc(10dvh + ${padB}px)`

  const ts = (n: number) => ({ delay: n * stagger, duration: dur })

  return (
    <div style={{
      flex: 1, width: '100%',
      display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
      paddingBottom: bottomPad, position: 'relative',
    }}>
      {/* Multi-layer gradient for cinematic depth */}
      <div style={{
        position: 'absolute', inset: '20% 0 0 0',
        background: `linear-gradient(to bottom,
          transparent 0%,
          ${primary}66 35%,
          ${primary}cc 60%,
          ${primary}f5 80%,
          ${primary} 100%)`,
        pointerEvents: 'none',
      }} />

      {/* Vignette sides */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at center bottom, transparent 50%, ${primary}55 100%)`,
      }} />

      {/* Top icon — positioned absolute at top center */}
      {section.hero_icon_url && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: stagger * 0.3, duration: dur }}
          style={{ position: 'absolute', top: 24, left: 0, right: 0, display: 'flex', justifyContent: 'center', zIndex: 2 }}
        >
          <img src={section.hero_icon_url} alt="" style={{ width: section.hero_icon_size ?? 40, height: section.hero_icon_size ?? 40, objectFit: 'contain' }} />
        </motion.div>
      )}

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', paddingLeft: 28, paddingRight: 28 }}>

        {/* Date badge (placeholder acara) */}
        <motion.div
          variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: ts(1) } }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            marginBottom: 18,
          }}
        >
          <p style={{
            fontSize: labelSz, letterSpacing: '0.3em', textTransform: 'uppercase',
            color: `${accent}cc`, fontFamily: `'${font.body}', serif`,
          }}>
            {section.hero_bismillah === 'none' ? 'Undangan Pernikahan'
              : section.hero_bismillah === 'arabic' ? 'بِسْمِ اللَّهِ'
              : (section.hero_bismillah_custom || 'Bismillahirrahmanirrahim')}
          </p>
        </motion.div>

        {/* Couple names   elegant stacked layout */}
        <motion.h1
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: ts(2) } }}
          style={{
            fontSize: titleSz, fontWeight: font.hw as number,
            lineHeight: 1.05, color: text,
            fontFamily: `'${font.heading}', serif`,
            letterSpacing: '0.06em', margin: 0,
            textShadow: shadow ? '0 3px 32px rgba(0,0,0,0.7)' : 'none',
          }}
        >{data.groom_name}</motion.h1>

        {/* Divider with accent dot */}
        <motion.p
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: ts(3) } }}
          style={{ fontSize: andSz, margin: '10px 0', fontStyle: 'italic', color: accent, fontFamily: `'${font.heading}', serif`, fontWeight: font.bw as number }}
        >
          &amp;
        </motion.p>

        <motion.h1
          variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: ts(4) } }}
          style={{
            fontSize: titleSz, fontWeight: font.hw as number,
            lineHeight: 1.05, color: text,
            fontFamily: `'${font.heading}', serif`,
            letterSpacing: '0.06em', margin: 0,
            textShadow: shadow ? '0 3px 32px rgba(0,0,0,0.7)' : 'none',
          }}
        >{data.bride_name}</motion.h1>

        {data.tagline && (
          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: ts(6) } }}
            style={{
              fontSize: taglineSz, lineHeight: 1.85, marginTop: 16,
              fontStyle: 'italic', color: `${text}aa`,
              fontFamily: `'${font.body}', serif`, maxWidth: 240, margin: '16px auto 0',
            }}
          >{data.tagline}</motion.p>
        )}
      </div>
    </div>
  )
}

//  Variant: Minimal (tipografis, tanpa foto) 
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
      <HeroIcon section={section} delay={stagger * 0.3} dur={dur} />
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

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px 0' }}>
          <motion.span
            variants={{ hidden: { opacity: 0, rotate: -180 }, visible: { opacity: 1, rotate: 0, transition: ts(4) } }}
            style={{ fontSize: 14, color: accent }}
          >✦</motion.span>
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

//  Variant: Split (foto kiri, nama kanan   visual editorial) 
function HeroSplit({ section, data, font, accent, text }: {
  section: SectionConfig
  data: NewInvitationData
  font: ReturnType<typeof resolveFont>
  accent: string
  text: string
}) {
  const titleSz   = section.hero_title_size   ?? 28
  const taglineSz = section.hero_tagline_size ?? 10
  const dur       = section.hero_anim_duration  ?? 0.8
  const stagger   = section.hero_anim_stagger   ?? 0.15
  const padT      = section.hero_padding_top    ?? 0
  const padB      = section.hero_padding_bottom ?? 0
  const ts = (n: number) => ({ delay: n * stagger, duration: dur })

  return (
    <div style={{
      display: 'flex', width: '100%', minHeight: 400, paddingTop: padT, paddingBottom: padB,
    }}>
      {data.couple_photo_url && (
        <motion.div
          variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: ts(1) } }}
          style={{
            flex: 1, backgroundImage: `url(${data.couple_photo_url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }}
        />
      )}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        justifyContent: 'center', padding: '32px 24px', textAlign: 'left',
      }}>
        <HeroIcon section={section} delay={stagger * 0.3} dur={dur} />
        <Bismillah section={section} font={font} accent={accent} delay={stagger * 1} />

        <motion.h1
          variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: ts(2) } }}
          style={{ fontSize: titleSz, fontWeight: font.hw as number, lineHeight: 1.1, color: text, fontFamily: `'${font.heading}', serif`, margin: 0 }}
        >{data.groom_name}</motion.h1>

        <motion.div
          variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: ts(3) } }}
          style={{ height: 1, width: 40, backgroundColor: `${accent}77`, margin: '10px 0', transformOrigin: 'left' }}
        />

        <motion.h1
          variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0, transition: ts(4) } }}
          style={{ fontSize: titleSz, fontWeight: font.hw as number, lineHeight: 1.1, color: text, fontFamily: `'${font.heading}', serif`, margin: 0 }}
        >{data.bride_name}</motion.h1>

        {data.tagline && (
          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: ts(6) } }}
            style={{ fontSize: taglineSz, lineHeight: 1.8, marginTop: 14, fontStyle: 'italic', color: `${text}88`, fontFamily: `'${font.body}', serif` }}
          >{data.tagline}</motion.p>
        )}
      </div>
    </div>
  )
}

//  Variant: Overlay Card (nama di dalam card transparan mengambang) 
function HeroOverlayCard({ section, data, font, accent, text }: {
  section: SectionConfig
  data: NewInvitationData
  font: ReturnType<typeof resolveFont>
  accent: string
  text: string
}) {
  const titleSz   = section.hero_title_size   ?? 30
  const andSz     = section.hero_and_size     ?? 18
  const taglineSz = section.hero_tagline_size ?? 10
  const dur       = section.hero_anim_duration  ?? 0.9
  const stagger   = section.hero_anim_stagger   ?? 0.15
  const shadow    = section.hero_text_shadow !== false
  const ts = (n: number) => ({ delay: n * stagger, duration: dur })

  return (
    <div style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <HeroIcon section={section} delay={stagger * 0.3} dur={dur} />
      <motion.div
        variants={{ hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1, transition: ts(1) } }}
        style={{
          background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          borderRadius: 16, border: `1px solid rgba(255,255,255,0.18)`,
          padding: '40px 28px', maxWidth: 320, width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
        }}
      >
        <Bismillah section={section} font={font} accent={accent} delay={stagger * 2} />

        <motion.h1
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: ts(3) } }}
          style={{ fontSize: titleSz, fontWeight: font.hw as number, lineHeight: 1.1, color: text, fontFamily: `'${font.heading}', serif`, margin: 0, textShadow: shadow ? '0 2px 12px rgba(0,0,0,0.3)' : 'none' }}
        >{data.groom_name}</motion.h1>

        <motion.p
          variants={{ hidden: { opacity: 0, scale: 0.7 }, visible: { opacity: 1, scale: 1, transition: ts(4) } }}
          style={{ fontSize: andSz, margin: '8px 0', fontStyle: 'italic', color: accent, fontFamily: `'${font.heading}', serif` }}
        >&amp;</motion.p>

        <motion.h1
          variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: ts(5) } }}
          style={{ fontSize: titleSz, fontWeight: font.hw as number, lineHeight: 1.1, color: text, fontFamily: `'${font.heading}', serif`, margin: 0, textShadow: shadow ? '0 2px 12px rgba(0,0,0,0.3)' : 'none' }}
        >{data.bride_name}</motion.h1>

        <Divider accent={accent} delay={stagger * 6} dur={dur * 0.8} />

        {data.tagline && (
          <motion.p
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: ts(7) } }}
            style={{ fontSize: taglineSz, lineHeight: 1.8, fontStyle: 'italic', color: `${text}b3`, fontFamily: `'${font.body}', serif`, maxWidth: 260, margin: '0 auto' }}
          >{data.tagline}</motion.p>
        )}
      </motion.div>
    </div>
  )
}

//  Variant: Editorial (teks besar dramatis, satu baris per nama) 
function HeroEditorial({ section, data, font, accent, text }: {
  section: SectionConfig
  data: NewInvitationData
  font: ReturnType<typeof resolveFont>
  accent: string
  text: string
}) {
  const titleSz   = section.hero_title_size   ?? 44
  const taglineSz = section.hero_tagline_size ?? 10
  const labelSz   = section.hero_label_size   ?? 8
  const dur       = section.hero_anim_duration  ?? 1.0
  const stagger   = section.hero_anim_stagger   ?? 0.18
  const shadow    = section.hero_text_shadow !== false
  const padT      = section.hero_padding_top    ?? 0
  const padB      = section.hero_padding_bottom ?? 0
  const ts = (n: number) => ({ delay: n * stagger, duration: dur })

  return (
    <div style={{
      textAlign: 'center', width: '100%', maxWidth: 360, margin: '0 auto',
      paddingTop: padT, paddingBottom: padB,
    }}>
      <HeroIcon section={section} delay={stagger * 0.3} dur={dur} />

      <motion.p
        variants={{ hidden: { opacity: 0, y: -8 }, visible: { opacity: 1, y: 0, transition: ts(1) } }}
        style={{ fontSize: labelSz, letterSpacing: '0.4em', textTransform: 'uppercase', color: `${accent}99`, fontFamily: `'${font.body}', serif`, marginBottom: 24 }}
      >The Wedding of</motion.p>

      <motion.h1
        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: ts(2) } }}
        style={{ fontSize: titleSz, fontWeight: 300, lineHeight: 0.95, color: text, fontFamily: `'${font.heading}', serif`, margin: 0, letterSpacing: '0.05em', textShadow: shadow ? '0 2px 24px rgba(0,0,0,0.25)' : 'none' }}
      >{data.groom_name}</motion.h1>

      <motion.p
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: ts(3) } }}
        style={{ fontSize: 10, margin: '14px 0', color: `${accent}aa`, fontFamily: `'${font.body}', serif`, letterSpacing: '0.3em' }}
      >
        &amp;
      </motion.p>

      <motion.h1
        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: ts(4) } }}
        style={{ fontSize: titleSz, fontWeight: 300, lineHeight: 0.95, color: text, fontFamily: `'${font.heading}', serif`, margin: 0, letterSpacing: '0.05em', textShadow: shadow ? '0 2px 24px rgba(0,0,0,0.25)' : 'none' }}
      >{data.bride_name}</motion.h1>

      {data.tagline && (
        <motion.p
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: ts(6) } }}
          style={{ fontSize: taglineSz, lineHeight: 1.9, marginTop: 28, fontStyle: 'italic', color: `${text}77`, fontFamily: `'${font.body}', serif`, maxWidth: 250, margin: '28px auto 0' }}
        >{data.tagline}</motion.p>
      )}
    </div>
  )
}

//  Variant: Arch (frame lengkung elegan, ornamental) 
function HeroArch({ section, data, font, accent, text }: {
  section: SectionConfig
  data: NewInvitationData
  font: ReturnType<typeof resolveFont>
  accent: string
  text: string
}) {
  const titleSz   = section.hero_title_size   ?? 30
  const andSz     = section.hero_and_size     ?? 16
  const taglineSz = section.hero_tagline_size ?? 10
  const dur       = section.hero_anim_duration  ?? 0.8
  const stagger   = section.hero_anim_stagger   ?? 0.15
  const ts = (n: number) => ({ delay: n * stagger, duration: dur })

  return (
    <div style={{ textAlign: 'center', width: '100%', maxWidth: 320, margin: '0 auto', padding: '0 16px' }}>
      <motion.div
        variants={{ hidden: { opacity: 0, scale: 0.9 }, visible: { opacity: 1, scale: 1, transition: ts(1) } }}
        style={{ position: 'relative', padding: '48px 20px 36px' }}
      >
        {/* Arch frame SVG */}
        <svg viewBox="0 0 280 400" fill="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          <path d="M40,400 L40,120 Q40,20 140,20 Q240,20 240,120 L240,400"
            stroke={`${accent}55`} strokeWidth="1.5" fill="none" />
          <path d="M50,400 L50,130 Q50,35 140,35 Q230,35 230,130 L230,400"
            stroke={`${accent}35`} strokeWidth="0.8" fill="none" />
        </svg>

        <HeroIcon section={section} delay={stagger * 0.5} dur={dur} />

        <Bismillah section={section} font={font} accent={accent} delay={stagger * 2} />

        <motion.h1
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: ts(3) } }}
          style={{ fontSize: titleSz, fontWeight: font.hw as number, lineHeight: 1.1, color: text, fontFamily: `'${font.heading}', serif`, margin: 0 }}
        >{data.groom_name}</motion.h1>

        <motion.p
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: ts(4) } }}
          style={{ fontSize: andSz, margin: '8px 0', fontStyle: 'italic', color: accent, fontFamily: `'${font.heading}', serif` }}
        >&amp;</motion.p>

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

//  Variant: Magazine (foto circle + layout majalah)
function HeroMagazine({ section, data, font, accent, text }: {
  section: SectionConfig
  data: NewInvitationData
  font: ReturnType<typeof resolveFont>
  accent: string
  text: string
}) {
  const titleSz   = section.hero_title_size   ?? 28
  const taglineSz = section.hero_tagline_size ?? 10
  const labelSz   = section.hero_label_size   ?? 8
  const dur       = section.hero_anim_duration  ?? 0.8
  const stagger   = section.hero_anim_stagger   ?? 0.15
  const padT      = section.hero_padding_top    ?? 0
  const padB      = section.hero_padding_bottom ?? 0
  const ts = (n: number) => ({ delay: n * stagger, duration: dur })

  return (
    <div style={{
      textAlign: 'center', width: '100%', maxWidth: 340, margin: '0 auto',
      paddingTop: padT, paddingBottom: padB,
    }}>
      <HeroIcon section={section} delay={stagger * 0.3} dur={dur} />

      {data.couple_photo_url && (
        <motion.div
          variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: ts(1) } }}
          style={{
            width: 120, height: 120, borderRadius: '50%', margin: '0 auto 20px',
            backgroundImage: `url(${data.couple_photo_url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
            border: `2px solid ${accent}66`,
            boxShadow: `0 0 0 6px ${accent}22, 0 8px 24px rgba(0,0,0,0.15)`,
          }}
        />
      )}

      <motion.p
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: ts(2) } }}
        style={{ fontSize: labelSz, letterSpacing: '0.35em', textTransform: 'uppercase', color: `${accent}88`, fontFamily: `'${font.body}', serif`, marginBottom: 12 }}
      >Undangan Pernikahan</motion.p>

      <motion.h1
        variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0, transition: ts(3) } }}
        style={{ fontSize: titleSz, fontWeight: font.hw as number, lineHeight: 1.1, color: text, fontFamily: `'${font.heading}', serif`, margin: 0 }}
      >{data.groom_name} &amp; {data.bride_name}</motion.h1>

      <Divider accent={accent} delay={stagger * 4} dur={dur * 0.8} />

      {data.tagline && (
        <motion.p
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: ts(5) } }}
          style={{ fontSize: taglineSz, lineHeight: 1.8, fontStyle: 'italic', color: `${text}88`, fontFamily: `'${font.body}', serif`, maxWidth: 260, margin: '0 auto' }}
        >{data.tagline}</motion.p>
      )}
    </div>
  )
}

//  Main HeroSection 
export default function HeroSection({ section, data, meta }: Props) {
  const { primary, accent, text } = meta.color_scheme
  const variant = section.style_variant ?? 'default'
  const font = resolveFont(meta, section)

  const overlay = section.hero_overlay ?? (variant === 'bottom' ? 0.15 : variant === 'overlay-card' ? 0.4 : 0.52)
  const hasVideo = !!data.hero_video_url
  const hasPhoto = !!data.couple_photo_url && !hasVideo

  // 'magazine' & 'minimal' sengaja tanpa foto background (lihat SECTION_VARIANTS di TemplateLab)
  const usesBgPhoto = variant !== 'magazine' && variant !== 'minimal'

  let sectionCfg: SectionConfig = { ...section }
  if (hasPhoto && usesBgPhoto) {
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
      <div style={{
        position: 'relative', zIndex: 2, width: '100%',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        ...(variant === 'bottom' ? { flex: 1, alignSelf: 'stretch' } : {}),
      }}>
        {variant === 'default'      && <HeroDefault {...sharedProps} />}
        {variant === 'bottom'       && <HeroBottom  {...sharedProps} primary={primary} />}
        {variant === 'minimal'      && <HeroMinimal {...sharedProps} />}
        {variant === 'split'        && <HeroSplit   {...sharedProps} />}
        {variant === 'overlay-card' && <HeroOverlayCard {...sharedProps} />}
        {variant === 'editorial'    && <HeroEditorial   {...sharedProps} />}
        {variant === 'arch'         && <HeroArch        {...sharedProps} />}
        {variant === 'magazine'     && <HeroMagazine    {...sharedProps} />}
      </div>
    </SectionWrapper>
  )
}
