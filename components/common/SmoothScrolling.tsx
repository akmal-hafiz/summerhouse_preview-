"use client";

import { ReactLenis } from "@studio-freight/react-lenis";

function SmoothScrolling({ children }: { children: React.ReactNode }) {
    const Lenis = ReactLenis as any;

    return (
        <Lenis root options={{ 
            lerp: 0.05, 
            duration: 1.8, 
            smoothWheel: true,
            wheelMultiplier: 0.8 
        }}>
            {children}
        </Lenis>
    );
}

export default SmoothScrolling;
