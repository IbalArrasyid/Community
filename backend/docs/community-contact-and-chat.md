# Contact dan widget dukungan global

## Halaman Contact

Route `/contact` memakai hero, breadcrumb, tiga kartu kanal bantuan, formulir dan sidebar editorial responsif. Title, summary, cover dan informasi kontak/FAQ berasal dari PAGE published berslug `contact`. Contoh body Bahasa Indonesia ada di `community-contact-content.html`; buka file di browser, salin isinya yang dirender lalu tempel pada editor CMS bila ingin mengganti body existing. Tidak ada penulisan otomatis ke konten yang sudah dibuat.

Judul yang disarankan: **Ada Pertanyaan? Mari Bicara dengan Tim Barter Up.** Summary: **Hubungi kami untuk pertanyaan tentang kegiatan komunitas, informasi tiket, atau rencana kolaborasi. Ceritakan kebutuhan Anda melalui formulir atau gunakan widget dukungan yang tersedia.**

Nomor WhatsApp, email, lokasi basecamp, jam layanan, SLA respons, janji biaya gratis dan jaringan relawan dari mockup tidak disalin sebagai fakta. Masukkan detail yang telah dikonfirmasi melalui body CMS. Kartu bantuan memakai jalur nyata: formulir, artikel, dan widget dukungan.

Formulir bersama `CommunityContactForm` tetap menggunakan endpoint `POST /public/community/contact` existing dengan name, email, subject, message dan honeypot website. Tidak ada field tambahan yang dibuang diam-diam. Validasi backend, pembatasan 5 permintaan per jam per IP, scope organizer LIVE/PUBLIC, penyimpanan inbox dan hak baca staf existing dipertahankan.

Pesan sukses hanya muncul setelah respons API mengandung `data.received === true`. Kesalahan HTTP maupun respons tanpa konfirmasi menampilkan error dan mempertahankan teks. Tidak ada janji email/WhatsApp terkirim dari formulir ini. Pengaturan email staging sebelumnya belum diubah.

## Widget pada semua halaman

`ChatwootWidget` tetap dipasang satu kali melalui `App -> ThirdPartyScripts`, di luar router. Pembatasan lama `/manage`, `/settings` dan `/welcome` dihapus. Launcher tersedia di halaman publik, artikel/detail, auth, dashboard dan alur lain dalam aplikasi. SDK tidak dimuat saat SSR atau sebelum pengguna membuka dukungan. Interaksi DOM hanya berjalan dalam effect browser.

- Tanpa konfigurasi provider, launcher berlabel Contact membuka formulir inbox yang sama. Ini pesan kontak, bukan percakapan live atau chatbot.
- Dengan konfigurasi valid, launcher berlabel Live chat memuat SDK Chatwoot saat klik pertama, mendengarkan `chatwoot:ready` sebelum membuka panel, dan mempertahankan satu script/inisialisasi selama navigasi SPA. Status agen dan balasan dikelola Chatwoot; tidak ada indikator online, percakapan contoh atau pesan terkirim palsu.
- Error pemuatan, error runtime atau timeout 15 detik membuka fallback formulir. Callback terlambat tidak membuka panel otomatis setelah fallback. Pengguna dapat mencoba kembali melalui launcher.
- Native bubble disembunyikan sehingga tidak ada dua launcher. Listener dan timer dibersihkan tanpa membongkar percakapan pada pergantian route. Data akun aplikasi, peran, email atau identitas peserta tidak otomatis diteruskan ke provider. Chatwoot mengelola identitas pengunjungnya sendiri.
- Base URL harus HTTPS tanpa userinfo, query atau fragment. Jika token tersedia dan URL kosong, default existing adalah `https://app.chatwoot.com`. No token/URL invalid memakai fallback. Tidak ada secret baru di source.

## Aktivasi pada Azure

Siapkan website inbox Chatwoot untuk `https://community.iqbaldigital.com` dan operator yang dapat membalas. Gunakan website token dari snippet widget, bukan personal/API access token. Tambahkan dua nilai ini ke `~/community-deploy/.env` pada server:

```dotenv
VITE_CHATWOOT_BASE_URL=https://app.chatwoot.com
VITE_CHATWOOT_WEBSITE_TOKEN=PASTE_WEBSITE_TOKEN_FROM_CHATWOOT
```

Gunakan URL HTTPS Chatwoot sendiri jika self-hosted. Compose staging yang menggunakan `env_file: .env` sudah meneruskan nilai tersebut. Compose repository all-in-one dan `.env.example` ditambahkan placeholder yang sama. Setelah source baru dibangun/deploy, perubahan konfigurasi runtime memerlukan recreate service app. Tidak perlu migrasi database atau rebuild ulang untuk perubahan nilai runtime pada SSR setup yang sekarang.

Uji manual dengan dua browser: pengunjung membuka Live chat dan mengirim pesan, operator menerima lalu membalas melalui Chatwoot. Verifikasi balasan tampil, perpindahan route tidak mereset percakapan, offline mengikuti pengaturan inbox, dan fallback berfungsi saat provider gagal. Integrasi belum dinyatakan live sebelum uji nyata ini berhasil.

Dokumentasi SDK resmi: https://www.chatwoot.com/hc/user-guide/articles/1677587234-how-to-send-additional-user-information-to-chatwoot-using-sdk . Integrasi menggunakan `run`, event `chatwoot:ready`, `toggle('open')` dan `hideMessageBubble`.

## Verifikasi

```bash
cd frontend
node --experimental-strip-types --test tests/supportChat.test.mjs tests/articleReadingTime.test.mjs
```

Delapan unit test lulus: lima konfigurasi/SSR dukungan baru dan tiga waktu baca existing. Ini bukan tes SDK atau percakapan live.

Spec Contact mencakup API receipt sukses, HTTP error dan respons yang tidak mengonfirmasi penerimaan. Spec widget mencakup fallback tanpa token, satu inisialisasi pada navigasi SPA, launcher auth dan kegagalan SDK. Respons kontak dan SDK pada spec tersebut di-mock, tidak mengirim pesan ke orang lain. Ikuti prosedur `.agents/skills/e2e-dev-stack/SKILL.md`; Contact memerlukan organizer dev public yang dikonfigurasi melalui `E2E_COMMUNITY_ORGANIZER_ID`.

Percobaan type-check, Lingui extract/compile, build SSR client/server dan Playwright terblokir `MODULE_NOT_FOUND` karena executable dependency lokal tidak tersedia. Pemeriksaan tersebut perlu dijalankan pada lingkungan dengan dependency lengkap. `git diff --check`, referensi class CSS dan keberadaan pesan UI baru di 22 katalog telah diperiksa. Tidak ada hasil visual, E2E atau integrasi SDK nyata yang diklaim lulus.

Token/inbox/operator Chatwoot nyata belum tersedia pada sesi ini: pengiriman dan balasan live end-to-end terblokir konfigurasi eksternal.

## Deployment dan rollback

Tidak ada migrasi atau endpoint baru untuk Contact/widget. Build image baru lalu ganti hanya service app; pertahankan environment Nginx dan volume database/upload. Rollback dengan tag image lama. Penghapusan konfigurasi Chatwoot pada versi baru mengembalikan widget ke formulir kontak. Isi CMS dan pesan inbox tidak dihapus.
