# 08 — Black Box Testing Tahap 3

## Lingkungan, metode, dan batas aman

- Waktu: **2026-07-16 19:45–19:55 +07:00**.
- Frontend: `npm run dev` pada `http://localhost:3000`; backend: `php artisan serve` pada `http://127.0.0.1:8000`.
- Migration sebelumnya terverifikasi seluruhnya berstatus `Ran`; pengujian memakai respons HTTP aktual, Playwright CLI, dan fungsi runtime TypeScript yang sama dengan UI.
- Untuk registrasi, login, reset password, wishlist, dan review digunakan data uji lokal terisolasi. User, token, OTP, wishlist, contact submission, testimonial, audit terkait, dan key cache uji telah dibersihkan; tidak ada secret/API key/password pengguna nyata dicetak.
- Redirect checkout dan WhatsApp tidak dibuka ke layanan eksternal agar tidak memulai proses reservasi/komunikasi nyata. Hanya URL yang dihasilkan fungsi runtime diverifikasi.
- Playwright berhasil membuka detail villa, tetapi snapshot halaman berukuran besar timeout pada CLI. Timeout alat tidak diperlakukan sebagai kegagalan halaman; HTTP 200 dan log Next.js dipakai sebagai bukti tambahan.
- Bukti log: `output/black-box/stage3-next.out.log`, `stage3-next-restart.out.log`, `stage3-laravel.out.log`, dan `stage3-laravel-restart.out.log`.

## Ringkasan hasil

| Berhasil | Gagal | Tidak Dapat Diuji |
|---:|---:|---:|
| 31 | 0 | 8 |

Google OAuth **tidak termasuk skenario pengujian implementasi karena fitur tidak ditemukan pada source code**.

## Hasil pengujian

