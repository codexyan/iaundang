import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { users } from '@/lib/db'
import { createSessionToken, buildSetCookieHeader, type SessionRole } from '@/lib/session'
import { isAdmin, getAdminEmail } from '@/lib/auth'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 })
  }

  const { email, password } = parsed.data
  const user = await users.findByEmail(email)

  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 })
  }

  // Role: prefer DB field, fallback ke email match utk user lama tanpa role.
  const role: SessionRole = user.role ?? (user.email === getAdminEmail() ? 'admin' : 'user')

  const token = await createSessionToken({ userId: user.id, email: user.email, role })

  return NextResponse.json(
    {
      user: {
        id: user.id,
        email: user.email,
        role,
        isAdmin: isAdmin({ userId: user.id, email: user.email, role }),
      },
    },
    {
      headers: { 'Set-Cookie': buildSetCookieHeader(token) },
    }
  )
}
