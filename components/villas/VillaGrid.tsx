"use client";

import React, { useState } from 'react';
import VillaCard from './VillaCard';
import { motion, AnimatePresence } from 'framer-motion';

interface VillaGridProps {
    villas: any[];
}

const VillaGrid = ({ villas }: VillaGridProps) => {
    const [visibleCount, setVisibleCount] = useState(6);
    
    const hasMore = visibleCount < villas.length;
    const visibleVillas = villas.slice(0, visibleCount);

    const loadMore = () => {
        setVisibleCount(prev => prev + 6);
    };

    return (
        <div className="w-full flex flex-col items-center">
            {/* The Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 lg:gap-x-16 gap-y-24 lg:gap-y-32 w-full">
                <AnimatePresence mode="popLayout">
                    {visibleVillas.map((villa, index) => {
                        let offsetClass = "";
                        let cardHeight = 500;

                        // Layout Logic (Editorial Asymmetrical) using PT for vertical to fix flow
                        // Removing left/right offsets to ensure stability on mobile and tablet
                        if (index % 3 === 0) {
                            offsetClass = "lg:pt-20"; 
                            cardHeight = 500;
                        } else if (index % 3 === 1) {
                            offsetClass = "lg:pt-48";
                            cardHeight = 400;
                        } else {
                            offsetClass = "lg:pt-0";
                            cardHeight = 500;
                        }

                        return (
                            <motion.div 
                                key={villa.id} 
                                className={`${offsetClass}`}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: (index % 6) * 0.1 }}
                            >
                                <VillaCard 
                                    property={{
                                        ...villa,
                                        price: "Contact for Pricing"
                                    }} 
                                    variant="desktop" 
                                    height={cardHeight}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Load More Button */}
            {hasMore && (
                <div className="py-24 md:py-32 flex flex-col items-center group cursor-pointer" onClick={loadMore}>
                    <motion.div 
                        className="w-[100px] h-[100px] rounded-full border border-[var(--color-border-moss)] flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:border-[var(--color-brand)]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] tracking-[0.3em] font-bold text-[var(--color-brand)] uppercase mb-1">More</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--color-brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </div>
                    </motion.div>
                    <span className="text-[11px] tracking-[0.4em] font-bold text-[var(--color-text-soft)] uppercase mt-6 transition-all duration-500 group-hover:text-[var(--color-brand)]">
                        Explore More Escapes
                    </span>
                </div>
            )}
        </div>
    );
};

export default VillaGrid;
