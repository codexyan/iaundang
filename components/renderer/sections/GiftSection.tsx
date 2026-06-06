'use client'

import { useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta, GiftAccount } from '@/lib/types'
import SectionWrapper, { resolveFont, fsb } from '../SectionWrapper'
import { Copy, Check, ChevronLeft, ChevronRight, Upload, X, ImageIcon, Loader2, Heart } from 'lucide-react'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
  invitationId?: string
}

// ─── Brand config ─────────────────────────────────────────────────────────────

type BrandKey = 'bri' | 'bca' | 'bni' | 'mandiri' | 'bsi' | 'blu' | 'gopay' | 'dana' | 'shopee' | 'ovo' | 'default'

interface Brand {
  key: BrandKey
  label: string
  gradient: [string, string]
  accentColor: string
  logoText: string
  logoFile?: string
  pattern?: 'circles' | 'waves' | 'dots' | 'lines' | 'none'
}

const BRANDS: Record<BrandKey, Brand> = {
  bri:     { key: 'bri',     label: 'BRI',       gradient: ['#003B8E','#00529B'], accentColor: '#64B5F6', logoText: 'BRI',       logoFile: '/logos/bri.svg',     pattern: 'circles' },
  bca:     { key: 'bca',     label: 'BCA',       gradient: ['#003087','#00509E'], accentColor: '#90CAF9', logoText: 'BCA',       logoFile: '/logos/bca.svg',     pattern: 'waves'   },
  bni:     { key: 'bni',     label: 'BNI',       gradient: ['#003087','#0050A0'], accentColor: '#F47920', logoText: 'BNI',       logoFile: '/logos/bni.svg',     pattern: 'lines'   },
  mandiri: { key: 'mandiri', label: 'Mandiri',   gradient: ['#003368','#005099'], accentColor: '#F4A020', logoText: 'mandiri',   logoFile: '/logos/mandiri.svg', pattern: 'dots'    },
  bsi:     { key: 'bsi',     label: 'BSI',       gradient: ['#006633','#00884A'], accentColor: '#A5D6A7', logoText: 'BSI',       logoFile: '/logos/bsi.svg',     pattern: 'circles' },
  blu:     { key: 'blu',     label: 'Blu',       gradient: ['#0077CC','#00AAFF'], accentColor: '#B3E5FC', logoText: 'blu',       logoFile: '/logos/blu.svg',     pattern: 'waves'   },
  gopay:   { key: 'gopay',   label: 'GoPay',     gradient: ['#00880F','#00AA15'], accentColor: '#CCFF99', logoText: 'GoPay',     logoFile: '/logos/gopay.svg',   pattern: 'dots'    },
  dana:    { key: 'dana',    label: 'DANA',      gradient: ['#118EEA','#1565C0'], accentColor: '#90CAF9', logoText: 'DANA',      logoFile: '/logos/dana.svg',    pattern: 'circles' },
  shopee:  { key: 'shopee',  label: 'ShopeePay', gradient: ['#D73211','#EE4D2D'], accentColor: '#FFCCBC', logoText: 'ShopeePay', logoFile: '/logos/shopee.svg',  pattern: 'waves'   },
  ovo:     { key: 'ovo',     label: 'OVO',       gradient: ['#4B0080','#6A1B9A'], accentColor: '#E1BEE7', logoText: 'OVO',       logoFile: '/logos/ovo.svg',     pattern: 'lines'   },
  default: { key: 'default', label: 'Bank',      gradient: ['#37474F','#546E7A'], accentColor: '#B0BEC5', logoText: '?',                                          pattern: 'none'    },
}

