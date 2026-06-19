import type { DecorationAsset } from './types'

export function mergeDecorationAssets(
  templateAssets: DecorationAsset[] | undefined,
  userOverrides: DecorationAsset[] | undefined
): DecorationAsset[] {
  if (!userOverrides?.length) return templateAssets ?? []
  if (!templateAssets?.length) return userOverrides

  const userIds = new Set(userOverrides.map(a => a.id))
  const kept = templateAssets.filter(a => !userIds.has(a.id))
  const maxZ = Math.max(0, ...kept.map(a => a.z_layer ?? 0))
  const boosted = userOverrides.map(a => ({
    ...a,
    z_layer: (a.z_layer ?? 0) + maxZ + 1,
  }))
  return [...kept, ...boosted]
}
