import { notFound } from 'next/navigation'
import { invitations, galleries, wishes, guests, templateRecords } from '@/lib/db'
import { isExpired } from '@/lib/utils'
import { LEGACY_TEMPLATE_IDS } from '@/lib/types'
import type { Invitation, Gallery, Wish, Guest, NewInvitationData } from '@/lib/types'

// Legacy hardcoded templates
import ModernWhiteTemplate from '@/components/templates/modern-white/ModernWhiteTemplate'
import FloralGardenTemplate from '@/components/templates/floral-garden/FloralGardenTemplate'
import DarkElegantTemplate from '@/components/templates/dark-elegant/DarkElegantTemplate'

// New JSON-driven renderer
import InvitationRenderer from '@/components/renderer/InvitationRenderer'

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props) {
  const inv = await invitations.findBySlug(params.slug)
  if (!inv?.is_published) return {}

  // New style data
  const data = inv.data as unknown as NewInvitationData
  if (data.groom_name) {
    return {
      title: `Undangan ${data.groom_name} & ${data.bride_name}`,
      description: `Kami mengundang kehadiran Anda pada pernikahan ${data.groom_name} & ${data.bride_name}`,
    }
  }

  // Legacy style data
  const d = inv.data
  return {
    title: `Undangan ${d.groomName} & ${d.brideName}`,
    description: `Kami mengundang kehadiran Anda pada pernikahan ${d.groomName} & ${d.brideName}`,
  }
}

export default async function InvitationPage({ params }: Props) {
  const invitation = await invitations.findBySlug(params.slug)

  if (!invitation) notFound()

  if (!invitation.is_published || !invitation.is_paid) {
    return <UnpublishedPage />
  }

  if (isExpired(invitation.expires_at)) {
    return <ExpiredPage />
  }

  // ── JSON-driven renderer path ─────────────────────────────────
  const isLegacy = (LEGACY_TEMPLATE_IDS as string[]).includes(invitation.template_id)

  if (!isLegacy) {
    const template = await templateRecords.findById(invitation.template_id)
    if (!template) {
      return <UnpublishedPage message="Template undangan tidak ditemukan." />
    }

    const invWishes = await wishes.findByInvitationId(invitation.id)

    return (
      <InvitationRenderer
        invitationId={invitation.id}
        invitationData={invitation.data as unknown as NewInvitationData}
        template={template}
        initialWishes={invWishes}
        musicUrl={(invitation.data as unknown as NewInvitationData).music_url}
      />
    )
  }

  // ── Legacy hardcoded templates path ───────────────────────────
  const props = {
    invitation: invitation as Invitation,
    galleries: await galleries.findByInvitationId(invitation.id) as Gallery[],
    wishes: await wishes.findByInvitationId(invitation.id) as Wish[],
    guests: await guests.findByInvitationId(invitation.id) as Guest[],
  }

  switch (invitation.template_id) {
    case 'floral-garden':
      return <FloralGardenTemplate {...props} />
    case 'dark-elegant':
      return <DarkElegantTemplate {...props} />
    default:
      return <ModernWhiteTemplate {...props} />
  }
}

function UnpublishedPage({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="text-5xl mb-4">💌</div>
        <h1 className="text-2xl font-serif font-bold text-gray-800">Undangan Belum Aktif</h1>
        <p className="text-gray-500 mt-3 max-w-sm">
          {message ?? 'Undangan ini belum dipublikasikan oleh pemiliknya.'}
        </p>
      </div>
    </div>
  )
}

function ExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="text-5xl mb-4">⏰</div>
        <h1 className="text-2xl font-serif font-bold text-gray-800">Undangan Sudah Berakhir</h1>
        <p className="text-gray-500 mt-3 max-w-sm">
          Masa aktif undangan ini telah habis. Terima kasih telah hadir.
        </p>
      </div>
    </div>
  )
}
