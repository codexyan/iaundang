# iaundang — Laporan Audit Menyeluruh

**Tanggal:** 3 Juli 2026
**Sifat:** Read-only (tidak ada perubahan kode produksi, `.env`, atau migrasi DB)
**Cakupan:** Verifikasi dokumentasi vs kode, struktur folder, keamanan, testing/CI
**Lampiran:** Peta struktur folder lengkap ada di [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md)

> Catatan penanganan rahasia: laporan ini **tidak** memuat nilai secret apa pun. Temuan yang
> menyangkut secret hanya menyebut lokasi file dan jenisnya.

---

## Ringkasan Eksekutif

iaundang adalah platform undangan digital yang matang secara fitur (Next.js 14 + Prisma +
PostgreSQL/Supabase, 27 model, 80+ API route, panel admin & studio template). Namun untuk
didelegasikan ke tim, ada **satu risiko keamanan kritis yang terkonfirmasi**: kode menandatangani
sesi login dengan env var `SESSION_SECRET`, sementara dokumentasi dan file environment nyata
justru memakai `JWT_SECRET` — sehingga aplikasi diam-diam memakai **secret fallback yang
hardcoded dan sudah masuk git**. Ini terkonfirmasi aktif di environment lokal dan hampir pasti
juga di produksi. Selain itu, **jumlah pesanan (amount) tidak divalidasi di server** sehingga
paket mahal bisa dibayar dengan nominal kecil pada alur otomatis Mayar, **tidak ada rate limiting
sama sekali**, dan **tidak ada test maupun CI**. Dokumentasi (`ARCHITECTURE.md`) sudah tertinggal
material (menyebut 22 model padahal 27, nama cookie & secret salah, dua subsistem besar —
Studio & Writer — tidak terdokumentasi). Kabar baiknya: rute admin **konsisten** mengecek peran
`isAdmin`, validasi upload gambar (magic-byte) kuat di sebagian besar endpoint, dan **tidak ada
secret asli yang ter-commit** (`.env`/`.env.local` sudah di-gitignore dengan benar).

Prioritas tindakan: (1) set `SESSION_SECRET` kuat di Vercel + guard runtime; (2) validasi amount
order di server; (3) rate limiting; (4) upgrade Next.js. Detail di bawah, diurutkan per tingkat.

---

## 🔴 TEMUAN KRITIS (tangani segera — risiko keamanan aktif)

### K-1. Sesi ditandatangani dengan secret fallback hardcoded akibat salah nama env var
- **Lokasi:** [`lib/session.ts:11-14`](../lib/session.ts) — `process.env.SESSION_SECRET || 'iaundang-dev-secret-...'`
- **Masalah:** Kode sign & verify JWT sesi membaca **`SESSION_SECRET`**. Namun:
  - `.env.example:15`, `VERCEL_SETUP.md`, dan `docs/ARCHITECTURE.md:440` menginstruksikan set **`JWT_SECRET`**.
  - Pengecekan langsung terhadap `.env.local` (nilai tidak ditampilkan): variabel yang ada
    adalah **`JWT_SECRET`**, dan **`SESSION_SECRET` TIDAK ADA**.
  - Konsekuensi: `process.env.SESSION_SECRET` bernilai `undefined`, sehingga kode **jatuh ke
    secret fallback hardcoded yang tertulis di source dan sudah ter-commit ke git**. Tidak ada
    guard yang melempar error saat env kosong, jadi login tetap "berfungsi" tanpa gejala.
  - **Terkonfirmasi aktif di lokal.** Karena konvensi `JWT_SECRET` ini berasal dari dokumen
    deployment yang sama yang dipakai untuk setup Vercel, **produksi hampir pasti terdampak**.
- **Dampak:** Siapa pun yang bisa membaca repo mengetahui secret penandatangan sesi, lalu dapat
  **memalsukan cookie sesi** untuk `userId`/`email`/`role` apa pun — termasuk `role: 'admin'` —
  dan mengambil alih akun/admin sepenuhnya. Ini setara bocornya master key autentikasi.
- **Rekomendasi:**
  1. **Segera** set `SESSION_SECRET` bernilai acak kuat (≥32 char) di **Vercel** (semua
     environment) dan di `.env.local`. Verifikasi lewat dashboard Vercel bahwa key persis
     bernama `SESSION_SECRET`.
  2. Tambahkan guard: `if (process.env.NODE_ENV === 'production' && !process.env.SESSION_SECRET) throw ...`
     agar deploy gagal daripada diam-diam tidak aman.
  3. Hapus fallback hardcoded (atau batasi hanya untuk `NODE_ENV !== 'production'`).
  4. Samakan penamaan di **semua** dokumen & file env ke satu nama. Setelah rotasi, semua sesi
     lama otomatis invalid (user perlu login ulang — ini justru diinginkan).

