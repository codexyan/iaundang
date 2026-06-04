import { notFound } from 'next/navigation'
import { templateRecords } from '@/lib/db'
import JAVANESE_GOLD from '@/lib/template-configs/javanese-gold'
import InvitationRenderer from '@/components/renderer/InvitationRenderer'
import type { NewInvitationData, Wish } from '@/lib/types'

interface Props {
  searchParams: { id?: string }
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: Props) {
  if (!searchParams.id) return { title: 'Demo Tema — Akundang' }
  const rec = await templateRecords.findById(searchParams.id)
  return { title: `Preview: ${rec?.name ?? 'Tema'} — Akundang` }
}

const DEMO_DATA: NewInvitationData = {
  groom_name: 'Budi Santoso',
  bride_name: 'Ani Permatasari',
  bride_parents: 'Bapak Hendra Permata & Ibu Dewi Lestari',
  groom_parents: 'Bapak Ahmad Santoso & Ibu Sri Rahayu',
  tagline: 'Dan di antara tanda-tanda kekuasaan-Nya ialah Dia menciptakan untukmu pasangan-pasangan dari jenismu sendiri. — QS Ar-Rum: 21',
  story_title: 'Kisah Kami',
  story_text: 'Kami pertama kali bertemu di sebuah acara kampus pada tahun 2019. Sebuah perkenalan singkat yang ternyata menjadi awal dari perjalanan panjang yang penuh makna.',
  akad: {
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '08:00',
    venue_name: 'Masjid Al-Ikhlas',
    venue_address: 'Jl. Mawar No. 12, Kebayoran Baru, Jakarta Selatan',
    maps_url: 'https://maps.google.com',
  },
  resepsi: {
    date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '11:00',
    venue_name: 'Ballroom Hotel Grand Sahid Jaya',
    venue_address: 'Jl. Jend. Sudirman No. 86, Jakarta Pusat',
    maps_url: 'https://maps.google.com',
  },
  gift_accounts: [
    { type: 'bank', bank: 'BCA', number: '1234567890', name: 'Budi Santoso' },
  ],
  closing_text: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu berkenan hadir.',
}

const DEMO_WISHES: Wish[] = [
  { id: '1', invitation_id: 'demo', name: 'Reza Firmansyah', message: 'Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Barakallah 💕', created_at: new Date(Date.now() - 2 * 3600000).toISOString() },
  { id: '2', invitation_id: 'demo', name: 'Sari & Keluarga',  message: 'Turut berbahagia atas pernikahan kalian. Semoga dipenuhi kebahagiaan dan keberkahan!', created_at: new Date(Date.now() - 5 * 3600000).toISOString() },
]

export default async function DemoRendererPage({ searchParams }: Props) {
  let template = JAVANESE_GOLD

  if (searchParams.id) {
    const rec = await templateRecords.findById(searchParams.id)
    if (!rec) notFound()
    template = rec
  }

  return (
    <InvitationRenderer
      invitationId={`demo-${template.id}`}
      invitationData={DEMO_DATA}
      template={template}
      initialWishes={DEMO_WISHES}
    />
  )
}
