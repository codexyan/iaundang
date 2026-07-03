# iaundang — Peta Struktur Folder (Onboarding Map)

**Dibuat:** 3 Juli 2026
**Tujuan:** Peta direktori yang di-annotate untuk onboarding developer baru. Dokumen ini
adalah hasil audit langsung terhadap kode (`git ls-files`), bukan salinan dari
`ARCHITECTURE.md`. Bila ada perbedaan antara dokumen ini dan `ARCHITECTURE.md`, **dokumen
ini yang lebih akurat** (lihat bagian "Perbedaan vs ARCHITECTURE.md" di bawah).

> Catatan: `ARCHITECTURE.md` (per 29 Juni 2026) sudah tertinggal dari kondisi kode saat ini
> di beberapa bagian penting. Ketidaksesuaian dicatat di sini dan di
> `AUDIT_REPORT_2026-07-03.md`.

---

## 1. Stack Aktual (terverifikasi dari kode)

| Layer | Teknologi | Bukti |
|-------|-----------|-------|
| Framework | Next.js **14.2.35** (App Router, React 18) | `package.json` |
| Bahasa | TypeScript | `tsconfig.json` |
| Database | PostgreSQL (Supabase) | `prisma/schema.prisma` (`provider = "postgresql"`) |
| ORM | Prisma **5.22** | `lib/prisma.ts`, `prisma/` |
| Auth | **Custom JWT** via `jose`, cookie session (BUKAN Supabase Auth) | `lib/session.ts` |
| Storage | Supabase Storage, **satu bucket: `uploads`** | `lib/supabase.ts` |
| Email | Resend (fallback: console) | `lib/email.ts` |
| Pembayaran | **Manual transfer (utama) + Mayar (opsional/otomatis)** | `lib/mayar.ts`, `components/admin/tabs/PaymentTab.tsx` |
| Styling | Tailwind CSS | `tailwind.config.ts` |
| Editor konten | Tiptap | `package.json` |

Akses DB dilakukan **server-side lewat Prisma** (koneksi Postgres langsung via `DATABASE_URL`)
dan Storage lewat **`SUPABASE_SERVICE_ROLE_KEY`**. Tidak ada Supabase client-side yang
memakai anon key. Implikasi keamanan dibahas di laporan audit (RLS bukan garis pertahanan).

---

## 2. Pohon Direktori Top-Level

```
dev-kuundang/
├── app/                 # Next.js App Router: halaman + API routes (~120 file)
├── components/          # Komponen React (150 file, 11 sub-modul)
├── lib/                 # Logika domain, service, util (32 file)
├── hooks/               # React hooks bersama (1 file: usePackageGating.ts)
├── prisma/              # Schema + migrations (source of truth DB)
├── scripts/             # Script seed & maintenance (tsx/node, 11 file)
├── public/              # Aset statis (logos, images, favicon). /uploads di-gitignore
├── supabase/            # ⚠️ schema.sql USANG (arsitektur lama, lihat catatan)
├── docs/                # ARCHITECTURE.md, COMPANY_BLUEPRINT.md, CHANGELOG.md, (file ini)
├── middleware.ts        # Routing subdomain + proteksi rute /dashboard /admin /writer /affiliate
├── vercel.json          # Konfigurasi cron Vercel (1 cron: sync-subscriptions)
├── *.md (root)          # ⚠️ ~13 catatan dev tersebar (lihat "Kebersihan Root")
└── konfigurasi          # next.config.mjs, tailwind.config.ts, tsconfig.json, .eslintrc.json, .npmrc
```

---

## 3. `app/` — Routing & API

Next.js App Router memakai **route groups** `(…)` yang tidak muncul di URL.

### 3.1 Halaman (pages)