---

## 🟠 TEMUAN TINGGI

### T-1. Nominal pesanan (amount) dikendalikan client & tidak divalidasi server → underpayment
- **Lokasi:** [`app/api/orders/route.ts:22-117`](../app/api/orders/route.ts), webhook [`app/api/payment/mayar/webhook/route.ts`](../app/api/payment/mayar/webhook/route.ts)
- **Masalah:** `amount` diambil mentah dari body request dan dipakai sebagai nominal tagihan
  (`totalAmount = Number(amount) + uniqueCode`). Webhook Mayar meng-approve order dan memberi
  langganan sesuai `order.packageTier` **tanpa** mencocokkan nominal yang dibayar dengan harga
  paket sebenarnya (`PACKAGES[tier].price`). Akibatnya user bisa memesan paket **Eksklusif**
  dengan `amount: 1000`. (Alur transfer manual masih tertangkap karena admin verifikasi, tetapi
  alur otomatis Mayar tidak.)
- **Dampak:** Kehilangan pendapatan / aktivasi paket premium dengan bayar sangat kecil.
- **Rekomendasi:** Hitung `amount` di server dari `PACKAGES[package_tier].price`, abaikan
  `amount` dari client. Validasi juga `package_tier` termasuk enum yang sah.

### T-2. Tidak ada rate limiting di endpoint publik rawan abuse
- **Lokasi:** `app/api/auth/login`, `.../register`, `.../forgot-password`, `app/api/rsvp`,
  `app/api/wishes`, `app/api/orders`, `app/api/gift-proof(+/upload)`, `app/api/experiments/assign`
- **Masalah:** Tidak ditemukan mekanisme throttling apa pun di seluruh codebase (tidak ada
  library rate-limit, tidak ada penghitung IP). Login terbuka untuk brute-force; register/RSVP/
  wishes/order terbuka untuk flood/spam.
- **Dampak:** Brute-force kredensial, spam data, penyalahgunaan biaya (email Resend, storage).
- **Rekomendasi:** Terapkan rate limit berbasis IP (mis. di `middleware.ts` atau per-route,
  dengan Upstash Ratelimit / in-memory untuk awal) minimal pada auth, order, dan endpoint tulis publik.

### T-3. Next.js 14.2.35 rentan — `npm audit`: 1 high + 4 moderate
- **Lokasi:** `package.json` (`next: 14.2.35`)
- **Masalah (ringkas dari `npm audit`):**
  - **High** — SSRF via WebSocket upgrades (GHSA-c4j6-fc7j-m34r, CVSS 8.6); DoS via Server
    Components (GHSA-q4gf-8mx6-v5v3 / GHSA-8h8q-6873-q5fj); Middleware/Proxy bypass i18n
    (GHSA-36qx-fr4f-26g5).
  - **Moderate** — XSS via CSP nonce, cache-poisoning RSC, DoS Image Optimization, XSS
    `beforeInteractive`, plus PostCSS XSS (bundled).
  - `fixAvailable` = upgrade `next` ke rilis yang menutup rentang `<15.5.16` (semver **major**).
- **Dampak:** Beberapa high bersifat DoS/SSRF yang bisa dieksploitasi jarak jauh.
- **Rekomendasi:** Rencanakan upgrade Next.js (14 → 15.x/16.x) dengan uji regresi App Router,
  middleware, dan image optimization. Sampai upgrade, pastikan tidak mengekspos fitur yang rentan.

### T-4. Upload file tanpa autentikasi via `api/gift-proof/upload`
- **Lokasi:** [`app/api/gift-proof/upload/route.ts`](../app/api/gift-proof/upload/route.ts)
- **Masalah:** Tidak ada pengecekan sesi. Dengan `invitationId=preview`, bahkan pengecekan
  keberadaan undangan dilewati (baris 35). Siapa pun (tanpa login, tanpa throttle) bisa
  meng-upload file s/d 10MB ke Supabase Storage. Validasi magic-byte **dilewati untuk HEIC**
  (`if (declaredType === 'image/heic') return true`), memperlebar jenis konten yang bisa masuk.
- **Dampak:** Penyalahgunaan storage/biaya, potensi hosting konten sembarang di domain proyek.
- **Rekomendasi:** Wajibkan keterikatan ke undangan yang published (hapus bypass `preview` di
  produksi atau batasi khusus lingkungan preview), tambahkan rate limit & kuota, dan validasi
  konten HEIC alih-alih melewatinya.

---

## 🟡 TEMUAN SEDANG

