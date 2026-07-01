'use client'

import { useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { SectionConfig, NewInvitationData, TemplateMeta, GiftAccount } from '@/lib/types'
import SectionWrapper, { resolveFont, fsh, fsb } from '../SectionWrapper'
import SectionOrnament from '../SectionOrnament'
import { getComponentStyle, btnStyle } from '@/lib/component-styles'
import { Copy, Check, ChevronLeft, ChevronRight, Upload, X, ImageIcon, Loader2, Heart, Send } from 'lucide-react'

interface Props {
  section: SectionConfig
  data: NewInvitationData
  meta: TemplateMeta
  invitationId?: string
}

//  Brand config 

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

function accountKey(acc: GiftAccount): string {
  return `${acc.type}-${acc.type === 'bank' ? acc.bank : acc.platform}-${acc.number}`
}

//  Shared helpers 

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

//  Copy button with animation 

function CopyBtn({ isCopied, onClick, g1, size = 'md' }: { isCopied: boolean; onClick: () => void; g1: string; size?: 'sm' | 'md' }) {
  const pad = size === 'sm' ? '4px 8px' : '6px 10px'
  const radius = size === 'sm' ? 8 : 10
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.92 }}
      style={{
        background: isCopied ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.18)',
        border: '1px solid rgba(255,255,255,0.28)',
        borderRadius: radius, padding: pad,
        display: 'flex', alignItems: 'center', gap: 4,
        cursor: 'pointer', transition: 'all 0.2s', flexShrink: 0,
        backdropFilter: 'blur(6px)',
      }}>
      <AnimatePresence mode="wait">
        {isCopied ? (
          <motion.span key="done" className="flex items-center gap-1" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Check size={size === 'sm' ? 9 : 10} color={g1} />
            <span style={{ fontSize: size === 'sm' ? 7 : 8, fontWeight: 700, color: g1 }}>Tersalin!</span>
          </motion.span>
        ) : (
          <motion.span key="copy" className="flex items-center gap-1" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
            <Copy size={size === 'sm' ? 9 : 10} color="rgba(255,255,255,0.9)" />
            <span style={{ fontSize: size === 'sm' ? 7 : 8, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>Salin</span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

//  Full gradient card 

function BrandCard({ acc, index, copied, onCopy, showLogo, ratio = 1.75 }: {
  acc: GiftAccount; index: number; copied: string | null
  onCopy: (n: string) => void; showLogo: boolean; ratio?: number
}) {
  const brand   = detectBrand(acc)
  const [g1, g2] = brand.gradient
  const isCopied = copied === acc.number

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { delay: 0.08 + index * 0.1, duration: 0.5, ease: 'easeOut' } } }}
      initial="hidden"
      animate="visible"
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
        {formatNum(acc.number) || '···'}
      </p>

      {/* Name + copy */}
      <div className="absolute flex items-end justify-between" style={{ bottom: 12, left: 18, right: 14 }}>
        <div style={{ minWidth: 0, flex: 1, marginRight: 8 }}>
          <p style={{ fontSize: 6, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 2 }}>
            {acc.type === 'bank' ? 'a.n.' : 'akun'}
          </p>
          <p style={{ fontSize: 10, fontWeight: 600, color: '#fff', textTransform: 'uppercase', letterSpacing: '0.05em', textShadow: '0 1px 3px rgba(0,0,0,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {acc.name || '···'}
          </p>
        </div>
        <CopyBtn isCopied={isCopied} onClick={() => onCopy(acc.number)} g1={g1} />
      </div>
    </motion.div>
  )
}

//  Card Stack (swipe variant) 

const STACK_OFFSET = 14
const STACK_SCALE  = 0.04
const MAX_VISIBLE  = 3

function CardStack({ accounts, copied, onCopy, showLogo, accent }: {
  accounts: GiftAccount[]; copied: string | null
  onCopy: (n: string) => void; showLogo: boolean; accent: string
}) {
  const [idx, setIdx] = useState(0)
  const visible = accounts.slice(idx, idx + MAX_VISIBLE)
  const behind  = visible.length - 1

  function goNext() { if (idx < accounts.length - 1) setIdx(i => i + 1) }
  function goPrev() { if (idx > 0) setIdx(i => i - 1) }

  const cardRatio = 1.75
  const containerPB = `calc(${((1 / cardRatio) * 100).toFixed(2)}% + ${behind * STACK_OFFSET}px)`

  return (
    <div className="px-6">
      <div className="relative" style={{ paddingBottom: containerPB }}>
        {[...visible].reverse().map((acc, ri) => {
          const fromFront = behind - ri
          const isFront   = fromFront === 0
          const topPx = (behind - fromFront) * STACK_OFFSET
          const scale = 1 - fromFront * STACK_SCALE

          return (
            <motion.div
              key={accountKey(acc)}
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

      {/* Nav */}
      {accounts.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-5">
          <motion.button onClick={goPrev} disabled={idx === 0} whileTap={{ scale: 0.85 }}
            className="flex items-center justify-center rounded-full transition-all"
            style={{ width: 32, height: 32, background: `${accent}22`, opacity: idx === 0 ? 0.35 : 1, border: `1px solid ${accent}35` }}>
            <ChevronLeft size={16} color={accent} />
          </motion.button>

          <div className="flex items-center gap-1.5">
            {accounts.map((_, i) => (
              <motion.button key={i} onClick={() => setIdx(i)}
                animate={{ width: i === idx ? 20 : 6, background: i === idx ? accent : `${accent}50` }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                style={{ height: 6, borderRadius: 3, border: 'none', padding: 0, cursor: 'pointer' }} />
            ))}
          </div>

          <motion.button onClick={goNext} disabled={idx >= accounts.length - 1} whileTap={{ scale: 0.85 }}
            className="flex items-center justify-center rounded-full transition-all"
            style={{ width: 32, height: 32, background: `${accent}22`, opacity: idx >= accounts.length - 1 ? 0.35 : 1, border: `1px solid ${accent}35` }}>
            <ChevronRight size={16} color={accent} />
          </motion.button>
        </div>
      )}

      {accounts.length > 1 && (
        <p className="text-center mt-2" style={{ fontSize: 9, color: `${accent}60`, letterSpacing: '0.12em' }}>
          Geser kartu atau tekan panah
        </p>
      )}
    </div>
  )
}

//  Section header 

function GiftHeader({ accent, text, font }: { accent: string; text: string; font: { heading: string; body: string } }) {
  return (
    <div className="text-center mb-8">
      {/* Subtle ornament */}
      <motion.div
        className="mb-5"
        variants={{ hidden: { opacity: 0, scaleX: 0 }, visible: { opacity: 1, scaleX: 1, transition: { duration: 0.5 } } }}
      >
        <SectionOrnament accent={accent} />
      </motion.div>

      {/* Title */}
      <motion.p
        style={{
          fontSize: fsb(9), letterSpacing: '0.32em', textTransform: 'uppercase',
          color: `${accent}80`, fontFamily: `'${font.body}', serif`, marginBottom: 10,
        }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.06 } } }}
      >
        Kirim Hadiah
      </motion.p>

      <motion.h2
        style={{ fontSize: fsh(18), fontWeight: 600, color: text, fontFamily: `'${font.heading}', serif`, marginBottom: 10, letterSpacing: '-0.01em' }}
        variants={{ hidden: { opacity: 0, y: 8 }, visible: { opacity: 1, y: 0, transition: { delay: 0.1 } } }}
      >
        Amplop Digital
      </motion.h2>

      {/* UX copy */}
      <motion.p
        style={{ fontSize: fsb(10.5), color: `${text}88`, fontFamily: `'${font.body}', serif`, lineHeight: 1.8, maxWidth: 250, margin: '0 auto' }}
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.18 } } }}>
        Bagi yang berhalangan hadir, doa restu Anda sudah lebih dari cukup. Namun jika ingin mengirimkan tanda kasih, bisa melalui rekening di bawah ini.
      </motion.p>
    </div>
  )
}

