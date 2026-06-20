/**
 * Seed 3 sample blog articles.
 * Run: npx tsx scripts/seed-articles.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const ARTICLES = [
  {
    title: '10 Checklist Persiapan Pernikahan yang Sering Terlupakan',
    slug: 'checklist-persiapan-pernikahan',
    excerpt: 'Persiapan pernikahan bukan hanya soal venue dan catering. Ada banyak detail kecil yang sering terlupakan tapi berdampak besar di hari H. Simak daftarnya di sini.',
    coverUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200&q=80',
    authorName: 'Sarah Amelia',
    tags: 'persiapan pernikahan, tips, checklist',
    metaTitle: '10 Checklist Persiapan Pernikahan yang Sering Terlupakan',
    metaDesc: 'Panduan lengkap persiapan pernikahan: dari detail kecil yang sering terlupakan hingga tips praktis untuk hari H yang lancar.',
    content: `Merencanakan pernikahan adalah salah satu momen paling membahagiakan sekaligus menantang. Di tengah kegembiraan memilih gaun, mencicipi makanan, dan mendesain undangan, ada beberapa hal penting yang sering terlewat.

## 1. Buat Timeline Mundur dari Hari H

Mulai dari tanggal pernikahan, hitung mundur setiap milestone: 6 bulan sebelumnya untuk booking venue, 3 bulan untuk fitting baju, 1 bulan untuk konfirmasi vendor. Timeline ini akan jadi "GPS" kalian sepanjang persiapan.

## 2. Siapkan Budget Buffer 15-20%

Selalu ada pengeluaran tak terduga. Dekorasi tambahan, tip untuk vendor, atau perubahan menit terakhir. Budget buffer memastikan kalian tidak panik saat ada biaya yang tidak diperhitungkan.

## 3. Undangan Digital: Kirim 6-8 Minggu Sebelumnya

Di era digital, undangan online bukan hanya hemat tapi juga lebih praktis. Tamu bisa langsung RSVP, lihat peta lokasi, dan bahkan mendengar musik yang kalian pilih   semua dari satu link.

![Contoh undangan digital modern](https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=800&q=80)

**Tips:** Gunakan fitur personalisasi nama tamu di undangan digital. Kesan personal ini membuat tamu merasa diperhatikan.

## 4. Buat Daftar Tamu yang Realistis

Hitung kapasitas venue terlebih dahulu, baru buat daftar tamu. Bagi dalam kategori:
- **Wajib hadir**   keluarga inti dan sahabat dekat
- **Sangat diharapkan**   keluarga besar dan teman dekat
- **Jika memungkinkan**   rekan kerja dan kenalan

## 5. Koordinasi Jadwal Foto Pre-Wedding

Jangan tunggu bulan terakhir untuk foto pre-wedding. Cuaca, mood, dan kondisi fisik kalian semua berpengaruh. Idealnya, lakukan 2-3 bulan sebelum hari H.

## 6. Siapkan Emergency Kit

Kumpulkan dalam satu tas kecil:
- Peniti, jarum & benang
- Obat sakit kepala
- Tissue dan tisu basah
- Bedak dan lipstik cadangan
- Charger HP
- Snack ringan

## 7. Briefing Tim Keluarga

Pastikan setiap anggota keluarga tahu peran mereka di hari H. Siapa yang menyambut tamu VIP? Siapa yang koordinasi dengan vendor? Briefing singkat 1 minggu sebelumnya sangat membantu.

## 8. Cek Sound System & Playlist

Jangan sampai hari H baru sadar mic tidak berfungsi atau playlist salah urutan. Minta sound engineer untuk testing minimal sehari sebelumnya.

## 9. Siapkan Rencana B untuk Cuaca

Kalau resepsi outdoor, selalu punya backup plan. Apakah ada tenda cadangan? Apakah bisa pindah indoor? Diskusikan ini dengan wedding organizer sejak awal.

## 10. Jangan Lupa Menikmati Prosesnya

Di tengah semua kesibukan, jangan lupa bahwa ini tentang **cinta kalian berdua**. Luangkan waktu untuk date night tanpa bicara soal pernikahan. Kalian akan berterima kasih pada diri sendiri nanti.

---

Semoga checklist ini membantu persiapan pernikahan kalian lebih lancar. Ingat, tidak ada pernikahan yang sempurna   yang ada hanyalah pernikahan yang penuh cinta dan kenangan indah.`,
    settings: {
      featured: true,
      pinned: false,
      comments: { moderation: 'auto', bannedWords: '', closeAfterDays: 0, requireLogin: false, allowReplies: true, maxLength: 500 },
      seo: { focusKeyword: 'persiapan pernikahan', canonicalUrl: '', ogImageUrl: '', noIndex: false },
      ads: { enabled: false, positions: [], adCode: '' },
      backlinks: { internal: [], external: [] },
    },
  },
  {
    title: 'Undangan Digital vs Cetak: Mana yang Lebih Cocok untuk Pernikahan Kamu?',
    slug: 'undangan-digital-vs-cetak',
    excerpt: 'Masih bingung pilih undangan digital atau cetak? Kami bandingkan dari segi biaya, kepraktisan, kesan personal, dan dampak lingkungan. Baca perbandingan lengkapnya.',
    coverUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?w=1200&q=80',
    authorName: 'Rizky Pratama',
    tags: 'undangan digital, perbandingan, tips',
    metaTitle: 'Undangan Digital vs Cetak: Perbandingan Lengkap untuk Pernikahan',
    metaDesc: 'Perbandingan lengkap undangan digital dan cetak dari segi biaya, kepraktisan, dan kesan. Temukan yang paling cocok untuk pernikahan kamu.',
    content: `Memilih antara undangan digital dan undangan cetak adalah salah satu keputusan awal yang harus diambil oleh calon pengantin. Keduanya punya kelebihan masing-masing, dan pilihan terbaik tergantung pada kebutuhan dan prioritas kalian.

## Perbandingan Biaya

### Undangan Cetak
- Desain: Rp 500.000 - 2.000.000
- Cetak 300 eksemplar: Rp 1.500.000 - 5.000.000
- Amplop & hiasan: Rp 300.000 - 1.000.000
- Ongkos kirim/antar: Rp 200.000 - 500.000
- **Total: Rp 2.500.000 - 8.500.000**

### Undangan Digital
- Platform undangan digital: Rp 79.000 - 249.000
- Sudah termasuk semua fitur
- Tidak ada biaya kirim
- **Total: Rp 79.000 - 249.000**

> Dari segi biaya, undangan digital menghemat hingga **95%** dibandingkan undangan cetak.

## Kepraktisan

![Mengirim undangan digital melalui smartphone](https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80)

Undangan digital unggul jauh dalam hal kepraktisan:

- **Pengiriman instan**   kirim ke ratusan tamu dalam hitungan menit via WhatsApp
- **RSVP otomatis**   tamu konfirmasi langsung dari undangan, data terkumpul rapi
- **Mudah diupdate**   ada perubahan? Edit langsung tanpa perlu cetak ulang
- **Peta lokasi interaktif**   tamu tidak perlu bertanya arah ke venue

Sementara undangan cetak membutuhkan:
- Waktu produksi 1-2 minggu
- Distribusi manual yang memakan waktu
- Tidak bisa diubah setelah dicetak

## Kesan Personal

Ini adalah area di mana banyak orang mengira undangan cetak lebih unggul. Tapi undangan digital modern sudah berevolusi jauh:

**Undangan digital masa kini menawarkan:**
- Nama tamu yang muncul personal saat dibuka
- Musik latar yang bisa dipilih sendiri
- Animasi pembuka yang memukau
- Galeri foto pasangan
- Countdown ke hari H

Kesan "wah" dari undangan digital yang well-designed sering kali lebih besar dari kartu cetak yang hanya dibaca sekilas lalu disimpan.

## Dampak Lingkungan

Satu hal yang semakin diperhatikan generasi muda adalah **sustainability**:

- 300 undangan cetak = 1 pohon kecil
- Undangan digital = **0 limbah kertas**
- Tidak ada tinta, lem, atau plastik pembungkus

Memilih undangan digital adalah langkah kecil tapi bermakna untuk pernikahan yang lebih ramah lingkungan.

## Kapan Undangan Cetak Masih Relevan?

Ada beberapa situasi di mana undangan cetak masih jadi pilihan tepat:

1. **Keluarga tradisional** yang sangat menghargai undangan fisik
2. **Pernikahan adat** yang memiliki prosesi penyerahan undangan
3. **Tamu lansia** yang tidak familiar dengan teknologi

**Solusi terbaik?** Kombinasikan keduanya. Cetak undangan dalam jumlah terbatas untuk keluarga inti dan tetua, sementara mayoritas tamu menerima undangan digital.

## Kesimpulan

| Aspek | Digital | Cetak |
|-------|---------|-------|
| Biaya | Sangat hemat | Mahal |
| Kecepatan | Instan | 1-2 minggu |
| Update | Kapan saja | Tidak bisa |
| RSVP | Otomatis | Manual |
| Kesan | Modern & interaktif | Klasik & tangible |
| Lingkungan | Ramah | Boros kertas |

Untuk pasangan modern yang ingin **hemat, praktis, dan berkesan**, undangan digital adalah pilihan yang jelas. Platform seperti iaundang bahkan memungkinkan kalian mencoba dulu gratis sebelum memutuskan.

---

*Apapun pilihan kalian, yang terpenting adalah undangan itu menyampaikan cinta dan kebahagiaan kalian kepada orang-orang tercinta.*`,
    settings: {
      featured: false,
      pinned: false,
      comments: { moderation: 'auto', bannedWords: '', closeAfterDays: 0, requireLogin: false, allowReplies: true, maxLength: 500 },
      seo: { focusKeyword: 'undangan digital', canonicalUrl: '', ogImageUrl: '', noIndex: false },
      ads: { enabled: false, positions: [], adCode: '' },
      backlinks: { internal: [], external: [] },
    },
  },
  {
    title: '7 Tren Pernikahan 2026 yang Wajib Kamu Tahu',
    slug: 'tren-pernikahan-2026',
    excerpt: 'Dari intimate wedding hingga teknologi AR di undangan, ini 7 tren pernikahan 2026 yang sedang naik daun. Mana yang paling cocok dengan gaya kalian?',
    coverUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=1200&q=80',
    authorName: 'Nadia Kusuma',
    tags: 'tren pernikahan, 2026, inspirasi',
    metaTitle: '7 Tren Pernikahan 2026 yang Wajib Kamu Tahu',
    metaDesc: 'Temukan 7 tren pernikahan paling populer di tahun 2026: dari intimate wedding, sustainable concept, hingga teknologi undangan digital.',
    content: `Setiap tahun, dunia pernikahan terus berevolusi. Tahun 2026 membawa perpaduan menarik antara tradisi yang kembali populer dan teknologi yang semakin canggih. Berikut 7 tren yang mendominasi industri pernikahan tahun ini.

## 1. Intimate Wedding Tetap Jadi Favorit

Konsep pernikahan intimate dengan 50-100 tamu semakin populer. Alih-alih mengundang ratusan orang, pasangan lebih memilih kualitas dibanding kuantitas:

- **Budget per tamu lebih besar**   makanan lebih berkualitas, dekorasi lebih detail
- **Interaksi lebih bermakna**   sempat ngobrol dengan setiap tamu
- **Venue lebih fleksibel**   restoran, villa, bahkan rooftop

![Intimate wedding di taman](https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80)

> "Kami hanya mengundang 80 orang dan itu adalah keputusan terbaik. Setiap tamu benar-benar menikmati momen bersama kami."   Andi & Fira, menikah Januari 2026

## 2. Sustainable Wedding

Generasi muda semakin peduli dengan dampak lingkungan, termasuk di hari pernikahan:

- **Zero-waste decoration**   menggunakan tanaman hidup sebagai dekorasi yang bisa dibawa pulang tamu
- **Digital invitation only**   mengurangi limbah kertas secara signifikan
- **Local & seasonal flowers**   bunga lokal yang tidak perlu impor
- **Edible favors**   souvenir berupa makanan yang bisa langsung dinikmati, bukan barang yang berakhir di gudang

## 3. Undangan Digital Interaktif

2026 adalah tahun di mana undangan digital bukan lagi sekadar alternatif   tapi menjadi **standar baru**:

- **Opening animation**   nama tamu muncul personal dengan animasi memukau
- **Musik latar otomatis**   suasana langsung terbangun saat undangan dibuka
- **RSVP terintegrasi**   tamu konfirmasi dalam 1 tap
- **Galeri & countdown**   semua info dalam satu link

Platform seperti iaundang memungkinkan pasangan membuat undangan digital premium dengan harga mulai dari Rp 79.000   jauh lebih hemat dari undangan cetak tradisional.

## 4. Micro Reception + Live Streaming

Konsep hybrid yang lahir dari pandemi ternyata bertahan:

- Resepsi intimate untuk keluarga dan teman dekat
- Live streaming untuk tamu yang tidak bisa hadir
- Virtual guest book untuk ucapan dari seluruh dunia

Ini solusi sempurna untuk pasangan yang punya keluarga di kota atau negara berbeda.

## 5. Non-Traditional Venues

Venue konvensional seperti hotel ballroom mulai ditinggalkan. Pasangan 2026 lebih memilih:

- **Kebun atau perkebunan**   nuansa natural dan foto yang stunning
- **Museum atau galeri seni**   sophisticated dan unik
- **Restoran favorit**   personal dan penuh kenangan
- **Pantai atau tebing**   dramatic dan memorable

![Pernikahan di pantai saat sunset](https://images.unsplash.com/photo-1546032996-6dfacbacbf3f?w=800&q=80)

## 6. Personalized Experience untuk Tamu

Bukan lagi one-size-fits-all. Pasangan modern memberikan pengalaman unik:

- **Custom welcome drink**   koktail signature dengan nama pasangan
- **Interactive food station**   tamu pilih dan racik sendiri
- **Photo booth dengan AI filter**   hasil langsung dikirim ke HP tamu
- **Personalized playlist**   tamu bisa request lagu via QR code

## 7. Earth Tones & Natural Palette

Warna-warna yang mendominasi pernikahan 2026:

- **Sage green**   natural dan menenangkan
- **Terracotta**   hangat dan earthy
- **Dusty rose**   romantis tapi tidak berlebihan
- **Cream & ivory**   timeless dan elegan
- **Deep emerald**   mewah dan sophisticated

Palet warna ini sempurna dipadu dengan dekorasi natural: kayu, dedaunan hijau, dan bunga-bunga kering.

---

## Mana Tren Favoritmu?

Setiap pasangan punya cerita dan gaya unik. Tren hanyalah inspirasi   yang terpenting adalah pernikahan yang mencerminkan **siapa kalian berdua**.

Apakah kalian sudah mulai merencanakan pernikahan? Mulai dengan hal yang paling mudah: buat undangan digital kalian sekarang dan rasakan bedanya!`,
    settings: {
      featured: false,
      pinned: false,
      comments: { moderation: 'auto', bannedWords: '', closeAfterDays: 0, requireLogin: false, allowReplies: true, maxLength: 500 },
      seo: { focusKeyword: 'tren pernikahan 2026', canonicalUrl: '', ogImageUrl: '', noIndex: false },
      ads: { enabled: false, positions: [], adCode: '' },
      backlinks: { internal: [], external: [] },
    },
  },
]

async function main() {
  console.log('Seeding articles...')

  for (const article of ARTICLES) {
    const existing = await prisma.article.findUnique({ where: { slug: article.slug } })
    if (existing) {
      console.log(`  Skipped: "${article.title}" (slug exists)`)
      continue
    }

    await prisma.article.create({
      data: {
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt,
        content: article.content,
        coverUrl: article.coverUrl,
        authorName: article.authorName,
        authorAvatar: '',
        isPublished: true,
        publishedAt: new Date(),
        allowLikes: true,
        allowComments: true,
        metaTitle: article.metaTitle,
        metaDesc: article.metaDesc,
        tags: article.tags,
        settings: article.settings as object,
      },
    })
    console.log(`  Created: "${article.title}"`)
  }

  console.log('Done!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
