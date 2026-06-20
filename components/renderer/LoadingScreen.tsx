'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { LoadingConfig, LoadingVariant } from '@/lib/types'

interface Props {
  config: LoadingConfig
  onDone: () => void
  isPreview?: boolean
}

const SPEED_MAP = { slow: 1.6, normal: 1, fast: 0.6 }

export default function LoadingScreen({ config, onDone, isPreview = false }: Props) {
  const [progress, setProgress] = useState(0)
  const duration = config.duration_ms ?? 1600
  const speed = SPEED_MAP[config.animation_speed ?? 'normal']
  const accent = config.accent_color ?? '#d4af37'
  const textColor = config.text_color ?? 'rgba(255,255,255,0.7)'
  const variant = config.variant ?? 'dual-ring'

  useEffect(() => {
    const timer = setTimeout(onDone, duration)
    return () => clearTimeout(timer)
  }, [onDone, duration])

  useEffect(() => {
    if (!config.show_progress) return
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) { clearInterval(interval); return 100 }
        return prev + 2
      })
    }, duration / 50)
    return () => clearInterval(interval)
  }, [config.show_progress, duration])

  const fontStyle = config.font_family ? { fontFamily: config.font_family } : {}
  const textSizeClass = config.text_size === 'lg' ? 'text-base' : config.text_size === 'sm' ? 'text-xs' : 'text-sm'

  return (
    <div
      className={`${isPreview ? 'absolute' : 'fixed'} inset-0 z-50 flex flex-col items-center justify-center overflow-hidden`}
      style={buildBgStyle(config)}
    >
      {config.bg_type === 'image' && config.bg_image_url && (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${config.bg_image_url})` }}
        />
      )}

      {config.bg_pattern && config.bg_pattern !== 'none' && (
        <PatternOverlay pattern={config.bg_pattern} accent={accent} />
      )}

      {(config.blur_background || config.bg_type === 'image') && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: config.background_color,
            opacity: config.overlay_opacity ?? 0.85,
            backdropFilter: config.blur_background ? 'blur(12px)' : undefined,
          }}
        />
      )}

      {config.logo_image && (
        <motion.img
          src={config.logo_image}
          alt="logo"
          className="h-14 mb-8 object-contain relative z-10"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        />
      )}

      <motion.div
        className="flex flex-col items-center gap-5 relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <VariantRenderer variant={variant} accent={accent} speed={speed} text={config.text} />

        {config.show_text !== false && (
          <p
            className={`${textSizeClass} tracking-[0.3em] uppercase`}
            style={{ color: textColor, ...fontStyle }}
          >
            {config.text}
          </p>
        )}

        {config.show_progress && (
          <div className="w-32 h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: accent }}
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        )}
      </motion.div>

      <Particles count={config.particle_count ?? 0} accent={accent} />
    </div>
  )
}

//  Background builder 

function buildBgStyle(config: LoadingConfig): React.CSSProperties {
  const base: React.CSSProperties = {}

  switch (config.bg_type) {
    case 'gradient':
      base.background = `linear-gradient(${config.bg_gradient_angle ?? 135}deg, ${config.bg_gradient_from ?? config.background_color} 0%, ${config.bg_gradient_to ?? '#000000'} 100%)`
      break
    case 'radial':
      base.background = `radial-gradient(ellipse at center, ${config.bg_gradient_from ?? config.background_color} 0%, ${config.bg_gradient_to ?? '#000000'} 100%)`
      break
    case 'image':
      base.backgroundColor = config.background_color
      break
    default:
      base.backgroundColor = config.background_color
      break
  }

  return base
}

//  Pattern Overlay 

function PatternOverlay({ pattern, accent }: { pattern: string; accent: string }) {
  const patternStyle = useMemo(() => {
    const c = `${accent}12`
    switch (pattern) {
      case 'dots':
        return {
          backgroundImage: `radial-gradient(${c} 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }
      case 'lines':
        return {
          backgroundImage: `repeating-linear-gradient(0deg, ${c}, ${c} 1px, transparent 1px, transparent 24px)`,
        }
      case 'cross':
        return {
          backgroundImage: `
            repeating-linear-gradient(0deg, ${c}, ${c} 1px, transparent 1px, transparent 24px),
            repeating-linear-gradient(90deg, ${c}, ${c} 1px, transparent 1px, transparent 24px)
          `,
        }
      case 'moroccan':
        return {
          backgroundImage: `
            radial-gradient(circle at 0% 50%, ${c} 9px, transparent 10px),
            radial-gradient(circle at 100% 50%, ${c} 9px, transparent 10px)
          `,
          backgroundSize: '40px 20px',
        }
      default:
        return {}
    }
  }, [pattern, accent])

  return <div className="absolute inset-0 z-[1]" style={patternStyle} />
}

