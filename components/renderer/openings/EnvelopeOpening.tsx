'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import type { OpeningConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import type { PositionMode } from '../OpeningScene'
import DecorationAssetLayer from '../DecorationAssetLayer'
import { getComponentStyle, btnStyle } from '@/lib/component-styles'
import SeparatorOrnament from '../SeparatorOrnament'
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

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: 'numeric', month: 'long', year: 'numeric',
    })
  } catch { return '' }
}

export default function EnvelopeOpening({ config, data, meta, onOpen, positionMode = 'fixed', previewGuestName }: Props) {
  const [guestName] = useState(() => getGuestName() || previewGuestName || null)
  const [clicked, setClicked] = useState(false)
  const { primary, accent, text } = meta.color_scheme
  const cs = getComponentStyle(meta.component_style)
  const pos = positionMode === 'fixed' ? 'fixed' : 'absolute'

  function handleOpen() {
    if (clicked) return
    setClicked(true)
    onOpen()
  }

  const greeting   = config.subtitle ?? "Assalamu'alaikum Warahmatullahi Wabarakatuh"
  const buttonText = config.button_text ?? 'Buka Undangan'
  const inviteText = config.invitation_text ??
    'Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara pernikahan kami.'
  const showGuest  = config.show_guest_name !== false
  const bgPhoto    = config.cover_photo_url || config.background_image
  const bgOpacity  = (config.cover_photo_opacity ?? 30) / 100
  const bgPos      = config.cover_photo_position ?? 'center'
  const display    = config.cover_photo_display ?? 'background'
  const gradH      = config.cover_gradient_height ?? 75
  const gradStop   = Math.round(gradH * 0.6)
  const gradColor  = config.cover_gradient_color ?? primary
  const nameFontSize = config.couple_name_font_size ?? 32
  const nameSpacing = config.couple_name_letter_spacing ?? 0.08
  const nameTransform = config.couple_name_text_transform ?? (config.couple_name_uppercase !== false ? 'uppercase' : 'none')
  const btnSize = config.button_size ?? 'lg'
  const padX = config.content_padding_x ?? 28
  const padBottom = config.content_padding_bottom ?? 48
  const greetingSize = config.greeting_font_size ?? 11
  const guestLabel = config.guest_label ?? 'KEPADA YTH.'
  const guestLabelSize = config.guest_label_font_size ?? 8.5
  const showTopSep = config.show_top_separator !== false
  const showBottomSep = config.show_bottom_separator !== false
  const sepStyle = config.separator_style ?? 'diamond'
  const connectorStyle = config.couple_name_connector ?? 'ampersand'
  const connectorSize = config.couple_name_connector_size ?? 26
  const eventDate  = formatDate(data.akad?.date ?? data.resepsi?.date)

  const ease = [0.22, 0.68, 0.36, 1] as const

  return (
    <motion.div
      className={`${pos} inset-0 z-40 flex flex-col overflow-hidden`}
      style={{ backgroundColor: primary, pointerEvents: clicked ? 'none' : undefined }}
      initial={{ opacity: 0 }}
      animate={{ opacity: clicked ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: clicked ? 0.6 : 0.8 }}
    >
      {/* Background photo */}
      {bgPhoto && display === 'background' && (
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 12, ease: 'easeOut' }}
          style={{
            backgroundImage: `url(${bgPhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: bgPos,
            opacity: bgOpacity,
          }}
        />
      )}

      {/* Dark scrim */}
      <div className="absolute inset-0 z-[2]" style={{ backgroundColor: `${primary}77` }} />

      {/* Bottom gradient */}
      <div className="absolute inset-x-0 bottom-0 z-[5]" style={{
        height: `${gradH}%`,
        background: `linear-gradient(to top,
          ${gradColor} 0%,
          ${gradColor}f7 ${Math.round(gradStop * 0.3)}%,
          ${gradColor}dd ${Math.round(gradStop * 0.5)}%,
          ${gradColor}99 ${Math.round(gradStop * 0.7)}%,
          ${gradColor}44 ${Math.round(gradStop * 0.9)}%,
          transparent 100%
        )`,
      }} />

      {/* Decoration assets */}
      <DecorationAssetLayer assets={config.decoration_assets ?? []} animate />

      {/* ── Envelope visual — centered hero ── */}
      <div className="absolute inset-0 z-[8] flex items-center justify-center pointer-events-none"
        style={{ paddingBottom: '18%' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.7, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 1.4, ease }}
          style={{ position: 'relative', width: 260, height: 180 }}
        >
          {/* Envelope body */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 130,
            border: `1.5px solid ${accent}55`,
            borderRadius: 6,
            background: `linear-gradient(145deg, ${primary}22, ${primary}44)`,
            backdropFilter: 'blur(8px)',
            boxShadow: `0 8px 40px ${primary}88, 0 2px 20px ${accent}15, inset 0 1px 0 ${accent}22`,
          }} />

          {/* Inner V-fold lines */}
          <svg style={{ position: 'absolute', bottom: 0, left: 0, width: 260, height: 130 }} viewBox="0 0 260 130" fill="none">
            <path d="M1 1 L130 80 L259 1" stroke={accent} strokeWidth="0.6" strokeOpacity="0.3" />
          </svg>

          {/* Flap — animated open */}
          <motion.div
            initial={{ rotateX: 0 }}
            animate={{ rotateX: clicked ? 180 : 0 }}
            transition={{ delay: 0.5, duration: 1.2, ease }}
            style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 90,
              transformOrigin: 'top center',
              perspective: 600,
            }}
          >
            <svg width="260" height="90" viewBox="0 0 260 90" fill="none">
              <path d="M1 0 L130 88 L259 0 Z"
                stroke={accent} strokeWidth="1.2" fill={`${primary}33`} />
            </svg>
          </motion.div>

          {/* Wax seal */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 0.8, type: 'spring', damping: 12 }}
            style={{
              position: 'absolute',
              bottom: 88, left: '50%', transform: 'translateX(-50%)',
              width: 40, height: 40, borderRadius: '50%',
              background: `radial-gradient(circle at 40% 35%, ${accent}, ${accent}cc)`,
              boxShadow: `0 3px 16px ${accent}44, 0 1px 4px rgba(0,0,0,0.3)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 5,
            }}
          >
            <span style={{
              fontSize: 14, fontWeight: 700, color: primary,
              fontFamily: `'${meta.font.heading}', serif`,
              textShadow: `0 1px 2px ${accent}44`,
              lineHeight: 1,
            }}>
              {(data.groom_name?.[0] ?? '').toUpperCase()}{(data.bride_name?.[0] ?? '').toUpperCase()}
            </span>
          </motion.div>

          {/* Letter rising from envelope */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: -60, opacity: 1 }}
            transition={{ delay: 1.3, duration: 1.2, ease }}
            style={{
              position: 'absolute',
              bottom: 20, left: 20, right: 20,
              height: 100,
              background: `linear-gradient(to bottom, ${text}0d, transparent)`,
              borderRadius: '4px 4px 0 0',
              border: `0.5px solid ${accent}22`,
              borderBottom: 'none',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              justifyContent: 'center', gap: 4,
              padding: '12px 8px',
            }}
          >
            <div style={{
              width: 60, height: '0.5px',
              background: `linear-gradient(to right, transparent, ${accent}66, transparent)`,
            }} />
            <p style={{
              fontSize: 7, letterSpacing: '0.3em', textTransform: 'uppercase',
              color: `${accent}99`, fontFamily: `'${meta.font.body}', serif`,
            }}>
              Undangan Pernikahan
            </p>
            <div style={{
              width: 40, height: '0.5px',
              background: `linear-gradient(to right, transparent, ${accent}44, transparent)`,
            }} />
          </motion.div>
        </motion.div>
      </div>

      {/* ── Content — bottom section ── */}
      <div
        className="relative z-20 flex flex-col items-center w-full mt-auto"
        style={{ paddingBottom: padBottom, paddingLeft: padX, paddingRight: padX }}
      >
        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.9, ease }}
          className="text-center mb-3 leading-relaxed"
          style={{
            fontSize: greetingSize, fontStyle: 'italic',
            color: `${text}cc`,
            fontFamily: `'${meta.font.body}', serif`,
            letterSpacing: '0.04em',
            maxWidth: 280,
            textShadow: `0 1px 8px ${primary}88`,
          }}
        >
          {greeting}
        </motion.p>

        {/* Top separator */}
        {showTopSep && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.7, ease }}
          className="mb-4"
        >
          <SeparatorOrnament style={sepStyle} accent={accent} primary={primary} width={160} />
        </motion.div>
        )}

        {/* Couple names */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.0, duration: 1.0, ease }}
          className="text-center mb-5"
        >
          <h1 style={{
            fontSize: nameFontSize, fontWeight: 900, lineHeight: 1.1,
            color: text,
            fontFamily: `'${meta.font.heading}', serif`,
            letterSpacing: `${nameSpacing}em`,
            textTransform: nameTransform,
            margin: 0,
            textShadow: `0 2px 20px ${primary}cc, 0 4px 40px ${primary}88`,
          }}>
            {data.groom_name}
          </h1>

          <div className="flex items-center justify-center gap-4 my-3">
            <div style={{ width: 40, height: '0.5px', backgroundColor: `${accent}66` }} />
            <CoupleNameConnector style={connectorStyle} size={connectorSize} color={accent} fontFamily={`'${meta.font.heading}', serif`} primary={primary} />
            <div style={{ width: 40, height: '0.5px', backgroundColor: `${accent}66` }} />
          </div>

          <h1 style={{
            fontSize: nameFontSize, fontWeight: 900, lineHeight: 1.1,
            color: text,
            fontFamily: `'${meta.font.heading}', serif`,
            letterSpacing: `${nameSpacing}em`,
            textTransform: nameTransform,
            margin: 0,
            textShadow: `0 2px 20px ${primary}cc, 0 4px 40px ${primary}88`,
          }}>
            {data.bride_name}
          </h1>

          {eventDate && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2.6, duration: 0.7, ease }}
              style={{
                fontSize: 9.5, letterSpacing: '0.25em', textTransform: 'uppercase',
                color: `${accent}cc`, marginTop: 12,
                fontFamily: `'${meta.font.body}', serif`,
                textShadow: `0 1px 6px ${primary}88`,
              }}
            >
              {eventDate}
            </motion.p>
          )}
        </motion.div>

        {/* Bottom separator */}
        {showBottomSep && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 2.2, duration: 0.7, ease }}
          className="mb-5"
        >
          <SeparatorOrnament style={sepStyle} accent={accent} primary={primary} width={220} />
        </motion.div>
        )}

        {/* Invitation text */}
        {inviteText && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4, duration: 0.9, ease }}
            className="text-center mb-5 px-1"
            style={{
              fontSize: 10.5, lineHeight: 1.85, color: `${text}bb`,
              fontFamily: `'${meta.font.body}', serif`, maxWidth: 272,
              textShadow: `0 1px 6px ${primary}88`,
            }}
          >
            {inviteText}
          </motion.p>
        )}

        {/* Guest name */}
        {showGuest && guestName && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2.6, duration: 0.8, ease }}
            className="text-center mb-4 w-full px-1"
          >
            <p style={{
              fontSize: guestLabelSize, letterSpacing: '0.35em', textTransform: 'uppercase',
              color: `${accent}bb`, fontFamily: `'${meta.font.body}', serif`, marginBottom: 3,
              textShadow: `0 1px 4px ${primary}88`,
            }}>
              {guestLabel}
            </p>
            <p style={{
              fontSize: 14, fontWeight: 500, color: text,
              fontFamily: `'${meta.font.heading}', serif`, letterSpacing: '0.02em',
              lineHeight: 1.3,
              textShadow: `0 2px 12px ${primary}aa`,
            }}>
              {guestName}
            </p>
          </motion.div>
        )}

        {/* Enter button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3.3, duration: 0.8, ease }}
          className="flex flex-col items-center gap-2"
        >
          <motion.button
            onClick={handleOpen}
            disabled={clicked}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              ...btnStyle(cs.button, cs.border, accent, text, { size: btnSize, icon: true }),
              backdropFilter: 'blur(4px)',
            }}
          >
            <MailOpen size={15} strokeWidth={1.8} />
            {buttonText}
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  )
}
