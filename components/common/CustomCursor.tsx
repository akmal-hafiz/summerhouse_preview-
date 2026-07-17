"use client";

import React, { useEffect, useState } from 'react';
import { motion, useSpring } from 'framer-motion';

export default function CustomCursor() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    const springConfig = { stiffness: 300, damping: 30, mass: 0.5 };
    const x = useSpring(0, springConfig);
    const y = useSpring(0, springConfig);

    useEffect(() => {
        const mouseMove = (e: MouseEvent) => {
            x.set(e.clientX);
            y.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const mouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.tagName === 'BUTTON' || 
                target.tagName === 'A' || 
                target.closest('button') || 
                target.closest('a') ||
                target.classList.contains('cursor-pointer')
            ) {
                setIsHovered(true);
            } else {
                setIsHovered(false);
            }
        };

        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseover", mouseOver);

        return () => {
            window.removeEventListener("mousemove", mouseMove);
            window.removeEventListener("mouseover", mouseOver);
        };
    }, [isVisible, x, y]);

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#446B4A] pointer-events-none z-[9999] hidden lg:block"
            style={{
                x,
                y,
                translateX: "-50%",
                translateY: "-50%",
            }}
            animate={{
                scale: isHovered ? 2 : 1,
                backgroundColor: isHovered ? "rgba(68, 107, 74, 0.1)" : "rgba(68, 107, 74, 0)",
            }}
            transition={{ type: "spring", stiffness: 250, damping: 20 }}
        />
    );
}
