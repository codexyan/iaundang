/**
 * Edge-compatible JWT session   boleh diimpor dari middleware.ts.
 * Tidak boleh mengimpor 'next/headers' di sini.
 */
import { SignJWT, jwtVerify } from 'jose'
import type { NextRequest, NextResponse } from 'next/server'

export const SESSION_COOKIE_NAME = '__ku_session'
const EXPIRES_DAYS = 30

function getSecret() {
  const secret = process.env.SESSION_SECRET || 'iaundang-dev-secret-must-be-32chars!!'
  return new TextEncoder().encode(secret)
}

export type SessionRole = 'admin' | 'content_writer' | 'affiliate' | 'user'

export interface SessionPayload {
  userId: string
  email: string
  /** Optional untuk backward-compat dengan token lama yang belum punya role.
   *  Helper isAdmin() di lib/auth.ts fallback ke email match jika undefined. */
  role?: SessionRole
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${EXPIRES_DAYS}d`)
    .sign(getSecret())
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret())
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

/** Digunakan di middleware (Edge Runtime). */
export async function getSessionFromRequest(req: NextRequest): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value
  if (!token) return null
  return verifySessionToken(token)
}

export function setSessionCookie(res: NextResponse, token: string): void {
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * EXPIRES_DAYS,
    path: '/',
  })
}

/** Header string untuk Set-Cookie di API route Response. */
export function buildSetCookieHeader(token: string): string {
  const maxAge = 60 * 60 * 24 * EXPIRES_DAYS
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Path=/${secure}`
}
