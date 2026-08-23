# Black Box Testing Final Prototipe Website Summerhouses

## 1. Lingkungan Pengujian

Black Box Testing final dilaksanakan pada 20 Juli 2026 pukul 19:01 sampai 19:13 dengan zona waktu +07:00. Objek pengujian adalah prototipe website Summerhouses pada lingkungan lokal. Frontend dijalankan menggunakan Next.js 16.2.7 melalui `npm run dev` pada `http://localhost:3000`. Backend dijalankan menggunakan Laravel 10 dan Filament 3.3.54 melalui `php artisan serve` pada `http://127.0.0.1:8000`. Database yang digunakan adalah MySQL 8.0.30 dari Laragon pada `127.0.0.1:3306`.

Dependency frontend telah tersedia di `node_modules`. Pemeriksaan `npm ls --depth=0` berhasil membaca seluruh dependency proyek, walaupun terdapat satu dependency ekstraneous, yaitu `@emnapi/runtime@1.8.1`. Pemeriksaan `composer check-platform-reqs` berhasil untuk seluruh persyaratan platform. Pemeriksaan `php artisan migrate:status` menunjukkan seluruh 32 migration berstatus `Ran`.

Frontend, backend, dan MySQL dijalankan sebagai proses lokal terpisah. Bukti browser dibuat menggunakan Playwright CLI. Log runtime disimpan dalam `output/black-box-final/frontend.log`, `frontend-error.log`, `laravel.log`, `laravel-error.log`, `mysql.stdout.log`, dan `mysql.stderr.log`.

### Ringkasan audit fungsi yang tersedia

Audit dilakukan terhadap `package.json`, `composer.json`, route Next.js, route Laravel, controller, service, model, middleware, migration, komponen frontend, konfigurasi Filament, serta dokumen pengujian sebelumnya.

- Fitur yang tersedia meliputi pencarian dan detail villa, filter lokasi dan tamu, availability Lodgify, rate quote Lodgify, autentikasi OTP, login berbasis Sanctum, wishlist server, wishlist lokal browser, formulir kontak, review tamu, testimonial pemilik villa, CMS publik, dan panel admin Filament.
- Route Google OAuth, dependency Socialite, dan implementasi OAuth Google tidak ditemukan. Fitur ini tidak dinyatakan tersedia atau berhasil.
- Login valid, wishlist server, dan sinkronisasi dua konteks browser memerlukan akun QA dengan kredensial yang diketahui.
- Registrasi dan verifikasi OTP end-to-end memerlukan mailbox QA yang dikendalikan. Pengiriman OTP menggunakan mailer Resend.
- Akses non-admin dan CRUD Filament memerlukan akun user QA serta admin QA. Model `User::canAccessPanel()` hanya mengizinkan user dengan `role` bernilai `admin`.
- Pembukaan checkout Lodgify dapat mengarah ke proses reservasi eksternal. Pengujian dibatasi pada pembentukan URL.
- Pembukaan tautan WhatsApp dapat menghasilkan komunikasi eksternal. Pengujian dibatasi pada pembentukan URL dan parameter pesan.
- Endpoint contact hanya membuat record `contact_submissions`. Endpoint review membuat testimonial berstatus `pending` dan audit. Keduanya aman diuji dengan marker lokal dan cleanup terukur.

## 2. Batasan dan Aturan Pengujian

Pengujian mengikuti batas berikut:

1. Source code, UI, business logic, migration, route, dan konfigurasi tidak diubah untuk membuat pengujian berhasil.
2. Hasil gagal dicatat sebagai gagal dan tidak diperbaiki.
3. Tidak ada booking Lodgify yang dibuat.
4. Tidak ada pesan WhatsApp yang dikirim.
5. Tidak ada OTP yang dikirim karena mailbox QA yang dikendalikan tidak tersedia.
6. Akun dan konten yang sudah ada tidak diubah atau dihapus.
7. Data contact sementara menggunakan marker `blackbox-final@example.com` dan telah dihapus setelah pengujian.
8. Secret, API key, password, token, isi cookie sesi, dan alamat email akun yang sudah ada tidak dicetak dalam laporan.
9. Status yang digunakan hanya `Berhasil`, `Gagal`, dan `Tidak Dapat Diuji`.
10. Status `Berhasil` hanya diberikan apabila terdapat bukti runtime aktual.

