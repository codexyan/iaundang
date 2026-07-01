'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import type { OpeningConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import type { PositionMode } from '../OpeningScene'
import DecorationAssetLayer from '../DecorationAssetLayer'
import CoupleNameConnector from '../CoupleNameConnector'
import { getComponentStyle, btnStyle } from '@/lib/component-styles'
import { MailOpen } from 'lucide-react'

interface Props {
  config: OpeningConfig
  data: NewInvitationData
  meta: TemplateMeta
  onOpen: () => void
  positionMode?: PositionMode
  previewGuestName?: string
}

function getGuestName(): string | null {
  if (typeof window === 'undefined') return null
  return new URLSearchParams(window.location.search).get('to')
}

function sr(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

const PARTICLE_COUNT = 32

export default function GoldShimmerOpening({ config, data, meta, onOpen, positionMode = 'fixed', previewGuestName }: Props) {
  const { primary, accent, text } = meta.color_scheme
  const cs = getComponentStyle(meta.component_style)
  const pos = positionMode === 'fixed' ? 'fixed' : 'absolute'

  const [guestName] = useState(() => getGuestName() || previewGuestName || null)
  const [clicked, setClicked] = useState(false)

  const particles = useMemo(() => (
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id: i,
      x: sr(i * 7) * 100,
      size: 2 + sr(i * 11) * 3,
      delay: sr(i * 13) * 3,
      duration: 4 + sr(i * 17) * 4,
      opacity: 0.2 + sr(i * 19) * 0.5,
    }))
  ), [])

  function handleOpen() {
    if (clicked) return
    setClicked(true)
    setTimeout(onOpen, 500)
  }

  const greeting = config.subtitle || 'The Wedding of'
  const buttonText = config.button_text || 'Buka Undangan'
  const connectorStyle = config.couple_name_connector ?? 'ampersand'
  const connectorSize = config.couple_name_connector_size ?? 22

  return (
    <motion.div
      className={`${pos} inset-0 z-40 flex flex-col items-center justify-center overflow-hidden`}
      style={{ background: `radial-gradient(ellipse at center bottom, ${primary} 0%, #0a0a0a 100%)` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: clicked ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: clicked ? 0.4 : 0.8 }}
    >
      {/* Floating gold particles */}
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{ left: `${p.x}%`, bottom: 0, width: p.size, height: p.size, backgroundColor: accent }}
          initial={{ y: 0, opacity: 0 }}
          animate={{ y: [0, -800], opacity: [0, p.opacity, p.opacity, 0] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeOut' }}
        />
      ))}

      <DecorationAssetLayer assets={config.decoration_assets ?? []} animate />

      {/* Greeting */}
      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }}
        style={{
          color: `${accent}99`, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase',
          marginBottom: 20, fontFamily: `'${meta.font.body}', serif`, textAlign: 'center', maxWidth: 280,
        }}
      >
        {greeting}
      </motion.p>

      {/* Names with shimmer text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.8 }}
        className="text-center"
      >
        <h1 style={{
          fontSize: 38, fontWeight: 700, textAlign: 'center', margin: 0, lineHeight: 1.15,
          fontFamily: `'${meta.font.heading}', serif`,
          background: `linear-gradient(90deg, ${accent} 0%, #fff8e7 40%, ${accent} 60%, ${accent} 100%)`,
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          animation: 'goldShimmer 3s linear infinite',
        }}>
          {data.groom_name || 'Ahmad'}
        </h1>
        <div className="flex items-center justify-center my-3">
          <CoupleNameConnector style={connectorStyle} size={connectorSize} color={accent} fontFamily={`'${meta.font.heading}', serif`} primary={primary} />
        </div>
        <h1 style={{
          fontSize: 38, fontWeight: 700, textAlign: 'center', margin: 0, lineHeight: 1.15,
          fontFamily: `'${meta.font.heading}', serif`,
          background: `linear-gradient(90deg, ${accent} 0%, #fff8e7 40%, ${accent} 60%, ${accent} 100%)`,
          backgroundSize: '200% 100%',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          animation: 'goldShimmer 3s linear infinite',
        }}>
          {data.bride_name || 'Siti'}
        </h1>
      </motion.div>

      {/* Guest name */}
      {config.show_guest_name !== false && guestName && (
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2, duration: 0.6 }}
          style={{ marginTop: 22, color: `${text}cc`, fontSize: 13, fontFamily: `'${meta.font.heading}', serif`, textAlign: 'center' }}
        >
          <span style={{ display: 'block', fontSize: 8.5, letterSpacing: '0.3em', color: `${accent}bb`, marginBottom: 4 }}>
            {config.guest_label || 'KEPADA YTH.'}
          </span>
          {guestName}
        </motion.p>
      )}

      {/* Button */}
      <motion.button
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5, duration: 0.6 }}
        onClick={handleOpen}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        style={{
          ...btnStyle(cs.button, cs.border, accent, text, { icon: true }),
          marginTop: 48,
        }}
      >
        <MailOpen size={14} strokeWidth={1.8} />
        {buttonText}
      </motion.button>

      <style>{`@keyframes goldShimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }`}</style>
    </motion.div>
  )
}
