"use client";

import { ReactLenis } from "@studio-freight/react-lenis";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

function SmoothScrolling({ children }: { children: React.ReactNode }) {
    const [isMobile, setIsMobile] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        // Strict mobile detection via width
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        // Remove lenis class if mobile
        if (window.innerWidth < 768) {
            document.documentElement.classList.remove('lenis');
        }

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // RESET SCROLL ON ROUTE CHANGE (PENTING!)
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    // Jika Mobile: Kembalikan Native Scroll Tanpa Pembungkus Lenis
    if (isMobile) {
        return <>{children}</>;
    }

    // Jika Desktop: Gunakan Lenis
    return (
        <ReactLenis 
            root 
            options={{ 
                lerp: 0.1, 
                duration: 1.2, 
                smoothWheel: true, 
                wheelMultiplier: 1,
                touchInertiaMultiplier: 0,
                syncTouch: false,
            }}
        >
            {children as any}
        </ReactLenis>
    );
}

export default SmoothScrolling;
