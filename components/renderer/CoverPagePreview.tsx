'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { TemplateRecord, NewInvitationData, LoadingConfig, DecorationAsset } from '@/lib/types'
import { mergeDecorationAssets } from '@/lib/decoration-utils'
import DecorationAssetLayer from './DecorationAssetLayer'
import LoadingScreen from './LoadingScreen'
import { getComponentStyle, btnStyle } from '@/lib/component-styles'
import SeparatorOrnament from './SeparatorOrnament'
import { MailOpen } from 'lucide-react'

interface Props {
  template: TemplateRecord
  data: NewInvitationData
  previewGuestName?: string
  containerHeight?: number | string
  decorPreviewKey?: number
  previewMode?: 'static' | 'entry' | 'exit' | 'full-flow'
  onEnter?: () => void
}

export default function CoverPagePreview({ template, data, previewGuestName, containerHeight, decorPreviewKey, previewMode = 'static', onEnter }: Props) {
  const { config } = template
  const { meta, opening, loading } = config
  const { primary, accent, text } = meta.color_scheme
  const cs = getComponentStyle(meta.component_style)

  const [phase, setPhase] = useState<'cover' | 'exiting' | 'loading'>('cover')
  const [exitKey, setExitKey] = useState(0)

  const greeting    = opening.subtitle ?? "Assalamu'alaikum Wr. Wb."
  const buttonText  = opening.button_text ?? 'Masuk Sekarang'
  const inviteText  = opening.invitation_text ??
    'Dengan penuh kebahagiaan, kami mengundang kehadiran Bapak/Ibu/Saudara/i dalam acara pernikahan kami.'
  const showGuest   = opening.show_guest_name !== false
  const guestName   = previewGuestName || null
  const bgPhoto     = opening.cover_photo_url || opening.background_image
  const bgOpacity   = (opening.cover_photo_opacity ?? 30) / 100
  const bgPos       = opening.cover_photo_position ?? 'center'
  const display     = opening.cover_photo_display ?? 'background'
  const gradH       = opening.cover_gradient_height ?? 75
  const gradColor   = opening.cover_gradient_color ?? primary
  const nameFontSize = opening.couple_name_font_size ?? 32
  const nameSpacing  = opening.couple_name_letter_spacing ?? 0.08
  const nameTransform = opening.couple_name_text_transform ?? (opening.couple_name_uppercase !== false ? 'uppercase' : 'none')
  const btnSize      = opening.button_size ?? 'lg'
  const padX         = opening.content_padding_x ?? 28
  const padBottom    = opening.content_padding_bottom ?? 48
  const greetingSize = opening.greeting_font_size ?? 11
  const guestLabel   = opening.guest_label ?? 'KEPADA YTH.'
  const guestLabelSize = opening.guest_label_font_size ?? 8.5
  const showTopSep   = opening.show_top_separator !== false
  const showBottomSep = opening.show_bottom_separator !== false
  const sepStyle     = opening.separator_style ?? 'diamond'

  useEffect(() => {
    const heading = meta.font.heading.replace(/ /g, '+')
    const body    = meta.font.body.replace(/ /g, '+')
    const id = `gf-cover-${heading}`
    if (document.getElementById(id)) return
    const link = document.createElement('link')
    link.id = id; link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?family=${heading}:wght@300;400;700&family=${body}:ital,wght@0,300;0,400;0,600;1,300;1,400&display=swap`
    document.head.appendChild(link)
  }, [meta.font.heading, meta.font.body])

  useEffect(() => {
    setPhase('cover')
  }, [previewMode, decorPreviewKey])

  const handleEnterClick = useCallback(() => {
    if (onEnter) {
      onEnter()
      return
    }
    if (previewMode === 'exit' || previewMode === 'full-flow') {
      setPhase('exiting')
      setExitKey(k => k + 1)
      setTimeout(() => {
        setPhase('loading')
      }, 900)
    }
  }, [previewMode, onEnter])

  const handleLoadingDone = useCallback(() => {
    setPhase('cover')
  }, [])

  const isExiting = phase === 'exiting'

  return (
    <div style={{
      position: 'relative',
      height: containerHeight ?? '100dvh',
      width: '100%',
      backgroundColor: primary,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxSizing: 'border-box',
      fontFamily: `'${meta.font.body}', serif`,
    }}>
      <AnimatePresence mode="wait">
        {phase === 'loading' ? (
          <motion.div
            key="loading-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-40"
          >
            <LoadingScreen config={loading} onDone={handleLoadingDone} isPreview />
          </motion.div>
        ) : (
          <motion.div
            key={`cover-${exitKey}`}
            className="absolute inset-0 flex flex-col"
            animate={isExiting ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.6, delay: isExiting ? 0.5 : 0 }}
          >
            {/* Background photo */}
            {bgPhoto && display === 'background' && (
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${bgPhoto})`,
                backgroundSize: 'cover',
                backgroundPosition: bgPos,
                opacity: bgOpacity,
              }} />
            )}

            {/* Full-screen dark scrim for readability */}
            <div style={{
              position: 'absolute', inset: 0, zIndex: 1,
              backgroundColor: `${primary}66`,
            }} />

            {/* Bottom gradient — strong multi-stop */}
            <div style={{
              position: 'absolute', inset: 'auto 0 0 0',
              height: `${gradH}%`,
              background: `linear-gradient(to top,
                ${gradColor}f7 0%,
                ${gradColor}dd 15%,
                ${gradColor}aa 30%,
                ${gradColor}66 50%,
                ${gradColor}33 70%,
                transparent 100%)`,
              zIndex: 2,
            }} />

            {/* Top vignette */}
            <div style={{
              position: 'absolute', inset: '0 0 auto 0',
              height: '35%',
              background: `linear-gradient(to bottom, ${primary}88 0%, transparent 100%)`,
              zIndex: 2,
            }} />

            {/* Banner top photo */}
            {bgPhoto && display === 'banner' && (
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '52%',
                backgroundImage: `url(${bgPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center top', zIndex: 0,
              }} />
            )}

            {/* Decoration assets — merge template + user overrides */}
            <DecorationAssetLayer
              key={decorPreviewKey ?? 0}
              assets={mergeDecorationAssets(opening.decoration_assets, data.opening_decoration_overrides)}
              animate={decorPreviewKey != null && decorPreviewKey > 0}
              exiting={isExiting}
            />

            {/* Animation type badge */}
            <div style={{
              position: 'absolute', top: 8, right: 8, zIndex: 20,
              fontSize: 8, letterSpacing: '0.1em',
              color: `${accent}aa`, border: `1px solid ${accent}44`,
              borderRadius: 4, padding: '2px 6px',
              backdropFilter: 'blur(4px)',
              backgroundColor: `${primary}44`,
            }}>
              {opening.type}
            </div>

            {/* Content — bottom anchored */}
            <div style={{
              position: 'relative', zIndex: 10,
              marginTop: 'auto',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              padding: `0 ${padX}px`, paddingBottom: padBottom,
            }}>
              {/* Portrait photo */}
              {bgPhoto && display === 'portrait' && (
                <div style={{
                  width: 96, height: 96, borderRadius: '50%', marginBottom: 16,
                  backgroundImage: `url(${bgPhoto})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  border: `2px solid ${accent}88`,
                  boxShadow: `0 0 0 4px ${primary}, 0 0 0 6px ${accent}44`,
                }} />
              )}

              {/* Greeting */}
              <p style={{
                fontSize: greetingSize, fontStyle: 'italic',
                color: `${text}cc`, marginBottom: 10, textAlign: 'center',
                fontFamily: `'${meta.font.body}', serif`,
                textShadow: `0 1px 8px ${primary}88`,
              }}>
                {greeting}
              </p>

              {/* Top separator */}
              {showTopSep && (
                <div style={{ marginBottom: 10 }}>
                  <SeparatorOrnament style={sepStyle} accent={accent} primary={primary} width={160} />
                </div>
              )}

              {/* Couple names */}
              <div style={{ textAlign: 'center', marginBottom: 14 }}>
                <h1 style={{
                  fontSize: nameFontSize, fontWeight: 900, lineHeight: 1.1,
                  color: text,
                  fontFamily: `'${meta.font.heading}', serif`,
                  margin: 0, letterSpacing: `${nameSpacing}em`,
                  textTransform: nameTransform,
                  textShadow: `0 2px 16px ${primary}cc, 0 4px 32px ${primary}66`,
                }}>
                  {data.groom_name}
                </h1>
                <p style={{
                  fontSize: 18, color: accent, margin: '3px 0',
                  fontFamily: `'${meta.font.heading}', serif`,
                  fontWeight: 300, letterSpacing: '0.1em',
                  textShadow: `0 2px 12px ${primary}aa`,
                }}>
                  &amp;
                </p>
                <h1 style={{
                  fontSize: nameFontSize, fontWeight: 900, lineHeight: 1.1,
                  color: text,
                  fontFamily: `'${meta.font.heading}', serif`,
                  margin: 0, letterSpacing: `${nameSpacing}em`,
                  textTransform: nameTransform,
                  textShadow: `0 2px 16px ${primary}cc, 0 4px 32px ${primary}66`,
                }}>
                  {data.bride_name}
                </h1>
              </div>

              {/* Ornament separator */}
              {showBottomSep && (
                <div style={{ marginBottom: 14 }}>
                  <SeparatorOrnament style={sepStyle} accent={accent} primary={primary} width={200} />
                </div>
              )}

              {/* Invitation text */}
              <p style={{
                fontSize: 10.5, lineHeight: 1.8, color: `${text}bb`,
                textAlign: 'center', marginBottom: 14,
                fontFamily: `'${meta.font.body}', serif`, maxWidth: 280,
                textShadow: `0 1px 6px ${primary}88`,
              }}>
                {inviteText}
              </p>

              {/* Guest name */}
              {showGuest && (
                <div style={{
                  textAlign: 'center', marginBottom: 14, width: '100%',
                  borderTop: `1px solid ${accent}44`, borderBottom: `1px solid ${accent}44`,
                  padding: '7px 0',
                }}>
                  <p style={{
                    fontSize: guestLabelSize, letterSpacing: '0.3em', textTransform: 'uppercase',
                    color: `${accent}bb`, marginBottom: 2,
                    fontFamily: `'${meta.font.body}', serif`,
                    textShadow: `0 1px 4px ${primary}88`,
                  }}>
                    {guestLabel}
                  </p>
                  {guestName ? (
                    <p style={{
                      fontSize: 13, fontWeight: 500, color: text,
                      fontFamily: `'${meta.font.heading}', serif`,
                      textShadow: `0 2px 12px ${primary}aa`,
                    }}>
                      {guestName}
                    </p>
                  ) : (
                    <p style={{
                      fontSize: 10, color: `${accent}99`, fontStyle: 'italic',
                      fontFamily: `'${meta.font.body}', serif`,
                    }}>
                      &larr; dari URL ?to=nama-tamu
                    </p>
                  )}
                </div>
              )}

              {/* Enter button */}
              <motion.div
                onClick={handleEnterClick}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                style={{
                  ...btnStyle(cs.button, cs.border, accent, text, { size: btnSize, icon: true }),
                  fontFamily: `'${meta.font.body}', serif`,
                  marginBottom: 8,
                  cursor: (onEnter || previewMode === 'exit' || previewMode === 'full-flow') ? 'pointer' : 'default',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <MailOpen size={15} strokeWidth={1.8} />
                {buttonText}
              </motion.div>
              {(previewMode === 'exit' || previewMode === 'full-flow') && (
                <p style={{ fontSize: 7, color: `${accent}77`, letterSpacing: '0.1em' }}>
                  klik untuk preview transisi keluar
                </p>
              )}


              {opening.music_autoplay && (
                <p style={{ marginTop: 8, fontSize: 9, color: `${text}66`, textShadow: `0 1px 4px ${primary}88` }}>
                  &#9834; Musik otomatis aktif
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
