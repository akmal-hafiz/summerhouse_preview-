"use client";

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import { FiSearch } from 'react-icons/fi';
import Magnetic from '@/components/common/Magnetic';

type Edition = 'CURRENT EDITION' | 'EDITION 02: THE VOID' | 'EDITION 03: SOUL';

type ServiceItem = {
    title: string;
    videoUrl: string;
};

type BookingField = {
    label: string;
    placeholder: string;
};

type JournalArticle = {
    category: string;
    title: string;
    description?: string;
    image: string;
    alt: string;
};

type JournalPage = {
    featured: JournalArticle;
    secondary: JournalArticle[];
};

const containerClass = 'mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8';
const sectionClass = 'services-rhythm-section w-full touch-pan-y';
const fontSans = 'var(--font-dm-sans), sans-serif';
const fontSerif = 'var(--font-playfair), serif';

const journalEditions: Edition[] = ['CURRENT EDITION', 'EDITION 02: THE VOID', 'EDITION 03: SOUL'];

const servicesData: ServiceItem[] = [
    { title: '24/7 Concierge Service', videoUrl: 'https://videos.pexels.com/video-files/3121459/3121459-uhd_2560_1440_24fps.mp4' },
    { title: 'Wellness & Spa Center', videoUrl: 'https://videos.pexels.com/video-files/6606013/6606013-uhd_2560_1440_25fps.mp4' },
    { title: 'Gourmet On-Site Dining', videoUrl: 'https://videos.pexels.com/video-files/3195442/3195442-uhd_2560_1440_25fps.mp4' },
    { title: 'Rooftop Pool & Lounge', videoUrl: 'https://videos.pexels.com/video-files/4919736/4919736-uhd_2560_1440_25fps.mp4' },
];

const bookingFields: BookingField[] = [
    { label: 'Location', placeholder: 'Where to?' },
    { label: 'Check-in', placeholder: 'Add date' },
    { label: 'Check-out', placeholder: 'Add date' },
    { label: 'Guests', placeholder: 'Add guests' },
];

const journalPages: JournalPage[] = [
    {
        featured: {
            category: 'Design & Architecture',
            title: 'The New Uluwatu Architecture Wave',
            description: 'Discover the resurgence of tropical modernism along the limestone cliffs of the Bukit Peninsula, where concrete meets the Indian Ocean in unprecedented forms that redefine luxury.',
            image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCRQ9alZ4zY1Cu8bjOtbWCAuvuWP6Kt90CJdns-OW3m8Kx7p4wUQ7VD7RvyHQhen3hnYDeiJtFVVBvq2G6MIr3L-sh7WoRS_QLblIv3U5omxDql-4kpNnhnBHpSyk3c2w07uSVmSsJZ1mXhn67Z6EnWEpawRtexEfMsl5SNuf2mYCbAoUgOThm87ONzuyQJS8J2eKKxe4spavaq1scQGox5Bl3-QB44NB1VVMi6sE13qinMwLbCz0jDnIj6WJzHyj4YZDVEg-dF',
            alt: 'The New Uluwatu Architecture Wave',
        },
        secondary: [
            {
                category: 'Culture',
                title: 'The Heart of Ubud: Sanctuaries & Local Lore',
                description: 'A curated guide to the vibrant pulse surrounding Villa Zen. From the ancient pathways of the Monkey Forest to exclusive artisanal coffee tastings.',
                image: '/homepage_villa/88east.webp',
                alt: 'The Heart of Ubud',
            },
            {
                category: 'Gastronomy',
                title: 'Culinary Journeys: Private Dining in Bali',
                image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-7UqJ4Ne2mXUVSq5Bbi4Kr4NkyCJ5QV6mCMZX7m2B9eLGgTB7XMij_OaWGiC98CRkISo6IDwkCyu_8zsspT_oxldSNR3_PDxcez9yej3g4NpdEW6A5u3XYVP7EK_9eyszr5HguxqGcp8snIeHDxJSCgFlqEqWqeJvOxpMgge7YDFZLgcnKVVtFmUyw78L1Jxo6zJaYw-GqDxtgGnq8jkoAM6MPvEZjkUSqwnuXLjcFuRG3ObS4IFzrUsfmVM8WYPl84p4w67r',
                alt: 'Culinary Journeys',
            },
        ],
    },
    {
        featured: {
            category: 'Lifestyle',
            title: 'The Art of Slow Living in Bali',
            description: 'Embracing the Balinese philosophy of time. How our villas are designed to disconnect you from the rush and reconnect you with the present moment.',
            image: '/homepage_villa/CactusEstate.webp',
            alt: 'Slow Living',
        },
        secondary: [
            {
                category: 'Design',
                title: 'Sustainable Luxury',
                description: 'Exploring the boundaries of bamboo architecture and how local materials are shaping the future of high-end eco-resorts.',
                image: '/homepage_villa/officiana17.webp',
                alt: 'Bamboo Architecture',
            },
            {
                category: 'Exploration',
                title: 'Secret Beaches of the Bukit',
                image: '/homepage_villa/rumahmimosa.webp',
                alt: 'Secret Beaches',
            },
        ],
    },
];

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

