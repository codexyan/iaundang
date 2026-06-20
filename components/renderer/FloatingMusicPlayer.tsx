'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ColorScheme, MusicConfig } from '@/lib/types'

interface Props {
  config: MusicConfig
  musicUrlOverride?: string
  musicTitleOverride?: string
  colors: ColorScheme
  /** Visual-only mode   no audio, absolute positioning */
  static?: boolean
  /** Absolute positioning with real audio playback (for fullscreen preview) */
  contained?: boolean
}

const positionMap = {
  'bottom-right': 'bottom-5 right-4',
  'bottom-left': 'bottom-5 left-4',
  'bottom-center': 'bottom-5 left-1/2 -translate-x-1/2',
  'top-right': 'top-5 right-4',
}

const sizeMap = {
  sm: { btn: 'w-8 h-8', bar: 'h-2.5', barW: 'w-[2px]', titleMax: 'max-w-[110px]', titleSize: 'text-[8px]' },
  md: { btn: 'w-10 h-10', bar: 'h-3.5', barW: 'w-[2.5px]', titleMax: 'max-w-[140px]', titleSize: 'text-[9px]' },
  lg: { btn: 'w-12 h-12', bar: 'h-4', barW: 'w-[3px]', titleMax: 'max-w-[170px]', titleSize: 'text-[10px]' },
}

const animationVariants = {
  'fade-slide': { initial: { opacity: 0, y: 20, scale: 0.9 }, animate: { opacity: 1, y: 0, scale: 1 } },
  'scale-bounce': { initial: { opacity: 0, scale: 0 }, animate: { opacity: 1, scale: 1 } },
  'slide-up': { initial: { opacity: 0, y: 40 }, animate: { opacity: 1, y: 0 } },
  'none': { initial: { opacity: 1 }, animate: { opacity: 1 } },
}

