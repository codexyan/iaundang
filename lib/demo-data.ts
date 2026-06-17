import type { Invitation, Gallery, Guest, Wish } from './types'

export const DEMO_INVITATION: Invitation = {
  id: 'demo',
  user_id: 'demo',
  slug: 'demo',
  template_id: 'modern-white',
  is_published: true,
  is_paid: true,
  expires_at: null,
  referred_by: null,
  created_at: new Date().toISOString(),
  data: {
    groomName: 'Budi Santoso',
    groomFather: 'Bapak Ahmad Santoso',
    groomMother: 'Ibu Sri Rahayu',
    brideName: 'Ani Permatasari',
    brideFather: 'Bapak Hendra Permata',
    brideMother: 'Ibu Dewi Lestari',

    akadDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    akadTime: '08:00',
    akadVenue: 'Masjid Al-Ikhlas',
    akadAddress: 'Jl. Mawar No. 12, Kebayoran Baru, Jakarta Selatan',
    akadMapsUrl: 'https://maps.google.com',

    resepsiDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    resepsiTime: '11:00',
    resepsiVenue: 'Ballroom Hotel Grand Sahid Jaya',
    resepsiAddress: 'Jl. Jend. Sudirman No. 86, Jakarta Pusat',
    resepsiMapsUrl: 'https://maps.google.com',

    openingText: 'Dengan memohon rahmat dan ridho Allah SWT, kami mengundang kehadiran Bapak/Ibu/Saudara/i',
    closingText: 'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir.',
    musicTitle: 'Sempurna - Andra and the Backbone',
    heroPhotoUrl: undefined,
    musicUrl: undefined,
  },
}

export const DEMO_GALLERIES: Gallery[] = []

export const DEMO_WISHES: Wish[] = [
  {
    id: '1',
    invitation_id: 'demo',
    name: 'Reza Firmansyah',
    message: 'Selamat menempuh hidup baru! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah. Barakallah 💕',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    invitation_id: 'demo',
    name: 'Sari & Keluarga',
    message: 'Turut berbahagia atas pernikahan kalian. Semoga rumah tangga kalian dipenuhi kebahagiaan dan keberkahan!',
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    invitation_id: 'demo',
    name: 'Tim iaundang',
    message: 'Selamat berbahagia! Ini adalah contoh tampilan buku ucapan. Tamu kalian bisa menulis ucapan langsung dari halaman undangan.',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const DEMO_GUESTS: Guest[] = [
  { id: '1', invitation_id: 'demo', name: 'Keluarga Besar Santoso', attending: true, total_guests: 4, created_at: new Date().toISOString() },
  { id: '2', invitation_id: 'demo', name: 'Reza Firmansyah', attending: true, total_guests: 2, created_at: new Date().toISOString() },
  { id: '3', invitation_id: 'demo', name: 'Indah Kurniawati', attending: false, total_guests: 0, created_at: new Date().toISOString() },
]