//  Proof upload bottom sheet (minimal redesign) 

type ProofStep = 'form' | 'uploading-img' | 'success'

function ProofModal({ onClose, invitationId, accent, thankyouText }: {
  onClose: () => void
  invitationId: string
  accent: string
  thankyouText: string
}) {
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  const [step, setStep]         = useState<ProofStep>('form')
  const [name, setName]         = useState('')
  const [amount, setAmount]     = useState('')
  const [message, setMessage]   = useState('')
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
    fd.append('invitationId', invitationId)
    const res  = await fetch('/api/gift-proof/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setProofUrl(data.url ?? null)
    setStep('form')
  }

  async function submit() {
    if (!name.trim())  { setImgErr('Mohon isi nama pengirim'); return }
    if (!proofUrl)     { setImgErr('Silakan unggah foto bukti transfer'); return }
    setSubmit(true)
    await fetch('/api/gift-proof', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invitationId, name: name.trim(), amount: amount.trim(), message: message.trim(), proofUrl }),
    })
    setSubmit(false)
    setStep('success')
  }

  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 12,
    border: '1px solid #e5e7eb', fontSize: 13, color: '#1f2937',
    outline: 'none', transition: 'border-color 0.15s',
    background: '#fafafa',
  }

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        className="fixed inset-0 z-[9998]"
        style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }}
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        key="sheet"
        className="fixed bottom-0 left-0 right-0 z-[9999] bg-white rounded-t-[28px] overflow-hidden"
        style={{ maxHeight: '88%' }}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 320, damping: 34 }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-9 h-1 rounded-full bg-gray-200" />
        </div>

        {step === 'success' ? (
          <motion.div
            className="flex flex-col items-center px-8 pt-4 pb-10 text-center"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}>
            <motion.div
              className="flex items-center justify-center rounded-full mb-5"
              style={{ width: 56, height: 56, background: `${accent}20` }}
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}>
              <Heart size={24} color={accent} fill={accent} />
            </motion.div>

            <p style={{ fontSize: 16, fontWeight: 600, color: '#111827', marginBottom: 6 }}>
              Terima Kasih
            </p>
            <p style={{ fontSize: 12, color: '#9ca3af', lineHeight: 1.75, whiteSpace: 'pre-line', maxWidth: 260 }}>
              {thankyouText}
            </p>

            <button onClick={onClose}
              className="mt-7 px-8 py-2.5 rounded-full text-sm font-medium transition-all active:scale-[0.97]"
              style={{ color: accent, border: `1px solid ${accent}40`, background: `${accent}12` }}>
              Tutup
            </button>
          </motion.div>
        ) : (
          <div className="overflow-y-auto px-6 pt-1 pb-8" style={{ maxHeight: 'calc(85dvh - 40px)' }}>

            {/* Compact header */}
            <div className="flex items-center justify-between mb-5">
              <p style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>Konfirmasi Transfer</p>
              <button onClick={onClose}
                className="w-7 h-7 flex items-center justify-center rounded-full transition-colors"
                style={{ background: '#f3f4f6' }}>
                <X size={13} color="#9ca3af" />
              </button>
            </div>

            {/* Fields  clean, breathing room */}
            <div className="space-y-3.5">
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6b7280', marginBottom: 5 }}>
                  Nama pengirim
                </label>
                <input
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="Nama Anda"
                  style={fieldStyle}
                  onFocus={e => (e.target.style.borderColor = accent)}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6b7280', marginBottom: 5 }}>
                  Nominal <span style={{ color: '#d1d5db' }}>(opsional)</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 13, color: '#9ca3af' }}>Rp</span>
                  <input
                    value={amount} onChange={e => setAmount(e.target.value)}
                    placeholder="100.000"
                    style={{ ...fieldStyle, paddingLeft: 36 }}
                    onFocus={e => (e.target.style.borderColor = accent)}
                    onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6b7280', marginBottom: 5 }}>
                  Pesan <span style={{ color: '#d1d5db' }}>(opsional)</span>
                </label>
                <textarea
                  value={message} onChange={e => setMessage(e.target.value)}
                  placeholder="Selamat menempuh hidup baru..."
                  rows={2}
                  style={{ ...fieldStyle, resize: 'none' }}
                  onFocus={e => (e.target.style.borderColor = accent)}
                  onBlur={e => (e.target.style.borderColor = '#e5e7eb')}
                />
              </div>

              {/* Upload area */}
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: '#6b7280', marginBottom: 5 }}>
                  Bukti transfer
                </label>

                {proofUrl ? (
                  <div className="relative rounded-xl overflow-hidden" style={{ height: 120, border: '1px solid #e5e7eb' }}>
                    <img src={proofUrl} alt="Bukti" className="w-full h-full object-cover" />
                    <button onClick={() => setProofUrl(null)}
                      className="absolute top-2 right-2 rounded-full p-1"
                      style={{ background: 'rgba(0,0,0,0.5)' }}>
                      <X size={11} color="white" />
                    </button>
                  </div>
                ) : step === 'uploading-img' ? (
                  <div className="rounded-xl flex items-center justify-center py-8"
                    style={{ border: '1.5px dashed #d1d5db', background: '#fafafa' }}>
                    <Loader2 size={18} color={accent} className="animate-spin" />
                  </div>
                ) : (
                  <button onClick={() => fileRef.current?.click()}
                    className="w-full rounded-xl flex items-center justify-center gap-2 py-5 transition-all"
                    style={{ border: '1.5px dashed #d1d5db', background: '#fafafa' }}>
                    <ImageIcon size={15} color="#9ca3af" />
                    <span style={{ fontSize: 12, color: '#9ca3af' }}>Upload foto bukti</span>
                  </button>
                )}

                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }} />
              </div>
            </div>

            {imgErr && (
              <p className="flex items-center gap-1 mt-3" style={{ fontSize: 11, color: '#ef4444' }}>
                <X size={10} /> {imgErr}
              </p>
            )}

            {/* Submit  clean pill */}
            <motion.button
              onClick={submit}
              disabled={submitting || !name.trim() || !proofUrl}
              whileTap={{ scale: 0.97 }}
              className="w-full mt-5 flex items-center justify-center gap-2 rounded-xl transition-all disabled:opacity-35"
              style={{
                padding: '12px 0',
                background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                color: '#fff', fontSize: 13, fontWeight: 600,
                boxShadow: `0 2px 10px ${accent}28`,
              }}>
              {submitting
                ? <><Loader2 size={13} className="animate-spin" /> Mengirim...</>
                : <><Send size={13} /> Kirim Konfirmasi</>
              }
            </motion.button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

