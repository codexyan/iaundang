# iaundang — Audit UI Modul Studio + Pemetaan Risiko Migrasi `StudioInput`

**Tanggal:** 6 Juli 2026
**Sifat:** Read-only (tidak ada perubahan kode)
**Cakupan:** modul editor template (chrome + frame preview) — PART 1 dari track `feature/redesign-studio`
**Referensi:** `docs/DESIGN_SYSTEM.md` (Arah A), `docs/UI_AUDIT_REPORT_2026-07-05.md`

---

## Ringkasan Eksekutif

Temuan terpenting audit ini **membalik asumsi brief**: "Studio" di kode ternyata **dua modul
berbeda**, dan status migrasi `StudioInput` keduanya bertolak belakang:

1. **Studio customer** (`components/studio/*`, 4.431 baris, dipakai di `/dashboard`) — migrasi
   `StudioInput` **sudah selesai**. Seluruh 14 form aktif + chrome memakai keluarga
   `StudioInput/Textarea/Select/Toggle`; hanya 2 input mentah tersisa dan keduanya sah
   (file-input tersembunyi untuk upload, checkbox — varian yang memang belum ada).
   **Area ini AMAN diredesign sekarang.**
2. **TemplateLab** (`components/admin/tabs/TemplateLab.tsx`, **5.914 baris satu file**, editor
   template admin) — migrasi **belum dimulai sama sekali**: 0 pemakaian `StudioInput`,
   **114 kontrol form mentah**, dan masih menerima hotfix aktif (commit `f1f37cb`, crash tab
   musik, 5 Jul). Tab-nya (`tampilan | opening | decor | konten | music`) **persis nama panel
   di brief** — artinya Stage C–G versi brief sebenarnya menunjuk TemplateLab.
   **Area ini ZONA TUNGGU — redesign ditunda sampai migrasi `StudioInput`-nya selesai.**

Konsekuensi: redesign Studio **tidak perlu ditunda seluruhnya**, tapi scope PART 3 harus
dipetakan ulang — kerjakan studio customer sekarang (chrome, frame preview, panel form),
geser TemplateLab ke belakang sebagai track lanjutan. Rekomendasi lengkap di §7.

Bonus temuan: ada **±1.700 baris kode yatim** di jalur editor (`InvitationEditor.tsx` versi lama
+ 2 form + mode standalone) yang tidak dipakai siapa pun — sumber kebingungan "setengah
dimigrasi"; sebagian besar kesan mixed berasal dari kode mati ini, bukan dari migrasi yang
berjalan.

---

## 1. Struktur Modul & Garis Batas Preview (bukti file:line)

### 1a. Dua editor, satu keluarga renderer

```
components/studio/                      ← STUDIO CUSTOMER (in-scope, aman)
  InvitationStudio.tsx (1.020)          ← chrome utama: sidebar nav, header form,
                                           panel preview, overlay mobile, fullscreen
  StudioHeader.tsx (98)                 ← HANYA dipakai mode standalone (mati — lihat §5)
  SectionAppearanceControls.tsx (76)    ← kontrol latar/transisi per section
  forms/ (16 file)                      ← panel per bagian (Mempelai, Acara, Warna, …)
  ui/ (6 file)                          ← kit: StudioInput, FormField, SectionCard,
                                           InfoCard, ProgressBar, LockedOverlay
components/controls/                    ← SHARED studio customer + TemplateLab
  SectionBackgroundControl.tsx (118)
  SectionTransitionControl.tsx (92)
components/admin/tabs/TemplateLab.tsx   ← EDITOR ADMIN (5.914 baris — ZONA TUNGGU)
components/renderer/                    ← RENDER TEMA UNDANGAN (OUT-OF-SCOPE mutlak)
  InvitationRenderer.tsx, InvitationPreview.tsx, …
```

Jalur pemakaian: `/dashboard` → `DashboardClient` → `TemplateModule` →
`<InvitationStudio embedded>` (`TemplateModule.tsx:99-103`). TemplateLab dirender dari
`AdminPanel` di `/admin`.

### 1b. GARIS BATAS PREVIEW — frame (boleh) vs render tema (jangan)

