'use client'

import { motion } from 'framer-motion'

export type DecorationPreset = 'none' | 'javanese' | 'floral' | 'modern' | 'rustic'

interface Props {
  preset: DecorationPreset
  accent: string
  opacity?: number   // 0-100
  animate?: boolean  // true = entrance animation (live view), false = static (preview)
}

//  Javanese (Batik Jawa) 
function JavaneseDecor({ accent, opacity }: { accent: string; opacity: number }) {
  return (
    <>
      {/* Corner ornamen - kiri atas */}
      <svg style={{ position: 'absolute', top: 12, left: 12, opacity: opacity / 100 }}
        width="72" height="72" viewBox="0 0 72 72" fill="none">
        {/* Triangle fill */}
        <path d="M0 0 L72 0 L0 72 Z" fill={accent} fillOpacity={0.07} />
        {/* Outer L bracket */}
        <polyline points="2,28 2,2 28,2" stroke={accent} strokeWidth="1.5" strokeOpacity="0.7" fill="none" />
        {/* Inner L bracket */}
        <polyline points="2,18 2,8 18,8" stroke={accent} strokeWidth="1" strokeOpacity="0.5" fill="none" />
        {/* Dots */}
        <circle cx="2" cy="2" r="2.5" fill={accent} fillOpacity="0.8" />
        <circle cx="28" cy="2" r="1.5" fill={accent} fillOpacity="0.5" />
        <circle cx="2" cy="28" r="1.5" fill={accent} fillOpacity="0.5" />
        {/* Diamond center */}
        <path d="M12 2 L14 4 L12 6 L10 4 Z" fill={accent} fillOpacity="0.6" />
        <path d="M2 12 L4 14 L2 16 L0 14 Z" fill={accent} fillOpacity="0.6" />
        {/* Geometric lines */}
        <line x1="8" y1="2" x2="2" y2="8" stroke={accent} strokeWidth="0.75" strokeOpacity="0.4" />
        <line x1="16" y1="2" x2="2" y2="16" stroke={accent} strokeWidth="0.75" strokeOpacity="0.3" />
        <line x1="24" y1="2" x2="2" y2="24" stroke={accent} strokeWidth="0.75" strokeOpacity="0.2" />
      </svg>

      {/* Corner ornamen - kanan atas */}
      <svg style={{ position: 'absolute', top: 12, right: 12, opacity: opacity / 100, transform: 'scaleX(-1)' }}
        width="72" height="72" viewBox="0 0 72 72" fill="none">
        <path d="M0 0 L72 0 L0 72 Z" fill={accent} fillOpacity={0.07} />
        <polyline points="2,28 2,2 28,2" stroke={accent} strokeWidth="1.5" strokeOpacity="0.7" fill="none" />
        <polyline points="2,18 2,8 18,8" stroke={accent} strokeWidth="1" strokeOpacity="0.5" fill="none" />
        <circle cx="2" cy="2" r="2.5" fill={accent} fillOpacity="0.8" />
        <circle cx="28" cy="2" r="1.5" fill={accent} fillOpacity="0.5" />
        <circle cx="2" cy="28" r="1.5" fill={accent} fillOpacity="0.5" />
        <path d="M12 2 L14 4 L12 6 L10 4 Z" fill={accent} fillOpacity="0.6" />
        <line x1="8" y1="2" x2="2" y2="8" stroke={accent} strokeWidth="0.75" strokeOpacity="0.4" />
        <line x1="16" y1="2" x2="2" y2="16" stroke={accent} strokeWidth="0.75" strokeOpacity="0.3" />
        <line x1="24" y1="2" x2="2" y2="24" stroke={accent} strokeWidth="0.75" strokeOpacity="0.2" />
      </svg>

      {/* Top center ornamen */}
      <div style={{ position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)', opacity: opacity / 100 }}>
        <svg width="120" height="24" viewBox="0 0 120 24" fill="none">
          <line x1="0" y1="12" x2="42" y2="12" stroke={accent} strokeWidth="0.75" strokeOpacity="0.5" />
          <line x1="78" y1="12" x2="120" y2="12" stroke={accent} strokeWidth="0.75" strokeOpacity="0.5" />
          <path d="M48 12 L52 6 L60 4 L68 6 L72 12 L68 18 L60 20 L52 18 Z"
            stroke={accent} strokeWidth="1" fill={accent} fillOpacity="0.12" strokeOpacity="0.7" />
          <circle cx="60" cy="12" r="2" fill={accent} fillOpacity="0.7" />
          <circle cx="44" cy="12" r="1.5" fill={accent} fillOpacity="0.5" />
          <circle cx="76" cy="12" r="1.5" fill={accent} fillOpacity="0.5" />
        </svg>
      </div>

      {/* Garis border sisi - batik stripe */}
      <div style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: 4, opacity: opacity / 100,
        background: `repeating-linear-gradient(0deg, ${accent}60, ${accent}60 6px, transparent 6px, transparent 12px)`,
      }} />
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: 4, opacity: opacity / 100,
        background: `repeating-linear-gradient(0deg, ${accent}60, ${accent}60 6px, transparent 6px, transparent 12px)`,
      }} />
    </>
  )
}