| Path | Route group | Isi |
|------|-------------|-----|
| `app/(main)/` | Publik | Landing (`page.tsx`), `blog/` + `blog/[slug]`, `templates/` + `templates/[slug]`, `order/` (form pemesanan), `terms/`, `privacy/`, layout (Navbar+Footer) |
| `app/(auth)/` | Publik | `login/`, `register/`, `forgot-password/`, `reset-password/`, layout auth |
| `app/(app)/` | **Butuh login** | `dashboard/`, `admin/`, `affiliate/`, `writer/`, layout |
| `app/invitation/[slug]/` | Publik | Tampilan undangan (dipakai rewrite subdomain dari `middleware.ts`) |
| `app/demo/[template]/` | Publik | Preview template (`page.tsx` + `DemoPreviewClient.tsx`) |
| `app/demo/renderer/` | Publik | ⚠️ Harness dev renderer/editor (`DemoShell`, `DemoEditorClient`) — publik tanpa auth |
| `app/` (root) | — | `layout.tsx`, `error.tsx`, `not-found.tsx`, `robots.ts`, `sitemap.ts`, `globals.css` |

> Empat area butuh-login (`dashboard`, `admin`, `affiliate`, `writer`) diproteksi oleh
> `middleware.ts`. `ARCHITECTURE.md` hanya menyebut dashboard + admin.

### 3.2 API (`app/api/`) — 80+ route handler

Setiap folder berisi `route.ts`. Dikelompokkan berdasarkan siapa yang boleh akses:

| Kelompok | Folder | Auth | Contoh |
|----------|--------|------|--------|
| **Auth** | `api/auth/*` | Publik (set/hapus cookie) | `login`, `register`, `logout`, `me`, `forgot-password`, `reset-password` |
| **Publik (undangan)** | `api/rsvp`, `api/wishes`, `api/views`, `api/gift-proof(+/upload)`, `api/music`, `api/orders(+/check-subdomain)`, `api/payment/config`, `api/experiments/assign`, `api/referral (POST)`, `api/articles` | Tanpa sesi | Dipakai halaman undangan/publik |
| **User (butuh sesi)** | `api/invitations`, `api/guests(+/blast-sent)`, `api/galleries(+/upload, /music)`, `api/payment/proof`, `api/user/*`, `api/tickets`, `api/analytics`, `api/feedback`, `api/affiliate/*` | `getSession()` | CRUD milik user sendiri |
| **Admin** | `api/admin/*` (38 file) | `isAdmin(session)` di tiap handler | users, orders, proofs, templates, music, settings, articles, writers, dst. |
| **Writer** | `api/writer/*` (7 file) | `isWriter(session)` | Workflow artikel (draft→review→publish) |
| **Cron** | `api/cron/sync-subscriptions`, `api/cron/publish-scheduled` | `Bearer ${CRON_SECRET}` | Batch expire & publikasi terjadwal |
| **Webhook** | `api/payment/mayar/webhook` | Token Mayar | Aktivasi order otomatis |

Konvensi: rute dinamis pakai `[id]`/`[slug]`/`[userId]`; segmen aksi jadi sub-folder
(`.../[id]/reply`, `.../[id]/review`, `.../[id]/submit`, `.../[id]/seen`, `.../[userId]/trust`).

---

## 4. `components/` — 150 file, 11 sub-modul

| Sub-folder | ± File | Tujuan |
|------------|-------|--------|
| `renderer/` | 51 | **Mesin render undangan v2 (JSON-driven).** Inti produk; merender section dari `TemplateRecord.config`. |
| `studio/` | 25 | ⚠️ **Studio / Template Lab** — builder template component-driven. **Tidak terdokumentasi di ARCHITECTURE.md sama sekali.** |
| `admin/` | 21 | Panel admin: `AdminPanel.tsx` (shell) + `tabs/` (**17 tab**, bukan 15) |
| `dashboard/` | 18 | Modul dashboard user (overview, tamu, RSVP, analitik, referral, langganan, bantuan, settings) |
| `landing/` | 12 | Section landing page |
| `ui/` | 8 | Komponen bersama (Button, Logo, Navbar, Footer, BankCard, dll.) |
| `templates/` | 8 | **Template hardcoded v1 (legacy tapi MASIH DIPAKAI):** `modern-white/`, `floral-garden/`, `dark-elegant/` + `shared/` (Countdown, MusicPlayer, OpeningAnimation, RSVPForm, WishesSection). Di-import oleh `app/invitation/[slug]/page.tsx`. |
| `blog/` | 3 | Komponen blog |
| `controls/` | 2 | Kontrol editor (tidak terdokumentasi) |
| `analytics/` | 1 | `ViewTracker` |
| `app/` | 1 | Wrapper app-level |

