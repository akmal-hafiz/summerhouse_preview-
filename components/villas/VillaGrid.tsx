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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-[50px] gap-y-[120px] lg:gap-y-[220px] w-full">
                <AnimatePresence mode="popLayout">
                    {visibleVillas.map((villa, index) => {
                        let offsetClass = "";
                        let cardHeight = 500;

                        // Layout Logic (Editorial Asymmetrical) using PT for vertical to fix flow
                        if (index % 3 === 0) {
                            offsetClass = "lg:pt-[100px] lg:relative lg:left-[-40px]"; 
                            cardHeight = 500;
                        } else if (index % 3 === 1) {
                            offsetClass = "lg:pt-[300px]";
                            cardHeight = 400;
                        } else {
                            offsetClass = "lg:pt-[0px] lg:relative lg:right-[-40px]";
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

            {/* Load More Button (DNA: Circular Green Style from Screenshot) */}
            {hasMore && (
                <div className="mt-[450px] mb-[150px] flex flex-col items-center group cursor-pointer" onClick={loadMore}>
                    <motion.div 
                        className="w-[100px] h-[100px] rounded-full border border-[#4d6a52]/40 flex items-center justify-center relative overflow-hidden transition-all duration-500 group-hover:border-[#4d6a52]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        {/* Subtle arrow or plus icon */}
                        <div className="flex flex-col items-center">
                            <span className="text-[10px] tracking-[0.3em] font-bold text-[#4d6a52] uppercase mb-1">More</span>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4d6a52" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 5v14M5 12h14" />
                            </svg>
                        </div>
                    </motion.div>
                    <span className="text-[11px] tracking-[0.4em] font-bold text-[#4d6a52]/50 uppercase mt-6 transition-all duration-500 group-hover:text-[#4d6a52]">
                        Explore More Escapes
                    </span>
                </div>
            )}
        </div>
    );
};

export default VillaGrid;
