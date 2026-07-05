# iaundang — Design System (Proposal PART 2)

**Status:** DISETUJUI — **Arah A (Elegant Editorial)**, 5 Juli 2026. Gate font Stage A lolos:
Fraunces (latin, weight 500/600) menambah 0 kB JS; preload woff2 35,7 kB + 2 file lanjutan
(32,9 + 11,3 kB) dimuat saat weight terpakai. Arah masih bisa diganti ke B/C selama theming
belum diterapkan penuh ke section (lihat catatan brief v2).
**Tanggal:** 5 Juli 2026
**Dasar:** `docs/UI_AUDIT_REPORT_2026-07-05.md` (baseline & inventaris gaya saat ini)
**Cakupan:** landing page + halaman turunan publik (`/templates`, `/order`, auth, `/blog`, legal).
Dashboard/admin/tema undangan **di luar scope** — `Button.tsx`/`Input.tsx` lama tetap melayani
admin/dashboard tanpa diubah.

---

## 0. Keputusan Eksplisit (menjawab pertanyaan terbuka dari audit)

| # | Pertanyaan | Keputusan |
|---|---|---|
| 1 | **Skala tipografi `globals.css` (13 pemakaian saat ini): diadopsi atau diganti?** | **DIADOPSI PENUH & DIJADIKAN SATU-SATUNYA SUMBER.** Skala `text-display-* / text-h* / text-body-* / text-eyebrow / text-label-*` di `globals.css` dipertahankan (sudah responsif via clamp + override mobile), direvisi terbatas (lihat §2), dan **arbitrary font-size (`text-[15px]` dst.) dilarang di permukaan publik** — setiap teks harus memakai salah satu step skala. Migrasi dilakukan bertahap per stage. Alasan: skala ini sudah dibangun baik, cocok dengan pendekatan Tailwind-utility yang mapan, dan utang migrasinya kecil; membuat skala baru hanya menambah dialek ke-4. |
| 2 | Palet | **Konsolidasi ke `forest` + `gold` + netral graphite.** `stone`, `gray`, `slate`, `emerald`, `rose`, `indigo`, `warm`*, `champagne` dihapus dari permukaan publik. (*`warm-50/100` dinaikkan jadi token `ivory` bila Arah A dipilih — lihat §1.) |
| 3 | Pendekatan styling | Tetap **Tailwind utility di JSX**. Tidak pindah ke CSS module / class kustom baru. `style={{}}` inline hanya untuk nilai dinamis dari data (warna template) — pola yang sudah benar. |
| 4 | Lebar halaman | Standar tunggal **`max-w-6xl` (1152px)** — dominan di kode. Token `max-w-page`/`--page-max-width` (1200px) dihapus. |
| 5 | Kontrak data | Bentuk `LandingPageSettings` & `LandingSectionConfig` di `lib/db.ts` **tidak berubah**; `SECTION_MAP` + urutan/visibility dari DB tetap jalan. Field dorman (mis. `hero.headline`) TIDAK dihidupkan diam-diam — bila mau dipakai, diajukan eksplisit per stage. |

---

## 1. Warna

### 1a. Token inti (semua arah visual memakai basis yang sama)

Skala `forest` dan `gold` yang ada di `tailwind.config.ts` **dipertahankan apa adanya** (tidak ada
nilai hex baru untuk brand). Netral graphite dipertahankan dengan **aturan kontras** baru:

| Peran | Token | Hex | Kontras di atas putih | Aturan |
|---|---|---|---|---|
| Teks utama | `graphite` | `#0a0a0a` | 19,8:1 | Heading & body utama |
| Teks sekunder | `concrete` | `#737373` | 4,7:1 | Body sekunder — **batas bawah teks kecil** |
| Teks tersier | `ash` | `#a1a1a1` | 2,7:1 | ❌ DILARANG untuk teks < 18px informatif. Hanya untuk teks ≥ 18px, elemen dekoratif, atau di atas latar gelap |
| Hairline | `hairline` | `#e5e5e5` | — | Border 1px |
| Latar halus | `mist` | `#f2f2f2` | — | Surface sekunder |
| Latar dasar | `chalk` / `ivory`* | `#ffffff` / `#faf9f6` | — | Canvas (*ivory hanya Arah A) |
| Brand utama | `forest` 50–900 | basis `#1a3320` | `forest` 10,4:1 | CTA, aksen, section gelap (`forest-deep`) |
| Aksen | `gold` 50–900 | basis `#d4af37` | 1,9:1 ❌ | **Tidak pernah jadi teks di atas putih.** Pakai `gold-dark #b8973a` (2,6:1 — tetap hanya dekoratif/besar) atau di atas latar gelap |
| Teks di atas gelap | `chalk` / `chalk/70` | — | ≥ 7:1 di forest-deep | `chalk/50` ke bawah hanya dekoratif |