## 3. Tabel Seluruh Skenario

| No | Waktu | Skenario | Pre-condition | Input/Tindakan | Hasil yang Diharapkan | Hasil Aktual | Status | Bukti | Route/Endpoint | Catatan |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1 | 19:06 +07 | Pencarian villa dengan lokasi dan jumlah tamu valid | Frontend aktif dan data Lodgify dapat dibaca | Buka Canggu, 2 dewasa dan 1 anak | Daftar villa yang sesuai tampil | HTTP 200. Filter Canggu dan 3 tamu tampil, disertai kartu villa | Berhasil | `01-search-valid.png`, `01-search-valid.snapshot.yml`, `frontend.log` | `GET /villas?location=Canggu&...` | Bukti visual diperiksa melalui Playwright |
| 2 | 19:07 +07 | Pencarian lokasi tanpa hasil | Frontend aktif | Lokasi `ZZZ-Not-A-Location`, 2 dewasa | State hasil kosong tampil | HTTP 200 dan pesan tidak ada villa yang sesuai tampil | Berhasil | `02-search-empty.png`, `02-search-empty.snapshot.yml` | `GET /villas?location=ZZZ-Not-A-Location&adults=2` | Tidak ada error console |
| 3 | 19:06 +07 | Filter lokasi, tanggal, dewasa, dan anak | Frontend aktif | Canggu, 12 sampai 14 Agustus 2026, 2 dewasa, 1 anak | Seluruh nilai filter diterapkan | HTTP 200. Lokasi, check-in, check-out, dan total 3 tamu terlihat pada UI | Berhasil | `01-search-valid.png`, `frontend.log` | `GET /villas` dengan query filter | Parameter diteruskan melalui URL |
| 4 | 19:08 +07 | Membuka detail villa valid | Property ID publik tersedia pada cache villa | Buka property `475365` | Detail villa tampil | HTTP 200, judul `Ubud zen river house`, foto, lokasi, kapasitas, harga, dan kalender tampil | Berhasil | `04-villa-detail-valid.png`, `04-villa-detail-valid.snapshot.yml`, `frontend.log` | `GET /villas/475365` | Data detail berasal dari integrasi Lodgify |
| 5 | 19:05 +07 | Availability dengan tanggal valid | Frontend dan Lodgify API dapat diakses | Property `475365`, 1 sampai 31 Agustus 2026, rentang 10 sampai 12 Agustus | Map availability dikembalikan | HTTP 200, `success:true`, map harian tersedia, dan `rangeAvailable:false` | Berhasil | `05-availability-valid.json`, `frontend.log` | `GET /api/lodgify/availability` | Nilai false merupakan hasil data untuk rentang yang dipilih, bukan error request |
| 6 | 19:05 +07 | Availability dengan parameter tidak valid | Frontend aktif | `propertyId=!`, tanggal `bad` | Validasi menolak request | HTTP 400 dengan pesan pemilihan villa dan tanggal yang valid | Berhasil | `06-availability-invalid.json`, `frontend.log` | `GET /api/lodgify/availability` | Request tidak diteruskan menjadi transaksi |
| 7 | 19:05 +07 | Rate quote dengan villa dan tanggal valid | Frontend dan Lodgify API dapat diakses | Property `475365`, 10 sampai 12 Agustus 2026, 2 tamu | Quote harga dikembalikan | HTTP 200, `success:true`, 2 malam, mata uang IDR, dan total harga tersedia | Berhasil | `07-rate-quote-valid.json`, `frontend.log` | `GET /api/lodgify/rate-quote` | Quote tidak membuka checkout dan tidak membuat booking |
| 8 | 19:10 +07 | Registrasi dengan input invalid | Backend aktif | Nama `A` dan email `not-an-email` | Validasi menolak sebelum pengiriman OTP | HTTP 422 dengan error email invalid | Berhasil | `08-register-invalid.json` | `POST /api/v1/auth/register/send-otp` | Tidak ada email yang dikirim |
| 9 | 19:10 +07 | Login dengan email atau password salah | Backend aktif | Email reserved `example.com` dan password salah | Kredensial ditolak | HTTP 422 dengan pesan `Invalid credentials.` | Berhasil | `09-login-invalid.json` | `POST /api/v1/auth/login` | Tidak ada token yang dibuat atau dicetak |
| 10 | 19:09 +07 | Akses endpoint terproteksi tanpa token | Backend aktif | GET user tanpa header Authorization | Request ditolak | HTTP 401 dengan pesan `Unauthenticated.` | Berhasil | `10-protected-without-token.json` | `GET /api/v1/auth/user` | Middleware `auth:sanctum` aktif |
| 11 | 19:12 +07 | Login valid dengan akun QA | Akun QA dan password harus tersedia | Tidak dijalankan | User QA memperoleh token Sanctum | Tidak ada kredensial QA yang diberikan dan database tidak memiliki akun dengan marker QA | Tidak Dapat Diuji | `00-environment.txt` | `POST /api/v1/auth/login` | Akun yang sudah ada tidak dicoba atau diubah |
| 12 | 19:12 +07 | Registrasi dan OTP valid | Mailbox QA yang dikendalikan harus tersedia | Tidak dijalankan | OTP diterima, diverifikasi, lalu akun QA dibuat | Mailbox QA tidak tersedia | Tidak Dapat Diuji | Audit `OtpController` dan `OtpMail` | `POST /api/v1/auth/register/send-otp`, `verify-otp` | Tidak mengirim OTP ke alamat yang tidak dikendalikan |
| 13 | 19:09 +07 | Akses wishlist tanpa token | Backend aktif | GET wishlist tanpa header Authorization | Request ditolak | HTTP 401 dengan pesan `Unauthenticated.` | Berhasil | `13-wishlist-without-token.json` | `GET /api/v1/wishlist` | Middleware `auth:sanctum` aktif |
| 14 | 19:12 +07 | Menyimpan wishlist dengan akun QA | Akun QA dan token valid diperlukan | Tidak dijalankan | Property ID tersimpan untuk user QA | Token QA tidak tersedia | Tidak Dapat Diuji | Audit `WishlistController::store` | `POST /api/v1/wishlist` | Tidak memakai akun yang sudah ada |
| 15 | 19:12 +07 | Menghapus wishlist dengan akun QA | Akun QA, token, dan item wishlist QA diperlukan | Tidak dijalankan | Item wishlist QA terhapus | Token dan item QA tidak tersedia | Tidak Dapat Diuji | Audit `WishlistController::destroy` | `DELETE /api/v1/wishlist/{lodgifyPropertyId}` | Data wishlist yang sudah ada tidak disentuh |
| 16 | 19:12 +07 | Sinkronisasi wishlist lokal dan server pada dua konteks browser | Akun QA dan token valid diperlukan | Tidak dijalankan | Wishlist lokal dan server tergabung secara konsisten | Akun QA tidak tersedia | Tidak Dapat Diuji | Audit `savedVillas.ts`, `AuthProvider.tsx`, dan `WishlistController::sync` | `POST /api/v1/wishlist/sync` | Dua konteks tanpa akun tidak membuktikan sinkronisasi server |
| 17 | 19:10 +07 | Mengirim formulir kontak valid | Backend dan database aktif | Payload marker BBF dengan email reserved `example.com` | Record contact dibuat | HTTP 201, `success:true`, record ID 5 dibuat | Berhasil | `17-contact-valid.json` | `POST /api/v1/contact` | Record dibersihkan pada skenario 19 |
| 18 | 19:11 +07 | Mengirim formulir kontak invalid | Backend aktif | Nama kosong, email invalid, pesan kosong | Validasi menolak input | HTTP 422 dengan error pada name, email, dan message | Berhasil | `18-contact-invalid.json` | `POST /api/v1/contact` | Percobaan pertama sempat dibatasi limiter, lalu pengulangan setelah window selesai menghasilkan bukti validasi |
| 19 | 19:12 +07 | Cleanup data kontak dan verifikasi database | Record marker dari skenario 17 tersedia | Hapus hanya record dengan marker BBF dan hitung sebelum serta sesudah | Record sementara terhapus dan total kembali ke baseline | Marker berubah dari 1 menjadi 0. Total contact kembali dari 3 menjadi 2 | Berhasil | `19-contact-cleanup.txt` | Operasi cleanup lokal pada `contact_submissions` | Tidak ada record produksi yang dihapus |
| 20 | 19:10 +07 | Mengirim review valid dengan data aman | Villa cache `475365` tersedia | Payload review marker BBF, 5 bintang, tanggal lampau | Review dibuat sebagai `pending` dan mendapat HTTP 202 | Endpoint mengembalikan HTTP 429 `Too Many Attempts.`. Tidak ada record review dibuat | Gagal | `20-review-valid.json`, `19-contact-cleanup.txt` | `POST /api/v1/reviews` | Kegagalan dicatat apa adanya. Limiter lokal telah memiliki hit sebelum request final |
| 21 | 19:09 +07 | Membuka panel `/admin` tanpa sesi | Backend aktif dan browser tanpa sesi admin | Buka `/admin` | Pengguna diarahkan ke login | HTTP 302 menuju `/admin/login`. Halaman login Filament tampil | Berhasil | `21-admin-redirect.txt`, `21-admin-redirect.png`, `21-admin-redirect.snapshot.yml` | `GET /admin` | Nilai cookie sesi dihapus dari bukti |
| 22 | 19:12 +07 | Akses user non-admin yang telah login | Akun user QA dan sesi web Filament diperlukan | Tidak dijalankan | Panel menolak user non-admin | Tidak tersedia akun dan sesi non-admin QA | Tidak Dapat Diuji | Audit `User::canAccessPanel()` | `/admin` | Source membatasi akses untuk `role === admin`, tetapi tidak dinyatakan berhasil tanpa runtime |
| 23 | 19:12 +07 | CRUD artikel testing | Akun admin QA dan izin perubahan data diperlukan | Tidak dijalankan | Artikel uji dapat dibuat, dibaca, diubah, dihapus | Kredensial admin QA tidak tersedia | Tidak Dapat Diuji | Audit `ArticleResource` dan route `/admin/articles` | Filament Article Resource | Konten yang sudah ada tidak diubah |
| 24 | 19:12 +07 | CRUD galeri testing | Akun admin QA dan izin perubahan data diperlukan | Tidak dijalankan | Galeri uji dapat dibuat, dibaca, diubah, dihapus | Kredensial admin QA tidak tersedia | Tidak Dapat Diuji | Audit `GalleryItemResource` dan route `/admin/gallery-items` | Filament Gallery Item Resource | Konten yang sudah ada tidak diubah |
| 25 | 19:12 +07 | CRUD salah satu modul CMS lain | Akun admin QA dan izin perubahan data diperlukan | Tidak dijalankan | CRUD modul CMS lain berhasil | Kredensial admin QA tidak tersedia | Tidak Dapat Diuji | Audit FAQ, Service Card, Bali Collection, Media, dan Site Settings | Route Filament terkait | Tidak ada pemilihan modul yang aman tanpa akun QA |
| 26 | 19:12 +07 | Perubahan data dan invalidasi cache setelah CRUD | CRUD admin harus berhasil lebih dahulu | Tidak dijalankan | Perubahan database terlihat dan cache terkait dihapus | Tidak ada CRUD admin yang dijalankan | Tidak Dapat Diuji | Audit hook `Cache::forget()` pada model CMS | Model Article, GalleryItem, FAQ, ServiceCard, Testimonial, dan model CMS lain | Source memiliki invalidasi cache, tetapi runtime setelah CRUD belum dibuktikan |
| 27 | 19:10 +07 | Verifikasi pembentukan URL Lodgify Checkout | Fungsi booking tersedia | Jalankan fungsi dengan property `475365`, tanggal, dan 2 tamu tanpa membuka URL | URL HTTPS Lodgify terbentuk dengan parameter yang sesuai | Host `checkout.lodgify.com`, property ID, check-in, check-out, dan guests sesuai | Berhasil | `27-checkout-url.txt` | `buildLodgifyCheckoutUrl()` | Checkout tidak dibuka dan booking tidak dibuat |
| 28 | 19:10 +07 | Verifikasi pembentukan tautan WhatsApp | Fungsi WhatsApp tersedia | Jalankan fungsi dengan nama villa, tanggal, dan tamu tanpa membuka URL | URL HTTPS `wa.me` dan parameter pesan terbentuk | Host `wa.me`, penerima numerik, parameter text, dan nama villa tersedia | Berhasil | `28-whatsapp-url.txt` | `buildBookingWhatsAppUrl()` | Tautan tidak dibuka dan pesan tidak dikirim |