| No | Waktu | Skenario | Pre-condition | Input/tindakan | Hasil yang diharapkan | Hasil aktual | Status | Bukti | Route/endpoint | Catatan |
|---:|---|---|---|---|---|---|---|---|---|---|
| 1 | 19:45 | Halaman publik beranda | Frontend aktif | Buka `/` | Beranda termuat | HTTP 200, title `Summerhouse Bali` | Berhasil | `stage3-next.out.log` | `/` | — |
| 2 | 19:45 | Halaman publik About | Frontend aktif | Buka `/about` | Konten publik termuat | HTTP 200, title About | Berhasil | Log Next.js | `/about` | — |
| 3 | 19:54 | Fallback CMS | Frontend aktif; Laravel dihentikan sementara | Buka `/contact` | Halaman tetap memakai fallback UI saat CMS tidak tersedia | HTTP 200, title Contact dan tautan WhatsApp fallback ada | Berhasil | Respons HTTP | `/contact` | Hanya simulasi API CMS offline lokal. |
| 4 | 19:46 | Pencarian villa valid | Frontend dan Lodgify tersedia | `/villas?location=Canggu&adults=2` | Daftar villa sesuai dimuat | HTTP 200; halaman collection berisi hasil | Berhasil | Log Next.js | `/villas` | — |
| 5 | 19:46 | Pencarian tanpa hasil | Frontend aktif | Lokasi `ZZZ-Not-A-Location` | Pesan hasil kosong | HTTP 200; teks `No villas match those dates yet...` | Berhasil | Respons HTTP | `/villas?...` | — |
| 6 | 19:46 | Filter lokasi/tanggal/tamu/harga | Frontend aktif | Canggu, 10–12 Aug 2026, 2 dewasa+1 anak, rentang harga | Filter diterapkan | HTTP 200; parameter dirender pada halaman | Berhasil | Log Next.js | `/villas?...` | — |
| 7 | 19:47 | Detail villa valid | Property `475366` tersedia | Buka `/villas/475366` | Detail villa tampil | HTTP 200; title `Casaluna Loft I` | Berhasil | Respons HTTP; log Next.js | `/villas/475366` | Snapshot CLI timeout karena ukuran halaman. |
| 8 | 19:47 | Detail villa tidak ditemukan | Frontend aktif | Buka `/villas/999999999` | Pesan villa tidak ditemukan | HTTP 200 dengan state `Villa not found` dan link kembali | Berhasil | Respons HTTP; log Lodgify 404 | `/villas/999999999` | UI fallback benar; status HTTP tetap 200. |
| 9 | 19:47 | Availability valid | Frontend/Lodgify tersedia | Property `475366`, 1–31 Aug, rentang 10–12 Aug | Map dan `rangeAvailable` kembali | HTTP 200, map availability dan `rangeAvailable:false` | Berhasil | Respons HTTP; log Next.js | `GET /api/lodgify/availability` | Nilai false adalah data availability, bukan error. |
| 10 | 19:53 | Availability invalid | Frontend aktif | `propertyId=!` | Validasi menolak input | HTTP 400, pesan validasi | Berhasil | Respons HTTP | `GET /api/lodgify/availability` | — |
| 11 | 19:47 | Rate quote valid | Frontend/Lodgify tersedia | Property `475366`, 10–12 Aug, 2 tamu | Quote harga kembali | HTTP 200, `success:true`, total `Rp 3.300.000` | Berhasil | Respons HTTP | `GET /api/lodgify/rate-quote` | — |
| 12 | 19:53 | Rate quote tanggal invalid | Frontend aktif | Check-out sebelum check-in | Validasi 400 | HTTP 400 | Berhasil | Respons HTTP | `GET /api/lodgify/rate-quote` | — |
| 13 | 19:53 | Redirect Lodgify Checkout | Detail valid | Jalankan `buildLodgifyCheckoutUrl()` dengan tanggal/tamu | Browser akan menerima URL checkout | URL runtime memakai host `checkout.lodgify.com`, property ID dan tanggal ada; navigasi eksternal tidak dibuka | Tidak Dapat Diuji | Runtime `tsx` | `lib/lodgify/booking.ts` | Tidak membuka checkout agar tidak memulai reservasi eksternal. |
| 14 | 19:53 | Tautan WhatsApp | Detail valid | Jalankan `buildBookingWhatsAppUrl()` | URL `wa.me` dengan pesan terbentuk | Host `wa.me`, parameter `text` ada; tautan tidak dibuka | Tidak Dapat Diuji | Runtime `tsx` | `lib/lodgify/booking.ts` | Tidak membuka komunikasi eksternal. |
| 15 | 19:48 | Registrasi OTP valid | OTP lokal uji valid dibuat | `POST register/verify-otp` | User/token dibuat | HTTP 201, `success:true` | Berhasil | Respons HTTP | `/api/v1/auth/register/verify-otp` | Pengiriman email Resend tidak diuji; verifikasi endpoint diuji dengan state OTP lokal. |
| 16 | 19:54 | OTP reset kedaluwarsa | User/OTP expired lokal uji | `POST password/reset` dengan OTP expired | Kode ditolak | HTTP 422, pesan kode tidak valid/kedaluwarsa | Berhasil | Respons HTTP | `/api/v1/auth/password/reset` | — |
| 17 | 19:48 | Login valid | User uji terdaftar | Email/password benar | Token Sanctum kembali | HTTP 200, `success:true` | Berhasil | Respons HTTP | `/api/v1/auth/login` | Token tidak dicetak. |
| 18 | 19:48 | Login salah | Backend aktif | Password salah | Kredensial ditolak | HTTP 422, `Invalid credentials.` | Berhasil | Respons HTTP | `/api/v1/auth/login` | — |
| 19 | 19:53 | Logout | Token uji valid | `POST logout`, lalu `GET user` dengan token sama | Token aktif dihapus | Logout 200; request setelahnya 401 | Berhasil | Respons HTTP | `/api/v1/auth/logout`, `/user` | — |
| 20 | 19:48 | Ganti password | User/token uji valid | `POST auth/password` | Password berubah; token lain dicabut | HTTP 200; password lama kemudian ditolak dan password baru bisa login | Berhasil | Respons HTTP | `/api/v1/auth/password` | — |
| 21 | 19:52 | Reset password valid | OTP reset lokal valid | `POST password/reset`, lalu login | Password direset dan dapat login | Reset 200; login setelah reset 200 | Berhasil | Respons HTTP | `/api/v1/auth/password/reset` | — |
| 22 | 19:48 | Forgot password untuk email tak terdaftar | Backend aktif | Email format valid yang tidak terdaftar | Respons generik tanpa enumerasi user | HTTP 200 dan pesan generik | Berhasil | Respons HTTP | `/api/v1/auth/password/forgot` | Tidak mengirim email karena user tidak ada. |
| 23 | 19:53 | Wishlist lokal browser | Browser interaktif stabil diperlukan | Simpan/hapus via UI sebelum login | `localStorage` berubah dan UI sinkron | Tidak diuji sampai interaksi UI; snapshot Playwright timeout | Tidak Dapat Diuji | Timeout Playwright dicatat | `savedVillas.ts`/UI | API server diuji terpisah. |
| 24 | 19:48 | Tambah wishlist server | Token uji valid | `POST /wishlist` property `475366` | Item tersimpan | HTTP 201, `success:true` | Berhasil | Respons HTTP | `/api/v1/wishlist` | Data uji dibersihkan. |
| 25 | 19:48 | Hapus wishlist server | Token/item uji valid | `DELETE` property `475366` dan `475390` | Item terhapus | HTTP 200 untuk kedua ID | Berhasil | Respons HTTP | `/api/v1/wishlist/{id}` | Validasi ID nonnumerik juga memberi 400. |
| 26 | 19:48 | Sinkronisasi wishlist | Token uji dan IDs lokal simulasi | `POST sync` IDs `475366,475390` | Merge dan IDs server kembali | HTTP 200, `merged:1`, IDs lengkap kembali | Berhasil | Respons HTTP | `/api/v1/wishlist/sync` | Memverifikasi `firstOrCreate` melalui hasil merge. |
| 27 | 19:51 | Form kontak valid | Backend diisolasi dari beban SSR | Payload QA valid | Record tersimpan | HTTP 201, `success:true`, ID tercipta | Berhasil | Respons HTTP | `/api/v1/contact` | Record dihapus saat cleanup. |
| 28 | 19:48 | Validasi formulir kontak | Backend aktif | Nama kosong, email invalid, pesan kosong | Validasi menolak | HTTP 422, tiga error validasi | Berhasil | Respons HTTP | `/api/v1/contact` | — |
| 29 | 19:51 | Kirim review valid | Villa cache `475366` tersedia | Payload review valid | Masuk moderasi | HTTP 202, pesan review menunggu moderasi | Berhasil | Respons HTTP | `/api/v1/reviews` | Record/audit uji dibersihkan. |
| 30 | 19:51 | Validasi review | Backend aktif | Author pendek, teks pendek, stars invalid | Validasi menolak | HTTP 422 | Berhasil | Respons HTTP | `/api/v1/reviews` | — |
| 31 | 19:52 | Kirim owner testimonial | Backend aktif | Payload owner testimonial valid | Masuk moderasi | HTTP 202 | Berhasil | Respons HTTP | `/api/v1/owner-testimonials` | Record/audit uji dibersihkan. |
| 32 | 19:47 | Gate panel admin tanpa sesi | Backend aktif | Buka `/admin` | Login panel diminta | HTTP 302 ke `/admin/login` | Berhasil | Respons HTTP | `/admin` | Ini bukan pengujian user non-admin yang sudah login. |
| 33 | 19:55 | Penolakan panel untuk user non-admin | Session user non-admin diperlukan | Tidak dijalankan | Akses panel ditolak | Tidak ada hasil aktual autentikasi web/Filament | Tidak Dapat Diuji | — | `/admin` | Tidak ada akun/sesi Filament non-admin yang aman; Sanctum bearer token bukan session panel. |
| 34 | 19:55 | CRUD artikel Filament | Akun admin uji diperlukan | Tidak dijalankan | CRUD artikel berhasil dan cache dihapus | Tidak ada hasil aktual | Tidak Dapat Diuji | — | `/admin/articles` | Tidak melewati autentikasi admin. |
| 35 | 19:55 | CRUD galeri/media Filament | Akun admin uji diperlukan | Tidak dijalankan | CRUD galeri/media berhasil | Tidak ada hasil aktual | Tidak Dapat Diuji | — | Filament Gallery/Media | Tidak melewati autentikasi admin. |
| 36 | 19:55 | CRUD FAQ/service card | Akun admin uji diperlukan | Tidak dijalankan | CRUD berhasil | Tidak ada hasil aktual | Tidak Dapat Diuji | — | Filament FAQ/Service Card | Tidak melewati autentikasi admin. |
| 37 | 19:55 | Moderasi review | Akun admin uji diperlukan | Tidak dijalankan | Pending review dapat ditransisikan | Tidak ada hasil aktual | Tidak Dapat Diuji | — | Filament Reviews & Testimonials | Tidak melewati autentikasi admin. |
| 38 | 19:53 | Invalidasi cache dan request berikutnya | Cache key review uji disiapkan | Kirim review valid; cek key | Model menghapus key cache terkait | HTTP 202; `Cache::has(cms.reviews.villa.475366)` menjadi false | Berhasil | Respons HTTP + pemeriksaan cache lokal | `/api/v1/reviews` | Menguji hook model review; bukan UI CRUD admin. Next.js tidak dipush langsung. |
| 39 | 19:47 | Site settings aktif | Backend aktif | `GET settings?keys=contact.whatsapp` | Setting CMS kembali | HTTP 200, payload setting tersedia | Berhasil | Respons HTTP | `/api/v1/cms/settings` | Nilai tidak dicetak. |