//  Minimal proof CTA 

function ProofCTA({ accent, text, onClick, cs }: { accent: string; text: string; onClick: () => void; cs: ReturnType<typeof getComponentStyle> }) {
  return (
    <motion.div
      className="mt-8"
      variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { delay: 0.4 } } }}
    >
      {/* Soft divider */}
      <div className="flex items-center gap-3 mb-4">
        <div style={{ flex: 1, height: 0.5, background: `${accent}30` }} />
        <span style={{ fontSize: 8, color: `${text}60`, letterSpacing: '0.2em', textTransform: 'uppercase' }}>sudah transfer?</span>
        <div style={{ flex: 1, height: 0.5, background: `${accent}30` }} />
      </div>

      <div className="flex justify-center">
        <motion.button
          onClick={onClick}
          whileTap={{ scale: 0.98 }}
          className="flex items-center justify-center gap-2 transition-all"
          style={{
            ...btnStyle(cs.button, cs.border, accent, text, { size: 'sm', icon: true }),
          }}
        >
          <Upload size={12} />
          Konfirmasi &amp; kirim bukti
        </motion.button>
      </div>
    </motion.div>
  )
}

//  Constants 

const MAX_CARDS = 3

//  Main section 

const DEFAULT_THANKYOU =
  'Terima kasih telah memberikan hadiah yang sangat berarti bagi kami.\n\nSemoga Allah SWT membalas kebaikan Bapak/Ibu/Saudara dengan keberkahan yang berlimpah. Barakallahu fiikum.'

