# Spesifikasi Redesign Diagram UML Laporan KKP Summerhouses

Tanggal: 15 Agustus 2026  
Status: Menunggu persetujuan pengguna sebelum pembuatan di Lucidchart

## 1. Tujuan

Spesifikasi ini menjadi acuan tunggal untuk mengganti Use Case Diagram lama serta menyusun dua belas Activity Diagram dan dua belas Sequence Diagram yang saling berpasangan. Rancangan harus memenuhi tiga sasaran:

1. Seluruh fitur yang dibahas dalam laporan dapat ditelusuri dari Use Case Diagram ke Activity Diagram dan Sequence Diagram.
2. Jumlah Activity Diagram dan Sequence Diagram sama, yaitu masing-masing dua belas.
3. Diagram menggunakan notasi UML yang dapat dipertanggungjawabkan secara akademik dan tetap konsisten dengan bahasa visual diagram yang sudah ada di laporan.

## 2. Batas Sistem

Rancangan mencakup prototipe website Summerhouses yang dibahas dalam laporan:

- penyajian konten publik;
- pencarian, detail, ketersediaan, harga, dan delegasi pemesanan villa;
- registrasi berbasis OTP, login, sesi pengguna, profil, password, dan logout;
- wishlist lokal dan sinkronisasi server;
- pengiriman formulir kontak;
- pengiriman review villa atau testimonial;
- akses dan operasional CMS Filament;
- pengelolaan konten, pesan kontak, dan data pengguna;
- moderasi kiriman menjadi pending, approved, atau rejected.

Hal berikut berada di luar batas:

- pembayaran dan penyimpanan transaksi booking lokal;
- Google OAuth;
- menu Social dan SEO yang masih berupa placeholder;
- deployment produksi yang belum dilaksanakan;
- fitur yang hanya terdapat dalam kode terbaru tetapi tidak dibahas sebagai bagian prototipe pada laporan.

## 3. Standar Akademik yang Digunakan

Notasi mengacu pada Unified Modeling Language 2.5.1 dari Object Management Group (OMG), yang masih tercantum sebagai versi formal terkini pada katalog spesifikasi OMG per 15 Agustus 2026. Penerapan pada laporan difokuskan pada Use Case, Activity, dan Interaction/Sequence Diagram tanpa menambahkan notasi non-UML yang tidak diperlukan.

### 3.1 Use Case Diagram

- Aktor ditempatkan di luar system boundary.
- Use case ditempatkan di dalam system boundary bernama `Sistem Website Summerhouses`.
- Nama use case menggunakan frasa kerja yang menyatakan tujuan aktor.
- Langkah internal seperti validasi kredensial, pemeriksaan token, query database, dan perubahan status tidak dibuat sebagai use case terpisah.
- Verifikasi OTP menjadi bagian skenario registrasi karena bukan tujuan mandiri pengguna.
- Approve dan reject menjadi alur alternatif moderasi, bukan use case `extend` terpisah.
- Autentikasi untuk fungsi personal dinyatakan sebagai precondition. Relasi `include` tidak digunakan untuk login karena pengguna dapat sudah memiliki sesi valid.
- Generalisasi aktor digunakan dari `Pengguna Terdaftar` menuju `Pengunjung`, sehingga pengguna terdaftar mewarisi kemampuan pengunjung.
- Sistem eksternal dapat menjadi aktor pendukung bila bertukar data langsung dengan sistem.
- Garis asosiasi tidak diberi panah dan diatur agar tidak saling silang.

### 3.2 Activity Diagram

- Setiap diagram memiliki tepat satu initial node dan sedikitnya satu activity final node.
- Aktivitas ditulis sebagai tindakan, bukan nama objek.
- Swimlane menunjukkan pihak yang bertanggung jawab atas aktivitas.
- Decision node menggunakan guard yang lengkap, misalnya `[valid]` dan `[tidak valid]`.
- Setiap decision mempunyai jalur keluar yang jelas dan jalur kegagalan tidak dibiarkan menggantung.
- Fork dan join hanya digunakan ketika proses benar-benar paralel.
- Perpindahan ke Lodgify, WhatsApp, dan layanan email ditunjukkan pada swimlane eksternal.
- Detail teknis yang terlalu rendah, seperti nama method internal yang tidak dibahas dalam laporan, dihindari pada Activity Diagram.

