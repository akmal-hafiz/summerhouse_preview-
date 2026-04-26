"use client";

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import Image from 'next/image';
import { FiSearch } from 'react-icons/fi';
import Magnetic from '@/components/common/Magnetic';

// Character-by-character reveal component
const CharacterReveal = ({ text, className }: { text: string, className?: string }) => {
    const characters = text.split("");
    return (
        <span className={className}>
            {characters.map((char, index) => (
                <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                        duration: 0.6, 
                        delay: index * 0.03, 
                        ease: [0.22, 1, 0.36, 1] 
                    }}
                    style={{ display: 'inline-block', whiteSpace: char === " " ? "pre" : "normal" }}
                >
                    {char}
                </motion.span>
            ))}
        </span>
    );
};

const MaskedVideo = ({ src, className, delay = 0, parallaxSpeed = 0 }: { src: string, className?: string, delay?: number, parallaxSpeed?: number }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], [0, parallaxSpeed * 100]);

    return (
        <div ref={ref} className={`overflow-hidden ${className} relative`}>
            <motion.div
                initial={{ clipPath: "inset(100% 0% 0% 0%)", filter: "blur(10px)", opacity: 0 }}
                whileInView={{ clipPath: "inset(0% 0% 0% 0%)", filter: "blur(0px)", opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay, ease: [0.33, 1, 0.68, 1] }}
                className="w-full h-full"
            >
                <motion.video 
                    style={{ y, scale: 1.15 }}
                    src={src} 
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                />
            </motion.div>
        </div>
    );
};

const MaskedImage = ({ src, alt, className, delay = 0, parallaxSpeed = 0 }: { src: string, alt: string, className?: string, delay?: number, parallaxSpeed?: number }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start end", "end start"]
    });
    const y = useTransform(scrollYProgress, [0, 1], [0, parallaxSpeed * 100]);

    return (
        <div ref={ref} className={`overflow-hidden ${className} relative`}>
            <motion.div
                initial={{ clipPath: "inset(100% 0% 0% 0%)", filter: "blur(10px)", opacity: 0 }}
                whileInView={{ clipPath: "inset(0% 0% 0% 0%)", filter: "blur(0px)", opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay, ease: [0.33, 1, 0.68, 1] }}
                className="w-full h-full"
            >
                <motion.img 
                    style={{ y, scale: 1.15 }}
                    src={src} 
                    alt={alt} 
                    className="w-full h-full object-cover"
                />
            </motion.div>
        </div>
    );
};

const testimonials = [
    {
        id: 1,
        quote: "Summerhouse transformed our villa into a consistently booked, beautifully maintained property.",
        text: "Their attention to detail is unmatched — from guest communication to the presentation of the home itself.",
        name: "James Whitfield",
        role: "Villa Owner",
        location: "Uluwatu, Bali",
        image: "/herosection1.jpg",
    },
    {
        id: 2,
        quote: "The team at Summerhouse is exceptional in their approach to luxury hospitality.",
        text: "They understand the 'Quiet Luxury' ethos perfectly. Our guests always leave with incredible memories.",
        name: "Sarah Jenkins",
        role: "Villa Owner",
        location: "Seminyak, Bali",
        image: "/Found_myself..jpg",
    },
    {
        id: 3,
        quote: "We entrusted our property to Summerhouse two years ago.",
        text: "Since then, our occupancy has doubled and the villa has never looked better. They treat it as if it were their own.",
        name: "David Chen",
        role: "Villa Owner",
        location: "Canggu, Bali",
        image: "/images_canggu.jpg",
    },
];

const servicesData = [
    { title: "24/7 Concierge Service", videoUrl: "https://videos.pexels.com/video-files/3121459/3121459-uhd_2560_1440_24fps.mp4" },
    { title: "Wellness & Spa Center", videoUrl: "https://videos.pexels.com/video-files/6606013/6606013-uhd_2560_1440_25fps.mp4" },
    { title: "Gourmet On-Site Dining", videoUrl: "https://videos.pexels.com/video-files/3195442/3195442-uhd_2560_1440_25fps.mp4" },
    { title: "Rooftop Pool & Lounge", videoUrl: "https://videos.pexels.com/video-files/4919736/4919736-uhd_2560_1440_25fps.mp4" }
];

const sectionContainerClass = "mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8";
const journalEditions = ["CURRENT EDITION", "EDITION 02: THE VOID", "EDITION 03: SOUL"];
const lowerSectionStackClass = "w-full mt-[18vh] lg:-mt-[180px] flex flex-col items-center";
const bookingSectionClass = "w-full relative py-[40px] lg:py-[200px] flex items-center justify-center min-h-[28vh] lg:min-h-[600px] overflow-hidden";
const journalSectionClass = "w-full bg-[#050505] h-[600px] pb-[150px] lg:h-[1200px] pt-[100px] lg:py-[200px] relative px-8 lg:px-12 touch-pan-y";
const ctaSectionClass = "w-full min-h-[10dvh] lg:h-[500px] relative bg-[#FAFAF9] py-[150px] lg:py-[200px] px-6 md:px-12 flex flex-col items-center justify-center lg:overflow-hidden touch-pan-y";
const journalInnerClass = "max-w-7xl mx-auto relative lg:right-[-40px] lg:bottom-[-200px]";
const journalHeaderClass = "flex flex-col lg:flex-row lg:items-center justify-between relative bottom-[-20px] lg:bottom-[0px] lg:top-[-80px] mb-12 lg:mb-0 gap-6 lg:gap-0";
const ctaInnerClass = "flex flex-col lg:flex-row relative bottom-[40px] lg:top-0 lg:right-[-20px] lg:top-[-80px] items-center justify-center mb-8 lg:mb-10 whitespace-normal lg:whitespace-nowrap flex-wrap gap-4 md:gap-8 w-full max-w-[1200px] mx-auto";