export default function GiftSection({ section, data, meta, invitationId = 'preview' }: Props) {
  const { accent, text } = meta.color_scheme
  const font       = resolveFont(meta, section)
  const cs         = getComponentStyle(meta.component_style)
  const accounts   = (data.gift_accounts ?? []).slice(0, MAX_CARDS)
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

  const proofCta = proofEnabled && (
    <ProofCTA accent={accent} text={text} onClick={() => setShowModal(true)} cs={cs} />
  )

  const modal = showModal
    ? <ProofModal onClose={() => setShowModal(false)} invitationId={invitationId} accent={accent} thankyouText={thankyouText} />
    : undefined

  // Stable key that changes when account list changes  forces re-render with animations
  const accountsFingerprint = accounts.map(accountKey).join('|')

  //  Variant: Swipe (card stack) 
  if (variant === 'swipe') {
    return (
      <SectionWrapper section={section} overlay={modal}>
        <div className="w-full py-10">
          <motion.div className="px-6 max-w-sm mx-auto"
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
            <GiftHeader accent={accent} text={text} font={font} />
          </motion.div>
          <div className="max-w-sm mx-auto" key={accountsFingerprint}>
            <CardStack accounts={accounts} {...shared} accent={accent} />
          </div>
          {proofEnabled && (
            <div className="px-6 max-w-sm mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
                {proofCta}
              </motion.div>
            </div>
          )}
        </div>
      </SectionWrapper>
    )
  }

  //  Default: Stack 
  return (
    <SectionWrapper section={section} className="px-6" overlay={modal}>
      <div className="max-w-sm mx-auto w-full py-10">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-40px' }}>
          <GiftHeader accent={accent} text={text} font={font} />
        </motion.div>

        <AnimatePresence mode="popLayout">
          {accounts.map((acc, i) => (
            <motion.div
              key={accountKey(acc)}
              initial={{ opacity: 0, y: 16, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ delay: 0.06 * i, duration: 0.4, ease: 'easeOut' }}
              style={{ marginBottom: i < accounts.length - 1 ? 16 : 0 }}
            >
              <BrandCard acc={acc} index={i} {...shared} />
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
          {proofCta}
        </motion.div>
      </div>
    </SectionWrapper>
  )
}
