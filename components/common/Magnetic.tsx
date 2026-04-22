"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Magnetic({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: MouseEvent) => {
        const { clientX, clientY } = e;
        const boundingContent = ref.current?.getBoundingClientRect();
        if (boundingContent) {
            const { width, height, left, top } = boundingContent;
            const x = clientX - (left + width / 2);
            const y = clientY - (top + height / 2);
            setPosition({ x: x * 0.35, y: y * 0.35 });
        }
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove as any}
            onMouseLeave={handleMouseLeave}
            animate={{ x: position.x, y: position.y }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        >
            {children}
        </motion.div>
    );
}
