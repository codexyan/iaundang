'use client'

import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { SectionConfig, TemplateMeta, FontConfig } from '@/lib/types'
import { getTransitionVariants } from './transitions/useTransition'
import { usePreviewContext } from './PreviewContext'

interface Props {
  section: SectionConfig
  children: React.ReactNode
  className?: string
  /** Renders inside <section> but outside the motion.div — use for in-section modals/overlays */
  overlay?: React.ReactNode
  /** Template-level font config — provides default scale fallback before section overrides */
  fontConfig?: FontConfig
}

/**
 * Merge template-level fonts dengan per-section overrides.
 * Kembalikan font family, weight, dan scale multiplier.
 */
export function resolveFont(meta: TemplateMeta, section: SectionConfig) {
  return {
    heading: section.font_heading    ?? meta.font.heading,
    body:    section.font_body       ?? meta.font.body,
    hw:      section.heading_weight  ?? 700,   // heading font-weight
    bw:      section.body_weight     ?? 400,   // body font-weight
    hs:      section.heading_scale   ?? 1.0,   // heading size scale
    bs:      section.body_scale      ?? 1.0,   // body size scale
  }
}

/** Font size heading via CSS variable: calc(Xpx * var(--hs, 1)) */
export function fsh(base: number): string { return `calc(${base}px * var(--hs, 1))` }

/** Font size body via CSS variable: calc(Xpx * var(--bs, 1)) */
export function fsb(base: number): string { return `calc(${base}px * var(--bs, 1))` }

/** clamp() untuk heading dengan CSS variable scale */
export function clampH(min: string, mid: string, max: string): string {
  return `calc(clamp(${min}, ${mid}, ${max}) * var(--hs, 1))`
}

/** clamp() untuk body dengan CSS variable scale */
export function clampB(min: string, mid: string, max: string): string {
  return `calc(clamp(${min}, ${mid}, ${max}) * var(--bs, 1))`
}

/** Legacy helpers — tetap ada untuk backward compat */
export function fs(base: number, scale: number): number { return Math.round(base * scale * 10) / 10 }
export function clampFs(min: string, mid: string, max: string, scale: number): string {
  return scale === 1 ? `clamp(${min}, ${mid}, ${max})` : `calc(clamp(${min}, ${mid}, ${max}) * ${scale})`
}
export function fontW(type: 'heading' | 'body'): string {
  return type === 'heading' ? 'var(--hw, 700)' : 'var(--bw, 400)'
}

export default function SectionWrapper({ section, children, className = '', overlay, fontConfig }: Props) {
  const { isPreview, replaySectionId, replaySectionKey } = usePreviewContext()

  const isReplay  = isPreview && replaySectionId === section.id
  const replayKey = isReplay ? replaySectionKey : undefined

  const bg = section.background
  // Full-bleed sections stretch to 100% width (e.g. hero-bottom)
  const isFullBleed  = section.content_layout === 'full-bleed'
  const alignCls     = isFullBleed
    ? 'items-stretch'
    : { center: 'items-center', left: 'items-start', right: 'items-end' }[section.text_align ?? 'center']
  const isSplitLeft  = section.content_layout === 'split-left'
  const isSplitRight = section.content_layout === 'split-right'
  const variants = getTransitionVariants(section.transition_in)

  const bgStyle: React.CSSProperties = {}
  if (bg.type === 'color' && bg.value) {
    bgStyle.backgroundColor = bg.value
  } else if (bg.type === 'gradient' && bg.value) {
    bgStyle.background = bg.value
  } else if (bg.type === 'image' && bg.url) {
    bgStyle.backgroundImage = `url(${bg.url})`
    bgStyle.backgroundSize = 'cover'
    bgStyle.backgroundPosition = 'center'
    bgStyle.backgroundRepeat = 'no-repeat'
  }
  // video: rendered as <video> element below, not bgStyle

  // Setiap section penuh layar — snap ke setiap section
  // Preview: 845px (= 736 / (340/390)) agar pas di phone mockup setelah zoom
  // Live: 100dvh
  const sectionMinH: React.CSSProperties['minHeight'] = isPreview ? 845 : '100dvh'

  // Auto-scroll saat section di-replay
  const ref = useRef<HTMLElement>(null)
  useEffect(() => {
    if (!isReplay || !replaySectionKey) return
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [replaySectionKey, isReplay])

  // Full-bleed: motion.div mengisi seluruh tinggi section (untuk hero bottom, dsb.)
  const innerFillStyle: React.CSSProperties = isFullBleed
    ? { alignSelf: 'stretch', flex: 1, display: 'flex', flexDirection: 'column' }
    : {}

  // CSS variables — section overrides > template defaults > hardcoded fallback
  const fontVars = {
    '--hs': section.heading_scale ?? fontConfig?.heading_scale ?? 1,
    '--bs': section.body_scale    ?? fontConfig?.body_scale    ?? 1,
    '--hw': section.heading_weight ?? 700,
    '--bw': section.body_weight    ?? 400,
  } as React.CSSProperties

  return (
    <section
      ref={ref}
      style={{
        ...bgStyle,
        ...fontVars,
        minHeight: sectionMinH,
        scrollSnapAlign: 'start',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
      className={className}
    >
      {/* Video background — sits at z-0 behind overlay and content */}
      {bg.type === 'video' && bg.url && (
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ zIndex: 0 }}
          src={bg.url}
        />
      )}

      {/* Dark overlay for photo and video backgrounds */}
      {(bg.type === 'image' || bg.type === 'video') && (bg.overlay_opacity ?? 0) > 0 && (
        <div
          className="absolute inset-0"
          style={{ backgroundColor: `rgba(0,0,0,${bg.overlay_opacity})`, zIndex: 1 }}
        />
      )}

      <motion.div
        key={replayKey}
        className={`relative z-10 flex flex-col ${alignCls} w-full ${isFullBleed ? '' : 'max-w-lg mx-auto px-6'}`}
        style={{
          ...innerFillStyle,
          ...(isSplitLeft  ? { flexDirection: 'row',        gap: 24, alignItems: 'flex-start' } : {}),
          ...(isSplitRight ? { flexDirection: 'row-reverse', gap: 24, alignItems: 'flex-start' } : {}),
        }}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: !isPreview, margin: '-40px' }}
        variants={variants}
      >
        {children}
      </motion.div>

      {/* Section-scoped overlay — absolute, clipped by section's overflow:hidden */}
      {overlay}
    </section>
  )
}
