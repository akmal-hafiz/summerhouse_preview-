"use client";
import React, { useRef, useEffect } from 'react';

const VideoSection = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const isScrollingRef = useRef(false);

    useEffect(() => {
        let scrollTimeout: NodeJS.Timeout;
        let animationFrameId: number;
        let currentRate = 0.2; // Base idle speed (super slow-motion)

        const updatePlaybackRate = () => {
            if (!videoRef.current) return;

            // Target rate: 1.5 (fast) if scrolling, 0.2 (extremely slow) if stopped
            const targetRate = isScrollingRef.current ? 1.5 : 0.2;

            // Easing formula adjusted for faster reaction
            currentRate += (targetRate - currentRate) * 0.15;

            videoRef.current.playbackRate = currentRate;
            animationFrameId = requestAnimationFrame(updatePlaybackRate);
        };

        // Start animation loop
        animationFrameId = requestAnimationFrame(updatePlaybackRate);

        const handleScroll = () => {
            isScrollingRef.current = true;
            clearTimeout(scrollTimeout);

            // Detect when user STOPS scrolling (150ms tolerance)
            scrollTimeout = setTimeout(() => {
                isScrollingRef.current = false;
            }, 150);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(scrollTimeout);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <section className="w-full bg-[var(--color-page)] py-20 md:py-24 lg:py-32 flex flex-col items-center">

            {/* 1. MEDIA CONTAINER — Edge-to-Edge on Mobile, Contained Cinematic on Desktop */}
            <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
                <div className="relative w-full aspect-video md:aspect-[21/9] overflow-hidden rounded-none md:rounded-2xl shadow-none md:shadow-2xl">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover scale-[1.02]"
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="/homepage_villa/curated-1-main.webp"
                    >
                        <source src="/video1.mp4" type="video/mp4" />
                    </video>
                </div>
            </div>

            {/* 2. TEXT CONTENT — Well Spaced and Fully Responsive */}
            <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 mt-12 md:mt-24">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16">
                    
                    {/* Left Column - Subtitle */}
                    <div className="md:col-span-4 flex items-start">
                        <div className="w-6 lg:w-10 h-px bg-[var(--color-border-strong)] mt-3 mr-4 hidden sm:block"></div>
                        <h3
                            className="text-[var(--color-text)] text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] leading-[1.8]"
                            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                        >
                            Enhanced by smart <br className="hidden md:block" />
                            home integration
                        </h3>
                    </div>

                    {/* Right Column - Description */}
                    <div className="md:col-span-7 md:col-start-6">
                        <p
                            className="text-[var(--color-text-muted)] text-[15px] md:text-[17px] lg:text-[19px] leading-[1.8] font-light"
                            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                        >
                            Each residence is a showcase of craftsmanship, blending marble, oak, and contemporary fixtures into an
                            atmosphere of refined elegance. From open-plan layouts to custom detailing, the design philosophy
                            ensures every corner feels sophisticated yet functional, creating a living experience that is as
                            effortless as it is beautiful.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default VideoSection;
