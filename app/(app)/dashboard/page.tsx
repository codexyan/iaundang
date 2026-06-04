import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session-server'
import { invitations, templateRecords } from '@/lib/db'
import DashboardClient from '@/components/dashboard/DashboardClient'
import type { Invitation } from '@/lib/types'
import { TEMPLATES } from '@/lib/types'

interface Props {
  searchParams: { template?: string }
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await getSession()
  if (!session) redirect('/login')

  const invitation = await invitations.findByUserId(session.userId) as Invitation | null

  // All available templates: legacy + new JSON-driven
  const legacyTemplates = TEMPLATES.map(t => ({
    id: t.id,
    name: t.name,
    category: 'legacy',
    thumbnailUrl: t.thumbnailUrl,
    demoUrl: `/demo/${t.id}`,
    isNew: false,
  }))

  const newTemplates = (await templateRecords.findActive()).map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    thumbnailUrl: t.thumbnail_url,
    demoUrl: `/demo/renderer`,
    isNew: true,
  }))

  const allTemplates = [...newTemplates, ...legacyTemplates]

  const selectedTemplateId = searchParams.template || ''

  return (
    <DashboardClient
      user={{ id: session.userId, email: session.email }}
      invitation={invitation}
      selectedTemplateId={selectedTemplateId}
      allTemplates={allTemplates}
    />
  )
}
