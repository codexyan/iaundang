import type { SessionPayload } from './session'

export function getAdminEmail(): string {
  return process.env.ADMIN_EMAIL || 'admin@iaundang.online'
}

export function isAdmin(session: SessionPayload | null | undefined): boolean {
  if (!session) return false
  if (session.role === 'admin') return true
  return session.email === getAdminEmail()
}

export function isWriter(session: SessionPayload | null | undefined): boolean {
  if (!session) return false
  return session.role === 'content_writer' || isAdmin(session)
}

export function canManageArticles(session: SessionPayload | null | undefined): boolean {
  return isWriter(session)
}

export function isAffiliate(session: SessionPayload | null | undefined): boolean {
  if (!session) return false
  return session.role === 'affiliate' || isAdmin(session)
}
