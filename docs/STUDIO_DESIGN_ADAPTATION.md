# iaundang — Adaptasi Design System Arah A ke Modul Studio (PART 2)

**Status:** PROPOSAL — menunggu approval sebelum eksekusi PART 3
**Tanggal:** 6 Juli 2026
**Branch:** `feature/redesign-studio` (dari `main`, pasca housekeeping `b5d124d`)
**Dasar:** `docs/DESIGN_SYSTEM.md` (Arah A), `docs/STUDIO_UI_AUDIT_2026-07-06.md`
**Preview visual:** artifact "Studio × Arah A" (disertakan bersama proposal ini)

> Ini **bukan** memilih arah baru. Arah A (Elegant Editorial) sudah final dari landing. Dokumen
> ini menerjemahkannya ke konteks **editor padat kontrol** — beda kebutuhan dari halaman marketing.

---

## 0. Keputusan yang Sudah Dikonfirmasi (jadi kontrak, tidak dibahas ulang)

| # | Keputusan | Implikasi teknis |
|---|---|---|
| 1 | Kode yatim sudah dihapus (housekeeping `b5d124d`) | Scope bersih: hanya `components/studio/*` + `components/controls/*` |
| 2 | `components/controls/*` **ikut fase ini**, tapi **kontrak props & behavior BEKU** | TemplateLab (belum tersentuh) memakai komponen yang sama → hanya ganti tampilan (kelas/token), **jangan ubah signature/prop/callback**. Uji di dua konteks. |
| 3 | Breakpoint: **≥768px** layout penuh (panel + preview berdampingan); **<768px** pertahankan pola nav-bawah + overlay preview yang sudah ada, tetap fungsional | Bukan "buka di desktop". `md:` = garis batas layout dua-kolom; di bawahnya sidebar→nav-bawah, preview→overlay (persis pola sekarang, hanya di-reskin) |
| 4 | TemplateLab tetap **ZONA TUNDA** | Panel Tampilan/Opening/Dekorasi/Konten/Musik versi admin tidak dijadwalkan di sini |
| 5 | **DoD tambahan:** props ke `<InvitationRenderer>` tak berubah nilainya; preview tema **identik piksel** sebelum/sesudah | Verifikasi tiap stage yang menyentuh frame: screenshot preview tema sebelum vs sesudah, harus sama |

---

## 1. Prinsip Adaptasi: Editor ≠ Landing

Landing itu **dibaca** (whitespace lega, serif display besar, motion naratif). Editor **dioperasikan**
(densitas tinggi, banyak kontrol, interaksi cepat berulang). Token-nya sama, **belanjanya beda**:

| Aspek | Landing (marketing) | Studio (editor) |
|---|---|---|
| Serif Fraunces (`font-display`) | Judul section, harga, hero | **Hemat** — hanya nama pasangan di preview & empty state; **bukan** untuk label form/nav (tetap Geist) |
| Gold | Aksen "tinta" tipis | Sama tipis, tapi **fungsional**: penanda item aktif, dot "wajib", ring fokus aksen — bukan dekorasi |
| Densitas | `py-20..32`, gap besar | Rapat: padding kontrol 8–14px, gap 4–12px (pertahankan densitas nyaman yang sudah ada) |
| Skala teks | mentok `text-body-xs` (12px) | Butuh step lebih kecil untuk meta/badge/nav → **usul step editor baru** (§2) |
| Motion | `fadeUp` naratif sekali-masuk | Mikro & instan: status simpan, panel switch ≤200ms; **tanpa** animasi masuk yang menunda kerja |

---

## 2. Tipografi Editor — Perluasan Skala `globals.css`

**Masalah:** skala publik berhenti di 12px (`text-body-xs`), sedangkan editor sah membutuhkan
10–11px untuk label nav, badge tier, hint (audit: `text-[10px]`×182, `text-[9px]`×99). Aturan
"dilarang arbitrary font-size" tetap berlaku → **solusi: tambah subset "UI dense" ke `globals.css`**,
bukan mengizinkan arbitrary lagi.

Usulan utility baru (di `@layer utilities`, dipakai HANYA di chrome editor/dashboard):

```css
.text-ui-base  { font-size: 13px; line-height: 1.45; }   /* isian field, teks kontrol */
.text-ui-sm    { font-size: 12px; line-height: 1.4; }    /* label field, tombol kecil */
.text-ui-xs    { font-size: 11px; line-height: 1.35; }   /* nav item, meta */
.text-ui-2xs   { font-size: 10px; line-height: 1.3; }    /* badge tier, hint padat */
.text-ui-eyebrow { font-size: 10px; letter-spacing: .12em; text-transform: uppercase; font-weight: 700; }
```

