# 09 — Validasi Database, ERD, dan Class Diagram

## Basis audit dan skema aktual

Audit memakai seluruh migration, model Eloquent, serta ERD dan Class Diagram PNG asli yang diberikan. Migration lokal telah berstatus `Ran`; skema final, bukan bentuk migration awal, menjadi acuan.

- Ada **19 tabel** yang didefinisikan migration aplikasi/framework: `users`, `password_reset_tokens`, `failed_jobs`, `personal_access_tokens`, `wishlists`, `site_settings`, `media`, `page_sections`, `homepage_villa_selections`, `bali_collections`, `articles`, `testimonials`, `faqs`, `service_cards`, `gallery_items`, `contact_submissions`, `villa_caches`, `otp_codes`, dan `testimonial_audits`.
- Dengan tabel Laravel `migrations`, instalasi penuh lazimnya memiliki **20 tabel**.
- Tidak ada migration `cache`; environment lokal memakai cache file. Tidak ada migration/model `bookings`, `villas` sebagai master lokal, atau Google OAuth.

## ERD asli — verdict: Perlu koreksi besar

ERD sudah mencakup banyak tabel domain awal (`users`, `personal_access_tokens`, `wishlists`, `media`, konten CMS, `villa_caches`, dan `testimonials`). Namun diagram belum merepresentasikan skema final hasil migration lanjutan dan memuat satu tabel yang tidak ada.

| Kategori | Validasi terhadap ERD asli |
|---|---|
| Sudah sesuai | `wishlists` memiliki `user_id` dan relasi 1:N dari `users`; `media.uploaded_by` mengarah opsional ke user; `homepage_villa_selections`, `bali_collections`, `page_sections`, `articles`, `faqs`, `service_cards`, `gallery_items`, `contact_submissions`, dan `site_settings` memang tabel domain. `personal_access_tokens` memang digunakan Sanctum. |
| Tabel yang wajib ditambah/ditunjukkan | `otp_codes` dan `testimonial_audits` diperlukan agar flow OTP dan moderasi review akhir dapat dijelaskan. `testimonial_audits.testimonial_id → testimonials.id` dan `actor_id → users.id` adalah FK aktual. |
| Relasi wajib yang belum lengkap | `testimonials.villa_cache_id → villa_caches.id` (nullable); `testimonials.created_by_id`, `updated_by_id`, `moderated_by_id → users.id` (nullable); serta `media.uploaded_by → users.id` (nullable). |
| Struktur testimonial tidak mutakhir | Tabel final memiliki `type`, `status`, placement (`show_on_*`), data moderasi, `villa_cache_id`, dan soft delete. ERD lama hanya cocok dengan struktur testimonial awal sehingga tidak cukup untuk menjelaskan guest review/owner testimonial dan moderasi. |
| Tabel/relasi salah | `tags` tampak sebagai tabel tersendiri pada ERD, tetapi tidak ada migration atau model `Tag`. `articles.tags` adalah kolom JSON; relasi many-to-many artikel–tag tidak ditemukan. |
| Boleh di narasi | `migrations`, `password_reset_tokens`, `failed_jobs`, dan detail Sanctum boleh dijelaskan dalam narasi/appendix bila ERD hanya difokuskan pada domain. Tetap sebutkan `otp_codes` karena dipakai langsung oleh registrasi dan reset password. |
| Perlu ditegaskan | `personal_access_tokens.tokenable_type/tokenable_id` adalah relasi polimorfik Sanctum tanpa foreign key database eksplisit. `lodgify_property_id` di wishlist/gallery dan `lodgify_id` di villa cache mereferensikan Lodgify secara aplikasi, bukan FK ke master villa MySQL. |

## Tabel, PK, FK, dan relasi akhir

