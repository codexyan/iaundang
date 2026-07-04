# Vercel Deployment Setup

Stack: **Next.js + Prisma + Supabase PostgreSQL**. Hanya Supabase yang dipakai — tidak ada opsi SQLite/MySQL.

## Environment Variables

Tambahkan variabel berikut di Vercel → Project Settings → Environment Variables. Set per environment (Production / Preview / Development) sesuai kebutuhan.

### Required

```bash
# Database (Prisma → Supabase PostgreSQL, pakai connection pooler)
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

# Supabase (Storage & Auth)
NEXT_PUBLIC_SUPABASE_URL="https://[project-ref].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"   # RAHASIA

# Session secret (JWT via jose) — WAJIB di production (tidak ada fallback)
SESSION_SECRET="generate: openssl rand -base64 32"

# Admin
ADMIN_EMAIL="admin@iaundang.online"
NEXT_PUBLIC_ADMIN_EMAIL="admin@iaundang.online"

# App URL & Domain (domain berbeda per environment — lihat bagian di bawah)
NEXT_PUBLIC_APP_URL="https://iaundang.online"
NEXT_PUBLIC_APP_DOMAIN="iaundang.online"

# Payment - Mayar
MAYAR_API_KEY="your-mayar-api-key"
MAYAR_WEBHOOK_TOKEN="your-mayar-webhook-token"
```

### Optional

```bash
# Email (Resend) — jika kosong, email jatuh ke console log
RESEND_API_KEY=""
EMAIL_FROM="iaundang <halo@iaundang.online>"

# Cron (Bearer token untuk endpoint /api/cron/*)
CRON_SECRET=""
```

## Build Configuration

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Install Command | `npm install` |
| Output Directory | `.next` |
| Node.js Version | `20.x` |

Prisma Client digenerate otomatis lewat script `postinstall`.

## Database Setup (Supabase PostgreSQL)

1. Buat project di [Supabase](https://supabase.com) — sudah termasuk PostgreSQL + Storage.
2. Ambil connection string **pooler** (port `6543`, `pgbouncer=true`) untuk `DATABASE_URL`.
3. `prisma/schema.prisma` sudah memakai provider `postgresql`.
4. Jalankan migrasi:
   ```bash
   npx prisma migrate deploy
   ```

> Catatan: Fase 1 masih memakai **satu database (production)** untuk semua environment. Pemisahan database staging/production dilakukan di fase berikutnya.

## Environment per Branch

Mapping branch → Vercel environment → domain:

| Branch | Vercel Environment | Domain | `NEXT_PUBLIC_APP_DOMAIN` |
|--------|--------------------|--------|--------------------------|
| `main` | Production | `iaundang.online` | `iaundang.online` |
| `develop` / `staging` | Preview | `staging.iaundang.online` | `staging.iaundang.online` |
| `feature/*` | Preview (per-deploy URL) | `*.vercel.app` | (opsional) |
| lokal | Development | `localhost` | `localhost` |

- **Production** hanya di-deploy dari `main`.
- **Preview** otomatis dibuat untuk setiap push ke branch selain `main` (`develop`, `staging`, `feature/*`).
- Set `NEXT_PUBLIC_APP_DOMAIN` yang berbeda untuk scope **Production** vs **Preview** di Vercel agar rewrite subdomain & cookie bekerja per environment.
- Domain kustom `staging.iaundang.online` dipetakan ke branch `develop`/`staging` lewat Vercel → Domains.

## Deployment Checklist

- [ ] Set semua required env var (per environment yang sesuai)
- [ ] Set `DATABASE_URL` ke Supabase pooler
- [ ] Jalankan `npx prisma migrate deploy`
- [ ] `NEXT_PUBLIC_APP_URL` & `NEXT_PUBLIC_APP_DOMAIN` sesuai environment
- [ ] Generate `SESSION_SECRET` khusus production
- [ ] Konfigurasi custom domain (`iaundang.online` + `staging.iaundang.online`)
- [ ] Test di Preview dulu sebelum promote ke Production

## Common Issues

### Build Error: "DATABASE_URL not found"
Tambahkan `DATABASE_URL` di Vercel environment variables (untuk environment yang di-build).

### Build Error: "Prisma Client not generated"
Sudah dihandle `postinstall`. Jika masih error, cek build log.

### Runtime Error: "Can't reach database server"
1. Verifikasi `DATABASE_URL` benar (pakai pooler `6543`)
2. Pastikan Supabase project aktif
3. Cek kredensial & IP allowlist

## Support

- Vercel Build Logs
- Prisma: https://pris.ly/d/vercel-build
- Next.js: https://nextjs.org/docs/deployment
