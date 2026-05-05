---
trigger: always_on
---

# DESIGN SYSTEM

## 1. Base Unit System

Gunakan sistem 4px scale (4pt grid):

* 4px (1 unit)
* 8px (2 unit)
* 12px (3 unit)
* 16px (4 unit)
* 24px (6 unit)
* 32px (8 unit)
* 48px (12 unit)
* 64px (16 unit)

Semua spacing, margin, padding HARUS mengikuti skala ini.

---

## 2. Container System (Wajib Konsisten)

### Max Width:

* Mobile: 100%
* Tablet: max-w-3xl (768px)
* Desktop: max-w-7xl (1280px)
* Large Desktop: max-w-[1440px]

### Padding Horizontal:

* Mobile: px-4 (16px)
* Tablet: px-6 (24px)
* Desktop: px-8 (32px)

### Rule:

Semua section HARUS pakai:
"w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl"

---

## 3. Height System (WAJIB PAKAI PX)

Semua tinggi container/section HARUS pakai px:

### Section Height:

* Small: 400px
* Medium: 600px
* Large: 800px
* Hero: 900px - 1000px

### Card Height:

* Small Card: h-[180px]
* Medium Card: h-[240px]
* Large Card: h-[320px]

---

## 4. Typography Scale

Gunakan skala berikut:

* H1: text-4xl md:text-5xl lg:text-6xl font-bold
* H2: text-3xl md:text-4xl font-semibold
* H3: text-2xl md:text-3xl font-semibold
* Body: text-base md:text-lg
* Small: text-sm

Line height:

* Heading: leading-tight
* Body: leading-relaxed

---

## 5. Color System (Minimal Professional)

Primary for background: #FAFAF9
for heading: #446B4A
for dark accent and paragraf: #2E2E2C
for else sesuaikan saja: #C7A58A
* Border: #2E2E2C or #C7A58A

---

## 6. Border Radius

* Small: rounded-md
* Medium: rounded-xl
* Large: rounded-2xl

---

## 7. Shadow System

* Card: shadow-md
* Hover: hover:shadow-xl transition-all duration-300

---

## 8. Grid System

Gunakan 12 column grid:

* Mobile: grid-cols-1
* Tablet: grid-cols-2
* Desktop: grid-cols-3 / grid-cols-4

Gap WAJIB:

* gap-4 (mobile)
* gap-6 (tablet)
* gap-8 (desktop)


# LAYOUT GUIDELINES

## 1. Section Structure (WAJIB)

Setiap section HARUS:

<section class="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">

---

## 2. Vertical Spacing Antar Section (WAJIB)

Gunakan translate Y, BUKAN margin:

* Mobile: translate-y-[40px]
* Tablet: md:translate-y-[60px]
* Desktop: lg:translate-y-[80px]

Setiap section HARUS:
"transform translate-y-[40px] md:translate-y-[60px] lg:translate-y-[80px]"

---

## 3. Internal Spacing Section

Gunakan padding vertical:

* py-[60px] (mobile)
* md:py-[80px]
* lg:py-[100px]

---

## 4. Content Alignment

Default:

* text-left (professional UI)

Center hanya untuk:

* hero
* CTA

---

## 5. Flex Rules

Gunakan:

* flex flex-col (mobile)
* md:flex-row (tablet+)

JANGAN hardcode positioning aneh.

---

## 6. Card Layout

Card wajib:

* p-6
* rounded-xl
* shadow-md
* h-[fixed px]

---

## 7. Image Handling

* object-cover
* w-full h-full
* rounded-xl

---

## 8. Button System

Primary:

* px-6 py-3
* rounded-xl
* bg-primary text-white

Hover:

* hover:scale-105
* transition-all duration-300

---

## 9. White Space Rule

WAJIB:

* Tidak boleh elemen terlalu rapat
* Gunakan space-y-6 / space-y-8 untuk vertical stack
* Gunakan gap-6 untuk grid

---

## 10. Responsive Rule (CRITICAL)

Mobile-first:

* Default = mobile
* md: = tablet
* lg: = desktop

JANGAN langsung pakai desktop dulu



# UI RULES (STRICT)

## 1. DILARANG:

* Tidak boleh pakai margin random (mt-3, mb-5 tanpa sistem)
* Tidak boleh container kecil (max-w-md untuk layout utama)
* Tidak boleh spacing tidak konsisten
* Tidak boleh height pakai auto untuk section utama

---

## 2. WAJIB:

* Semua section pakai container system
* Semua height pakai px
* Semua spacing pakai scale 4px system
* Semua layout pakai grid/flex yang jelas

---

## 3. CONSISTENCY RULE

Jika 1 card:

* h-[240px]

Maka semua card HARUS sama.

---

## 4. AI CONTROL PROMPT (WAJIB DIPAKAI)

Selalu tambahkan:

"Follow design-system.md, layout-guidelines.md, and ui-rules.md strictly. Do not improvise spacing or sizing outside defined system."

---

## 5. VISUAL HIERARCHY

Urutan WAJIB:

1. Title (besar)
2. Subtitle
3. Content
4. Action (button)

---

## 6. PROFESSIONAL STANDARD

UI harus:

* clean
* breathable (banyak whitespace)
* tidak sempit
* tidak menempel

---

## 7. DEBUG RULE

Jika UI terlihat:

* sempit → tambah max-width
* padat → tambah gap
* jelek → perbaiki hierarchy

---

## 8. FINAL CHECKLIST

Sebelum output:

* ✔ Container benar
* ✔ Spacing konsisten
* ✔ Height pakai px
* ✔ Responsive jalan
* ✔ Tidak ada elemen nabrak
