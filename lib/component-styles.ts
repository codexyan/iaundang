import type { ComponentStyle, ButtonVariant, BorderVariant } from './types'

const DEFAULT_STYLE: ComponentStyle = {
  button: 'outlined',
  border: 'sharp',
  ornament: 'classic',
}

export function getComponentStyle(style?: ComponentStyle): ComponentStyle {
  return { ...DEFAULT_STYLE, ...style }
}

export function btnRadius(border: BorderVariant): number {
  switch (border) {
    case 'pill': return 999
    case 'rounded': return 10
    case 'sharp':
    default: return 2
  }
}

export function btnStyle(
  variant: ButtonVariant,
  border: BorderVariant,
  accent: string,
  text: string,
  opts?: { disabled?: boolean; size?: 'sm' | 'md' | 'lg'; icon?: boolean }
): React.CSSProperties {
  const r = btnRadius(border)
  const disabled = opts?.disabled
  const sz = opts?.size ?? 'md'
  const hasIcon = opts?.icon
  const py = sz === 'sm' ? 8 : sz === 'lg' ? 16 : 12
  const px = hasIcon
    ? (sz === 'sm' ? 16 : sz === 'lg' ? 40 : 28)
    : (sz === 'sm' ? 20 : sz === 'lg' ? 48 : 36)
  const fs = sz === 'sm' ? 8 : sz === 'lg' ? 11 : 9.5
  const underlinePx = sz === 'sm' ? 8 : sz === 'lg' ? 14 : 10

  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: `${py}px ${px}px`,
    fontSize: fs,
    fontWeight: 500,
    letterSpacing: '0.18em',
    textTransform: 'uppercase',
    borderRadius: r,
    cursor: disabled ? 'default' : 'pointer',
    transition: 'all 0.25s ease',
  }

  switch (variant) {
    case 'filled':
      return {
        ...base,
        backgroundColor: disabled ? `${accent}40` : accent,
        color: disabled ? `${text}60` : text,
        border: '1px solid transparent',
        boxShadow: disabled ? 'none' : `0 2px 12px ${accent}30`,
      }
    case 'pill':
      return {
        ...base,
        // borderRadius mengikuti cs.border (base.borderRadius)   jangan hardcode 999,
        // supaya Gaya Sudut/Border tetap berlaku meski Gaya Tombol = Pill
        backgroundColor: disabled ? `${accent}15` : `${accent}20`,
        color: disabled ? `${text}50` : text,
        border: `1px solid ${disabled ? `${accent}20` : `${accent}45`}`,
        backdropFilter: 'blur(4px)',
      }
    case 'ghost':
      return {
        ...base,
        backgroundColor: 'transparent',
        color: disabled ? `${text}40` : accent,
        border: '1px solid transparent',
      }
    case 'underline':
      return {
        ...base,
        backgroundColor: 'transparent',
        color: disabled ? `${text}40` : text,
        border: 'none',
        borderBottom: `1.5px solid ${disabled ? `${accent}25` : `${accent}60`}`,
        // Underline tanpa sisi kiri/kanan/atas   radius tidak relevan secara visual,
        // tapi tetap ikut cs.border (base.borderRadius) untuk konsistensi, bukan hardcode 0.
        // Padding horizontal dikecilkan dari base (tidak butuh ruang box) tapi jangan sampai
        // mepet ke tepi seperti sebelumnya (4px terlihat "tanpa padding")
        paddingLeft: underlinePx,
        paddingRight: underlinePx,
      }
    case 'outlined':
    default:
      return {
        ...base,
        backgroundColor: 'transparent',
        color: disabled ? `${text}50` : text,
        border: `1px solid ${disabled ? `${accent}28` : `${accent}50`}`,
      }
  }
}

export function cardRadius(border: BorderVariant): number {
  switch (border) {
    case 'pill': return 20
    case 'rounded': return 12
    case 'sharp':
    default: return 0
  }
}

export function inputBorderStyle(border: BorderVariant, accent: string, focused?: boolean): React.CSSProperties {
  const color = focused ? `${accent}70` : `${accent}35`
  switch (border) {
    case 'pill':
      return { border: `1px solid ${color}`, borderRadius: 999, padding: '10px 18px' }
    case 'rounded':
      return { border: `1px solid ${color}`, borderRadius: 10, padding: '10px 14px' }
    case 'sharp':
    default:
      return { border: 'none', borderBottom: `1px solid ${color}`, borderRadius: 0, padding: '10px 0' }
  }
}
