/**
 * Server-only session helper   hanya untuk Server Components dan API Routes.
 * JANGAN diimpor dari middleware.ts.
 */
import { cookies } from 'next/headers'
import { verifySessionToken, SESSION_COOKIE_NAME, type SessionPayload } from './session'

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}
