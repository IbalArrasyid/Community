# Halaman event komunitas

Halaman `/events` memakai hero, pencarian, sorotan event pertama pada halaman pertama tanpa pencarian, kartu responsif, jumlah hasil dan pagination dari API publik yang sudah ada. Harga, status tiket dan lokasi memakai helper publik yang sudah ada. Tanggal memakai proyeksi occurrence dan daftar occurrence, tanpa membaca tanggal event legacy. Data kosong menampilkan empty state, tanpa event contoh.

CMS: buat atau edit PAGE dengan slug `events`, kemudian publish. Title dan summary mengatur hero; body ditampilkan setelah daftar. SEO title dan description mengikuti metadata CMS. Konten CMS bersifat opsional.

Tautan kartu mempertahankan `/event/{id}/{slug}`. Tidak ada perubahan schema, endpoint, pembayaran, checkout atau konfigurasi produksi. Widget dukungan global dan atribusi Hi.Events tetap tersedia.

Verifikasi lokal:

```powershell
node --experimental-strip-types --test frontend/tests/*.test.mjs
git diff --check
cd frontend
npx tsc --noEmit
```

Unit helper jadwal mencakup proyeksi occurrence, urutan tanggal, occurrence batal/lampau, tanggal tidak valid dan end sebelum start. E2E `e2e/tests/organizers/community-events.spec.ts` mencakup pencarian/reset, mobile dan tujuan halaman tiket, dengan organizer publik serta event terbit pada dev stack.

Type-check, build dan E2E belum terverifikasi: dependensi executable frontend lokal tidak lengkap dan Docker Desktop tidak berjalan. Uji visual serta event nyata di Azure masih diperlukan setelah build. Tidak ada migrasi. Rollback melalui image aplikasi sebelumnya dengan volume tetap dipertahankan.