const StoryBlock = () => (
    <section className={sectionClass}>
        <div className={containerClass}>
            <div className="flex max-w-5xl flex-col items-start gap-8">
                <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#1a1a19]/50 lg:text-[15px] lg:text-[#1a1a19]" style={{ fontFamily: fontSans }}>
                    The Summerhouse Story
                </span>
                <h2 className="max-w-5xl text-[24px] font-medium leading-[1.4] tracking-tight text-[#446B4A] md:text-4xl lg:text-[44px] lg:leading-[1.15]" style={{ fontFamily: fontSans }}>
                    We didn't set out to build another villa rental. We set out to answer one question: what does it feel like to stay somewhere that truly gets you? The result is Summerhouse — where every detail exists to make you feel at home, not like a guest.
                </h2>
                <Magnetic>
                    <a href="/villas" className="group flex h-[56px] w-[220px] items-center justify-between rounded-full bg-[#2E2E2C] px-6 shadow-[0_4px_14px_0_rgba(0,0,0,0.2)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#222]">
                        <div className="h-[5px] w-[5px] rounded-full bg-white opacity-90" />
                        <span className="text-[14px] font-medium tracking-wide text-white" style={{ fontFamily: fontSans }}>
                            Find your villa
                        </span>
                        <div className="h-[5px] w-[5px] rounded-full bg-white opacity-90" />
                    </a>
                </Magnetic>
            </div>
        </div>
    </section>
);

