import { settings, templateRecords } from '@/lib/db'
import OrderForm from './OrderForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Buat Undangan | iaundang',
  description: 'Isi data pernikahan, pilih template & paket, dan buat undangan digital Anda.',
}

export default async function OrderPage({ searchParams }: { searchParams: Promise<{ template?: string }> }) {
  const params = await searchParams
  const [appSettings, allTemplates] = await Promise.all([
    settings.get(),
    templateRecords.findAll(),
  ])

  const activeTemplates = allTemplates
    .filter(t => t.status === 'active')
    .map(t => ({
      id: t.id,
      name: t.name,
      category: t.category,
      thumbnail_url: t.thumbnail_url,
      config: {
        meta: t.config.meta,
        opening: t.config.opening,
      },
    }))

  const tiers = appSettings.priceTiers
    .filter(t => ['starter', 'popular', 'eksklusif'].includes(t.id))
    .sort((a, b) => a.price - b.price)
    .map(t => ({
      id: t.id,
      label: t.label,
      price: t.price,
      description: t.description ?? '',
      color: t.color ?? '#6366f1',
      icon: t.icon ?? 'rocket',
      highlight: t.highlight ?? false,
      features: t.features ?? null,
    }))

  const paymentConfig = {
    bankAccounts: appSettings.bankAccounts.filter(b => b.isActive),
    qrisImageUrl: appSettings.qrisImageUrl,
    paymentInstructions: appSettings.paymentInstructions,
    confirmationWhatsapp: appSettings.confirmationWhatsapp,
  }

  return <OrderForm templates={activeTemplates} tiers={tiers} paymentConfig={paymentConfig} initialTemplate={params.template} />
}
