# 03 — Blueprint Flowchart

## Notasi

Blueprint memakai **Mermaid flowchart**, bukan notasi Activity Diagram UML. Simbol yang digunakan: terminator `([ ])`, proses `[ ]`, input/output `[/ /]`, keputusan `{ }`, database `[( )]`, dan external service `[[ ]]`.

## 1. Flowchart Sistem Berjalan/Lama

Sumber konteks sistem lama diberikan pemilik project; alur ini tidak diklaim sebagai bagian dari source Next/Laravel saat ini.

| Jenis node | Node |
|---|---|
| Start/end | Mulai; Selesai/lanjut membaca; Admin mulai |
| Proses | Melihat informasi villa; cek/booking di Lodgify; memperbarui WordPress |
| Input/output | Membuka WordPress; redirect ke Lodgify terpisah |
| Database | Database/CMS WordPress |
| Decision | Perlu cek availability atau booking? |

Urutan panah: pengunjung membuka WordPress → melihat informasi → keputusan kebutuhan booking → (tidak) selesai/terus membaca, atau (ya) redirect ke Lodgify terpisah → cek/booking eksternal. Jalur admin: Admin mulai → update WordPress → database WordPress → informasi villa.

Kode: [03-flowchart-system-old.mmd](diagrams/03-flowchart-system-old.mmd).

## 2. Flowchart Perancangan Sistem Baru

| Jenis node | Node |
|---|---|
| Start/end | Mulai; Selesai; Admin mulai; Selesai admin |
| Proses | Request CMS, return cache, render frontend, tampilkan detail, CRUD konten, invalidasi cache |
| Input/output/external | Akses Next.js; filter pencarian; redirect Lodgify Checkout; buka WhatsApp; Lodgify REST API v2 |
| Database | MySQL konten CMS; MySQL/public storage |
| Decision | Cache CMS tersedia?; melakukan pencarian?; villa ditemukan?; kanal booking?; role admin? |

Urutan pengunjung: Next.js → Laravel CMS → cek cache → (miss) MySQL lalu simpan cache → render → pencarian → Lodgify → hasil/detail/kalender → Lodgify Checkout atau WhatsApp. Urutan admin: login Filament → validasi role → pilih modul → CRUD → MySQL/storage → invalidasi cache → request CMS berikutnya mengambil data baru.

Keterbatasan yang dipertahankan dalam blueprint: invalidasi Laravel cache tidak memicu revalidate Next.js secara on-demand. Panah putus-putus dari invalidasi hanya bermakna data digunakan pada request/revalidate berikutnya, bukan request yang dipicu Laravel.

Kode: [04-flowchart-system-new.mmd](diagrams/04-flowchart-system-new.mmd).
