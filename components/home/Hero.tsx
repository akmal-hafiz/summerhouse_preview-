"use client";

import Image from "next/image";
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from "framer-motion";
import React, { FormEvent, useState, useRef, useEffect } from "react";
import { FiSearch, FiMapPin, FiNavigation, FiMinus, FiPlus, FiChevronLeft, FiChevronRight, FiCalendar, FiUser } from "react-icons/fi";

const Hero = () => {
    // Basic States
    const [location, setLocation] = useState("Canggu, Bali");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");

    // UI Interaction States
    const [activeDropdown, setActiveDropdown] = useState<"location" | "dates" | "guests" | null>(null);

    // Scroll & Expansion state
    const { scrollY } = useScroll();
    const [isScrolled, setIsScrolled] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false); // OPTION B: Smart Memory UX

    // OPTION A (Light): Fluid Scrubbing effect before expansion
    const pullStretch = useTransform(scrollY, [0, 50], [1, 1.08]);
    const pullDownY = useTransform(scrollY, [0, 50], ["-50%", "-30%"]);
    const scrubOpacity = useTransform(scrollY, [0, 45], [1, 0.4]);

    useMotionValueEvent(scrollY, "change", (latest) => {
        if (latest > 50) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    });

    const isExpanded = isScrolled || hasInteracted;

    // Guests State
    const [guestCounts, setGuestCounts] = useState({
        adults: 1,
        children: 0,
        infants: 0,
        pets: 0
    });

    const updateGuest = (type: keyof typeof guestCounts, increment: boolean) => {
        setGuestCounts(prev => ({
            ...prev,
            [type]: increment ? prev[type] + 1 : Math.max(0, prev[type] - (type === 'adults' ? 1 : 0))
        }));
    };

    const totalGuests = guestCounts.adults + guestCounts.children;
    const guestLabel = `${totalGuests} guest${totalGuests > 1 ? 's' : ''}${guestCounts.infants > 0 ? `, ${guestCounts.infants} infant` : ''}`;

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log("Searching for:", { location, checkIn, checkOut, guestCounts });
    };

    // --- POPUP COMPONENTS ---

    const LocationPopup = ({ isSticky = false }) => (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`absolute ${isSticky ? 'top-full mt-6 flex-col left-4' : 'bottom-full left-0 mb-6'} bg-white rounded-[2rem] shadow-[0_24px_48px_rgba(0,0,0,0.15)] p-6 w-[450px] z-[100] border border-gray-100`}
        >
            <p className="text-[#1a1a1a] text-[11px] font-extrabold mb-5 ml-2 uppercase tracking-widest opacity-60">Suggested destinations</p>
            <div className="flex flex-col gap-1">
                <button
                    onClick={() => { setLocation("Nearby"); setActiveDropdown(null); }}
                    className="flex items-center gap-5 p-4 hover:bg-gray-50 rounded-2xl transition-all text-left group"
                >
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                        <FiNavigation />
                    </div>
                    <div>
                        <p className="text-[#1a1a1a] font-bold text-[15px]">Nearby</p>
                        <p className="text-gray-500 text-[13px]">Find what's around you</p>
                    </div>
                </button>
                {[
                    { name: 'Canggu, Bali', desc: 'The heart of surfing & cafes', icon: <FiMapPin className="text-gray-400" /> },
                    { name: 'Uluwatu, Bali', desc: 'Cliffs and luxury hideaways', icon: <FiMapPin className="text-gray-400" /> },
                    { name: 'Ubud, Bali', desc: 'Cultural soul & jungle views', icon: <FiMapPin className="text-gray-400" /> },
                    { name: 'Seminyak, Bali', desc: 'Upmarket shopping & dining', icon: <FiMapPin className="text-gray-400" /> },
                ].map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setLocation(item.name); setActiveDropdown(null); }}
                        className="flex items-center gap-5 p-4 hover:bg-gray-50 rounded-2xl transition-all text-left group"
                    >
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center text-xl group-hover:bg-white transition-colors shadow-sm">
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-[#1a1a1a] font-bold text-[15px]">{item.name}</p>
                            <p className="text-gray-500 text-[13px]">{item.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </motion.div>
    );

    const CalendarPopup = ({ isSticky = false }) => (
        <motion.div
            initial={{ opacity: 0, y: isSticky ? -20 : 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isSticky ? -20 : 20, scale: 0.98 }}
            className={`absolute ${isSticky ? 'top-full mt-6 left-1/2 -translate-x-1/2' : 'bottom-full left-1/2 -translate-x-1/2 mb-6'} bg-white rounded-[2.5rem] shadow-[0_24px_54px_rgba(0,0,0,0.18)] p-10 w-[800px] z-[100] border border-gray-100`}
        >
            <div className="flex justify-center mb-10">
                <div className="bg-gray-100 p-1.5 rounded-full flex gap-1 items-center">
                    <button className="bg-white px-10 py-2.5 rounded-full text-sm font-bold shadow-md text-[#1a1a1a]">Dates</button>
                    <button className="px-10 py-2.5 rounded-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">Flexible</button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-16">
                {/* Month 1 */}
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-8 px-2">
                        <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black"><FiChevronLeft size={20} /></button>
                        <p className="font-bold text-[#1a1a1a] text-base">March 2026</p>
                        <div className="w-10"></div>
                    </div>
                    <div className="grid grid-cols-7 gap-y-1 text-center">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => <span key={`${d}-${idx}`} className="text-[11px] font-bold text-gray-300 mb-4">{d}</span>)}
                        {Array.from({ length: 31 }).map((_, i) => (
                            <button key={i} className={`h-11 w-11 flex items-center justify-center rounded-full text-[14px] font-semibold transition-all ${i + 1 > 10 ? 'text-[#1a1a1a] hover:ring-2 hover:ring-black hover:bg-white' : 'text-gray-200 pointer-events-none'}`}>
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
                {/* Month 2 */}
                <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-8 px-2">
                        <div className="w-10"></div>
                        <p className="font-bold text-[#1a1a1a] text-base">April 2026</p>
                        <button className="p-2.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-black"><FiChevronRight size={20} /></button>
                    </div>
                    <div className="grid grid-cols-7 gap-y-1 text-center">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, idx) => <span key={`${d}-${idx}`} className="text-[11px] font-bold text-gray-300 mb-4">{d}</span>)}
                        {Array.from({ length: 30 }).map((_, i) => (
                            <button key={i} className="h-11 w-11 flex items-center justify-center rounded-full text-[14px] font-semibold text-[#1a1a1a] hover:ring-2 hover:ring-black hover:bg-white transition-all">
                                {i + 1}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex gap-2.5 mt-12 pt-8 border-t border-gray-100 justify-center">
                {['Exact dates', '± 1 day', '± 2 days', '± 3 days', '± 7 days'].map((range, idx) => (
                    <button key={idx} className={`px-5 py-2.5 border rounded-full text-[13px] font-bold transition-all ${idx === 0 ? 'bg-[#1a1a1a] text-white border-[#1a1a1a]' : 'border-gray-200 text-[#1a1a1a] hover:border-black'}`}>
                        {range}
                    </button>
                ))}
            </div>
        </motion.div>
    );

    const GuestsPopup = ({ isSticky = false }) => (
        <motion.div
            initial={{ opacity: 0, y: isSticky ? -15 : 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: isSticky ? -15 : 15 }}
            className={`absolute ${isSticky ? 'top-full mt-6 right-0' : 'bottom-full right-0 mb-6'} bg-white rounded-[2.5rem] shadow-[0_24px_54px_rgba(0,0,0,0.18)] p-10 w-[420px] z-[100] border border-gray-100`}
        >
            <div className="flex flex-col gap-9">
                {[
                    { label: 'Adults', sub: 'Ages 13 or above', key: 'adults' as const },
                    { label: 'Children', sub: 'Ages 2 – 12', key: 'children' as const },
                    { label: 'Infants', sub: 'Under 2', key: 'infants' as const },
                    { label: 'Pets', sub: 'Bringing a service animal?', key: 'pets' as const },
                ].map((item, idx) => (
                    <div key={idx} className={`flex items-center justify-between ${idx !== 3 ? 'border-b border-gray-50 pb-8' : ''}`}>
                        <div>
                            <p className="text-[#1a1a1a] font-bold text-[17px] mb-1">{item.label}</p>
                            <p className="text-gray-400 text-[13px] font-medium">{item.sub}</p>
                        </div>
                        <div className="flex items-center gap-5">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); updateGuest(item.key, false); }}
                                className={`w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all ${guestCounts[item.key] === 0 || (item.key === 'adults' && guestCounts.adults === 1) ? 'opacity-20 pointer-events-none' : ''}`}
                            >
                                <FiMinus size={16} />
                            </button>
                            <span className="text-[#1a1a1a] font-bold text-lg w-6 text-center">{guestCounts[item.key]}</span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); updateGuest(item.key, true); }}
                                className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all"
                            >
                                <FiPlus size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );

    const renderDetailedForm = (isSticky: boolean) => (
        <form
            className={`flex flex-row items-center justify-between w-full max-w-[450px] lg:max-w-none bg-[#1b1b1b]/1 lg:bg-[#1b1b1b]/3 lg:backdrop-blur-sm backdrop-blur-sm border border-white/10 rounded-full ${isSticky ? 'bg-black/80 lg:bg-[#1b1b1b]/90 shadow-[0_10px_40px_rgba(0,0,0,0.5)] border-white/20' : 'shadow-[0_8px_32px_rgba(0,0,0,0.11)]'} px-1.5 py-1.5 lg:px-12 lg:py-8 gap-5 lg:gap-10 overflow-hidden lg:overflow-visible pointer-events-auto`}
            onSubmit={handleSubmit}
            role="search"
            aria-label="Property search"
        >
            {/* Location Selector */}
            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }} className="flex flex-col flex-1 relative px-1.5 lg:px-6 py-1 lg:py-2 border-r border-white/20 lg:border-r-0 left-3 group cursor-pointer min-w-0">
                <span className="text-white/60 text-[6.5px] sm:text-[8px] lg:text-[11px] font-bold tracking-widest relative uppercase mb-[2px] lg:mb-[8px] truncate">Location</span>
                <button
                    type="button"
                    onClick={() => setActiveDropdown('location')}
                    className="w-full bg-transparent border-none lg:border-solid lg:border-b lg:border-white/20 lg:group-hover:border-white/50 text-white text-[9.5px] sm:text-[11px] lg:text-[16px] font-medium lg:font-normal text-left focus:outline-none transition-colors cursor-pointer pb-0 lg:pb-[8px] truncate"
                >
                    {location || "Where to?"}
                </button>
                <AnimatePresence>
                    {activeDropdown === 'location' && <LocationPopup isSticky={isSticky} />}
                </AnimatePresence>
            </motion.div>

            {/* Check-in selector */}
            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }} className="flex flex-col flex-1 relative px-1.5 lg:px-6 py-1 lg:py-2 border-r border-white/20 lg:border-r-0 group cursor-pointer min-w-0">
                <span className="text-white/60 text-[6.5px] sm:text-[8px] lg:text-[11px] font-bold tracking-widest uppercase mb-[2px] lg:mb-[8px] truncate">Check-in</span>
                <button
                    type="button"
                    onClick={() => setActiveDropdown('dates')}
                    className={`w-full bg-transparent border-none lg:border-solid lg:border-b lg:border-white/20 lg:group-hover:border-white/50 text-[9.5px] sm:text-[11px] lg:text-[16px] font-medium lg:font-normal text-left focus:outline-none transition-colors cursor-pointer pb-0 lg:pb-[8px] truncate ${checkIn ? 'text-white' : 'text-white/40'}`}
                >
                    {checkIn || "Add date"}
                </button>
            </motion.div>

            {/* Check-out selector */}
            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }} className="flex flex-col flex-1 relative px-1.5 lg:px-6 py-1 lg:py-2 border-r border-white/20 lg:border-r-0 group cursor-pointer min-w-0">
                <span className="text-white/60 text-[6.5px] sm:text-[8px] lg:text-[11px] font-bold tracking-widest uppercase mb-[2px] lg:mb-[8px] truncate">Check-out</span>
                <button
                    type="button"
                    onClick={() => setActiveDropdown('dates')}
                    className={`w-full bg-transparent border-none lg:border-solid lg:border-b lg:border-white/20 lg:group-hover:border-white/50 text-[9.5px] sm:text-[11px] lg:text-[16px] font-medium lg:font-normal text-left focus:outline-none transition-colors cursor-pointer pb-0 lg:pb-[8px] truncate ${checkOut ? 'text-white' : 'text-white/40'}`}
                >
                    {checkOut || "Add date"}
                </button>
                <AnimatePresence>
                    {activeDropdown === 'dates' && <CalendarPopup isSticky={isSticky} />}
                </AnimatePresence>
            </motion.div>

            {/* Guests Selector */}
            <motion.div variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } }} className="flex flex-col flex-1 relative px-1.5 lg:px-6 py-1 lg:py-2 border-r lg:border-r-0 border-white/20 lg:border-none group cursor-pointer min-w-0">
                <span className="text-white/60 text-[6.5px] sm:text-[8px] lg:text-[11px] font-bold tracking-widest uppercase mb-[2px] lg:mb-[8px] truncate">Guests</span>
                <button
                    type="button"
                    onClick={() => setActiveDropdown('guests')}
                    className="w-full bg-transparent border-none lg:border-solid lg:border-b lg:border-white/20 lg:group-hover:border-white/50 text-white text-[9.5px] sm:text-[11px] lg:text-[16px] font-medium lg:font-normal text-left focus:outline-none transition-colors cursor-pointer pb-0 lg:pb-[8px] truncate"
                >
                    {guestLabel}
                </button>
                <AnimatePresence>
                    {activeDropdown === 'guests' && <GuestsPopup isSticky={isSticky} />}
                </AnimatePresence>
            </motion.div>

            {/* Search Button */}
            <motion.div variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 400, damping: 20 } } }} className="flex-none pl-1 lg:pl-0">
                <button
                    type="submit"
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-[150px] lg:h-[60px] bg-white/20 lg:bg-white/15 hover:bg-white/30 lg:hover:bg-[#446B4A]/90 border border-white/40 lg:border-white/30 hover:border-white/50 lg:hover:border-transparent text-white flex items-center justify-center lg:gap-3 transition-all duration-300 active:scale-[0.98] rounded-full group shrink-0 lg:ml-4 shadow-sm lg:shadow-[0_0_20px_rgba(255,255,255,0.05)] lg:hover:shadow-[0_0_25px_rgba(68,107,74,0.4)]"
                >
                    <FiSearch className="min-w-[14px] h-[14px] lg:min-w-[20px] lg:h-5 group-hover:scale-110 transition-transform" />
                    <span className="hidden lg:block text-[13px] font-bold tracking-[0.2em] uppercase">Search</span>
                </button>
            </motion.div>
        </form>
    );

    return (
        <section className="relative w-full min-h-screen z-0 overflow-hidden">
            {/* Click outside overlay */}
            {activeDropdown && (
                <div
                    className="fixed inset-0 z-[90]"
                    onClick={() => setActiveDropdown(null)}
                />
            )}

            <video
                src="/video/herosection_summerhouse.mp4"
                autoPlay
                loop
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover object-center"
            />

            {/* Cinematic Spotlight: Menggelapkan HANYA area bawah (Detail Filter Search) */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: isExpanded ? 1 : 0 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                className="absolute inset-x-0 bottom-0 top-1/2 z-[1] pointer-events-none bg-gradient-to-t from-black/90 via-black/50 to-transparent"
            />

            {/* 
                Gradient diperhalus: Menghapus warna 'black' tebal di bagian bawah 
                agar efek glassmorphism form pencarian bersinar sempurna.
                Hanya mempertahankan sedikit bayangan tipis di atas dan kiri untuk Navbar & teks.
            */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-transparent" />

            <div
                className="hero-content-wrapper relative z-10 w-full max-w-[1400px] mx-auto min-h-screen flex flex-col justify-center"
                style={{ paddingLeft: "clamp(20px, 4vw, 56px)", paddingRight: "clamp(20px, 4vw, 56px)" }}
            >
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-20 items-end w-full mb-16 md:mb-24">

                    {/* ══ BLOCK 1: PRIMARY HEADING (Kiri) ══ */}
                    <div className="hero-title-block w-full relative -bottom-66 lg:-top-19 flex flex-col">
                        <div className="hero-main-heading-container">
                        </div>

                        <div className="lg:hidden mt-6">
                            <p className="text-white/80 text-lg leading-[3] lg:leading-relaxed max-w-[36ch]" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                Seamlessly navigate the global real estate market. Our expert team is here to guide you every step of the way.
                            </p>
                        </div>
                    </div>

                    {/* ══ BLOCK 2: SECONDARY HEADING / DESC (Kanan) ══ */}
                    <div className="hero-desc-block hidden relative -bottom-10 lg:flex flex-col left-24 lg:pb-10">
                        <h2
                            className="text-white/90 text-[22px] md:text-[26px] max-w-[28ch] leading-[1.4] font-light"
                            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                        >
                            Seamlessly navigate the global real estate market. Our expert team is here to guide you every step of the way.
                        </h2>
                    </div>
                </div>

                {/* ══ BLOCK 3: SEARCH INTERFACE ══ */}
                <div className="hero-search-block w-full border-white/10 relative -bottom-[370px] lg:bottom-[-269px] max-w-[1260px] mx-auto z-60 px-2 lg:px-0">
                    
                    {/* BOTH MOBILE & DESKTOP BEHAVIOR: MENGEMBANG DARI TENGAH */}
                    <div className="w-full flex justify-center items-center relative top-[-40px] lg:top-[-0px] h-[60px] lg:h-[90px]">
                        <AnimatePresence mode="wait">
                            {!isExpanded ? (
                                <motion.button
                                    key="small-search"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    style={{ scaleX: pullStretch, y: pullDownY, opacity: scrubOpacity }}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => setHasInteracted(true)}
                                    className="flex items-center justify-center gap-3 lg:gap-4 px-6 py-4 lg:px-10 lg:py-5 w-[250px] lg:w-[300px] bg-[#1b1b1b]/3 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.11)] border border-white/20 hover:bg-[#1b1b1b]/50 transition-all text-white rounded-full group cursor-pointer absolute inset-x-0 mx-auto top-1/2 left-1/2 -translate-x-1/2 lg:left-[38vw] lg:-translate-x-0"
                                >
                                    <FiSearch className="w-4 h-4 lg:w-6 lg:h-6 text-white group-hover:scale-110 transition-transform" />
                                    <span className="text-[14px] lg:text-[17px] font-bold tracking-wider">Search</span>
                                </motion.button>
                            ) : (
                                <motion.div
                                    key="detailed-search"
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    variants={{
                                        hidden: { opacity: 0, scale: 0.95 },
                                        visible: { 
                                            opacity: 1, scale: 1, 
                                            transition: { type: "spring", stiffness: 200, damping: 25, staggerChildren: 0.1, delayChildren: 0.05 } 
                                        },
                                        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
                                    }}
                                    className="w-full flex justify-center absolute inset-x-0 mx-auto top-1/2 -translate-y-1/2 lg:left-[5vw] lg:-translate-x-0 origin-center"
                                    onClick={() => setHasInteracted(true)}
                                >
                                    {renderDetailedForm(false)}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>

            </div>
        </section>
    );
};

export default Hero;
