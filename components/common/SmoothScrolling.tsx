"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

function SmoothScrolling({ children }: { children: React.ReactNode }) {
    const Lenis = ReactLenis as any;

    return (
        <Lenis root options={{ 
            lerp: 0.1, 
            duration: 1.2, 
            smoothWheel: true,
            wheelMultiplier: 1,
            touchInertiaMultiplier: 0,
            syncTouch: false,
            enabled: typeof window !== 'undefined' && !window.matchMedia('(pointer: coarse)').matches
        }}>
            {children}
        </Lenis>
    );
}

export default SmoothScrolling;