//  Floral 
function FloralDecor({ accent, opacity }: { accent: string; opacity: number }) {
  return (
    <>
      {/* Corner bunga - kiri atas */}
      <svg style={{ position: 'absolute', top: 8, left: 8, opacity: opacity / 100 }}
        width="80" height="80" viewBox="0 0 80 80" fill="none">
        {/* Vine/stem */}
        <path d="M4 60 Q 20 40, 16 16 Q 40 12, 60 4" stroke={accent} strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
        {/* Leaves */}
        <ellipse cx="20" cy="32" rx="8" ry="4" transform="rotate(-30 20 32)" fill={accent} fillOpacity="0.15" />
        <ellipse cx="36" cy="18" rx="7" ry="3.5" transform="rotate(-60 36 18)" fill={accent} fillOpacity="0.15" />
        {/* Flowers */}
        {[0, 60, 120, 180, 240, 300].map(a => (
          <ellipse key={a} cx={4 + Math.cos((a * Math.PI) / 180) * 5} cy={4 + Math.sin((a * Math.PI) / 180) * 5}
            rx="3.5" ry="2" transform={`rotate(${a} ${4 + Math.cos((a * Math.PI) / 180) * 5} ${4 + Math.sin((a * Math.PI) / 180) * 5})`}
            fill={accent} fillOpacity="0.5" />
        ))}
        <circle cx="4" cy="4" r="2.5" fill={accent} fillOpacity="0.8" />
        {/* Small flower at mid */}
        {[0, 72, 144, 216, 288].map(a => (
          <ellipse key={a} cx={22 + Math.cos((a * Math.PI) / 180) * 4} cy={22 + Math.sin((a * Math.PI) / 180) * 4}
            rx="3" ry="1.8"
            transform={`rotate(${a} ${22 + Math.cos((a * Math.PI) / 180) * 4} ${22 + Math.sin((a * Math.PI) / 180) * 4})`}
            fill={accent} fillOpacity="0.4" />
        ))}
        <circle cx="22" cy="22" r="2" fill={accent} fillOpacity="0.7" />
      </svg>

      {/* Corner bunga - kanan atas (mirror) */}
      <svg style={{ position: 'absolute', top: 8, right: 8, opacity: opacity / 100, transform: 'scaleX(-1)' }}
        width="80" height="80" viewBox="0 0 80 80" fill="none">
        <path d="M4 60 Q 20 40, 16 16 Q 40 12, 60 4" stroke={accent} strokeWidth="1.2" strokeOpacity="0.5" fill="none" />
        <ellipse cx="20" cy="32" rx="8" ry="4" transform="rotate(-30 20 32)" fill={accent} fillOpacity="0.15" />
        <ellipse cx="36" cy="18" rx="7" ry="3.5" transform="rotate(-60 36 18)" fill={accent} fillOpacity="0.15" />
        {[0, 60, 120, 180, 240, 300].map(a => (
          <ellipse key={a} cx={4 + Math.cos((a * Math.PI) / 180) * 5} cy={4 + Math.sin((a * Math.PI) / 180) * 5}
            rx="3.5" ry="2" transform={`rotate(${a} ${4 + Math.cos((a * Math.PI) / 180) * 5} ${4 + Math.sin((a * Math.PI) / 180) * 5})`}
            fill={accent} fillOpacity="0.5" />
        ))}
        <circle cx="4" cy="4" r="2.5" fill={accent} fillOpacity="0.8" />
      </svg>

      {/* Top center bunga */}
      <div style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)', opacity: opacity / 100 }}>
        <svg width="100" height="28" viewBox="0 0 100 28" fill="none">
          <line x1="0" y1="14" x2="36" y2="14" stroke={accent} strokeWidth="0.75" strokeOpacity="0.4" />
          <line x1="64" y1="14" x2="100" y2="14" stroke={accent} strokeWidth="0.75" strokeOpacity="0.4" />
          {[0, 72, 144, 216, 288].map(a => (
            <ellipse key={a}
              cx={50 + Math.cos((a * Math.PI) / 180) * 7}
              cy={14 + Math.sin((a * Math.PI) / 180) * 7}
              rx="5" ry="3"
              transform={`rotate(${a} ${50 + Math.cos((a * Math.PI) / 180) * 7} ${14 + Math.sin((a * Math.PI) / 180) * 7})`}
              fill={accent} fillOpacity="0.45" />
          ))}
          <circle cx="50" cy="14" r="3" fill={accent} fillOpacity="0.8" />
        </svg>
      </div>
    </>
  )
}