### S-1. `api/gift-proof` (GET & POST) publik — kebocoran data + spam
- **Lokasi:** [`app/api/gift-proof/route.ts`](../app/api/gift-proof/route.ts)
- **Masalah:** `GET ?invitationId=X` mengembalikan seluruh gift proof (nama + URL bukti) untuk
  **invitationId mana pun** tanpa auth/kepemilikan. `POST` menerima `proofUrl` sembarang (string
  bebas) untuk undangan published mana pun, tanpa rate limit.
- **Dampak:** Information disclosure + spam buku hadiah.
- **Rekomendasi:** Batasi GET ke pemilik undangan (atau minimal jangan bocorkan lintas
  undangan), validasi `proofUrl` (harus URL storage sendiri), tambah rate limit.

### S-2. RLS BUKAN garis pertahanan — `supabase/schema.sql` menyesatkan
- **Lokasi:** [`supabase/schema.sql`](../supabase/schema.sql), [`lib/supabase.ts`](../lib/supabase.ts), [`prisma/schema.prisma`](../prisma/schema.prisma)
- **Masalah:** `supabase/schema.sql` mengaktifkan RLS dengan policy berbasis `auth.uid()`
  (Supabase Auth) untuk 5 tabel. Namun aplikasi **tidak** memakai Supabase Auth (pakai custom
  JWT), mengakses Postgres via Prisma memakai role pooler `postgres` (yang **bypass RLS**), dan
  Storage via **service-role key** (juga bypass RLS). File itu peninggalan arsitektur lama
  (PK `uuid`, order berbasis Midtrans) dan **tidak berlaku**. 22 dari 27 tabel tidak punya policy
  sama sekali.
- **Dampak:** Developer baru bisa keliru mengira DB terlindungi RLS. Faktanya keamanan
  bergantung **100%** pada pengecekan auth di tiap route.
- **Rekomendasi:** Hapus/arsipkan `supabase/schema.sql` secara eksplisit; dokumentasikan bahwa
  batas keamanan adalah lapisan aplikasi; jadikan review auth per-route sebagai standar wajib.

### S-3. `SUPABASE_SERVICE_ROLE_KEY` = master key de-facto
- **Lokasi:** [`lib/supabase.ts:4`](../lib/supabase.ts), [`scripts/upload-iqro.ts:19`](../scripts/upload-iqro.ts)
- **Masalah:** Karena RLS di-bypass (S-2), service-role key setara master password DB+Storage.
  Saat ini dipakai server-only (bukan `NEXT_PUBLIC_*` — **benar**), tetapi konsentrasi risikonya
  tinggi.
- **Rekomendasi:** Perlakukan sebagai kredensial paling sensitif: hanya di server, rotasi bila
  ada indikasi bocor, jangan pernah di-log, batasi siapa yang tahu.

### S-4. Autentikasi cron lemah bila `CRON_SECRET` kosong/tak diset
- **Lokasi:** [`app/api/cron/publish-scheduled/route.ts:12`](../app/api/cron/publish-scheduled/route.ts), [`app/api/cron/sync-subscriptions/route.ts:13`](../app/api/cron/sync-subscriptions/route.ts)
- **Masalah:** Perbandingan `authHeader !== \`Bearer ${process.env.CRON_SECRET}\``. Jika env
  tak diset → header `Bearer undefined` lolos; jika diisi string kosong (default `.env.example`)
  → `Bearer ` lolos.
- **Dampak:** Terbatas (memicu publikasi artikel terjadwal / expire langganan), tetap sebaiknya ditutup.
- **Rekomendasi:** Lempar error bila `CRON_SECRET` tidak diset; pastikan terisi kuat di Vercel.

### S-5. Parsing tipe event webhook Mayar kemungkinan salah (aktivasi otomatis tak jalan)
- **Lokasi:** [`app/api/payment/mayar/webhook/route.ts:24-27`](../app/api/payment/mayar/webhook/route.ts)
- **Masalah:** `const eventType = body?.event?.received` lalu `if (eventType !== 'payment.received')`.
  Jika Mayar mengirim `event` sebagai **string** (`{ "event": "payment.received", ... }`), maka
  `body.event.received` = `undefined`, sehingga setiap event nyata **di-skip** dan aktivasi
  otomatis tidak pernah terjadi (jatuh ke verifikasi manual).
- **Dampak:** Alur pembayaran "otomatis" mungkin tidak berfungsi tanpa disadari (correctness).
- **Rekomendasi:** Verifikasi format payload webhook Mayar yang sebenarnya dan sesuaikan
  pembacaan `event`. Tambah logging payload mentah saat debugging.

---

## 🟢 TEMUAN RENDAH / NICE-TO-HAVE

