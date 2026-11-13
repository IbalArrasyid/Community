# Implementasi awal website komunitas

Tanggal: 11 November 2026. Branch kerja: develop.

## Status

Perubahan ini menyediakan vertical slice CMS organizer → situs publik serta penyimpanan pesan kontak. Phase 1 dan Phase 2 belum dinyatakan selesai: pengujian backend, integrasi penuh, dan beberapa fitur lanjutan masih harus dituntaskan. Phase 3 DOKU belum diimplementasikan dan Stripe tetap aktif seperti semula.

Perubahan awal milik pengguna pada AGENTS.md, .gitignore, composer.json dan composer.lock di root dipertahankan.

## Audit lokal

| Area | Temuan |
| --- | --- |
| Versi | VERSION, backend/composer.json dan frontend/package.json: 2.0.0-rc.3; commit awal 2a3a5fe2. |
| Backend | Laravel ^13.0, PHP ^8.3; Dockerfile development menggunakan PHP 8.5. Alur Action → Handler → Repository/service dipertahankan. |
| Frontend | React ^19.2.7, React Router ^8.5.0, Mantine ^9.7.2, React Query 5, Lingui 4, Vite 5, TypeScript 6; SSR existing. |
| CMS existing | Homepage designer dan sections milik event/organizer tersedia. Belum ditemukan modul artikel/halaman editorial. Modul baru menggunakan Editor, media, SettingsPage, Modal dan izin existing; tidak menambahkan page builder visual kedua. |
| Routing | Root sebelumnya mengalihkan ke login/dashboard. URL /events/:organizerId/:organizerSlug, /event/:eventId/:eventSlug, /e/*, /checkout/*, /manage/* dan tiket dipertahankan. |
| Izin | Role ADMIN/SUPERADMIN mendapat seluruh Permission. ORGANIZER/VIEWER mendukung overrides dan scope organizer/event. Capability MANAGE_CONTENT ditambahkan melalui pola ini. |
| Media | ImageRepositoryInterface, upload ORGANIZER_GALLERY, validasi MIME/ukuran/dimensi existing, HtmlPurifierService, dan UserGeneratedContent digunakan kembali. |
| Pembayaran | PaymentProviders mencakup STRIPE dan OFFLINE. Checkout, payment link, refund, webhook, Connect onboarding, application fees, rekonsiliasi payout dan UI Stripe memiliki ketergantungan nyata. Audit pembayaran terperinci belum selesai. |
| Lisensi | Tidak ada perubahan pada ee/, vendor, atau lisensi. PoweredByFooter digunakan pada halaman publik baru. |

## Cakupan implementasi

- Konten PAGE/ARTICLE per organizer: judul, slug, ringkasan, rich text, cover upload, status draft/published, waktu publikasi, SEO title dan description.
- Halaman home, about dan contact memakai slug khusus dengan tipe PAGE. Halaman tambahan dapat dibuka melalui /pages/:slug; artikel melalui /articles/:slug.
- CMS di /manage/organizer/:organizerId/community, dengan navigasi Website content.
- Preview lokal dalam iframe sandbox kosong, tidak melalui URL draft publik.
- Capability MANAGE_CONTENT diwajibkan di backend untuk seluruh operasi CMS/inbox; parent organizer diotorisasi sebelum akses child. Organizer draft atau PASSWORD_PROTECTED tidak ditampilkan oleh endpoint situs komunitas.
- Admin dapat memberi capability tersebut pada anggota ORGANIZER dalam layar tim existing. Untuk editor tanpa akses keuangan, matikan VIEW_FINANCIALS/ISSUE_REFUNDS dan batasi scope ke organizer yang sesuai. Hak event yang sudah melekat pada role ORGANIZER tetap berlaku; ini belum merupakan role khusus CMS saja.
- Situs publik: /, /about, /contact, /events, /articles, /articles/:slug dan /pages/:slug.
- Loader SSR memakai React Query per request dan route handle.styles. Metadata/canonical berasal dari CMS dengan fallback organizer.
- Hero dan introduction berasal dari PAGE home; nama dan cover organizer digunakan sebagai fallback. Event listing memakai GetPublicEventsHandler existing dengan authenticatedAccountId null, sehingga hak preview staf tidak memperluas daftar publik.
- Homepage menampilkan empat event mendatang dan tiga artikel terbaru. Kurasi featured event secara manual belum disediakan.
- Kontak: validasi server/client, PersonNameRule, honeypot, throttle bernama 5 permintaan per 60 menit per IP, persistensi, inbox privat dan penanda dibaca idempotent.
- Pesan kontak dirender sebagai teks. Tidak ada alamat IP atau payload kontak yang ditambahkan ke log.
- Seluruh teks UI baru ditambahkan ke 22 katalog bahasa existing. Bahasa Indonesia belum diaktifkan karena bukan locale aktif pada checkout ini.

## Migrasi dan arsitektur penyimpanan

Migrasi additive: backend/database/migrations/2026_11_11_000001_create_community_content_tables.php.

Tabel baru:
- community_contents: foreign key organizer/media, keunikan organizer+type+slug dan indeks publikasi.
- community_contact_submissions: pesan kontak dan read_at, dibatasi organizer.

Repository baru menggunakan query builder dan DTO turunan BaseDataObject. Tidak ada domain object generated yang diedit manual. Tidak ada data event/order yang diduplikasi.

Migrasi belum dijalankan pada database mana pun. Jangan menjalankannya pada production sebelum pengujian lokal dan review.

## Menjalankan secara lokal

1. Pulihkan Docker Desktop terlebih dahulu bila engine mengembalikan filesystem read-only. Jangan melakukan reset atau menghapus volume berisi data.
2. Ikuti konfigurasi development existing dan jalankan stack dari docker/development menggunakan start-dev.sh. Pastikan lingkungan dan database adalah development/test.
3. Pasang dependency backend sesuai composer.lock dan dependency frontend sesuai yarn.lock.
4. Buat organizer melalui UI existing, publikasikan, dan pastikan visibilitas homepage PUBLIC (bukan PASSWORD_PROTECTED). Atur COMMUNITY_ORGANIZER_ID pada environment backend lokal ke id organizer tersebut. Placeholder ada di backend/.env.example.
5. Dari docker/development, jalankan hanya pada database development:

~~~bash
docker compose -f docker-compose.dev.yml exec backend php artisan migrate
docker compose -f docker-compose.dev.yml exec backend php artisan generate-domain-objects
~~~

6. Login sebagai admin. Buka /manage/organizer/<id>/community. Buat PAGE home, about dan contact, lalu publikasikan; isi body contact dengan detail kontak yang boleh tampil ke publik.
7. Buat ARTICLE draft dan published. Pastikan draft/future tidak muncul di /articles maupun endpoint publik.
8. Buka semua halaman publik tanpa login; ikuti tautan event hingga checkout existing.
9. Kirim pesan kontak, lalu buka tab Inbox dan tandai sebagai dibaca. Pesan diterima berarti sudah disimpan di inbox, bukan berarti email telah dikirim.

## Verifikasi yang masih diperlukan di dev stack

~~~bash
cd frontend
yarn messages:extract --clean
yarn messages:compile
npx tsc --noEmit
yarn build:ssr:client
yarn build:ssr:server

cd ../docker/development
docker compose -f docker-compose.dev.yml exec backend ./vendor/bin/pint --test
docker compose -f docker-compose.dev.yml exec -T backend php -d memory_limit=1G vendor/bin/phpunit --no-coverage --testsuite=Unit
docker compose -f docker-compose.dev.yml exec -T backend php -d memory_limit=1G vendor/bin/phpunit --no-coverage --filter=Community
docker compose -f docker-compose.dev.yml exec -T backend php -d memory_limit=1G vendor/bin/phpunit --no-coverage --testsuite=Feature
docker compose -f docker-compose.dev.yml exec backend php artisan scramble:analyze
docker compose -f docker-compose.dev.yml exec backend php artisan api-reference:export
~~~

Database pengujian harus hievents_test. Jangan menargetkan database production.

Smoke test baca tanpa token:
~~~bash
curl -sk -H "Accept: application/json" https://localhost:8443/api/public/community
curl -sk -H "Accept: application/json" https://localhost:8443/api/public/community/content/PAGE/about
curl -sk -H "Accept: application/json" "https://localhost:8443/api/public/community/content?type=ARTICLE"
~~~

Jalankan E2E dengan prosedur skill e2e-dev-stack:
~~~bash
cd e2e
E2E_BASE_URL=https://localhost:8443 MAILPIT_URL=http://localhost:8025 E2E_SAAS_MODE=true npx playwright test tests/organizers/community-cms.spec.ts
~~~

Spec E2E mencakup create draft, preview iframe dan publish melalui UI. Feature tests mencakup sanitasi, draft/future, unpublish, unique slug, capability, isolasi child/media, inbox dan validasi kontak. Keberadaan tes bukan bukti tes sudah lulus; lihat hasil aktual di bagian verifikasi.

## Rencana DOKU berikutnya

Audit awal menemukan Stripe Connect per organizer dan payment intent dengan stripe_account serta application_fee_amount. Ini bukan arsitektur settlement satu merchant. Rancangan merchant DOKU terpusat hanya asumsi sementara yang harus disepakati bersama model settlement; tidak ada automatic split/payout organizer yang diimplementasikan atau dijanjikan.

Lokasi utama untuk audit lanjutan:
- backend/app/Services/Application/Handlers/Order/Payment/Stripe/
- backend/app/Services/Domain/Payment/Stripe/
- backend/app/Services/Application/Handlers/Organizer/Payment/Stripe/
- backend/app/Services/Domain/Order/
- backend/app/Http/Actions/Common/Webhooks/StripeIncomingWebhookAction.php
- backend/app/DomainObjects/Enums/PaymentProviders.php
- backend/app/DomainObjects/Status/OrderPaymentStatus.php
- backend/app/Repository/Eloquent/StripePaymentsRepository.php
- backend/app/Repository/Eloquent/StripePayoutsRepository.php
- frontend/src/components/routes/product-widget/Payment/
- frontend/src/components/forms/StripeCheckoutForm/
- frontend/src/components/routes/organizer/Payments/
- backend/app/Services/Infrastructure/Stripe/StripeConfigurationService.php dan backend/config/services.php.

Dokumentasi resmi yang diperiksa:
- [DOKU Checkout backend integration](https://developers.doku.com/accept-payments/doku-checkout/integration-guide/backend-integration): hosted payment.url, endpoint sandbox /checkout/v1/payment, amount IDR tanpa desimal, request id unik dan header signature.
- [Pengaturan payment notification](https://docs.doku.com/get-started/manage-business/set-up-integration/webhook-payment-notification): endpoint notifikasi diatur sesuai metode pembayaran merchant.

Sebelum implementasi: audit refund/fee/tax/payout dan issuance/expiration existing sampai tuntas, verifikasi spesifikasi signature/callback untuk API merchant yang dipakai, lalu buat adapter yang benar-benar tersambung dengan checkout dan lifecycle existing. Uji currency non-IDR, concurrency, replay, callback berulang/tidak valid, pembayaran terlambat, refund dan inventory release menggunakan mock serta sandbox nyata. Redirect browser tidak boleh mengubah order menjadi paid.

Tidak ada konfigurasi atau secret DOKU yang ditambahkan; tidak ada integrasi sandbox/live yang diklaim berhasil. Phase 3 ditunda sampai vertical slice dan pengujian fondasi ini dituntaskan.

## TODO dan batasan

- Jalankan Unit/Feature suite, smoke API, E2E nyata, generator domain dan export OpenAPI setelah lingkungan backend pulih. OpenAPI generated belum diperbarui secara manual.
- Notifikasi email kontak opsional belum diimplementasikan. Saat ini sumber pesan adalah inbox database.
- Kurasi featured events, pemilihan ulang media existing, kategori/tag, navigasi halaman custom dan sitemap CMS belum disediakan.
- Tetapkan model editor CMS khusus bila hak EDIT pada event tidak diinginkan.
- Lanjutkan audit dan implementasi DOKU terpisah setelah fondasi terverifikasi.
- Lengkapi regresi free ticket, attendee/check-in, email dan Stripe checkout sebelum deployment.

## Rollback

Rollback aplikasi paling aman adalah mengembalikan file kode ke versi sebelum perubahan, membiarkan tabel baru tetap ada, dan menghapus binding COMMUNITY_ORGANIZER_ID pada environment development yang diatur untuk fitur ini.

down() migrasi menjatuhkan kedua tabel dan menghapus konten/pesan. Jangan jalankan rollback schema pada database berisi data penting tanpa backup dan persetujuan eksplisit. Perubahan ini tidak memigrasikan atau mengubah data pembayaran/event existing.

## Hasil verifikasi aktual

| Pemeriksaan | Hasil |
| --- | --- |
| git status dan audit versi/routing/izin | Dijalankan pada develop; perubahan awal pengguna dipertahankan. |
| php -l untuk 34 file PHP baru/berubah | Lulus. Dua repository diperiksa ulang setelah penegasan respons 404. Pemeriksaan ini hanya sintaks, bukan pengujian Laravel. |
| TypeScript transpileModule untuk 12 file TS/TSX baru/berubah | Lulus tanpa diagnostic sintaks. Ini bukan semantic type-check. |
| Lingui extract --clean | Lulus; 5.308 pesan per katalog. Teks baru lengkap untuk seluruh locale. |
| Pemeriksaan PO untuk 28 teks baru × 22 locale | Lulus; tidak ada terjemahan baru yang kosong. |
| Lingui compile | Lulus; 22 katalog JavaScript generated diperbarui. |
| ESLint default pada enam file frontend baru | Gagal karena rule lingui/no-unlocalized-strings crash di lingkungan pemeriksaan ini. |
| ESLint enam file yang sama dengan hanya rule tersebut dimatikan lewat CLI | Lulus, 0 error dan 0 warning. Konfigurasi ESLint repo tidak diubah. |
| tsc --noEmit | Gagal: dependency aplikasi penuh belum terpasang, termasuk Mantine, Axios, React Query dan tipe React. Tidak ada klaim bahwa type-check penuh sudah lulus. |
| npm run build:ssr:client | Gagal: executable vite tidak tersedia dari instalasi aplikasi yang belum selesai. Build SSR server belum dijalankan. |
| Docker compose ps | Tidak ada layanan project development berjalan. |
| Docker compose build backend | Gagal: filesystem internal Docker/containerd read-only. PHP lokal 8.2.12, sedangkan repo membutuhkan PHP ^8.3. |
| Smoke GET https://localhost:8443/api/public/community | Tidak terhubung, HTTP 000. |
| Pint, PHPUnit Unit/Feature, scramble:analyze, api-reference:export, generator domain | Belum dijalankan; backend/vendor belum tersedia dan backend compatible belum dapat dijalankan. OpenAPI generated belum berubah. |
| E2E nyata, regresi checkout/check-in/email, pemeriksaan browser/screenshot | Belum dijalankan karena aplikasi penuh belum dapat dijalankan. Tidak ada hasil mock yang diklaim sebagai keberhasilan integrasi. |
| git diff --check | Lulus. |

Katalog Rusia memiliki 3.246 pesan lama tanpa terjemahan, sama dengan snapshot sebelum ekstraksi. Semua 28 pesan baru sudah diterjemahkan, termasuk dalam bahasa Rusia. Kekurangan terjemahan lama tersebut berada di luar perubahan ini.

Alat pemeriksaan minimal menggunakan Node 24.22.1 pada direktori kerja sementara, tanpa mengubah package.json atau yarn.lock proyek. Instalasi dependency penuh dicoba dengan npm install --ignore-scripts --package-lock=false --legacy-peer-deps. Hambatan yang ditemukan: rantai TLS registry (koneksi berhasil setelah memakai --use-system-ca), ENOSPC pada percobaan lokal, dan timeout registry pada percobaan penuh berikutnya. Direktori instalasi lokal yang gagal dibersihkan; junction node_modules sementara dilepas kembali. Dependency aplikasi tetap harus dipasang sesuai lockfile sebelum type-check/build penuh.

Perintah pemeriksaan yang benar-benar dijalankan dari frontend, dengan node menunjuk ke runtime kompatibel:

~~~bash
node node_modules/typescript/bin/tsc --noEmit
node node_modules/@lingui/cli/dist/lingui.js extract --clean
node node_modules/@lingui/cli/dist/lingui.js compile
node node_modules/eslint/bin/eslint.js src/api/community.client.ts src/queries/useCommunity.ts src/mutations/useCommunityMutations.ts src/routeLoaders/communityRouteLoader.ts src/components/routes/community/index.tsx src/components/routes/organizer/CommunityContent/index.tsx --max-warnings 0
node node_modules/eslint/bin/eslint.js src/api/community.client.ts src/queries/useCommunity.ts src/mutations/useCommunityMutations.ts src/routeLoaders/communityRouteLoader.ts src/components/routes/community/index.tsx src/components/routes/organizer/CommunityContent/index.tsx --max-warnings 0 --rule 'lingui/no-unlocalized-strings:off'
npm run build:ssr:client
~~~

Pemeriksaan sintaks TypeScript dan kelengkapan PO dijalankan dengan script verifikasi sementara menggunakan compiler TypeScript dan parser PO. Script tersebut bukan bagian dari aplikasi atau pengganti Unit/Feature/E2E.

Tidak ada migrasi, perubahan database production, aktivasi pembayaran DOKU, atau penghapusan Stripe yang dijalankan.

## Daftar file perubahan

Daftar ini tidak memasukkan perubahan awal pengguna di root. Sebanyak 94 file, termasuk 22 PO dan 22 JavaScript katalog hasil kompilasi.

- backend/.env.example
- backend/app/DomainObjects/Enums/CommunityContentType.php
- backend/app/DomainObjects/Enums/Permission.php
- backend/app/DomainObjects/Status/CommunityContentStatus.php
- backend/app/Http/Actions/Community/CreateCommunityContentAction.php
- backend/app/Http/Actions/Community/GetCommunityContactsAction.php
- backend/app/Http/Actions/Community/GetCommunityContentAction.php
- backend/app/Http/Actions/Community/GetCommunityContentsAction.php
- backend/app/Http/Actions/Community/MarkCommunityContactReadAction.php
- backend/app/Http/Actions/Community/Public/CreateCommunityContactPublicAction.php
- backend/app/Http/Actions/Community/Public/GetCommunityContentPublicAction.php
- backend/app/Http/Actions/Community/Public/GetCommunityContentsPublicAction.php
- backend/app/Http/Actions/Community/Public/GetCommunityEventsPublicAction.php
- backend/app/Http/Actions/Community/Public/GetCommunityPublicAction.php
- backend/app/Http/Actions/Community/UpdateCommunityContentAction.php
- backend/app/Http/Request/Community/CreateCommunityContactRequest.php
- backend/app/Http/Request/Community/SaveCommunityContentRequest.php
- backend/app/Repository/Eloquent/CommunityContactRepository.php
- backend/app/Repository/Eloquent/CommunityContentRepository.php
- backend/app/Resources/Community/CommunityContactResource.php
- backend/app/Resources/Community/CommunityContentPublicResource.php
- backend/app/Resources/Community/CommunityContentResource.php
- backend/app/Services/Application/Handlers/Community/CommunityContactHandler.php
- backend/app/Services/Application/Handlers/Community/DTO/CommunityContactData.php
- backend/app/Services/Application/Handlers/Community/DTO/CommunityContentData.php
- backend/app/Services/Application/Handlers/Community/GetCommunityContentHandler.php
- backend/app/Services/Application/Handlers/Community/GetCommunityOrganizerHandler.php
- backend/app/Services/Application/Handlers/Community/SaveCommunityContentHandler.php
- backend/config/community.php
- backend/database/migrations/2026_11_11_000001_create_community_content_tables.php
- backend/docs/community-implementation.md
- backend/routes/api.php
- backend/routes/community.php
- backend/tests/Feature/Http/Community/CommunityContactTest.php
- backend/tests/Feature/Http/Community/CommunityContentTest.php
- backend/tests/Unit/Services/Application/Handlers/Community/SaveCommunityContentHandlerTest.php
- e2e/pages/community.page.ts
- e2e/tests/organizers/community-cms.spec.ts
- frontend/src/api/community.client.ts
- frontend/src/components/common/TeamAccessFields/index.tsx
- frontend/src/components/layouts/OrganizerLayout/index.tsx
- frontend/src/components/routes/community/Community.module.scss
- frontend/src/components/routes/community/index.tsx
- frontend/src/components/routes/organizer/CommunityContent/CommunityContent.module.scss
- frontend/src/components/routes/organizer/CommunityContent/index.tsx
- frontend/src/locales/cs.js
- frontend/src/locales/cs.po
- frontend/src/locales/de.js
- frontend/src/locales/de.po
- frontend/src/locales/el.js
- frontend/src/locales/el.po
- frontend/src/locales/en.js
- frontend/src/locales/en.po
- frontend/src/locales/es.js
- frontend/src/locales/es.po
- frontend/src/locales/fi.js
- frontend/src/locales/fi.po
- frontend/src/locales/fr.js
- frontend/src/locales/fr.po
- frontend/src/locales/hu.js
- frontend/src/locales/hu.po
- frontend/src/locales/it.js
- frontend/src/locales/it.po
- frontend/src/locales/ja.js
- frontend/src/locales/ja.po
- frontend/src/locales/ko.js
- frontend/src/locales/ko.po
- frontend/src/locales/nl.js
- frontend/src/locales/nl.po
- frontend/src/locales/pl.js
- frontend/src/locales/pl.po
- frontend/src/locales/pt-br.js
- frontend/src/locales/pt-br.po
- frontend/src/locales/pt.js
- frontend/src/locales/pt.po
- frontend/src/locales/ru.js
- frontend/src/locales/ru.po
- frontend/src/locales/se.js
- frontend/src/locales/se.po
- frontend/src/locales/sk.js
- frontend/src/locales/sk.po
- frontend/src/locales/tr.js
- frontend/src/locales/tr.po
- frontend/src/locales/vi.js
- frontend/src/locales/vi.po
- frontend/src/locales/zh-cn.js
- frontend/src/locales/zh-cn.po
- frontend/src/locales/zh-hk.js
- frontend/src/locales/zh-hk.po
- frontend/src/mutations/useCommunityMutations.ts
- frontend/src/queries/useCommunity.ts
- frontend/src/routeLoaders/communityRouteLoader.ts
- frontend/src/router.tsx
- frontend/src/types.ts
