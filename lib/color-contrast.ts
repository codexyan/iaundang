/**
 * WCAG 2.1 Color Contrast Utilities
 * Ensures all color combinations meet AA (4.5:1) or AAA (7:1) standards.
 */

/** Parse hex color to RGB tuple */
export function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = h.length === 3
    ? parseInt(h[0]+h[0]+h[1]+h[1]+h[2]+h[2], 16)
    : parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Convert RGB tuple back to hex */
export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(c => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0')).join('')
}

/** Relative luminance per WCAG 2.1 */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map(c => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** Contrast ratio between two colors (1:1 to 21:1) */
export function contrastRatio(fg: string, bg: string): number {
  const l1 = luminance(fg)
  const l2 = luminance(bg)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

/** WCAG level for given contrast ratio */
export function wcagLevel(ratio: number): 'AAA' | 'AA' | 'FAIL' {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'FAIL'
}

/** WCAG level for large text (>= 18pt or >= 14pt bold) */
export function wcagLevelLarge(ratio: number): 'AAA' | 'AA' | 'FAIL' {
  if (ratio >= 4.5) return 'AAA'
  if (ratio >= 3) return 'AA'
  return 'FAIL'
}

/** Is a color considered "light"? (luminance > 0.179) */
export function isLight(hex: string): boolean {
  return luminance(hex) > 0.179
}

/**
 * HSL utilities for smart color adjustment
 */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h = 0
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6
  else if (max === g) h = ((b - r) / d + 2) / 6
  else h = ((r - g) / d + 4) / 6
  return [h, s, l]
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  if (s === 0) { const v = Math.round(l * 255); return [v, v, v] }
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1; if (t > 1) t -= 1
    if (t < 1/6) return p + (q - p) * 6 * t
    if (t < 1/2) return q
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6
    return p
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q
  return [
    Math.round(hue2rgb(p, q, h + 1/3) * 255),
    Math.round(hue2rgb(p, q, h) * 255),
    Math.round(hue2rgb(p, q, h - 1/3) * 255),
  ]
}

/**
 * Adjust a foreground color to meet target contrast ratio against background.
 * Preserves hue and saturation, only modifies lightness.
 * Returns the adjusted hex color.
 */
export function adjustForContrast(fg: string, bg: string, targetRatio: number = 4.5): string {
  const current = contrastRatio(fg, bg)
  if (current >= targetRatio) return fg

  const [r, g, b] = hexToRgb(fg)
  const [h, s] = rgbToHsl(r, g, b)
  const bgLum = luminance(bg)
  const bgIsLight = bgLum > 0.179

  // Binary search for the right lightness
  let lo = bgIsLight ? 0 : 0.5
  let hi = bgIsLight ? 0.5 : 1
  let bestL = bgIsLight ? 0 : 1
  let bestRatio = 0

  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    const [tr, tg, tb] = hslToRgb(h, s, mid)
    const testHex = rgbToHex(tr, tg, tb)
    const ratio = contrastRatio(testHex, bg)

    if (ratio >= targetRatio) {
      bestL = mid
      bestRatio = ratio
      // Try to get closer to original: move towards bg
      if (bgIsLight) lo = mid
      else hi = mid
    } else {
      // Need more contrast: move away from bg
      if (bgIsLight) hi = mid
      else lo = mid
    }
  }

  if (bestRatio < targetRatio) {
    // Fallback: pure white or black
    return bgIsLight ? '#000000' : '#ffffff'
  }

  const [fr, fg2, fb] = hslToRgb(h, s, bestL)
  return rgbToHex(fr, fg2, fb)
}

/**
 * Auto-fix an entire color scheme to ensure all critical pairs meet WCAG AA.
 * Returns a new color scheme with adjusted colors.
 */
export function autoFixColorScheme(scheme: {
  primary: string
  accent: string
  text: string
  background?: string
}): typeof scheme {
  const fixed = { ...scheme }

  // Text on primary must meet AA (4.5:1)
  fixed.text = adjustForContrast(scheme.text, scheme.primary, 4.5)

  // Accent on primary must meet AA for large text (3:1)
  fixed.accent = adjustForContrast(scheme.accent, scheme.primary, 3)

  // If accent is used as text in some places, ensure it's at least 4.5:1
  const accentOnPrimary = contrastRatio(fixed.accent, scheme.primary)
  if (accentOnPrimary < 4.5) {
    // Boost accent slightly more if possible without losing its character
    const boosted = adjustForContrast(fixed.accent, scheme.primary, 4.5)
    // Only use boosted if hue is still close
    const [origH] = rgbToHsl(...hexToRgb(fixed.accent))
    const [newH] = rgbToHsl(...hexToRgb(boosted))
    const hueDiff = Math.abs(origH - newH)
    if (hueDiff < 0.1 || hueDiff > 0.9) {
      fixed.accent = boosted
    }
  }

  // Text on background (secondary) must meet AA
  if (scheme.background) {
    const textOnBg = contrastRatio(fixed.text, scheme.background)
    if (textOnBg < 4.5) {
      fixed.text = adjustForContrast(fixed.text, scheme.background, 4.5)
      // Re-verify text on primary after adjusting for background
      const recheck = contrastRatio(fixed.text, scheme.primary)
      if (recheck < 4.5) {
        fixed.text = adjustForContrast(fixed.text, scheme.primary, 4.5)
      }
    }
  }

  return fixed
}

export interface ContrastCheck {
  pair: string
  fg: string
  bg: string
  ratio: number
  level: 'AAA' | 'AA' | 'FAIL'
  levelLarge: 'AAA' | 'AA' | 'FAIL'
}

/** Check all critical color pairs in a scheme */
export function checkColorScheme(scheme: {
  primary: string
  accent: string
  text: string
  background?: string
}): ContrastCheck[] {
  const checks: ContrastCheck[] = []

  const pairs: [string, string, string][] = [
    ['Teks di Latar Utama', scheme.text, scheme.primary],
    ['Aksen di Latar Utama', scheme.accent, scheme.primary],
  ]

  if (scheme.background) {
    pairs.push(
      ['Teks di Latar Kedua', scheme.text, scheme.background],
      ['Aksen di Latar Kedua', scheme.accent, scheme.background],
    )
  }

  for (const [pair, fg, bg] of pairs) {
    const ratio = contrastRatio(fg, bg)
    checks.push({
      pair, fg, bg, ratio,
      level: wcagLevel(ratio),
      levelLarge: wcagLevelLarge(ratio),
    })
  }

  return checks
}