## 4. Rekap Hasil

| Status | Jumlah |
|---|---:|
| Berhasil | 17 |
| Gagal | 1 |
| Tidak Dapat Diuji | 10 |
| Total | 28 |

## 5. Temuan Runtime

1. MySQL tidak aktif pada awal pengujian, sehingga `migrate:status` pertama gagal dengan penolakan koneksi. MySQL Laragon kemudian dijalankan dan seluruh migration berhasil diverifikasi berstatus `Ran`.
2. MySQL dapat melayani aplikasi, tetapi `mysql.stderr.log` mencatat komponen `component_reference_cache.dll` tidak dapat dimuat. Temuan ini tidak menghentikan koneksi database pada pengujian lokal.
3. Endpoint review mengembalikan HTTP 429 untuk payload valid. Respons debug awal juga memuat stack trace internal karena mode lokal. Bukti final diringkas agar tidak menyimpan detail internal yang tidak diperlukan.
4. Request availability untuk 10 sampai 12 Agustus 2026 menghasilkan `rangeAvailable:false`, sedangkan rate quote untuk property dan tanggal yang sama tetap menghasilkan quote HTTP 200. Quote harga tidak boleh dianggap sebagai bukti bahwa rentang tersebut tersedia.
5. Playwright mencatat peringatan bahwa beberapa CSS pada halaman detail villa dipreload tetapi tidak segera digunakan. Tidak ditemukan error JavaScript yang menghentikan tampilan skenario utama.
6. `npm ls --depth=0` mencatat satu dependency ekstraneous. Seluruh dependency utama proyek tetap dapat dibaca dan frontend berhasil berjalan.
7. Redirect admin tanpa sesi bekerja pada runtime. Otorisasi user non-admin hanya terkonfirmasi melalui source dan belum dibuktikan melalui sesi QA.