- Teks konten yang **≥12px** tetap pakai skala publik (`text-body-*`, `text-label-*`).
- `text-[8px]`/`text-[7px]`/`text-[6px]` di **mini-mockup HP preview** = ilustrasi di dalam frame —
  **di luar scope** (bagian render/isi preview), tidak diubah.
- Fraunces: satu utility `.font-display` yang sudah ada; di editor hanya untuk nama pasangan di
  preview-adjacent & judul empty state. Nol Fraunces di form.

**Ini butuh approval** karena menyentuh `globals.css` (dipakai bareng landing) — tapi additive, tidak
mengubah kelas landing yang ada.

---

## 3. Warna — Peta Token (hex hardcode → token)

Semua nilai inline di Studio dipetakan ke token yang **sudah ada** (nihil hex baru):

| Hardcode Studio sekarang | Token Arah A | Dipakai untuk |
|---|---|---|
| `#2C4A34` / `#1A3020` (gradient nav aktif) | `bg-forest` (solid; **buang gradient** — Arah A pakai warna datar) | item nav aktif, tombol primer |
| `#C9A961` / `#C9B98A` (gold lama) | `text-gold-dark` / `bg-gold` / border `gold-200` | penanda aktif, dot wajib, badge |
| `#FAF9F6` | `bg-ivory` | canvas sidebar & panel |
| `#FEFDFB` / `#FEFDF8` | `bg-chalk` | permukaan kartu/field |
| `#EDE8E2` / `#DDD8D0` | `border-hairline` | garis pemisah, border field |
| `#F0EDE8` (hover) | `bg-mist` (via `hover:bg-mist`) | hover item nav |
| `#78716C` / `#A8A29E` / `#C9C2B8` | `text-concrete` / `text-ash` / `text-smoke` | label / meta / disabled |
| `#292524` / `#1C1917` / `#1a1a1a` | `text-graphite` / `text-carbon` | judul, isian |
| `emerald-*` (status tersimpan) | tetap **hijau semantik** (`green-600`) | feedback simpan — semantik, bukan brand |
| `amber-*` (lock/wajib) | tetap **amber semantik** | badge tier terkunci, peringatan |
| `stone-*` (150+ kelas) | netral graphite (`hairline/mist/concrete/ash`) | seluruh permukaan |

**Mekanisme hover JS → CSS:** `onMouseEnter/onMouseLeave` yang mengubah `style` (audit
`InvitationStudio.tsx:218,262,702`) diganti kelas `hover:` — perlu karena inline-style
menghalangi `:hover`, dan buruk untuk maintainability.

---

## 4. Reuse Primitive — Utamakan, Jangan Bikin Sistem Kedua

Prinsip: **jangan ada dua keluarga tombol/field.** Tapi juga jangan paksa primitive marketing ke
tempat yang kontraknya beda.

