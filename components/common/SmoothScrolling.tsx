"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { useEffect } from "react";

function SmoothScrolling({ children }: { children: React.ReactNode }) {
    const Lenis = ReactLenis as any;

    useEffect(() => {
        // Ensure any lingering lenis instance is disabled on mobile
        const isMobile = window.matchMedia('(pointer: coarse)').matches;
        if (isMobile) {
            document.documentElement.classList.remove('lenis');
        }
    }, []);

    return (
        <Lenis 
            root 
            options={{ 
                lerp: 0.1, 
                duration: 1.2, 
                smoothWheel: true,
                wheelMultiplier: 1,
                touchInertiaMultiplier: 0,
                syncTouch: false,
                enabled: typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches
            }}
        >
            {children}
        </Lenis>
    );
}

export default SmoothScrolling;
