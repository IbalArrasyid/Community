# Artikel dan panduan Barter Up

## Perubahan

`/articles` menampilkan hero, pencarian judul/ringkasan seluruh artikel published, urutan terbaru/terlama, artikel terbaru berukuran besar pada halaman pertama tanpa filter, grid responsif, total hasil aktual, pagination dan empty state. Artikel yang sudah menjadi featured tidak diulang dalam grid halaman yang sama. Tanpa cover, tampil ilustrasi ikon lokal; tidak mengambil foto event atau penulis fiktif.

`/articles/:slug` menampilkan breadcrumb, judul, tanggal publikasi, ringkasan, cover, isi rich text dan tautan kembali. Metadata SEO dan canonical tetap mengikuti mekanisme route existing. Halaman hasil pencarian memakai `noindex, follow`. Tanggal ditampilkan dalam Bahasa Indonesia dengan zona UTC agar hasil SSR dan browser konsisten.

Header listing dapat disunting melalui CMS dengan membuat PAGE published berslug `articles`. Judul yang disarankan: **Artikel & Panduan Komunitas**. Summary: **Temukan cerita, ide, dan panduan praktis untuk merancang kegiatan komunitas, menyiapkan peserta, serta membangun kolaborasi yang bermakna bersama Barter Up.** Body PAGE opsional ditampilkan sebagai konten editorial tambahan. Artikel individual tetap dibuat sebagai ARTICLE dengan slug masing-masing.

Tidak ada migrasi. Tidak ada perubahan pembayaran, order, check-in, lisensi, atau konfigurasi production. Atribusi Hi.Events dipertahankan. Kategori, metrik pembaca, penulis, durasi baca, rekomendasi redaksi, toolkit dan langganan newsletter belum memiliki sumber data/layanan di CMS ini dan tidak dipasang sebagai kontrol palsu.

## Kontrak API additive

Endpoint existing `GET /public/community/content` tetap menerima `type` dan `page`. Dua query opsional ditambahkan:

| Parameter | Nilai | Default |
| --- | --- | --- |
| `q` | Teks maksimal 200 karakter, dicari pada judul dan ringkasan | kosong |
| `sort` | `newest` atau `oldest` | `newest` |

Respons tidak berubah. Ukuran halaman tetap 12. Pencarian menggunakan parameter binding, pencocokan tanpa membedakan kapital di PostgreSQL dan escape wildcard LIKE. Scope organizer, tipe, status published serta waktu publikasi tetap berlaku, termasuk saat staf login. Urutan memakai tanggal publikasi dan id sebagai pemutus seri. Query cache frontend memasukkan halaman, pencarian dan sort, serta tetap memakai client SSR per request.

## Verifikasi

- Feature tests ditambahkan untuk pencarian judul/ringkasan tanpa membedakan kapital, draft/future, tipe PAGE/ARTICLE, isolasi organizer, pagination, tie-break sort, wildcard literal, hasil kosong dan validasi input.
- Unit tests menguji default existing dan penerusan parameter filter ke repository dalam isolasi.
- E2E listing menguji pencarian kosong, reset, sort, viewport 390px, atribusi. Spec detail membuka artikel published dan memeriksa judul, canonical, metadata article serta navigasi kembali. Memerlukan community development PUBLIC dengan `E2E_COMMUNITY_ORGANIZER_ID` dan minimal satu artikel untuk spec detail; tidak membuat data atau mengubah konten staging.

Jalankan pemeriksaan berikut pada dev stack sesuai `.agents/skills/api-smoke-test/SKILL.md` dan `.agents/skills/e2e-dev-stack/SKILL.md`:

```bash
cd docker/development
docker compose -f docker-compose.dev.yml exec backend ./vendor/bin/pint --test
docker compose -f docker-compose.dev.yml exec -T backend php -d memory_limit=1G vendor/bin/phpunit --no-coverage --testsuite=Unit
docker compose -f docker-compose.dev.yml exec -T backend php -d memory_limit=1G vendor/bin/phpunit --no-coverage --testsuite=Feature
docker compose -f docker-compose.dev.yml exec backend php artisan scramble:analyze
docker compose -f docker-compose.dev.yml exec backend php artisan api-reference:export
```

Generated OpenAPI tidak boleh diedit manual. Periksa diff hasil export sebelum commit/deployment. Smoke-test lokal dengan `Accept: application/json`:

```bash
curl -sk -H 'Accept: application/json' 'https://localhost:8443/api/public/community/content?type=ARTICLE&q=workshop&sort=oldest&page=1'
```

Frontend: `yarn messages:extract --clean`, `yarn messages:compile`, `npx tsc --noEmit`, `yarn build:ssr:client`, `yarn build:ssr:server`. Lima pesan baru diterjemahkan ke 22 katalog. Jalankan E2E dari `e2e` pada dev stack dengan `E2E_BASE_URL=https://localhost:8443 E2E_COMMUNITY_ORGANIZER_ID=<id> npx playwright test tests/organizers/community-articles.spec.ts`.

Keberadaan tes bukan bukti lulus. Hasil aktual dan blocker dilaporkan pada respons implementasi.

Hasil lokal: `php -l` lulus pada lima file PHP baru/berubah. Unit suite, Feature suite dan Pint terblokir karena PHP lokal 8.2.12 sedangkan tool membutuhkan minimal 8.3. `api-reference:export` dan `scramble:analyze` terblokir ketika memuat dependency dengan sintaks PHP yang lebih baru. OpenAPI belum diregenerasi dan harus diselesaikan pada dev stack. Type-check, Lingui extract/compile, build SSR serta Playwright terblokir executable dependency yang tidak tersedia (`MODULE_NOT_FOUND`). Smoke API lokal gagal terhubung ke port 8443. Tidak ada tes fungsional atau visual yang diklaim lulus.

## Deploy dan rollback

Build image dengan tag commit baru, lalu ubah hanya referensi image service `app` setelah build sukses. Pertahankan image lama dan volume data. Tidak perlu rollback schema. Rollback image mengembalikan tampilan dan pencarian sebelumnya; konten CMS tetap tersimpan.