| Kebutuhan editor | Keputusan | Alasan |
|---|---|---|
| Tombol aksi (Preview, Refresh, CTA) | **Reuse `components/marketing/Button`** (varian `primary/secondary/ghost` + `size="sm"`) | API cocok, sudah ada focus-ring & target sentuh |
| Badge tier terkunci | **Reuse `components/marketing/Badge`** (varian `gold`/`outline`) | sama persis kebutuhannya |
| Field input/textarea/select editor | **Pertahankan `StudioInput/Textarea/Select`** — reskin token, JANGAN ganti ke `marketing/Field` | Adopsi sudah 100% (14 form), kontrak props beda (`marketing/Field` bawa label+error terintegrasi; StudioInput dipasang via `FormField` terpisah). Ganti = refactor besar berisiko, di luar "visual only" |
| Toggle, Divider | **Pertahankan `StudioToggle`/`StudioDivider`** — reskin token | Tidak ada padanan di marketing; komponen editor khas |
| Kartu section form | **Pertahankan `SectionCard`/`InfoCard`** — reskin ke `rounded-card`+`shadow-card`+`border-hairline` | Struktur (judul+ikon+deskripsi+slot) editor-spesifik |
| Kontrol latar/transisi | `components/controls/*` — reskin **tampilan saja**, props beku (keputusan #2) | Dipakai TemplateLab juga |

**Ringkas:** primitive marketing dipakai untuk **tombol & badge**; keluarga StudioInput tetap jadi
**primitive field editor** (hanya kulitnya di-token-kan). Satu sistem token, dua set komponen yang
saling melengkapi — bukan dua design system.

Motion: **reuse `lib/motion.ts`** (`EASE`, `DUR.fast` untuk switch panel/status). Progress bar &
`AnimatePresence` status simpan dipertahankan, hanya durasi diselaraskan (`DUR.fast` 0.2s).

---

## 5. Frame Preview — Pendukung, Bukan Bintang

Isi undangan (render tema) adalah bintang; frame **menghilang secara elegan**. Reskin frame
(bezel HP `renderPhone`, panel "Live Preview", overlay mobile, fullscreen) tanpa menyentuh
`<InvitationRenderer>`:

- Bezel HP: pertahankan `#1a1a1a` (device gelap netral — ini "bodi HP", bukan warna brand; mengubah
  ke forest justru mencuri perhatian). Yang di-token-kan hanya **panel di sekitarnya**.
- Latar panel preview: `bg-ivory` (sekarang `from-stone-100 to-stone-50`), border `hairline`.
- Header "Live Preview": `.text-ui-eyebrow` + tombol Refresh/Fullscreen pakai `Button variant="ghost" size="sm"`.
- Overlay mobile & fullscreen: latar `forest-deep/90` (bukan `black/90`) untuk kehangatan brand,
  kontrol pakai token.
- **Kontrak (DoD #5):** semua prop `<InvitationRenderer>`/`<InvitationPreview>` (invitationData,
  template, previewGuestName, initialPhase, scrollToSection, contained, noMusic, key) **identik**.
  Verifikasi piksel preview tema sebelum/sesudah tiap stage frame.

---

## 6. Aksesibilitas (naikkan, bukan hanya jaga)

Editor = interaksi keyboard intens. Target:
- **Focus-visible ring** (`ring-forest/40`) di SEMUA kontrol: nav item, tombol, field, toggle,
  kontrol preview. Banyak yang sekarang mengandalkan outline default / tidak ada.
- Kontras: `#A8A29E`(ash)/`#C9C2B8`(smoke) untuk teks informatif → minimal `concrete`; smoke hanya
  disabled/dekoratif.
- Nav item aktif: jangan hanya beda warna — pertahankan penanda non-warna (dot/ikon terisi) untuk
  color-blind.
- `aria-current` pada nav item aktif; `aria-pressed` pada toggle mode susun/reorder.
- Target sentuh ≥36px di kontrol utama (nav item, tombol) — banyak sekarang < 32px.

---

## 7. Rencana Stage (revisi dari brief, sesuai audit)

Hanya **studio customer** (migrasi selesai). TemplateLab = track terpisah nanti.

| Stage | Cakupan | Menyentuh frame? |
|---|---|---|
| **A** | Fondasi: perluasan skala `globals.css` (§2), reskin `ui/*` kit (StudioInput/FormField/SectionCard/InfoCard/LockedOverlay/StudioToggle/Divider) ke token | Tidak |
| **B** | Chrome `InvitationStudio`: sidebar nav (grup, progress, item aktif, reorder), header form + status simpan, nav-bawah mobile | Tidak |
| **C** | Frame preview: panel desktop, overlay mobile, fullscreen, latar bezel — **verifikasi piksel tema** | **Ya** (DoD #5) |
| **D** | Panel form kelompok "Info Dasar" + "Tampilan" (Mempelai, Acara, Warna, Pembuka, Loading) | Tidak |
| **E** | "Cerita & Media" (Quote, Cerita, Galeri, Musik, Video) | Tidak |
| **F** | "Interaksi Tamu" + "Fitur Lanjutan" (Hadiah, Gift Registry, Penutup, Livestream, IG Story, QR) | Tidak |
| **G** | `components/controls/*` (latar/transisi) — reskin, **props beku**, uji di studio + TemplateLab | Tidak |

Checkpoint tiap stage: build hijau → screenshot → approval → commit/push. Baseline anti-regresi:
`/dashboard` **258 kB** (pasca housekeeping).

---

## 8. Ringkas untuk Di-approve

1. **Perluasan `globals.css`** dengan 5 utility `.text-ui-*` (§2) — additive, tidak sentuh kelas landing.
2. **Peta token** hex→Arah A (§3), termasuk buang gradient nav jadi warna datar & hover JS→CSS.
3. **Strategi reuse** (§4): Button/Badge marketing untuk tombol/badge; StudioInput dipertahankan
   sebagai field editor (reskin token, bukan diganti).
4. **Frame preview** reskin dengan kontrak renderer beku (§5).
5. **Urutan Stage A–G** (§7), TemplateLab tetap ditunda.

*Tidak ada kode komponen yang diubah di PART 2 ini. Eksekusi Stage A menunggu approval.*
