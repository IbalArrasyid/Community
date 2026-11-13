# Detail artikel Barter Up

## Implementasi

Route `/articles/:slug` menggunakan komponen `ArticleDetail.tsx` dengan breadcrumb, judul, summary, tanggal publikasi, cover CMS, toolbar berbagi, kolom baca dan sidebar. Tidak ada perubahan route atau migrasi. Metadata `article:published_time` ditambahkan pada halaman ARTICLE; judul SEO, deskripsi, canonical dan Open Graph existing dipertahankan. Footer atribusi Hi.Events tetap digunakan.

Daftar isi dibuat dari heading H2/H3 yang benar-benar ada di body CMS. Pemindaian DOM hanya berjalan dalam effect browser dan dibatasi pada body artikel. Heading kosong diabaikan; id existing yang unik dipertahankan, sedangkan heading tanpa id atau id bertabrakan memperoleh id numerik berawalan artikel. Fragmen tautan di-encode dan deep link ke heading dipulihkan setelah hydration. Heading dapat menerima fokus keyboard. Tanpa heading, daftar isi tidak ditampilkan.

Waktu baca adalah estimasi sekitar 200 kata per menit, dihitung dari `textContent` body setelah hydration. Ditampilkan dengan tanda `~`, bukan statistik perilaku pembaca. Artikel kosong tidak menampilkan estimasi. Nilai awal server dan client sama, tanpa akses DOM saat SSR.

Tombol salin menggunakan Clipboard API pada klik pengguna. Hanya keberhasilan penyalinan yang menampilkan pesan sukses. Jika akses ditolak/tidak tersedia, tampil input read-only yang dapat dipilih untuk menyalin URL secara manual. Tombol WhatsApp membuka composer dengan judul dan URL canonical; aplikasi tidak mengirim pesan otomatis.

Sidebar dan kartu bawah menampilkan maksimal tiga artikel published terbaru dari API existing, mengecualikan id artikel aktif. Labelnya **More articles**, bukan rekomendasi berdasarkan kategori atau popularitas. Kegagalan permintaan tambahan ini tidak menggagalkan pembacaan artikel utama. Draft/future tetap ditolak oleh endpoint konten existing; tidak ada endpoint preview publik baru.

Nama penulis, status verified/trending, jumlah pembaca, klaim omzet/biaya, komentar, kalkulator, toolkit dan grup Telegram dari mockup tidak dipasang sebagai fakta atau kontrol tanpa layanan/data pendukung.

## Menyiapkan konten

Di CMS, edit ARTICLE yang dipublikasikan: isi title, summary, cover dan body. Gunakan heading level 2 untuk bagian utama dan level 3 untuk subbagian. Daftar isi, waktu baca, tanggal serta URL berbagi mengikuti konten tersebut secara otomatis. Daftar isi tidak memerlukan pengisian manual. Rich text tetap melalui sanitasi penyimpanan dan komponen render existing.

## Verifikasi aktual

```bash
cd frontend
node --experimental-strip-types --test tests/articleReadingTime.test.mjs
```

Tiga unit test lulus pada Node 22.16: konten kosong, batas 200 kata serta whitespace paragraf. Ini bukan verifikasi visual atau E2E.

Spec `e2e/tests/organizers/community-article-detail.spec.ts` memeriksa judul/body CMS, metadata publikasi, URL WhatsApp, heading anchors, layar 390px, footer serta navigasi kembali. Spec kedua mensimulasikan penolakan Clipboard API agar fallback diuji tanpa mengubah browser pengguna atau mengirim pesan. Spec memakai organizer development publik yang dikonfigurasi dengan `E2E_COMMUNITY_ORGANIZER_ID` dan minimal satu ARTICLE published. Ikuti `.agents/skills/e2e-dev-stack/SKILL.md`.

TypeScript, Lingui extract/compile, build SSR client/server dan Playwright telah dicoba, tetapi executable dependency lokal tidak tersedia (`MODULE_NOT_FOUND`). Uji browser belum dijalankan. Jalankan pemeriksaan tersebut pada lingkungan dengan dependency lengkap sebelum deployment. Backend tidak berubah pada perluasan single post ini; blocker pengujian dan regenerasi OpenAPI dari perubahan pencarian Articles sebelumnya tetap dicatat di `community-articles-page.md`.

## Deployment dan rollback

Push source yang sudah diperiksa, pull pada Azure dan build image dengan tag commit baru. Setelah build sukses, ganti hanya image service `app` dengan mempertahankan environment, override Nginx dan volume. Tidak perlu migrasi tambahan. Rollback dapat dilakukan dengan mengembalikan tag image sebelumnya; konten CMS tidak berubah.
