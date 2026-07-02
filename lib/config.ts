// Single source of truth for the public site domain/URL.
// Derived from the existing NEXT_PUBLIC_APP_DOMAIN env (do not hardcode elsewhere).
export const SITE_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN || 'iaundang.online'
export const SITE_URL = `https://${SITE_DOMAIN}`