Aturan yang terbaca dari kode dan saya usulkan dikunci: **semua yang diimpor dari
`components/renderer/*` adalah render tema = OUT-OF-SCOPE; semua markup di sekelilingnya
(bezel HP, zoom wrapper, tombol kontrol, latar panel) adalah frame = in-scope.**

| Lokasi | Frame (in-scope) | Render tema (JANGAN SENTUH) |
|---|---|---|
| Panel preview desktop | `InvitationStudio.tsx:910-926` (panel 360px, header "Live Preview", tombol Refresh/Fullscreen) + `renderPhone()` `:655-666,680-684` (bezel `#1a1a1a`, notch, zoom wrapper `zoom: sw/390`) | `<InvitationRenderer …>` `:667-678` (dynamic import `:21`) |
| Overlay preview mobile | `:929-947` (backdrop hitam, tombol X/refresh/tab-baru) | pemanggilan `renderPhone()` yang sama |
| Fullscreen | `:950-965` (tombol X, kontainer max-w 430) | `<InvitationRenderer>` `:966-973` |
| Mode standalone (mati) | `:1001-1005,1012-1015` (bezel stone) | `<InvitationPreview>` `:1006-1010` |
| TemplateLab | shell HP `TemplateLab.tsx:5105-5199` (`zoom 340/390`) | `<InvitationPreview>` `:5194`, `<InvitationRenderer>` `:5340` (keduanya dynamic `:26,:31`) |

Catatan penting frame: prop yang dikirim ke renderer (`invitationData`, `template`,
`previewGuestName`, `initialPhase`, `scrollToSection`, `contained`, `noMusic`) adalah bagian
kontrak preview↔panel — mengubah nilainya = mengubah perilaku render → dilarang. Redesign
hanya boleh menyentuh markup DI LUAR elemen `<InvitationRenderer/>`/`<InvitationPreview/>`.

---

## 2. Status Migrasi `StudioInput` per File

Metode: hitung pemakaian `StudioInput|StudioTextarea|StudioSelect|StudioToggle` vs elemen
`<input|textarea|select>` mentah per file.

### ✅ SELESAI — `components/studio/*` (semuanya)

Seluruh 16 form + `InvitationStudio` + `SectionAppearanceControls` memakai keluarga
StudioInput. Dua-duanya raw yang tersisa **sah, bukan sisa migrasi**:
- `forms/BasicInfoForm.tsx:85` — `<input type="file" hidden>` (trigger upload; tidak ada varian StudioInput-nya)
- `forms/EventDetailsForm.tsx:41` — `<input type="checkbox">` (belum ada `StudioCheckbox`)

Riwayat git menguatkan: `461014f` "rombak visual system studio editor" (satu gelombang penuh),
lalu `7558032`, `2992a27` — pekerjaan terakhir di modul ini rapi, bukan setengah jalan.
**Tidak ada TODO/FIXME terkait migrasi di seluruh `components/studio`.**

### ❌ BELUM MULAI — `TemplateLab.tsx` → **ZONA TUNGGU**

- 0 pemakaian StudioInput; **114 `<input|textarea|select>` mentah** dalam satu file 5.914 baris.
- Masih hangat oleh hotfix (`f1f37cb` crash tab musik, 5 Jul) — file ini aktif berubah.
- Tab-nya = `tampilan/opening/decor/konten/music` (`TemplateLab.tsx:783,1773-1776`) — persis
  panel yang disebut brief. **Panel "Dekorasi" hanya ada di sini** (studio customer tidak punya
  panel dekorasi; lihat §5 tentang DecorationForm yang yatim).

### ⚠️ SHARED — `components/controls/*`

`SectionBackgroundControl` & `SectionTransitionControl` dipakai **dua-duanya** (studio customer
via `SectionAppearanceControls`, dan TemplateLab `:22-23`). Tanpa input mentah (berbasis
tombol). Boleh diredesign, tapi wajib diuji di kedua konteks — atau ditunda ke fase TemplateLab
supaya satu kali kerja.

---

## 3. Gap Styling vs Arah A

Studio memakai **dialek pra-redesign yang di-hardcode inline** — bukan token:

| Aspek | Kondisi Studio | Arah A |
|---|---|---|
| Hijau brand | `#2C4A34` / `#1A3020` (14+ kemunculan, inline `style`) | token `forest #1a3320` / `forest-deep #0f1a12` |
| Gold | `#C9A961` / `#C9B98A` (16+) | token `gold #d4af37` / `gold-dark #b8973a` (aturan "tinta") |
| Netral | palet `warm` lama hardcode: `#EDE8E2`(14), `#A8A29E`(8), `#78716C`, `#292524`, `#DDD8D0`, `#C9C2B8`, `#FEFDFB` — **token `warm` sudah dihapus dari tailwind config di Stage A landing; Studio selamat hanya karena hex-nya inline** | `hairline/mist/concrete/ash/graphite/chalk` |
| Kelas asing | `stone-*` (150+: `border-stone-200`×42, `text-stone-400`×32, …), `emerald`, `amber`, `gold-50/400/600` | dilarang di sistem baru (kecuali semantik) |
| Ukuran teks | arbitrary masif: `text-[10px]`×182, `text-[9px]`×99, `text-[8px]`×47, `text-[7px]`×8, plus `fontSize: 8..13` inline | skala `globals.css` (catatan: skala saat ini mentok di 12px — editor dense mungkin butuh step `text-ui-*` baru; keputusan PART 2) |
| Mekanisme hover | **`onMouseEnter/onMouseLeave` mengubah `style` via JS** (`InvitationStudio.tsx:218-219,262-263,702-703`) | kelas `hover:` CSS |
| Font display | tidak ada | Fraunces tersedia via `font-display` |
| Positif | ivory `#FAF9F6` = persis token `ivory`; radius 10–12px dekat `rounded-input/button`; fokus StudioInput sudah pakai ring lembut | mempermudah migrasi |

Kesimpulan: gap besar tapi **mekanis** — sebagian besar berupa penggantian hex→token,
inline-style→kelas, arbitrary→skala. Tidak ada perombakan struktur yang dituntut.

---

## 4. Kontrak Data (jangan tersenggol)

**Studio customer:**
- State `NewInvitationData` (`lib/types.ts`), diinisialisasi dari `invitation.data`
  (`InvitationStudio.tsx:52-104`).
- **Autosave**: `updateData()` → `scheduleSave()` debounce **800ms** → `PATCH
  /api/invitations/[id]` body `{ data }` → `onSaved(updated)` ke dashboard (`:363-392`).
- **Preview**: `debouncedData` terpisah, debounce **600ms** (`:311-316`); `previewTemplate`
  di-memo dari `template.config` + override user (`:337-357`); `previewKey` me-remount renderer
  saat `opening_type`/`loading_config` berubah (`:359-361`).
- **Gating paket**: `usePackageGating(tier)` → lock nav + filter section preview (`:322,351-356`);
  admin dipaksa `eksklusif`.
- Kelengkapan: `calculateCompleteness` (`lib/studio-progress`) untuk progress bar sidebar.
- Template config dimuat dinamis `lib/template-configs/*` (`TemplateModule.tsx:33-38`).

**TemplateLab (zona tunggu, dicatat saja):** state `TemplateRecord.config` penuh, dirty
tracking `onDirtyChange` + `onSaveDraftRef`, persist via `/api/admin/template-records*`,
upload `/api/admin/upload`, musik `/api/admin/music`.

---

## 5. Kode Yatim di Jalur Editor (sumber kesan "setengah migrasi")

Diverifikasi tanpa importer:

| File | Baris | Status |
|---|---|---|
| `components/dashboard/InvitationEditor.tsx` | 1.062 | Editor customer generasi lama — **tidak diimpor siapa pun**, 0 StudioInput |
| `components/studio/forms/DecorationForm.tsx` | 492 | Hanya diimpor InvitationEditor yatim |
| `components/studio/forms/ProfilesForm.tsx` | 132 | idem |
| Mode standalone `InvitationStudio.tsx:981-1019` | ±39 | Satu-satunya pemanggil selalu `embedded` (`TemplateModule.tsx:103`) — jalur mati |
| `components/studio/StudioHeader.tsx` + `ui/ProgressBar.tsx` | 98+58 | Hanya dipakai mode standalone di atas |

