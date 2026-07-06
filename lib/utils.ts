import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// tailwind-merge tidak mengenal skala tipografi kustom di globals.css dan
// mengklasifikasikan `text-<apapun>` yang tak dikenal sebagai text-COLOR —
// akibatnya cn('text-chalk', 'text-button-sm') membuang text-chalk.
// Daftarkan skala kustom sebagai grup font-size agar tidak bentrok dengan warna.
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        'text-display-2xl', 'text-display-xl', 'text-display-lg', 'text-display-md',
        'text-h1', 'text-h2', 'text-h3', 'text-h4', 'text-h5',
        'text-body-xl', 'text-body-lg', 'text-body-base', 'text-body-sm', 'text-body-xs',
        'text-label-lg', 'text-label-base', 'text-label-sm',
        'text-eyebrow', 'text-eyebrow-lg',
        'text-button-lg', 'text-button-base', 'text-button-sm',
        'text-caption', 'text-caption-sm',
        'text-ui-base', 'text-ui-sm', 'text-ui-xs', 'text-ui-2xs', 'text-ui-eyebrow',
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(dateStr: string, locale = 'id-ID'): string {
  return new Date(dateStr).toLocaleDateString(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9-]{3,30}$/.test(slug)
}

export function generateOrderId(userId: string): string {
  const timestamp = Date.now()
  const short = userId.slice(0, 8)
  return `KU-${short}-${timestamp}`
}

export function getInvitationUrl(slug: string): string {
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'iaundang.online'
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `${window.location.origin}?slug=${slug}`
  }
  return `https://${slug}.${domain}`
}

export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}
