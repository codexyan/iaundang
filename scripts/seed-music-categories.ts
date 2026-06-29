import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const CATEGORIES = [
  { name: 'Romantis', sortOrder: 1 },
  { name: 'Islami', sortOrder: 2 },
  { name: 'Instrumental', sortOrder: 3 },
  { name: 'Pop', sortOrder: 4 },
  { name: 'Tradisional', sortOrder: 5 },
  { name: 'Lainnya', sortOrder: 6 },
]

async function main() {
  for (const cat of CATEGORIES) {
    await prisma.musicCategory.upsert({
      where: { name: cat.name },
      update: { sortOrder: cat.sortOrder },
      create: cat,
    })
    console.log('Seeded category:', cat.name)
  }
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
