# IAUndang — Changelog

Catatan perubahan teknis berdasarkan [Company Blueprint](./COMPANY_BLUEPRINT.md).

---

## [Sprint 7] — 2026-06-29

### A/B Testing Infrastructure (Q4: Experiment Framework)

**Schema — `prisma/schema.prisma`:**
- Model `Experiment` BARU: `key` (unique), `name`, `description`, `variants` (JSON: weight + value per variant), `traffic` (% of users), `isActive`
- Model `ExperimentEvent` BARU: `experimentId`, `variant`, `event` (view/conversion), `sessionId`, `userId`
- Index pada `experimentId` dan `variant`

**Service — `lib/experiments.ts` (BARU):**
- `experiments.findByKey()` — lookup experiment by key
- `experiments.create()` / `update()` / `delete()` — CRUD
- `experiments.findAll()` / `findActive()` — list experiments
- `experiments.assign()` — deterministic variant assignment via hash-based picker (consistent per session)
- `experiments.trackConversion()` — record conversion event
- `experiments.getReport()` — per-variant stats: views, conversions, conversion rate
- Hash-based variant picker ensures same session always gets same variant

**API — `app/api/experiments/route.ts` (BARU):**
- `GET /api/experiments` — admin only, list all experiments
- `POST /api/experiments` — admin only, create experiment (default: control + variant_a, 50/50)

**API — `app/api/experiments/[id]/route.ts` (BARU):**
- `GET /api/experiments/:id` — admin only, full report with variant stats
- `PATCH /api/experiments/:id` — admin only, update experiment (toggle active, change variants)
- `DELETE /api/experiments/:id` — admin only, delete experiment

**API — `app/api/experiments/assign/route.ts` (BARU):**
- `POST /api/experiments/assign` — public, assign variant by key + sessionId

**Admin — `components/admin/tabs/ExperimentsTab.tsx` (BARU):**
- Create experiment form (key, name, description)
- List all experiments with toggle active/inactive
- Per-experiment report view with conversion rates + progress bars
- Delete experiment

### Admin Feedback Dashboard (Q4: Feedback Insights)

**API — `app/api/admin/feedback/route.ts` (BARU):**
- `GET /api/admin/feedback` — admin only, NPS stats + all feedback list

**Admin — `components/admin/tabs/FeedbackTab.tsx` (BARU):**
- NPS score overview (score, total, promoters, passives, detractors)
- NPS distribution bar (green/amber/red proportional)
- Full feedback list with score color coding, comments, timestamps
- Empty state handling

**Admin — `components/admin/AdminPanel.tsx`:**
- Tambah 2 tab baru di sidebar group "Insights": Feedback + A/B Testing
- Import `FeedbackTab` dan `ExperimentsTab`

### Template Detail Pages (Q3: SEO Long-tail)

**Page — `app/(main)/templates/[slug]/page.tsx` (BARU):**
- Individual template detail page dengan SEO metadata unik per template
- JSON-LD `Product` structured data (name, price, brand, availability)
- Full template preview (color scheme overlay + cover photo)
- Feature list (Musik, Galeri, RSVP, Ucapan, Amplop, Video)
- Color palette display
- Price card + CTA (Coba Gratis / Buat Undangan)
- Related templates section (same category)
- Dynamic `generateMetadata()` per template slug

### Email Transport (Notification Upgrade)

**Service — `lib/notifications.ts`:**
- Upgrade transport dari console-only ke **Resend** email provider
- Graceful fallback: tanpa `RESEND_API_KEY` → console log (dev mode)
- Dengan `RESEND_API_KEY` → kirim email HTML via Resend API
- `buildHtml()` — branded email template (responsive, clean typography)
- Env vars: `RESEND_API_KEY`, `EMAIL_FROM`

**Config — `.env.example`:**
- Tambah `RESEND_API_KEY`, `EMAIL_FROM`, `CRON_SECRET`

### Bug Fixes