| Kelompok | Tabel (PK) | FK/relasi database | Method Eloquent yang ada |
|---|---|---|---|
| Identitas | `users` (`id`) | Parent untuk media dan kolom audit/moderasi testimonial; Sanctum polymorphic tokenable | `HasApiTokens`; inverse domain `hasMany` tidak didefinisikan. |
| Auth | `password_reset_tokens` (`email`), `personal_access_tokens` (`id`), `otp_codes` (`id`) | Tokenable Sanctum tidak memiliki FK eksplisit; OTP memakai email tanpa FK | `OtpCode` menyediakan scope email/type/valid. |
| Wishlist | `wishlists` (`id`) | `user_id → users.id` cascade; unique `(user_id, lodgify_property_id)` | `Wishlist::user()` belongsTo. |
| CMS | `page_sections`, `homepage_villa_selections`, `bali_collections`, `articles`, `faqs`, `service_cards`, `gallery_items`, `site_settings` (semua `id`) | Tidak ada FK Lodgify pada selection/gallery | Tidak ada relasi Eloquent antar tabel konten yang didefinisikan. |
| Media | `media` (`id`) | `uploaded_by → users.id`, nullOnDelete | `Media::uploader()` belongsTo. Banyak upload Filament juga langsung ke `public` tanpa record media. |
| Villa/review | `villa_caches` (`id`), `testimonials` (`id`), `testimonial_audits` (`id`) | Testimonial → villa/users nullable; audit → testimonial cascade, audit → user nullable | `Testimonial::villa/createdBy/updatedBy/moderatedBy/audits`; `TestimonialAudit::testimonial/actor`. `VillaCache` tidak mendefinisikan inverse. |
| Independen | `contact_submissions` (`id`), `failed_jobs` (`id`) | Tidak ada FK | Tidak ada relasi domain. |

## Class Diagram asli — verdict: Perlu koreksi besar

Class Diagram sudah membedakan domain user/wishlist, model CMS, dan adaptor Lodgify. Namun ia masih merupakan model awal dan memiliki area placeholder `Process`, sehingga belum menyajikan kelas/relasi final secara lengkap.

| Temuan | Koreksi yang diperlukan |
|---|---|
| User | Pertahankan `User` sebagai `Authenticatable` + `HasApiTokens` dan `canAccessPanel()`. Jangan menambahkan `User::wishlists/media/testimonials` sebagai method jika menggambarkan source secara literal: FK ada, tetapi inverse method tidak ditulis. |
| Wishlist | Tampilkan `Wishlist::user()` dan unique `(user_id, lodgify_property_id)`. `firstOrCreate` adalah operasi controller, bukan method model yang perlu dijadikan relasi. |
| Testimonial/moderasi | Tambahkan `TestimonialAudit`, `VillaCache`, atribut type/status/placement, serta relasi `villa`, creator/updater/moderator, dan `audits`. |
| Auth | Tambahkan `OtpCode` atau jelaskan di narasi karena registrasi/reset berjalan melalui OTP. OAuth tidak boleh ditambahkan. |
| Konten/artikel | `Article.tags` dan `content` adalah JSON; jangan membuat kelas/tabel `Tag` sebagai relasi database. |
| Lodgify/booking | `LodgifyService` Laravel hanya mengelola cache/sinkronisasi villa. Integrasi live frontend berada pada `lib/lodgify`; checkout/WhatsApp hanya URL builder. Tidak ada kelas Booking Laravel. |
| Placeholder | Blok `Process` pada diagram asli perlu dihapus atau diganti dengan kelas/operasi nyata; placeholder tidak dapat divalidasi terhadap source. |

## Perbedaan FK database dan relasi Eloquent

FK adalah aturan integritas skema (misalnya `wishlists.user_id → users.id`). Method Eloquent adalah navigasi object model (misalnya `Wishlist::user()`). Keduanya tidak selalu simetris: source memiliki FK dari wishlist/media/testimonial ke user, tetapi `User` tidak mendefinisikan inverse `hasMany`. Sebaliknya, Sanctum bekerja dengan pasangan kolom polimorfik `tokenable_type/tokenable_id` tanpa FK database langsung.

## Kesimpulan koreksi laporan

ERD sebaiknya tetap berfokus pada domain tetapi diperbarui untuk menghapus `tags`, menambahkan OTP/audit, dan melengkapi FK testimonial final. Tabel framework yang tidak menjadi fokus domain boleh dijelaskan naratif. Class Diagram harus menghapus placeholder serta tidak mengklaim booking internal, Google OAuth, atau relasi Eloquent inverse yang tidak terdapat pada source.
