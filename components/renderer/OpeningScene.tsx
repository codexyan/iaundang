'use client'

import { AnimatePresence } from 'framer-motion'
import type { OpeningConfig, NewInvitationData, TemplateMeta } from '@/lib/types'
import FadeRevealOpening from './openings/FadeRevealOpening'
import EnvelopeOpening from './openings/EnvelopeOpening'
import CurtainOpening from './openings/CurtainOpening'
import GateOpenOpening from './openings/GateOpenOpening'
import FlowerBloomOpening from './openings/FlowerBloomOpening'
import ScrollRevealOpening from './openings/ScrollRevealOpening'
import DiamondSplitOpening from './openings/DiamondSplitOpening'
import BookOpenOpening from './openings/BookOpenOpening'
import LanternRiseOpening from './openings/LanternRiseOpening'
import VeilLiftOpening from './openings/VeilLiftOpening'
import MosaicRevealOpening from './openings/MosaicRevealOpening'
import RingZoomOpening from './openings/RingZoomOpening'

export type PositionMode = 'fixed' | 'absolute'

interface Props {
  config: OpeningConfig
  data: NewInvitationData
  meta: TemplateMeta
  onOpen: () => void
  /** 'fixed' = fullscreen viewport (live), 'absolute' = dalam container (preview mockup) */
  positionMode?: PositionMode
  previewGuestName?: string
}

export default function OpeningScene({ config, data, meta, onOpen, positionMode = 'fixed', previewGuestName }: Props) {
  const shared = { config, data, meta, onOpen, positionMode, previewGuestName }

  return (
    <AnimatePresence>
      {(() => {
        switch (config.type) {
          case 'envelope':      return <EnvelopeOpening     key="envelope"      {...shared} />
          case 'curtain':       return <CurtainOpening      key="curtain"       {...shared} />
          case 'gate-open':     return <GateOpenOpening     key="gate-open"     {...shared} />
          case 'flower-bloom':  return <FlowerBloomOpening  key="flower-bloom"  {...shared} />
          case 'scroll-reveal': return <ScrollRevealOpening key="scroll-reveal" {...shared} />
          case 'diamond-split': return <DiamondSplitOpening key="diamond-split" {...shared} />
          case 'book-open':     return <BookOpenOpening     key="book-open"     {...shared} />
          case 'lantern-rise':  return <LanternRiseOpening  key="lantern-rise"  {...shared} />
          case 'veil-lift':     return <VeilLiftOpening     key="veil-lift"     {...shared} />
          case 'mosaic-reveal': return <MosaicRevealOpening key="mosaic-reveal" {...shared} />
          case 'ring-zoom':     return <RingZoomOpening     key="ring-zoom"     {...shared} />
          case 'fade-reveal':
          default:              return <FadeRevealOpening   key="fade-reveal"   {...shared} />
        }
      })()}
    </AnimatePresence>
  )
}