### 3.3 Sequence Diagram

- Lifeline disusun dari aktor, boundary atau antarmuka, control atau layanan, entity atau penyimpanan, kemudian sistem eksternal.
- Pesan sinkron menggunakan garis penuh dengan panah tertutup.
- Return message menggunakan garis putus-putus.
- Activation bar digunakan selama peserta memproses pesan.
- Combined fragment `alt`, `opt`, dan `loop` digunakan sesuai kondisi nyata.
- Guard pada setiap operand ditulis eksplisit, misalnya `[kredensial valid]`.
- Pesan menggunakan nama tindakan yang dapat dibaca, sedangkan endpoint atau method dapat ditambahkan sebagai keterangan kedua.
- Sequence Diagram tidak menyatakan operasi database atau layanan eksternal yang tidak didukung isi laporan atau implementasi.

## 4. Sistem Visual Lucidchart

Semua diagram dibuat dalam satu dokumen Lucidchart dengan satu halaman per gambar.

- Font: Arial atau Aptos, konsisten pada seluruh halaman.
- Judul halaman: 16 pt, bold.
- Judul swimlane dan participant: 12 sampai 13 pt, semibold.
- Isi aktivitas dan pesan: 10 sampai 11 pt.
- Latar: putih solid agar hasil ekspor tidak berubah menjadi hitam.
- Teks utama: navy gelap `#172033`.
- Garis utama: navy gelap `#172033` atau biru `#1677FF` untuk Sequence Diagram.
- Header dan participant: biru muda `#D9E8F7`.
- Decision node: putih dengan outline navy. Aksen amber hanya dipakai bila seluruh Activity Diagram menggunakan pola yang sama.
- Ketebalan garis: 1.5 sampai 2 pt.
- Sudut elemen aktivitas: rounded rectangle yang seragam.
- Use Case Diagram: landscape.
- Activity Diagram: portrait atau landscape sesuai panjang alur, tetapi ukuran swimlane dan tipografi harus konsisten.
- Sequence Diagram: landscape lebar.
- Ekspor: PNG resolusi tinggi dengan latar putih, tanpa pemotongan elemen, dan tetap terbaca ketika ditempatkan pada halaman A4.

## 5. Aktor

| ID | Aktor | Tanggung Jawab |
|---|---|---|
| ACT-01 | Pengunjung | Mengakses konten publik, mencari villa, memulai pemesanan, mendaftar, login, dan mengirim formulir kontak. |
| ACT-02 | Pengguna Terdaftar | Spesialisasi Pengunjung yang memiliki sesi valid serta dapat mengelola akun, wishlist, dan kiriman review atau testimonial. |
| ACT-03 | Admin | Mengakses Filament CMS, mengelola data, serta menjalankan moderasi. |
| ACT-04 | Lodgify | Menyediakan data villa, availability, rate quote, dan kanal checkout. |
| ACT-05 | Layanan Email | Mengirim OTP registrasi kepada pengguna. |
| ACT-06 | WhatsApp | Menjadi kanal komunikasi pemesanan alternatif. |

MySQL, Laravel, Next.js, cache, dan localStorage tidak menjadi aktor pada Use Case Diagram karena merupakan bagian internal sistem. Komponen tersebut tetap dapat menjadi participant pada Sequence Diagram atau swimlane pada Activity Diagram.

## 6. Daftar Use Case Final

