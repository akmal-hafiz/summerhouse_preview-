# 07 — Spesifikasi Perangkat Lunak dan Rekomendasi Hardware

## Spesifikasi perangkat lunak aktual

| No | Software/teknologi | Versi aktual | Fungsi | Sumber versi |
|---:|---|---|---|---|
| 1 | Node.js (runtime lokal) | `v22.19.0` | Menjalankan Next.js/npm | hasil `node --version` pada environment audit |
| 2 | npm (runtime lokal) | `11.6.4` | Manajemen paket frontend | hasil `npm --version` |
| 3 | Next.js | `16.2.7` | Frontend App Router dan route handler | `package-lock.json` / `npm list` |
| 4 | React | `19.2.3` | UI frontend | `package.json`, `package-lock.json` / `npm list` |
| 5 | React DOM | `19.2.3` | Renderer React browser/server | `package.json`, `package-lock.json` / `npm list` |
| 6 | TypeScript | `5.9.3` terpasang (`^5` dideklarasikan) | Type checking frontend | `package.json`, `package-lock.json` / `npm list` |
| 7 | PHP (runtime lokal) | `8.1.10` | Menjalankan Laravel/Filament | hasil `php --version`; `backend/composer.json` mensyaratkan `^8.1` |
| 8 | Laravel Framework | `10.50.2` | REST API, ORM, auth, cache | `backend/composer.lock` |
| 9 | Laravel Sanctum | `3.3.3` | Personal access token bearer | `backend/composer.lock` |
| 10 | Filament | `3.3.54` | CMS/admin panel | `backend/composer.lock` |
| 11 | Composer (runtime lokal) | `2.8.12` | Manajemen paket PHP | hasil `composer --version` |
| 12 | MySQL binary Laragon tersedia | `8.0.30` | Database backend lokal | direktori `C:/laragon/bin/mysql/mysql-8.0.30-winx64`; koneksi server belum diuji Tahap 1 |
| 13 | Vite backend asset tool | Constraint `^5.0.0` | Build asset Laravel | `backend/package.json` |
| 14 | Web/development server | `next dev --webpack`; `php artisan serve` | Server dev frontend/backend, masing-masing port 3000/8000 | `package.json`, `CLAUDE.md` |
| 15 | Git (runtime lokal) | `2.45.2.windows.1` | Version control | hasil `git --version` |
| 16 | Browser | Tidak dapat dibuktikan dari repository | Mengakses aplikasi | Tidak ada lock/config browser di source |

Tidak ditemukan `.nvmrc`, Dockerfile aplikasi, ataupun docker-compose project. Dockerfile yang ditemukan hanya milik dependency Laravel Sail di `backend/vendor/`, sehingga bukan bukti containerization project.

## Rekomendasi hardware (bukan fakta project)

| Target | CPU | RAM | Penyimpanan | Catatan |
|---|---|---:|---:|---|
| Development minimum | 4 core modern | 16 GB | 30 GB SSD bebas | Menjalankan Laragon/MySQL, PHP, Node, browser, dan dependency build secara bersamaan. |
| Production minimum usulan | 2 vCPU | 4 GB | 40 GB SSD | Cukup sebagai titik awal untuk Node SSR + PHP-FPM + MySQL pada trafik rendah; perlu monitoring. |
| Production yang lebih aman bila MySQL satu host | 4 vCPU | 8 GB | 80 GB SSD + backup | Memisahkan kapasitas proses Next, Laravel/Filament, cache file, upload, dan MySQL. |

Kapasitas akhir harus disesuaikan hasil traffic, ukuran media, jumlah villa, dan ketersediaan fitur Node runtime pada paket Dewaweb yang akan dipilih.
