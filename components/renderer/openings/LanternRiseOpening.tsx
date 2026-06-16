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

const stagger = (i: number) => ({ delay: 0.15 + i * 0.13, duration: 0.75, ease: [0.25, 0.46, 0.45, 0.94] as const })

interface Orb {
  x: number
  size: number
  delay: number
  duration: number
  opacity: number
  sway: number
  key: number
}

export default function LanternRiseOpening({ config, data, meta, onOpen, positionMode = 'fixed', previewGuestName }: Props) {
  const [guestName] = useState(() => getGuestName() || previewGuestName || null)
  const [clicked, setClicked] = useState(false)
  const { primary, accent, text } = meta.color_scheme
  const cs = getComponentStyle(meta.component_style)
  const pos = positionMode === 'fixed' ? 'fixed' : 'absolute'

  function handleOpen() {
    if (clicked) return
    setClicked(true)
    setTimeout(onOpen, 700)
  }

  const orbs: Orb[] = useMemo(() =>
    Array.from({ length: 9 }, (_, i) => ({
      x: 6 + Math.random() * 88,
      size: 18 + Math.random() * 14,
      delay: Math.random() * 4,
      duration: 7 + Math.random() * 5,
      opacity: 0.12 + Math.random() * 0.08,
      sway: (Math.random() - 0.5) * 30,
      key: i,
    })), [])

  const greeting   = config.subtitle ?? "Assalamu'alaikum Warahmatullahi Wabarakatuh"
  const buttonText = config.button_text ?? 'Buka Undangan'
  const inviteText = config.invitation_text ??
    'Tanpa mengurangi rasa hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dalam acara pernikahan kami.'
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
      transition={{ duration: clicked ? 0.6 : 0.8 }}
    >
      {/* Background photo */}
      {bgPhoto && (
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: 'easeOut' }}
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

      {/* Floating orbs */}
      {orbs.map(orb => {
        const hex = Math.round(orb.opacity * 255).toString(16).padStart(2, '0')
        const glowHex = Math.round(orb.opacity * 0.4 * 255).toString(16).padStart(2, '0')
        return (
          <motion.div
            key={orb.key}
            className="absolute rounded-full z-[6]"
            style={{
              left: `${orb.x}%`,
              bottom: -40,
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle at 40% 40%, ${accent}${hex}, ${accent}08)`,
              boxShadow: `0 0 ${orb.size * 0.8}px ${accent}${glowHex}`,
            }}
            animate={{
              y: [0, -(typeof window !== 'undefined' ? window.innerHeight + 80 : 900)],
              x: [0, orb.sway, 0],
              opacity: [0, orb.opacity, orb.opacity * 0.9, 0],
            }}
            transition={{
              duration: clicked ? orb.duration * 0.25 : orb.duration,
              delay: clicked ? 0 : orb.delay,
              repeat: clicked ? 0 : Infinity,
              ease: 'linear',
            }}
          />
        )
      })}

      {/* Warm ambient glow at bottom */}
      <div
        className="absolute inset-x-0 bottom-0 z-[4] pointer-events-none"
        style={{
          height: '30%',
          background: `radial-gradient(ellipse at 50% 100%, ${accent}15 0%, transparent 70%)`,
        }}
      />

      {/* Decoration assets */}
      <DecorationAssetLayer assets={config.decoration_assets ?? []} animate />
      {/* Logo icon — top center */}
      <motion.div
        className="absolute top-0 inset-x-0 z-20 flex justify-center"
        style={{ paddingTop: 'max(5vh, 28px)' }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: clicked ? 0 : 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <img src="/logos/icons.png" alt="" style={{ width: 40, height: 'auto', opacity: 0.85, filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.3))' }} />
      </motion.div>

      {/* Content - bottom-anchored */}
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
            textShadow: `0 2px 16px ${primary}cc, 0 4px 32px ${primary}66`,
          }}>
            {data.bride_name}
          </h1>

          {eventDate && (
            <p style={{
              fontSize: 9.5, letterSpacing: '0.25em', textTransform: 'uppercase',
              color: `${accent}cc`, marginTop: 10,
              fontFamily: `'${meta.font.body}', serif`,
              textShadow: `0 1px 6px ${primary}88`,
            }}>
              {eventDate}
            </p>
          )}
        </motion.div>

        {/* Invitation text */}
        {inviteText && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={stagger(3)}
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
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={stagger(4)}
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

        {/* Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={stagger(5)}
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
