import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session-server'
import { isAdmin, getAdminEmail } from '@/lib/auth'
import { users } from '@/lib/db'

interface Params { params: { id: string } }

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const target = await users.findById(params.id)
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (target.role === 'admin' || target.email === getAdminEmail()) {
    return NextResponse.json({ error: 'Tidak bisa menghapus akun admin' }, { status: 403 })
  }

  await users.delete(params.id)
  return NextResponse.json({ success: true })
}
