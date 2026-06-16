'use client'

import type { OpeningConfig } from '@/lib/types'

interface Props {
  style?: OpeningConfig['couple_name_connector']
  size?: number
  color: string
  fontFamily: string
  primary?: string
}

export default function CoupleNameConnector({ style = 'ampersand', size = 26, color, fontFamily, primary }: Props) {
  const shadow = primary ? `0 2px 12px ${primary}aa` : undefined

  switch (style) {
    case 'heart':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ filter: shadow ? `drop-shadow(${shadow})` : undefined }}>
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      )
    case 'dot':
      return (
        <span style={{ fontSize: size * 0.6, color, textShadow: shadow, lineHeight: 1 }}>●</span>
      )
    case 'dash':
      return (
        <div style={{ width: size * 1.2, height: 1.5, backgroundColor: color, borderRadius: 1, boxShadow: shadow }} />
      )
    case 'ring':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={{ filter: shadow ? `drop-shadow(${shadow})` : undefined }}>
          <circle cx="9" cy="12" r="6" />
          <circle cx="15" cy="12" r="6" />
        </svg>
      )
    case 'flower':
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill={color} style={{ filter: shadow ? `drop-shadow(${shadow})` : undefined, opacity: 0.85 }}>
          <circle cx="12" cy="12" r="3" />
          {[0, 60, 120, 180, 240, 300].map(deg => (
            <ellipse key={deg} cx="12" cy="6" rx="2.5" ry="4" transform={`rotate(${deg} 12 12)`} opacity="0.6" />
          ))}
        </svg>
      )
    case 'ampersand':
    default:
      return (
        <span style={{
          fontSize: size, color,
          fontFamily,
          fontWeight: 300, fontStyle: 'italic',
          letterSpacing: '0.05em',
          textShadow: shadow,
        }}>
          &amp;
        </span>
      )
  }
}
