# 02 — Audit Aktor dan Use Case

## Aktor final

| Aktor | Validasi source code |
|---|---|
| Pengunjung | Mengakses semua halaman publik, pencarian/availability, checkout eksternal, formulir kontak, review/testimoni, dan wishlist lokal sebelum login. |
| User Terdaftar | Login Sanctum bearer token; dashboard, profil/password, dan wishlist tersimpan lintas perangkat. Role default saat registrasi adalah `user`. |
| Admin | User dengan `users.role = admin`. `User::canAccessPanel()` membatasi akses Filament `/admin`; admin juga dapat memperoleh token API, tetapi REST CMS write tidak disediakan. |
| Lodgify REST API v2 | Sistem eksternal, bukan aktor manusia: menyediakan property, room, availability, rate calendar, dan checkout eksternal. |
| Resend | Sistem eksternal untuk pengiriman OTP register/reset; bukan aktor utama diagram use case. |

Tidak ada aktor Google OAuth karena implementasinya tidak ditemukan.

## A. Use Case Pengunjung dan User Terdaftar

| ID | Nama dan aktor | Tujuan | Pre-condition | Main flow | Alternative/exception | Post-condition | Route dan endpoint |
|---|---|---|---|---|---|---|---|
| UC-P01 | Melihat konten publik — Pengunjung | Membaca homepage, about, layanan, galeri, dan jurnal | Frontend dapat dimuat | Halaman mengambil CMS/public data lalu merender | CMS gagal: sebagian komponen memakai fallback/empty state | Konten publik tampil | `/`, `/about`, `/services`, `/gallery`, `/journal`; `GET /v1/cms/*` |
| UC-P02 | Mencari villa — Pengunjung | Menemukan villa berdasar lokasi/tanggal/tamu/harga | Frontend dan Lodgify tersedia | Isi filter → `/villas` → Next server memanggil Lodgify → kartu hasil | Tanggal invalid diabaikan; tak ada hasil/layanan gagal memberi state informatif | Daftar hasil atau pesan kosong/error | `/villas`; `/api/lodgify/search-options`; fungsi `searchAvailableVillas` |
| UC-P03 | Melihat detail villa — Pengunjung | Memeriksa detail, foto, amenitas, dan lokasi | ID villa ada di Lodgify | Buka detail → data detail/summaries/review CMS dimuat | Detail tidak ada → halaman “Villa not found”; review boleh kosong | Detail/fallback tampil | `/villas/{id}`; `getVillaDetail`, `GET /v1/cms/villas/{id}/reviews` |
| UC-P04 | Memeriksa availability dan harga — Pengunjung | Memilih tanggal/tamu yang tersedia | ID properti valid | Kalender meminta availability → pilih rentang → meminta rate quote | Validasi tanggal/ID 400; Lodgify gagal memberi error; minimum stay dapat tidak valid | Status rentang dan/atau quote tampil | `/villas/{id}#availability`; `GET /api/lodgify/availability`, `/rate-quote` |
| UC-P05 | Delegasi checkout atau WhatsApp — Pengunjung | Meneruskan pemesanan ke kanal eksternal | Properti dipilih; tanggal opsional | Pilih Lodgify atau WhatsApp → URL dibangun → browser berpindah | ID kosong/URL tidak aman ditolak; transaksi eksternal tidak terobservasi aplikasi | Browser membuka kanal eksternal | `buildLodgifyCheckoutUrl`, `buildBookingWhatsAppUrl` |
| UC-P06 | Registrasi OTP — Pengunjung | Membuat akun `user` | Email belum digunakan; layanan Resend tersedia | Masukkan email → nama/password → kirim OTP → verifikasi → token disimpan | Validasi email/password/OTP; OTP kadaluarsa/salah; pengiriman email gagal | User, OTP terpakai, token Sanctum dibuat | `/register`; `POST /v1/auth/register/send-otp`, `/verify-otp` |
| UC-P07 | Login dan logout — User/Admin | Autentikasi dan mengakhiri token saat ini | Akun sudah ada | Lookup email → password → token/user ke localStorage; logout menghapus token | Kredensial salah/validasi gagal; token tidak valid dibersihkan | Sesi aplikasi aktif atau berakhir | `/login`; `POST /v1/auth/lookup`, `/login`, `/logout`, `GET /user` |
| UC-P08 | Reset/ganti password — User | Memulihkan atau mengganti kredensial | Email/akun terdaftar untuk reset; token untuk ganti | Minta OTP → verifikasi/reset; atau kirim password lama+baru | Respons reset tidak mengungkap akun; OTP/password salah ditolak | Password berubah dan token terkait dicabut sesuai flow | `/forgot-password`, `/dashboard/settings`; endpoint password |
| UC-P09 | Kelola profil — User | Mengubah nama profil | Token Sanctum valid | Kirim nama → backend update → state lokal diperbarui | Tanpa token/validasi nama gagal | Nama tersimpan | `/dashboard/settings`; `POST /v1/auth/profile` |
| UC-P10 | Simpan dan sinkronkan wishlist — Pengunjung/User | Menyimpan villa sebelum dan sesudah login | ID villa numerik | Sebelum login: localStorage; sesudah login: merge `sync`, lalu add/remove server | Tanpa token tetap lokal; validasi ID/max 200; API gagal tidak memblokir UI lokal | Wishlist server dapat dipakai lintas perangkat setelah sync | `/saved-villas`, `/dashboard/saved`; endpoint `/v1/wishlist` |
| UC-P11 | Kirim kontak — Pengunjung | Mengirim inquiry | Form tersedia | Isi form → POST → data tersimpan | Field wajib/batas panjang/throttle; network error di UI | `contact_submissions` bertambah | `/contact`; `POST /v1/contact` |
| UC-P12 | Kirim review/testimoni — Pengunjung | Mengajukan review tamu atau testimoni owner | Villa cache valid bila dipilih | Isi form → request publik → service menyimpan `pending` | Validasi request/throttle/exception penyimpanan | Menunggu moderasi admin | `/villas/{id}`, `/services`; `POST /v1/reviews`, `/owner-testimonials` |

