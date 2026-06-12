import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'mdcodeid@gmail.com'
  const password = 'testing123'
  const hash = await bcrypt.hash(password, 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, passwordHash: hash, role: 'user' },
  })

  const invitation = await prisma.invitation.upsert({
    where: { slug: 'mdcodeid' },
    update: {
      templateId: 'javanese-gold',
      packageTier: 'premium',
      isPaid: true,
      isPublished: true,
    },
    create: {
      userId: user.id,
      slug: 'mdcodeid',
      templateId: 'javanese-gold',
      packageTier: 'premium',
      isPaid: true,
      isPublished: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      data: {},
    },
  })

  console.log(`User: ${user.email} (${user.id})`)
  console.log(`Invitation: /${invitation.slug} — template: ${invitation.templateId}, package: ${invitation.packageTier}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error('ERR:', e.message); process.exit(1) })