const About = () => {
    // Parallax Booking State
    const bookingRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: bookingRef,
        offset: ["start end", "end start"]
    });

    // Subtle Parallax Dampening for Desktop
    const smoothProgress = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    const yParallax = useTransform(smoothProgress, [0, 1], ["-15%", "15%"]);

    // Testimonials State
    const [activeId, setActiveId] = useState(testimonials[0].id);
    const activeTestimonial = testimonials.find(t => t.id === activeId) || testimonials[0];
    
    // Video Carousel State
    const [activeVideoIndex, setActiveVideoIndex] = React.useState(0);
    const [progress, setProgress] = React.useState(0);
    const videoRef = React.useRef<HTMLVideoElement>(null);

    // Mobile Journal Flip State
    const [isMobileJournalFlipped, setIsMobileJournalFlipped] = useState(false);
    
    // Desktop Journal Flip State
    const [isDesktopJournalFlipped, setIsDesktopJournalFlipped] = useState(false);

    // =========================================
    // JOURNAL STYLE CONFIGURATION (EASY ADJUST)
    // =========================================
    const JOURNAL_UNDERLINE = "pb-10";    // Spacing for the main button underline
    const JOURNAL_DOT_LEFT = "left-[-13px]"; // Horizontal position of the selection dot
    const JOURNAL_TEXT_PL = "pl-17";    // Left padding of the text to avoid dot overlap

    // Journal Dropdown State
    const [isJournalDropdownOpen, setIsJournalDropdownOpen] = useState(false);
    const [isMobileJournalDropdownOpen, setIsMobileJournalDropdownOpen] = useState(false);
    const [activeEdition, setActiveEdition] = useState("CURRENT EDITION");

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const duration = videoRef.current.duration;
            if (duration) {
                setProgress((current / duration) * 100);
            }
        }
    };

    const handleVideoEnd = () => {
        setActiveVideoIndex((prev) => (prev + 1) % servicesData.length);
        setProgress(0);
    };

    React.useEffect(() => {
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.src = servicesData[activeVideoIndex].videoUrl;
            videoRef.current.load();
            videoRef.current.play().catch(e => console.log("Auto-play prevented", e));
        }
    }, [activeVideoIndex]);

    return (
        <div className="w-full bg-[#FAFAF9] flex flex-col items-center overflow-x-hidden pt-32 lg:pt-40">

            {/* ========================================= */}
            {/* 1. THE EXPERIENCE SECTION (STORYTELLING)  */}
            {/* ========================================= */}
            {/* 1. THE EXPERIENCE SECTION (VIDEO CAROUSEL)*/}
            {/* ========================================= */}
            <section className="w-full flex flex-col touch-pan-y pt-12 lg:pt-20">
                {/* ─── TITLE & INTRODUCTION ─── */}
                <div className="w-full max-w-[900px] mx-auto text-center px-4 md:px-6 pb-12 lg:pb-24 flex flex-col items-center">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }} 
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true }} 
                        transition={{ duration: 0.8, ease: "easeOut" }} 
                        className="text-[28px] md:text-6xl lg:text-[72px] text-[#446B4A] mb-6 tracking-tight font-medium" 
                        style={{ fontFamily: "var(--font-playfair), serif" }}
                    >
                        <CharacterReveal text="Not a hotel. A home." />
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }} 
                        whileInView={{ opacity: 1, y: 0 }} 
                        viewport={{ once: true }} 
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }} 
                        className="text-[#5a5651] text-[12px] md:text-[16px] lg:text-[17px] leading-[1.7] lg:leading-[1.8] font-light max-w-[760px] mx-auto" 
                        style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                    >
                        Some places offer a room. We offer something rarer — a space that feels like it was built for you. Quiet, intentional, and entirely Bali.
                    </motion.p>
                </div>

                {/* Top Navigation Bar */}
                <div className="w-full bg-[#FAFAF9] min-h-[50px] lg:h-[100px] flex items-center justify-between px-4 md:px-6 lg:px-8 z-20 shadow-sm border-t border-[#1a1a19]/5">
                    <div className="w-full max-w-7xl mx-auto flex items-center justify-between h-full">
                        {servicesData.map((service, index) => (
                            <div 
                                key={index} 
                                className="flex-1 flex flex-col items-center justify-center cursor-pointer h-full relative group" 
                                onClick={() => { setActiveVideoIndex(index); setProgress(0); }}
                            >
                                <span className={`text-[9px] md:text-[13px] tracking-wide transition-all text-center px-1 ${activeVideoIndex === index ? 'text-black font-bold' : 'text-gray-400 group-hover:text-gray-600'}`} style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                    {service.title}
                                </span>
                                {/* Progress Bar Line - YouTube/Instagram Style */}
                                <div className="absolute bottom-0 left-2 right-2 md:left-4 md:right-4 h-[3px] bg-gray-100 overflow-hidden">
                                    <div 
                                        className="h-full bg-[#1a1a19] transition-all duration-75" 
                                        style={{ width: activeVideoIndex === index ? `${progress}%` : activeVideoIndex > index ? '100%' : '0%' }} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Video Container with Curve */}
                {/* Using a pseudo-element or border-radius hack for the subtle curve */}
                <div className="w-full h-[40vh] lg:h-[85vh] relative overflow-hidden" style={{ borderBottomLeftRadius: '50% 5%', borderBottomRightRadius: '50% 5%' }}>
                    {/* Dark Overlay for better contrast */}
                    <div className="absolute inset-0 bg-black/20 z-10 pointer-events-none" />
                    
                    {/* The Video Element */}
                    <video
                        ref={videoRef}
                        muted
                        playsInline
                        onTimeUpdate={handleTimeUpdate}
                        onEnded={handleVideoEnd}
                        className="w-full h-full object-cover transition-opacity duration-1000"
                    />

                    {/* Navigation Dots Indicator (Floating on Video) */}
                    <div className="absolute top-8 left-0 w-full z-20 px-6 md:px-12 flex justify-between pointer-events-none hidden md:flex">
                        <div className="w-full max-w-[1400px] mx-auto flex justify-between">
                             {servicesData.map((_, index) => (
                                 <div key={`dot-${index}`} className="flex-1 flex justify-center">
                                     <div className={`w-2 h-2 rounded-full transition-all duration-500 shadow-lg ${activeVideoIndex === index ? 'bg-white scale-[1.5]' : 'bg-white/40'}`} />
                                 </div>
                             ))}
                        </div>
                    </div>
                </div>

                {/* ─── NEW ABOUT TEXT BLOCK (BELOW VIDEO) ─── */}
                <div className="w-full max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-20 lg:py-32 flex flex-col items-start bg-[#FAFAF9]">
                    {/* Label */}
                    <span className="text-[11px] lg:text-[15px] font-medium tracking-[0.12em] uppercase text-[#1a1a19]/50 lg:text-[#1a1a19] mb-4 lg:mb-6" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                        The Summerhouse Story
                    </span>
                    {/* Heading — large black on mobile, green on desktop */}
                    <h2 className="text-[24px] lg:text-[44px] leading-[1.4] lg:leading-[1.15] tracking-tight text-[#446B4A] font-medium max-w-full lg:max-w-[1100px] mb-10 lg:mb-16" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                        We didn't set out to build another villa rental. We set out to answer one question: what does it feel like to stay somewhere that truly gets you? The result is Summerhouse — where every detail exists to make you feel at home, not like a guest.
                    </h2>
                    
                    {/* CTA Button */}
                    <Magnetic>
                        <a href="/villas" className="group flex items-center justify-between w-[220px] h-[56px] rounded-full bg-[#2E2E2C] px-6 transition-all duration-300 hover:bg-[#222] shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] hover:-translate-y-0.5">
                            <div className="w-[5px] h-[5px] rounded-full bg-white opacity-90" />
                            <span className="text-[14px] font-medium text-white tracking-wide" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                Find your villa
                            </span>
                            <div className="w-[5px] h-[5px] rounded-full bg-white opacity-90" />
                        </a>
                    </Magnetic>
                </div>

                {/* ─── NEW IMAGE GRID & TEXT BLOCK (BELOW ABOUT TEXT) ─── */}
                <div className="w-full z-30 max-w-7xl mx-auto px-4 md:px-6 lg:px-8 pb-20 lg:pb-32 bg-[#FAFAF9]">
                    {/* ==============================================
                        MOBILE VERTICAL STACK (SCROLL REVEAL)
                        ============================================== */}
                    <div className="flex lg:hidden flex-col gap-8 w-full pb-10 relative z-30">
                        
                        {/* 1. TEXT CARD (Appears Normally) */}
                        <div className="w-full rounded-[28px] bg-[#F2EDE3] flex flex-col justify-center px-7 py-12 border border-[#1a1a19]/5 relative overflow-hidden">
                            <div className="absolute top-[-20px] left-[-10px] text-[#e8e0d0] text-[160px] font-serif leading-none opacity-50 select-none pointer-events-none" style={{ fontFamily: "var(--font-playfair), serif" }}>"</div>
                            
                            <h3 className="w-full text-[18px] leading-[1.4] tracking-tight text-[#1a1a19] font-medium mb-5 relative z-10" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                Every corner is a decision. Every window is a frame. We don't just build villas — we compose spaces that let Bali speak for itself.
                            </h3>
                            <p className="w-full text-[#68635c] text-[15px] leading-[1.7] font-normal relative z-10" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                Raw stone, reclaimed wood, hand-woven textiles — every material is chosen with intention. Because real luxury isn't about excess. It's about meaning.
                            </p>
                        </div>

                        {/* 2. IMAGE GRID (Vertical Scroll Reveal) */}
                        <motion.div 
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 1, ease: [0.33, 1, 0.68, 1] }}
                            className="w-full flex gap-3"
                        >
                            {/* Left Column */}
                            <div className="flex flex-col gap-3 w-1/2">
                                <MaskedImage 
                                    src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop" 
                                    alt="Villa Detail" 
                                    className="w-full h-[180px] rounded-[20px]" 
                                    parallaxSpeed={0}
                                />
                                <MaskedVideo 
                                    src="/video/video1.mp4" 
                                    className="w-full h-[180px] rounded-[20px]" 
                                    parallaxSpeed={0}
                                />
                            </div>
                            
                            {/* Right Column */}
                            <div className="flex flex-col gap-3 w-1/2">
                                <MaskedVideo 
                                    src="/video/herosection_summerhouse.mp4" 
                                    className="w-full h-[180px] rounded-[20px]" 
                                    parallaxSpeed={0}
                                />
                                <MaskedImage 
                                    src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop" 
                                    alt="Villa Kitchen" 
                                    className="w-full h-[280px] rounded-[20px]" 
                                    parallaxSpeed={0}
                                />
                            </div>
                        </motion.div>
                    </div>
                    {/* =========================================
                        DESKTOP IMAGE GRID & TEXT BLOCK (LOCKED)
                        ========================================= */}
                    <div className="hidden lg:grid lg:grid-cols-2 gap-8 w-full items-stretch">
                        {/* Left Side: Masonry Layout (2 Columns) */}
                        <div className="flex gap-4 w-full h-full">
                            {/* Left Column */}
                            <div className="flex flex-col gap-4 w-1/2 h-full justify-start">
                                {/* Top Left */}
                                <MaskedImage 
                                    src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=800&auto=format&fit=crop" 
                                    alt="Villa Detail" 
                                    className="w-full h-[250px] rounded-[24px]" 
                                    parallaxSpeed={-0.2}
                                    delay={0.1}
                                />
                                {/* Bottom Left */}
                                <MaskedVideo 
                                    src="/video/video1.mp4" 
                                    className="w-full h-[250px] rounded-[24px]" 
                                    parallaxSpeed={0.15}
                                    delay={0.2}
                                />
                            </div>
                            
                            {/* Right Column */}
                            <div className="flex flex-col gap-4 w-1/2 h-full justify-start">
                                {/* Top Right */}
                                <MaskedVideo 
                                    src="/video/herosection_summerhouse.mp4" 
                                    className="w-full h-[250px] rounded-[24px]" 
                                    parallaxSpeed={0.25}
                                    delay={0.3}
                                />
                                {/* Bottom Right */}
                                <MaskedImage 
                                    src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=800&auto=format&fit=crop" 
                                    alt="Villa Kitchen" 
                                    className="w-full h-[400px] rounded-[24px]" 
                                    parallaxSpeed={-0.1}
                                    delay={0.4}
                                />
                            </div>
                        </div>

                        {/* Right Side: Text Block instead of Large Image */}
                        <div className="w-full h-full rounded-[24px] bg-[#F2EDE3] flex flex-col justify-center px-8 lg:px-[60px] py-16 border border-[#1a1a19]/5">
                            <h3 className="text-[28px] leading-[1.35] tracking-tight text-[#1a1a19] font-medium mb-8" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                "Every corner is a decision. Every window is a frame. We compose spaces that let Bali speak for itself."
                            </h3>
                            <p className="text-[#68635c] text-[16px] leading-[1.7] font-normal" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                Raw stone, reclaimed wood, hand-woven textiles — every material is chosen with intention. Real luxury isn't about excess. It's about meaning. And meaning lasts long after check-out.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

          

            {/* ========================================= */}
            {/* 3. DISCOVER / BOOKING SECTION               */}
            {/* ========================================= */}
            <div className={lowerSectionStackClass}>
                
                {/* 3. BOOKING SECTION */}
                <section ref={bookingRef} className={bookingSectionClass}>
                    <div className="absolute inset-0 z-0 overflow-hidden">
                        <motion.img 
                            style={{ y: yParallax, scale: 1.15 }}
                            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=2000&auto=format&fit=crop" 
                            className="w-full h-[130%] object-cover absolute top-[-15%]" 
                            alt="Villa Pool" 
                        />
                        <div className="absolute inset-0 bg-black/50 lg:bg-black/40"></div>
                    </div>
                    
                    <div className="relative z-10 w-full max-w-[1200px] mx-auto px-5 lg:px-6 flex flex-col items-center">
                        <h2 className="text-[28px] relative top-[-30px] lg:top-0 md:text-5xl lg:text-[56px] text-white font-medium text-center leading-[1.15] lg:leading-[1.1] tracking-tight mb-10 lg:mb-16" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                            Ready when you are. <br /> Your villa awaits.
                        </h2>
                        
                        {/* =========================================
                            MOBILE BOOKING FORM — COMPACT HERO STYLE
                            ========================================= */}
                        <form className="flex lg:hidden w-[94%] flex-row items-center justify-between bg-white/10 backdrop-blur-[16px] border border-white/20 rounded-full px-2 py-2 gap-0 shadow-xl">
                            {/* Location */}
                            <div className="flex flex-col flex-1 px-3 py-1 border-r border-white/10 min-w-0">
                                <span className="text-white/50 text-[6.5px] font-bold tracking-[0.15em] relative right-[-10px] uppercase mb-[1px] truncate" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Location</span>
                                <input 
                                    type="text" 
                                    placeholder="Where to?" 
                                    className="w-full bg-transparent border-none relative right-[-10px] text-[10px] text-white placeholder-white/40 focus:outline-none font-medium truncate" 
                                    style={{ fontFamily: "var(--font-dm-sans), sans-serif" }} 
                                />
                            </div>

                            {/* Check-in */}
                            <div className="flex flex-col flex-1 px-3 py-1 border-r border-white/10 min-w-0">
                                <span className="text-white/50 text-[6.5px] font-bold relative right-[-10px] tracking-[0.15em] uppercase mb-[1px] truncate" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Check-in</span>
                                <input 
                                    type="text" 
                                    placeholder="Add date" 
                                    className="w-full bg-transparent border-none relative right-[-10px] text-[10px] text-white placeholder-white/40 focus:outline-none font-medium truncate" 
                                    style={{ fontFamily: "var(--font-dm-sans), sans-serif" }} 
                                />
                            </div>

                            {/* Check-out */}
                            <div className="flex flex-col flex-1 px-3 py-1 border-r border-white/10 min-w-0">
                                <span className="text-white/50 text-[6.5px] font-bold relative right-[-10px] tracking-[0.15em] uppercase mb-[1px] truncate" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Check-out</span>
                                <input 
                                    type="text" 
                                    placeholder="Add date" 
                                    className="w-full bg-transparent border-none relative right-[-10px] text-[10px] text-white placeholder-white/40 focus:outline-none font-medium truncate" 
                                    style={{ fontFamily: "var(--font-dm-sans), sans-serif" }} 
                                />
                            </div>

                            {/* Guests */}
                            <div className="flex flex-col flex-1 px-3 py-1 min-w-0">
                                <span className="text-white/50 text-[6.5px] font-bold relative right-[-10px] tracking-[0.15em] uppercase mb-[1px] truncate" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Guests</span>
                                <input 
                                    type="text" 
                                    placeholder="Add" 
                                    className="w-full bg-transparent border-none relative right-[-10px] text-[10px] text-white placeholder-white/40 focus:outline-none font-medium truncate" 
                                    style={{ fontFamily: "var(--font-dm-sans), sans-serif" }} 
                                />
                            </div>

                            {/* Search Button */}
                            <div className="flex-none">
                                <button
                                    type="submit"
                                    className="w-10 h-10 bg-white/20 hover:bg-[#446B4A]/90 border border-white/30 hover:border-transparent text-white flex items-center justify-center transition-all duration-300 rounded-full group shrink-0 active:scale-95"
                                >
                                    <FiSearch className="w-[14px] h-[14px] group-hover:scale-110 transition-transform" />
                                </button>
                            </div>
                        </form>

                        {/* =========================================
                            DESKTOP BOOKING FORM (LOCKED)
                            ========================================= */}
                        <form className="hidden lg:flex w-full max-w-[1200px] bg-[#1b1b1b]/10 backdrop-blur-sm border border-white/30 shadow-[0_8px_32px_rgba(0,0,0,0.3)] relative bottom-[-50px] rounded-full px-4 py-4 lg:px-10 lg:py-6 flex-row items-center justify-between gap-4 lg:gap-8 overflow-x-auto lg:overflow-visible">
                            
                            {/* Location */}
                            <div className="flex flex-col relative right-[-40px] flex-1 relative px-2 lg:px-6 py-2 border-r border-white/20 group cursor-pointer min-w-[120px] lg:min-w-0">
                                <span className="text-white/60 text-[10px] lg:text-[13px] font-bold tracking-widest uppercase mb-[4px] lg:mb-[8px] truncate" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Location</span>
                                <input 
                                    type="text" 
                                    placeholder="Where to?" 
                                    className="w-full bg-transparent border-none text-[14px] lg:text-[18px] text-white placeholder-white/60 focus:outline-none truncate font-medium" 
                                    style={{ fontFamily: "var(--font-dm-sans), sans-serif" }} 
                                />
                            </div>

                            {/* Check-in */}
                            <div className="flex flex-col flex-1 relative px-2 lg:px-6 py-2 border-r border-white/20 group cursor-pointer min-w-[100px] lg:min-w-0">
                                <span className="text-white/60 text-[10px] lg:text-[13px] font-bold tracking-widest uppercase mb-[4px] lg:mb-[8px] truncate" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Check-in</span>
                                <input 
                                    type="text" 
                                    placeholder="Add date" 
                                    className="w-full bg-transparent border-none text-[14px] lg:text-[18px] text-white placeholder-white/60 focus:outline-none truncate font-medium" 
                                    style={{ fontFamily: "var(--font-dm-sans), sans-serif" }} 
                                />
                            </div>

                            {/* Check-out */}
                            <div className="flex flex-col flex-1 relative px-2 lg:px-6 py-2 border-r border-white/20 group cursor-pointer min-w-[100px] lg:min-w-0">
                                <span className="text-white/60 text-[10px] lg:text-[13px] font-bold tracking-widest uppercase mb-[4px] lg:mb-[8px] truncate" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Check-out</span>
                                <input 
                                    type="text" 
                                    placeholder="Add date" 
                                    className="w-full bg-transparent border-none text-[14px] lg:text-[18px] text-white placeholder-white/60 focus:outline-none truncate font-medium" 
                                    style={{ fontFamily: "var(--font-dm-sans), sans-serif" }} 
                                />
                            </div>

                            {/* Guests */}
                            <div className="flex flex-col flex-1 relative px-2 lg:px-6 py-2 group cursor-pointer min-w-[100px] lg:min-w-0">
                                <span className="text-white/60 text-[10px] lg:text-[13px] font-bold tracking-widest uppercase mb-[4px] lg:mb-[8px] truncate" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Guests</span>
                                <input 
                                    type="text" 
                                    placeholder="Add guests" 
                                    className="w-full bg-transparent border-none text-[14px] lg:text-[18px] text-white placeholder-white/60 focus:outline-none truncate font-medium" 
                                    style={{ fontFamily: "var(--font-dm-sans), sans-serif" }} 
                                />
                            </div>

                            {/* Search Button */}
                            <div className="flex-none pl-2 lg:pl-0">
                                <button
                                    type="submit"
                                    className="w-12 h-12 lg:w-[180px] lg:h-[70px] bg-white/20 hover:bg-[#446B4A]/90 border border-white/30 hover:border-transparent text-white flex items-center justify-center gap-3 transition-all duration-300 rounded-full group shrink-0 shadow-sm"
                                >
                                    <FiSearch className="min-w-[18px] h-[18px] lg:w-[22px] lg:h-[22px] group-hover:scale-110 transition-transform" />
                                    <span className="hidden lg:block text-[15px] font-bold tracking-[0.2em] uppercase" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Search</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </section>

                {/* 4. THE JOURNAL SECTION (LODR STYLE) */}
                <section className={journalSectionClass}>
                    <div className={journalInnerClass}>
                        <div className={journalHeaderClass}>
                            <h2 className="text-[28px] md:text-5xl lg:text-[56px] text-white font-medium tracking-tight text-center lg:text-left" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                               Summerhouse Journal
                            </h2> 
                            
                            {/* Desktop Button (Magazine Dropdown Style) */}
                            <div className="hidden lg:flex relative top-[25px] right-[-90px] z-50 flex-col items-end">
                                <button 
                                    onClick={() => setIsJournalDropdownOpen(!isJournalDropdownOpen)}
                                    className="flex items-center gap-2 text-[11px] font-bold tracking-[0.25em] uppercase text-white/90 hover:text-white transition-all duration-300 group"
                                >
                                    <span className={`border-b border-white/20 group-hover:border-white transition-all duration-300 ${JOURNAL_UNDERLINE}`}>{activeEdition}</span>
                                    <motion.svg 
                                        animate={{ rotate: isJournalDropdownOpen ? 180 : 0 }} 
                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} 
                                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                        className="opacity-70"
                                    >
                                        <path d="M6 9l6 6 6-6"/>
                                    </motion.svg>
                                </button>
                                
                                <AnimatePresence>
                                    {isJournalDropdownOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: -15, scale: 0.98 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                            className="absolute top-[35px] right-0 mt-3 w-[360px] h-[134px] py-4 rounded-2xl backdrop-blur-sm bg-white/10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col z-[9999] overflow-hidden"
                                        >
                                            {['CURRENT EDITION', 'EDITION 02: THE VOID', 'EDITION 03: SOUL', ].map((edition) => (
                                                <button 
                                                    key={edition}
                                                    onClick={() => {
                                                        setActiveEdition(edition);
                                                        setIsJournalDropdownOpen(false);
                                                        if (edition !== 'CURRENT EDITION') setIsDesktopJournalFlipped(true);
                                                        else setIsDesktopJournalFlipped(false);
                                                    }}
                                                    className={`text-left relative top-[15px] left-[20px] ${JOURNAL_TEXT_PL} pr-7 py-5 text-[9px] font-bold tracking-[0.2em] uppercase transition-all duration-300
                                                    ${activeEdition === edition ? 'text-white bg-white/5' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.02]'}`}
                                                >
                                                    {activeEdition === edition && (
                                                        <motion.span layoutId="journal-dot-desktop" className={`absolute ${JOURNAL_DOT_LEFT} top-1/2 -translate-y-1/2 w-[4px] h-[4px] rounded-full bg-white`} />
                                                    )}
                                                    {edition}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Mobile Button (Magazine Dropdown Style) */}
                            <div className="flex lg:hidden relative left-[-110px] bottom-[-460px] mx-auto z-50 flex-col items-center">
                                <button 
                                    onClick={() => setIsMobileJournalDropdownOpen(!isMobileJournalDropdownOpen)}
                                    className="flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] uppercase text-white transition-all duration-300"
                                >
                                    <span className={`border-b border-white/30 ${JOURNAL_UNDERLINE}`}>{activeEdition}</span>
                                    <motion.svg 
                                        animate={{ rotate: isMobileJournalDropdownOpen ? 180 : 0 }} 
                                        transition={{ duration: 0.3 }} 
                                        width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                                        className="opacity-80"
                                    >
                                        <path d="M6 9l6 6 6-6"/>
                                    </motion.svg>
                                </button>
                                
                                <AnimatePresence>
                                    {isMobileJournalDropdownOpen && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                                            className="absolute right-[110px] bottom-[40px] w-[170px] h-[84px] py-3 rounded-2xl backdrop-blur-sm bg-white/10 border border-white/10 shadow-2xl flex flex-col z-[9999] overflow-hidden"
                                        >
                                            {['CURRENT EDITION', 'EDITION 02: THE VOID', 'EDITION 03: SOUL'].map((edition) => (
                                                <button 
                                                    key={edition}
                                                    onClick={() => {
                                                        setActiveEdition(edition);
                                                        setIsMobileJournalDropdownOpen(false);
                                                        if (edition !== 'CURRENT EDITION') setIsMobileJournalFlipped(true);
                                                        else setIsMobileJournalFlipped(false);
                                                    }}
                                                    className={`text-left relative top-[5px] left-[10px] ${JOURNAL_TEXT_PL} py-4 text-[8px] font-bold tracking-[0.2em] uppercase transition-all duration-300
                                                    ${activeEdition === edition ? 'text-white bg-white/5' : 'text-white/40'}`}
                                                >
                                                    {activeEdition === edition && (
                                                        <motion.span layoutId="journal-dot-mobile" className={`absolute ${JOURNAL_DOT_LEFT} top-1/2 -translate-y-1/2 w-[3px] h-[3px] rounded-full bg-white`} />
                                                    )}
                                                    {edition}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                        
                        {/* Garis Pembatas Terpisah */}
                        <div className="w-full h-[1px] bg-[#333333] relative lg:top-[-40px] mb-[40px] lg:mb-[20px]"></div>

                        {/* =========================================
                            DESKTOP JOURNAL SECTION (LOCKED & PERFECT)
                            ========================================= */}

                        <div className="hidden lg:block relative w-full" style={{ perspective: '2500px' }}>
                            <div 
                                className="w-full transition-transform duration-[1.2s] ease-[cubic-bezier(0.645,0.045,0.355,1)] relative"
                                style={{ 
                                    transformStyle: 'preserve-3d',
                                    transform: isDesktopJournalFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)'
                                }}
                            >
                                {/* FRONT PAGE (PAGE 1) */}
                                <div className="grid grid-cols-12 gap-16 relative left-[-20px] w-full" style={{ backfaceVisibility: 'hidden' }}>
                                    {/* Left Large Card */}
                                    <article className="col-span-7 group cursor-pointer flex flex-col">
                                        <div className="w-[820px] h-[540px] rounded-[24px] overflow-hidden mb-8 bg-[#1a1a19]">
                                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRQ9alZ4zY1Cu8bjOtbWCAuvuWP6Kt90CJdns-OW3m8Kx7p4wUQ7VD7RvyHQhen3hnYDeiJtFVVBvq2G6MIr3L-sh7WoRS_QLblIv3U5omxDql-4kpNnhnBHpSyk3c2w07uSVmSsJZ1mXhn67Z6EnWEpawRtexEfMsl5SNuf2mYCbAoUgOThm87ONzuyQJS8J2eKKxe4spavaq1scQGox5Bl3-QB44NB1VVMi6sE13qinMwLbCz0jDnIj6WJzHyj4YZDVEg-dF" alt="The New Uluwatu Architecture Wave" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                        </div>
                                        <span className="text-white/40 text-[10px] font-bold tracking-[0.15em] uppercase mb-2 relative bottom-[-20px] right-[-20px]">Design & Architecture</span>
                                        <h3 className="text-[36px] relative bottom-[-20px] right-[-20px] text-white font-medium leading-[1.25] mb-4 tracking-tight" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                            The New Uluwatu Architecture Wave
                                        </h3>
                                        <p className="text-white/60 relative bottom-[-30px] right-[-25px] text-[16px] leading-[1.7] max-w-[90%]" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                            Discover the resurgence of tropical modernism along the limestone cliffs of the Bukit Peninsula, where concrete meets the Indian Ocean in unprecedented forms that redefine luxury.
                                        </p>
                                    </article>

                                    {/* Right Small Cards Stacked */}
                                    <div className="col-span-5 flex flex-col gap-12">
                                        {/* Top Small Card */}
                                        <article className="group cursor-pointer relative right-[-120px] flex flex-col">
                                            <div className="w-full aspect-[16/9] rounded-[24px] overflow-hidden mb-6 bg-[#1a1a19]">
                                                <img src="https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?q=80&w=800&auto=format&fit=crop" alt="The Heart of Ubud" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                            </div>
                                            <span className="text-white/40 text-[10px] font-bold tracking-[0.15em] uppercase mb-2 relative top-[20px]">Culture</span>
                                            <h3 className="text-[28px] relative top-[20px] text-white font-medium leading-[1.2] tracking-tight" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                                The Heart of Ubud: Sanctuaries & Local Lore
                                            </h3>
                                            <p className="text-white/60 relative top-[30px] text-[15px] leading-[1.6] mt-4" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                                A curated guide to the vibrant pulse surrounding Villa Zen. From the ancient pathways of the Monkey Forest to exclusive artisanal coffee tastings.
                                            </p>
                                        </article>

                                        {/* Bottom Small Card */}
                                        <article className="group cursor-pointer relative right-[-120px] flex flex-col">
                                            <div className="w-full aspect-[16/9] rounded-[24px] overflow-hidden mb-6 bg-[#1a1a19]">
                                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-7UqJ4Ne2mXUVSq5Bbi4Kr4NkyCJ5QV6mCMZX7m2B9eLGgTB7XMij_OaWGiC98CRkISo6IDwkCyu_8zsspT_oxldSNR3_PDxcez9yej3g4NpdEW6A5u3XYVP7EK_9eyszr5HguxqGcp8snIeHDxJSCgFlqEqWqeJvOxpMgge7YDFZLgcnKVVtFmUyw78L1Jxo6zJaYw-GqDxtgGnq8jkoAM6MPvEZjkUSqwnuXLjcFuRG3ObS4IFzrUsfmVM8WYPl84p4w67r" alt="Culinary Journeys" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                            </div>
                                            <span className="text-white/40 text-[10px] font-bold tracking-[0.15em] uppercase mb-2 relative top-[20px]">Gastronomy</span>
                                            <h3 className="text-[28px] relative top-[20px] text-white font-medium leading-[1.2] tracking-tight" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                                Culinary Journeys: Private Dining in Bali
                                            </h3>
                                        </article>
                                    </div>
                                </div>

                                {/* BACK PAGE (PAGE 2) */}
                                <div className="grid grid-cols-12 gap-16 absolute top-0 left-[-20px] w-full min-h-[10dvh] lg:h-[500px]" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                    {/* Left Large Card - Page 2 */}
                                    <article className="col-span-7 group cursor-pointer flex flex-col">
                                        <div className="w-[820px] h-[540px] rounded-[24px] overflow-hidden mb-8 bg-[#1a1a19]">
                                            <img src="https://images.unsplash.com/photo-1542314831-c6a4d14b83cc?q=80&w=800&auto=format&fit=crop" alt="Slow Living" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                        </div>
                                        <span className="text-white/40 text-[10px] font-bold tracking-[0.15em] uppercase mb-2 relative bottom-[-20px] right-[-20px]">Lifestyle</span>
                                        <h3 className="text-[36px] relative bottom-[-20px] right-[-20px] text-white font-medium leading-[1.25] mb-4 tracking-tight" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                            The Art of Slow Living in Bali
                                        </h3>
                                        <p className="text-white/60 relative bottom-[-30px] right-[-25px] text-[16px] leading-[1.7] max-w-[90%]" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                            Embracing the Balinese philosophy of time. How our villas are designed to disconnect you from the rush and reconnect you with the present moment.
                                        </p>
                                    </article>

                                    {/* Right Small Cards Stacked - Page 2 */}
                                    <div className="col-span-5 flex flex-col gap-12">
                                        {/* Top Small Card - Page 2 */}
                                        <article className="group cursor-pointer relative right-[-120px] flex flex-col">
                                            <div className="w-full aspect-[16/9] rounded-[24px] overflow-hidden mb-6 bg-[#1a1a19]">
                                                <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop" alt="Bamboo Architecture" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                            </div>
                                            <span className="text-white/40 text-[10px] font-bold tracking-[0.15em] uppercase mb-2 relative top-[20px]">Design</span>
                                            <h3 className="text-[28px] relative top-[20px] text-white font-medium leading-[1.2] tracking-tight" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                                Sustainable Luxury
                                            </h3>
                                            <p className="text-white/60 relative top-[30px] text-[15px] leading-[1.6] mt-4" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                                Exploring the boundaries of bamboo architecture and how local materials are shaping the future of high-end eco-resorts.
                                            </p>
                                        </article>

                                        {/* Bottom Small Card - Page 2 */}
                                        <article className="group cursor-pointer relative right-[-120px] flex flex-col">
                                            <div className="w-full aspect-[16/9] rounded-[24px] overflow-hidden mb-6 bg-[#1a1a19]">
                                                <img src="https://images.unsplash.com/photo-1506501139174-099022df5260?q=80&w=800&auto=format&fit=crop" alt="Secret Beaches" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                            </div>
                                            <span className="text-white/40 text-[10px] font-bold tracking-[0.15em] uppercase mb-2 relative top-[20px]">Exploration</span>
                                            <h3 className="text-[28px] relative top-[20px] text-white font-medium leading-[1.2] tracking-tight" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                                Secret Beaches of the Bukit
                                            </h3>
                                        </article>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* =========================================
                            MOBILE JOURNAL SECTION (FEEL FREE TO EXPERIMENT!)
                            ========================================= */}
                        <div className="lg:hidden relative w-full" style={{ perspective: '1500px' }}>
                            <div 
                                className="w-full transition-transform duration-[1.2s] ease-[cubic-bezier(0.645,0.045,0.355,1)] relative"
                                style={{ 
                                    transformStyle: 'preserve-3d',
                                    transform: isMobileJournalFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)'
                                }}
                            >
                                {/* FRONT PAGE (PAGE 1) */}
                                <div className="grid grid-cols-2 gap-6 relative w-full" style={{ backfaceVisibility: 'hidden' }}>
                                    {/* Left Large Card */}
                                    <article className="col-span-1 h-[300px] relative right-[-10px] bottom-[-70px] group cursor-pointer flex flex-col">
                                        <div className="w-[110%] aspect-[4/3.2] rounded-[10px] overflow-hidden mb-3 bg-[#1a1a19]">
                                            <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRQ9alZ4zY1Cu8bjOtbWCAuvuWP6Kt90CJdns-OW3m8Kx7p4wUQ7VD7RvyHQhen3hnYDeiJtFVVBvq2G6MIr3L-sh7WoRS_QLblIv3U5omxDql-4kpNnhnBHpSyk3c2w07uSVmSsJZ1mXhn67Z6EnWEpawRtexEfMsl5SNuf2mYCbAoUgOThm87ONzuyQJS8J2eKKxe4spavaq1scQGox5Bl3-QB44NB1VVMi6sE13qinMwLbCz0jDnIj6WJzHyj4YZDVEg-dF" alt="The New Uluwatu Architecture Wave" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                        </div>
                                        <span className="text-white/40 text-[6px] font-bold tracking-[0.15em] uppercase mb-1 relative right-[-5px] bottom-[-10px]">Design & Architecture</span>
                                        <h3 className="text-[12px] relative right-[-5px] bottom-[-15px] text-white font-medium leading-[1.3] mb-2 tracking-tight" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                            The New Uluwatu Architecture Wave
                                        </h3>
                                        <p className="text-white/60 relative right-[-5px] bottom-[-20px] text-[8px] leading-[1.6] max-w-full" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                            Discover the resurgence of tropical modernism along the limestone cliffs of the Bukit Peninsula, where concrete meets the Indian Ocean in unprecedented forms that redefine luxury.
                                        </p>
                                    </article>

                                    {/* Right Small Cards Stacked (Staggered on Mobile) */}
                                    <div className="col-span-1 flex flex-col gap-5 mt-[30px]">
                                        <article className="col-span-1 relative right-[-30px] bottom-[-150px] group cursor-pointer flex flex-col">
                                            <div className="w-3/4 aspect-[4/5] rounded-[10px] overflow-hidden mb-3 bg-[#1a1a19]">
                                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRQ9alZ4zY1Cu8bjOtbWCAuvuWP6Kt90CJdns-OW3m8Kx7p4wUQ7VD7RvyHQhen3hnYDeiJtFVVBvq2G6MIr3L-sh7WoRS_QLblIv3U5omxDql-4kpNnhnBHpSyk3c2w07uSVmSsJZ1mXhn67Z6EnWEpawRtexEfMsl5SNuf2mYCbAoUgOThm87ONzuyQJS8J2eKKxe4spavaq1scQGox5Bl3-QB44NB1VVMi6sE13qinMwLbCz0jDnIj6WJzHyj4YZDVEg-dF" alt="The New Uluwatu Architecture Wave" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                            </div>
                                            <span className="text-white/40 text-[6px] font-bold tracking-[0.15em] uppercase mb-1 relative bottom-[-10px]">Design & Architecture</span>
                                            <h3 className=" max-w-[100px] text-[10px] relative bottom-[-15px] text-white font-medium leading-[1.3] mb-2 tracking-tight" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                                The New Uluwatu Architecture Wave
                                            </h3>
                                            <p className="text-white/60 relative bottom-[-20px] text-[7px] leading-[1.6] max-w-[80%]" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}> 
                                                Discover the resurgence of tropical modernism along the limestone cliffs of the Bukit Peninsula, where concrete meets the Indian Ocean in unprecedented forms that redefine luxury.
                                            </p>
                                        </article>
                                    </div>
                                </div>

                                {/* BACK PAGE (PAGE 2) */}
                                <div className="absolute top-0 left-0 w-full h-full grid grid-cols-2 gap-6" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                                    {/* Left Large Card - Page 2 */}
                                    <article className="col-span-1 h-[300px] relative right-[-10px] bottom-[-70px] group cursor-pointer flex flex-col">
                                        <div className="w-[110%] aspect-[4/3.2] rounded-[10px] overflow-hidden mb-3 bg-[#1a1a19]">
                                            <img src="https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?q=80&w=800&auto=format&fit=crop" alt="The Heart of Ubud" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                        </div>
                                        <span className="text-white/40 text-[6px] font-bold tracking-[0.15em] uppercase mb-1 relative right-[-5px] bottom-[-10px]">Culture</span>
                                        <h3 className="text-[12px] relative right-[-5px] bottom-[-15px] text-white font-medium leading-[1.3] mb-2 tracking-tight" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                            The Heart of Ubud
                                        </h3>
                                        <p className="text-white/60 relative right-[-5px] bottom-[-20px] text-[8px] leading-[1.6] max-w-full" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                            A curated guide to the vibrant pulse surrounding Villa Zen. From ancient pathways of the Monkey Forest to exclusive artisanal coffee tastings.
                                        </p>
                                    </article>

                                    {/* Right Small Cards Stacked - Page 2 */}
                                    <div className="col-span-1 flex flex-col gap-5 mt-[30px]">
                                        <article className="col-span-1 relative right-[-30px] bottom-[-150px] group cursor-pointer flex flex-col">
                                            <div className="w-3/4 aspect-[4/5] rounded-[10px] overflow-hidden mb-3 bg-[#1a1a19]">
                                                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-7UqJ4Ne2mXUVSq5Bbi4Kr4NkyCJ5QV6mCMZX7m2B9eLGgTB7XMij_OaWGiC98CRkISo6IDwkCyu_8zsspT_oxldSNR3_PDxcez9yej3g4NpdEW6A5u3XYVP7EK_9eyszr5HguxqGcp8snIeHDxJSCgFlqEqWqeJvOxpMgge7YDFZLgcnKVVtFmUyw78L1Jxo6zJaYw-GqDxtgGnq8jkoAM6MPvEZjkUSqwnuXLjcFuRG3ObS4IFzrUsfmVM8WYPl84p4w67r" alt="Culinary Journeys" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                                            </div>
                                            <span className="text-white/40 text-[6px] font-bold tracking-[0.15em] uppercase mb-1 relative bottom-[-10px]">Gastronomy</span>
                                            <h3 className=" max-w-[100px] text-[10px] relative bottom-[-15px] text-white font-medium leading-[1.3] mb-2 tracking-tight" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                                Culinary Journeys in Bali
                                            </h3>
                                            <p className="text-white/60 relative bottom-[-20px] text-[7px] leading-[1.6] max-w-[80%]" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}> 
                                                Discover the resurgence of tropical modernism along the limestone cliffs of the Bukit Peninsula, where concrete meets the Indian Ocean.
                                            </p>
                                        </article>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* 5. POLAROID CTA SECTION */}
                <section className={ctaSectionClass}>
                    
                    <div className={ctaInnerClass}>
                        <h2 className="text-[48px] relative top-[30px] lg:bottom-[0] md:text-7xl lg:text-[80px] font-medium tracking-tight text-[#1a1a19] text-center" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                            Stay
                        </h2>
                        
                        {/* Polaroids Container */}
                        <div className="relative w-[180px] md:w-[260px] h-[140px] md:h-[180px] flex items-center justify-center">
                            {/* Left Polaroid */}
                            <div className="absolute left-0 w-[100px] md:w-[140px] h-[110px] md:h-[150px] bg-white p-1.5 rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] -rotate-12 transform origin-bottom hover:rotate-0 hover:z-30 transition-all duration-500 z-10">
                                <div className="w-full h-full relative overflow-hidden rounded-[8px]">
                                    <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Villa 1" />
                                </div>
                                <div className="absolute top-3 left-3 w-[6px] h-[6px] rounded-full bg-white shadow-sm"></div>
                            </div>
                            
                            {/* Right Polaroid */}
                            <div className="absolute right-0 w-[100px] md:w-[140px] h-[110px] md:h-[150px] bg-white p-1.5 rounded-[12px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] rotate-12 transform origin-bottom hover:rotate-0 hover:z-30 transition-all duration-500 z-10">
                                <div className="w-full h-full relative overflow-hidden rounded-[8px]">
                                    <img src="https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Villa 2" />
                                </div>
                                <div className="absolute top-3 left-3 w-[6px] h-[6px] rounded-full bg-white shadow-sm"></div>
                            </div>
                            
                            {/* Center Polaroid */}
                            <div className="absolute z-20 w-[110px] md:w-[150px] h-[120px] md:h-[160px] bg-white p-1.5 rounded-[12px] shadow-[0_15px_40px_rgb(0,0,0,0.15)] transform hover:scale-110 transition-transform duration-500">
                                <div className="w-full h-full relative overflow-hidden rounded-[8px]">
                                    <img src="https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop" className="w-full h-full object-cover" alt="Villa 3" />
                                </div>
                                <div className="absolute top-3 left-3 w-[6px] h-[6px] rounded-full bg-white shadow-sm"></div>
                            </div>
                        </div>
                        
                        <h2 className="text-[48px] md:text-7xl relative top-[-30px] lg:top-[-0px] lg:text-[80px] font-medium tracking-tight text-[#1a1a19] text-center" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                            differently.
                        </h2>
                    </div>
                    
                    <p className="text-[#68635c] relative top-[-110px] lg:left-[20px] lg:top-[-30px] text-[12px] lg:text-[18px] md:text-[18px] text-center max-w-[350px] lg:max-w-[640px] mb-8 lg:mb-12" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                        Not just a place to sleep. A place to remember. Curated villas across Bali's most coveted corners, ready for you.
                    </p>
                    
                    {/* Desktop Button (Original Perfect Layout) */}
                    <Magnetic>
                        <button className="hidden w-[198px] h-[60px] lg:flex group relative left-[-10px] items-center gap-4 bg-[#1a1a19] px-12 py-6 rounded-full overflow-hidden shadow-2xl transition-all duration-300">
                            <div className="w-[5px] h-[5px] relative left-[3.5px] rounded-full bg-white opacity-100"></div>
                            <span className="text-white font-medium tracking-wide text-[14px]" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Browse available villas</span>
                            <div className="w-[5px] h-[5px] rounded-full bg-white opacity-100"></div>
                        </button>
                    </Magnetic>

                    {/* Mobile Button (Minimalist Magazine Style) */}
                    <button className="flex lg:hidden group relative top-[-80px] items-center gap-3 pb-2 border-b border-solid border-[#1a1a19]/20 hover:border-[#1a1a19] transition-all duration-300">
                        <span className="text-[#1a1a19] font-medium tracking-[0.15em] text-[10px] uppercase" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Browse available villas</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#1a1a19] transform group-hover:translate-x-1.5 transition-transform duration-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </button>
                    
                </section>
            </div>
        </div>
    );
};

export default About;