| ID | Use Case | Aktor Utama | Ringkasan |
|---|---|---|---|
| UC-01 | Menjelajahi Konten Publik | Pengunjung | Membuka halaman publik dan memperoleh konten CMS atau fallback. |
| UC-02 | Mencari dan Memesan Villa | Pengunjung | Mencari villa, membuka detail, memeriksa availability dan harga, lalu memilih Lodgify Checkout atau WhatsApp. |
| UC-03 | Registrasi Akun | Pengunjung | Membuat akun melalui validasi data dan verifikasi OTP email. |
| UC-04 | Login Pengguna | Pengunjung | Memperoleh sesi pengguna melalui email dan password yang valid. |
| UC-05 | Mengelola Akun | Pengguna Terdaftar | Melihat profil, memperbarui password, atau mengakhiri sesi. |
| UC-06 | Mengelola Wishlist | Pengguna Terdaftar | Menambah, menghapus, mengambil, dan menyinkronkan villa favorit. |
| UC-07 | Mengirim Review atau Testimonial | Pengguna Terdaftar | Mengirim konten sesuai konteks halaman untuk disimpan sebagai pending. |
| UC-08 | Mengirim Formulir Kontak | Pengunjung | Mengirim inquiry kepada Summerhouses. |
| UC-09 | Mengakses CMS | Admin | Login, melewati pemeriksaan role, membuka dashboard, dan logout dari Filament. |
| UC-10 | Mengelola Konten Website | Admin | Menambah, mengubah, atau menghapus konten serta media melalui Filament. |
| UC-11 | Mengelola Data Operasional CMS | Admin | Memantau pesan kontak dan mengelola data pengguna sesuai kewenangan. |
| UC-12 | Memoderasi Review dan Testimonial | Admin | Meninjau kiriman pending dan menetapkan approved atau rejected. |

## 7. Tata Letak Use Case Diagram

System boundary dibagi secara visual menjadi dua area tanpa membuat dua boundary terpisah:

- area kiri untuk fungsi Pengunjung dan Pengguna Terdaftar;
- area kanan untuk fungsi Admin.

Susunan yang disarankan:

1. `Pengunjung` berada di kiri atas boundary.
2. `Pengguna Terdaftar` berada di kiri bawah dan mempunyai generalization menuju `Pengunjung`.
3. `Admin` berada di kanan boundary.
4. `Lodgify`, `Layanan Email`, dan `WhatsApp` ditempatkan pada sisi bawah atau kanan dekat use case terkait.
5. UC-01 sampai UC-04 dan UC-08 berada pada kolom fungsi publik.
6. UC-05 sampai UC-07 berada pada kolom fungsi personal.
7. UC-09 sampai UC-12 berada pada kolom fungsi Admin.
8. Lodgify dan WhatsApp berasosiasi dengan UC-02.
9. Layanan Email berasosiasi dengan UC-03.
10. Tidak ada oval untuk validasi sesi, validasi role, OTP, approve, atau reject.

## 8. Pasangan Activity dan Sequence Diagram

### 8.1 AD-01 dan SD-01: Menjelajahi Konten Publik

**Activity Diagram**

Swimlane: `Pengunjung`, `Next.js Frontend`, `Laravel CMS API`, `Database/Cache`.

Alur:

1. Pengunjung membuka halaman publik.
2. Next.js menentukan kebutuhan konten halaman.
3. Next.js meminta konten kepada Laravel CMS API.
4. Laravel memeriksa cache.
5. Jika cache tersedia, sistem mengembalikan konten cache.
6. Jika cache tidak tersedia, Laravel mengambil konten aktif dari database dan mengembalikannya.
7. Jika CMS tidak dapat diakses, Next.js menggunakan fallback konten yang memang tersedia dalam proyek.
8. Next.js merender halaman.
9. Pengunjung membaca konten atau memilih halaman publik lain.
10. Proses selesai.

**Sequence Diagram**

Participant: `Pengunjung`, `Browser/Next.js Page`, `CMS Client`, `Laravel CmsController`, `Laravel Cache`, `MySQL`.

Pesan utama:

1. Pengunjung meminta halaman.
2. Next.js meminta data halaman melalui CMS Client.
3. CMS Client mengirim GET ke CMS API.
4. CmsController memeriksa cache.
5. Fragment `alt`:
   - `[cache tersedia]`: cache mengembalikan konten;
   - `[cache kosong]`: controller mengambil konten aktif dari MySQL dan menyimpannya sesuai aturan cache yang berlaku.
6. API mengembalikan JSON konten.
7. Next.js merender halaman.
8. Fragment `alt [CMS gagal]`: Next.js merender fallback konten.

### 8.2 AD-02 dan SD-02: Mencari dan Memesan Villa

**Activity Diagram**

Swimlane: `Pengunjung`, `Next.js Frontend`, `Lodgify`, `Layanan Eksternal`.

Alur:

1. Pengunjung membuka pencarian villa.
2. Pengunjung memasukkan lokasi, tanggal, dan jumlah tamu.
3. Next.js memvalidasi parameter.
4. Jika parameter tidak valid, sistem menampilkan pesan dan kembali ke formulir.
5. Next.js meminta data properti dan ketersediaan kepada Lodgify.
6. Jika hasil kosong, sistem menampilkan kondisi tanpa hasil.
7. Pengunjung memilih villa dan membuka detail.
8. Next.js meminta availability dan rate quote.
9. Jika rentang tidak tersedia, sistem meminta pengguna memilih tanggal lain.
10. Jika tersedia, sistem menampilkan harga dan pilihan kanal pemesanan.
11. Pengunjung memilih Lodgify Checkout atau WhatsApp.
12. Browser membuka layanan eksternal tanpa membuat booking lokal.
13. Proses selesai pada layanan yang dipilih.

**Sequence Diagram**

Participant: `Pengunjung`, `VillaSearchForm/Detail Villa`, `Next.js Route Handler`, `lib/lodgify`, `Lodgify REST API`, `Booking URL Builder`, `Lodgify Checkout`, `WhatsApp`.

Pesan utama:

1. Pengunjung mengirim parameter pencarian.
2. Frontend meminta pencarian dan availability.
3. Route Handler memvalidasi parameter.
4. Modul Lodgify meminta properti dan ketersediaan.
5. Lodgify mengembalikan hasil.
6. Frontend menampilkan daftar atau hasil kosong.
7. Pengunjung membuka detail dan memilih tanggal.
8. Frontend meminta availability dan rate quote.
9. Fragment `alt` mencakup parameter tidak valid, rate limit, layanan Lodgify gagal, tanggal tidak tersedia, dan tanggal tersedia.
10. Pada kondisi tersedia, pengguna memilih kanal.
11. Fragment `alt`:
    - `[Lodgify Checkout]`: URL Builder membentuk checkout URL dan browser melakukan redirect;
    - `[WhatsApp]`: URL Builder membentuk tautan wa.me dan browser membukanya.
12. Catatan menegaskan bahwa Laravel dan MySQL tidak membuat transaksi booking.

### 8.3 AD-03 dan SD-03: Registrasi Akun

**Activity Diagram**

Swimlane: `Pengunjung`, `Next.js`, `Laravel API`, `Database`, `Layanan Email`.

Alur:

1. Pengunjung memilih Register.
2. Pengunjung mengisi nama dan email.
3. Laravel memvalidasi data dan memastikan email belum digunakan.
4. Jika data tidak valid atau email sudah terdaftar, sistem menampilkan pesan.
5. Laravel membuat OTP dengan masa berlaku dan menyimpannya.
6. Layanan Email mengirim OTP.
7. Pengunjung memasukkan OTP dan password.
8. Laravel memverifikasi OTP.
9. Jika OTP salah atau kedaluwarsa, sistem menampilkan pesan dan menawarkan pengiriman ulang sesuai aturan.
10. Jika valid, Laravel membuat akun dan token autentikasi.
11. Next.js menyimpan sesi pengguna.
12. Registrasi selesai.

**Sequence Diagram**

Participant: `Pengunjung`, `AuthModal`, `Laravel OtpController`, `OtpCode/MySQL`, `Layanan Email`, `Laravel AuthController`, `User/MySQL`.

Pesan utama:

1. Pengunjung mengirim nama dan email.
2. AuthModal meminta OTP registrasi.
3. OtpController memvalidasi email dan membuat OTP.
4. OTP disimpan dengan purpose dan waktu kedaluwarsa.
5. Layanan Email mengirim kode.
6. Pengunjung mengirim OTP dan password.
7. AuthController memverifikasi OTP.
8. Fragment `alt` menangani OTP salah, OTP kedaluwarsa, email telah digunakan, dan data valid.
9. Pada data valid, User dibuat dan token Sanctum dikembalikan.
10. AuthModal menyimpan token dan memperbarui status autentikasi.

### 8.4 AD-04 dan SD-04: Login Pengguna

**Activity Diagram**

Swimlane: `Pengunjung`, `Next.js`, `Laravel API`, `Database`.

Alur:

1. Pengunjung membuka Login.
2. Pengunjung memasukkan email dan password.
3. Next.js memvalidasi kelengkapan input.
4. Laravel mencari pengguna dan memeriksa password.
5. Jika kredensial salah, sistem menampilkan pesan kesalahan.
6. Jika benar, Laravel membuat token Sanctum.
7. Next.js menyimpan token dan data pengguna.
8. Sistem menampilkan status login berhasil.

**Sequence Diagram**

Participant: `Pengunjung`, `AuthModal/AuthProvider`, `Laravel AuthController`, `User/MySQL`, `Sanctum`.

Pesan utama:

1. Pengunjung mengirim email dan password.
2. AuthProvider melakukan POST login.
3. AuthController mencari user dan memverifikasi password.
4. Fragment `alt`:
   - `[kredensial salah]`: API mengembalikan 422 dan UI menampilkan pesan;
   - `[kredensial valid]`: Sanctum membuat token dan API mengembalikan user serta token.
5. AuthProvider menyimpan token dan memperbarui state pengguna.

### 8.5 AD-05 dan SD-05: Mengelola Akun

**Activity Diagram**

Swimlane: `Pengguna Terdaftar`, `Next.js`, `Laravel API`, `Database`.

Alur:

1. Pengguna membuka menu akun.
2. Sistem memeriksa token.
3. Jika sesi tidak valid, pengguna diarahkan ke login.
4. Jika valid, sistem menampilkan profil.
5. Pengguna memilih memperbarui password atau logout.
6. Pada perubahan password, pengguna mengisi password lama dan baru.
7. Laravel memvalidasi password lama dan aturan password baru.
8. Jika valid, hash password diperbarui dan sistem memberi konfirmasi.
9. Pada logout, token lokal dihapus dan sesi pengguna diakhiri sesuai implementasi yang didokumentasikan.
10. Proses selesai.

**Sequence Diagram**

Participant: `Pengguna Terdaftar`, `Account UI/AuthProvider`, `Laravel AuthController`, `User/MySQL`, `Browser Storage`.

Pesan utama:

1. Account UI meminta profil dengan bearer token.
2. AuthController memvalidasi token dan mengambil user.
3. Fragment `alt [ubah password]` memverifikasi password lama, memperbarui hash, dan mengembalikan konfirmasi atau error.
4. Fragment `alt [logout]` membersihkan token dan data pengguna pada browser.
5. Fragment `[sesi tidak valid]` mengembalikan 401 dan membuka Login.

### 8.6 AD-06 dan SD-06: Mengelola Wishlist

**Activity Diagram**

Swimlane: `Pengguna Terdaftar`, `Browser/Next.js`, `Laravel API`, `MySQL`.

Alur:

1. Pengguna memilih simpan atau hapus villa.
2. Browser memperbarui wishlist lokal.
3. Sistem memeriksa token.
4. Jika belum login, data tetap berada di localStorage.
5. Setelah login, sistem membaca ID lokal.
6. Jika ID lokal tersedia, frontend meminta sinkronisasi.
7. Laravel menggabungkan ID tanpa duplikasi.
8. Jika tidak ada ID lokal, frontend mengambil wishlist server.
9. Frontend menulis hasil akhir ke localStorage.
10. Operasi tambah atau hapus berikutnya disinkronkan ke server selama sesi valid.

**Sequence Diagram**

Participant: `Pengguna`, `Wishlist UI/Provider`, `Browser localStorage`, `WishlistController`, `Wishlist/MySQL`.

Pesan utama:

1. Pengguna memilih simpan atau hapus.
2. Provider memperbarui localStorage.
3. Fragment `alt`:
   - `[belum login]`: proses selesai secara lokal;
   - `[sudah login dan ada ID lokal]`: POST sync dengan bearer token;
   - `[sudah login dan tidak ada ID lokal]`: GET wishlist.
4. Pada sinkronisasi, controller mengambil wishlist user.
5. Fragment `loop [setiap ID baru]` menjalankan penggabungan tanpa duplikasi.
6. Controller mengembalikan daftar akhir.
7. Provider menulis hasil ke localStorage dan memperbarui tampilan.

### 8.7 AD-07 dan SD-07: Mengirim Review atau Testimonial

**Activity Diagram**

