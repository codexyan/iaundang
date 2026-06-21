# Migrasi DB iaundang — JSON Local → Prisma + SQLite

Status: **Plan** (belum dieksekusi). File `schema.prisma` sudah siap, tinggal jalankan langkah di bawah saat ready.

## Filosofi

- **SQLite lokal untuk dev** — file `prisma/dev.db`, tidak ada server DB yang perlu di-spin-up.
- **MySQL-compat schema** — semua tipe portable (cuid, Json, DateTime, String/Int). Untuk swap ke MySQL nanti: ganti `provider = "mysql"` di datasource + ubah `DATABASE_URL`.
- **Tidak ada breaking change langsung** — `lib/db.ts` (JSON layer) tetap berfungsi sampai semua call site di-port ke Prisma client. Migrasi inkremental, bukan big-bang.

## 7 tabel target

| Model Prisma | Tabel DB | Tujuan |
|---|---|---|
| `User` | `users` | Auth + plan tier |
| `Template` | `templates` | Katalog template publish dari Template Lab |
| `Invitation` | `invitations` | Undangan yang dibuat user |
| `Guest` | `guests` | Daftar tamu (untuk personalisasi link) |
| `RsvpResponse` | `rsvp_responses` | Submit RSVP dari undangan publik |
| `Wish` | `wishes` | Buku ucapan realtime |
| `GiftInfo` | `gift_info` | Multi-rekening per undangan |

`Gift Registry` (Tokopedia/Shopee link) **TIDAK** dipisah tabel — disimpan di `Invitation.coupleData` Json untuk hindari overhead tabel kecil semi-statis.

## Langkah eksekusi

### 1. Install Prisma
```bash
npm install -D prisma
npm install @prisma/client
```

### 2. Set DATABASE_URL di `.env.local`
```
DATABASE_URL="file:./prisma/dev.db"
```

### 3. Generate client + jalankan initial migration
```bash
npx prisma migrate dev --name init
```
Ini akan:
- Buat file `prisma/dev.db`
- Generate `prisma/migrations/<timestamp>_init/migration.sql`
- Generate `@prisma/client` di `node_modules/.prisma/`

### 4. Buat `lib/prisma.ts` (singleton client)
```ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### 5. Tulis seed script `prisma/seed.ts` untuk migrate data JSON existing
Baca `data/users.json`, `data/invitations.json`, `data/galleries.json`, `data/template_records.json`, `data/wishes.json`, `data/payment_proofs.json`, lalu insert ke tabel Prisma. Mapping ringkas:

| Source JSON | Target tabel | Catatan |
|---|---|---|
| `users.json` (`id`, `email`, `password_hash`, `created_at`) | `User` | 1-to-1 langsung |
| `template_records.json` | `Template` | `config` → split jadi `sectionsConfig` (config.sections) + `designTokens` (config.meta + config.opening + config.loading) |
| `invitations.json` (`data` jsonb) | `Invitation` | Split `data` jadi 4 kolom Json: `coupleData` (bride/groom/tagline/foto), `eventData` (akad+resepsi+livestream), `storyData` (story_*), `galleryUrls` (gallery_photos) |
| `galleries.json` | (merge ke `Invitation.galleryUrls`) | Konsolidasi ke array URL di Invitation |
| `guests.json` (kalau ada) | `RsvpResponse` + `Guest` | RSVP dari undangan publik → `RsvpResponse`. Daftar tamu yang di-import user → `Guest`. |
| `wishes.json` | `Wish` | 1-to-1 |
| (dari `Invitation.data.gift_accounts`) | `GiftInfo` | Loop array per invitation, insert 1 row per bank |

### 6. Eksekusi seed
```bash
npx prisma db seed
```
(Butuh entry `"prisma": { "seed": "tsx prisma/seed.ts" }` di `package.json` + install `tsx` dev dep.)

### 7. Port call-sites dari `lib/db.ts` ke Prisma client (bertahap)
Urutan rekomendasi (low risk → high risk):
1. **Read-only**: dashboard list invitations, public `/invitation/[slug]` page, list templates di Template Lab UI
2. **Auth**: register/login (`users.create`, `findByEmail`)
3. **Mutasi user**: `invitations.create`, `invitations.update` dari wizard
4. **Public submit**: RSVP, wishes (write-heavy, perlu retry)
5. **Admin panel**: settings, payment-config, proofs

Tiap call-site jadi 1 PR kecil. Setelah semua di-port, hapus `lib/db.ts` + folder `data/`.

## Swap ke MySQL nanti

Ketika siap deploy:
1. Ganti `provider = "sqlite"` → `"mysql"` di `schema.prisma`
2. Update `DATABASE_URL` ke MySQL connection string (PlanetScale/Railway/Aiven)
3. `npx prisma migrate dev --name switch-to-mysql` — akan generate migrasi baru
4. (Opsional) Tambah `@db.LongText` ke kolom Json kalau payload besar:
   ```prisma
   sectionsConfig Json @map("sections_config") @db.LongText
   ```
5. Re-seed dari production data atau dump-restore.

## Catatan SQLite-spesifik

- **Tidak ada `Json` validator native** — Prisma serialize ke text. Validasi struktur di app layer (Zod).
- **Tidak ada `Decimal` native** — pakai `Int` untuk uang (`price` dalam rupiah utuh, bukan desimal).
- **Single-writer** — SQLite mengunci file untuk write. Untuk dev solo cukup; production tidak.
- **No `enum` type** — pakai `String` + validasi enum di Zod (mis. `attendance: 'yes' | 'no' | 'maybe'`).

## Dependensi yang perlu ditambah ke package.json

```json
{
  "dependencies": {
    "@prisma/client": "^5.x"
  },
  "devDependencies": {
    "prisma": "^5.x",
    "tsx": "^4.x"
  }
}
```

## File yang akan dihapus setelah migrasi selesai

- `lib/db.ts` (replaced by Prisma client)
- `data/*.json` (data moved to SQLite)
- `supabase/schema.sql` (legacy, sudah tidak dipakai)
