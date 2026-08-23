# 05 — Validasi Sequence Diagram yang Sudah Ada

## Bahan dan dasar audit

Audit ini membandingkan empat PNG asli laporan dengan route handler Next.js, `lib/lodgify`, route/controller Laravel, model, serta migration yang tersedia. Diagram asli **tidak diganti**; blueprint revisi disimpan terpisah di `diagrams/10` sampai `13`.

## Ringkasan verdict

| No | Diagram asli | Lifeline/aktor yang digambarkan | Verdict | Ringkasan |
|---:|---|---|---|---|
| 1 | Pencarian Availability Villa | Pengunjung, Next.js Frontend/VillaSearchForm, `lib/lodgify`, Lodgify REST API v2 | Perlu koreksi minor | Arah integrasi Next.js → Lodgify sudah benar dan Laravel memang tidak berada pada jalur availability. Perlu membedakan page server dan route handler, serta menambahkan validasi/429/500. |
| 2 | Pemesanan Villa | Pengunjung, Next.js Frontend/Detail Villa Page, `buildLodgifyCheckoutUrl`, Lodgify Checkout | Perlu koreksi minor | Redirect client-side ke checkout eksternal dan ketiadaan booking Laravel/MySQL sudah benar. Diagram perlu menunjukkan WhatsApp sebagai alternatif dan parameter URL aktual. |
| 3 | Pembaruan Konten CMS | Admin, Filament Panel, Laravel Controller, MySQL, Laravel Cache, Next.js Frontend | Perlu koreksi besar | Penyimpanan dan invalidasi cache benar secara garis besar, tetapi Filament memakai resource/model Laravel dan `Cache::forget()` tidak mendorong Next.js atau menjalankan on-demand revalidation. |
| 4 | Login dan Sinkronisasi Wishlist | User, AuthModal, AuthProvider/React Context, AuthController, MySQL, WishlistController, localStorage | Perlu koreksi minor | Sanctum token, localStorage, dan merge wishlist sudah searah. Harus eksplisit `POST /v1/wishlist/sync`, bearer token, `firstOrCreate`, serta respons IDs hasil merge. |

## 1. Pencarian Availability Villa

**Yang digambarkan.** Pengunjung mengisi filter; frontend meneruskannya ke `lib/lodgify`; helper mengambil properti/availability dari Lodgify REST API v2; hasil kemudian ditampilkan dan detail meminta availability.

**Kesesuaian source.** `app/villas/page.tsx` menjalankan `searchAvailableVillas(filters)` dari `lib/lodgify` pada server. Kalender client pada `components/booking/AvailabilityCalendar.tsx` memanggil `GET /api/lodgify/availability`; route handler tersebut memvalidasi input lalu memanggil `getAvailabilityMap()` di `lib/lodgify`. Tidak ada route Laravel untuk availability atau rate quote.

**Koreksi spesifik.**

- Tambahkan lifeline **Next.js route handler** untuk kalender: endpoint publiknya `GET /api/lodgify/availability`, bukan endpoint Laravel.
- Validasi `propertyId`, `start/end`, dan optional `checkIn/checkOut` menghasilkan 400. Kegagalan Lodgify dipetakan menjadi 500 dengan pesan publik; rate limit route handler adalah 90 request/menit dan dapat menghasilkan 429.
- Availability adalah data REST; rate quote merupakan request terpisah `GET /api/lodgify/rate-quote` dengan limit 60 request/menit. Diagram asli tidak wajib memuat rate quote jika judulnya hanya availability, tetapi blueprint revisi menempatkannya sebagai opsi setelah rentang dipilih.

Blueprint: [10-sequence-availability-revised.puml](diagrams/10-sequence-availability-revised.puml).

## 2. Pemesanan Villa

**Yang digambarkan.** Pengunjung memilih reservasi, Next.js memanggil `buildLodgifyCheckoutUrl()`, URL checkout dibentuk, lalu browser diarahkan ke domain checkout Lodgify. Catatan diagram bahwa tidak ada komunikasi server-to-server Laravel–Lodgify sudah benar.