Swimlane: `Pengguna Terdaftar`, `Next.js`, `Laravel API`, `MySQL`.

Alur:

1. Pengguna membuka formulir pada halaman villa, About, atau Service.
2. Sistem memeriksa sesi.
3. Jika belum terautentikasi, sistem meminta login atau registrasi.
4. Pengguna mengisi rating dan isi sesuai tipe kiriman.
5. Laravel memvalidasi token, isian, dan konteks asal.
6. Jika tidak valid, sistem menampilkan kesalahan dan pengguna memperbaiki input.
7. Jika valid, kiriman disimpan dengan status pending.
8. Sistem memberi tahu bahwa kiriman menunggu moderasi.
9. Proses pengguna selesai tanpa publikasi langsung.

**Sequence Diagram**

Participant: `Pengguna Terdaftar`, `Review/Testimonial Form`, `Laravel API`, `ReviewService`, `MySQL`.

Pesan utama:

1. Form memeriksa keberadaan token.
2. Fragment `alt [belum terautentikasi]` membuka autentikasi.
3. Pengguna mengirim isi dan konteks asal.
4. API memvalidasi bearer token dan payload.
5. ReviewService menormalisasi konteks dan menyimpan pending.
6. Fragment `alt` menangani validasi gagal, rate limit, dan penyimpanan berhasil.
7. API mengembalikan konfirmasi menunggu moderasi.

### 8.8 AD-08 dan SD-08: Mengirim Formulir Kontak

**Activity Diagram**

Swimlane: `Pengunjung`, `Next.js`, `Laravel API`, `MySQL`.

Alur:

1. Pengunjung membuka halaman Contact.
2. Pengunjung mengisi identitas, email, dan pesan.
3. Next.js memvalidasi kelengkapan dasar.
4. Laravel memvalidasi payload.
5. Jika tidak valid, sistem menampilkan pesan kesalahan.
6. Jika valid, Laravel menyimpan contact submission.
7. Sistem menampilkan konfirmasi berhasil.
8. Proses selesai.

**Sequence Diagram**

Participant: `Pengunjung`, `Contact Form`, `Laravel Contact API`, `ContactSubmission/MySQL`.

Pesan utama:

1. Pengunjung mengirim formulir.
2. Contact Form melakukan POST contact submission.
3. API memvalidasi input.
4. Fragment `alt`:
   - `[tidak valid]`: API mengembalikan error dan form menampilkan pesan;
   - `[valid]`: API menyimpan record dan mengembalikan 201.
5. Form menampilkan konfirmasi.

### 8.9 AD-09 dan SD-09: Mengakses CMS

**Activity Diagram**

Swimlane: `Admin`, `Filament`, `Laravel`, `Database`.

Alur:

1. Admin membuka `/admin`.
2. Filament memeriksa sesi.
3. Jika belum login, Filament menampilkan halaman login.
4. Admin memasukkan kredensial.
5. Laravel memvalidasi akun dan role admin.
6. Jika tidak valid atau bukan admin, akses ditolak.
7. Jika valid, dashboard CMS ditampilkan.
8. Admin menggunakan menu CMS.
9. Admin memilih logout.
10. Filament mengakhiri sesi dan kembali ke halaman login.

**Sequence Diagram**

Participant: `Admin`, `Browser`, `Filament Auth`, `Laravel Session/Auth`, `User/MySQL`, `Filament Dashboard`.

Pesan utama:

1. Admin meminta `/admin`.
2. Filament memeriksa sesi.
3. Fragment `alt [belum login]` menampilkan login.
4. Admin mengirim kredensial.
5. Laravel memeriksa user dan role.
6. Fragment `alt` menangani kredensial salah, role bukan admin, dan akses valid.
7. Pada akses valid, dashboard ditampilkan.
8. Fragment `opt [logout]` menghapus sesi dan mengarahkan ke login.

### 8.10 AD-10 dan SD-10: Mengelola Konten Website

**Activity Diagram**

Swimlane: `Admin`, `Filament/Laravel`, `MySQL/Public Storage`, `Next.js Frontend`.

Alur:

1. Admin yang telah terautentikasi memilih modul konten.
2. Admin memilih tambah, ubah, atau hapus.
3. Filament memvalidasi form dan aturan data.
4. Jika tidak valid, sistem menampilkan pesan.
5. Jika ada media, sistem memproses penyimpanan sesuai aturan media terkelola.
6. Laravel menyimpan perubahan database.
7. Cache Laravel terkait dihapus.
8. Sistem memberi notifikasi berhasil.
9. Next.js memperoleh konten terbaru pada request atau revalidation berikutnya.
10. Proses selesai.

**Sequence Diagram**

Participant: `Admin`, `Filament Resource/Manager`, `Eloquent Model`, `MySQL`, `Managed Media/Public Storage`, `Laravel Cache`, `CmsController`, `Next.js`.

Pesan utama:

1. Admin mengirim operasi CRUD.
2. Filament memvalidasi sesi, role, dan form.
3. Eloquent menyimpan perubahan.
4. Fragment `opt [ada media]` memproses dan menyimpan media melalui alur terkelola.
5. Laravel menghapus key cache terkait.
6. Filament mengembalikan notifikasi.
7. Pada request berikutnya, Next.js meminta CMS API.
8. Cache miss menyebabkan CmsController membaca data terbaru dan mengembalikan JSON.
9. Catatan menegaskan bahwa penghapusan cache Laravel tidak mengirim push langsung ke Next.js.

### 8.11 AD-11 dan SD-11: Mengelola Data Operasional CMS

**Activity Diagram**

Swimlane: `Admin`, `Filament`, `Laravel`, `MySQL`.

Alur:

1. Admin memilih menu pesan kontak atau pengguna.
2. Pada menu pesan kontak, Filament mengambil daftar pesan.
3. Admin membuka pesan dan dapat menandainya telah dibaca.
4. Laravel memperbarui status pesan.
5. Pada menu pengguna, Filament mengambil daftar pengguna.
6. Admin membuka detail dan menjalankan tindakan yang tersedia sesuai kewenangan.
7. Laravel memvalidasi perubahan.
8. Jika valid, database diperbarui dan notifikasi ditampilkan.
9. Jika tidak valid, sistem menolak perubahan dan menampilkan alasan.
10. Proses selesai.

**Sequence Diagram**

Participant: `Admin`, `Filament Contact/User Resource`, `ContactSubmission Model`, `User Model`, `MySQL`.

Pesan utama:

1. Admin memilih modul.
2. Fragment `alt`:
   - `[pesan kontak]`: resource meminta daftar, membuka detail, dan menjalankan markAsRead;
   - `[data pengguna]`: resource meminta daftar, membuka detail, dan mengirim perubahan yang diizinkan.
3. Model memvalidasi dan memperbarui MySQL.
4. Fragment `alt` mengembalikan keberhasilan atau kegagalan validasi.
5. Filament menampilkan notifikasi hasil.

### 8.12 AD-12 dan SD-12: Memoderasi Review dan Testimonial

**Activity Diagram**

Swimlane: `Admin`, `Filament CMS`, `Review Service`, `MySQL`, `Next.js Frontend`.

Alur:

1. Admin membuka daftar kiriman pending.
2. Filament mengambil review dan testimonial pending.
3. Admin memeriksa isi, tipe, dan konteks asal.
4. Admin dapat melakukan penyuntingan terbatas bila diperlukan.
5. Admin menentukan keputusan.
6. Jika disetujui, status menjadi approved dan identitas moderator disimpan.
7. Jika ditolak, status menjadi rejected dan alasan penolakan disimpan bila tersedia.
8. Review Service mencatat audit perubahan.
9. Konten approved tersedia pada endpoint publik sesuai konteks asal.
10. Konten pending dan rejected tidak ditampilkan.
11. Proses selesai.

**Sequence Diagram**

Participant: `Admin`, `Filament Testimonial Resource`, `ReviewService`, `ReviewRepository`, `MySQL`, `Next.js Frontend`.

Pesan utama:

1. Admin meminta daftar pending.
2. Filament meminta data melalui ReviewService dan Repository.
3. MySQL mengembalikan kiriman beserta konteks.
4. Admin memeriksa dan dapat mengirim penyuntingan terbatas.
5. Fragment `opt [penyuntingan diperlukan]` menyimpan perubahan dan audit.
6. Fragment `alt`:
   - `[disetujui]`: transition menuju approved, simpan moderator dan audit;
   - `[ditolak]`: transition menuju rejected, simpan alasan dan audit.
