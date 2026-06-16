'use client'

type SeparatorStyle = 'diamond' | 'dot' | 'line' | 'floral' | 'star' | 'wave'

interface Props {
  style?: SeparatorStyle
  accent: string
  primary?: string
  width?: number
}

export default function SeparatorOrnament({ style = 'diamond', accent, primary, width = 160 }: Props) {
  const lineColor = `${accent}66`
  const lineGradL = `linear-gradient(to right, transparent, ${accent}88)`
  const lineGradR = `linear-gradient(to left, transparent, ${accent}88)`

  const centerElement = (() => {
    switch (style) {
      case 'diamond':
        return (
          <svg width="14" height="14" viewBox="0 0 14 14" style={{ flexShrink: 0 }}>
            <path d="M7 0 L14 7 L7 14 L0 7 Z" fill={accent} fillOpacity="0.8" />
            {primary && <path d="M7 3 L11 7 L7 11 L3 7 Z" fill={primary} />}
            <path d="M7 4.5 L9.5 7 L7 9.5 L4.5 7 Z" fill={accent} fillOpacity="0.6" />
          </svg>
        )
      case 'dot':
        return (
          <div style={{ width: 5, height: 5, borderRadius: '50%', backgroundColor: accent, opacity: 0.8, flexShrink: 0 }} />
        )
      case 'line':
        return null
      case 'floral':
        return (
          <span style={{ fontSize: 14, color: accent, opacity: 0.8, lineHeight: 1, flexShrink: 0 }}>❦</span>
        )
      case 'star':
        return (
          <span style={{ fontSize: 10, color: accent, opacity: 0.85, lineHeight: 1, flexShrink: 0 }}>✦</span>
        )
      case 'wave':
        return (
          <svg width="24" height="8" viewBox="0 0 24 8" style={{ flexShrink: 0 }}>
            <path d="M0 4 Q3 0 6 4 Q9 8 12 4 Q15 0 18 4 Q21 8 24 4" fill="none" stroke={accent} strokeWidth="1" strokeOpacity="0.7" />
          </svg>
        )
      default:
        return <div style={{ width: 4, height: 4, transform: 'rotate(45deg)', backgroundColor: accent, opacity: 0.8, flexShrink: 0 }} />
    }
  })()

  if (style === 'line') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', width }}>
        <div style={{ flex: 1, height: '0.5px', background: lineGradL }} />
        <div style={{ width: 8 }} />
        <div style={{ flex: 1, height: '0.5px', background: lineGradR }} />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: style === 'wave' ? 4 : 8, width }}>
      <div style={{ flex: 1, height: '0.5px', background: lineGradL }} />
      {centerElement}
      <div style={{ flex: 1, height: '0.5px', background: lineGradR }} />
    </div>
  )
}
