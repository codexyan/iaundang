import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { invitations, galleries, wishes, guests, templateRecords } from '@/lib/db'
import { isExpired } from '@/lib/utils'
import { getPackage, type PackageTier } from '@/lib/packages'

export const dynamic = 'force-dynamic'
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

  if (!invitation.is_published) {
    return <UnpublishedPage />
  }

  if (invitation.is_paid && isExpired(invitation.expires_at)) {
    return <ExpiredPage />
  }

  const tier = (invitation as unknown as Record<string, unknown>).package_tier as PackageTier | undefined
  const pkg = getPackage(tier)
  const showWatermark = !invitation.is_paid || !pkg.hasWatermarkFree

  //  JSON-driven renderer path 
  const isLegacy = (LEGACY_TEMPLATE_IDS as string[]).includes(invitation.template_id)

  if (!isLegacy) {
    const template = await templateRecords.findById(invitation.template_id)
    if (!template) {
      return <UnpublishedPage message="Template undangan tidak ditemukan." />
    }

    const invWishes = await wishes.findByInvitationId(invitation.id)

    const content = (
      <InvitationRenderer
        invitationId={invitation.id}
        invitationData={invitation.data as unknown as NewInvitationData}
        template={template}
        initialWishes={invWishes}
        musicUrl={(invitation.data as unknown as NewInvitationData).music_url}
      />
    )

    return showWatermark ? <WatermarkShell>{content}</WatermarkShell> : content
  }

  //  Legacy hardcoded templates path 
  const props = {
    invitation: invitation as Invitation,
    galleries: await galleries.findByInvitationId(invitation.id) as Gallery[],
    wishes: await wishes.findByInvitationId(invitation.id) as Wish[],
    guests: await guests.findByInvitationId(invitation.id) as Guest[],
  }

  let content: React.ReactNode
  switch (invitation.template_id) {
    case 'floral-garden':
      content = <FloralGardenTemplate {...props} />; break
    case 'dark-elegant':
      content = <DarkElegantTemplate {...props} />; break
    default:
      content = <ModernWhiteTemplate {...props} />; break
  }

  return showWatermark ? <WatermarkShell>{content}</WatermarkShell> : content
}

function WatermarkShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-[100dvh]">
      {/* Top watermark bar */}
      <div className="sticky top-0 z-[100] bg-white/95 backdrop-blur-xl border-b border-stone-200/60 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-11 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logos/logo-horizontal.png" alt="iaundang" width={90} height={24} className="object-contain" />
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1.5 bg-forest-500 hover:bg-forest-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            Buat Undangan
          </Link>
        </div>
      </div>

      {/* Invitation content */}
      <div className="flex-1">{children}</div>

      {/* Bottom watermark bar */}
      <div className="sticky bottom-0 z-[100] bg-white/95 backdrop-blur-xl border-t border-stone-200/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-10 flex items-center justify-between">
          <p className="text-[11px] text-stone-400">
            Dibuat dengan <span className="font-semibold text-stone-600">iaundang</span> ¬∑ Undangan digital premium
          </p>
          <Link href="/register" className="text-[11px] text-forest-600 hover:text-forest-700 transition-colors font-semibold">
            Buat Undangan Gratis
          </Link>
        </div>
      </div>
    </div>
  )
}

function UnpublishedPage({ message }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center px-4">
        <div className="text-5xl mb-4">üíå</div>
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
        <div className="text-5xl mb-4">è∞</div>
        <h1 className="text-2xl font-serif font-bold text-gray-800">Undangan Sudah Berakhir</h1>
        <p className="text-gray-500 mt-3 max-w-sm">
          Masa aktif undangan ini telah habis. Terima kasih telah hadir.
        </p>
      </div>
    </div>
  )
}
