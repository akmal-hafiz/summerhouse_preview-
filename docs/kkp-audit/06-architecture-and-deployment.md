# 06 — Arsitektur dan Deployment Aktual

## Arsitektur aktual berdasarkan source

| Komponen | Implementasi dan komunikasi | Status bukti |
|---|---|---|
| Browser/client | Next.js App Router merender halaman publik dan komponen client. Token Sanctum disimpan pada `localStorage`; wishlist pra-login juga pada `localStorage`. | Ditemukan di `app/`, `lib/auth-client.ts`, `components/villas/savedVillas.ts`. |
| Next.js frontend | Next.js 16 dengan React. Server components memanggil Lodgify dan CMS; route handlers melindungi availability/rate quote/search options dengan validasi/rate limit. | Ditemukan di root project, `app/api/`, `lib/lodgify/`, `lib/cms.ts`. |
| Laravel REST API | Laravel 10 menyajikan CMS read API, auth/OTP/password, wishlist, kontak, review dan testimoni. CORS saat ini `allowed_origins=['*']`, credentials false. | `backend/routes/api.php`, controller, `config/cors.php`. |
| Filament admin panel | Filament v3 pada path `/admin`, memakai session Laravel dan `User::canAccessPanel()` (role admin). Write CMS dilakukan melalui Livewire/Filament, bukan REST write API. | `AdminPanelProvider`, resources/pages Filament. |
| MySQL | Backend environment lokal menetapkan `DB_CONNECTION=mysql`; konfigurasi default MySQL menggunakan PDO `utf8mb4`. | `backend/.env` (nilai nonsecret diaudit), `config/database.php`. |
| Lodgify REST API v2 | Next.js memanggil Lodgify dengan API key server-only untuk villa/availability/rate; Laravel memiliki `LodgifyService` terpisah untuk mengisi `villa_caches` ketika Homepage Manager dimount. Checkout berada di Lodgify. | `lib/lodgify/client.ts`, `app/api/lodgify/*`, `backend/app/Services/LodgifyService.php`. |
| Autentikasi | Laravel Sanctum personal access token bearer; register dan reset password memakai OTP email melalui Resend. Tidak ada Google OAuth. | `AuthController`, `OtpController`, `PasswordResetController`, `User`. |
| Media | Default environment lokal `FILESYSTEM_DISK=local`; FileUpload CMS umumnya menarget disk `public` dan URL `/storage`. Konfigurasi S3 tersedia sebagai opsi, tetapi penggunaan aktif tidak terbukti. | `config/filesystems.php`, `MediaResource`, `HomepageManager`. |
| Cache | Laravel `CACHE_DRIVER=file` lokal; `CmsController` cache 300 detik dan model events menghapus key terkait. Next memakai `revalidate` umumnya 300 detik. | `backend/.env`, `CmsController`, models, `lib/cms.ts`. |
| Queue/email | Queue lokal `sync`; mailer lokal disetel `resend`. Tidak ada worker/scheduler aplikasi yang terdaftar. | `backend/.env`, `config/queue.php`, `app/Console/Kernel.php`. |

## Aliran data yang tervalidasi

1. Browser → Next.js untuk halaman dan route internal.
2. Next.js → Laravel REST API untuk konten CMS, autentikasi, wishlist, kontak, serta review.
3. Next.js → Lodgify REST API v2 untuk data villa, ketersediaan, dan harga; browser → Lodgify Checkout untuk booking final.
4. Filament admin → Laravel model/MySQL/filesystem; perubahan model menginvalidasi cache Laravel, kemudian Next mengambil data pada revalidasi berikutnya.

Catatan: invalidasi cache Laravel tidak secara eksplisit memanggil revalidation on-demand Next.js. Jadi “konten terbaru” pada frontend tunduk pada `revalidate` Next.js (umumnya hingga 300 detik), selain cache Laravel yang dihapus.

## Environment dan deployment

| Lingkungan | Fakta yang ditemukan | Kesimpulan audit |
|---|---|---|
| Development saat ini | `backend/.env`: `APP_ENV=local`, `APP_DEBUG=true`, MySQL, file cache, local filesystem, queue sync, mailer Resend. `CLAUDE.md` menyebut `npm run dev` port 3000 dan `php artisan serve` port 8000; Laragon dipakai lokal. | Terbukti untuk development lokal. |
| Production aktif | Root memiliki `.env.production` dan backend memiliki `.env.production`, tetapi tidak ditemukan konfigurasi host, `vercel.json`, Dockerfile project, docker-compose, Procfile, pipeline CI/CD, atau dokumentasi deployment aktif. README hanya template Next.js yang menyebut Vercel. | Tidak ada bukti deployment produksi aktif maupun provider produksi. Jangan menulis Vercel atau Dewaweb sebagai layanan aktif. |
| Production direncanakan | Pemilik project menyatakan targetnya **Dewaweb Cloud Hosting**, dilaksanakan setelah sidang (sekitar 1–2 bulan). | Ini rencana pemilik, bukan fakta source code. |

## Evaluasi rancangan Dewaweb Cloud Hosting

1. Secara logis, Next.js frontend, Laravel REST API + Filament, dan MySQL dapat berada dalam satu lingkungan Cloud Hosting **bila** paket menyediakan Node.js persistent runtime/reverse proxy, PHP 8.1+, MySQL, cron, dan akses writable untuk Laravel storage.
2. Karena Next.js membutuhkan proses `next start` untuk SSR/route handlers, model static hosting saja tidak cukup. Jika Dewaweb package tidak mendukung Node runtime kontinu, frontend perlu dipisahkan secara logis ke Node-capable service; Laravel/MySQL tetap dapat berada pada hosting PHP.
3. Lodgify REST API v2 harus tetap di luar node Dewaweb sebagai external service. Resend juga external service.
4. Karena tidak ada konfigurasi Dewaweb di repository, topologi ini adalah **rekomendasi teknis untuk Tahap 2**, bukan deployment yang telah diterapkan.

## Blueprint deployment Tahap 2

[Deployment Diagram Rancangan Sistem Summerhouses](diagrams/09-deployment-planned.puml) menggunakan note **“Planned Production Environment / Rencana Lingkungan Produksi”** pada node Dewaweb. Diagram ini adalah rancangan target; tidak mengklaim situs telah live di Dewaweb.
