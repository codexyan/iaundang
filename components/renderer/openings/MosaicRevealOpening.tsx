'use client'

import { useState, useMemo } from 'react'
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

const COLS = 4
const ROWS = 6

const stagger = (i: number) => ({ delay: 0.15 + i * 0.13, duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] as const })

export default function MosaicRevealOpening({ config, data, meta, onOpen, positionMode = 'fixed', previewGuestName }: Props) {
  const [guestName] = useState(() => getGuestName() || previewGuestName || null)
  const [clicked, setClicked] = useState(false)
  const { primary, accent, text } = meta.color_scheme
  const cs = getComponentStyle(meta.component_style)
  const pos = positionMode === 'fixed' ? 'fixed' : 'absolute'

  const tiles = useMemo(() => {
    const arr: { r: number; c: number; delay: number }[] = []
    const centerX = (COLS - 1) / 2
    const centerY = (ROWS - 1) / 2
    const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2)
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const dist = Math.sqrt((c - centerX) ** 2 + (r - centerY) ** 2)
        arr.push({ r, c, delay: (dist / maxDist) * 0.6 })
      }
    }
    return arr
  }, [])

  function handleOpen() {
    if (clicked) return
    setClicked(true)
    setTimeout(onOpen, 1200)
  }

  const greeting   = config.subtitle ?? "Assalamu'alaikum Warahmatullahi Wabarakatuh"
  const buttonText = config.button_text ?? 'Buka Undangan'
  const showGuest  = config.show_guest_name !== false
  const bgPhoto    = config.cover_photo_url || config.background_image
  const bgOpacity  = (config.cover_photo_opacity ?? 40) / 100
  const bgPos      = config.cover_photo_position ?? 'center'
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

  return (
    <motion.div
      className={`${pos} inset-0 z-40 flex flex-col overflow-hidden`}
      style={{ backgroundColor: primary, pointerEvents: clicked ? 'none' : undefined }}
      initial={{ opacity: 0 }}
      animate={{ opacity: clicked ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: clicked ? 0.35 : 0.8, delay: clicked ? 0.85 : 0 }}
    >
      {/* Background photo */}
      {bgPhoto && (
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.06 }}
          animate={{ scale: 1 }}
          transition={{ duration: 8, ease: 'easeOut' }}
          style={{
            backgroundImage: `url(${bgPhoto})`,
            backgroundSize: 'cover',
            backgroundPosition: bgPos,
            opacity: bgOpacity,
          }}
        />
      )}

      {/* Dark scrim */}
      <div className="absolute inset-0 z-[2]" style={{ backgroundColor: `${primary}66` }} />

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

      {/* Mosaic tile grid   4x6 overlay covering the photo */}
      {tiles.map(({ r, c, delay }) => (
        <motion.div
          key={`${r}-${c}`}
          className="absolute z-[12]"
          style={{
            left: `calc(${(c / COLS) * 100}% + 0.5px)`,
            top: `calc(${(r / ROWS) * 100}% + 0.5px)`,
            width: `calc(${100 / COLS}% - 1px)`,
            height: `calc(${100 / ROWS}% - 1px)`,
            backgroundColor: primary,
          }}
          initial={{ opacity: 1 }}
          animate={clicked ? { opacity: 0, scale: 0.85 } : { opacity: 1, scale: 1 }}
          transition={{
            duration: 0.45,
            delay: clicked ? delay : 0,
            ease: [0.76, 0, 0.24, 1],
          }}
        />
      ))}

      {/* Decoration assets */}
      <DecorationAssetLayer assets={config.decoration_assets ?? []} animate />
      {/* Logo icon   top center */}
      <motion.div
        className="absolute top-0 inset-x-0 z-20 flex justify-center"
        style={{ paddingTop: 'max(5vh, 28px)' }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: clicked ? 0 : 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <img src="/logos/icons.png" alt="" style={{ width: 40, height: 'auto', opacity: 0.85, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }} />
      </motion.div>

      {/* Content   bottom-anchored, centered over tiles */}
      <div
        className="relative z-20 flex flex-col items-center w-full mt-auto"
        style={{ paddingBottom: padBottom, paddingLeft: padX, paddingRight: padX }}
      >
        {/* Greeting */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={stagger(0)}
          className="text-center mb-3 leading-relaxed"
          style={{
            fontSize: greetingSize, fontStyle: 'italic',
            color: `${text}cc`,
            fontFamily: `'${meta.font.body}', serif`,
            letterSpacing: '0.03em',
            maxWidth: 280,
            textShadow: `0 1px 8px ${primary}88`,
          }}
        >
          {greeting}
        </motion.p>

        {/* Separator */}
        {showTopSep && (
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={stagger(1)}
          className="mb-4"
        >
          <SeparatorOrnament style={sepStyle} accent={accent} primary={primary} width={160} />
        </motion.div>
        )}

        {/* Couple names */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={stagger(2)}
          className="text-center mb-5"
        >
          <h1 style={{
            fontSize: nameFontSize, fontWeight: 900, lineHeight: 1.1,
            color: text,
            fontFamily: `'${meta.font.heading}', serif`,
            letterSpacing: `${nameSpacing}em`,
            textTransform: nameTransform,
            margin: 0,
            textShadow: `0 2px 16px ${primary}cc, 0 4px 32px ${primary}66`,
          }}>
            {data.groom_name}
          </h1>

          <div className="flex items-center justify-center my-3">
            <CoupleNameConnector style={connectorStyle} size={connectorSize} color={text} fontFamily={`'${meta.font.heading}', serif`} primary={primary} />
          </div>

          <h1 style={{
            fontSize: nameFontSize, fontWeight: 900, lineHeight: 1.1,
            color: text,
            fontFamily: `'${meta.font.heading}', serif`,
            letterSpacing: `${nameSpacing}em`,
            textTransform: nameTransform,
            margin: 0,
            textShadow: `0 2px 16px ${primary}cc, 0 4px 32px ${primary}66`,
          }}>
            {data.bride_name}
          </h1>

          {/* Event date */}
          {eventDate && (
            <p style={{
              fontSize: 9.5, letterSpacing: '0.25em', textTransform: 'uppercase',
              color: `${text}cc`, marginTop: 10,
              fontFamily: `'${meta.font.body}', serif`,
              textShadow: `0 1px 6px ${primary}88`,
            }}>
              {eventDate}
            </p>
          )}
        </motion.div>

        {/* Guest name */}
        {showGuest && guestName && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(3)}
            className="text-center mb-4 w-full px-1"
          >
            <p style={{
              fontSize: guestLabelSize, letterSpacing: '0.35em', textTransform: 'uppercase',
              color: `${text}bb`, fontFamily: `'${meta.font.body}', serif`, marginBottom: 3,
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

        {/* Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={stagger(4)}
          className="flex flex-col items-center gap-2"
        >
          <motion.button
            onClick={handleOpen}
            disabled={clicked}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            style={{
              ...btnStyle(cs.button, cs.border, accent, text, { size: btnSize, icon: true }),
              fontFamily: `'${meta.font.body}', serif`,
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