Semantik (dipetakan tetap, bukan ad-hoc): sukses `green-600`, peringatan `amber-600`+`amber-50`,
error `red-600`+`red-50`, info `blue-700`+`blue-50`. Hanya untuk state/feedback, bukan dekorasi.

### 1b. Perbaikan WCAG AA yang menjadi bagian redesign

- Semua `text-ash`/`text-stone-400` pada teks informatif kecil → naik ke `concrete` (atau ukuran naik).
- `text-chalk/30`–`/50` di ClosingCTA/Pricing dark untuk teks informatif → minimal `chalk/70`.
- Fokus keyboard: token `focus-visible:ring-2 ring-forest/40 ring-offset-2` di semua elemen interaktif.

---

## 2. Tipografi

**Body/UI: Geist Sans** (sudah ada, `var(--font-geist-sans)`). Skala `globals.css` dipertahankan
dengan revisi terbatas:

1. `text-display-2xl/xl` clamp maksimum dinaikkan 48px → **56px** (sudah dipakai de-facto di Hero
   via inline clamp — inline-nya diganti utility).
2. Step baru `text-display-hero` TIDAK dibuat — Hero memakai `text-display-2xl`.
3. `.text-eyebrow` menjadi satu-satunya gaya label section (menggantikan
   `text-[12px] font-semibold tracking-[0.15em] uppercase` yang di-copy-paste).
4. Kelas `font-display` (lihat arah visual): Arah A memetakannya ke serif via
   `next/font` + CSS variable `--font-display`; Arah B/C memetakannya ke Geist semibold
   tracking ketat. Komponen selalu menulis `font-display` — ganti arah = ganti satu variabel.

**Hirarki baku per section landing:**

```
.text-eyebrow  (concrete / gold-dark di dark)   ← label kecil uppercase
.text-display-lg  (graphite / forest-deep)      ← judul section
.text-body-lg  (concrete, max-w-lg)             ← subjudul
```

---

## 3. Spacing, Radius, Shadow, Breakpoint

| Kategori | Token | Nilai | Catatan |
|---|---|---|---|
| Section padding | `section-y` | `py-20 sm:py-28 lg:py-32` | Satu ritme untuk semua section (sekarang campuran 20/24/28/32/36/40) |
| Section header gap | — | `mb-12 sm:mb-16` | |
| Container | — | `max-w-6xl mx-auto px-5 sm:px-8` | Dibungkus primitive `SectionContainer` |
| Radius | `rounded-button` | 10px | Tombol & input (token sudah ada) |
| | `rounded-card` | 14px → **dipakai nyata** (sekarang komponen pakai `rounded-2xl` 16px — konsolidasi ke `rounded-card` atau ubah token jadi 16px, keputusan kecil saat Stage A) |
| | `rounded-pill` | 9999px | Badge/chip |
| Shadow | `shadow-card` | `0 1px 3px rgba(10,10,10,.04), 0 12px 32px -16px rgba(10,10,10,.10)` | Kartu diam (nilai diambil dari OrderForm yang sudah bagus) |
| | `shadow-card-hover` | `0 18px 40px -16px rgba(10,10,10,.18), 0 8px 18px -10px rgba(10,10,10,.12)` | Kartu hover (dari TemplatePreview) |
| | `shadow-float` | `0 25px 60px -12px rgba(0,0,0,.15)` | Elemen melayang (phone mockup) |
| Breakpoint | Tailwind default | sm 640 / md 768 / lg 1024 / xl 1280 | Matriks uji wajib: **375, 390, 768, 1024, 1440** |

Semua nilai di atas masuk `tailwind.config.ts` sebagai token; token mati (`warm` kecuali dipakai
ivory, `subtle`, `spacing-83`, `badge 26px`, `fontSize display/subheading` duplikat) dihapus.

---

## 4. Primitive Komponen (baru, khusus permukaan publik)

Lokasi usulan: `components/marketing/` (agar tidak bentrok dengan `components/ui/*` yang melayani
admin/dashboard). API ringkas:

