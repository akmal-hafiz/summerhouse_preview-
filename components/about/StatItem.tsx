import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

interface StatItemProps {
    value: number;
    suffix?: string;
    label: string;
    delay?: number;
    decimals?: number;
    variant?: 'soft' | 'strong';
}

export const StatItem = ({ value, suffix = "", label, delay = 0, decimals = 0, variant = 'soft' }: StatItemProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!isInView) return;

        let startTimestamp: number;
        const duration = 1800; // 1.8s

        const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            
            // easeOut cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            
            setCount(easeOut * value);

            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                setCount(value);
            }
        };

        const timeout = setTimeout(() => {
            window.requestAnimationFrame(step);
        }, delay * 1000);

        return () => clearTimeout(timeout);
    }, [isInView, value, delay]);

    const formattedCount = decimals > 0 
        ? count.toFixed(decimals) 
        : Math.floor(count).toString();

    return (
        <motion.div 
            ref={ref}
            initial={{ opacity: 0, y: 20, filter: 'blur(4px)' }}
            animate={isInView ? { opacity: 1, y: 0, filter: 'blur(0px)' } : {}}
            transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
            className={`group flex flex-col items-center justify-center text-center transition-all duration-500 ${variant === 'strong' ? 'hover:scale-[1.03]' : 'hover:-translate-y-1'}`}
        >
            <div className="relative flex flex-col items-center">
                <span 
                    className={`relative z-10 text-[56px] lg:text-[64px] tracking-tight transition-all duration-500 ${variant === 'strong' ? 'font-bold text-[var(--color-text)] group-hover:text-[var(--color-brand)]' : 'font-semibold text-[var(--color-text)] group-hover:text-[var(--color-brand)]'}`} 
                    style={{ 
                        fontFamily: 'var(--font-sans), sans-serif',
                        textShadow: '0 4px 16px rgba(0,0,0,0)'
                    }}
                >
                    {formattedCount}{suffix}
                </span>
                {/* Subtle Glow Effect on Hover */}
                <div className={`absolute inset-0 z-0 scale-110 rounded-full transition-all duration-700 group-hover:scale-150 group-hover:opacity-10 ${variant === 'strong' ? 'bg-[var(--color-brand)] opacity-0 blur-[32px]' : 'bg-[var(--color-brand)] opacity-0 blur-[24px]'}`} />
            </div>
            
            {/* Hairline Divider */}
            <div className={`mt-3 mb-4 h-px transition-all duration-500 ${variant === 'strong' ? 'w-12 bg-[var(--color-border-strong)] group-hover:w-16 group-hover:bg-[var(--color-border-moss)]' : 'w-6 bg-[var(--color-border)] group-hover:w-10 group-hover:bg-[var(--color-border-strong)]'}`} />
            
            <span 
                className={`uppercase tracking-[0.2em] font-medium transition-colors duration-500 ${variant === 'strong' ? 'text-[11px] lg:text-xs text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]' : 'text-[10px] text-[var(--color-text-soft)] group-hover:text-[var(--color-text-muted)]'}`} 
                style={{ fontFamily: 'var(--font-sans), sans-serif' }}
            >
                {label}
            </span>
        </motion.div>
    );
};
