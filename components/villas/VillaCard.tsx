"use client";

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

interface VillaCardProps {
    property: {
        id: number | string;
        name: string;
        description?: string;
        imageUrl: string;
        bedrooms: number | string;
        bathrooms: number | string;
        location: string;
        price?: string | number;
        isFeatured?: boolean;
    };
    variant?: 'desktop' | 'mobile';
    height?: string | number;
}

const VillaCard = ({ property, variant = 'desktop', height }: VillaCardProps) => {
    if (variant === 'mobile') {
        const externalUrl = `/villas/${property.id}`;
        return (
            <a href={externalUrl} className="flex flex-col w-[85vw] h-[600px] snap-center shrink-0 pb-27 lg:pb-0">
                <div className="w-full aspect-[4/4.8] relative rounded-[12px] overflow-hidden bg-[var(--color-card-bg-warm)]">
                    <Image 
                        src={property.imageUrl || "/homepage_villa/VillaZen.webp"} 
                        alt={property.name} 
                        fill 
                        className="object-cover" 
                    />
                </div>
                <h3 className="text-[24px] text-[var(--color-text)] relative bottom-[-6px] lg:bottom-[-0px] mt-6" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    {property.name}
                </h3>
                <p className="text-[13px] leading-[1.6] relative bottom-[-10px] lg:bottom-[-0px] font-light text-[var(--color-text-muted)] mt-3 mb-6 line-clamp-2" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                    {property.description || "A sanctuary of light and air, featuring expansive terraces that blur the line between indoor luxury and coastal wildness."}
                </p>
                <div className="flex gap-5 relative bottom-[-18px] lg:mt-0 text-[10px] tracking-[0.05em] font-medium text-[var(--color-text-soft)] uppercase">
                    <span className="flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-sage)" strokeWidth="2"><path d="M3 7v13M21 7v13M3 12h18M5 7h14c1.1 0 2 .9 2 2v3H3V9c0-1.1.9-2 2-2z" /></svg>
                        {property.bedrooms} BEDROOMS
                    </span>
                    <span className="flex items-center gap-2">
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-sage)" strokeWidth="2"><path d="M4 14v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5M8 6h8M12 6V3" /></svg>
                        {property.bathrooms} BATHS
                    </span>
                </div>
            </a>
        );
    }

    const slugify = (text: string) => {
        return text
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    };

    const externalUrl = `/villas/${property.id}`;

    // Default Desktop Version
    return (
        <a href={externalUrl} target="_blank" rel="noopener noreferrer" className="flex flex-col group cursor-pointer relative">
            <div 
                className="w-full rounded-[12px] bg-[var(--color-card-bg-warm)] relative flex items-center justify-center overflow-hidden"
                style={{ height: height || '500px' }}
            >
                <Image 
                    src={property.imageUrl || "/homepage_villa/VillaZen.webp"} 
                    alt={property.name} 
                    fill 
                    className="object-cover transition-transform duration-700 group-hover:scale-105" 
                />
                {property.isFeatured && (
                    <span className="absolute top-4 left-[0px] z-10 bg-[var(--color-badge-featured-bg)] text-[var(--color-badge-featured-text)] text-[9px] font-bold min-w-[90px] h-[26px] flex items-center justify-center tracking-[0.2em] uppercase">
                        Featured
                    </span>
                )}
            </div>
            <h3 className="text-[28px] relative bottom-[-10px] text-[var(--color-text)] mt-10 group-hover:text-[var(--color-brand)] transition-colors duration-300" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                {property.name}
            </h3>
            <p className="text-[10px] relative bottom-[-10px] tracking-[0.15em] font-medium text-[var(--color-text-soft)] uppercase mt-3">
                {property.bedrooms} Beds • {property.bathrooms} Baths • {property.location}
            </p>
        </a>
    );
};

export default VillaCard;
