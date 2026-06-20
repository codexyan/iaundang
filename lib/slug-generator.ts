/**
 * Generate rekomendasi slug dari nama pasangan.
 * Mengutamakan kombinasi yang bermakna, mudah diingat, dan terasa personal.
 */
export function generateSlugSuggestions(groomFull: string, brideFull: string): string[] {
  const clean = (s: string) =>
    s.split(' ')[0].toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')  // hapus aksen
      .replace(/[^a-z]/g, '')           // hanya huruf

  const g = clean(groomFull)
  const b = clean(brideFull)

  if (!g || !b) return []

  const year = new Date().getFullYear()
  const g0 = g[0]
  const b0 = b[0]

  const candidates = [
    `${g}-dan-${b}`,              // budi-dan-ani           paling natural
    `${g}${b}`,                   // budiani                akronim gabung
    `${b}${g}`,                   // anibudi                reversed
    `${g}-${b}`,                  // budi-ani               simpel
    `${g}-${b}-${year}`,          // budi-ani-2025          dengan tahun
    `${g[0]}${b[0]}-${year}`,     // ba-2025                inisial + tahun
    `${g}and${b}`,                // budiandani             gaya internasional
    `${b}and${g}`,                // aniandbudi
    `${g0}n${b0}-wedding`,        // bnb-wedding            inisial kreatif
    `pernikahan-${g}-${b}`,       // pernikahan-budi-ani
  ]

  const isValid = (s: string) => /^[a-z0-9-]{3,30}$/.test(s)

  // Deduplicate, filter invalid, ambil 5 terbaik
  return Array.from(new Set(candidates))
    .filter(isValid)
    .slice(0, 5)
}
