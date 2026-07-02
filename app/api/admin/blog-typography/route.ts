import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session-server'
import { isAdmin } from '@/lib/auth'
import { blogTypography, DEFAULT_BLOG_TYPOGRAPHY } from '@/lib/db'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json({ typography: await blogTypography.get() })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await req.json()
  const next = {
    headingFont: typeof body.headingFont === 'string' ? body.headingFont : DEFAULT_BLOG_TYPOGRAPHY.headingFont,
    bodyFont: typeof body.bodyFont === 'string' ? body.bodyFont : DEFAULT_BLOG_TYPOGRAPHY.bodyFont,
    bodySize: Math.min(28, Math.max(12, Number(body.bodySize) || DEFAULT_BLOG_TYPOGRAPHY.bodySize)),
    h2Scale: Math.min(2.6, Math.max(1.1, Number(body.h2Scale) || DEFAULT_BLOG_TYPOGRAPHY.h2Scale)),
    h3Scale: Math.min(2.2, Math.max(1.0, Number(body.h3Scale) || DEFAULT_BLOG_TYPOGRAPHY.h3Scale)),
    lineHeight: Math.min(2.2, Math.max(1.2, Number(body.lineHeight) || DEFAULT_BLOG_TYPOGRAPHY.lineHeight)),
  }
  await blogTypography.save(next)
  return NextResponse.json({ typography: next })
}
