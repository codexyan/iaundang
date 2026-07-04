# Panduan Kontribusi — iaundang

Dokumen ini menjelaskan alur kerja pengembangan iaundang: environment, branching, dan pembagian peran. Singkat dan praktis.

## Tiga Environment

| Environment | Branch sumber | URL | Database (Fase 1) |
|-------------|---------------|-----|-------------------|
| **Local** | `feature/*` (di mesin dev) | `localhost` | Production (sementara satu DB) |
| **Staging** | `develop` | `staging.iaundang.online` | Production (sementara satu DB) |
| **Production** | `main` | `iaundang.online` | Production |

> Catatan: di Fase 1 semua environment masih memakai **satu database production**. Pemisahan database staging dilakukan di fase berikutnya.

## Alur Branch

```
feature/*  →  develop  →  main
 (lokal)      (staging)    (production)
```

1. Buat branch dari `develop` untuk mengerjakan fitur/perbaikan.
2. Buka **Pull Request** ke `develop`. Setelah lolos review + QA di staging, `develop` di-merge ke `main` untuk rilis.
3. Hotfix mendesak boleh dibuat dari `main`, lalu di-merge balik ke `main` **dan** `develop`.

## Aturan Branching

- **Tidak ada commit langsung** ke `main` maupun `develop`. Semua perubahan lewat **Pull Request**.
- `main` dan `develop` dilindungi (branch protection): wajib review + status check hijau sebelum merge.
- Satu PR = satu fokus perubahan. Jaga PR tetap kecil dan mudah direview.
- Rebase/merge `develop` terbaru sebelum minta review agar konflik minimal.

## Konvensi Penamaan Branch

| Prefix | Untuk | Contoh |
|--------|-------|--------|
| `feature/` | Fitur baru | `feature/rsvp-export` |
| `fix/` | Perbaikan bug (non-urgent) | `fix/countdown-timezone` |
| `hotfix/` | Perbaikan mendesak di production | `hotfix/payment-webhook` |

Gunakan huruf kecil dan tanda hubung (`kebab-case`) untuk nama fitur/bug.

## Konvensi Commit

Gunakan format ringkas `tipe: deskripsi` (mis. `fix:`, `feat:`, `docs:`, `chore:`). Tulis dalam kalimat imperatif dan jelas.

## Peran Tim

| Peran | Tanggung jawab singkat |
|-------|------------------------|
| **Developer** | Menulis kode di branch `feature/*`, membuka PR ke `develop`. |
| **Reviewer** | Review PR: kualitas kode, keamanan, konvensi. Approve/minta revisi. |
| **QA** | Uji fungsional di Staging sebelum rilis ke Production. |
| **Release Manager** | Mengatur merge `develop → main` dan proses rilis. |
| **DB Admin** | Mengelola migrasi Prisma & database Supabase. |
| **Content Admin** | Mengelola konten & pengaturan lewat panel admin. |
| **Writer** | Membuat/menyunting konten (role `content_writer`). |

## Sebelum Membuka PR

- `npm run build` lolos tanpa error.
- `npx tsc --noEmit` tidak menambah error baru.
- Tidak menaruh secret/nilai environment ke dalam kode — gunakan env variable (lihat `.env.example`).