//  Variant Renderer 

function VariantRenderer({ variant, accent, speed, text }: {
  variant: LoadingVariant; accent: string; speed: number; text: string
}) {
  const props = { accent, speed }
  switch (variant) {
    case 'dual-ring':        return <DualRingLoader {...props} />
    case 'heartbeat':        return <HeartbeatLoader {...props} />
    case 'elegant-spinner':  return <ElegantSpinnerLoader {...props} />
    case 'petal-cascade':    return <PetalCascadeLoader {...props} />
    case 'wave-dots':        return <WaveDotsLoader {...props} />
    case 'letter-reveal':    return <LetterRevealLoader {...props} text={text} />
    case 'arch-gate':        return <ArchGateLoader {...props} />
    case 'candle-glow':      return <CandleGlowLoader {...props} />
    case 'infinity-ribbon':  return <InfinityRibbonLoader {...props} />
    case 'shimmer-bar':      return <ShimmerBarLoader {...props} />
    case 'orbit-rings':      return <OrbitRingsLoader {...props} />
    case 'ripple-pulse':     return <RipplePulseLoader {...props} />
    case 'diamond-spin':     return <DiamondSpinLoader {...props} />
    case 'hourglass':        return <HourglassLoader {...props} />
    case 'crescent-moon':    return <CrescentMoonLoader {...props} />
    case 'spiral-gold':      return <SpiralGoldLoader {...props} />
    default:                 return <DualRingLoader {...props} />
  }
}

type LP = { accent: string; speed: number }

//  1. Dual Ring 