//  Modern 
function ModernDecor({ accent, opacity }: { accent: string; opacity: number }) {
  return (
    <>
      {/* Frame tipis */}
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16, bottom: 16,
        border: `1px solid ${accent}`,
        opacity: (opacity / 100) * 0.3,
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 22, left: 22, right: 22, bottom: 22,
        border: `0.5px solid ${accent}`,
        opacity: (opacity / 100) * 0.15,
        pointerEvents: 'none',
      }} />
      {/* Corner squares */}
      {[
        { top: 12, left: 12 },
        { top: 12, right: 12 },
        { bottom: 12, left: 12 },
        { bottom: 12, right: 12 },
      ].map((pos, i) => (
        <div key={i} style={{
          position: 'absolute', ...pos, width: 16, height: 16,
          opacity: opacity / 100,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <polyline points="8,0 0,0 0,8" stroke={accent} strokeWidth="1.5" fill="none" strokeOpacity="0.8" />
          </svg>
        </div>
      ))}
    </>
  )
}

//  Rustic 
function RusticDecor({ accent, opacity }: { accent: string; opacity: number }) {
  return (
    <>
      {/* Rope-like top border */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 8, opacity: opacity / 100,
        background: `repeating-linear-gradient(90deg, ${accent}70, ${accent}70 8px, ${accent}30 8px, ${accent}30 12px)`,
      }} />
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 8, opacity: opacity / 100,
        background: `repeating-linear-gradient(90deg, ${accent}70, ${accent}70 8px, ${accent}30 8px, ${accent}30 12px)`,
      }} />
      {/* Corner dots */}
      {[
        { top: 16, left: 16 }, { top: 16, right: 16 },
        { bottom: 16, left: 16 }, { bottom: 16, right: 16 },
      ].map((pos, i) => (
        <div key={i} style={{ position: 'absolute', ...pos, opacity: opacity / 100 }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="6" stroke={accent} strokeWidth="1.5" fill="none" strokeOpacity="0.7" />
            <circle cx="10" cy="10" r="2.5" fill={accent} fillOpacity="0.6" />
          </svg>
        </div>
      ))}
    </>
  )
}

//  Main component 
export default function CoverDecorationLayer({ preset, accent, opacity = 70, animate = false }: Props) {
  if (!preset || preset === 'none') return null

  const content = preset === 'javanese' ? <JavaneseDecor accent={accent} opacity={opacity} /> :
                  preset === 'floral'   ? <FloralDecor   accent={accent} opacity={opacity} /> :
                  preset === 'modern'   ? <ModernDecor   accent={accent} opacity={opacity} /> :
                  preset === 'rustic'   ? <RusticDecor   accent={accent} opacity={opacity} /> : null

  if (!content) return null

  if (animate) {
    return (
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15, duration: 1 }}
      >
        {content}
      </motion.div>
    )
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {content}
    </div>
  )
}
