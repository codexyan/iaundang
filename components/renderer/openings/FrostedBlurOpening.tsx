'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { OpeningConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import type { PositionMode } from '../OpeningScene'
import DecorationAssetLayer from '../DecorationAssetLayer'
import CoupleNameConnector from '../CoupleNameConnector'
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

export default function FrostedBlurOpening({ config, data, meta, onOpen, positionMode = 'fixed', previewGuestName }: Props) {
  const { primary, accent, text } = meta.color_scheme
  const pos = positionMode === 'fixed' ? 'fixed' : 'absolute'

  const [guestName] = useState(() => getGuestName() || previewGuestName || null)
  const [clicked, setClicked] = useState(false)

  const bgPhoto = config.cover_photo_url || config.background_image
  const greeting = config.subtitle || 'The Wedding of'
  const buttonText = config.button_text || 'Buka Undangan'
  const connectorStyle = config.couple_name_connector ?? 'ampersand'
  const connectorSize = config.couple_name_connector_size ?? 20

  function handleOpen() {
    if (clicked) return
    setClicked(true)
    setTimeout(onOpen, 600)
  }

  return (
    <motion.div
      className={`${pos} inset-0 z-40 overflow-hidden`}
      style={{ backgroundColor: primary }}
      initial={{ opacity: 0 }}
      animate={{ opacity: clicked ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: clicked ? 0.5 : 0.8 }}
    >
      {/* Background photo: starts blurred, clears */}
      {bgPhoto && (
        <motion.div
          className="absolute inset-0"
          style={{ backgroundImage: `url(${bgPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          initial={{ filter: 'blur(40px) brightness(0.7)', scale: 1.15 }}
          animate={{ filter: 'blur(0px) brightness(0.5)', scale: 1 }}
          transition={{ duration: 2.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        />
      )}
      {!bgPhoto && (
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${primary} 0%, #0a0a0a 100%)` }} />
      )}

      <div className="absolute inset-0 flex flex-col items-center justify-end" style={{ paddingBottom: 64 }}>
        <DecorationAssetLayer assets={config.decoration_assets ?? []} animate />

        {/* Frosted glass card */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: `${primary}99`,
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: `1px solid ${accent}33`,
            borderRadius: 24,
            padding: '32px 36px',
            textAlign: 'center',
            maxWidth: 300,
            width: '85%',
          }}
        >
          <p style={{ color: `${accent}99`, fontSize: 9, letterSpacing: '0.25em', textTransform: 'uppercase', marginBottom: 12, fontFamily: `'${meta.font.body}', serif` }}>
            {greeting}
          </p>

          {config.show_guest_name !== false && guestName && (
            <p style={{ color: `${text}cc`, fontSize: 12, marginBottom: 14, fontFamily: `'${meta.font.heading}', serif` }}>
              <span style={{ display: 'block', fontSize: 8, letterSpacing: '0.3em', color: `${accent}bb`, marginBottom: 3 }}>
                {config.guest_label || 'KEPADA YTH.'}
              </span>
              {guestName}
            </p>
          )}

          <h1 style={{ fontSize: 30, fontWeight: 700, color: text, fontFamily: `'${meta.font.heading}', serif`, lineHeight: 1.25, margin: 0 }}>
            {data.groom_name || 'Ahmad'}
          </h1>
          <div className="flex items-center justify-center my-2">
            <CoupleNameConnector style={connectorStyle} size={connectorSize} color={accent} fontFamily={`'${meta.font.heading}', serif`} primary={primary} />
          </div>
          <h1 style={{ fontSize: 30, fontWeight: 700, color: text, fontFamily: `'${meta.font.heading}', serif`, lineHeight: 1.25, margin: 0 }}>
            {data.bride_name || 'Siti'}
          </h1>

          <button
            onClick={handleOpen}
            style={{
              marginTop: 24, padding: '10px 28px', border: `1px solid ${accent}88`,
              borderRadius: 32, color: accent, fontSize: 10, letterSpacing: '0.18em',
              textTransform: 'uppercase', backgroundColor: 'transparent', cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', gap: 7,
            }}
          >
            <MailOpen size={13} strokeWidth={1.8} />
            {buttonText}
          </button>
        </motion.div>
      </div>
    </motion.div>
  )
}