### R-1. Tidak ada test sama sekali
Tidak ditemukan `*.test.ts` / `*.spec.ts` / `__tests__` milik proyek (yang ada hanya di
`node_modules`). Tidak ada test runner. **Rekomendasi:** mulai dari test untuk area berisiko
tinggi (auth/session, perhitungan harga order, webhook) sebelum menambah developer.

### R-2. Tidak ada CI/CD
Tidak ada `.github/workflows` atau konfigurasi CI lain. Tidak ada gate lint/build/test otomatis.
**Rekomendasi:** tambahkan workflow minimal (install → `prisma generate` → `lint` → `build`)
pada setiap PR sebelum delegasi tim.

### R-3. Drift file environment
- `.env.local.example` menyebut **Midtrans** (`MIDTRANS_*`) yang **tidak dipakai** kode; bertentangan
  dengan `.env.example` yang memakai **Mayar**. `.env.local.example` juga tidak lengkap (tanpa
  `DATABASE_URL`, secret sesi, `RESEND_API_KEY`, `CRON_SECRET`, `MAYAR_*`).
- Terdaftar tapi **tidak dipakai** kode: `JWT_SECRET`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_ADMIN_EMAIL`.
- Dipakai kode tapi **tidak terdaftar** di `.env.example`: `SESSION_SECRET` (lihat K-1);
  `DIRECT_URL` disebut di komentar `schema.prisma` tapi tidak di-wire di datasource maupun didokumentasikan.
- **Rekomendasi:** satukan menjadi satu `.env.example` akurat; hapus `.env.local.example` yang usang.

### R-4. Dokumentasi `ARCHITECTURE.md` tertinggal
Nama cookie (`iaundang_session` → nyatanya `__ku_session`), nama secret (`JWT_SECRET` →
`SESSION_SECRET`), jumlah model (22 → 27; tabelnya sendiri melist 25), jumlah tab admin (15 → 17),
serta **subsistem Studio (`components/studio/`, 25 file) dan Writer (`api/writer/*`, role
`content_writer`, workflow editorial) tidak terdokumentasi**; nama bucket storage salah. Tabel
perbedaan lengkap ada di [`PROJECT_STRUCTURE.md` §10](./PROJECT_STRUCTURE.md). **Rekomendasi:**
perbarui `ARCHITECTURE.md` atau jadikan `PROJECT_STRUCTURE.md` acuan utama.

### R-5. Kebersihan repo untuk onboarding
`README.md` praktis kosong; ~13 catatan dev sekali-pakai berserakan di root (BUGS.md,
FIX_*.md, STUDIO_*.md, dll.). Ada duplikasi/kelebihan artefak: `seed-admin.ts` + `seed-admin.mjs`;
dua sumber harga (`lib/packages.ts` + `lib/pricing-config.ts`); empat representasi skema
(`schema.prisma`, `migrations/`, `prisma/create-tables.sql`, `supabase/schema.sql`);
`app/demo/renderer/` sebagai harness dev yang publik. **Rekomendasi:** isi README quickstart,
pindahkan catatan ke `docs/notes/`, pilih satu sumber untuk seed & harga, tutup/gating demo di prod.

---

## Catatan Positif (agar tim tidak salah kaprah)

- **Rute admin konsisten mengecek peran:** ke-38 file `app/api/admin/*` memanggil `isAdmin(session)`
  di awal handler (contoh terverifikasi: `admin/users`, `admin/upload`) dan mengembalikan 401 —
  bukan sekadar cek "sesi ada". Rute writer memakai `isWriter`.
- **Validasi upload gambar kuat** di endpoint utama (`galleries/upload`, `user/upload`,
  `admin/upload`): allowlist MIME + ekstensi + **magic-byte** + batas ukuran + cek kepemilikan.
  (Pengecualian HEIC/font yang di-skip → lihat T-4.)
- **Tidak ada secret asli ter-commit:** `.env` & `.env.local` sudah di-gitignore; hanya file
  `*.example` (berisi placeholder) yang ter-track. Grep pola kebocoran (`eyJ...`, `sk_`,
  `service_role`) hanya menemukan placeholder di file example. `/data/` & `/public/uploads/`
  juga di-gitignore.
- **Kepemilikan data dicek** pada mutasi milik-user (`payment/proof`, `galleries/upload`,
  `invitations`, dll.) via `inv.user_id === session.userId`.

---

## Lampiran
- Peta struktur folder lengkap & konvensi: [`PROJECT_STRUCTURE.md`](./PROJECT_STRUCTURE.md)
- Metode: audit read-only berbasis pembacaan kode & `git ls-files`; `npm audit` untuk dependensi.
  Tidak ada perubahan kode/DB/env, tidak ada akses data produksi.