function DualRingLoader({ accent, speed }: LP) {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <motion.div
        className="absolute w-16 h-16 rounded-full border-2"
        style={{ borderColor: `${accent}30`, borderTopColor: accent }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.5 * speed, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-10 h-10 rounded-full border-2"
        style={{ borderColor: `${accent}15`, borderBottomColor: `${accent}90` }}
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 2 * speed, ease: 'linear' }}
      />
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}80` }}
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ repeat: Infinity, duration: 2 * speed }}
      />
    </div>
  )
}

//  2. Heartbeat 

function HeartbeatLoader({ accent, speed }: LP) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      className="w-10 h-10"
      fill="none"
      stroke={accent}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      animate={{ scale: [1, 1.2, 1, 1.12, 1] }}
      transition={{ repeat: Infinity, duration: 1.2 * speed, times: [0, 0.15, 0.35, 0.5, 0.7] }}
      style={{ filter: `drop-shadow(0 0 10px ${accent}50)` }}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" fill={`${accent}30`} />
    </motion.svg>
  )
}

//  3. Elegant Spinner 

function ElegantSpinnerLoader({ accent, speed }: LP) {
  const n = 12
  return (
    <div className="relative w-14 h-14">
      {Array.from({ length: n }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-0.5 h-3 rounded-full"
          style={{
            backgroundColor: accent,
            top: '50%', left: '50%',
            transformOrigin: '0 -14px',
            transform: `rotate(${(360 / n) * i}deg)`,
          }}
          animate={{ opacity: [0.15, 1, 0.15] }}
          transition={{ repeat: Infinity, duration: 1.2 * speed, delay: (i / n) * 1.2 * speed }}
        />
      ))}
    </div>
  )
}

//  4. Petal Cascade 

function PetalCascadeLoader({ accent, speed }: LP) {
  const petals = 6
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {Array.from({ length: petals }).map((_, i) => (
        <motion.svg
          key={i}
          viewBox="0 0 20 32"
          className="absolute w-3 h-5"
          style={{
            transformOrigin: '50% 100%',
            transform: `rotate(${(360 / petals) * i}deg) translateY(-10px)`,
          }}
          animate={{ scale: [0.3, 1, 0.3], opacity: [0.2, 0.7, 0.2] }}
          transition={{ repeat: Infinity, duration: 2.5 * speed, delay: (i / petals) * 2.5 * speed }}
        >
          <ellipse cx="10" cy="12" rx="8" ry="14" fill={accent} opacity="0.6" />
        </motion.svg>
      ))}
      <motion.div
        className="w-2.5 h-2.5 rounded-full z-10"
        style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }}
        animate={{ scale: [0.8, 1.3, 0.8] }}
        transition={{ repeat: Infinity, duration: 2 * speed }}
      />
    </div>
  )
}

//  5. Wave Dots 

function WaveDotsLoader({ accent, speed }: LP) {
  return (
    <div className="flex gap-2 items-end h-8">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1.5 rounded-full"
          style={{ backgroundColor: accent }}
          animate={{ height: ['6px', '22px', '6px'], opacity: [0.3, 1, 0.3] }}
          transition={{ repeat: Infinity, duration: 1 * speed, delay: i * 0.12 }}
        />
      ))}
    </div>
  )
}

//  6. Letter Reveal 

function LetterRevealLoader({ accent, speed, text }: LP & { text: string }) {
  const t = text.length > 20 ? text.slice(0, 20) : text
  return (
    <div className="flex gap-0.5 overflow-hidden">
      {t.split('').map((char, i) => (
        <motion.span
          key={i}
          className="text-lg font-light tracking-widest"
          style={{ color: accent }}
          animate={{ opacity: [0, 1, 1, 0], y: [16, 0, 0, -16] }}
          transition={{ repeat: Infinity, duration: 2.5 * speed, delay: i * 0.07, times: [0, 0.2, 0.7, 1] }}
        >
          {char === ' ' ? ' ' : char}
        </motion.span>
      ))}
    </div>
  )
}

//  7. Arch Gate 

function ArchGateLoader({ accent, speed }: LP) {
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg viewBox="0 0 80 80" className="w-20 h-20" fill="none">
        <motion.path
          d="M15 70 V40 A25 25 0 0 1 40 15"
          stroke={accent} strokeWidth="2" strokeLinecap="round"
          animate={{ pathLength: [0, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 * speed, repeatType: 'reverse', ease: 'easeInOut' }}
        />
        <motion.path
          d="M65 70 V40 A25 25 0 0 0 40 15"
          stroke={accent} strokeWidth="2" strokeLinecap="round"
          animate={{ pathLength: [0, 1] }}
          transition={{ repeat: Infinity, duration: 1.8 * speed, repeatType: 'reverse', ease: 'easeInOut', delay: 0.15 }}
        />
      </svg>
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
        animate={{ opacity: [0, 1, 0], scale: [0.5, 1.5, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.5 * speed }}
      />
    </div>
  )
}

//  8. Candle Glow 

function CandleGlowLoader({ accent, speed }: LP) {
  return (
    <div className="relative w-12 h-20 flex flex-col items-center justify-end">
      <motion.div
        className="absolute top-0 w-12 h-12 rounded-full"
        style={{ background: `radial-gradient(circle, ${accent}25, transparent 70%)` }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ repeat: Infinity, duration: 2 * speed }}
      />
      <motion.svg viewBox="0 0 24 36" className="w-5 h-8 mb-1" style={{ filter: `drop-shadow(0 0 8px ${accent}60)` }}>
        <motion.ellipse
          cx="12" cy="14" rx="6" ry="12"
          fill={`url(#flame-${accent.replace('#', '')})`}
          animate={{
            rx: [6, 5, 6.5, 5.5, 6],
            ry: [12, 13, 11, 12.5, 12],
          }}
          transition={{ repeat: Infinity, duration: 1.5 * speed }}
        />
        <defs>
          <linearGradient id={`flame-${accent.replace('#', '')}`} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={accent} />
            <stop offset="50%" stopColor="#ff9500" />
            <stop offset="100%" stopColor="#ffe8b0" />
          </linearGradient>
        </defs>
      </motion.svg>
      <div className="w-2.5 h-5 rounded-b-sm" style={{ backgroundColor: `${accent}30` }} />
    </div>
  )
}