## B. Use Case Admin CMS

| ID | Nama | Tujuan | Pre-condition | Main flow | Alternative/exception | Post-condition | Route dan dukungan |
|---|---|---|---|---|---|---|---|
| UC-A01 | Login panel dan lihat dashboard | Masuk ke CMS | `role=admin` dan sesi Filament valid | Buka `/admin` → login Filament → dashboard widget | Non-admin ditolak oleh `canAccessPanel()` | Panel/admin dashboard terbuka | `/admin`; `AdminPanelProvider`, `User::canAccessPanel` |
| UC-A02 | Kelola homepage | Ubah section dan pilihan villa homepage | Admin login; cache villa tersedia untuk picker | Buka manager → edit → simpan PageSection/slot → cache dibersihkan | Validasi form/FileUpload; sync Lodgify gagal menghasilkan cache kosong | Konten homepage terbaru tersedia setelah cache | `/admin/homepage-manager`; `HomepageManager` |
| UC-A03 | Kelola Bali collection | CRUD koleksi lokasi | Admin login | Buat/ubah/hapus collection melalui resource | Validasi Filament | `bali_collections` berubah; cache dibersihkan | `/admin/bali-collections`; `BaliCollectionResource` |
| UC-A04 | Kelola artikel | CRUD dan publikasi artikel | Admin login | Buat/edit/hapus → model event membersihkan cache | Validasi form/published state | Artikel publik sesuai status | `/admin/articles`; `ArticleResource` |
| UC-A05 | Kelola galeri dan media | Upload media dan CRUD galeri | Admin login; storage public dapat ditulis | Upload/create/edit/delete | Tipe/ukuran file dan form tervalidasi | File pada disk public dan/atau metadata galeri berubah | `/admin/media`, `/admin/gallery-items` |
| UC-A06 | Kelola FAQ/service card | CRUD konten statis | Admin login | Operasi resource → event model forget cache | Validasi Form Filament | CMS API membaca konten terbaru | `/admin/faqs`, `/admin/service-cards` |
| UC-A07 | Moderasi review/testimoni | Approve/reject/edit dan menempatkan kiriman publik | Admin login; record ada | Buka record → aksi/status melalui `ReviewService` → audit dibuat | Transisi status yang tidak sah ditolak; CreateAction tidak tersedia | Review dan audit berubah; cache terkait dihapus | `/admin/testimonials`; `TestimonialResource`, `ReviewService` |
| UC-A08 | Kelola pengguna | Buat/edit user dan role | Admin login | CRUD UserResource | Form role/password; panel tetap membatasi role | `users` berubah | `/admin/users`; `UserResource` |
| UC-A09 | Tindak lanjuti kontak | Melihat/menandai pesan masuk | Admin login | Lihat record → mark read atau bulk delete | Tidak ada create manual; akses panel wajib | Status baca/hapus berubah | `/admin/contact-submissions`; `ContactSubmissionResource` |
| UC-A10 | Kelola site settings | Mengubah contact/concierge | Admin login | Edit key-map → `updateOrCreate` → cache key dibersihkan | Format email/nomor divalidasi | Settings baru tersedia pada API | `/admin/site-settings-manager`; `SiteSettingsManager` |

## Blueprint Use Case Diagram

- [Use Case Pengunjung dan User Terdaftar](diagrams/01-use-case-public.puml) menggunakan ID UC-P01 s.d. UC-P12.
- [Use Case Admin CMS](diagrams/02-use-case-admin.puml) menggunakan ID UC-A01 s.d. UC-A10.

Google OAuth dan booking internal tidak dimasukkan karena tidak ditemukan pada source code.
