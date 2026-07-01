'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { OpeningConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import type { PositionMode } from '../OpeningScene'
import DecorationAssetLayer from '../DecorationAssetLayer'
import { getComponentStyle, btnStyle } from '@/lib/component-styles'
import SeparatorOrnament from '../SeparatorOrnament'
import CoupleNameConnector from '../CoupleNameConnector'
import { PREMIUM_EASE } from './motionPresets'
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

function sr(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

/*  Speed presets (duration range in seconds)  */
const SPEED_MAP = { slow: [10, 16], normal: [6, 14], fast: [3, 8] } as const
/*  Size presets (base + range in px)  */
const SIZE_MAP = { sm: [5, 8], md: [8, 16], lg: [14, 22] } as const

interface FallingPetal {
  id: number
  startX: number
  size: number
  delay: number
  duration: number
  swayAmount: number
  rotation: number
  opacity: number
  shape: number
  spinX: number
  spinY: number
  near: boolean
}

function generateFallingPetals(
  count: number,
  speed: 'slow' | 'normal' | 'fast',
  size: 'sm' | 'md' | 'lg',
  peakOpacity: number,
  swayIntensity: number,
): FallingPetal[] {
  const [durBase, durRange] = SPEED_MAP[speed]
  const [sizeBase, sizeRange] = SIZE_MAP[size]
  const swayBase = 20 + swayIntensity * 0.8
  const swayRange = 20 + swayIntensity * 0.6

  const petals: FallingPetal[] = []
  for (let i = 0; i < count; i++) {
    const sizeF = sr(i * 11) // 0..1 relative size within range
    petals.push({
      id: i,
      startX: sr(i * 7) * 100,
      size: sizeBase + sizeF * sizeRange,
      delay: sr(i * 13) * 8,
      duration: durBase + sr(i * 17) * durRange,
      swayAmount: swayBase + sr(i * 19) * swayRange,
      rotation: (sr(i * 23) - 0.5) * 720,
      opacity: (peakOpacity / 100) * (0.5 + sr(i * 29) * 0.5),
      shape: Math.floor(sr(i * 31) * 4),
      // 3D tumble amplitudes (deterministic) + depth-of-field flag
      spinX: (sr(i * 41) - 0.5) * 70,
      spinY: (sr(i * 43) - 0.5) * 70,
      near: sizeF > 0.45, // larger petals feel closer to camera (sharp), smaller ones sit back (soft)
    })
  }
  return petals
}

/*  SVG shape paths per petal_shape  */
const SHAPE_PATHS: Record<string, string[]> = {
  petal: [
    'M10 0 C15 5, 15 15, 10 20 C5 15, 5 5, 10 0Z',
    'M10 0 C18 4, 16 16, 10 20 C4 16, 2 4, 10 0Z',
    'M10 0 C14 8, 18 14, 10 20 C2 14, 6 8, 10 0Z',
    'M10 0 C16 6, 14 18, 10 20 C6 18, 4 6, 10 0Z',
  ],
  sakura: [
    'M10 0 C12 4, 18 6, 18 10 C18 14, 12 16, 10 20 C8 16, 2 14, 2 10 C2 6, 8 4, 10 0Z',
    'M10 1 C14 3, 19 8, 17 12 C15 16, 12 18, 10 20 C8 18, 5 16, 3 12 C1 8, 6 3, 10 1Z',
    'M10 0 C13 5, 17 7, 16 11 C15 15, 11 19, 10 20 C9 19, 5 15, 4 11 C3 7, 7 5, 10 0Z',
    'M10 0 C15 4, 18 9, 16 13 C14 17, 11 19, 10 20 C9 19, 6 17, 4 13 C2 9, 5 4, 10 0Z',
  ],
  leaf: [
    'M10 0 C16 3, 20 10, 16 16 C12 20, 10 20, 10 20 C10 20, 8 20, 4 16 C0 10, 4 3, 10 0Z',
    'M10 0 C14 2, 19 8, 18 14 C17 18, 10 20, 10 20 C10 20, 3 18, 2 14 C1 8, 6 2, 10 0Z',
    'M10 0 C15 4, 18 10, 15 16 C12 19, 10 20, 10 20 C10 20, 8 19, 5 16 C2 10, 5 4, 10 0Z',
    'M10 0 C17 5, 19 12, 14 17 C11 19, 10 20, 10 20 C10 20, 9 19, 6 17 C1 12, 3 5, 10 0Z',
  ],
  snowflake: [
    'M10 0 L12 7 L19 7 L13 12 L15 19 L10 15 L5 19 L7 12 L1 7 L8 7Z',
    'M10 1 L11.5 7.5 L18 8 L13 12 L14.5 18 L10 14.5 L5.5 18 L7 12 L2 8 L8.5 7.5Z',
    'M10 0 L12.5 6.5 L19.5 7.5 L14 12.5 L15.5 19.5 L10 15.5 L4.5 19.5 L6 12.5 L0.5 7.5 L7.5 6.5Z',
    'M10 0.5 L11.8 7 L18.5 7.8 L13.5 12 L15 18.5 L10 15 L5 18.5 L6.5 12 L1.5 7.8 L8.2 7Z',
  ],
}

const stagger = (i: number) => ({
  delay: 0.3 + i * 0.15,
  duration: 0.9,
  ease: PREMIUM_EASE,
})

export default function PetalFallOpening({ config, data, meta, onOpen, positionMode = 'fixed', previewGuestName }: Props) {
  const [guestName] = useState(() => getGuestName() || previewGuestName || null)
  const [clicked, setClicked] = useState(false)
  const { primary, accent, text } = meta.color_scheme
  const cs = getComponentStyle(meta.component_style)
  const pos = positionMode === 'fixed' ? 'fixed' : 'absolute'

  //  Read configurable attributes with defaults 
  const petalCount      = config.petal_count ?? 22
  const petalSpeed      = config.petal_speed ?? 'normal'
  const petalSize       = config.petal_size ?? 'md'
  const petalOpacity    = config.petal_opacity ?? 30
  const petalSway       = config.petal_sway ?? 50
  const petalColor      = config.petal_color ?? accent
  const petalShape      = config.petal_shape ?? 'petal'
  const showButtonGlow  = config.show_button_glow !== false
  const showScrollHint  = config.show_scroll_hint !== false
  const kenBurns        = config.ken_burns_enabled !== false
  const kenBurnsSpeed   = config.ken_burns_speed ?? 20
  const exitBlur        = config.exit_blur ?? 12
  const scrimOpacity    = config.scrim_opacity ?? 33
  const scrimHex        = Math.round((scrimOpacity / 100) * 255).toString(16).padStart(2, '0')

  const petals = useMemo(
    () => generateFallingPetals(petalCount, petalSpeed, petalSize, petalOpacity, petalSway),
    [petalCount, petalSpeed, petalSize, petalOpacity, petalSway],
  )
  const shapePaths = SHAPE_PATHS[petalShape] ?? SHAPE_PATHS.petal

  function handleOpen() {
    if (clicked) return
    setClicked(true)
    setTimeout(onOpen, 600)
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
  const gradH      = config.cover_gradient_height ?? 80
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
    <AnimatePresence>
      {!clicked && (
        <motion.div
          key="petal-fall-cover"
          className={`${pos} inset-0 z-40 flex flex-col overflow-hidden`}
          style={{ backgroundColor: primary }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.08, filter: `blur(${exitBlur}px)` }}
          transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
        >
          {/*  Ken Burns background  */}
          {bgPhoto && display === 'background' && (
            <motion.div
              className="absolute inset-0"
              initial={{ scale: 1.15 }}
              animate={kenBurns ? {
                scale: [1.15, 1.08, 1.12, 1.05],
                x: [0, -8, 4, 0],
                y: [0, -4, 2, 0],
              } : { scale: 1.05 }}
              transition={kenBurns
                ? { duration: kenBurnsSpeed, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 2, ease: 'easeOut' }
              }
              style={{
                backgroundImage: `url(${bgPhoto})`,
                backgroundSize: 'cover',
                backgroundPosition: bgPos,
                opacity: bgOpacity,
              }}
            />
          )}

          {/* Banner top mode */}
          {bgPhoto && display === 'banner' && (
            <div className="absolute top-0 left-0 right-0 z-0" style={{
              backgroundImage: `url(${bgPhoto})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center top',
              height: '55%',
            }} />
          )}

          {/* Portrait mode */}
          {bgPhoto && display === 'portrait' && (
            <motion.div
              className="absolute z-[6] flex justify-center"
              style={{ top: '12%', left: 0, right: 0 }}
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 1.2, type: 'spring', damping: 12 }}
            >
              <div style={{
                width: 120, height: 120, borderRadius: '50%',
                backgroundImage: `url(${bgPhoto})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                border: `2.5px solid ${accent}`,
                outline: `4px solid ${primary}`,
                outlineOffset: 3,
                boxShadow: `0 0 0 8px ${accent}22, 0 20px 50px ${primary}99`,
              }} />
            </motion.div>
          )}

          {/*  Atmospheric overlays (configurable scrim)  */}
          <div className="absolute inset-0 z-[2]" style={{ backgroundColor: `${primary}${scrimHex}` }} />
          <div className="absolute inset-x-0 bottom-0 z-[5]" style={{
            height: `${gradH}%`,
            background: `linear-gradient(to top,
              ${gradColor} 0%,
              ${gradColor}f7 ${Math.round(gradStop * 0.25)}%,
              ${gradColor}e0 ${Math.round(gradStop * 0.45)}%,
              ${gradColor}99 ${Math.round(gradStop * 0.65)}%,
              ${gradColor}44 ${Math.round(gradStop * 0.85)}%,
              transparent 100%
            )`,
          }} />
          <div className="absolute inset-x-0 top-0 z-[3]" style={{
            height: '30%',
            background: `linear-gradient(to bottom, ${primary}77 0%, transparent 100%)`,
          }} />

          {/* Decoration assets */}
          <DecorationAssetLayer assets={config.decoration_assets ?? []} animate />

          {/*  Falling petal particles  */}
          <div className="absolute inset-0 z-[8] pointer-events-none overflow-hidden" style={{ perspective: 700 }}>
            {petals.map((p) => (
              <motion.div
                key={p.id}
                className="absolute"
                style={{
                  left: `${p.startX}%`, top: -30,
                  transformStyle: 'preserve-3d',
                  // Depth of field: petals sitting back get a soft blur
                  filter: p.near ? 'none' : 'blur(1.1px)',
                }}
                initial={{ y: -30, x: 0, rotate: 0, rotateX: 0, rotateY: 0, opacity: 0 }}
                animate={{
                  y: ['0vh', '110vh'],
                  x: [0, p.swayAmount, -p.swayAmount * 0.6, p.swayAmount * 0.4, 0],
                  rotate: [0, p.rotation],
                  rotateX: [0, p.spinX, -p.spinX * 0.6, p.spinX * 0.4, 0],
                  rotateY: [0, p.spinY, -p.spinY * 0.5, p.spinY * 0.3, 0],
                  opacity: [0, p.opacity, p.opacity, p.opacity * 0.6, 0],
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: 'linear',
                  x: { duration: p.duration * 0.8, repeat: Infinity, ease: 'easeInOut' },
                  rotateX: { duration: p.duration * 0.9, repeat: Infinity, ease: 'easeInOut' },
                  rotateY: { duration: p.duration * 1.1, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <svg
                  width={p.size}
                  height={p.size * 2}
                  viewBox="0 0 20 40"
                  fill="none"
                >
                  <path
                    d={shapePaths[p.shape]}
                    fill={petalColor}
                    fillOpacity={0.7}
                  />
                  <path
                    d={shapePaths[(p.shape + 1) % 4]}
                    fill={petalColor}
                    fillOpacity={0.4}
                    transform="translate(0, 18) scale(0.8)"
                  />
                </svg>
              </motion.div>
            ))}
          </div>

          {/* Logo icon */}
          <motion.div
            className="absolute top-0 inset-x-0 z-20 flex justify-center"
            style={{ paddingTop: 'max(5vh, 28px)' }}
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 1, type: 'spring', damping: 14 }}
          >
            <img src="/logos/icons.png" alt="" style={{ width: 40, height: 'auto', opacity: 0.85, filter: 'drop-shadow(0 2px 10px rgba(0,0,0,0.3))' }} />
          </motion.div>

          {/*  Content  bottom-anchored  */}
          <div
            className="relative z-20 flex flex-col items-center w-full mt-auto"
            style={{ paddingBottom: padBottom, paddingLeft: padX, paddingRight: padX }}
          >
            {/* Greeting */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={stagger(0)}
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

            {/* Couple names with blur reveal */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={stagger(2)}
              className="text-center mb-5"
            >
              <motion.h1
                initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: nameFontSize, fontWeight: 900, lineHeight: 1.1,
                  color: text,
                  fontFamily: `'${meta.font.heading}', serif`,
                  letterSpacing: `${nameSpacing}em`,
                  textTransform: nameTransform,
                  margin: 0,
                  textShadow: `0 2px 20px ${primary}cc, 0 4px 40px ${primary}66`,
                }}
              >
                {data.groom_name}
              </motion.h1>

              <motion.div
                className="flex items-center justify-center my-3"
                initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.9, duration: 0.8, type: 'spring', damping: 12 }}
              >
                <CoupleNameConnector style={connectorStyle} size={connectorSize} color={text} fontFamily={`'${meta.font.heading}', serif`} primary={primary} />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ delay: 1.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontSize: nameFontSize, fontWeight: 900, lineHeight: 1.1,
                  color: text,
                  fontFamily: `'${meta.font.heading}', serif`,
                  letterSpacing: `${nameSpacing}em`,
                  textTransform: nameTransform,
                  margin: 0,
                  textShadow: `0 2px 20px ${primary}cc, 0 4px 40px ${primary}66`,
                }}
              >
                {data.bride_name}
              </motion.h1>

              {eventDate && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.3, duration: 0.8 }}
                  style={{
                    fontSize: 9.5, letterSpacing: '0.25em', textTransform: 'uppercase',
                    color: `${text}cc`, marginTop: 10,
                    fontFamily: `'${meta.font.body}', serif`,
                    textShadow: `0 1px 6px ${primary}88`,
                  }}
                >
                  {eventDate}
                </motion.p>
              )}
            </motion.div>

            {showBottomSep && (
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={stagger(3)}
                className="mb-5"
              >
                <SeparatorOrnament style={sepStyle} accent={accent} primary={primary} width={220} />
              </motion.div>
            )}

            {inviteText && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={stagger(4)}
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

            {showGuest && guestName && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={stagger(5)}
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

            {/*  Button area  */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={stagger(6)}
              className="flex flex-col items-center gap-3"
            >
              <div className="relative">
                {/* Conditional glow ring */}
                {showButtonGlow && (
                  <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: `radial-gradient(circle, ${accent}33 0%, transparent 70%)`,
                      filter: 'blur(12px)',
                    }}
                    animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                )}
                <motion.button
                  onClick={handleOpen}
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  animate={showButtonGlow ? {
                    boxShadow: [
                      `0 0 20px ${accent}44, 0 0 40px ${accent}22`,
                      `0 0 30px ${accent}66, 0 0 60px ${accent}33`,
                      `0 0 20px ${accent}44, 0 0 40px ${accent}22`,
                    ],
                  } : undefined}
                  transition={showButtonGlow ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
                  style={{
                    ...btnStyle(cs.button, cs.border, accent, text, { size: btnSize, icon: true }),
                    fontFamily: `'${meta.font.body}', serif`,
                    backdropFilter: 'blur(8px)',
                    position: 'relative',
                  }}
                >
                  <MailOpen size={15} strokeWidth={1.8} />
                  {buttonText}
                </motion.button>
              </div>

              {/* Conditional scroll hint */}
              {showScrollHint && (
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ opacity: 0.4 }}
                >
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                    <path d="M2 2L10 10L18 2" stroke={accent} strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </motion.div>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
