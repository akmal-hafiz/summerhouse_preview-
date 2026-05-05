"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { StatsSection } from './StatsSection';

// --- Constants & Types ---

const containerClass = 'mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8';
const sectionClass = 'services-rhythm-section w-full touch-pan-y';
const fontSans = 'var(--font-dm-sans), sans-serif';
const fontSerif = 'var(--font-playfair), serif';

type ServiceItem = {
    title: string;
    videoUrl: string;
};

const servicesData: ServiceItem[] = [
    { title: '24/7 Concierge Service', videoUrl: 'https://videos.pexels.com/video-files/3121459/3121459-uhd_2560_1440_24fps.mp4' },
    { title: 'Wellness & Spa Center', videoUrl: 'https://videos.pexels.com/video-files/6606013/6606013-uhd_2560_1440_25fps.mp4' },
    { title: 'Gourmet On-Site Dining', videoUrl: 'https://videos.pexels.com/video-files/3195442/3195442-uhd_2560_1440_25fps.mp4' },
    { title: 'Rooftop Pool & Lounge', videoUrl: 'https://videos.pexels.com/video-files/4919736/4919736-uhd_2560_1440_25fps.mp4' },
];

// --- Core Utilities ---

const CharacterReveal = ({ text, className }: { text: string; className?: string }) => {
    return (
        <span className={className}>
            {text.split('').map((char, index) => (
                <motion.span
                    key={`${char}-${index}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.03, ease: [0.22, 1, 0.36, 1] }}
                    style={{ display: 'inline-block', whiteSpace: char === ' ' ? 'pre' : 'normal' }}
                >
                    {char}
                </motion.span>
            ))}
        </span>
    );
};

const MaskedVideo = ({ src, className, delay = 0, parallaxSpeed = 0 }: { src: string; className?: string; delay?: number; parallaxSpeed?: number }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], [0, parallaxSpeed * 100]);

    return (
        <div ref={ref} className={`relative overflow-hidden ${className}`}>
            <motion.div
                initial={{ clipPath: 'inset(100% 0% 0% 0%)', filter: 'blur(10px)', opacity: 0 }}
                whileInView={{ clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px)', opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay, ease: [0.33, 1, 0.68, 1] }}
                className="relative h-full w-full"
            >
                <motion.div style={{ y, scale: 1.15 }} className="absolute inset-0 h-full w-full">
                    <video src={src} autoPlay loop muted playsInline className="absolute inset-0 h-full w-full object-cover" />
                </motion.div>
            </motion.div>
        </div>
    );
};

const MaskedImage = ({ src, alt, className, delay = 0, parallaxSpeed = 0 }: { src: string; alt: string; className?: string; delay?: number; parallaxSpeed?: number }) => {
    const ref = useRef(null);
    const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
    const y = useTransform(scrollYProgress, [0, 1], [0, parallaxSpeed * 100]);

    return (
        <div ref={ref} className={`relative overflow-hidden ${className}`}>
            <motion.div
                initial={{ clipPath: 'inset(100% 0% 0% 0%)', filter: 'blur(10px)', opacity: 0 }}
                whileInView={{ clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px)', opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1.5, delay, ease: [0.33, 1, 0.68, 1] }}
                className="relative h-full w-full"
            >
                <motion.div style={{ y, scale: 1.15 }} className="absolute inset-0 h-full w-full">
                    <Image src={src} alt={alt} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 25vw" />
                </motion.div>
            </motion.div>
        </div>
    );
};

// --- Section 1: Experience (Hero) ---

const ServiceNavigation = ({ activeVideoIndex, progress, onChange }: { activeVideoIndex: number; progress: number; onChange: (index: number) => void }) => (
    <div className="w-full border-t border-[#1a1a19]/5 bg-[#FAFAF9] shadow-sm">
        <div className={`${containerClass} flex min-h-16 items-center justify-between lg:min-h-24`}>
            {servicesData.map((service, index) => (
                <button key={service.title} type="button" className="group relative flex min-h-16 flex-1 flex-col items-center justify-center px-1 lg:min-h-24" onClick={() => onChange(index)}>
                    <span className={`text-center text-[9px] tracking-wide transition-all md:text-[13px] ${activeVideoIndex === index ? 'font-bold text-black' : 'text-gray-400 group-hover:text-gray-600'}`} style={{ fontFamily: fontSans }}>
                        {service.title}
                    </span>
                    <span className="absolute bottom-0 left-2 right-2 h-[3px] overflow-hidden bg-gray-100 md:left-4 md:right-4">
                        <span className="block h-full bg-[#1a1a19] transition-all duration-75" style={{ width: activeVideoIndex === index ? `${progress}%` : activeVideoIndex > index ? '100%' : '0%' }} />
                    </span>
                </button>
            ))}
        </div>
    </div>
);

const HeroVideo = ({ videoRef, onTimeUpdate, onEnded, activeVideoIndex }: { videoRef: React.RefObject<HTMLVideoElement | null>; onTimeUpdate: () => void; onEnded: () => void; activeVideoIndex: number }) => (
    <div className="relative aspect-[16/9] w-full overflow-hidden lg:aspect-[16/8]" style={{ borderBottomLeftRadius: '50% 5%', borderBottomRightRadius: '50% 5%' }}>
        <div className="pointer-events-none absolute inset-0 z-10 bg-black/20" />
        <video ref={videoRef} muted playsInline onTimeUpdate={onTimeUpdate} onEnded={onEnded} className="h-full w-full object-cover transition-opacity duration-1000" />
        <div className="pointer-events-none absolute left-0 top-8 z-20 hidden w-full justify-between px-6 md:flex md:px-12">
            <div className="mx-auto flex w-full max-w-7xl justify-between">
                {servicesData.map((service, index) => (
                    <div key={`dot-${service.title}`} className="flex flex-1 justify-center">
                        <div className={`h-2 w-2 rounded-full shadow-lg transition-all duration-500 ${activeVideoIndex === index ? 'scale-150 bg-white' : 'bg-white/40'}`} />
                    </div>
                ))}
            </div>
        </div>
    </div>
);

const ExperienceSection = ({ activeVideoIndex, progress, videoRef, onVideoChange, onTimeUpdate, onVideoEnd }: { activeVideoIndex: number; progress: number; videoRef: React.RefObject<HTMLVideoElement | null>; onVideoChange: (index: number) => void; onTimeUpdate: () => void; onVideoEnd: () => void }) => (
    <div className="w-full">
        <section className="about-hero-section w-full touch-pan-y">
            <div className={`${containerClass} about-hero-copy flex flex-col items-center text-center translate-x-0 md:translate-x-0 lg:translate-x-15`}>
                <motion.h1 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, ease: 'easeOut' }} className="text-[34px] font-medium leading-[1.25] tracking-tight text-[#446B4A] md:text-6xl md:leading-[1.18] lg:text-[72px] lg:leading-[1.12]" style={{ fontFamily: fontSerif }}>
                    <CharacterReveal text="Not a hotel. A home." />
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }} className="mx-auto max-w-[760px] text-[13px] font-light leading-[1.7] text-[#5a5651] md:text-[16px] lg:text-[17px] lg:leading-[1.8]" style={{ fontFamily: fontSans }}>
                    Some places offer a room. We offer something rarer — a space that feels like it was built for you. Quiet, intentional, and entirely Bali.
                </motion.p>
            </div>
        </section>

        <section className="about-video-section w-full touch-pan-y">
            <ServiceNavigation activeVideoIndex={activeVideoIndex} progress={progress} onChange={onVideoChange} />
            <HeroVideo videoRef={videoRef} onTimeUpdate={onTimeUpdate} onEnded={onVideoEnd} activeVideoIndex={activeVideoIndex} />
        </section>
    </div>
);

// --- Section 2: Story ---

const StoryBlock = () => (
    <section className={sectionClass}>
        <div className={containerClass}>
            <div className="flex justify-center max-w-5xl flex-col items-start transform translate-x-6 gap-8">
                <span className="text-[12px] md:text-[21px] font-medium uppercase leading-relaxed tracking-[0.12em] text-[#1a1a19]/50 lg:text-[15px] lg:text-[#1a1a19]" style={{ fontFamily: fontSans }}>
                    The Summerhouse Story
                </span>
                <h2 className="max-w-4xl text-[24px] font-medium leading-[1.6] tracking-tight text-[#446B4A] md:text-3xl lg:text-[44px] lg:leading-[1.15]" style={{ fontFamily: fontSans }}>
                    We didn't set out to build another villa rental. We set out to answer one question: what does it feel like to stay somewhere that truly gets you? The result is Summerhouse — where every detail exists to make you feel at home, not like a guest.
                </h2>
            </div>
        </div>
    </section>
);

// --- Section 3: Gallery ---

const MobileBentoGallery = () => {
    const stagger = {
        hidden: { opacity: 0, y: 40, scale: 0.97 },
        visible: (i: number) => ({
            opacity: 1, y: 0, scale: 1,
            transition: { duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] as const },
        }),
    };

    return (
        <div className="flex flex-col gap-6 transform md:translate-x-8 translate-x-5 lg:hidden">
            <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                custom={0}
                variants={stagger}
                className="relative w-[90%] mx-auto"
            >
                <div className="relative mx-auto grid h-[300px] md:h-[420px] w-full place-items-center overflow-hidden rounded-[28px] border border-[#1a1a19]/5 bg-[#F2EDE3] px-7 py-12 md:px-10 md:py-14">
                    <div className="pointer-events-none absolute -left-3 -top-5 select-none font-serif text-[160px] leading-none text-[#e8e0d0] opacity-50" style={{ fontFamily: fontSerif }}>
                        &quot;
                    </div>
                    <div style={{ transform: 'translateY(clamp(-8px, -1.5svh, -16px))' }}>
                        <h3 className="relative z-10 w-[90%] text-[15px] font-medium leading-[1.35] tracking-tight text-[#1a1a19] md:max-w-[620px]" style={{ fontFamily: fontSans }}>
                            Every corner is a decision. Every window is a frame. We don&apos;t just build villas — we compose spaces that let Bali speak for itself.
                        </h3>
                        <p className="relative z-10 mt-5 w-[85%] text-[15px] font-normal leading-[1.7] text-[#68635c] md:max-w-[680px]" style={{ fontFamily: fontSans }}>
                            Raw stone, reclaimed wood, hand-woven textiles — every material is chosen with intention. Because real luxury isn&apos;t about excess. It&apos;s about meaning.
                        </p>
                    </div>
                </div>
            </motion.div>

            <div className="flex mx-auto w-[90%] md:w-[90%] h-[300px] md:h-[420px] gap-2">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.2 }}
                    custom={1}
                    variants={stagger}
                    className="group relative h-full w-[45%] overflow-hidden rounded-[24px]"
                >
                    <video src="/video/video1.mp4" autoPlay loop muted playsInline className="h-full w-full object-cover" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 z-20 text-[7px] font-bold uppercase tracking-[0.2em] text-white">01 / The Craft</div>
                </motion.div>

                <div className="flex h-full w-[55%] flex-col gap-2">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        custom={2}
                        variants={stagger}
                        className="group relative h-[58%] w-full overflow-hidden rounded-[24px]"
                    >
                        <video src="/video/herosection_summerhouse.mp4" autoPlay loop muted playsInline className="h-full w-full object-cover" />
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                        <div className="absolute bottom-4 left-4 z-20 text-[7px] font-bold uppercase tracking-[0.2em] text-white">02 / The Light</div>
                    </motion.div>

                    <div className="flex h-[42%] gap-2">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            custom={3}
                            variants={stagger}
                            className="group relative h-full w-1/2 overflow-hidden rounded-[18px]"
                        >
                            <Image src="/homepage_villa/curated-1-main.webp" alt="Pool Detail" fill className="object-cover" />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />
                            <div className="absolute bottom-2 left-2 z-20 text-[5px] font-bold uppercase tracking-[0.2em] text-white">03 / The Void</div>
                        </motion.div>
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.2 }}
                            custom={4}
                            variants={stagger}
                            className="group relative h-full w-1/2 overflow-hidden rounded-[18px]"
                        >
                            <Image src="/homepage_villa/curated-2-detail.webp" alt="Material Detail" fill className="object-cover" />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />
                            <div className="absolute bottom-2 left-2 z-20 text-[5px] font-bold uppercase tracking-[0.2em] text-white">04 / The Soul</div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const DesktopGallery = () => (
    <div className="xl:w-[108%] 2xl:w-[115%] hidden grid-cols-2 gap-4 lg:grid transform xl:translate-x-5 2xl:translate-x-8">
        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
                <MaskedImage src="/homepage_villa/TKR03549-HDR.webp" alt="Villa Detail" className="aspect-square rounded-[24px]" parallaxSpeed={-0.2} delay={0.1} />
                <MaskedVideo src="/video/video1.mp4" className="aspect-square rounded-[24px]" parallaxSpeed={0.15} delay={0.2} />
            </div>
            <div className="flex flex-col gap-4">
                <MaskedVideo src="/video/herosection_summerhouse.mp4" className="aspect-square rounded-[24px]" parallaxSpeed={0.25} delay={0.3} />
                <MaskedImage src="/homepage_villa/villaarta.webp" alt="Villa Kitchen" className="aspect-square rounded-[24px]" parallaxSpeed={-0.1} delay={0.4} />
            </div>
        </div>
        <div className="grid min-h-[480px] place-items-center rounded-[24px] border border-[#1a1a19]/5 bg-[#F2EDE3] px-12 py-12">
            <div style={{ transform: 'translateY(clamp(-12px, -2svh, -24px))' }}>
                <h3 className="text-[28px] font-medium leading-[1.35] tracking-tight text-[#1a1a19]" style={{ fontFamily: fontSans }}>
                    &quot;Every corner is a decision. Every window is a frame. We compose spaces that let Bali speak for itself.&quot;
                </h3>
                <p className="mt-5 text-[16px] font-normal leading-[1.7] text-[#68635c]" style={{ fontFamily: fontSans }}>
                    Raw stone, reclaimed wood, hand-woven textiles — every material is chosen with intention. Real luxury isn't about excess. It's about meaning. And meaning lasts long after check-out.
                </p>
            </div>
        </div>
    </div>
);

const GallerySection = () => (
    <section className={sectionClass}>
        <div className={containerClass}>
            <MobileBentoGallery />
            <DesktopGallery />
        </div>
    </section>
);

// --- Section 4: Brand Intro ---

const BrandIntroSection = () => (
    <section className="w-full min-h-[600px] md:min-h-[700px] lg:min-h-[1000px] bg-[#FAFAF9]">
        <div className="flex flex-col items-center md:items-center lg:items-start justify-center md:justify-center lg:justify-start text-center px-4 md:px-8">
            <div className="transform translate-x-0 md:translate-x-0 lg:translate-x-40 translate-y-6">
                <motion.h2 
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-[34px] md:text-6xl lg:text-[52px] lg:translate-x-15 font-normal leading-[1.1] tracking-tight text-[#1a1a19] mb-6 md:mb-10" 
                    style={{ fontFamily: fontSerif }}
                >
                    Welcome to Summerhouses <br />
                    <span className="italic">Your Elegant Retreat</span> <br />
                    in the Heart of Bali
                </motion.h2>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mx-auto max-w-[760px] text-[13px] md:text-[16px] lg:translate-x-50 lg:translate-y-6 lg:text-[17px] text-[#5a5651] mb-8 md:mb-12 leading-[1.7] md:leading-[1.8] px-2" 
                    style={{ fontFamily: fontSans }}
                >
                    We provide an experience of refined comfort, timeless elegance, and heartfelt hospitality. 
                    Nestled in the most coveted corners of Bali, our collection of private estates invites 
                    travelers from around the world to immerse themselves in the charm and soul of the island.
                </motion.p>
                
                <Link href="/about" className="group flex flex-col items-center lg:translate-y-14 lg:translate-x-48 gap-1 mb-12 md:mb-20">
                    <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1a1a19]" style={{ fontFamily: fontSans }}>
                        MORE ABOUT US
                    </span>
                    <div className="h-[2px] w-8 bg-[#1a1a19] transition-all duration-300 group-hover:w-full" />
                </Link>
            </div>
            <div className="w-full lg:w-[80%] mx-auto aspect-[4/3] md:aspect-[21/9] rounded-none lg:rounded-none translate-y-10 md:translate-y-15 lg:translate-y-28 overflow-hidden">
                <MaskedImage 
                    src="/bellevoire/landscape.png" 
                    alt="Summerhouses Landscape" 
                    className="w-full h-full" 
                    parallaxSpeed={-0.1}
                />
            </div>
        </div>
    </section>
);

// --- Section 5: Brand Editorial ---

const BrandEditorialSection = () => (
    <section className="w-full bg-[#FAFAF9]">
        <div className="w-full text-center transform -translate-y-12 px-4 mb-12 lg:hidden">
            <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[32px] md:text-[42px] font-normal leading-tight text-[#1a1a19]"
                style={{ fontFamily: fontSerif }}
            >
                Bali Awaits at <br />
                <span className="italic">Your Summerhouse Retreat</span>
            </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-20 px-4 md:px-12 lg:px-20">
            <div className="lg:col-span-5 flex flex-col justify-center">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="text-left justify-center items-center transform translate-y-3 translate-x-6 md:translate-x-10 lg:translate-x-10"
                >
                    <h3 className="text-[28px] md:text-[42px] lg:text-[54px] -translate-y-3 font-normal leading-[1.1] text-[#1a1a19] mb-6 md:mb-8" style={{ fontFamily: fontSerif }}>
                        Summerhouses <br />
                        <span className="italic">Umalas</span>
                    </h3>
                    <p className="max-w-[350px] lg:max-w-[420px] md:max-w-[420px] text-[14px] md:text-[16px] text-[#68635c] mb-10 md:mb-12 leading-relaxed" style={{ fontFamily: fontSans }}>
                        Nestled in the artistic heart of Bali, this boutique retreat blends bohemian charm with 
                        serene rice-field views and panoramic sunsets. A space designed for quiet reflection.
                    </p>
                    
                    <Link href="/villas/umalas" className="group inline-flex translate-y-2 flex-col gap-1 mb-10 lg:mb-16">
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#1a1a19]" style={{ fontFamily: fontSans }}>
                            LEARN MORE
                        </span>
                        <div className="h-[2px] w-8 bg-[#1a1a19] transition-all duration-300 group-hover:w-full" />
                    </Link>
                </motion.div>
                
                <div className="hidden lg:block relative w-full justify-center items-center translate-x-88 translate-y-15 aspect-[2/2] max-w-[320px] rounded-[2px] overflow-hidden mt-8">
                    <MaskedImage 
                        src="/bellevoire/editorial_small.png" 
                        alt="Umalas Detail" 
                        className="w-full h-full" 
                        parallaxSpeed={0.1}
                    />
                </div>
            </div>
            
            <div className="lg:col-span-6 lg:translate-x-26 flex items-end order-last lg:order-none">
                <div className="relative w-full lg:translate-x-0 translate-x-0 md:translate-x-0 aspect-[2/2] md:aspect-[4/3] lg:aspect-[2/2] rounded-none md:rounded-none overflow-hidden">
                    <MaskedImage 
                        src="/bellevoire/editorial_large.png" 
                        alt="Umalas Main" 
                        className="w-full h-full" 
                        parallaxSpeed={-0.15}
                    />
                </div>
            </div>
        </div>
    </section>
);

// --- Section 6: More Than Stay (Transitional) ---

const MoreThanStaySection = () => {
    return (
        <section className="relative h-[390px] md:h-[800px] lg:h-[800px] w-full overflow-hidden bg-[#FAFAF9]">
            <div className="absolute inset-0">
                <motion.div
                    initial={{ opacity: 0, scale: 1.1 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, ease: [0.33, 1, 0.68, 1] }}
                    className="h-full w-full"
                >
                    <img 
                        src="/bellevoire/beach_stay.png" 
                        alt="Serene Beach" 
                        className="h-full w-full object-cover"
                    />
                </motion.div>
                <div className="absolute inset-0 bg-black/10" />
            </div>

            <div className="absolute top-0 left-0 w-full flex items-center p-8 lg:p-12 z-20">
                <motion.div 
                    initial={{ opacity: 0 }} 
                    whileInView={{ opacity: 1 }} 
                    viewport={{ once: true }}
                    className="flex items-center gap-2"
                >
                    <span className="text-white text-[15px] lg:text-[24px] translate-x-4 md:translate-x-5 lg:translate-x-0 font-normal tracking-tight" style={{ fontFamily: fontSerif }}>Summerhouses</span>
                </motion.div>
            </div>

            <div className="relative h-full w-full flex flex-col justify-between py-24 px-6 md:px-12 lg:px-20">
                <div className="relative flex-1 w-full lg:flex lg:flex-row lg:items-center lg:justify-between pt-32 lg:pt-0">
                    <motion.h2 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.1 }}
                        className="absolute top-[21%] md:top-[10%] left-[5%] lg:relative lg:top-0 lg:left-6 text-[44px] md:text-[120px] lg:text-[100px] font-normal text-white leading-none"
                        style={{ fontFamily: fontSerif }}
                    >
                        More
                    </motion.h2>

                    <motion.h2 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="absolute top-[45%] left-1/2 -translate-x-1/2 lg:relative lg:top-0 lg:left-0 lg:transform-none text-[44px] md:text-[120px] lg:text-[100px] font-normal text-white leading-none"
                        style={{ fontFamily: fontSerif }}
                    >
                        than
                    </motion.h2>

                    <motion.h2 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="absolute bottom-1/4 right-[5%] lg:relative lg:bottom-0 lg:right-7 text-[44px] md:text-[120px] lg:text-[100px] font-normal text-white italic leading-none"
                        style={{ fontFamily: fontSerif }}
                    >
                        stay
                    </motion.h2>
                </div>

                <div className="w-full flex justify-center -translate-y-5 md:-translate-y-15 lg:-translate-y-10 mt-auto">
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.2, delay: 0.7 }}
                        className="max-w-[340px] md:max-w-[600px] lg:max-w-[800px] text-center text-white text-[16px] md:text-[22px] lg:text-[38px] font-normal leading-[1.25] tracking-tight"
                        style={{ fontFamily: fontSerif }}
                    >
                        At Summerhouses, every detail is designed to make you feel at home &mdash; with the elegance of Bali just beyond your door
                    </motion.p>
                </div>
            </div>
        </section>
    );
};




// --- Section 7: Philosophy (The Ethos) ---

const PhilosophySection = () => {
    const pillars = [
        {
            title: "Spatial Poetry",
            description: "We believe a room should be more than four walls; it should be a frame for the landscape and a sanctuary for the mind. Every window, every texture, and every light shadow is curated to inspire peace.",
            image: "/homepage_villa/curated-1-main.webp"
        },
        {
            title: "Conscious Luxury",
            description: "Refinement that doesn't scream. We celebrate the beauty of raw materials, local craftsmanship, and the quiet luxury of silence. True comfort is found in the things you don't notice, but feel deeply.",
            image: "/homepage_villa/curated-2-detail.webp"
        },
        {
            title: "The Spirit of Bali",
            description: "Summerhouses isn't just in Bali; it's part of it. We honor the island's rhythm through sustainable practices, community roots, and architecture that respects the land it sits upon.",
            image: "/homepage_villa/villaarta.webp"
        }
    ];

    return (
        <section className={`${sectionClass} pb-[100px] lg:pb-[150px]`}>
            <div className={containerClass}>
                <div className="mb-16 md:mb-24 text-center">
                    <motion.span 
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="text-[11px] font-bold uppercase tracking-[0.4em] text-[#1a1a19]/40 mb-4 block"
                        style={{ fontFamily: fontSans }}
                    >
                        OUR FOUNDATION
                    </motion.span>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-[32px] md:text-[48px] font-normal text-[#446B4A]"
                        style={{ fontFamily: fontSerif }}
                    >
                        The Summerhouses Ethos
                    </motion.h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
                    {pillars.map((pillar, index) => (
                        <motion.div 
                            key={pillar.title}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: index * 0.2 }}
                            className="flex flex-col items-center text-center"
                        >
                            <div className="w-full aspect-square max-w-[280px] mb-8 overflow-hidden rounded-[2px]">
                                <MaskedImage 
                                    src={pillar.image} 
                                    alt={pillar.title} 
                                    className="w-full h-full"
                                    parallaxSpeed={0.05}
                                />
                            </div>
                            <h3 className="text-[22px] md:text-[24px] font-medium text-[#1a1a19] mb-4" style={{ fontFamily: fontSerif }}>
                                {pillar.title}
                            </h3>
                            <p className="text-[14px] md:text-[15px] leading-relaxed text-[#68635c] max-w-[320px]" style={{ fontFamily: fontSans }}>
                                {pillar.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

// --- Main Page Component ---

const About = () => {
    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const { currentTime, duration } = videoRef.current;
        if (duration) setProgress((currentTime / duration) * 100);
    };

    const handleVideoEnd = () => {
        setActiveVideoIndex((prev) => (prev + 1) % servicesData.length);
        setProgress(0);
    };

    useEffect(() => {
        if (!videoRef.current) return;
        videoRef.current.pause();
        videoRef.current.src = servicesData[activeVideoIndex].videoUrl;
        videoRef.current.load();
        videoRef.current.play().catch((error) => console.log('Auto-play prevented', error));
    }, [activeVideoIndex]);

    return (
        <div className="services-page-shell flex w-full flex-col items-center gap-y-[60px] md:gap-y-[80px] lg:gap-y-[110px] overflow-x-hidden bg-[#FAFAF9]">
            <ExperienceSection 
                activeVideoIndex={activeVideoIndex} 
                progress={progress} 
                videoRef={videoRef} 
                onVideoChange={(index) => { setActiveVideoIndex(index); setProgress(0); }} 
                onTimeUpdate={handleTimeUpdate} 
                onVideoEnd={handleVideoEnd} 
            />
            <StoryBlock />
            <GallerySection />
            <BrandIntroSection />
            <BrandEditorialSection />
            <MoreThanStaySection />
            <StatsSection />
            <PhilosophySection />
        </div>
    );
};

export default About;
