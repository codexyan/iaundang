import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const [templateCount, categoryCount, settingCount] = await Promise.all([
    prisma.templateRecord.count(),
    prisma.musicCategory.count(),
    prisma.appSetting.count(),
  ])
  console.log('Templates:', templateCount)
  console.log('Music categories:', categoryCount)
  console.log('App settings:', settingCount)

  if (templateCount === 0) console.warn('WARNING: No templates found!')
  if (categoryCount === 0) console.warn('WARNING: No music categories found!')
  if (settingCount === 0) console.warn('WARNING: No app settings found!')

  if (templateCount > 0 && categoryCount > 0 && settingCount > 0) {
    console.log('DB connection OK - all seeds verified')
  }

  await prisma.$disconnect()
}

main().catch(e => { console.error('DB ERROR:', e.message); process.exit(1) })
