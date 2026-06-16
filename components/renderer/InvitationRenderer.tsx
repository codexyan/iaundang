'use client'

import { useState, useEffect, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { TemplateRecord, NewInvitationData, Wish } from '@/lib/types'
import LoadingScreen from './LoadingScreen'
import OpeningScene from './OpeningScene'
import SectionRenderer from './SectionRenderer'
import FloatingMusicPlayer from './FloatingMusicPlayer'

interface Props {
  invitationId: string
  invitationData: NewInvitationData
  template: TemplateRecord
  initialWishes?: Wish[]
  musicUrl?: string
  /** Contained mode — absolute positioning, untuk preview dalam container (demo/fullscreen) */
  contained?: boolean
}

type Phase = 'opening' | 'loading' | 'main'

export default function InvitationRenderer({
  invitationId,
  invitationData,
  template,
  initialWishes = [],
  musicUrl,
  contained,
}: Props) {
  const config = template.config
  const { meta } = config
  const showOpening = config.opening.show_opening !== false

  const [phase, setPhase] = useState<Phase>(showOpening ? 'opening' : 'loading')

  useEffect(() => {
    const headingFont = meta.font.heading.replace(/ /g, '+')
    const bodyFont = meta.font.body.replace(/ /g, '+')
    const href = `https://fonts.googleapis.com/css2?family=${headingFont}:wght@400;700&family=${bodyFont}:ital,wght@0,300;0,400;0,600;1,400&display=swap`
    const existing = document.querySelector(`link[data-gf="${headingFont}"]`)
    if (existing) return

    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = href
    link.setAttribute('data-gf', headingFont)
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [meta.font.heading, meta.font.body])

  useEffect(() => {
    const customs = meta.font.custom_fonts ?? []
    customs.forEach(cf => {
      const id = `cf-${cf.name.replace(/\s+/g, '-')}`
      if (document.querySelector(`[data-cf="${id}"]`)) return
      if (cf.url.includes('googleapis')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = cf.url
        link.setAttribute('data-cf', id)
        document.head.appendChild(link)
      } else {
        const ext = cf.url.split('.').pop()?.toLowerCase()
        const format = ext === 'woff2' ? 'woff2' : ext === 'woff' ? 'woff' : ext === 'ttf' ? 'truetype' : 'opentype'
        const style = document.createElement('style')
        style.textContent = `@font-face { font-family: '${cf.name}'; src: url('${cf.url}') format('${format}'); font-display: swap; }`
        style.setAttribute('data-cf', id)
        document.head.appendChild(style)
      }
    })
  }, [meta.font.custom_fonts])

  const resolvedMusicUrl = musicUrl || config.music?.url || ''
  const defaultMusicConfig = {
    enabled: !!resolvedMusicUrl,
    url: resolvedMusicUrl,
    title: invitationData.music_title,
    autoplay: true,
    volume: 0.3,
    loop: true,
    player_style: 'pill' as const,
    player_position: 'bottom-right' as const,
    player_animation: 'fade-slide' as const,
    show_title: true,
    player_size: 'md' as const,
  }
  const musicConfig = config.music
    ? { ...defaultMusicConfig, ...config.music, enabled: config.music.enabled && !!resolvedMusicUrl, url: resolvedMusicUrl }
    : defaultMusicConfig

  const handleOpen = useCallback(() => setPhase('loading'), [])
  const handleLoadDone = useCallback(() => setPhase('main'), [])

  const activeSections = [...config.sections]
    .filter((s) => s.enabled)
    .sort((a, b) => a.order - b.order)

  const posMode = contained ? 'absolute' as const : 'fixed' as const

  return (
    <div style={{
      fontFamily: `'${meta.font.body}', serif`,
      position: 'relative',
      ...(contained ? { width: '100%', height: '100%' } : {}),
    }}>
      {/* Music player — tampil sejak opening */}
      {resolvedMusicUrl && (
        <FloatingMusicPlayer
          config={{ ...musicConfig, autoplay: true }}
          colors={meta.color_scheme}
          contained={contained}
        />
      )}

      <AnimatePresence mode="wait">
        {phase === 'opening' && (
          <motion.div
            key="opening"
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={contained ? { position: 'absolute', inset: 0 } : undefined}
          >
            <OpeningScene
              config={config.opening}
              data={invitationData}
              meta={meta}
              onOpen={handleOpen}
              positionMode={posMode}
            />
          </motion.div>
        )}

        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            style={contained ? { position: 'absolute', inset: 0 } : undefined}
          >
            <LoadingScreen
              config={config.loading}
              onDone={handleLoadDone}
              isPreview={contained}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'main' && (
        <motion.main
          key="main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          style={{
            backgroundColor: meta.color_scheme.primary,
            overflowY: 'scroll',
            overflowX: 'hidden',
            scrollSnapType: 'y proximity',
            scrollbarWidth: 'none',
            ...(contained
              ? { position: 'absolute', inset: 0 }
              : { height: '100dvh' }),
          }}
        >
          {activeSections.map((section) => (
            <SectionRenderer
              key={section.id}
              sectionConfig={section}
              invitationData={invitationData}
              templateMeta={meta}
              invitationId={invitationId}
              initialWishes={section.type === 'wishes' ? initialWishes : undefined}
            />
          ))}
        </motion.main>
      )}
    </div>
  )
}