```tsx
// components/marketing/Button.tsx
<Button variant="primary | secondary | ghost | gold | inverse" size="sm | md | lg"
        href="/templates" />   // href → render <Link>, tanpa href → <button>
// primary  : bg-forest text-chalk hover:bg-forest-deep
// secondary: border-hairline text-graphite hover:border-ash/50 bg-chalk
// ghost    : text-concrete hover:text-forest-deep
// gold     : bg-gold text-forest-deep hover:bg-gold-light   (hanya di section gelap)
// inverse  : bg-chalk text-forest-deep                       (di section gelap)
// Semua: rounded-button, focus-visible ring, min-h 44px (target sentuh), ikon ArrowRight opsional

// components/marketing/SectionContainer.tsx
<SectionContainer id="harga" tone="light | mist | forest | dark"
                  eyebrow="Harga" title="Sekali bayar. Tanpa langganan." lead="...">
  {children}
</SectionContainer>
// Menstandarkan: section-y, container, pola eyebrow/title/lead, warna per tone,
// dan animasi masuk (whileInView sekali) — menghapus copy-paste header di 10 section.

// components/marketing/Card.tsx      → rounded-card border-hairline bg-chalk shadow-card (+hover)
// components/marketing/Badge.tsx     → pill kecil; variant neutral | forest | gold | outline
// components/marketing/Field.tsx     → label + input + error/hint; fokus ring forest
//                                       (menggantikan INPUT_CLS/LABEL_CLS di OrderForm & markup auth)
```

**Motion token** — `lib/motion.ts`:

```ts
export const EASE = [0.22, 1, 0.36, 1] as const   // satu-satunya easing (hapus 9 salinan)
export const DUR = { fast: 0.2, base: 0.5, slow: 0.8 }
export const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-40px' }, transition: { duration: DUR.base, delay, ease: EASE } })
```

Prinsip motion (semua arah):
- `whileInView` + `once: true`, jarak translasi ≤ 24px, stagger ≤ 0.1s antar item.
- **Tidak ada animasi infinite baru**; yang ada dievaluasi per arah (lihat §5). `animate-ping` maks 1 di viewport.
- Hormati `prefers-reduced-motion` (helper `useReducedMotion` Framer di SectionContainer).
- Tidak ada animasi yang menggeser layout (CLS 0); parallax hanya `transform`, tidak ada listener scroll JS custom.

---

## 5. Tiga Arah Visual

Basis token (§1–4) sama; yang berbeda adalah *ekspresi*: font display, tekstur, peran gold,
dan intensitas motion. Preview visual interaktif: lihat artifact "Arah Visual iaundang"
(disertakan bersama proposal ini).

### Arah A — Elegant Editorial  ⭐ REKOMENDASI

> Majalah pernikahan: serif display, ivory hangat, foto template sebagai bintang.

- **Font display:** serif **Fraunces** (variable, subset latin, via `next/font` → `--font-display`;
  estimasi +~35 kB woff2, hanya untuk heading). Body tetap Geist.
- **Canvas:** `ivory #faf9f6` (dari `warm-50` yang sudah ada) sebagai latar dasar; `chalk` untuk kartu —
  halaman terasa hangat, kartu "terangkat" tanpa shadow berat.
- **Gold** dipakai tipis: garis pemisah, ikon kecil, satu kata beraksen di heading. Bukan tombol.
- **Foto/mockup template** diperbesar perannya (hero & TemplatePreview); ilustrasi mini-mockup
  monokrom yang ada di-reskin dengan bingkai ivory.
- **Motion:** lembut & sedikit (fadeUp saja); floating cards hero DIHAPUS, diganti satu phone mockup
  besar dengan foto asli template. Infinite animation: tidak ada.
- Kecocokan: paling "wedding", paling beda dari kompetitor SaaS-look; risiko: serif butuh disiplin
  ukuran di mobile (sudah tertangani clamp).

### Arah B — Modern Glass (refined)

> Kelanjutan gaya sekarang, dirapikan: forest+gold luxury, glass hanya di tempat bermakna.

- **Font display:** Geist (tracking -0.045em seperti Hero sekarang). Tanpa font baru (0 kB).
- **Canvas:** `chalk` putih; section gelap `forest-deep` (ClosingCTA, kartu Pricing "dark") jadi
  ritme terang–gelap yang disengaja: terang → gelap → terang.
