"use client";

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';

const VillaCollection = () => {
    // State untuk Neighborhood Selector
    const [activeLocation, setActiveLocation] = useState("Curated");
    const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);

    // Data Lokasi Dinamis (Menu -> Gallery)
    const locationData = {
        "Curated": {
            desc: "Spaces chosen for their design, comfort, and a sense of living. Each one offering a stay that feels considered, personal, and effortless.",
            btn: "View Entire Collection",
            images: ["/homepage_villa/curated-5-lounge.webp", "/homepage_villa/curated-8.webp", "/homepage_villa/curated-3-corner.webp", "/homepage_villa/curated-4-view.webp", "/homepage_villa/curated-5-lounge.webp"]
        },
        "Canggu": {
            desc: "Reflecting the dynamic spirit of Canggu. A calming hideaway surrounded by the vibrant surf culture and modern Balinese lifestyle.",
            btn: "View Villas in Canggu",
            images: ["/homepage_villa/88east.webp", "/homepage_villa/officiana17.webp", "/homepage_villa/curated-8.webp", "/homepage_villa/curated-3-corner.webp", "/homepage_villa/curated-5-lounge.webp"]
        },
        "Ubud": {
            desc: "Immerse in the cultural heart. Sanctuaries surrounded by lush jungle, flowing rivers, and a profound sense of tranquility.",
            btn: "View Villas in Ubud",
            images: ["/homepage_villa/VillaZen.webp", "/homepage_villa/curated-4-view.webp", "/homepage_villa/curated-5-lounge.webp", "/homepage_villa/curated-8.webp", "/homepage_villa/curated-3-corner.webp"]
        },
        "Pererenan": {
            desc: "Quiet luxury on the black sands. Slower-paced living with sophisticated architecture and untouched local charm.",
            btn: "View Villas in Pererenan",
            images: ["/homepage_villa/CactusEstate.webp", "/homepage_villa/curated-8.webp", "/homepage_villa/curated-3-corner.webp", "/homepage_villa/curated-5-lounge.webp", "/homepage_villa/curated-4-view.webp"]
        },
        "Umalas": {
            desc: "The hidden gem between the bustling coasts. Exclusive sprawling estates nestled in tranquil residential avenues.",
            btn: "View Villas in Umalas",
            images: ["/homepage_villa/villaarta.webp", "/homepage_villa/curated-3-corner.webp", "/homepage_villa/curated-5-lounge.webp", "/homepage_villa/curated-4-view.webp", "/homepage_villa/curated-8.webp"]
        },
        "Legian": {
            desc: "Classic coastal living redefined. Timeless spaces just steps away from the iconic sunsets and vibrant streets.",
            btn: "View Villas in Legian",
            images: ["/homepage_villa/rumahmimosa.webp", "/homepage_villa/curated-5-lounge.webp", "/homepage_villa/curated-3-corner.webp", "/homepage_villa/curated-8.webp", "/homepage_villa/curated-4-view.webp"]
        },
        "Padonan": {
            desc: "Where modern design meets sprawling rice fields. Expansive, peaceful retreats slightly removed from the coastal rush.",
            btn: "View Villas in Padonan",
            images: ["/homepage_villa/88east.webp", "/homepage_villa/VillaZen.webp", "/homepage_villa/curated-8.webp", "/homepage_villa/curated-4-view.webp", "/homepage_villa/curated-3-corner.webp"]
        }
    };

    const currentData = locationData[activeLocation as keyof typeof locationData];
    const currentTextWords = currentData.desc.split(" ");
    const staysText = "The Stays".split(" ");

    // Referensi untuk Container Curated Spaces (untuk efek Parallax)
    const curatedRef = useRef(null);

    // Hitung posisi scroll saat user melewati area Curated Spaces
    const { scrollYProgress } = useScroll({
        target: curatedRef,
        offset: ["start end", "end start"] // Mulai saat ujung atas terlihat, selesai saat ujung bawah hilang
    });

    // Bikin variasi kecepatan gerak (Micro Parallax yang Elegan & Cerdas)
    const y1 = useTransform(scrollYProgress, [0, 1], [15, -15]);
    const y2 = useTransform(scrollYProgress, [0, 1], [25, -25]);
    const y3 = useTransform(scrollYProgress, [0, 1], [8, -8]);
    const y4 = useTransform(scrollYProgress, [0, 1], [20, -20]);
    const y5 = useTransform(scrollYProgress, [0, 1], [35, -35]);
    return (
        // 1. Tag Section dengan Jarak Atas(pt) dan Bawah(pb) yang lega untuk Desktop
        <section className="w-full bg-[#FAFAF9] pt-[150px] h-[1800px] lg:h-[3200px] pb-[350px]" style={{ touchAction: 'pan-y' }}>

            {/* 2. Container Pembungkus Lebar Konten */}
            <div className="max-w-8xl mx-auto px-0 md:px-8 lg:px-12 relative top-[-10px] lg:top-[-0px] bottom-[-10px] md:bottom-[-80px] md:right-[-86px] mt-[180px] mb-[300px] md:mt-[150px] md:mb-[0px]">

                {/* ============================================== */}
                {/* MOBILE FULLY CUSTOM VERSION (Berdasarkan Screenshot) */}
                {/* ============================================== */}
                <div className="block md:hidden w-full overflow-visible">
                    {/* Header Mobile */}
                    <div className="flex justify-between items-end w-full px-5 mb-5 mt-8">
                        <h2 className="text-[32px] relative right-[-20px] lg:right-[-0px] bottom-[-10px] lg:top-[-0px] text-[#446B4A]" style={{ fontFamily: 'var(--font-playfair), serif' }}>The Collection</h2>
                        <span className="text-[#805621] relative top-[5px] lg:top-[-0px] right-[30px] lg:right-[-0px] bottom-[-10px] lg:top-[-0px] text-[15px] lg:text-[0px] italic underline decoration-[#805621] decoration-[1px] underline-offset-[11px]" style={{ fontFamily: 'var(--font-playfair), serif' }}>View All</span>
                    </div>

                    {/* Horizontal Scroll Cards Mobile */}
                    <div className="flex w-[400px] overflow-x-auto pb-20 lg:pb-0 relative bottom-[-40px] lg:bottom-[-0px] right-[-20px] lg:right-[-0px] snap-x snap-mandatory gap-5 pl-5 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', touchAction: 'pan-y' }}>

                        {/* KARTU 1 */}
                        <div className="flex flex-col w-[85vw] h-[600px] snap-center shrink-0 pb-27 lg:pb-0">
                            <div className="w-full aspect-[4/4.8] relative rounded-[12px] overflow-hidden bg-[#d7cfc5]">
                                <Image src="/homepage_villa/VillaZen.webp" alt="Zen River House" fill className="object-cover" />
                            </div>
                            <h3 className="text-[24px] text-[#1a1a19] relative bottom-[-6px] lg:bottom-[-0px] mt-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>Zen River House</h3>
                            <p className="text-[13px] leading-[1.6] relative bottom-[-10px] lg:bottom-[-0px] font-light text-[#5a5651] mt-3 mb-6" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                                A sanctuary of light and air, featuring expansive terraces that blur the line between indoor luxury and coastal wildness.
                            </p>
                            <div className="flex gap-5 relative bottom-[-18px] lg:mt-0 text-[10px] tracking-[0.05em] font-medium text-[#8F8A84] uppercase">
                                <span className="flex items-center gap-2">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C7A58A" strokeWidth="2"><path d="M3 7v13M21 7v13M3 12h18M5 7h14c1.1 0 2 .9 2 2v3H3V9c0-1.1.9-2 2-2z" /></svg>
                                    2 BEDROOMS
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C7A58A" strokeWidth="2"><path d="M4 14v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5M8 6h8M12 6V3" /></svg>
                                    1 BATHS
                                </span>
                            </div>
                        </div>

                        {/* KARTU 2 */}
                        <div className="flex flex-col w-[85vw] snap-center shrink-0">
                            <div className="w-full aspect-[4/4.8] relative rounded-[12px] overflow-hidden bg-[#d7cfc5]">
                                <Image src="/homepage_villa/CactusEstate.webp" alt="Cactus Estate" fill className="object-cover" />
                            </div>
                            <h3 className="text-[24px] text-[#1a1a19] relative bottom-[-6px] lg:bottom-[-0px] mt-5" style={{ fontFamily: 'var(--font-playfair), serif' }}>Cactus Estate</h3>
                            <p className="text-[13px] leading-[1.6] relative bottom-[-10px] lg:bottom-[-0px] font-light text-[#5a5651] mt-2 mb-5" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                                A quiet luxury estate embracing the untouched black sands, offering a slower-paced living wrapped in tropical elegance.
                            </p>
                            <div className="flex gap-5 relative bottom-[-18px] lg:mt-0 text-[10px] tracking-[0.05em] font-medium text-[#8F8A84] uppercase">
                                <span className="flex items-center gap-2">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C7A58A" strokeWidth="2"><path d="M3 7v13M21 7v13M3 12h18M5 7h14c1.1 0 2 .9 2 2v3H3V9c0-1.1.9-2 2-2z" /></svg>
                                    2 BEDROOMS
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C7A58A" strokeWidth="2"><path d="M4 14v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5M8 6h8M12 6V3" /></svg>
                                    2 BATHS
                                </span>
                            </div>
                        </div>

                        {/* KARTU 3 */}
                        <div className="flex flex-col w-[85vw] snap-center shrink-0">
                            <div className="w-full aspect-[4/4.8] relative rounded-[12px] overflow-hidden bg-[#d7cfc5]">
                                <Image src="/homepage_villa/officiana17.webp" alt="Officina 17" fill className="object-cover" />
                            </div>
                            <h3 className="text-[24px] text-[#1a1a19] relative bottom-[-6px] lg:bottom-[-0px] mt-5" style={{ fontFamily: 'var(--font-playfair), serif' }}>Officina 17</h3>
                            <p className="text-[13px] leading-[1.6] relative bottom-[-10px] lg:bottom-[-0px] font-light text-[#5a5651] mt-2 mb-5" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                                Reflecting the dynamic spirit of Canggu. A calming hideaway surrounded by vibrant culture and endless coastal energy.
                            </p>
                            <div className="flex gap-5 relative bottom-[-18px] lg:mt-0 text-[10px] tracking-[0.05em] font-medium text-[#8F8A84] uppercase">
                                <span className="flex items-center gap-2">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C7A58A" strokeWidth="2"><path d="M3 7v13M21 7v13M3 12h18M5 7h14c1.1 0 2 .9 2 2v3H3V9c0-1.1.9-2 2-2z" /></svg>
                                    2 BEDROOMS
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C7A58A" strokeWidth="2"><path d="M4 14v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5M8 6h8M12 6V3" /></svg>
                                    2 BATHS
                                </span>
                            </div>
                        </div>

                        {/* KARTU 4 */}
                        <div className="flex flex-col w-[85vw] snap-center shrink-0">
                            <div className="w-full aspect-[4/4.8] relative rounded-[12px] overflow-hidden bg-[#d7cfc5]">
                                <Image src="/homepage_villa/88east.webp" alt="88 East" fill className="object-cover" />
                            </div>
                            <h3 className="text-[24px] text-[#1a1a19] relative bottom-[-6px] lg:bottom-[-0px] mt-5" style={{ fontFamily: 'var(--font-playfair), serif' }}>88 East</h3>
                            <p className="text-[13px] leading-[1.6] relative bottom-[-10px] lg:bottom-[-0px] font-light text-[#5a5651] mt-2 mb-5" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                                Clean, sunlit, and intimate. A minimalistic haven offering absolute tranquility in the bustling heart of Canggu.
                            </p>
                            <div className="flex gap-5 relative bottom-[-18px] lg:mt-0 text-[10px] tracking-[0.05em] font-medium text-[#8F8A84] uppercase">
                                <span className="flex items-center gap-2">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C7A58A" strokeWidth="2"><path d="M3 7v13M21 7v13M3 12h18M5 7h14c1.1 0 2 .9 2 2v3H3V9c0-1.1.9-2 2-2z" /></svg>
                                    1 BEDROOMS
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C7A58A" strokeWidth="2"><path d="M4 14v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5M8 6h8M12 6V3" /></svg>
                                    1 BATHS
                                </span>
                            </div>
                        </div>

                        {/* KARTU 5 */}
                        <div className="flex flex-col w-[85vw] snap-center shrink-0">
                            <div className="w-full aspect-[4/4.8] relative rounded-[12px] overflow-hidden bg-[#d7cfc5]">
                                <Image src="/homepage_villa/villaarta.webp" alt="Villa Arta" fill className="object-cover" />
                            </div>
                            <h3 className="text-[24px] text-[#1a1a19] relative bottom-[-6px] lg:bottom-[-0px] mt-5" style={{ fontFamily: 'var(--font-playfair), serif' }}>Villa Arta</h3>
                            <p className="text-[13px] leading-[1.6] relative bottom-[-10px] lg:bottom-[-0px] font-light text-[#5a5651] mt-2 mb-5" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                                Spacious architectural grandeur designed for slow living, tucked exclusively in the premier residential stretch of Umalas.
                            </p>
                            <div className="flex gap-5 relative bottom-[-18px] lg:mt-0 text-[10px] tracking-[0.05em] font-medium text-[#8F8A84] uppercase">
                                <span className="flex items-center gap-2">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C7A58A" strokeWidth="2"><path d="M3 7v13M21 7v13M3 12h18M5 7h14c1.1 0 2 .9 2 2v3H3V9c0-1.1.9-2 2-2z" /></svg>
                                    3 BEDROOMS
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C7A58A" strokeWidth="2"><path d="M4 14v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5M8 6h8M12 6V3" /></svg>
                                    3 BATHS
                                </span>
                            </div>
                        </div>

                        {/* KARTU 6 */}
                        <div className="flex flex-col w-[85vw] snap-center shrink-0">
                            <div className="w-full aspect-[4/4.8] relative rounded-[12px] overflow-hidden bg-[#d7cfc5]">
                                <Image src="/homepage_villa/rumahmimosa.webp" alt="Rumah Mimosa" fill className="object-cover" />
                            </div>
                            <h3 className="text-[24px] text-[#1a1a19] relative bottom-[-6px] lg:bottom-[-0px] mt-5" style={{ fontFamily: 'var(--font-playfair), serif' }}>Rumah Mimosa</h3>
                            <p className="text-[13px] leading-[1.6] relative bottom-[-10px] lg:bottom-[-0px] font-light text-[#5a5651] mt-2 mb-5" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                                A tropical modernist dream blending raw materials and lush vegetation for an effortlessly stylish island home.
                            </p>
                            <div className="flex gap-5 relative bottom-[-18px] lg:mt-0 text-[10px] tracking-[0.05em] font-medium text-[#8F8A84] uppercase">
                                <span className="flex items-center gap-2">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C7A58A" strokeWidth="2"><path d="M3 7v13M21 7v13M3 12h18M5 7h14c1.1 0 2 .9 2 2v3H3V9c0-1.1.9-2 2-2z" /></svg>
                                    2 BEDROOMS
                                </span>
                                <span className="flex items-center gap-2">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C7A58A" strokeWidth="2"><path d="M4 14v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5M8 6h8M12 6V3" /></svg>
                                    2 BATHS
                                </span>
                            </div>
                        </div>

                        {/* Balok spacing kosong di akhir agar bisa ditarik pol ke kiri */}
                        <div className="w-[10px] shrink-0"></div>
                    </div>
                </div>

                {/* ============================================== */}
                {/* DESKTOP VERSION (Layout Utama - 100% UTUH)     */}
                {/* ============================================== */}
                <div className="hidden md:block">
                    {/* 3. KOTAK ATAS (Menggunakan Flexbox memisah Kiri & Kanan) */}
                    <div className="flex justify-between items-end relative bottom-[-10px] left-[-10px]">
                        {/* Sisi Kiri (Teks) */}
                        <motion.div
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-100px" }}
                            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                            className="max-w-[600px]"
                        >
                            <motion.h2
                                className="text-[52px] text-[#4d6a52] mb-6 tracking-wide flex flex-wrap gap-x-3"
                                style={{ fontFamily: 'var(--font-playfair), serif' }}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-100px" }}
                                variants={{
                                    visible: { transition: { staggerChildren: 0.15 } }
                                }}
                            >
                                {staysText.map((word, i) => (
                                    <motion.span
                                        key={i}
                                        variants={{
                                            hidden: { opacity: 0, y: 40 },
                                            visible: { opacity: 1, y: 0, transition: { duration: 1, ease: [0.16, 1, 0.3, 1] } }
                                        }}
                                        className="inline-block"
                                    >
                                        {word}
                                    </motion.span>
                                ))}
                            </motion.h2>
                        </motion.div>

                        {/* Sisi Kanan (Area Tabs Filter) */}
                        <div className="flex gap-6 text-[11px] font-bold tracking-widest uppercase relative left-[-170px] top-[-40px]">
                            <span className="underline decoration-2 decoration-[#C7A58A] underline-offset-16 cursor-pointer text-[#50453A]">All Stay</span>
                            <span className="pb-8 text-[#50453A] cursor-pointer hover:text-[#1a1a19]">SHORT STAYS</span>
                            <span className="pb-8 text-[#50453A] cursor-pointer hover:text-[#1a1a19]">MONTHLY STAYS</span>
                        </div>
                    </div>

                    {/* 4. KOTAK BAWAH (Menggunakan Grid Desktop 3 Kolom) */}
                    {/* Perhatikan: Untuk mereset HP, cukup pakai grid-cols-1 md:grid-cols-3 */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
                        className=" max-w-7xl max-h-[1800px] mx-auto grid grid-cols-3 gap-x-[50px] gap-y-[120px] relative mt-[100px] bottom-[-100px] right-[-37px]"
                    >

                        {/* --- KARTU VILLA 1 --- */}
                        <div className="flex flex-col group cursor-pointer relative left-[-40px]">
                            <div className="w-full h-[500px] rounded-[12px] bg-[#d7cfc5] relative flex items-center justify-center overflow-hidden">
                                <Image src="/homepage_villa/VillaZen.webp" alt="Zen River House" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                <span className="absolute top-4 left-[0px] z-10 bg-[#ad8553] text-white text-[9px] font-bold min-w-[90px] h-[26px] flex items-center justify-center tracking-[0.2em] uppercase">
                                    Featured
                                </span>
                            </div>
                            <h3 className="text-[28px] relative bottom-[-10px] text-[#1a1a19] mt-10 group-hover:text-[#4d6a52] transition-colors duration-300" style={{ fontFamily: 'var(--font-playfair), serif' }}>Zen River House</h3>
                            <p className="text-[10px] relative bottom-[-10px] tracking-[0.15em] font-medium text-[#8F8A84] uppercase mt-3">
                                2 Beds • 1 Baths • Ubud
                            </p>
                        </div>

                        {/* --- KARTU VILLA 2 --- */}
                        <div className="flex flex-col group cursor-pointer">
                            <div className="w-full h-[400px] rounded-[12px] bg-[#d7cfc5] relative flex items-center justify-center overflow-hidden">
                                <Image src="/homepage_villa/CactusEstate.webp" alt="Cactus Estate" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                            </div>
                            <h3 className="text-[28px] relative bottom-[-10px] text-[#1a1a19] mt-10 group-hover:text-[#4d6a52] transition-colors duration-300" style={{ fontFamily: 'var(--font-playfair), serif' }}>Cactus Estate</h3>
                            <p className="text-[10px] relative bottom-[-13px] tracking-[0.15em] font-medium text-[#8F8A84] uppercase mt-3">
                                2 Beds • 2 Baths • Pererenan
                            </p>
                        </div>

                        {/* --- KARTU VILLA 3 --- */}
                        <div className="flex flex-col group cursor-pointer relative right-[-40px]">
                            <div className="w-full h-[500px] rounded-[12px] bg-[#d7cfc5] relative flex items-center justify-center overflow-hidden">
                                <Image src="/homepage_villa/officiana17.webp" alt="Officina 17" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                <span className="absolute top-4 left-[0px] z-10 bg-[#1a1a19] text-white text-[10px] font-bold min-w-[90px] h-[26px] flex items-center justify-center tracking-[0.2em] uppercase">
                                    Limited
                                </span>
                            </div>
                            <h3 className="text-[28px] relative bottom-[-10px] text-[#1a1a19] mt-10 group-hover:text-[#4d6a52] transition-colors duration-300" style={{ fontFamily: 'var(--font-playfair), serif' }}>Officina 17</h3>
                            <p className="text-[10px] relative bottom-[-13px] tracking-[0.15em] font-medium text-[#8F8A84] uppercase mt-3">
                                2 Beds • 2 Baths • Berawa, Canggu
                            </p>
                        </div>

                        {/* --- KARTU VILLA 4 --- */}
                        <div className="flex flex-col group cursor-pointer relative left-[-40px]">
                            <div className="w-full h-[400px] rounded-[12px] bg-[#d7cfc5] relative flex items-center justify-center overflow-hidden">
                                <Image src="/homepage_villa/88east.webp" alt="88 East" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                            </div>
                            <h3 className="text-[28px] relative bottom-[-10px] text-[#1a1a19] mt-10 group-hover:text-[#4d6a52] transition-colors duration-300" style={{ fontFamily: 'var(--font-playfair), serif' }}>88 East</h3>
                            <p className="text-[10px] relative bottom-[-13px] tracking-[0.15em] font-medium text-[#8F8A84] uppercase mt-3">
                                1 Beds • 1 Baths • Canggu
                            </p>
                        </div>

                        {/* --- KARTU VILLA 5 --- */}
                        <div className="flex flex-col group cursor-pointer">
                            <div className="w-full h-[500px] rounded-[12px] bg-[#d7cfc5] relative flex items-center justify-center overflow-hidden">
                                <Image src="/homepage_villa/villaarta.webp" alt="Villa Arta" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                            </div>
                            <h3 className="text-[28px] relative bottom-[-10px] text-[#1a1a19] mt-10 group-hover:text-[#4d6a52] transition-colors duration-300" style={{ fontFamily: 'var(--font-playfair), serif' }}>Villa Arta</h3>
                            <p className="text-[10px] relative bottom-[-13px] tracking-[0.15em] font-medium text-[#8F8A84] uppercase mt-3">
                                3 Beds • 3 Baths • Umalas
                            </p>
                        </div>

                        {/* --- KARTU VILLA 6 --- */}
                        <div className="flex flex-col group cursor-pointer relative right-[-40px]">
                            <div className="w-full h-[400px] rounded-[12px] bg-[#d7cfc5] relative flex items-center justify-center overflow-hidden">
                                <Image src="/homepage_villa/rumahmimosa.webp" alt="Rumah Mimosa" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
                                <span className="absolute top-4 left-[0px] z-10 bg-[#C7A58A] text-white text-[10px] font-bold min-w-[90px] h-[26px] flex items-center justify-center tracking-[0.2em] uppercase">
                                    New
                                </span>
                            </div>
                            <h3 className="text-[28px] relative bottom-[-10px] text-[#1a1a19] mt-10 group-hover:text-[#4d6a52] transition-colors duration-300" style={{ fontFamily: 'var(--font-playfair), serif' }}>Rumah Mimosa</h3>
                            <p className="text-[10px] relative bottom-[-13px] tracking-[0.15em] font-medium text-[#8F8A84] uppercase mt-3">
                                2 Beds • 2 Baths • Berawa, Canggu
                            </p>
                        </div>

                    </motion.div>

                    <div className="max-w-[250px] relative bottom-[-180px] right-[-550px] mt-[230px]">
                        <h3 className="text-[12px] text-center text-[#C7A58A] mt-6 tracking-[0.4em] font-bold" style={{ fontFamily: 'var(--font-inter), serif' }}>DISCOVER MORE</h3>
                    </div>

                </div> {/* Penutup "hidden md:block" (Batas Dunia Desktop) */}

            </div>

            {/* ========================================================= */}
            {/* --- START: EDITORIAL FRAMED SELECTOR (Golden Wrap) ---    */}
            {/* ========================================================= */}
            <div className="hidden md:flex w-full max-w-[1200px] mx-auto relative bottom-[-400px] right-[-150px] justify-center mt-[250px] mb-[120px] z-[999] px-4 pointer-events-none">
                <div className="border-y border-[#C7A58A] px-[40px] md:px-[80px] py-[80px] flex flex-wrap justify-center gap-x-10 md:gap-x-19 gap-y-10 bg-transparent pointer-events-auto relative z-[999]">
                    {['Curated', 'Canggu', 'Ubud', 'Pererenan', 'Umalas', 'Legian', 'Padonan'].map((neighborhood) => (
                        <button
                            key={neighborhood}
                            onClick={() => setActiveLocation(neighborhood)}
                            className={`relative text-[10px] md:text-[11px] font-bold tracking-[0.25em] uppercase transition-colors duration-500 hover:text-[#1a1a19] ${activeLocation === neighborhood ? 'text-[#1a1a19]' : 'text-[#A39D96]'}`}
                            style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                        >
                            {neighborhood === 'Curated' ? 'ALL SPACES' : neighborhood}

                            {/* Titik indikator kecil yang bergerak mengikuti menu yang aktif */}
                            {activeLocation === neighborhood && (
                                <motion.div
                                    layoutId="active-dot"
                                    className="absolute -bottom-[12px] left-1/2 w-[4px] h-[4px] bg-[#C7A58A] rounded-full"
                                    initial={false}
                                    style={{ translateX: '-50%' }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* ========================================================= */}
            {/* --- START: CURATED SPACES GALLERY (Dynamic Content) ---   */}
            {/* ========================================================= */}
            <div ref={curatedRef} className="hidden md:block max-w-[1500px] mx-auto w-full h-[700px] relative bottom-[-700px] mt-[50px] mb-[300px] pointer-events-none">

                {/* --- TEKS DAN TOMBOL VIEW GALLERY DI TENGAH --- */}
                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-[800px] text-center z-10 px-4 flex flex-col items-center pointer-events-none">
                    <AnimatePresence mode="wait">
                        <motion.h2
                            key={activeLocation + '-title'}
                            className="text-[28px] md:text-[34px] lg:text-[40px] text-[#2E2E2C] leading-[1.4] tracking-wide mb-8 flex flex-wrap justify-center gap-x-2"
                            style={{ fontFamily: 'var(--font-playfair), serif' }}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            variants={{
                                hidden: { opacity: 0 },
                                visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
                                exit: { opacity: 0, transition: { duration: 0.2 } }
                            }}
                        >
                            {currentTextWords.map((word, i) => (
                                <motion.span
                                    key={i}
                                    variants={{
                                        hidden: { opacity: 0, y: 15 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
                                    }}
                                    className="inline-block"
                                >
                                    {word}
                                </motion.span>
                            ))}
                        </motion.h2>
                    </AnimatePresence>

                    <AnimatePresence mode="wait">
                        <motion.button
                            key={activeLocation + '-btn'}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                            className="group flex items-center justify-between min-w-[220px] h-[56px] rounded-full bg-[#2E2E2C] px-6 transition-all duration-300 hover:bg-[#222] shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5 relative bottom-[-40px] pointer-events-auto"
                        >
                            <div className="w-[5px] h-[5px] rounded-full bg-white opacity-90" />
                            <span className="text-[14px] font-medium text-white tracking-wide px-4" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                {currentData.btn}
                            </span>
                            <div className="w-[5px] h-[5px] rounded-full bg-white opacity-90" />
                        </motion.button>
                    </AnimatePresence>
                </div>

                {/* --- FOTO-FOTO MELAYANG (Dengan Transisi Antar Lokasi) --- */}

                {/* Image 1 */}
                <div className="absolute top-[-120px] left-[5%] w-[220px] aspect-[16/11] shadow-xl z-20 group">
                    <div className="w-full h-full relative rounded-[12px] overflow-hidden bg-[#d7cfc5]">
                        <motion.div style={{ y: y1 }} className="absolute w-full h-[120%] -top-[10%]">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentData.images[0]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="w-full h-full relative">
                                    <Image src={currentData.images[0]} alt="Gallery 1" fill className="object-cover object-cover transition-transform duration-1000 group-hover:scale-105" />
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* Image 2 */}
                <div className="absolute top-[-100px] right-[10%] w-[160px] aspect-square shadow-xl z-20 group">
                    <div className="w-full h-full relative rounded-[12px] overflow-hidden bg-[#d7cfc5]">
                        <motion.div style={{ y: y5 }} className="absolute w-full h-[120%] -top-[10%]">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentData.images[1]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="w-full h-full relative">
                                    <Image src={currentData.images[1]} alt="Gallery 2" fill className="object-cover object-cover transition-transform duration-1000 group-hover:scale-105" />
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* Image 3 */}
                <div className="absolute top-[30%] right-[2%] w-[200px] aspect-[3/4] shadow-xl z-20 group">
                    <div className="w-full h-full relative rounded-[12px] overflow-hidden bg-[#d7cfc5]">
                        <motion.div style={{ y: y3 }} className="absolute w-full h-[110%] -top-[5%]">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentData.images[2]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="w-full h-full relative">
                                    <Image src={currentData.images[2]} alt="Gallery 3" fill className="object-cover object-cover transition-transform duration-1000 group-hover:scale-105" />
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* Image 4 */}
                <div className="absolute bottom-[5%] left-[8%] w-[240px] aspect-square shadow-xl z-20 group">
                    <div className="w-full h-full relative rounded-[12px] overflow-hidden bg-[#d7cfc5]">
                        <motion.div style={{ y: y4 }} className="absolute w-full h-[120%] -top-[10%]">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentData.images[3]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="w-full h-full relative">
                                    <Image src={currentData.images[3]} alt="Gallery 4" fill className="object-cover object-cover transition-transform duration-1000 group-hover:scale-105" />
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

                {/* Image 5 */}
                <div className="absolute bottom-[-150px] left-[42%] w-[240px] aspect-[16/15] shadow-xl z-20 group">
                    <div className="w-full h-full relative rounded-[12px] overflow-hidden bg-[#d7cfc5]">
                        <motion.div style={{ y: y2 }} className="absolute w-full h-[120%] -top-[10%]">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentData.images[4]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="w-full h-full relative">
                                    <Image src={currentData.images[4]} alt="Gallery 5" fill className="object-cover object-cover transition-transform duration-1000 group-hover:scale-105" />
                                </motion.div>
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>

            </div>
            {/* --- END: CURATED SPACES SECTION --- */}

            {/* ========================================================= */}
            {/* --- START: MOBILE ONLY CURATED SPACES --- */}
            {/* ========================================================= */}
            <div className="block md:hidden w-[94%] px-5 py-20 relative bottom-[-30px] z-[99] mt-20 bg-[#FAFAF9]" style={{ borderTop: '1px solid transparent' }}>
                
                {/* Header Text & Neighborhood Dropdown */}
                <div className="flex justify-between items-end mb-8 relative pr-2 w-full">
                    {/* Header Text */}
                    <div className="w-[75%] relative right-[-16.8px] lg:right-0 bottom-[-28px] lg:bottom-0">
                        <h2 className="text-[28px] text-[#4d6a52] leading-[1.25] mb-4 tracking-wide" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            A harmonious<br />fusion of stone and<br />light
                        </h2>
                        <p className="text-[12px] relative bottom-[-20px] italic text-[#5a5651] leading-[1.6]" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                            Where the architecture respects the<br />heritage of the land.
                        </p>
                    </div>

                    {/* Elegantly Blurred Apple-style Dropdown */}
                    <div className="relative bottom-[-28px] right-[4px] z-[999] flex flex-col items-end">
                        <button 
                            onClick={() => setIsMobileDropdownOpen(!isMobileDropdownOpen)}
                            className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-[#4d6a52]"
                        >
                            {activeLocation === 'Curated' ? 'ALL SPACES' : activeLocation}
                            <motion.svg animate={{ rotate: isMobileDropdownOpen ? 180 : 0 }} transition={{ duration: 0.3 }} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></motion.svg>
                        </button>
                        
                        <AnimatePresence>
                            {isMobileDropdownOpen && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                    className="absolute top-[25px] right-[-10px] mt-2 w-[210px] py-3 rounded-2xl backdrop-blur-sm bg-white/60 border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.06)] flex flex-col z-[9999] overflow-hidden"
                                >
                                    {['Curated', 'Canggu', 'Ubud', 'Pererenan', 'Umalas', 'Legian', 'Padonan'].map((neighborhood) => (
                                        <button 
                                            key={neighborhood}
                                            onClick={() => {
                                                setActiveLocation(neighborhood);
                                                setIsMobileDropdownOpen(false);
                                            }}
                                            className={`text-left px-5 py-3 text-[7px] font-bold tracking-[0.2em] uppercase transition-all duration-300 relative right-[-10px] lg:right-0
                                            ${activeLocation === neighborhood ? 'text-[#1a1a19]' : 'text-[#8F8A84] hover:text-[#4d6a52]'}`}
                                        >
                                            {activeLocation === neighborhood && (
                                                <motion.span layoutId="mobile-dropdown-dot" className="absolute left-[8px] top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-[#C7A58A]" />
                                            )}
                                            {neighborhood === 'Curated' ? 'ALL SPACES' : neighborhood}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Mobile Masonry Grid */}
                <div className="w-full flex gap-2 h-[600px] mx-auto mb-12 relative bottom-[-80px] lg:bottom-0 right-[-12.5px] lg:right-0 z-[1]">
                    {/* Left Column */}
                    <div className="flex flex-col gap-2 w-[58%] h-full">
                        {/* Top Left Image: Yellow Details */}
                        <div className="w-full h-[55%] relative overflow-hidden bg-[#2D332F] rounded-[12px]">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentData.images[0]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="w-full h-full relative">
                                    <Image src={currentData.images[0]} alt="Gallery Detail 1" fill className="object-cover" />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {/* Bottom Left Image: Pool */}
                        <div className="w-full h-[45%] relative overflow-hidden bg-[#6B8EAC] rounded-[12px]">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentData.images[1]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="w-full h-full relative">
                                    <Image src={currentData.images[1]} alt="Gallery Detail 2" fill className="object-cover" />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="flex flex-col gap-2 w-[42%] h-full">
                        {/* Top Right Image: Blank/Detail */}
                        <div className="w-full h-[35%] relative overflow-hidden bg-[#18151D] rounded-[12px]">
                            {/* Uses the 3rd array image elegantly as top right */}
                            <AnimatePresence mode="wait">
                                <motion.div key={currentData.images[2]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="w-full h-full relative">
                                    <Image src={currentData.images[2]} alt="Gallery Detail 3" fill className="object-cover" />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        {/* Bottom Right Image: Tall */}
                        <div className="w-full h-[65%] relative overflow-hidden bg-[#3C5753] rounded-[12px]">
                            <AnimatePresence mode="wait">
                                <motion.div key={currentData.images[3]} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="w-full h-full relative">
                                    <Image src={currentData.images[3]} alt="Gallery Detail 4" fill className="object-cover" />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Mobile CTA Button */}
                <div className="flex justify-center w-full relative right-[-16px] bottom-[-160px] lg:bottom-0">
                    <AnimatePresence mode="wait">
                        <motion.button 
                            key={activeLocation + '-btn'}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.4 }}
                            className="group flex items-center justify-between w-[220px] h-[56px] rounded-full bg-[#2E2E2C] px-6 transition-all duration-300 hover:bg-[#222] shadow-[0_4px_14px_0_rgba(0,0,0,0.2)]"
                        >
                            <div className="w-[5px] h-[5px] rounded-full bg-white opacity-90" />
                            <span className="text-[14px] font-medium text-white tracking-wide" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                {currentData.btn}
                            </span>
                            <div className="w-[5px] h-[5px] rounded-full bg-white opacity-90" />
                        </motion.button>
                    </AnimatePresence>
                </div>
            </div>
            {/* --- END: MOBILE ONLY CURATED SPACES --- */}

        </section>
    );
};

export default VillaCollection;