## 6. Data yang Dibuat dan Dibersihkan

Satu record `contact_submissions` dibuat menggunakan nama `BBF QA 20260720` dan email reserved `blackbox-final@example.com`. Sebelum cleanup, marker berjumlah 1 dan total tabel berjumlah 3. Sesudah cleanup, marker berjumlah 0 dan total tabel kembali menjadi 2, sama dengan baseline.

Payload review valid dikirim, tetapi endpoint mengembalikan HTTP 429 sehingga tidak ada record testimonial atau audit baru. Jumlah testimonial tetap 2 dan jumlah audit tetap 2. Tidak ada user, OTP, token, wishlist, artikel, galeri, media, FAQ, service card, atau konten CMS lain yang dibuat atau dihapus.

## 7. Fitur yang Tidak Diuji dan Alasannya

- Login valid tidak diuji karena kredensial akun QA tidak tersedia.
- Registrasi dan OTP valid tidak diuji karena mailbox QA yang dikendalikan tidak tersedia.
- Pengiriman OTP reset password tidak diuji karena dapat mengirim email eksternal.
- Penyimpanan, penghapusan, dan sinkronisasi wishlist server tidak diuji karena token akun QA tidak tersedia.
- Sinkronisasi wishlist pada dua konteks browser tidak diuji karena memerlukan akun QA yang sama pada server.
- Akses panel sebagai user non-admin tidak diuji karena sesi web user QA tidak tersedia.
- CRUD artikel, galeri, dan modul CMS lain tidak diuji karena akun admin QA serta izin perubahan konten tidak tersedia.
- Invalidasi cache setelah CRUD admin tidak diuji karena pre-condition CRUD tidak terpenuhi.
- Google OAuth tidak diuji karena route dan implementasinya tidak ditemukan pada source code.
- Penyelesaian checkout Lodgify tidak diuji karena dapat membuat reservasi nyata.
- Pengiriman WhatsApp tidak diuji karena dapat menghasilkan komunikasi nyata.