- Fix `ColorScheme.secondary` property access error di template detail page (field doesn't exist in type)
- Build, typecheck, dan lint: **zero errors, zero warnings**

---

## [Sprint 6] — 2026-06-29

### Customer Feedback Loop (Q4: NPS & User Feedback)

**Schema — `prisma/schema.prisma`:**
- Model `UserFeedback` BARU: `userId`, `type` (nps/feature/bug), `score` (0-10), `comment`, `page`
- Index pada `userId` dan `type`

**Database layer — `lib/db.ts`:**
- `userFeedback.create()` — simpan feedback dengan score, comment, context
- `userFeedback.findByUserId()` — history feedback per user
- `userFeedback.hasRecentFeedback()` — cek apakah user sudah feedback dalam 30 hari
- `userFeedback.getAverageNps()` — hitung NPS score (promoters - detractors) + breakdown
- `userFeedback.findAll()` — admin: semua feedback

**API — `app/api/feedback/route.ts` (BARU):**
- `POST /api/feedback` — submit NPS score (0-10) + comment, auth required
- `GET /api/feedback` — cek status recent feedback + history

**Widget — `components/dashboard/FeedbackWidget.tsx` (BARU):**
- Floating NPS widget, muncul otomatis 10 detik setelah load (jika belum feedback 30 hari)
- 0-10 score picker dengan color coding (merah/kuning/hijau)
- Dynamic placeholder berdasarkan score (detractor vs passive vs promoter)
- Animasi submit → thank you state → auto-dismiss
- Dismissible, tidak muncul lagi setelah di-dismiss

**Dashboard — `components/dashboard/DashboardClient.tsx`:**
- FeedbackWidget ditambahkan ke dashboard (render jika ada invitation)

---

## [Sprint 5] — 2026-06-29

### SEO Infrastructure (Q3: SEO/Content Foundation)

**`app/robots.ts` (BARU):**
- Dynamic `robots.txt` via Next.js Metadata API
- Allow semua path kecuali `/api/`, `/dashboard/`, `/admin/`, `/auth/`
- Sitemap URL: `https://iaundang.id/sitemap.xml`

**`app/sitemap.ts` (BARU):**
- Dynamic XML sitemap via Next.js Metadata API
- Static pages: homepage, blog, order (priority 1.0, 0.8, 0.7)
- Blog articles: semua published articles dari database (priority 0.6)
- Published paid invitations: up to 500 most recent (priority 0.4)

**JSON-LD Structured Data — `app/(main)/page.tsx`:**
- Schema.org `WebApplication` type untuk landing page
- Includes `AggregateOffer` (Rp 79k–249k, IDR)
- `applicationCategory: DesignApplication`

**JSON-LD Structured Data — `app/invitation/[slug]/page.tsx`:**
- Schema.org `Event` type untuk setiap undangan
- Fields: name, startDate, location (Place), organizer
- Injected di kedua render path (JSON-driven + legacy)
- Support both new-style (`groom_name`) dan legacy (`groomName`) data format

### User Referral Program (Q3: Referral Program)

**Schema — `prisma/schema.prisma`:**
- `User.referralCode` — nullable unique, auto-generated on first access
- Model `UserReferral` BARU: `referrerId`, `referredId`, `orderId`, `status` (pending/completed/rewarded), `rewardType`, `rewardValue` (default Rp 15.000), `claimedAt`
- Unique constraint pada `[referrerId, referredId]` (satu referral per pair)

**Database layer — `lib/db.ts`:**
- `users.findByReferralCode()` — cari user by referral code
- `users.setReferralCode()` — set referral code
- `userReferrals.create()` — buat referral record (reward Rp 15.000)
- `userReferrals.findByReferrerId()` — list referrals by referrer
- `userReferrals.countByReferrer()` — stats (total, completed, totalReward)
- `userReferrals.markCompleted()` — mark referral as completed

**API — `app/api/referral/route.ts`:**
- `GET /api/referral` — auth required, return referral code + link + stats + history
- Auto-generate referral code on first access (format: `EMAIL-XXX`)
- Existing `POST` untuk affiliate click tracking tetap dipertahankan

**Dashboard — `components/dashboard/ReferralPanel.tsx` (BARU):**
- Referral code display + copy button
- Referral link + copy/share buttons
- Share via WhatsApp with pre-filled message
- Stats cards: Total Referral, Berhasil, Total Reward
- "Cara Kerja" 3-step guide
- Riwayat referral list with status badges

**Dashboard — `components/dashboard/DashboardClient.tsx`:**
- Tambah tab `referral` (Referral) ke navigasi dashboard
- Render `ReferralPanel` di tab referral

---

## [Sprint 4] — 2026-06-29

### WA Blast Migration (Q2: GuestManager → Database API)

**Problem:** GuestManager (`components/dashboard/GuestManager.tsx`) menyimpan semua data kontak tamu di `localStorage`. Data hilang saat ganti browser atau clear cache. Tidak sinkron dengan Guest database yang sudah unified di Sprint 3.

**Rewrite — `components/dashboard/GuestManager.tsx`:**
- Hapus semua localStorage logic (`STORAGE_KEY`, `loadGuests`, `saveGuests`)
- Load guests via `GET /api/guests?invitation_id=X` dengan `useEffect` + `useCallback`
- Tambah tamu via `POST /api/guests` (bukan localStorage)
- Hapus tamu via `DELETE /api/guests?id=X` (bukan array filter)
- Mark blast sent via `POST /api/guests/blast-sent` (bukan localStorage flag)
- Stats (total, attending, declined, pending) dari API response
- Loading state dengan spinner, error handling via toast
- RSVP badges (Hadir/Berhalangan), source badge (RSVP), group tags
- Semua data sekarang persisten di database, sinkron lintas device

### Basic Analytics (Q2: Invitation Analytics)

**Schema — `prisma/schema.prisma`:**
- Model `InvitationView` BARU: `invitationId`, `viewedAt`, `referrer`, `userAgent`, `country`
- Index pada `invitationId` dan `viewedAt`
- Relasi `Invitation.views → InvitationView[]`

**Database layer — `lib/db.ts`:**
- `invitationViews.record()` — catat page view dengan referrer + user agent
- `invitationViews.countByInvitation()` — total views
- `invitationViews.countByDateRange()` — views dalam rentang tanggal
- `invitationViews.dailyCounts()` — views per hari (default 30 hari)
- `invitationViews.topReferrers()` — top referrer sources

**View tracking — `components/analytics/ViewTracker.tsx` (BARU):**
- Client component, fire-and-forget POST ke `/api/views` on mount
- Mengirim `invitation_id` + `document.referrer`
- Ditanam di `app/invitation/[slug]/page.tsx` (kedua path: JSON-driven + legacy)

**API — `app/api/views/route.ts` (BARU):**
- `POST /api/views` — record view (public, no auth needed)

**API — `app/api/analytics/route.ts` (BARU):**
- `GET /api/analytics?invitation_id=X&days=30` — auth required, owner only
- Returns: `totalViews`, `viewsThisWeek`, `dailyViews[]`, `topReferrers[]`, RSVP breakdown, wish count

**Dashboard — `components/dashboard/AnalyticsPanel.tsx` (BARU):**
- Stats cards: Total Views, RSVP, Akan Hadir, Ucapan
- Mini bar chart views harian (14 hari terakhir, animated)
- RSVP breakdown dengan progress bars (Hadir/Berhalangan/Belum RSVP)
- Top referrer sources list
- Date range selector (7/14/30 hari)
- Empty state saat belum ada data

**Dashboard — `components/dashboard/DashboardClient.tsx`:**
- Tambah tab `analytics` (Analitik) ke navigasi dashboard
- Render `AnalyticsPanel` di tab analytics

**Dashboard — `components/dashboard/DashboardOverview.tsx`:**
- Quick action "Analitik" menggantikan "Langganan" di shortcut grid

---

## [Sprint 3] — 2026-06-29

### Guest Unification (Priority #3: Unify Guest + RSVP + Contacts)

**Problem:** Tiga sumber data tamu terpisah — Guest (RSVP, database), Wish (database), GuestManager contacts (localStorage saja). Phone/group/note hanya client-side, hilang saat clear browser.

**Schema changes — `prisma/schema.prisma`:**
- `Guest.attending` berubah dari `Boolean` → `Boolean?` (null = belum RSVP, true = hadir, false = berhalangan)
- Tambah fields: `phone`, `group`, `note`, `source` ('manual' | 'rsvp'), `blastSentAt`
- Guest sekarang unified contact entity — satu record per tamu

**Type update — `lib/types.ts`:**
- `Guest` interface extended: `phone`, `group`, `note`, `source`, `attending: boolean | null`, `blast_sent_at`

**Database layer — `lib/db.ts`:**
- `mapGuest()` updated untuk field baru
- `guests.create()` menerima contact fields
- `guests.update()` — BARU, partial update name/phone/group/note/attending
- `guests.delete()` — BARU, hapus guest by ID
- `guests.markBlastSent()` — BARU, batch update `blastSentAt` timestamp
- `guests.countByInvitation()` — BARU, return `{ total, attending, declined, pending }`

**API routes — `app/api/guests/route.ts` (BARU):**
- `GET /api/guests?invitation_id=X` — List semua tamu + stats (auth required, owner only)
- `POST /api/guests` — Tambah tamu manual (name, phone, group, note)
- `PATCH /api/guests` — Update tamu existing
- `DELETE /api/guests?id=X` — Hapus tamu

**API routes — `app/api/guests/blast-sent/route.ts` (BARU):**
- `POST /api/guests/blast-sent` — Mark batch guest IDs sebagai sudah blast WA

**RSVP API — `app/api/rsvp/route.ts`:**
- Guest yang dibuat via RSVP form sekarang `source: 'rsvp'` + semua contact fields initialized

**Demo data — `lib/demo-data.ts`:**
- Updated `DEMO_GUESTS` untuk include field baru

### Order Restructure (Priority #4: Consolidate Dual Flow)

**Problem:** Dua flow paralel ke "invitation jadi paid" — Order (admin approval) dan PaymentProof (admin approval terpisah). Admin harus cek dua tab berbeda. Tidak ada link antara Order ↔ Invitation ↔ PaymentProof.

**Schema changes — `prisma/schema.prisma`:**
- `Order.invitationId` (BARU) — nullable FK, diisi saat admin approve order → create invitation
- `PaymentProof.orderId` (BARU) — nullable FK, link proof ke order terkait
- Index pada `PaymentProof.orderId`

**Type update — `lib/types.ts`:**
- `Order.invitation_id: string | null` — track invitation yang di-create dari order

**Database layer — `lib/db.ts`:**
- `mapOrder()` — include `invitation_id`
- `orders.update()` — support `invitation_id` field
- `orders.create()` — accept `invitation_id`

**API — `app/api/admin/orders/[id]/route.ts`:**
- Saat approve, simpan `invitation_id: inv.id` ke order record
- Traceability: Order → Invitation → Subscription sekarang terhubung penuh

**API — `app/api/orders/route.ts`:**
- Order creation set `invitation_id: null` (diisi saat approval)

---

## [Sprint 2] — 2026-06-29

### Free Trial System (Q1: Free Trial Expiry)

- **`lib/subscription.ts`** — Extend subscription domain dengan trial support:
  - Tambah `TRIAL_TIER` constant dan `SubscriptionTier` type (`PackageTier | 'trial'`)
  - Tambah `TRIAL_LIMITS` (7 hari, 5 foto, 50 tamu, watermark aktif)
  - Tambah `createTrial()` method — buat subscription trial 7 hari
  - Tambah `isTrial()` dan `isInGracePeriod()` helper — cek grace period 14 hari setelah trial expire
- **`app/api/invitations/route.ts`** — Invitation creation sekarang auto-create trial:
  - Set `expires_at` = 7 hari dari sekarang (bukan `null`)
  - Call `subscriptions.createTrial()` untuk buat record subscription
  - Kirim notifikasi `trial_started`
- **`app/invitation/[slug]/page.tsx`** — Tambah `TrialGracePage`:
  - Trial yang expired tapi masih dalam grace period 14 hari → tampilkan halaman khusus dengan CTA upgrade
  - Setelah grace period habis → tampilkan `ExpiredPage` standar

### Notification Domain (Priority #2: Build from Scratch)

- **`lib/notifications.ts`** — Foundation notification service:
  - 12 notification types: `welcome`, `trial_started`, `trial_expiring`, `trial_expired`, `order_created`, `order_approved`, `order_rejected`, `payment_received`, `subscription_active`, `subscription_expiring`, `subscription_expired`, `password_reset`
  - Template system dengan subject + body per type (Bahasa Indonesia)
  - Transport layer (console log sekarang, swap ke email provider nanti)
  - Public API: `sendNotification()` dan `notifyUser()` helper
- **`app/api/orders/route.ts`** — Kirim `order_created` notification saat order dibuat
- **`app/api/admin/orders/[id]/route.ts`** — Kirim `order_approved` / `order_rejected` notification saat admin review
- **`app/api/cron/sync-subscriptions/route.ts`** — Cron endpoint baru:
  - Sync expired subscription statuses (batch `updateMany`)
  - Notify users dengan subscription yang `expiring_soon`
  - Protected via `CRON_SECRET` bearer token

### Subscription API Enhancement

- **`app/api/user/subscription/route.ts`** — Handle trial tier:
  - Return `tierName: 'Free Trial'` untuk trial subscriptions
  - Include `TRIAL_LIMITS` dalam response untuk UI enforcement

---

## [Sprint 1] — 2026-06-29

### Quick Wins (Audit Fixes)

- **C4: Revenue Calculation** — `components/admin/AdminPanel.tsx`
  - Fix: `paid.length * price` (flat rate) → `orders.filter(approved).reduce(sum, total_amount)` (actual per-order amount)
  - Revenue sekarang akurat untuk semua tier pricing
- **C5: Template Loading** — `components/dashboard/TemplateModule.tsx`
  - Fix: Hardcoded `javanese-gold` import → dynamic loader map untuk 3 template v2
  - `rose-garden` dan `midnight-luxe` sekarang bisa load di dashboard editor
- **H1: Landing Sections** — `app/(main)/page.tsx`
  - Tambah `HowItWorks`, `Testimonials`, `BlogShowcase` ke SECTION_MAP
  - Section bisa tampil saat diaktifkan via admin landing settings
- **M1: Blog Navbar** — `components/ui/Navbar.tsx`
  - Tambah `{ href: '/blog', label: 'Blog' }` ke NAV_LINKS

### Subscription Domain (Priority #1: Build from Scratch)

- **`prisma/schema.prisma`** — Model `Subscription` baru:
  - Fields: `invitationId`, `userId`, `orderId`, `tier`, `status`, `startsAt`, `expiresAt`, `cancelledAt`, `renewedFrom`
  - Index pada `invitationId`, `userId`, `status`, `expiresAt`
- **`lib/subscription.ts`** — Domain service layer:
  - Lifecycle states: `active` → `expiring_soon` → `expired` → `cancelled`
  - CRUD: `create()`, `findByInvitation()`, `findByUser()`
  - Lifecycle: `renew()`, `cancel()`, `markExpired()`, `syncExpiredStatuses()`
  - Queries: `findExpiringSoon()`, `findExpired()`
  - Helpers: `resolveStatus()`, `daysRemaining()`, `isActive()`

### Subscription Integration

- **`app/api/admin/orders/[id]/route.ts`** — Order approval:
  - Create Subscription record saat approve
  - Durasi berdasarkan `PACKAGES[tier].activeMonths` (bukan global `packageDuration`)
- **`app/api/admin/proofs/[id]/route.ts`** — Payment proof approval:
  - Create Subscription record saat approve
  - Durasi per-tier (bukan hardcoded fallback)
- **`app/invitation/[slug]/page.tsx`** — Public invitation view:
  - Cek subscription status (fallback ke `expires_at` untuk backward compat)
- **`app/api/user/subscription/route.ts`** — API endpoint baru:
  - GET `/api/user/subscription` — user bisa cek status langganan
- **`components/dashboard/SubscriptionInfo.tsx`** — Dashboard:
  - Fetch real subscription data dari API
  - Fallback ke invitation data untuk record lama

---

## [Foundation] — 2026-06-29

### Company Blueprint

- **`docs/COMPANY_BLUEPRINT.md`** — 15-section Company Blueprint & Product Masterplan
  - Company Identity, Product/Company Philosophy, Positioning
  - Product Architecture (14 domains, 4 clusters)
  - Feature Philosophy, Dashboard Architecture
  - Business Model, Marketplace Strategy, Multi-Event Strategy
  - Growth Strategy, Organization, Decision Framework
  - North Star & Metrics (MAEI), What We Build / Don't Build
