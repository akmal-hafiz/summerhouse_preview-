"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function SmoothScrolling({ children }: { children: React.ReactNode }) {
    const [isMobile, setIsMobile] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        // Detect mobile based on width (more reliable than touch-only for smooth scroll preference)
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            
            // Clean up lenis class on mobile to prevent CSS conflicts
            if (mobile) {
                document.documentElement.classList.remove('lenis');
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Reset scroll on route change
    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "instant" });
    }, [pathname]);

    // MOBILE → native scroll for better performance and stability
    if (isMobile) {
        return <>{children}</>;
    }

    // DESKTOP → smooth scroll with ReactLenis
    return (
        <ReactLenis
            root
            options={{
                lerp: 0.07,
                duration: 0.8,
                smoothWheel: true,
                wheelMultiplier: 0.9,
                touchInertiaMultiplier: 0,
                syncTouch: false,
            }}
        >
            {children as any}
        </ReactLenis>
    );
}

export default SmoothScrolling;
