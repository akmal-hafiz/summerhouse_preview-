"use client";

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

const journalItems = [
    {
        title: "VILLAS in CANGGU",
        cta: "FIND YOUR COASTAL ESCAPE",
        image: "/homepage_villa/88east.webp",
        link: "/journal/uluwatu-escape"
    },
    {
        title: "PRIVATE ESTATES in UBUD",
        cta: "FIND THE PERFECT SANCTUARY",
        image: "/homepage_villa/VillaZen.webp",
        link: "/journal/bali-slow-living"
    },
    {
        title: "VILLAS in ULUWATU",
        cta: "FIND YOUR CLIFFSIDE ESCAPE",
        image: "/homepage_villa/curated-4-view.webp",
        link: "/journal/uluwatu-escape"
    },
    {
        title: "RETREATS in PERERENAN",
        cta: "EXPLORE THE BLACK SANDS",
        image: "/homepage_villa/CactusEstate.webp",
        link: "/journal/bali-slow-living"
    },
    {
        title: "ESTATES in UMALAS",
        cta: "VIEW THE COLLECTION",
        image: "/homepage_villa/villaarta.webp",
        link: "/journal/uluwatu-escape"
    }
];

const JournalCarousel = () => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 10);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -400 : 400;
            scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    return (
        <section className="w-full min-h-[280px] md:min-h-[500px] lg:min-h-[700px] bg-[var(--color-page)] py-[100px] relative overflow-visible">
            <div className="w-full md:w-[95%] mx-auto px-4 sm:px-6 translate-x-0px md:translate-x-0 lg:translate-x-0 lg:px-8 max-w-8xl transform translate-y-[40px] md:translate-y-[60px] lg:translate-y-[80px]">
                {/* Header */}
                <div className="text-center mb-16 lg:mb-24">
                    <h2
                        className="text-[14px] lg:text-[16px] font-bold tracking-[0.4em] uppercase text-[var(--color-brand)]"
                        style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                    >
                        
                    </h2>
                </div>

                <div className="relative">
                    <div
                        ref={scrollRef}
                        onScroll={checkScroll}
                        className="flex gap-8 md:gap-10 transform translate-x-[40px] md:translate-x-8 overflow-x-auto pb-12 snap-x snap-proximity md:snap-mandatory scrollbar-hide no-scrollbar touch-pan-y"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {journalItems.map((item, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: index * 0.1 }}
                                className="flex-none w-[80vw] md:w-[44vw] lg:w-[28vw] snap-start"
                            >
                                <Link href={item.link} className="group/item block">
                                    {/* Image Container */}
                                    <div className="relative h-[400px] md:h-[500px] lg:h-[550px] w-full overflow-hidden mb-6 rounded-xl bg-[var(--color-card-bg-warm)]">
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover transition-transform duration-[1.5s] ease-out group-hover/item:scale-105"
                                        />
                                    </div>

                                    {/* Content */}
                                    <div className="text-left">
                                        <h3
                                            className="text-xl md:text-2xl text-[var(--color-text)] mb-3 font-normal tracking-wide uppercase leading-tight"
                                            style={{ fontFamily: 'var(--font-playfair), serif' }}
                                        >
                                            {item.title.split(' in ').map((part, i) => (
                                                <React.Fragment key={i}>
                                                    {i === 1 && <span className="italic font-serif lowercase opacity-90 mx-1">in </span>}
                                                    {part}
                                                </React.Fragment>
                                            ))}
                                        </h3>

                                        <div className="inline-flex items-center gap-2 group/cta transition-all duration-300">
                                            <span
                                                className="text-[10px] lg:text-[11px] font-bold tracking-[0.25em] uppercase text-[var(--color-brand)] border-b border-[var(--color-border-warm)] pb-0.5"
                                                style={{ fontFamily: 'var(--font-outfit), sans-serif' }}
                                            >
                                                {item.cta}
                                            </span>
                                            <svg
                                                width="16"
                                                height="16"
                                                viewBox="0 0 24 24"
                                                fill="none"
                                                stroke="var(--color-brand)"
                                                strokeWidth="1.5"
                                                className="transition-transform duration-300 group-hover/item:translate-x-1.5"
                                            >
                                                <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>

                    {/* Navigation Arrows (Desktop) */}
                    <button
                        onClick={() => scroll('right')}
                        className={`absolute -right-4 top-[35%] z-20 w-12 h-12 rounded-full bg-[var(--color-card-bg)] shadow-md flex items-center justify-center transition-all duration-500 hover:bg-[var(--color-brand)] hover:text-[var(--color-text-on-brand)] group/btn hidden lg:flex ${!canScrollRight ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transition-transform duration-300 group-hover/btn:translate-x-1">
                            <path d="M5 12h14m-7-7l7 7-7 7" />
                        </svg>
                    </button>

                    <button
                        onClick={() => scroll('left')}
                        className={`absolute -left-4 top-[35%] z-20 w-12 h-12 rounded-full bg-[var(--color-card-bg)] shadow-md flex items-center justify-center transition-all duration-500 hover:bg-[var(--color-brand)] hover:text-[var(--color-text-on-brand)] group/btn hidden lg:flex ${!canScrollLeft ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="transition-transform duration-300 group-hover/btn:-translate-x-1">
                            <path d="M19 12H5m7-7l-7 7 7 7" />
                        </svg>
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </section>
    );
};

export default JournalCarousel;
