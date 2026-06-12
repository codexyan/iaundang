import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { getSession } from '@/lib/session-server'
import { isAdmin, getAdminEmail } from '@/lib/auth'
import { users } from '@/lib/db'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession()
  if (!isAdmin(session)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const newPassword = String(body?.password || '').trim()
  if (!newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: 'Password minimal 6 karakter' }, { status: 400 })
  }

  const target = await users.findById(params.id)
  if (!target) return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })

  if (target.email === getAdminEmail()) {
    return NextResponse.json({ error: 'Gunakan menu profil untuk mengubah password admin' }, { status: 403 })
  }

  const hash = await bcrypt.hash(newPassword, 10)
  await users.updatePassword(params.id, hash)

  return NextResponse.json({ ok: true })
}
