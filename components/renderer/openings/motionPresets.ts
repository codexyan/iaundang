/**
 * Signature motion presets untuk cover/opening.
 * Didefinisikan sekali di sini dan dipakai ulang lintas opening supaya
 * "brand motion" terasa konsisten dan premium (soft settle, bukan easeInOut generik).
 */

// Entrance: cepat di awal lalu mengendap halus di akhir (soft settle)
export const PREMIUM_EASE = [0.22, 1, 0.36, 1] as const

// Exit: akselerasi lembut, cocok untuk fade + scale + blur saat keluar
export const PREMIUM_EXIT_EASE = [0.4, 0, 0.2, 1] as const

// Preset exit yang dipakai bersama: scale up + blur + fade (elegan, tidak "kepotong")
export const premiumExit = (blur = 8) => ({
  opacity: 0,
  scale: 1.06,
  filter: `blur(${blur}px)`,
})