7. Pada permintaan publik berikutnya, Next.js meminta konten approved sesuai konteks.
8. Repository hanya mengembalikan konten approved.
9. Frontend menampilkan review villa pada villa terkait atau testimonial pada halaman asal.

## 9. Matriks Keterlacakan Final

| Use Case | Activity Diagram | Sequence Diagram |
|---|---|---|
| UC-01 | AD-01 | SD-01 |
| UC-02 | AD-02 | SD-02 |
| UC-03 | AD-03 | SD-03 |
| UC-04 | AD-04 | SD-04 |
| UC-05 | AD-05 | SD-05 |
| UC-06 | AD-06 | SD-06 |
| UC-07 | AD-07 | SD-07 |
| UC-08 | AD-08 | SD-08 |
| UC-09 | AD-09 | SD-09 |
| UC-10 | AD-10 | SD-10 |
| UC-11 | AD-11 | SD-11 |
| UC-12 | AD-12 | SD-12 |

Matriks ini harus dicantumkan pada laporan untuk menunjukkan bahwa seluruh use case terwakili dan jumlah diagram perilaku sama.

## 10. Rencana Halaman Lucidchart

Dokumen Lucidchart berisi 25 halaman:

1. UC-00 Use Case Diagram Sistem Summerhouses
2. AD-01 Menjelajahi Konten Publik
3. SD-01 Menjelajahi Konten Publik
4. AD-02 Mencari dan Memesan Villa
5. SD-02 Mencari dan Memesan Villa
6. AD-03 Registrasi Akun
7. SD-03 Registrasi Akun
8. AD-04 Login Pengguna
9. SD-04 Login Pengguna
10. AD-05 Mengelola Akun
11. SD-05 Mengelola Akun
12. AD-06 Mengelola Wishlist
13. SD-06 Mengelola Wishlist
14. AD-07 Mengirim Review atau Testimonial
15. SD-07 Mengirim Review atau Testimonial
16. AD-08 Mengirim Formulir Kontak
17. SD-08 Mengirim Formulir Kontak
18. AD-09 Mengakses CMS
19. SD-09 Mengakses CMS
20. AD-10 Mengelola Konten Website
21. SD-10 Mengelola Konten Website
22. AD-11 Mengelola Data Operasional CMS
23. SD-11 Mengelola Data Operasional CMS
24. AD-12 Memoderasi Review dan Testimonial
25. SD-12 Memoderasi Review dan Testimonial

## 11. Pemeriksaan Sebelum Ekspor

Setiap halaman harus lulus pemeriksaan berikut:

- judul cocok dengan matriks keterlacakan;
- aktor dan participant menggunakan nama yang konsisten;
- tidak ada konektor yang tidak memiliki tujuan;
- semua decision memiliki guard;
- semua fragment sequence memiliki guard;
- alur sukses dan kegagalan utama terlihat;
- tidak ada elemen yang melewati batas halaman;
- teks terbaca pada ukuran A4;
- latar ekspor berwarna putih;
- tidak ada fitur di luar batas laporan;
- tidak ada booking atau pembayaran lokal;
- review dan testimonial baru selalu berstatus pending;
- hanya konten approved yang ditampilkan;
- konteks asal review atau testimonial tetap dipertahankan;
- jumlah akhir tepat 12 Activity Diagram dan 12 Sequence Diagram.

## 12. Perubahan Laporan Setelah Diagram Selesai

Setelah seluruh gambar disetujui, laporan perlu diselaraskan pada:

1. deskripsi aktor;
2. daftar use case;
3. Use Case Diagram;
4. penjelasan relasi dan precondition;
5. matriks keterlacakan;
6. skenario use case;
7. judul dan penjelasan dua belas Activity Diagram;
8. judul dan penjelasan dua belas Sequence Diagram;
9. penomoran gambar, tabel, dan rujukan silang;
10. daftar gambar dan daftar tabel.

Penyelarasan dokumen dilakukan setelah gambar final tersedia agar nomor dan rujukan tidak berubah dua kali.