//  9. Infinity Ribbon 

function InfinityRibbonLoader({ accent, speed }: LP) {
  return (
    <div className="relative w-24 h-12 flex items-center justify-center">
      <svg viewBox="0 0 100 50" className="w-24 h-12" fill="none">
        <motion.path
          d="M25 25 C25 10, 50 10, 50 25 C50 40, 75 40, 75 25 C75 10, 50 10, 50 25 C50 40, 25 40, 25 25Z"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="200"
          animate={{ strokeDashoffset: [200, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 * speed, ease: 'linear' }}
        />
      </svg>
    </div>
  )
}

//  10. Shimmer Bar 

function ShimmerBarLoader({ accent, speed }: LP) {
  return (
    <div className="w-40 flex flex-col items-center gap-3">
      <div className="w-full h-[2px] rounded-full overflow-hidden" style={{ backgroundColor: `${accent}15` }}>
        <motion.div
          className="h-full w-1/3 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)` }}
          animate={{ x: ['-100%', '400%'] }}
          transition={{ repeat: Infinity, duration: 1.5 * speed, ease: 'easeInOut' }}
        />
      </div>
      <div className="w-24 h-px rounded-full overflow-hidden" style={{ backgroundColor: `${accent}08` }}>
        <motion.div
          className="h-full w-1/2 rounded-full"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}50, transparent)` }}
          animate={{ x: ['-100%', '300%'] }}
          transition={{ repeat: Infinity, duration: 2 * speed, ease: 'easeInOut', delay: 0.3 }}
        />
      </div>
    </div>
  )
}

//  11. Orbit Rings 

function OrbitRingsLoader({ accent, speed }: LP) {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border"
          style={{
            borderColor: `${accent}${30 - i * 8}`,
            width: `${56 - i * 12}px`,
            height: `${56 - i * 12}px`,
          }}
          animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
          transition={{ repeat: Infinity, duration: (2.5 + i * 0.8) * speed, ease: 'linear' }}
        >
          <div
            className="absolute rounded-full"
            style={{
              width: `${6 - i}px`, height: `${6 - i}px`,
              backgroundColor: accent,
              boxShadow: `0 0 6px ${accent}`,
              top: '-3px', left: '50%', transform: 'translateX(-50%)',
            }}
          />
        </motion.div>
      ))}
      <motion.div
        className="w-2 h-2 rounded-full"
        style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}` }}
        animate={{ scale: [1, 1.4, 1] }}
        transition={{ repeat: Infinity, duration: 2 * speed }}
      />
    </div>
  )
}

//  12. Ripple Pulse 

function RipplePulseLoader({ accent, speed }: LP) {
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{ width: 48, height: 48, border: `1px solid ${accent}` }}
          animate={{ scale: [1, 2], opacity: [0.5, 0] }}
          transition={{ repeat: Infinity, duration: 2 * speed, delay: i * 0.5 }}
        />
      ))}
      <motion.div
        className="w-3 h-3 rounded-full"
        style={{ backgroundColor: accent }}
        animate={{ scale: [0.85, 1.1, 0.85] }}
        transition={{ repeat: Infinity, duration: 1.5 * speed }}
      />
    </div>
  )
}

//  13. Diamond Spin 

function DiamondSpinLoader({ accent, speed }: LP) {
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <motion.svg
        viewBox="0 0 48 48"
        className="w-12 h-12"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 3 * speed, ease: 'linear' }}
      >
        <motion.path
          d="M24 4 L44 24 L24 44 L4 24 Z"
          stroke={accent}
          strokeWidth="1.5"
          strokeLinejoin="round"
          animate={{ pathLength: [0, 1, 0] }}
          transition={{ repeat: Infinity, duration: 2 * speed, ease: 'easeInOut' }}
        />
      </motion.svg>
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: accent, boxShadow: `0 0 6px ${accent}` }}
        animate={{ scale: [1, 1.6, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 * speed }}
      />
    </div>
  )
}