const MobileBentoGallery = () => (
    <div className="-mx-4 flex w-screen snap-x snap-mandatory overflow-x-auto pb-12 md:-mx-6 lg:hidden">
        <div className="relative h-[300px] min-w-full snap-start px-4 md:h-[420px] md:px-6">
            <div className="relative mx-auto grid h-full w-[90%] place-items-center overflow-hidden rounded-[28px] border border-[#1a1a19]/5 bg-[#F2EDE3] px-7 py-12 md:px-10 md:py-14">
                <div className="pointer-events-none absolute -left-3 -top-5 select-none font-serif text-[160px] leading-none text-[#e8e0d0] opacity-50" style={{ fontFamily: fontSerif }}>
                    &quot;
                </div>
                <div style={{ transform: 'translateY(clamp(-8px, -1.5svh, -16px))' }}>
                    <h3 className="relative z-10 w-[90%] text-[15px] font-medium leading-[1.35] tracking-tight text-[#1a1a19] md:max-w-[620px]" style={{ fontFamily: fontSans }}>
                        Every corner is a decision. Every window is a frame. We don't just build villas — we compose spaces that let Bali speak for itself.
                    </h3>
                    <p className="relative z-10 mt-5 w-[85%] text-[15px] font-normal leading-[1.7] text-[#68635c] md:max-w-[680px]" style={{ fontFamily: fontSans }}>
                        Raw stone, reclaimed wood, hand-woven textiles — every material is chosen with intention. Because real luxury isn't about excess. It's about meaning.
                    </p>
                </div>
            </div>
            <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -bottom-7 right-8 text-right text-[8px] font-bold uppercase tracking-[0.3em] text-[#1a1a19]/30 md:right-10">
                Swipe to explore <span className="text-[10px]">→</span>
            </motion.div>
        </div>

        <div className="flex h-[300px] min-w-[95vw] snap-start gap-2 px-4 pr-10 md:h-[420px] md:px-6 md:pr-12">
            <div className="group relative h-full w-[45%] overflow-hidden rounded-[24px]">
                <video src="/video/video1.mp4" autoPlay loop muted playsInline className="h-full w-full object-cover" />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 z-20 text-[7px] font-bold uppercase tracking-[0.2em] text-white">01 / The Craft</div>
            </div>
            <div className="flex h-full w-[55%] flex-col gap-2">
                <div className="group relative h-[58%] w-full overflow-hidden rounded-[24px]">
                    <video src="/video/herosection_summerhouse.mp4" autoPlay loop muted playsInline className="h-full w-full object-cover" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4 z-20 text-[7px] font-bold uppercase tracking-[0.2em] text-white">02 / The Light</div>
                </div>
                <div className="flex h-[42%] gap-2">
                    <MobileGalleryImage src="/homepage_villa/curated-1-main.webp" alt="Pool Detail" label="03 / The Void" />
                    <MobileGalleryImage src="/homepage_villa/curated-2-detail.webp" alt="Material Detail" label="04 / The Soul" />
                </div>
            </div>
        </div>
    </div>
);

const MobileGalleryImage = ({ src, alt, label }: { src: string; alt: string; label: string }) => (
    <div className="group relative h-full w-1/2 overflow-hidden rounded-[18px]">
        <Image src={src} alt={alt} fill className="object-cover" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-black/30 to-transparent" />
        <div className="absolute bottom-2 left-2 z-20 text-[5px] font-bold uppercase tracking-[0.2em] text-white">{label}</div>
    </div>
);

const DesktopGallery = () => (
    <div className="hidden grid-cols-2 gap-4 lg:grid">
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

const ExperienceSection = ({ activeVideoIndex, progress, videoRef, onVideoChange, onTimeUpdate, onVideoEnd }: { activeVideoIndex: number; progress: number; videoRef: React.RefObject<HTMLVideoElement | null>; onVideoChange: (index: number) => void; onTimeUpdate: () => void; onVideoEnd: () => void }) => (
    <div className="w-full">
        <section className="about-hero-section w-full touch-pan-y">
            <div className={`${containerClass} about-hero-copy flex flex-col items-center text-center`}>
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

const BookingFieldGroup = ({ field, isLast, compact = false }: { field: BookingField; isLast: boolean; compact?: boolean }) => (
    <div className={`flex min-w-0 flex-1 flex-col ${compact ? 'px-3 py-1' : 'px-2 py-2 lg:px-6'} ${isLast ? '' : compact ? 'border-r border-white/10' : 'border-r border-white/20'}`}>
        <span className={`${compact ? 'text-[6.5px]' : 'text-[10px] lg:text-[13px]'} mb-1 truncate font-bold uppercase tracking-widest text-white/60`} style={{ fontFamily: fontSans }}>
            {field.label}
        </span>
        <input type="text" placeholder={field.placeholder} className={`${compact ? 'text-[10px]' : 'text-[14px] lg:text-[18px]'} w-full truncate border-none bg-transparent font-medium text-white placeholder-white/60 focus:outline-none`} style={{ fontFamily: fontSans }} />
    </div>
);

const BookingSection = ({ bookingRef, yParallax }: { bookingRef: React.RefObject<HTMLElement | null>; yParallax: any }) => (
    <section ref={bookingRef} className="services-cta-section relative flex min-h-[440px] w-full items-center justify-center overflow-hidden touch-pan-y lg:min-h-[580px]">
        <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.img style={{ y: yParallax, scale: 1.15 }} src="/homepage_villa/VillaZen.webp" className="absolute -top-[15%] h-[130%] w-full object-cover" alt="Villa Pool" />
            <div className="absolute inset-0 bg-black/50 lg:bg-black/40" />
        </div>
        <div className={`${containerClass} relative z-10 flex flex-col items-center gap-10 lg:gap-16`}>
            <h2 className="text-center text-[28px] font-medium leading-[1.15] tracking-tight text-white md:text-5xl lg:text-[56px] lg:leading-[1.1]" style={{ fontFamily: fontSans }}>
                Ready when you are. <br /> Your villa awaits.
            </h2>

            <form className="flex w-full max-w-[520px] flex-row items-center justify-between gap-0 rounded-full border border-white/20 bg-white/10 px-2 py-2 shadow-xl backdrop-blur-[16px] lg:hidden">
                {bookingFields.map((field, index) => (
                    <BookingFieldGroup key={field.label} field={field} isLast={index === bookingFields.length - 1} compact />
                ))}
                <button type="submit" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/20 text-white transition-all duration-300 hover:border-transparent hover:bg-[#446B4A]/90 active:scale-95">
                    <FiSearch className="h-[14px] w-[14px] transition-transform group-hover:scale-110" />
                </button>
            </form>

            <form className="hidden w-full max-w-[1200px] flex-row items-center justify-between gap-4 overflow-visible rounded-full border border-white/30 bg-[#1b1b1b]/10 px-10 py-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] backdrop-blur-sm lg:flex lg:gap-8">
                {bookingFields.map((field, index) => (
                    <BookingFieldGroup key={field.label} field={field} isLast={index === bookingFields.length - 1} />
                ))}
                <button type="submit" className="flex h-[70px] w-[180px] shrink-0 items-center justify-center gap-3 rounded-full border border-white/30 bg-white/20 text-white shadow-sm transition-all duration-300 hover:border-transparent hover:bg-[#446B4A]/90">
                    <FiSearch className="h-[22px] w-[22px] min-w-[18px] transition-transform group-hover:scale-110" />
                    <span className="text-[15px] font-bold uppercase tracking-[0.2em]" style={{ fontFamily: fontSans }}>
                        Search
                    </span>
                </button>
            </form>
        </div>
    </section>
);

const JournalDropdown = ({ activeEdition, isOpen, onToggle, onSelect, variant }: { activeEdition: Edition; isOpen: boolean; onToggle: () => void; onSelect: (edition: Edition) => void; variant: 'desktop' | 'mobile' }) => {
    const isDesktop = variant === 'desktop';

    return (
        <div className={`${isDesktop ? 'hidden lg:flex' : 'flex lg:hidden'} relative z-50 flex-col ${isDesktop ? 'items-end' : 'items-center'}`}>
            <button type="button" onClick={onToggle} className={`${isDesktop ? 'text-[11px] tracking-[0.25em] text-white/90 hover:text-white' : 'text-[10px] tracking-[0.2em] text-white'} flex items-center gap-2 font-bold uppercase transition-all duration-300`}>
                <span className="border-b border-white/30 pb-10">{activeEdition}</span>
                <motion.svg animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.3 }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="opacity-80">
                    <path d="M6 9l6 6 6-6" />
                </motion.svg>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div initial={{ opacity: 0, y: isDesktop ? -15 : 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: isDesktop ? -10 : 10, scale: 0.95 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }} className={`${isDesktop ? 'right-0 top-16 w-[360px] py-4' : 'right-0 top-14 w-[220px] py-3'} absolute rounded-2xl border border-white/10 bg-white/10 shadow-2xl backdrop-blur-sm`}>
                        {journalEditions.map((edition) => (
                            <button key={edition} type="button" onClick={() => onSelect(edition)} className={`relative w-full px-7 py-4 pl-12 text-left text-[8px] font-bold uppercase tracking-[0.2em] transition-all duration-300 ${activeEdition === edition ? 'bg-white/5 text-white' : 'text-white/40 hover:bg-white/[0.02] hover:text-white/70'} ${isDesktop ? 'text-[9px]' : ''}`}>
                                {activeEdition === edition && <motion.span layoutId={`journal-dot-${variant}`} className="absolute left-6 top-1/2 h-[4px] w-[4px] -translate-y-1/2 rounded-full bg-white" />}
                                {edition}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const DesktopJournalPage = ({ page }: { page: JournalPage }) => (
    <div className="grid w-full min-h-[800px] grid-cols-12 gap-10 lg:px-8" style={{ backfaceVisibility: 'hidden' }}>
        <article className="group col-span-7 flex cursor-pointer flex-col">
            <div className="aspect-[820/540] overflow-hidden rounded-[24px] bg-[#1a1a19]">
                <img src={page.featured.image} alt={page.featured.alt} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            </div>
            <span className="mt-8 text-[10px] font-bold uppercase tracking-[0.15em] text-white/40">{page.featured.category}</span>
            <h3 className="mt-2 text-[32px] font-medium leading-[1.25] tracking-tight text-white lg:text-[32px]" style={{ fontFamily: fontSans }}>
                {page.featured.title}
            </h3>
            {page.featured.description && (
                <p className="mt-3 max-w-[90%] text-[14px] leading-[1.7] text-white/60" style={{ fontFamily: fontSans }}>
                    {page.featured.description}
                </p>
            )}
        </article>
        <div className="col-span-5 flex flex-col gap-8">
            {page.secondary.map((article) => (
                <article key={article.title} className="group flex cursor-pointer flex-col">
                    <div className="aspect-[16/9] overflow-hidden rounded-[24px] bg-[#1a1a19]">
                        <img src={article.image} alt={article.alt} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    </div>
                    <span className="mt-5 text-[9px] font-bold uppercase tracking-[0.15em] text-white/40">{article.category}</span>
                    <h3 className="mt-2 text-[22px] font-medium leading-[1.2] tracking-tight text-white" style={{ fontFamily: fontSans }}>
                        {article.title}
                    </h3>
                    {article.description && (
                        <p className="mt-2 text-[13px] leading-[1.6] text-white/60" style={{ fontFamily: fontSans }}>
                            {article.description}
                        </p>
                    )}
                </article>
            ))}
        </div>
    </div>
);

const MobileJournalPage = ({ page }: { page: JournalPage }) => (
    <div className="grid w-full grid-cols-2 gap-6" style={{ backfaceVisibility: 'hidden' }}>
        <article className="group col-span-1 flex cursor-pointer flex-col">
            <div className="aspect-[4/3.2] overflow-hidden rounded-[10px] bg-[#1a1a19]">
                <img src={page.featured.image} alt={page.featured.alt} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
            </div>
            <span className="mt-3 text-[6px] font-bold uppercase tracking-[0.15em] text-white/40">{page.featured.category}</span>
            <h3 className="mt-2 text-[12px] font-medium leading-[1.3] tracking-tight text-white" style={{ fontFamily: fontSans }}>
                {page.featured.title}
            </h3>
            {page.featured.description && (
                <p className="mt-2 text-[8px] leading-[1.6] text-white/60" style={{ fontFamily: fontSans }}>
                    {page.featured.description}
                </p>
            )}
        </article>
        <div className="col-span-1 flex flex-col gap-5 pt-12">
            {page.secondary.slice(0, 1).map((article) => (
                <article key={article.title} className="group flex cursor-pointer flex-col">
                    <div className="aspect-[4/5] w-3/4 overflow-hidden rounded-[10px] bg-[#1a1a19]">
                        <img src={article.image} alt={article.alt} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                    </div>
                    <span className="mt-3 text-[6px] font-bold uppercase tracking-[0.15em] text-white/40">{article.category}</span>
                    <h3 className="mt-2 max-w-[120px] text-[10px] font-medium leading-[1.3] tracking-tight text-white" style={{ fontFamily: fontSans }}>
                        {article.title}
                    </h3>
                    {article.description && (
                        <p className="mt-2 max-w-[80%] text-[7px] leading-[1.6] text-white/60" style={{ fontFamily: fontSans }}>
                            {article.description}
                        </p>
                    )}
                </article>
            ))}
        </div>
    </div>
);

const JournalSection = ({ activeEdition, isDesktopOpen, isMobileOpen, isDesktopFlipped, isMobileFlipped, onDesktopToggle, onMobileToggle, onDesktopSelect, onMobileSelect }: { activeEdition: Edition; isDesktopOpen: boolean; isMobileOpen: boolean; isDesktopFlipped: boolean; isMobileFlipped: boolean; onDesktopToggle: () => void; onMobileToggle: () => void; onDesktopSelect: (edition: Edition) => void; onMobileSelect: (edition: Edition) => void }) => (
    <section className="services-rhythm-section w-full bg-[#050505] touch-pan-y min-h-[80svh] flex flex-col justify-center">
        <div className={containerClass}>
            <div className="flex flex-col gap-10">
                <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
                    <h2 className="text-center text-[28px] font-medium tracking-tight text-white md:text-5xl lg:text-left lg:text-[56px]" style={{ fontFamily: fontSans }}>
                        Summerhouse Journal
                    </h2>
                    <JournalDropdown activeEdition={activeEdition} isOpen={isDesktopOpen} onToggle={onDesktopToggle} onSelect={onDesktopSelect} variant="desktop" />
                    <JournalDropdown activeEdition={activeEdition} isOpen={isMobileOpen} onToggle={onMobileToggle} onSelect={onMobileSelect} variant="mobile" />
                </div>
                <div className="h-px w-full bg-[#333333]" />

                <div className="hidden lg:block" style={{ perspective: '2500px' }}>
                    <div className="relative w-full transition-transform duration-[1.2s] ease-[cubic-bezier(0.645,0.045,0.355,1)]" style={{ transformStyle: 'preserve-3d', transform: isDesktopFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)' }}>
                        <DesktopJournalPage page={journalPages[0]} />
                        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            <DesktopJournalPage page={journalPages[1]} />
                        </div>
                    </div>
                </div>

                <div className="lg:hidden" style={{ perspective: '1500px' }}>
                    <div className="relative w-full transition-transform duration-[1.2s] ease-[cubic-bezier(0.645,0.045,0.355,1)]" style={{ transformStyle: 'preserve-3d', transform: isMobileFlipped ? 'rotateY(-180deg)' : 'rotateY(0deg)' }}>
                        <MobileJournalPage page={journalPages[0]} />
                        <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                            <MobileJournalPage page={journalPages[1]} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
);

const PolaroidStack = () => (
    <div className="relative flex h-[140px] w-[180px] items-center justify-center md:h-[180px] md:w-[260px]">
        <PolaroidCard className="left-0 z-10 -rotate-12 hover:rotate-0" src="/homepage_villa/curated-1-main.webp" alt="Villa 1" />
        <PolaroidCard className="right-0 z-10 rotate-12 hover:rotate-0" src="/homepage_villa/curated-2-detail.webp" alt="Villa 2" />
        <PolaroidCard className="z-20 hover:scale-110" src="/homepage_villa/curated-3-corner.webp" alt="Villa 3" center />
    </div>
);

const PolaroidCard = ({ src, alt, className, center = false }: { src: string; alt: string; className: string; center?: boolean }) => (
    <div className={`absolute rounded-[12px] bg-white p-1.5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-500 ${center ? 'h-[120px] w-[110px] md:h-[160px] md:w-[150px]' : 'h-[110px] w-[100px] md:h-[150px] md:w-[140px]'} ${className}`}>
        <div className="relative h-full w-full overflow-hidden rounded-[8px]">
            <img src={src} className="h-full w-full object-cover" alt={alt} />
        </div>
        <div className="absolute left-3 top-3 h-[6px] w-[6px] rounded-full bg-white shadow-sm" />
    </div>
);

const PolaroidCTA = () => (
    <section className="services-rhythm-section w-full min-h-[500px] bg-[#FAFAF9] touch-pan-y lg:grid lg:place-items-center">
        <div className={`${containerClass} flex flex-col items-center justify-center gap-8 text-center`} style={{ transform: 'translateY(clamp(-16px, -2svh, -32px))' }}>
            <div className="flex w-full max-w-[1200px] flex-col flex-wrap items-center justify-center gap-4 whitespace-normal md:gap-8 lg:flex-row lg:whitespace-nowrap">
                <h2 className="text-[48px] font-medium tracking-tight text-[#1a1a19] md:text-7xl lg:text-[80px]" style={{ fontFamily: fontSans }}>
                    Stay
                </h2>
                <PolaroidStack />
                <h2 className="text-[48px] font-medium tracking-tight text-[#1a1a19] md:text-7xl lg:text-[80px]" style={{ fontFamily: fontSans }}>
                    differently.
                </h2>
            </div>
            <p className="max-w-[350px] text-[12px] text-[#68635c] md:text-[18px] lg:max-w-[640px] lg:text-[18px]" style={{ fontFamily: fontSans }}>
                Not just a place to sleep. A place to remember. Curated villas across Bali's most coveted corners, ready for you.
            </p>
            <Magnetic>
                <button className="group hidden h-[60px] w-[198px] items-center gap-4 overflow-hidden rounded-full bg-[#1a1a19] px-12 py-6 shadow-2xl transition-all duration-300 lg:flex">
                    <div className="h-[5px] w-[5px] rounded-full bg-white opacity-100" />
                    <span className="text-[14px] font-medium tracking-wide text-white" style={{ fontFamily: fontSans }}>
                        Browse available villas
                    </span>
                    <div className="h-[5px] w-[5px] rounded-full bg-white opacity-100" />
                </button>
            </Magnetic>
            <button className="group flex items-center gap-3 border-b border-solid border-[#1a1a19]/20 pb-2 transition-all duration-300 hover:border-[#1a1a19] lg:hidden">
                <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#1a1a19]" style={{ fontFamily: fontSans }}>
                    Browse available villas
                </span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#1a1a19] transition-transform duration-300 group-hover:translate-x-1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
            </button>
        </div>
    </section>
);

const About = () => {
    const bookingRef = useRef<HTMLElement | null>(null);
    const { scrollYProgress } = useScroll({ target: bookingRef, offset: ['start end', 'end start'] });
    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });
    const yParallax = useTransform(smoothProgress, [0, 1], ['-15%', '15%']);

    const [activeVideoIndex, setActiveVideoIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const videoRef = useRef<HTMLVideoElement>(null);

    const [isMobileJournalFlipped, setIsMobileJournalFlipped] = useState(false);
    const [isDesktopJournalFlipped, setIsDesktopJournalFlipped] = useState(false);
    const [isJournalDropdownOpen, setIsJournalDropdownOpen] = useState(false);
    const [isMobileJournalDropdownOpen, setIsMobileJournalDropdownOpen] = useState(false);
    const [activeEdition, setActiveEdition] = useState<Edition>('CURRENT EDITION');

    const setEdition = (edition: Edition, target: 'desktop' | 'mobile') => {
        setActiveEdition(edition);
        const shouldFlip = edition !== 'CURRENT EDITION';

        if (target === 'desktop') {
            setIsDesktopJournalFlipped(shouldFlip);
            setIsJournalDropdownOpen(false);
            return;
        }

        setIsMobileJournalFlipped(shouldFlip);
        setIsMobileJournalDropdownOpen(false);
    };

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
            <ExperienceSection activeVideoIndex={activeVideoIndex} progress={progress} videoRef={videoRef} onVideoChange={(index) => { setActiveVideoIndex(index); setProgress(0); }} onTimeUpdate={handleTimeUpdate} onVideoEnd={handleVideoEnd} />
            <StoryBlock />
            <GallerySection />
            <div className="w-full">
                <BookingSection bookingRef={bookingRef} yParallax={yParallax} />
                <JournalSection activeEdition={activeEdition} isDesktopOpen={isJournalDropdownOpen} isMobileOpen={isMobileJournalDropdownOpen} isDesktopFlipped={isDesktopJournalFlipped} isMobileFlipped={isMobileJournalFlipped} onDesktopToggle={() => setIsJournalDropdownOpen((open) => !open)} onMobileToggle={() => setIsMobileJournalDropdownOpen((open) => !open)} onDesktopSelect={(edition) => setEdition(edition, 'desktop')} onMobileSelect={(edition) => setEdition(edition, 'mobile')} />
            </div>
            <PolaroidCTA />
        </div>
    );
};

export default About;
