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
        <section className="w-full flex flex-col items-center z-10 py-24 lg:py-48">

            {/* 1. MEDIA CONTAINER — Edge-to-Edge on Mobile, Contained Cinematic on Desktop */}
            <div className="w-full max-w-[1600px] md:px-8 lg:px-12">
                <div className="relative w-full aspect-video md:aspect-21/9 overflow-hidden rounded-none md:rounded-2xl shadow-none md:shadow-2xl">
                    <video
                        ref={videoRef}
                        className="w-full h-full object-cover scale-[1.02]"
                        autoPlay
                        loop
                        muted
                        playsInline
                        poster="https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=2000&auto=format&fit=crop"
                    >
                        <source src="/video1.mp4" type="video/mp4" />
                    </video>
                </div>
            </div>

            {/* 2. TEXT CONTENT — Well Spaced and Fully Responsive */}
            <div className="flex flex-col md:flex-row gap-8 md:gap-16 lg:gap-24 w-full max-w-[1200px] px-6 md:px-16 mt-12 md:mt-24">

                {/* Left Column - Subtitle */}
                <div className="md:w-[35%] shrink-0 relative lg:right-[11%] top-4 flex items-start">
                    {/* Small aesthetic dash for premium look (hidden on small mobile) */}
                    <div className="w-6 lg:w-10 h-px bg-black/30 mt-3 mr-4 hidden sm:block"></div>
                    <h3
                        className="text-[#1a1a1a] text-[11px] md:text-[12px] font-bold uppercase tracking-[0.2em] leading-[1.8]"
                        style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                    >
                        Enhanced by smart <br className="hidden md:block" />
                        home integration
                    </h3>
                </div>

                {/* Right Column - Description */}
                <div className="md:w-[54%] relative lg:left-[11%] text-justify">
                    <p
                        className="text-[#65635e] text-[8px] md:text-[8px] lg:text-[11px] font-bold relative md:top-[11%] leading-[1.8]"
                        style={{ fontFamily: "var(--font-dm-sans), sans-serif justify-end" }}
                    >
                        Each residence is a showcase of craftsmanship, blending marble, oak, and contemporary fixtures into an
                        atmosphere of refined elegance. From open-plan layouts to custom detailing, the design philosophy
                        ensures every corner feels sophisticated yet functional, creating a living experience that is as
                        effortless as it is beautiful.
                    </p>
                </div>
            </div>
        </section>
    );
};

export default VideoSection;
