# 10 — Ringkasan Eksekutif Audit Summerhouses

## Status akhir audit

Audit source, koreksi blueprint, validasi diagram laporan, dan Black Box Testing lokal telah selesai. Tidak ada UI, business logic, atau laporan Word yang diubah. Hasil runtime terbaru adalah **31 skenario berhasil, 0 gagal, dan 8 Tidak Dapat Diuji**; lihat `08-black-box-testing.md`.

## Yang sudah benar

- Arsitektur source benar-benar terdiri dari Next.js App Router, Laravel REST API, Filament, MySQL, dan Lodgify REST API v2.
- Pencarian/detail villa, availability, rate quote, auth OTP/Sanctum, reset/ganti password, wishlist server, kontak, review, owner testimonial, dan CMS API terbukti berjalan pada pengujian lokal.
- Admin dibatasi oleh `users.role=admin` dan `canAccessPanel()`; akses tanpa sesi diarahkan ke login Filament.
- Cache CMS Laravel bertTL 300 detik dan model konten menghapus key terkait saat data berubah. Uji review membuktikan key cache review terhapus.
- Empat Sequence Diagram asli, ERD, dan Class Diagram sudah tersedia untuk dibandingkan; verdict serta blueprint revisi tersimpan di dokumen audit.

## Yang belum sesuai, belum tersedia, atau harus dikoreksi di laporan

- Google OAuth tidak ditemukan di source dan tidak termasuk implementasi aktif.
- Booking tidak disimpan Laravel/MySQL; aplikasi hanya membangun URL Lodgify Checkout atau WhatsApp.
- Tidak ada scheduler Laravel untuk sinkronisasi villa Lodgify; sinkronisasi terjadi saat Homepage Manager dimuat.
- Social dan SEO site settings masih placeholder.
- `Cache::forget()` tidak menjalankan on-demand revalidation Next.js; data baru dipakai pada request/revalidation berikutnya.
- Sequence Diagram CMS asli perlu menghapus asumsi push Laravel ke Next.js. Diagram availability perlu route handler/validasi; booking perlu WhatsApp; wishlist perlu `POST /v1/wishlist/sync` dan `firstOrCreate`.
- ERD perlu menghapus tabel `tags`, menambahkan `otp_codes` dan `testimonial_audits`, serta melengkapi FK testimonial final. Class Diagram perlu menghapus area placeholder `Process` dan tidak menambah booking internal/OAuth.

## Fitur belum selesai atau belum teruji penuh

1. Google OAuth — belum tersedia, bukan sekadar tidak terkonfigurasi.
2. Booking internal dan penyimpanan booking lokal — tidak tersedia; ini sesuai rancangan delegasi Lodgify jika dinyatakan demikian di laporan.
3. Scheduler sync Lodgify — belum tersedia.
4. Social dan SEO site settings — placeholder.
5. CRUD/admin/moderasi dan penolakan user non-admin terautentikasi — belum teruji karena tidak ada akun QA yang aman.
6. Wishlist `localStorage` melalui UI dan navigasi aktual ke layanan eksternal — belum teruji melalui browser stabil.

## Status diagram

- Dibuat/koreksi: dua Use Case Diagram, dua Flowchart, empat Activity Diagram, Deployment Diagram rancangan Dewaweb, serta empat blueprint revisi Sequence Diagram.
- Tidak perlu dibuat: diagram Google OAuth, booking internal, atau satu diagram per resource CMS.
- Deployment Dewaweb tetap berstatus **Planned Production Environment / Rencana Lingkungan Produksi** setelah sidang; Lodgify berada di luar node hosting.

## Temuan dan prioritas revisi

| Prioritas | Kategori | Temuan / tindakan |
|---|---|---|
| Critical | Ketidaksesuaian laporan | Jangan menyatakan Google OAuth, POST booking Laravel, tabel booking MySQL, atau deployment Dewaweb telah aktif. Semua bertentangan dengan source/rencana proyek. |
| High | Ketidaksesuaian diagram/data | Koreksi Sequence CMS (tidak ada push cache → Next), ERD `tags`, dan tabel/relasi final OTP-audit-testimonial. |
| High | Risiko environment | Rate limit API lokal berbasis IP dapat habis karena Next SSR dan CLI memakai `127.0.0.1` yang sama. Pastikan deployment/proxy meneruskan IP klien dan lakukan uji beban. |
| Medium | Keterbatasan fitur | Tidak ada scheduler Lodgify dan belum ada on-demand revalidation Next.js setelah invalidasi cache Laravel. |
| Medium | Kualitas HTTP | Detail villa tak ditemukan menampilkan UI `Villa not found`, namun respons HTTP adalah 200, bukan 404. Tetapkan apakah fallback UI atau semantik 404 yang diinginkan pada laporan/SEO. |
| Medium | Keterbatasan pengujian | Admin CRUD, moderasi, dan penolakan non-admin terautentikasi belum dapat diuji tanpa akun QA. |
| Low | Dokumentasi | README root/backend masih template framework dan belum menjadi petunjuk deployment proyek. |

## Klasifikasi temuan

- **Bug aplikasi terverifikasi:** tidak ada skenario yang menghasilkan status Gagal. Respons detail yang tidak ditemukan berstatus 200 dicatat sebagai isu semantik/SEO untuk keputusan proyek, bukan diputuskan sebagai bug tanpa requirement 404.
- **Keterbatasan environment:** rate limit lokal bersama, timeout snapshot Playwright pada halaman detail besar, dan tidak tersedianya mailbox/admin QA.
- **Fitur belum tersedia:** Google OAuth, booking internal, scheduler Lodgify, serta Social/SEO setting final.
- **Perilaku sesuai rancangan:** booking didelegasikan ke Lodgify Checkout/WhatsApp; wishlist memakai localStorage lalu sync Sanctum; invalidasi Laravel cache tidak memicu Next.js langsung.

## Data yang masih perlu diberikan manual

- Akun QA admin dan user non-admin untuk Filament, lengkap dengan izin penggunaan data dummy.
- Mailbox sandbox untuk OTP/Resend serta sandbox Lodgify/WhatsApp bila ingin uji end-to-end eksternal.
- Keputusan requirement HTTP 404 untuk detail villa tidak ditemukan.
- Detail paket Dewaweb yang akan digunakan (Node.js persistent process, reverse proxy, cron, MySQL, storage, backup) untuk finalisasi deployment.

## Dokumen audit

- `01-feature-inventory.md` sampai `10-executive-summary.md`
- `diagrams/01` sampai `13` (Use Case, Flowchart, Activity, Deployment, dan revisi Sequence Diagram)