function detectBrand(acc: GiftAccount): Brand {
  const raw = ((acc.type === 'bank' ? acc.bank : acc.platform) ?? '').toLowerCase()
  if (raw.includes('bri'))                            return BRANDS.bri
  if (raw.includes('bca'))                            return BRANDS.bca
  if (raw.includes('bni'))                            return BRANDS.bni
  if (raw.includes('mandiri'))                        return BRANDS.mandiri
  if (raw.includes('bsi'))                            return BRANDS.bsi
  if (raw.includes('blu'))                            return BRANDS.blu
  if (raw.includes('gopay') || raw.includes('gojek')) return BRANDS.gopay
  if (raw.includes('dana'))                           return BRANDS.dana
  if (raw.includes('shopee'))                         return BRANDS.shopee
  if (raw.includes('ovo'))                            return BRANDS.ovo
  return BRANDS.default
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

function formatNum(n: string) {
  return n.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim()
}

function Chip({ accent, size = 'md' }: { accent: string; size?: 'sm' | 'md' }) {
  const w = size === 'sm' ? 20 : 28
  const h = size === 'sm' ? 14 : 20
  return (
    <div style={{ width: w, height: h, borderRadius: 3, background: `${accent}44`, border: `1px solid ${accent}55`, position: 'relative', overflow: 'hidden', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: '33%', left: 0, right: 0, height: 1, background: `${accent}60` }} />
      <div style={{ position: 'absolute', left: '38%', top: 0, bottom: 0, width: 1, background: `${accent}60` }} />
    </div>
  )
}

function Contactless({ color }: { color: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
      <path d="M12 2C9.5 4.5 8 7.6 8 12s1.5 7.5 4 10"  stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M16 5.5C14.2 7.3 13 9.5 13 12s1.2 4.7 3 6.5" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M20 8.5C19 9.5 18.3 10.7 18.3 12s.7 2.5 1.7 3.5" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  )
}

function CardBg({ pattern, accent }: { pattern: Brand['pattern']; accent: string }) {
  if (pattern === 'circles') return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.4 }}>
      <circle cx="88%" cy="58%" r="70" fill="none" stroke={accent} strokeWidth="24" opacity="0.22" />
      <circle cx="88%" cy="58%" r="42" fill="none" stroke={accent} strokeWidth="16" opacity="0.18" />
      <circle cx="12%" cy="-10%" r="88" fill={`${accent}18`} />
    </svg>
  )
  if (pattern === 'waves') return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.3 }} preserveAspectRatio="none">
      <path d="M0,50 C80,10 160,90 240,50 C320,10 400,90 480,50 L480,180 L0,180Z" fill={`${accent}20`} />
      <path d="M0,72 C80,32 160,112 240,72 C320,32 400,112 480,72 L480,180 L0,180Z" fill={`${accent}16`} />
    </svg>
  )
  if (pattern === 'dots') return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.28 }}>
      {[0,1,2,3,4].map(r => [0,1,2,3,4,5,6,7].map(c => (
        <circle key={`${r}${c}`} cx={c * 16 + 8} cy={r * 16 + 8} r="1.8" fill={accent} />
      )))}
    </svg>
  )
  if (pattern === 'lines') return (
    <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.2 }} preserveAspectRatio="none">
      {[0,1,2,3,4,5,6].map(i => (
        <line key={i} x1={i*30-20} y1="0" x2={i*30+60} y2="200" stroke={accent} strokeWidth="11" />
      ))}
    </svg>
  )
  return null
}

function CopyBtn({ isCopied, onClick, g1 }: { isCopied: boolean; onClick: () => void; g1: string }) {
  return (
    <button onClick={onClick} style={{
      background: isCopied ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)',
      border: '1px solid rgba(255,255,255,0.28)',
      borderRadius: 9, padding: '5px 9px',
      display: 'flex', alignItems: 'center', gap: 4,
      cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
      backdropFilter: 'blur(6px)',
    }}>
      {isCopied
        ? <><Check size={10} color={g1} /><span style={{ fontSize: 8, fontWeight: 700, color: g1 }}>Tersalin</span></>
        : <><Copy size={10} color="rgba(255,255,255,0.9)" /><span style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Salin</span></>
      }
    </button>
  )
}

// ─── Full gradient card (Stack / Default) ─────────────────────────────────────