> **Penting:** `components/templates/` disebut "Legacy Hardcoded" di dokumen lama, tapi **bukan
> dead code** — halaman undangan publik masih mengimpornya (jalur render v1). Ada dua jalur
> render undangan yang hidup berdampingan (v1 hardcoded + v2 JSON renderer).

---

## 5. `lib/` — 32 file (logika domain & service)

Dikelompokkan berdasarkan fungsi (semua di root `lib/`, tidak bertingkat kecuali
`template-configs/`):

**Auth & sesi**
- `session.ts` — encode/verify JWT (Edge-safe). Cookie `__ku_session`, env `SESSION_SECRET`.
- `session-server.ts` — `getSession()` untuk Server Component / API route.
- `auth.ts` — helper `isAdmin` / `isWriter` / `isAffiliate` / `getAdminEmail`.

**Data & infrastruktur**
- `db.ts` — **layer akses data utama** (semua query Prisma dibungkus fungsi bertipe).
- `prisma.ts` — singleton Prisma client.
- `supabase.ts` — client service-role + `uploadToStorage` / `deleteFromStorage` (bucket `uploads`).
- `types.ts` — interface TypeScript bersama.

**Domain bisnis**
- `subscription.ts`, `packages.ts`, `pricing-config.ts`, `notifications.ts`, `experiments.ts`,
  `slug-generator.ts`, `studio-progress.ts`.
- `mayar.ts` — integrasi payment gateway Mayar.

**Konten & artikel**
- `article-markdown.ts`, `article-status.ts`.

**Studio / template / dekorasi**
- `built-in-assets.ts`, `component-styles.ts`, `color-contrast.ts`,
  `decoration-presets.ts`, `decoration-preset-bundles.ts`, `decoration-utils.ts`,
  `image-process.ts`.
- `template-configs/` — definisi 3 template JSON: `javanese-gold.ts`, `rose-garden.ts`, `midnight-luxe.ts`.

**Email & util**
- `email.ts`, `email-templates.ts`, `config.ts`, `demo-data.ts`, `utils.ts`.

> `ARCHITECTURE.md` mendaftar ~13 file lib; jumlah nyata **32**. Perhatikan ada **dua** sumber
> harga: `packages.ts` dan `pricing-config.ts` — perlu diklarifikasi mana yang otoritatif.

---

## 6. `prisma/` — Skema Database (source of truth)

```
prisma/
├── schema.prisma      # 27 model (SUMBER KEBENARAN skema)
├── migrations/        # 5 migrasi Prisma (subscription, unify-guest, invitation-views,
│                      #   editorial-workflow, revision-seen-at) + migration_lock.toml
├── create-tables.sql  # ⚠️ SQL manual — berpotensi tumpang tindih/usang vs migrations
└── MIGRATION.md       # Catatan migrasi
```

**27 model** (bukan 22 seperti di dokumen): User, Invitation, Gallery, Guest, Wish,
TemplateRecord, PaymentProof, GiftProof, MusicTrack, MusicCategory, Article,
**ArticleCategory**, **WriterProfile**, Affiliate, Referral, AffiliateWithdrawal,
SupportTicket, TicketReply, PasswordResetToken, Order, Subscription, Experiment,
ExperimentEvent, UserFeedback, UserReferral, InvitationView, AppSetting.
(`ArticleCategory` & `WriterProfile` tidak ada di ARCHITECTURE.md.)

Konvensi: field `camelCase` di Prisma dipetakan ke kolom `snake_case` via `@map`; nama tabel
`snake_case` plural via `@@map`.

> ⚠️ Ada **empat** representasi skema di repo: `schema.prisma` (benar), `migrations/*` (benar),
> `prisma/create-tables.sql`, dan `supabase/schema.sql` (usang — lihat §8). Hanya
> `schema.prisma` + `migrations/` yang boleh dianggap otoritatif.

---

## 7. `scripts/`, `hooks/`, `public/`, `docs/`

- **`scripts/` (11):** seed & maintenance dijalankan via `tsx`. Termasuk `seed-admin.ts`
  **dan** `seed-admin.mjs` (duplikat — perlu dipilih satu), `seed-app-settings`,
  `seed-articles`, `seed-javanese-gold`, `seed-music-categories`, `seed-templates`,
  `seed-test-invitation`, `seed-test-user`, `upload-iqro`, `verify-db`.
