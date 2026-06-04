import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session-server'
import { isAdmin } from '@/lib/auth'
import { settings } from '@/lib/db'

interface Params { params: { slug: string } }

export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const newLabel = String(body?.label || '').trim()
  if (!newLabel) return NextResponse.json({ error: 'Nama kategori wajib diisi' }, { status: 400 })

  const s = await settings.get()
  const idx = s.categories.findIndex((c) => c.slug === params.slug)
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  s.categories[idx] = { ...s.categories[idx], label: newLabel }
  await settings.save(s)
  return NextResponse.json({ category: s.categories[idx] })
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const s = await settings.get()
  const target = s.categories.find((c) => c.slug === params.slug)
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (target.is_built_in) return NextResponse.json({ error: 'Kategori bawaan tidak bisa dihapus' }, { status: 403 })

  s.categories = s.categories.filter((c) => c.slug !== params.slug)
  await settings.save(s)
  return NextResponse.json({ success: true })
}