**Kesesuaian source.** `lib/lodgify/booking.ts` hanya membangun URL `https://checkout.lodgify.com/...`; `AvailabilityCalendar.tsx` memvalidasi detail lalu menjalankan `window.location.href = checkoutUrl`. Tidak terdapat `POST /booking`, controller booking Laravel, model/migration `bookings`, atau tabel booking MySQL.

**Koreksi spesifik.**

- Tampilkan `buildBookingWhatsAppUrl()` dan `https://wa.me/...` sebagai kanal alternatif yang benar-benar ada.
- URL actual menambahkan `propertyId`/`property_id` dan—bila tersedia—parameter tanggal serta tamu. Diagram tidak boleh menyiratkan bahwa checkout adalah respons Lodgify REST API.
- Beri alternatif validasi lokal: tanggal, jumlah tamu, availability, minimum stay, atau URL checkout tidak valid menghentikan redirect dan menampilkan pesan/fallback WhatsApp.

Blueprint: [11-sequence-booking-revised.puml](diagrams/11-sequence-booking-revised.puml).

## 3. Pembaruan Konten CMS

**Yang digambarkan.** Admin mengubah konten dalam Filament; Laravel menyimpan ke MySQL, menghapus cache, dan Next.js lalu memperoleh konten terbaru.

**Kesesuaian source.** Resource Filament menggunakan model Eloquent; perubahan artikel, halaman, galeri, FAQ, service card, testimonial, dan site setting memang menjalankan model event `Cache::forget()`. Berkas pada resource tertentu ditulis ke disk `public`. CMS API memakai `Cache::remember(..., 300)` untuk data umum.

**Koreksi spesifik.**

- Lifeline “Laravel Controller” terlalu sempit untuk operasi panel: jalur yang akurat adalah Admin → Filament Resource/Livewire → Eloquent Model → MySQL/public storage. Controller `CmsController` melayani **pembacaan** API publik, bukan penyimpanan form Filament.
- `Cache::forget()` hanya menghapus key cache Laravel. Tidak ada webhook, event push, maupun `revalidatePath`/on-demand revalidation Next.js yang dipanggil Laravel.
- Next.js mengambil ulang melalui request atau revalidation berikutnya; bukan menerima request langsung dari Laravel. Diagram semula perlu koreksi besar karena pesan dari cache ke Next.js membuat hubungan push yang keliru.

Blueprint: [12-sequence-cms-update-revised.puml](diagrams/12-sequence-cms-update-revised.puml).

## 4. Login dan Sinkronisasi Wishlist

**Yang digambarkan.** User login melalui AuthModal/AuthProvider, Laravel memeriksa MySQL, token disimpan di localStorage, kemudian wishlist lokal disinkronkan.

**Kesesuaian source.** `AuthController::login()` membuat Sanctum personal access token; `lib/auth-client.ts` menyimpannya di localStorage. `components/villas/savedVillas.ts` menyimpan IDs lokal, mengirim bearer token ke `POST /v1/wishlist/sync`, kemudian menulis respons IDs kembali ke localStorage. `WishlistController::sync()` menghitung IDs baru dan menggunakan `firstOrCreate` per ID.

**Koreksi spesifik.**

- Ganti pesan sinkronisasi generik dengan endpoint tepat `POST /api/v1/wishlist/sync` (frontend membangun basis `/api` lalu path `/v1/...`) dan payload `{ ids: string[] }`; maksimum 200 ID numerik.
- Tampilkan alternatif: tanpa local IDs, frontend memakai `GET /v1/wishlist`; aksi simpan/hapus saat sudah login memakai `POST /v1/wishlist` atau `DELETE /v1/wishlist/{lodgifyPropertyId}` tanpa login ulang.
- `personal_access_tokens` adalah tabel Sanctum polimorfik (`tokenable_type/tokenable_id`), bukan FK database langsung ke `users`; token mentah hanya hadir pada respons login dan localStorage, tidak disimpan sebagai nilai mentah di tabel.

Blueprint: [13-sequence-login-wishlist-revised.puml](diagrams/13-sequence-login-wishlist-revised.puml).

## Kesimpulan

Tidak satu pun diagram asli menggambarkan Google OAuth atau booking internal. Bagian tersebut konsisten dengan source code. Revisi dipisahkan agar diagram laporan asli tetap dapat ditinjau bersama daftar koreksi ini.
