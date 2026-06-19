import { BUILT_IN_PRICE_TIERS } from './db'
import type { TierFeatures } from './types'

export type PackageTier = 'starter' | 'popular' | 'eksklusif'

export interface PackageFeatures {
  name: string
  emoji: string
  price: number
  color: string
  maxPhotos: number     // -1 = unlimited
  maxGuests: number     // for guest blast, -1 = unlimited
  canChangeTemplate: boolean
  canCustomizeSections: boolean  // enable/disable sections
  canReorderSections: boolean    // drag-and-drop — true for ALL tiers
  canHideWishes: boolean
  hasCustomDomain: boolean
  hasWatermarkFree: boolean
  activeMonths: number
  rsvpLimit: number
}

export const PACKAGES: Record<PackageTier, PackageFeatures> = {
  starter: {
    name: 'Starter',
    emoji: '🌱',
    price: 79000,
    color: 'blue',
    maxPhotos: 10,
    maxGuests: 200,
    canChangeTemplate: false,
    canCustomizeSections: true,
    canReorderSections: true,
    canHideWishes: false,
    hasCustomDomain: false,
    hasWatermarkFree: false,
    activeMonths: 1,
    rsvpLimit: 200,
  },
  popular: {
    name: 'Popular',
    emoji: '✨',
    price: 149000,
    color: 'rose',
    maxPhotos: 20,
    maxGuests: 500,
    canChangeTemplate: false,
    canCustomizeSections: true,
    canReorderSections: true,
    canHideWishes: true,
    hasCustomDomain: false,
    hasWatermarkFree: true,
    activeMonths: 3,
    rsvpLimit: 500,
  },
  eksklusif: {
    name: 'Eksklusif',
    emoji: '👑',
    price: 249000,
    color: 'amber',
    maxPhotos: -1,
    maxGuests: -1,
    canChangeTemplate: false,
    canCustomizeSections: true,
    canReorderSections: true,
    canHideWishes: true,
    hasCustomDomain: true,
    hasWatermarkFree: true,
    activeMonths: 6,
    rsvpLimit: 1000,
  },
}

export function getPackage(tier?: PackageTier | null): PackageFeatures {
  return PACKAGES[tier ?? 'popular']
}

export function canDoFeature(
  tier: PackageTier | null | undefined,
  feature: keyof Pick<PackageFeatures,
    'canChangeTemplate' | 'canCustomizeSections' | 'canReorderSections' |
    'canHideWishes' | 'hasCustomDomain' | 'hasWatermarkFree'
  >
): boolean {
  return getPackage(tier)[feature] as boolean
}

export function getPhotoLimit(tier?: PackageTier | null): number {
  return getPackage(tier).maxPhotos
}

export function formatPrice(price: number): string {
  return `Rp ${price.toLocaleString('id-ID')}`
}

export const PACKAGE_LIST: PackageTier[] = ['starter', 'popular', 'eksklusif']

export function getTierFeatures(tier?: PackageTier | null): TierFeatures {
  const id = tier ?? 'popular'
  const found = BUILT_IN_PRICE_TIERS.find(t => t.id === id)
  return found?.features as TierFeatures
}
