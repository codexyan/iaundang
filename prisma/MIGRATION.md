# Migrasi DB iaundang

Status: **COMPLETE** - Prisma + Supabase PostgreSQL aktif per 29 Juni 2026

## Apa yang sudah dilakukan

- `prisma db push` ke Supabase PostgreSQL (ap-south-1)
- Schema: 22 models (User, Invitation, Guest, Order, Subscription, MusicTrack, Experiment, dll)
- `lib/db.ts` menggunakan Prisma client (bukan JSON file)
- `lib/prisma.ts` singleton client aktif

## Seeds

| Script | Data | Jumlah |
|--------|------|--------|
| `scripts/seed-templates.ts` | TemplateRecord (Javanese Gold, Rose Garden, Midnight Luxe) | 3 |
| `scripts/seed-music-categories.ts` | MusicCategory (Romantis, Islami, Instrumental, Pop, Tradisional, Lainnya) | 6 |
| `scripts/seed-app-settings.ts` | AppSetting (siteName, packages, payment config) | 1 |
| `scripts/seed-admin.ts` | Admin user account | 1 |
| `scripts/seed-articles.ts` | Blog articles | varies |

## Cara re-seed (safe, menggunakan upsert)

```bash
npx tsx scripts/seed-templates.ts
npx tsx scripts/seed-music-categories.ts
npx tsx scripts/seed-app-settings.ts
```

## Verifikasi koneksi

```bash
npx tsx scripts/verify-db.ts
```

Output yang diharapkan:
```
Templates: 3
Music categories: 6
App settings: 1
DB connection OK - all seeds verified
```

## Migrasi history

| Timestamp | Nama | Deskripsi |
|-----------|------|-----------|
| 20260629115822 | add_subscription_model | Model Subscription |
| 20260629123825 | unify_guest_contacts | Unifikasi Guest + RSVP + Contacts |
| 20260629124858 | add_invitation_views | Model InvitationView untuk analytics |

## Legacy files (tidak lagi digunakan)

- `supabase/schema.sql` - SQL schema lama, referensi saja
- `data/*.json` - data JSON lama (sudah migrasi ke PostgreSQL)