- **Glass:** hanya Navbar (sudah ada), mobile menu, dan badge di atas foto. Kartu TIDAK glass
  (border hairline + shadow-card) — menghindari kesan "tech demo".
- **Gold** lebih berani: tombol gold di section gelap, ikon aksen, dot-grid + radial glow dipertahankan.
- **Motion:** seperti sekarang minus ekses — floating cards hero dipertahankan tapi statis di mobile
  (`lg:` only, sudah begitu) dan loop float diganti sekali-masuk; `animate-ping` disisakan satu di Hero.
- Kecocokan: churn paling kecil (Hero/Pricing/FAQ/ClosingCTA hampir tidak berubah, kerja terkonsentrasi
  di section monokrom + halaman turunan); risiko: tetap terasa "SaaS premium" dibanding "wedding".

### Arah C — Warm Minimalist

> Sangat bersih: satu aksen forest, gold nyaris hilang, animasi minim, fokus kecepatan & kepercayaan.

- **Font display:** Geist. Tanpa font baru.
- **Canvas:** `chalk`; abu graphite untuk hampir semua teks; **forest hanya untuk CTA & link**;
  gold hanya di logo. Tidak ada section gelap kecuali footer CTA tipis.
- **Tekstur:** tidak ada (dot-grid & glow dihapus). Pemisah section pakai `hairline` + whitespace besar.
- **Mockup UI asli** (mini-RSVP, mini-musik dsb. yang sudah ada di FeatureShowcase) jadi bahasa visual
  utama — arah ini paling memanfaatkan aset monokrom yang sudah dibangun.
- **Motion:** fade sederhana 0.3s; tidak ada parallax, tidak ada infinite, tidak ada floating.
- Kecocokan: paling cepat & paling aman di HP low-end; risiko: kurang "mewah" untuk kategori
  pernikahan, diferensiasi visual rendah.

### Matriks ringkas

| | A Editorial | B Glass refined | C Minimalist |
|---|---|---|---|
| Kesan | Wedding luxury editorial | Premium modern hangat | Cepat, jujur, bersih |
| Font baru | Fraunces (+~35 kB) | — | — |
| Perubahan vs kode sekarang | Sedang–besar | **Kecil–sedang** | Sedang |
| Beban runtime | Rendah–sedang | Sedang | **Terendah** |
| Diferensiasi pasar | **Tertinggi** | Sedang | Rendah |

**Rekomendasi: Arah A (Elegant Editorial)** — target pengguna adalah pasangan yang memilih undangan
pernikahan, bukan pembeli software; serif display + ivory langsung memberi sinyal kategori yang tepat,
dan foto template (produk yang sebenarnya dijual) jadi pusat perhatian. Fallback pragmatis bila ingin
risiko minimum: Arah B.

---

## 6. Rencana Eksekusi per Stage (mengikat ke PART 3)

| Stage | Isi konkret |
|---|---|
| A | Token di `tailwind.config.ts` + revisi `globals.css` (skala §2, ivory bila Arah A) + `lib/motion.ts` + `components/marketing/*` (Button, Card, Badge, SectionContainer, Field) + Navbar/Footer di-migrasi ke primitive + hapus token mati |
| B | Hero, TrustBar, TemplatePreview, FeatureShowcase → arah terpilih; migrasi arbitrary font-size → skala |
| C | HowItWorks, Testimonials("Kenapa iaundang" — restyle grid value-props, testimoni asli menyusul bila ada), Pricing, FAQ (+`aria-expanded`), ClosingCTA, BlogShowcase (auto-hide dipertahankan) |
| D | `/templates`: kartu + header ke sistem baru; chip kategori → keputusan terpisah (filter nyata = kerja fungsional kecil, diajukan saat stage) |
| E | `/order`: murni reskin via `Field`/`Button`/`Card`; nol perubahan pada state/validasi/handler |
| F | Auth: Login/Register/Forgot/Reset ke sistem baru (branch `fix/auth-reset-password` sudah membereskan fungsionalitasnya lebih dulu) |
| G | Blog (empty state bermakna: ilustrasi + copy + CTA kembali) & legal (sudah dekat sistem — penyesuaian kecil) |

Definition of done per stage mengikuti PART 5 brief (build hijau, breakpoint, AA, bundle dibanding
baseline audit: `/` 164 kB First Load).

---

*Dokumen ini adalah output PART 2. Belum ada perubahan pada komponen produksi. Eksekusi Stage A
dimulai setelah arah visual di-approve.*
