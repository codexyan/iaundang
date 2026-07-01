'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { OpeningConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import type { PositionMode } from '../OpeningScene'
import DecorationAssetLayer from '../DecorationAssetLayer'
import CoupleNameConnector from '../CoupleNameConnector'
import SeparatorOrnament from '../SeparatorOrnament'
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

export default function ParallaxSplitOpening({ config, data, meta, onOpen, positionMode = 'fixed', previewGuestName }: Props) {
  const { primary, accent, text } = meta.color_scheme
  const cs = getComponentStyle(meta.component_style)
  const pos = positionMode === 'fixed' ? 'fixed' : 'absolute'

  const [guestName] = useState(() => getGuestName() || previewGuestName || null)
  const [clicked, setClicked] = useState(false)

  const bgPhoto = config.cover_photo_url || config.background_image
  const greeting = config.subtitle || 'The Wedding of'
  const buttonText = config.button_text || 'Buka Undangan'
  const sepStyle = config.separator_style ?? 'diamond'
  const connectorStyle = config.couple_name_connector ?? 'ampersand'
  const connectorSize = config.couple_name_connector_size ?? 22

  function handleOpen() {
    if (clicked) return
    setClicked(true)
    setTimeout(onOpen, 600)
  }

  const splitEase = [0.76, 0, 0.24, 1] as const

  return (
    <div className={`${pos} inset-0 z-40 overflow-hidden`} style={{ backgroundColor: '#000' }}>
      {/* Background photo revealed behind the split */}
      {bgPhoto ? (
        <div className="absolute inset-0" style={{ backgroundImage: `url(${bgPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
      ) : (
        <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${primary} 0%, #0a0a0a 100%)` }} />
      )}
      <div className="absolute inset-0" style={{ backgroundColor: `${primary}55` }} />

      {/* Top panel slides up */}
      <motion.div
        className="absolute top-0 left-0 right-0"
        style={{ height: '50%', backgroundColor: primary, borderBottom: `1px solid ${accent}33` }}
        initial={{ y: 0 }}
        animate={{ y: clicked ? '-100%' : 0 }}
        transition={{ duration: 1.1, ease: splitEase }}
      />

      {/* Bottom panel slides down */}
      <motion.div
        className="absolute bottom-0 left-0 right-0"
        style={{ height: '50%', backgroundColor: primary, borderTop: `1px solid ${accent}33` }}
        initial={{ y: 0 }}
        animate={{ y: clicked ? '100%' : 0 }}
        transition={{ duration: 1.1, ease: splitEase }}
      />

      {/* Centered content over the seam, fades out on open */}
      <motion.div
        className="absolute inset-0 z-20 flex flex-col items-center justify-center px-8 text-center"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: clicked ? 0 : 1, y: clicked ? 16 : 0 }}
        transition={{ duration: clicked ? 0.4 : 0.9, delay: clicked ? 0 : 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <DecorationAssetLayer assets={config.decoration_assets ?? []} animate />

        <p style={{ color: `${accent}aa`, fontSize: 10, letterSpacing: '0.3em', textTransform: 'uppercase', marginBottom: 16, fontFamily: `'${meta.font.body}', serif` }}>
          {greeting}
        </p>

        <div className="mb-4">
          <SeparatorOrnament style={sepStyle} accent={accent} primary={primary} width={140} />
        </div>

        <h1 style={{ fontSize: 34, fontWeight: 800, color: text, fontFamily: `'${meta.font.heading}', serif`, lineHeight: 1.1, margin: 0, letterSpacing: '0.04em' }}>
          {data.groom_name || 'Ahmad'}
        </h1>
        <div className="flex items-center justify-center my-2.5">
          <CoupleNameConnector style={connectorStyle} size={connectorSize} color={accent} fontFamily={`'${meta.font.heading}', serif`} primary={primary} />
        </div>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: text, fontFamily: `'${meta.font.heading}', serif`, lineHeight: 1.1, margin: 0, letterSpacing: '0.04em' }}>
          {data.bride_name || 'Siti'}
        </h1>

        {config.show_guest_name !== false && guestName && (
          <p style={{ marginTop: 18, color: `${text}cc`, fontSize: 12, fontFamily: `'${meta.font.heading}', serif` }}>
            <span style={{ display: 'block', fontSize: 8.5, letterSpacing: '0.3em', color: `${accent}bb`, marginBottom: 3 }}>
              {config.guest_label || 'KEPADA YTH.'}
            </span>
            {guestName}
          </p>
        )}

        <motion.button
          onClick={handleOpen}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          style={{
            ...btnStyle(cs.button, cs.border, accent, text, { icon: true }),
            marginTop: 36,
          }}
        >
          <MailOpen size={14} strokeWidth={1.8} />
          {buttonText}
        </motion.button>
      </motion.div>
    </div>
  )
}
