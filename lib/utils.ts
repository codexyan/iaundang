import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

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
  const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'iaundang.id'
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return `${window.location.origin}?slug=${slug}`
  }
  return `https://${slug}.${domain}`
}

export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false
  return new Date(expiresAt) < new Date()
}
