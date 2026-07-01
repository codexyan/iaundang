'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { OpeningConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import type { PositionMode } from '../OpeningScene'
import DecorationAssetLayer from '../DecorationAssetLayer'
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

export default function TypewriterOpening({ config, data, meta, onOpen, positionMode = 'fixed', previewGuestName }: Props) {
  const { primary, accent, text } = meta.color_scheme
  const cs = getComponentStyle(meta.component_style)
  const pos = positionMode === 'fixed' ? 'fixed' : 'absolute'

  const [guestName] = useState(() => getGuestName() || previewGuestName || null)
  const [clicked, setClicked] = useState(false)

  const groomName = data.groom_name || 'Ahmad'
  const brideName = data.bride_name || 'Siti'
  const fullText = `${groomName}  &  ${brideName}`

  const [displayed, setDisplayed] = useState('')
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < fullText.length) {
        setDisplayed(fullText.slice(0, i + 1))
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => setShowButton(true), 600)
      }
    }, 90)
    return () => clearInterval(interval)
  }, [fullText])

  function handleOpen() {
    if (clicked) return
    setClicked(true)
    setTimeout(onOpen, 500)
  }

  const greeting = config.subtitle || 'The Wedding of'
  const buttonText = config.button_text || 'Buka Undangan'

  return (
    <motion.div
      className={`${pos} inset-0 z-40 flex flex-col items-center justify-center overflow-hidden`}
      style={{ backgroundColor: primary }}
      initial={{ opacity: 0 }}
      animate={{ opacity: clicked ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: clicked ? 0.4 : 0.8 }}
    >
      {/* Subtle dot texture */}
      <div
        className="absolute inset-0"
        style={{
          opacity: 0.05,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <DecorationAssetLayer assets={config.decoration_assets ?? []} animate />

      {/* Greeting eyebrow */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        style={{
          color: `${accent}aa`, fontSize: 11, letterSpacing: '0.25em',
          textTransform: 'uppercase', marginBottom: 24,
          fontFamily: `'${meta.font.body}', serif`, textAlign: 'center', maxWidth: 280,
        }}
      >
        {greeting}
      </motion.p>

      {/* Typewriter names */}
      <div style={{ minHeight: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 24px' }}>
        <h1 style={{
          fontSize: 34, fontWeight: 700, color: text,
          fontFamily: `'${meta.font.heading}', serif`,
          letterSpacing: '0.06em', textAlign: 'center', lineHeight: 1.2, margin: 0,
        }}>
          {displayed}
          {displayed.length < fullText.length && (
            <span className="animate-pulse" style={{ color: accent, fontWeight: 300 }}>|</span>
          )}
        </h1>
      </div>

      {/* Guest name */}
      {config.show_guest_name !== false && guestName && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: showButton ? 1 : 0 }}
          transition={{ duration: 0.6 }}
          style={{
            marginTop: 20, color: `${text}cc`, fontSize: 13,
            fontFamily: `'${meta.font.heading}', serif`, textAlign: 'center',
          }}
        >
          <span style={{ display: 'block', fontSize: 8.5, letterSpacing: '0.3em', color: `${accent}bb`, marginBottom: 4 }}>
            {config.guest_label || 'KEPADA YTH.'}
          </span>
          {guestName}
        </motion.p>
      )}

      {/* Button */}
      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: showButton ? 1 : 0, y: showButton ? 0 : 16 }}
        transition={{ duration: 0.5 }}
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
    </motion.div>
  )
}