export default function FloatingMusicPlayer({ config, musicUrlOverride, musicTitleOverride, colors, static: isStatic, contained }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [ready, setReady] = useState(!!isStatic || !!contained)
  const [userInteracted, setUserInteracted] = useState(false)
  const triedAutoplay = useRef(false)
  const noAudio = isStatic && !contained

  const musicUrl = musicUrlOverride || config.url || ''
  const musicTitle = musicTitleOverride || config.title || 'Background Music'
  const style = config.player_style || 'pill'
  const position = config.player_position || 'bottom-right'
  const animation = config.player_animation || 'fade-slide'
  const size = config.player_size || 'md'
  const showTitle = config.show_title !== false
  const volume = config.volume ?? 0.3
  const loop = config.loop !== false

  const s = sizeMap[size]
  const anim = animationVariants[animation]
  const posClass = positionMap[position]

  const tryPlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio || playing) return
    audio.play().then(() => {
      setPlaying(true)
      setReady(true)
    }).catch(() => {
      setReady(true)
    })
  }, [playing])

  useEffect(() => {
    if (!musicUrl || noAudio) return
    const audio = new Audio(musicUrl)
    audio.loop = loop
    audio.volume = volume
    audio.preload = 'auto'
    audioRef.current = audio

    const showPlayer = () => { setReady(true) }

    audio.addEventListener('error', showPlayer, { once: true })
    const fallbackTimer = setTimeout(showPlayer, 2000)

    if (config.autoplay) {
      audio.addEventListener('canplaythrough', () => {
        clearTimeout(fallbackTimer)
        if (!triedAutoplay.current) {
          triedAutoplay.current = true
          audio.play().then(() => {
            setPlaying(true)
            setReady(true)
            setUserInteracted(true)
          }).catch(() => {
            setReady(true)
          })
        }
      }, { once: true })
    } else {
      clearTimeout(fallbackTimer)
      setReady(true)
    }

    return () => {
      clearTimeout(fallbackTimer)
      audio.removeEventListener('error', showPlayer)
      audio.pause()
      audio.src = ''
      audioRef.current = null
    }
  }, [musicUrl, noAudio, config.autoplay, volume, loop])

  useEffect(() => {
    if (userInteracted || !ready || playing || noAudio || !config.autoplay) return

    function onInteraction() {
      setUserInteracted(true)
      tryPlay()
      cleanup()
    }

    function cleanup() {
      document.removeEventListener('touchstart', onInteraction)
      document.removeEventListener('click', onInteraction)
      document.removeEventListener('scroll', onInteraction, true)
    }

    document.addEventListener('touchstart', onInteraction, { once: true, passive: true })
    document.addEventListener('click', onInteraction, { once: true })
    document.addEventListener('scroll', onInteraction, { once: true, capture: true, passive: true })

    return cleanup
  }, [userInteracted, ready, playing, tryPlay, isStatic, noAudio, config.autoplay])

  function toggle() {
    if (noAudio) {
      setPlaying(!playing)
      return
    }
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(() => {})
    }
    setUserInteracted(true)
  }

  if (!config.enabled) return null
  if (!musicUrl && !isStatic) return null

  const { accent, primary, text } = colors
  const isVinyl = style === 'vinyl'

  const EqBars = () => (
    <div className={`flex items-end gap-[2px] ${s.bar}`}>
      {[0, 0.15, 0.3, 0.1].map((delay, i) => (
        <motion.div
          key={i}
          className={`${s.barW} rounded-full`}
          style={{ backgroundColor: accent }}
          animate={playing ? { height: ['4px', '14px', '6px', '12px', '4px'] } : { height: '4px' }}
          transition={{ duration: 1.2, repeat: Infinity, delay, ease: 'easeInOut' }}
        />
      ))}
    </div>
  )

  const PlayIcon = () => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3 1.5L12 7L3 12.5V1.5Z" fill={accent} />
    </svg>
  )

  const PulseRing = () => (
    !playing ? (
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ border: `1.5px solid ${accent}` }}
        animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
    ) : null
  )

  const renderCircle = () => (
    <button
      onClick={toggle}
      className={`relative ${s.btn} rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90`}
      style={{
        backgroundColor: `${primary}dd`,
        border: `1.5px solid ${accent}66`,
        boxShadow: `0 2px 16px ${primary}88`,
      }}
    >
      <PulseRing />
      {playing ? <EqBars /> : <PlayIcon />}
    </button>
  )

  const renderVinyl = () => (
    <button
      onClick={toggle}
      className={`relative ${s.btn} rounded-full flex items-center justify-center backdrop-blur-md transition-transform active:scale-90 overflow-hidden`}
      style={{
        backgroundColor: `${primary}ee`,
        border: `1.5px solid ${accent}66`,
        boxShadow: `0 2px 16px ${primary}88`,
      }}
    >
      <PulseRing />
      <motion.div
        animate={playing ? { rotate: 360 } : { rotate: 0 }}
        transition={playing ? { duration: 3, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
        className="flex items-center justify-center"
      >
        <div className="rounded-full flex items-center justify-center"
          style={{
            width: size === 'sm' ? 24 : size === 'md' ? 30 : 36,
            height: size === 'sm' ? 24 : size === 'md' ? 30 : 36,
            background: `conic-gradient(${accent}44, ${primary}, ${accent}44, ${primary}, ${accent}44)`,
          }}
        >
          <div className="rounded-full" style={{
            width: size === 'sm' ? 6 : size === 'md' ? 8 : 10,
            height: size === 'sm' ? 6 : size === 'md' ? 8 : 10,
            backgroundColor: accent,
          }} />
        </div>
      </motion.div>
    </button>
  )

  const renderMinimal = () => (
    <button
      onClick={toggle}
      className="flex items-center gap-1.5 transition-transform active:scale-95"
      style={{ color: accent }}
    >
      {playing ? <EqBars /> : <PlayIcon />}
    </button>
  )

  const renderPill = () => (
    <>
      {showTitle && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
          className={`${s.titleMax} px-3 py-1.5 rounded-full backdrop-blur-md`}
          style={{
            backgroundColor: `${primary}cc`,
            border: `1px solid ${accent}33`,
          }}
        >
          <p className={`${s.titleSize} truncate`}
            style={{ color: `${text}bb`, fontFamily: 'system-ui, sans-serif', letterSpacing: '0.02em' }}>
            {playing ? '♪ ' : ''}{musicTitle}
          </p>
        </motion.div>
      )}
      {renderCircle()}
    </>
  )

  const renderPlayer = () => {
    switch (style) {
      case 'vinyl': return <>{showTitle && renderPill()}{renderVinyl()}</>
      case 'circle': return renderCircle()
      case 'minimal': return renderMinimal()
      case 'pill':
      default: return renderPill()
    }
  }

  const posType = (isStatic || contained) ? 'absolute' : 'fixed'

  return (
    <AnimatePresence>
      {ready && (
        <motion.div
          initial={anim.initial}
          animate={anim.animate}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ delay: (isStatic || contained) ? 0 : 0.8, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className={`${posClass} z-50 flex items-center gap-2`}
          style={{ position: posType, pointerEvents: 'auto' }}
        >
          {renderPlayer()}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