## 8. Kesimpulan

Black Box Testing final memberikan bukti runtime bahwa fungsi utama prototipe untuk pencarian villa, detail villa, availability, rate quote, validasi autentikasi, proteksi endpoint, kontak, gate admin, dan pembentukan tautan eksternal dapat dijalankan pada lingkungan lokal. Satu skenario gagal karena endpoint review dibatasi HTTP 429, sedangkan sepuluh skenario tidak dapat diuji karena membutuhkan akun QA, mailbox QA, atau izin admin yang tidak tersedia.

Hasil ini memvalidasi sebagian fungsi prototipe sesuai batas pengujian lokal. Hasil pengujian tidak membuktikan kesiapan produksi, tidak mencakup transaksi reservasi nyata, dan tidak mencakup komunikasi eksternal nyata.

## Versi Ringkas untuk Laporan Kerja Praktek

Black Box Testing dilakukan untuk mengevaluasi fungsi prototipe website reservasi villa Summerhouses berdasarkan masukan dan keluaran yang terlihat oleh pengguna. Skenario pengujian ditentukan melalui audit source code agar fungsi yang diuji sesuai dengan implementasi yang benar-benar tersedia. Pengujian ini berfokus pada perilaku sistem tanpa mengubah source code atau business logic untuk memperoleh hasil tertentu.

