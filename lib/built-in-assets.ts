// Built-in decoration ornaments rendered as inline SVG data URIs.
// Dipakai oleh preset bundle (DECORATION_BUNDLES) supaya user tidak perlu upload.
// Karena dirender lewat tag img, warna di-bake ke dalam SVG (default emas elegan).

const SHAPES: Record<string, (c: string) => string> = {
  'floral-corner': (c) => `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='${c}' stroke-width='1.5' stroke-linecap='round'>
    <path d='M6 6 Q34 8 36 36 M6 6 Q8 34 36 36'/>
    <path d='M6 6 Q20 6 22 20' opacity='0.7'/>
    <circle cx='10' cy='10' r='2.4' fill='${c}' stroke='none' opacity='0.7'/>
    <circle cx='36' cy='36' r='3' fill='${c}' stroke='none' opacity='0.5'/>
    <circle cx='6' cy='22' r='1.6' fill='${c}' stroke='none' opacity='0.5'/>
    <circle cx='22' cy='6' r='1.6' fill='${c}' stroke='none' opacity='0.5'/>
  </svg>`,
  'leaf-branch': (c) => `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='${c}' stroke='${c}'>
    <path d='M50 4 L50 96' stroke-width='1.4' fill='none' opacity='0.8'/>
    <ellipse cx='38' cy='16' rx='12' ry='5.5' transform='rotate(-32 38 16)' stroke='none' opacity='0.6'/>
    <ellipse cx='62' cy='30' rx='12' ry='5.5' transform='rotate(32 62 30)' stroke='none' opacity='0.6'/>
    <ellipse cx='38' cy='46' rx='12' ry='5.5' transform='rotate(-32 38 46)' stroke='none' opacity='0.6'/>
    <ellipse cx='62' cy='62' rx='12' ry='5.5' transform='rotate(32 62 62)' stroke='none' opacity='0.6'/>
    <ellipse cx='38' cy='78' rx='10' ry='5' transform='rotate(-32 38 78)' stroke='none' opacity='0.6'/>
  </svg>`,
  'geo-corner': (c) => `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='${c}' stroke-width='1.4' stroke-linecap='round'>
    <path d='M4 30 L4 4 L30 4'/>
    <path d='M4 46 L46 4' opacity='0.55'/>
    <rect x='9' y='9' width='12' height='12' transform='rotate(45 15 15)' opacity='0.8'/>
  </svg>`,
  'ring': (c) => `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='${c}' stroke-width='1.1'>
    <circle cx='50' cy='50' r='46'/>
  </svg>`,
  'rose': (c) => `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='none' stroke='${c}' stroke-width='2' stroke-linecap='round'>
    <circle cx='50' cy='50' r='8' opacity='0.9'/>
    <path d='M50 50 Q40 34 50 27 Q63 31 58 48' opacity='0.7'/>
    <path d='M50 50 Q67 44 71 55 Q66 67 52 60' opacity='0.7'/>
    <path d='M50 50 Q56 67 45 73 Q33 66 40 52' opacity='0.7'/>
    <path d='M50 50 Q33 55 29 44 Q35 32 48 40' opacity='0.7'/>
  </svg>`,
}

const DEFAULT_COLOR = '#d4af37'

// Resolve a possibly BUILT_IN url to a renderable src. Non built-in urls dikembalikan apa adanya.
export function resolveAssetUrl(url: string, color: string = DEFAULT_COLOR): string {
  if (!url || !url.startsWith('BUILT_IN:')) return url
  const key = url.slice('BUILT_IN:'.length)
  const baseKey = Object.keys(SHAPES).find((k) => key.startsWith(k)) ?? 'ring'
  const svg = SHAPES[baseKey](color).replace(/\s+/g, ' ').trim()
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}
