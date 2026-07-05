// Token motion permukaan publik (docs/DESIGN_SYSTEM.md §4).
// Satu-satunya sumber easing/durasi — jangan deklarasi EASE lokal per komponen.

export const EASE = [0.22, 1, 0.36, 1] as const

export const DUR = {
  fast: 0.2,
  base: 0.5,
  slow: 0.8,
} as const

export const VIEWPORT_ONCE = { once: true, margin: '-40px' } as const

/** Preset masuk standar: fade + naik ≤ 20px, sekali saat masuk viewport. */
export function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: VIEWPORT_ONCE,
    transition: { duration: DUR.base, delay, ease: EASE },
  }
}
