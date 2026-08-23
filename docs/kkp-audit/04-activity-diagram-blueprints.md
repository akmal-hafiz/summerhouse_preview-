# 04 — Blueprint Activity Diagram

Empat kelompok proses yang diusulkan **tepat** dan dipertahankan. Tidak perlu dipisah lagi karena masing-masing memiliki batas transaksi/aktor yang jelas: pencarian-booking eksternal, lifecycle identitas, lifecycle wishlist lintas perangkat, dan pola CRUD CMS lintas modul.

| No | Diagram | Swimlane | Initial/final dan keputusan penting | Dasar source | Kode |
|---:|---|---|---|---|---|
| 1 | Pencarian dan Pemesanan Villa | Pengunjung; Next.js; Lodgify REST API v2; Lodgify Checkout; WhatsApp | Start membuka pencarian; respons tersedia?; hasil ada?; rentang tersedia?; kanal checkout/WhatsApp; final pada external checkout/komunikasi atau error | `VillaSearchForm`, `app/villas/page.tsx`, `AvailabilityCalendar`, `app/api/lodgify/*`, `lib/lodgify/*` | [05-activity-search-booking.puml](diagrams/05-activity-search-booking.puml) |
| 2 | Registrasi dan Autentikasi Pengguna | Pengunjung/User; Next.js; Laravel API; MySQL; Resend | Start auth; user ada?; kredensial benar?; OTP valid?; role admin?; final token tersimpan/akses diarahkan atau error | `AuthForm`, `AuthProvider`, `AuthController`, `OtpController`, `User`, `OtpCode` | [06-activity-authentication.puml](diagrams/06-activity-authentication.puml) |
| 3 | Pengelolaan dan Sinkronisasi Wishlist | Pengunjung/User; Browser/Next; Laravel API; MySQL | Dua trigger: klik save/remove dan login berhasil; token tersedia?; aksi save?; local IDs ada?; final wishlist lokal atau server tersinkron | `savedVillas.ts`, `AuthProvider`, `WishlistController`, `Wishlist` | [07-activity-wishlist.puml](diagrams/07-activity-wishlist.puml) |
| 4 | Pengelolaan Konten Admin | Admin; Filament/Laravel; MySQL/public storage; Next.js | Start login; role admin?; form/transisi valid?; modul Homepage Manager?; final sukses, validasi gagal, atau akses ditolak | `AdminPanelProvider`, Filament resources/pages, model cache hooks, `HomepageManager` | [08-activity-admin-content.puml](diagrams/08-activity-admin-content.puml) |

## Validasi khusus

### Pencarian dan pemesanan

Mencakup lokasi/tanggal/tamu/harga, request availability, hasil kosong, detail villa, kalender, rate quote, serta pilihan Lodgify Checkout atau WhatsApp. Lodgify REST API v2 dipakai untuk property/availability/rate quote; redirect browser menuju Lodgify Checkout adalah proses terpisah. Diagram sengaja tidak menampilkan pembuatan booking di database karena tidak ditemukan.

### Registrasi dan autentikasi

Registrasi memakai OTP email, bukan Google OAuth. Login menghasilkan token Sanctum yang disimpan browser; role diterima dari API. Google OAuth tidak dimasukkan karena tidak ada dependency, route, callback, atau controller implementasi.

### Wishlist

`localStorage` memang digunakan sebelum login. Diagram memisahkan trigger klik simpan/hapus dari trigger login berhasil agar pengguna yang telah terautentikasi tidak digambarkan login ulang setelah operasi biasa. Setelah login, `syncWishlistMerge()` mengirim ID lokal; backend menghitung existing ID lalu `firstOrCreate` untuk tiap ID baru. Hasil server ditulis kembali ke localStorage, sehingga mewakili akses lintas perangkat setelah user login dan sync.

### Konten admin

Satu diagram umum cukup untuk artikel, galeri, media, FAQ, service card, Bali collection, homepage, testimonial, user, dan settings karena semua berada pada gate Filament admin dan pola persistensi/cache yang sama. Nuansa khusus review berupa transisi status; Homepage Manager memicu sync cache Lodgify saat mount. `Cache::forget()` hanya menghapus cache Laravel; Next.js membaca data baru pada request/revalidation berikutnya.