//  14. Hourglass 

function HourglassLoader({ accent, speed }: LP) {
  return (
    <motion.svg
      viewBox="0 0 40 56"
      className="w-8 h-12"
      fill="none"
      style={{ filter: `drop-shadow(0 0 6px ${accent}40)` }}
      animate={{ rotate: [0, 0, 180, 180] }}
      transition={{ repeat: Infinity, duration: 2.5 * speed, times: [0, 0.4, 0.5, 1] }}
    >
      <path d="M6 4 H34 L20 24 Z" stroke={accent} strokeWidth="1.5" fill={`${accent}15`} />
      <path d="M6 52 H34 L20 32 Z" stroke={accent} strokeWidth="1.5" fill={`${accent}15`} />
      <motion.line
        x1="20" y1="24" x2="20" y2="32"
        stroke={accent} strokeWidth="1.5" strokeLinecap="round"
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ repeat: Infinity, duration: 1 * speed }}
      />
      <line x1="4" y1="4" x2="36" y2="4" stroke={accent} strokeWidth="2" strokeLinecap="round" />
      <line x1="4" y1="52" x2="36" y2="52" stroke={accent} strokeWidth="2" strokeLinecap="round" />
    </motion.svg>
  )
}

//  15. Crescent Moon 

function CrescentMoonLoader({ accent, speed }: LP) {
  return (
    <div className="relative w-14 h-14 flex items-center justify-center">
      <motion.svg
        viewBox="0 0 48 48"
        className="w-12 h-12"
        fill="none"
        animate={{ rotate: [0, 15, -15, 0] }}
        transition={{ repeat: Infinity, duration: 3 * speed, ease: 'easeInOut' }}
        style={{ filter: `drop-shadow(0 0 8px ${accent}50)` }}
      >
        <path
          d="M30 6 A18 18 0 1 0 30 42 A14 14 0 1 1 30 6Z"
          fill={`${accent}20`} stroke={accent} strokeWidth="1.5"
        />
      </motion.svg>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full"
          style={{
            backgroundColor: accent,
            top: `${15 + i * 8}%`,
            right: `${20 + i * 10}%`,
          }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 * speed, delay: i * 0.4 }}
        />
      ))}
    </div>
  )
}

//  16. Spiral Gold 

function SpiralGoldLoader({ accent, speed }: LP) {
  return (
    <div className="relative w-16 h-16 flex items-center justify-center">
      <motion.svg
        viewBox="0 0 64 64"
        className="w-16 h-16"
        fill="none"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 4 * speed, ease: 'linear' }}
      >
        <motion.path
          d="M32 8 A8 8 0 0 1 40 16 A12 12 0 0 1 28 28 A16 16 0 0 1 16 12 A20 20 0 0 1 36 -4 A24 24 0 0 1 56 20"
          stroke={accent}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray="160"
          animate={{ strokeDashoffset: [160, 0] }}
          transition={{ repeat: Infinity, duration: 3 * speed, ease: 'linear' }}
        />
      </motion.svg>
      <motion.div
        className="absolute w-2 h-2 rounded-full"
        style={{ backgroundColor: accent, boxShadow: `0 0 8px ${accent}` }}
        animate={{ scale: [0.8, 1.3, 0.8] }}
        transition={{ repeat: Infinity, duration: 1.5 * speed }}
      />
    </div>
  )
}

//  Particles Background 

function Particles({ count, accent }: { count: number; accent: string }) {
  const particles = useMemo(() =>
    Array.from({ length: Math.min(count, 30) }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 3 + Math.random() * 4,
      size: 1.5 + Math.random() * 2.5,
    })),
    [count]
  )

  if (count <= 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            width: p.size, height: p.size,
            backgroundColor: accent,
            left: `${p.x}%`,
            bottom: '-5%',
          }}
          animate={{ y: '-120vh', opacity: [0, 0.5, 0], x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 60] }}
          transition={{ repeat: Infinity, duration: p.duration, delay: p.delay, ease: 'easeOut' }}
        />
      ))}
    </div>
  )
}
