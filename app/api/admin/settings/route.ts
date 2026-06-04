import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session-server'
import { isAdmin } from '@/lib/auth'
import { settings } from '@/lib/db'
import type { AppSettings } from '@/lib/db'


export async function GET() {
  const session = await getSession()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ settings: await settings.get() })
}

export async function PATCH(req: NextRequest) {
  const session = await getSession()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = (await req.json()) as AppSettings
  await settings.save(body)
  return NextResponse.json({ settings: body })
}
