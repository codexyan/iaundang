import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { readFileSync } from 'fs'

// Load .env (Prisma CLI URL)
const envContent = readFileSync('.env', 'utf8')
const dbUrl = envContent.match(/DATABASE_URL=(.+)/)?.[1]
if (!dbUrl) { console.error('DATABASE_URL not found'); process.exit(1) }
process.env.DATABASE_URL = dbUrl

const prisma = new PrismaClient()

const ADMIN_EMAIL = 'mdcodeid@gmail.com'
const ADMIN_PASSWORD = 'Admin@iaundang1'

async function main() {
  const existing = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } })
  if (existing) {
    // Update role jika sudah ada
    await prisma.user.update({ where: { email: ADMIN_EMAIL }, data: { role: 'admin' } })
    console.log('✓ Admin user updated (role set to admin):', ADMIN_EMAIL)
    return
  }

  const hash = await bcrypt.hash(ADMIN_PASSWORD, 10)
  await prisma.user.create({
    data: { email: ADMIN_EMAIL, passwordHash: hash, role: 'admin' }
  })
  console.log('✓ Admin user created:', ADMIN_EMAIL)
  console.log('  Password:', ADMIN_PASSWORD)
}

main().catch(e => { console.error(e); process.exit(1) }).finally(() => prisma.$disconnect())