## Keterbatasan environment yang teramati

1. Rate limiter API global berbasis IP lokal (`127.0.0.1`) sempat mencapai 429 karena Next.js SSR dan request CLI menggunakan backend lokal yang sama. Pengujian mutasi dilanjutkan setelah frontend dihentikan sementara dan cache rate-limit lokal dibersihkan. Ini **keterbatasan environment lokal**, bukan bukti gagal fungsi endpoint; deployment harus memastikan reverse proxy meneruskan IP klien dengan benar.
2. Tidak tersedia akun admin uji maupun session Filament non-admin, sehingga skenario 33–37 tidak dipalsukan sebagai berhasil.
3. Email pengiriman OTP/Resend dan navigasi ke Lodgify Checkout/WhatsApp tidak diteruskan ke layanan eksternal. Verifikasi endpoint OTP serta pembentukan URL aplikasi tetap diuji.

## Retest yang diperlukan

- Sediakan akun admin dan user non-admin khusus QA untuk menguji panel, CRUD, moderasi, dan otorisasi panel.
- Sediakan mailbox/sandbox Resend untuk uji end-to-end `send-otp` dan `password/forgot` pada user yang benar-benar terdaftar.
- Jalankan browser automation yang stabil untuk memverifikasi `localStorage` wishlist dan membuka redirect eksternal tanpa menyelesaikan reservasi/pesan.