**Inilah yang membuat modul terasa "mixed"**: file-file 0-StudioInput itu bukan antrian
migrasi, melainkan bangkai. Rekomendasi housekeeping (butuh konfirmasi, di luar scope
redesign): hapus kelimanya (±1.840 baris) sebelum Stage A studio, supaya scope bersih.

---

## 6. State Fungsional yang WAJIB Tetap Jalan (checklist regresi)

1. Autosave debounce 800ms + indikator `idle/saving/saved` di header form.
2. Preview live ter-update ≤600ms setelah ketikan; remount saat ganti tipe opening/loading.
3. `previewPhase` mengikuti nav aktif (loading→fase loading, section konten→scroll ke
   section terkait via `scrollToSection`, selainnya→opening) (`:647-653`).
4. Gating: nav terkunci menampilkan badge tier + `LockedOverlay`; dot "wajib diisi".
5. Progress kelengkapan (sidebar desktop, kartu di atas form mobile) + daftar field kurang.
6. **Mode susun-ulang nav** (`Reorder.Group`, `:308-335,742-756`): quirk yang harus
   dipertahankan apa adanya — hanya menyusun urutan item nav secara lokal (tidak dipersist,
   tidak mengubah urutan section undangan). Jangan "diperbaiki" diam-diam.
7. Mobile: nav horizontal fixed `bottom-[52px]` (duduk di atas bottom-nav dashboard — offset
   ini kontrak dengan layout dashboard), overlay preview, fullscreen.
8. Tombol Refresh (remount preview), Fullscreen, buka-tab-baru `/invitation/[slug]`.
9. Panel Galeri me-render `GalleryManager` (komponen dashboard — logic upload jangan disentuh).
10. `SectionAppearanceControls` muncul hanya untuk nav item yang punya padanan section render
    (`:643-646`).

**Baseline (build 6 Jul, hijau):** tsc 0 error, lint 0 warning. First Load JS: `/dashboard`
**307 kB** (studio customer di dalamnya; renderer di-split dynamic), `/admin` **446 kB**
(TemplateLab di dalamnya). Angka ini jadi pembanding anti-regresi.

---

## 7. Rekomendasi Scope (keputusan yang diminta dari Fakhrian)

**A. AMAN DIREDESIGN SEKARANG — studio customer (migrasi selesai):**
- Stage A: chrome `InvitationStudio` embedded — sidebar nav (+grup label, progress), header
  form + status simpan, nav mobile — ganti hex→token Arah A, hover JS→kelas, arbitrary→skala.
- Stage B: frame preview (panel desktop, overlay mobile, fullscreen, bezel `renderPhone`) —
  tanpa menyentuh satu prop pun milik renderer.
- Stage C+: kit `ui/*` (StudioInput/FormField/SectionCard/InfoCard/LockedOverlay) lalu
  14 form aktif per kelompok nav (Info Dasar → Tampilan → Cerita&Media → Interaksi → Lanjutan).
- Catatan PART 2: pertahankan `StudioInput` sebagai primitive editor (jangan ganti ke
  `marketing/Field` — kontrak props berbeda dan adopsinya sudah 100%); yang diganti kulitnya
  (token), bukan API-nya.

**B. ZONA TUNGGU — TemplateLab (5.914 baris, 0% migrasi, hotfix aktif):**
- Panel Tampilan/Opening/**Dekorasi**/Konten/Musik versi admin ditunda seluruhnya.
- Saran urutan sehat: (1) selesaikan migrasi StudioInput TemplateLab — idealnya sambil
  memecah file 5.914 baris itu per tab; (2) baru redesign visual menumpang di atasnya.
  Redesign sekarang = mengecat kapal yang sedang dilas.

**C. BUTUH KONFIRMASI sebelum PART 2:**
1. Hapus kode yatim §5 (±1.840 baris) — ya/tidak?
2. `components/controls/*` (shared dua editor): ikut fase studio customer atau tunggu TemplateLab?
3. Breakpoint minimum editor (usulan: fungsional penuh ≥768px; di bawahnya pertahankan pola
   nav-bawah + overlay preview yang sudah ada).

---

*Output PART 1 track `feature/redesign-studio`. Tidak ada kode yang diubah. PART 2 menunggu
konfirmasi rekomendasi scope di atas.*
