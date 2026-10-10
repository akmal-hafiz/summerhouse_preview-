# 06 - Arsitektur dan Deployment Aktual

Updated: 2026-09-22

## Arsitektur aplikasi

| Komponen | Implementasi aktual | Batas keamanan dan data |
|---|---|---|
| Browser | Next.js App Router menampilkan halaman publik dan dashboard pelanggan. | Token Sanctum tidak diberikan ke JavaScript browser. Next.js menyimpannya dalam cookie HttpOnly dan meneruskan request melalui route session yang dibatasi allowlist method/path, origin dan CSRF. Data saved villa milik guest tetap lokal sampai pengguna login. |
| Next.js | Next.js 16.3.5 dan React 19. Server components mengambil CMS dan Lodgify; route handlers menangani session, availability, rate quote dan search options. | Secret Lodgify dan endpoint CMS server-only tidak memakai prefix `NEXT_PUBLIC_`. Request Lodgify memakai timeout, retry terbatas, concurrency limit, circuit breaker, log redaction dan fallback last-known-good. |
| Laravel API/CMS | Laravel 13.32.0, Sanctum 4.3.3 dan Filament 3.3.55. | Public CORS hanya untuk CMS GET yang memang publik. Endpoint customer membutuhkan autentikasi dan ownership. Filament membutuhkan role admin. OTP sekali pakai, memiliki expiry dan rate limit. |
| Database | MySQL production direncanakan; SQLite in-memory hanya untuk test. | Menyimpan CMS, review, wishlist, cache villa, sync run, incident, property event append-only dan internal notification. Property tidak langsung dihapus ketika hilang dari Lodgify. |
| Lodgify | Next.js memakai data live untuk pencarian booking. Laravel menjalankan reconciliation terjadwal dan menyimpan snapshot kesehatan. | Status dipisahkan menjadi active, inactive dan missing. Availability dipisahkan menjadi available, unavailable dan unknown. Anomali penurunan jumlah, partial pagination dan kegagalan rooms tidak boleh mempromosikan snapshot rusak. |
| Queue dan scheduler | Database queue. Scheduler mendaftarkan sync dan health tiap lima menit serta pruning harian. | Shared lock mencegah sync overlap. Worker Lodgify, media dan default perlu diawasi oleh process manager pada server. |
| Media | Upload masuk private staging, divalidasi, diproses oleh queue, dibatasi dimensi/pixel, dikonversi WebP lalu dipublikasikan. | Konten lama tetap menjadi fallback sampai seluruh batch baru siap. Storage production harus persisten dan tidak ikut ditimpa release. |
| Observability | Structured application log, sync run, incident, property event append-only, Filament Lodgify Health dan internal database notification. | Credential dan PII disensor. Satu timeout hanya warning; auth failure, stale snapshot dan anomali berulang menaikkan severity. Tidak bergantung pada layanan monitoring berbayar. |

## Aliran data

1. Browser mengakses Next.js melalui HTTPS.
2. Next.js mengambil konten publik dari Laravel dan data booking dari Lodgify.
3. Operasi akun masuk melalui route session Next.js, kemudian diteruskan ke Laravel dengan token HttpOnly server-side.
4. Filament menulis konten langsung ke model Laravel/MySQL dan invalidasi cache editorial berlaku segera.
5. Hanya snapshot Lodgify, Stay Styles dan Signature Villa yang boleh memakai cache lima menit.
6. Scheduler Laravel merekonsiliasi katalog Lodgify. Snapshot publik hanya dipromosikan setelah katalog lengkap lolos validasi.

## Rancangan deployment Dewaweb

Target yang disetujui adalah Dewaweb Cloud Hosting Warrior dengan 2 CPU, 2 GB memory, 15 GB NVMe dan 10 MB/s disk I/O. Topologi satu host layak untuk traffic awal bila Dewaweb mengonfirmasi semua kemampuan berikut:

- Node.js 22 dapat berjalan sebagai proses persisten dan direstart secara terkontrol.
- PHP 8.4 tersedia untuk FPM dan CLI.
- Document root Laravel dapat diarahkan ke `backend/public`.
- SSH/SFTP, symlink, cron satu menit dan proses queue persisten tersedia.
- MySQL, storage upload persisten dan outbound HTTPS tersedia.
- Reverse proxy dapat mengarahkan traffic frontend ke Node tanpa membuka port origin ke publik.

Jika worker persisten atau Node runtime tidak tersedia, frontend/worker harus dipindah ke layanan yang mendukung proses persisten. Paket hosting tidak boleh dipaksakan dengan menjalankan server dari terminal manual.

## Pipeline release

Build production dilakukan di GitHub Actions, bukan di server Dewaweb. Ini menghemat CPU/RAM hosting, menghasilkan artifact yang sama untuk setiap deploy dan memastikan hanya commit yang sudah lolos test yang dapat dirilis.

Pipeline dibagi menjadi:

1. Regression gate pada push/pull request tanpa production secret.
2. Manual release candidate dari `master` yang menjalankan locked install, test, audit, standalone build, packaging, provenance manifest dan checksum.
3. Manual deploy dari run ID yang sudah disetujui. Checksum dan asal commit diperiksa sebelum protected production secrets tersedia.
4. Server mengekstrak release ke direktori versioned, menjalankan preflight dan migration additive, mengganti symlink `current` secara atomik, restart proses dan memeriksa HTTPS health endpoint.
5. Jika health gagal, symlink aplikasi kembali ke release sebelumnya. Migration tidak otomatis di-rollback agar audit history dan data baru tidak rusak.

Environment file dan upload tidak berada di artifact. Keduanya disimpan di direktori shared pada server. Script packaging gagal bila mendeteksi `.env` di dalam artifact.

## Status kesiapan

Kode, automated test, dependency audit, standalone packaging, checksum, provenance check, atomic switch dan application health check sudah tersedia. Status belum boleh disebut live atau production-ready penuh sebelum bukti eksternal berikut selesai:

- Konfirmasi kemampuan paket Dewaweb dan runtime version dari dalam proses aplikasi.
- Staging dengan salinan data production yang sudah disanitasi.
- Backup database/media dan uji restore terisolasi.
- Scheduler benar-benar berjalan tiap menit dan worker otomatis hidup kembali.
- SMTP, SPF/DKIM/DMARC dan inbox delivery ke alamat test yang diizinkan.
- DNS, TLS, reverse proxy, forwarding-header overwrite, firewall dan private origin.
- Smoke test serta observasi 30 menit dan review 24 jam setelah go-live.

Rincian operasional ada di [production release runbook](../operations/production-release-runbook.md).
