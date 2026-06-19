import { useMemo } from 'react'
import type { PackageTier } from '@/lib/packages'
import { getTierFeatures } from '@/lib/packages'
import type { TierFeatures } from '@/lib/types'

const SECTION_FEATURE_MAP: Record<string, keyof TierFeatures> = {
  cerita: 'story',
  hadiah: 'gift',
  galeri: 'gallery',
  musik: 'music',
  quote: 'countdown',
  dekorasi: 'decoration_editing',
}

const TIER_LABELS: Record<string, string> = {
  starter: 'Starter',
  popular: 'Popular',
  eksklusif: 'Eksklusif',
}

export function usePackageGating(tier: PackageTier | null | undefined) {
  return useMemo(() => {
    const features = getTierFeatures(tier)
    return {
      tier: tier ?? 'starter' as PackageTier,
      tierName: TIER_LABELS[tier ?? 'starter'] ?? 'Starter',
      features,
      canEditDecorations: features.decoration_editing,
      canUseCustomAnimations: features.custom_animations,
      maxDecorationAssets: features.max_decoration_assets,
      maxPhotos: features.max_photos,
      isSectionAllowed(studioSectionId: string): boolean {
        const featureKey = SECTION_FEATURE_MAP[studioSectionId]
        if (!featureKey) return true
        return !!features[featureKey]
      },
      getRequiredTier(studioSectionId: string): string | undefined {
        const featureKey = SECTION_FEATURE_MAP[studioSectionId]
        if (!featureKey) return undefined
        if (features[featureKey]) return undefined
        const allTiers: PackageTier[] = ['starter', 'popular', 'eksklusif']
        for (const t of allTiers) {
          const f = getTierFeatures(t)
          if (f[featureKey]) return TIER_LABELS[t]
        }
        return 'Eksklusif'
      },
    }
  }, [tier])
}