- **`hooks/`:** `usePackageGating.ts` (gating fitur per paket).
- **`public/`:** `logos/` (14), `images/` (4), `favicon.png`. `public/uploads/` ada di disk
  tapi **di-gitignore** (aset user, tidak di-commit).
- **`docs/`:** `ARCHITECTURE.md`, `COMPANY_BLUEPRINT.md`, `CHANGELOG.md`, + file ini &
  laporan audit.

---

## 8. Area Usang / Membingungkan (wajib dibaca developer baru)

1. **`supabase/schema.sql` — USANG & MENYESATKAN.** Mendefinisikan hanya 5 tabel dengan PK
   `uuid` dan FK ke `auth.users` (Supabase Auth), order berbasis **Midtrans**, plus policy
   **RLS** berbasis `auth.uid()`. Ini sisa arsitektur awal yang **sudah ditinggalkan**. Sistem
   nyata: Prisma + `cuid()` + **custom JWT** (bukan Supabase Auth) + **Mayar**. Policy RLS di
   file ini **tidak berlaku** untuk cara aplikasi mengakses DB. Jangan dijadikan acuan.
2. **`.env.local.example` vs `.env.example` — SALING BERTENTANGAN.** `.env.local.example`
   menyebut **Midtrans** (`MIDTRANS_*`) yang tidak dipakai kode sama sekali; `.env.example`
   menyebut **Mayar**. Kode nyata memakai Mayar. (Detail di laporan audit.)
3. **`app/demo/renderer/`** — harness dev renderer, publik tanpa auth. Pertimbangkan gating di
   production.
4. **Dua jalur render undangan** (`components/templates/` v1 vs `components/renderer/` v2) hidup
   berdampingan.
5. **`components/studio/`** (25 file) dan seluruh subsistem **Writer** (role `content_writer`,
   `api/writer/*`, `WriterProfile`, workflow editorial artikel) tidak terdokumentasi.

---

## 9. Kebersihan Root (onboarding hygiene)

`README.md` praktis kosong (hanya judul `# iaundang`). Sebaliknya, root berisi ~13 catatan dev
sekali-pakai yang berserakan: `BUGS.md`, `BUG_AUDIT_REPORT.md`, `DOUBLE_ENTRY_FIX.md`,
`FIX_ADMIN_LOGIN.md`, `FIX_CACHE_ISSUE.md`, `LOADING_SCREEN_FIX.md`, `LOGO_PROMPT.md`,
`OPENING_FEATURE_FIX.md`, `STUDIO_AUDIT_REPORT.md`, `STUDIO_FEATURES_AUDIT.md`,
`TEMPLATE_LAB_REFACTOR_PLAN.md`, `VERCEL_SETUP.md`, `.git-commit-message.txt`,
`fix-claude-model.bat`. Rekomendasi: isi `README.md` sebagai titik masuk onboarding
(quickstart + link ke `docs/`), dan pindahkan catatan lama ke `docs/notes/` atau arsip.

---

## 10. Perbedaan vs `docs/ARCHITECTURE.md` (ringkas)

| Topik | ARCHITECTURE.md | Kode nyata |
|-------|-----------------|-----------|
| Nama cookie sesi | `iaundang_session` | `__ku_session` |
| Env secret JWT | `JWT_SECRET` | `SESSION_SECRET` (`JWT_SECRET` tidak dibaca kode) |
| Jumlah model Prisma | "22" | **27** (dan tabelnya sendiri melist 25) |
| Model tak terdaftar | — | `ArticleCategory`, `WriterProfile` |
| Area login | dashboard, admin | dashboard, admin, **affiliate, writer** |
| Tab admin | 15 | 17 |
| Payment | tak disebut Mayar | Mayar + manual (schema `Order` punya `mayar*`) |
| `components/studio/` | tak ada | 25 file (Template Lab / Studio) |
| Subsistem Writer | tak ada | role + `api/writer/*` + workflow editorial |
| Bucket storage | "galleries, music, hero-photos" (schema lama) | satu bucket `uploads` |
| Domain | `iaundang.online` | `iaundang.online` (konsisten; tidak ditemukan `iaundang.id`) |

Detail penuh + rekomendasi ada di **`AUDIT_REPORT_2026-07-03.md`**.
