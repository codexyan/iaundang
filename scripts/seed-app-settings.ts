import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.appSetting.upsert({
    where: { key: 'main' },
    update: {},
    create: {
      key: 'main',
      value: {
        siteName: 'iaundang',
        siteDescription: 'Buat undangan digital premium, tanpa coding, tanpa ribet',
        packages: {
          starter: { price: 79000, label: 'Starter', activeMonths: 1 },
          popular: { price: 149000, label: 'Popular', activeMonths: 3 },
          eksklusif: { price: 249000, label: 'Eksklusif', activeMonths: 6 },
        },
        payment: {
          bankName: 'BCA',
          accountNumber: '',
          accountName: 'IAUndang',
        },
      },
    },
  })
  console.log('App settings seeded')
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