function BrandCard({ acc, index, copied, onCopy, showLogo, ratio = 1.75 }: {
  acc: GiftAccount; index: number; copied: string | null
  onCopy: (n: string) => void; showLogo: boolean; ratio?: number
}) {
  const brand   = detectBrand(acc)
  const [g1, g2] = brand.gradient
  const name     = acc.type === 'bank' ? (acc.bank ?? '') : (acc.platform ?? '')
  const isCopied = copied === acc.number

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: 0.08 + index * 0.1, duration: 0.5, ease: 'easeOut' } } }}
      className="relative overflow-hidden rounded-2xl select-none w-full"
      style={{
        background: `linear-gradient(135deg, ${g1} 0%, ${g2} 100%)`,
        aspectRatio: `${ratio} / 1`,
        boxShadow: `0 10px 32px -4px ${g1}60, 0 2px 10px rgba(0,0,0,0.2)`,
      }}
    >
      <CardBg pattern={brand.pattern} accent={brand.accentColor} />

      {/* Chip + contactless */}
      <div className="absolute flex items-center gap-1.5" style={{ top: 16, left: 18 }}>
        <Chip accent={brand.accentColor} />
        <Contactless color={`${brand.accentColor}70`} />
      </div>

      {/* Logo */}
      <div className="absolute" style={{ top: 14, right: 16 }}>
        {showLogo && brand.logoFile
          ? <img src={brand.logoFile} alt={brand.label} style={{ height: 22, width: 'auto', maxWidth: 80, objectFit: 'contain', filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.3))' }} />
          : <p style={{ fontSize: 14, fontWeight: 900, color: '#fff', letterSpacing: '0.07em', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}>{brand.logoText}</p>
        }
        <p style={{ fontSize: 6, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em', textAlign: 'right', marginTop: 2 }}>
          {acc.type === 'bank' ? 'BANK' : 'E-WALLET'}
        </p>
      </div>

      {/* Account number */}
      <p className="absolute" style={{ bottom: 34, left: 18, fontSize: 14, fontWeight: 700, letterSpacing: '0.2em', color: '#fff', fontFamily: 'monospace', textShadow: '0 1px 5px rgba(0,0,0,0.35)' }}>
        {formatNum(acc.number) || '—'}
      </p>

      {/* Name + copy */}
      <div className="absolute flex items-end justify-between" style={{ bottom: 12, left: 18, right: 14 }}>
        <div style={{ minWidth: 0, flex: 1, marginRight: 8 }}>
          <p style={{ fontSize: 6, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
            {acc.type === 'bank' ? 'a.n.' : 'akun'}
          </p>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', textShadow: '0 1px 3px rgba(0,0,0,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {acc.name || '—'}
          </p>
        </div>
        <CopyBtn isCopied={isCopied} onClick={() => onCopy(acc.number)} g1={g1} />
      </div>
    </motion.div>
  )
}

// ─── Grid card (compact, premium 2-col) ───────────────────────────────────────

function GridCard({ acc, index, copied, onCopy, showLogo }: {
  acc: GiftAccount; index: number; copied: string | null
  onCopy: (n: string) => void; showLogo: boolean
}) {
  const brand    = detectBrand(acc)
  const [g1, g2] = brand.gradient
  const name     = acc.type === 'bank' ? (acc.bank ?? '') : (acc.platform ?? '')
  const formatted = formatNum(acc.number)
  const isCopied  = copied === acc.number

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, scale: 0.94 }, visible: { opacity: 1, scale: 1, transition: { delay: 0.06 + index * 0.08, duration: 0.45, ease: 'easeOut' } } }}
      className="relative overflow-hidden rounded-2xl select-none flex flex-col"
      style={{
        background: `linear-gradient(150deg, ${g1} 0%, ${g2} 100%)`,
        boxShadow: `0 6px 20px -2px ${g1}55, 0 1px 6px rgba(0,0,0,0.15)`,
      }}
    >
      <CardBg pattern={brand.pattern} accent={brand.accentColor} />

      {/* Top section: logo + chip */}
      <div className="relative flex items-start justify-between p-3 pb-2">
        <Chip accent={brand.accentColor} size="sm" />
        <div className="flex flex-col items-end gap-0.5">
          {showLogo && brand.logoFile
            ? <img src={brand.logoFile} alt={brand.label} style={{ height: 16, width: 'auto', maxWidth: 60, objectFit: 'contain', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
            : <p style={{ fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: '0.06em' }}>{brand.logoText}</p>
          }
          <p style={{ fontSize: 5.5, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.14em' }}>
            {acc.type === 'bank' ? 'BANK' : 'EWALLET'}
          </p>
        </div>
      </div>

      {/* Number */}
      <div className="relative px-3 pb-1">
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.95)', fontFamily: 'monospace', textShadow: '0 1px 4px rgba(0,0,0,0.3)', lineHeight: 1.3 }}>
          {formatted || '—'}
        </p>
      </div>

      {/* Name + copy */}
      <div className="relative flex items-center justify-between px-3 pb-3 mt-auto">
        <div style={{ minWidth: 0, flex: 1, marginRight: 6 }}>
          <p style={{ fontSize: 8, fontWeight: 600, color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: '0.04em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {acc.name || name}
          </p>
        </div>
        <button onClick={() => onCopy(acc.number)} style={{
          background: isCopied ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.2)',
          border: '1px solid rgba(255,255,255,0.3)',
          borderRadius: 7, padding: '4px 7px',
          display: 'flex', alignItems: 'center', gap: 3,
          cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
          backdropFilter: 'blur(6px)',
        }}>
          {isCopied
            ? <><Check size={9} color={g1} /><span style={{ fontSize: 7, fontWeight: 700, color: g1 }}>OK!</span></>
            : <Copy size={9} color="rgba(255,255,255,0.9)" />
          }
        </button>
      </div>
    </motion.div>
  )
}

// ─── List row (premium) ───────────────────────────────────────────────────────

function ListCard({ acc, index, copied, onCopy, showLogo }: {
  acc: GiftAccount; index: number; copied: string | null
  onCopy: (n: string) => void; showLogo: boolean
}) {
  const brand    = detectBrand(acc)
  const [g1, g2] = brand.gradient
  const name     = acc.type === 'bank' ? (acc.bank ?? '') : (acc.platform ?? '')
  const formatted = formatNum(acc.number)
  const isCopied  = copied === acc.number

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, x: -12 }, visible: { opacity: 1, x: 0, transition: { delay: 0.05 + index * 0.07, duration: 0.4, ease: 'easeOut' } } }}
      className="relative overflow-hidden rounded-2xl flex items-stretch"
      style={{ boxShadow: `0 2px 12px ${g1}22, 0 1px 4px rgba(0,0,0,0.06)`, border: `1px solid ${g1}1a` }}
    >
      {/* Left gradient strip with logo */}
      <div className="relative overflow-hidden flex items-center justify-center shrink-0"
        style={{ width: 62, background: `linear-gradient(160deg, ${g1}, ${g2})` }}>
        <CardBg pattern={brand.pattern} accent={brand.accentColor} />
        <div className="relative z-10 flex flex-col items-center gap-1">
          {showLogo && brand.logoFile
            ? <img src={brand.logoFile} alt={brand.label} style={{ height: 20, width: 'auto', maxWidth: 50, objectFit: 'contain', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }} />
            : <p style={{ fontSize: 11, fontWeight: 900, color: '#fff', letterSpacing: '0.05em' }}>{brand.logoText.slice(0, 3)}</p>
          }
          <p style={{ fontSize: 5.5, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.1em', textAlign: 'center', lineHeight: 1 }}>
            {acc.type === 'bank' ? 'BANK' : 'WALLET'}
          </p>
        </div>
      </div>

      {/* Right info area */}
      <div className="flex-1 flex items-center gap-2 px-3 py-3" style={{ background: `linear-gradient(to right, ${g1}08, transparent)` }}>
        <div className="flex-1 min-w-0">
          <p style={{ fontSize: 9, fontWeight: 700, color: g1, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 3 }}>
            {name}
          </p>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#111827', fontFamily: 'monospace', letterSpacing: '0.13em', lineHeight: 1.2 }}>
            {formatted || '—'}
          </p>
          <p style={{ fontSize: 9, color: '#9ca3af', marginTop: 3, letterSpacing: '0.04em' }}>
            {acc.type === 'bank' ? 'a.n.' : 'akun'} {acc.name}
          </p>
        </div>

        {/* Copy pill */}
        <button onClick={() => onCopy(acc.number)}
          className="shrink-0 flex items-center gap-1.5 rounded-xl transition-all"
          style={{
            padding: '8px 12px',
            background: isCopied ? `linear-gradient(135deg, ${g1}, ${g2})` : `${g1}12`,
            border: `1.5px solid ${isCopied ? 'transparent' : `${g1}25`}`,
            cursor: 'pointer',
          }}>
          <AnimatePresence mode="wait">
            {isCopied ? (
              <motion.span key="done" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5">
                <Check size={11} color="#fff" />
                <span style={{ fontSize: 9, fontWeight: 700, color: '#fff' }}>Tersalin</span>
              </motion.span>
            ) : (
              <motion.span key="copy" initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5">
                <Copy size={11} color={g1} />
                <span style={{ fontSize: 9, fontWeight: 600, color: g1 }}>Salin</span>
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.div>
  )
}

// ─── Card Stack (swipe variant) ───────────────────────────────────────────────

const STACK_OFFSET = 16 // px each card peeks above the one in front
const STACK_SCALE  = 0.05 // scale reduction per level
const MAX_VISIBLE  = 3

function CardStack({ accounts, copied, onCopy, showLogo, accent }: {
  accounts: GiftAccount[]; copied: string | null
  onCopy: (n: string) => void; showLogo: boolean; accent: string
}) {
  const [idx, setIdx] = useState(0)

  // visible[0] = front card, visible[1] = first behind, visible[2] = furthest behind
  const visible = accounts.slice(idx, idx + MAX_VISIBLE)
  const behind  = visible.length - 1

  function goNext() { if (idx < accounts.length - 1) setIdx(i => i + 1) }
  function goPrev() { if (idx > 0) setIdx(i => i - 1) }

  // Container height = card height (from aspect ratio) + stack peek space on top
  // Using padding-bottom trick: paddingBottom = (1/ratio * 100)% gives the card height
  const cardRatio = 1.75
  const containerPB = `calc(${((1 / cardRatio) * 100).toFixed(2)}% + ${behind * STACK_OFFSET}px)`

  return (
    <div className="px-6">
      {/* Stack */}
      <div className="relative" style={{ paddingBottom: containerPB }}>
        {/* Render back→front so front card is on top in DOM stacking order */}
        {[...visible].reverse().map((acc, ri) => {
          // ri=0 is the furthest back card, ri=behind is the front card
          const fromFront = behind - ri      // 0=front, behind=furthest back
          const isFront   = fromFront === 0

          // top: front card is at (behind * OFFSET), back card is at 0
          const topPx = (behind - fromFront) * STACK_OFFSET
          const scale = 1 - fromFront * STACK_SCALE

          return (
            <motion.div
              key={`${accounts.indexOf(acc)}`}
              className="absolute left-0 right-0"
              animate={{ top: topPx, scale, opacity: 1 - fromFront * 0.18 }}
              transition={{ type: 'spring', stiffness: 280, damping: 28 }}
              style={{ transformOrigin: 'top center', zIndex: isFront ? 10 : behind - fromFront + 1 }}
              drag={isFront ? 'x' : false}
              dragConstraints={isFront ? { left: 0, right: 0 } : undefined}
              dragElastic={isFront ? 0.7 : 0}
              whileDrag={isFront ? { rotate: 2, scale: 1.02 } : {}}
              onDragEnd={isFront ? (_, info) => {
                if (info.offset.x < -80)      goNext()
                else if (info.offset.x > 80)  goPrev()
              } : undefined}
            >
              <BrandCard acc={acc} index={0} copied={copied} onCopy={onCopy} showLogo={showLogo} />
            </motion.div>
          )
        })}
      </div>

      {/* Nav row */}
      <div className="flex items-center justify-center gap-3 mt-5">
        <button onClick={goPrev} disabled={idx === 0}
          className="flex items-center justify-center rounded-full transition-all"
          style={{ width: 30, height: 30, background: `${accent}18`, opacity: idx === 0 ? 0.35 : 1 }}>
          <ChevronLeft size={16} color={accent} />
        </button>

        {/* Pill dots */}
        <div className="flex items-center gap-1.5">
          {accounts.map((_, i) => (
            <button key={i} onClick={() => setIdx(i)} style={{
              height: 5, width: i === idx ? 22 : 5, borderRadius: 3,
              background: i === idx ? accent : `${accent}38`,
              transition: 'all 0.28s ease',
              border: 'none', padding: 0, cursor: 'pointer',
            }} />
          ))}
        </div>

        <button onClick={goNext} disabled={idx >= accounts.length - 1}
          className="flex items-center justify-center rounded-full transition-all"
          style={{ width: 30, height: 30, background: `${accent}18`, opacity: idx >= accounts.length - 1 ? 0.35 : 1 }}>
          <ChevronRight size={16} color={accent} />
        </button>
      </div>

      <p className="text-center mt-1.5" style={{ fontSize: 9.5, color: `${accent}70`, letterSpacing: '0.1em' }}>
        Rekening {idx + 1} / {accounts.length}
      </p>
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────

function GiftHeader({ accent, text, font }: { accent: string; text: string; font: { body: string } }) {
  return (
    <div className="text-center mb-8">
      <motion.div className="flex items-center justify-center gap-3 mb-5"
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}>
        <div className="h-px flex-1 max-w-10" style={{ background: `linear-gradient(to right, transparent, ${accent}55)` }} />
        <p style={{ fontSize: fsb(10), letterSpacing: '0.36em', textTransform: 'uppercase', color: `${accent}80`, fontFamily: `'${font.body}', serif` }}>
          Amplop Digital
        </p>
        <div className="h-px flex-1 max-w-10" style={{ background: `linear-gradient(to left, transparent, ${accent}55)` }} />
      </motion.div>
      <motion.p
        style={{ fontSize: fsb(12), color: `${text}70`, fontFamily: `'${font.body}', serif`, lineHeight: 1.75 }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.15 } } }}>
        Kirimkan tanda kasih sayang Anda<br />melalui rekening berikut 💝
      </motion.p>
    </div>
  )
}

// ─── Upload bukti modal ───────────────────────────────────────────────────────

type ProofStep = 'form' | 'uploading-img' | 'success'

function ProofModal({ onClose, invitationId, accent, thankyouText }: {
  onClose: () => void
  invitationId: string
  accent: string
  thankyouText: string
}) {
  const [step, setStep]         = useState<ProofStep>('form')
  const [name, setName]         = useState('')
  const [proofUrl, setProofUrl] = useState<string | null>(null)
  const [submitting, setSubmit] = useState(false)
  const [imgErr, setImgErr]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) { setImgErr('Gunakan file gambar (JPG/PNG)'); return }
    if (file.size > 10 * 1024 * 1024)   { setImgErr('Maks 10MB'); return }
    setImgErr('')
    setStep('uploading-img')
    const fd = new FormData()
    fd.append('file', file)
    const res  = await fetch('/api/gift-proof/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setProofUrl(data.url ?? null)
    setStep('form')
  }

  async function submit() {
    if (!name.trim())  { setImgErr('Mohon isi nama pengirim terlebih dahulu'); return }
    if (!proofUrl)     { setImgErr('Silakan unggah foto bukti transfer terlebih dahulu'); return }
    setSubmit(true)
    await fetch('/api/gift-proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId, name: name.trim(), proofUrl }),
    })
    setSubmit(false)
    setStep('success')
  }

  return (
    <AnimatePresence>
      {/* Backdrop — absolute, confined to section bounds */}
      <motion.div
        key="backdrop"
        className="absolute inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(2px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Bottom sheet — slides up inside section */}
      <motion.div
        key="sheet"
        className="absolute bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl overflow-hidden"
        style={{ maxHeight: '88%' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-gray-200" />
        </div>

        {step === 'success' ? (
          /* ── Success state ── */
          <motion.div
            className="flex flex-col items-center px-8 pt-6 pb-10 text-center"
            initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}>
            {/* Animated check */}
            <motion.div
              className="flex items-center justify-center rounded-full mb-5"
              style={{ width: 72, height: 72, background: `linear-gradient(135deg, ${accent}22, ${accent}44)` }}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}>
              <Heart size={32} color={accent} fill={accent} />
            </motion.div>

            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
              Jazakallahu Khairan
            </h3>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.75 }}>
              {thankyouText}
            </p>

            <button onClick={onClose}
              className="mt-8 w-full py-3.5 rounded-2xl text-white font-semibold text-sm transition-all"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
              Tutup
            </button>
          </motion.div>
        ) : (
          /* ── Form state ── */
          <div className="overflow-y-auto px-6 pt-2 pb-8" style={{ maxHeight: 'calc(90dvh - 32px)' }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: '#111827' }}>Konfirmasi Transfer</h3>
                <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 1 }}>Alhamdulillah! Silakan isi form berikut sebagai konfirmasi</p>
              </div>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <X size={15} color="#6b7280" />
              </button>
            </div>

            {/* Name */}
            <div className="mb-4">
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Nama Pengirim
              </label>
              <input
                value={name} onChange={e => setName(e.target.value)}
                placeholder="Nama pengirim transfer"
                className="w-full mt-1.5 px-4 py-3 rounded-2xl border border-gray-200 text-sm text-gray-800 focus:outline-none transition-all"
                style={{ fontSize: 14 }}
                onFocus={e => (e.target.style.borderColor = accent)}
                onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
              />
            </div>

            {/* Image upload */}
            <div className="mb-4">
              <label style={{ fontSize: 11, fontWeight: 600, color: '#374151', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Foto Bukti Transfer
              </label>

              {proofUrl ? (
                <div className="mt-1.5 relative rounded-2xl overflow-hidden border border-gray-100" style={{ height: 160 }}>
                  <img src={proofUrl} alt="Bukti" className="w-full h-full object-cover" />
                  <button onClick={() => setProofUrl(null)}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1.5">
                    <X size={13} />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/55 text-white text-[10px] px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Check size={10} />
                    <span>Foto berhasil diupload</span>
                  </div>
                </div>
              ) : step === 'uploading-img' ? (
                <div className="mt-1.5 rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center py-10"
                  style={{ borderColor: `${accent}44` }}>
                  <Loader2 size={24} color={accent} className="animate-spin mb-2" />
                  <p style={{ fontSize: 12, color: '#9ca3af' }}>Mengupload foto...</p>
                </div>
              ) : (
                <button onClick={() => fileRef.current?.click()}
                  className="mt-1.5 w-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center py-8 transition-all"
                  style={{ borderColor: `${accent}33` }}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                    style={{ background: `${accent}15` }}>
                    <ImageIcon size={22} color={accent} />
                  </div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Unggah foto bukti transfer</p>
                  <p style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>JPG, PNG · Maks 10MB</p>
                </button>
              )}

              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
            </div>

            {imgErr && (
              <p className="text-xs text-red-500 -mt-2 mb-3">{imgErr}</p>
            )}

            <button onClick={submit} disabled={submitting || !name.trim() || !proofUrl}
              className="w-full py-4 rounded-2xl text-white font-semibold text-sm transition-all disabled:opacity-40"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)` }}>
              {submitting
                ? <span className="flex items-center justify-center gap-2"><Loader2 size={15} className="animate-spin" />Mengirim...</span>
                : 'Konfirmasi Sekarang ✓'
              }
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

// ─── Main section ──────────────────────────────────────────────────────────────

const DEFAULT_THANKYOU =
  'Terima kasih telah memberikan hadiah yang sangat berarti bagi kami.\n\nSemoga Allah SWT membalas kebaikan Bapak/Ibu/Saudara dengan keberkahan yang berlimpah, rezeki yang tidak putus, dan kebahagiaan yang tak ternilai. Barakallahu fiikum. 🤍'

export default function GiftSection({ section, data, meta, invitationId = 'preview' }: Props) {
  const { accent, text } = meta.color_scheme
  const font       = resolveFont(meta, section)
  const accounts   = data.gift_accounts ?? []
  const variant    = section.style_variant ?? 'default'
  const showLogo   = section.gift_show_logo ?? true
  const proofEnabled = section.gift_proof_enabled ?? true
  const thankyouText = section.gift_thankyou_text ?? DEFAULT_THANKYOU

  const [copied,    setCopied]    = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  if (accounts.length === 0) return null

  function copyNumber(number: string) {
    navigator.clipboard.writeText(number).then(() => {
      setCopied(number)
      setTimeout(() => setCopied(null), 2500)
    })
  }

  const shared = { copied, onCopy: copyNumber, showLogo }

  // Upload bukti button — premium card-row style
  const proofButton = proofEnabled && (
    <motion.div
      className="mt-5"
      variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0, transition: { delay: 0.4 } } }}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="h-px flex-1" style={{ background: `${accent}20` }} />
        <p style={{ fontSize: 9, color: `${accent}60`, letterSpacing: '0.18em', textTransform: 'uppercase' }}>Sudah mengirim hadiah?</p>
        <div className="h-px flex-1" style={{ background: `${accent}20` }} />
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98]"
        style={{
          background: `linear-gradient(135deg, ${accent}12, ${accent}06)`,
          border: `1.5px solid ${accent}28`,
          boxShadow: `0 2px 16px ${accent}14`,
        }}
      >
        {/* Icon pill */}
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `linear-gradient(135deg, ${accent}, ${accent}bb)`, boxShadow: `0 3px 10px ${accent}44` }}>
          <Upload size={17} color="white" />
        </div>
        {/* Text */}
        <div className="flex-1 text-left">
          <p style={{ fontSize: 13, fontWeight: 700, color: accent, lineHeight: 1.25 }}>Konfirmasi Transfer Hadiah</p>
          <p style={{ fontSize: 10, color: `${accent}80`, marginTop: 1 }}>Beritahu kami setelah mengirim hadiah</p>
        </div>
        {/* Arrow */}
        <ChevronRight size={15} color={`${accent}55`} strokeWidth={2.5} />
      </button>
    </motion.div>
  )

  // ── Swipe (card stack): full-bleed ─────────────────────────────────────────
  const modal = showModal
    ? <ProofModal onClose={() => setShowModal(false)} invitationId={invitationId} accent={accent} thankyouText={thankyouText} />
    : undefined

  if (variant === 'swipe') {
    return (
      <SectionWrapper section={section} overlay={modal}>
        <div className="w-full py-10">
          <motion.div className="px-6 max-w-sm mx-auto"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
            <GiftHeader accent={accent} text={text} font={font} />
          </motion.div>
          <div className="max-w-sm mx-auto">
            <CardStack accounts={accounts} {...shared} accent={accent} />
          </div>
          {proofEnabled && (
            <div className="px-6 max-w-sm mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
                {proofButton}
              </motion.div>
            </div>
          )}
        </div>
      </SectionWrapper>
    )
  }

  return (
    <SectionWrapper section={section} className="px-6" overlay={modal}>
      <div className="max-w-sm mx-auto w-full py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>

          <GiftHeader accent={accent} text={text} font={font} />

          {variant === 'grid' && (
            <div className="grid grid-cols-2 gap-3">
              {accounts.map((acc, i) => <GridCard key={i} acc={acc} index={i} {...shared} />)}
            </div>
          )}

          {variant === 'list' && (
            <div className="space-y-2.5">
              {accounts.map((acc, i) => <ListCard key={i} acc={acc} index={i} {...shared} />)}
            </div>
          )}

          {(variant === 'default' || !['grid','list','swipe'].includes(variant)) && (
            <div className="space-y-4">
              {accounts.map((acc, i) => <BrandCard key={i} acc={acc} index={i} {...shared} />)}
            </div>
          )}

          {proofButton}

        </motion.div>
      </div>
    </SectionWrapper>
  )
}
