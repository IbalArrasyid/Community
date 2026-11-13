# Halaman About Barter Up

## Cakupan

Route `/about` menggunakan layout khusus dengan hero, empat kartu kapabilitas, banner foto, panel biru, isi editorial dan CTA menuju `/events` serta `/contact`. Header, footer atribusi Hi.Events dan metadata existing dipertahankan. CSS berada pada module route existing agar dimuat oleh SSR. Tidak ada migrasi atau endpoint baru.

Konten tetap berasal dari PAGE published dengan slug `about`: judul untuk hero, summary untuk pengantar, cover image untuk banner dan body untuk cerita, nilai serta langkah pendaftaran. Jika cover belum dipilih, tampil ilustrasi ikon lokal. Jika PAGE belum ada, deskripsi organizer digunakan sebagai fallback existing. Draft tidak digunakan sebagai fallback publik.

## Konten Bahasa Indonesia

Gunakan judul: **Memberi Ruang bagi Komunitas untuk Bertemu dan Bertumbuh**.

Gunakan summary: **Barter Up mempertemukan komunitas, kreator, dan pelaku usaha lokal melalui kegiatan yang bermakna. Temukan cerita, jelajahi acara, dan ikuti pendaftaran langsung di website Barter Up.**

Contoh body siap disunting tersedia di `backend/docs/community-about-content.html`. Buka file HTML di browser, salin isi yang dirender dan tempel ke rich-text editor PAGE `about`, lalu periksa preview sebelum publish. Ini mengganti body yang dipilih secara manual; salin konten lama terlebih dahulu jika masih dibutuhkan. File ini tidak otomatis menulis atau menimpa data CMS. Gunakan heading level 2, bullet list untuk kartu nilai, ordered list untuk langkah kegiatan, dan blockquote untuk pernyataan utama.

Tidak ada statistik omzet, jumlah komunitas, nama anggota tim, testimoni, janji komisi nol, pencairan instan atau pengiriman WhatsApp dari mockup yang dinyatakan sebagai fakta. Biaya dan pembayaran mengikuti konfigurasi checkout yang sebenarnya.

## Pemeriksaan

- `git diff --check`.
- Frontend: `yarn messages:extract --clean`, `yarn messages:compile`, `npx tsc --noEmit`, `yarn build:ssr:client`, `yarn build:ssr:server`.
- E2E: gunakan dev stack dan prosedur `.agents/skills/e2e-dev-stack/SKILL.md`. Tetapkan `E2E_COMMUNITY_ORGANIZER_ID` ke organizer development yang PUBLIC dan published serta sama dengan `COMMUNITY_ORGANIZER_ID` backend. Jalankan `E2E_BASE_URL=https://localhost:8443 E2E_COMMUNITY_ORGANIZER_ID=<id> npx playwright test tests/organizers/community-about.spec.ts` dari `e2e`.
- Periksa desktop dan viewport 390px, CMS cover ada/tidak ada, heading tunggal, navigasi contact/events, perubahan body sesudah publish, metadata dan atribusi footer.

## Deployment dan rollback

Push perubahan, pull pada Azure lalu build image baru dengan tag terpisah. Gunakan heap build yang telah disesuaikan untuk VM. Ganti hanya image service `app`, validasi Compose dan recreate service tanpa menghapus volume. Simpan tag image sebelumnya agar rollback dapat dilakukan dengan mengembalikan referensi image. Perubahan konten CMS dikelola terpisah dari rollback image.

## Status verifikasi

`git diff --check` lulus. Pemeriksaan referensi class About terhadap SCSS dan keberadaan seluruh pesan UI About di 22 katalog existing lulus.

Percobaan TypeScript, Lingui extract/compile, build SSR client/server dan Playwright terblokir `MODULE_NOT_FOUND`: dependency executable tidak tersedia pada node_modules lokal. Pemeriksaan Docker juga gagal karena pipe Docker Desktop Linux Engine tidak tersedia. Tidak ada hasil build, type-check, browser, E2E atau regresi backend yang diklaim lulus. Backend PHP tidak berubah. Tidak ada migrasi untuk dijalankan.

Keberadaan spec bukan bukti E2E lulus. Build, TypeScript dan visual harus diverifikasi pada lingkungan dengan dependency lengkap dan dev stack aktif sebelum dinyatakan siap produksi.