Pengujian dilaksanakan pada lingkungan lokal menggunakan frontend Next.js di `http://localhost:3000`, backend Laravel di `http://127.0.0.1:8000`, database MySQL Laragon, dan integrasi Lodgify REST API v2. Browser automation menggunakan Playwright CLI, sedangkan endpoint API diperiksa melalui status HTTP dan respons JSON. Seluruh waktu pengujian dicatat menggunakan zona waktu +07:00.

### Tabel Ringkas Hasil Pengujian

| No | Skenario Representatif | Hasil Aktual | Status |
|---:|---|---|---|
| 1 | Pencarian villa dengan lokasi dan tamu valid | Halaman menampilkan filter dan kartu villa dengan HTTP 200 | Berhasil |
| 2 | Pencarian lokasi tanpa hasil | Halaman menampilkan pesan hasil kosong dengan HTTP 200 | Berhasil |
| 3 | Detail villa valid | Data villa, foto, lokasi, harga, dan kalender tampil | Berhasil |
| 4 | Availability valid | Map harian dikembalikan dengan HTTP 200 | Berhasil |
| 5 | Availability invalid | Parameter tidak valid ditolak dengan HTTP 400 | Berhasil |
| 6 | Rate quote valid | Quote 2 malam dalam IDR dikembalikan dengan HTTP 200 | Berhasil |
| 7 | Login invalid | Kredensial ditolak dengan HTTP 422 | Berhasil |
| 8 | Endpoint terproteksi tanpa token | Request ditolak dengan HTTP 401 | Berhasil |
| 9 | Contact valid dan cleanup | Record dibuat dengan HTTP 201 lalu dihapus sampai jumlah kembali ke baseline | Berhasil |
| 10 | Review valid | Endpoint mengembalikan HTTP 429 dan tidak membuat record | Gagal |
| 11 | Panel admin tanpa sesi | Request diarahkan ke `/admin/login` dengan HTTP 302 | Berhasil |
| 12 | Pembentukan URL checkout dan WhatsApp | URL dan parameter terbentuk tanpa membuka transaksi atau mengirim pesan | Berhasil |

### Rekap Ringkas

| Status | Jumlah |
|---|---:|
| Berhasil | 17 |
| Gagal | 1 |
| Tidak Dapat Diuji | 10 |

Skenario login valid, registrasi OTP valid, wishlist server, akses non-admin, CRUD Filament, dan invalidasi cache setelah CRUD tidak dapat dijalankan karena kredensial atau mailbox QA tidak tersedia. Google OAuth tidak termasuk fitur yang diuji karena implementasinya tidak ditemukan. Checkout Lodgify dan WhatsApp hanya diuji sampai pembentukan URL agar tidak menimbulkan reservasi atau komunikasi nyata.

Berdasarkan hasil tersebut, pengujian telah memvalidasi sejumlah fungsi utama prototipe pada lingkungan lokal dan menemukan satu kegagalan runtime yang perlu diperhatikan. Hasil ini merupakan validasi prototipe untuk kebutuhan Kerja Praktek dan tidak dapat digeneralisasikan sebagai hasil pengujian lingkungan produksi.
