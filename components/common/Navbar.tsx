"use client";

import React, { useState, useEffect } from 'react';
import { ShiftingDropDown } from './ShiftingDropDown';
import Link from 'next/link';
import { FiSearch } from 'react-icons/fi';

interface NavbarProps {
    alwaysSolid?: boolean;
}

const Navbar = ({ alwaysSolid = false }: NavbarProps) => {
    const [isVisible, setIsVisible] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const isSolid = isVisible || alwaysSolid;
    const isMobileNavSolid = isSolid || mobileOpen;

    const desktopItems = [
        { label: "Villas", href: "/villas" },
        { label: "Services", href: "/services" },
        { label: "About", href: "/about" },
        { label: "Contact", href: "/contact" },
    ];

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 50) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (mobileOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [mobileOpen]);

    return (
        <>
            {/* ═══════════════════════════════════════════════════════════
                MOBILE NAVBAR (< md)
            ═══════════════════════════════════════════════════════════ */}
            <nav
                className="lg:hidden absolute top-0 left-0 w-full z-110 flex items-center justify-between  px-10 md:px-24 h-[80px] transition-all duration-500"
                style={{
                    paddingTop: 'env(safe-area-inset-top)',
                    ...(isMobileNavSolid ? {
                        backgroundColor: 'rgba(252, 250, 247, 0.85)',
                        backdropFilter: 'saturate(180%) blur(20px)',
                        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
                        borderBottom: '0.5px solid rgba(0, 0, 0, 0.08)',
                    } : {}),
                }}
            >
                {/* Left: Hamburger / Close Animated Icon */}
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="flex flex-col justify-center translate-x-[10px] md:translate-x-[10px] items-start w-[32px] h-[32px] gap-[6px] focus:outline-none z-50 group transition-transform active:scale-90"
                    aria-label={mobileOpen ? "Close menu" : "Open menu"}
                >
                    <div
                        className={`h-[1.5px] transition-all duration-300 origin-left ${isMobileNavSolid ? 'bg-[#446B4A]' : 'bg-white'}`}
                        style={{ width: mobileOpen ? '28px' : '24px', transform: mobileOpen ? 'rotate(45deg) translateY(-1px)' : 'rotate(0)' }}
                    />
                    <div
                        className={`h-[1.5px] transition-all duration-300 ${isMobileNavSolid ? 'bg-[#446B4A]' : 'bg-white'}`}
                        style={{ width: mobileOpen ? '0px' : '24px', opacity: mobileOpen ? 0 : 1 }}
                    />
                    <div
                        className={`h-[1.5px] transition-all duration-300 origin-left ${isMobileNavSolid ? 'bg-[#446B4A]' : 'bg-white'}`}
                        style={{ width: mobileOpen ? '28px' : '24px', transform: mobileOpen ? 'rotate(-45deg) translateY(1px)' : 'rotate(0)' }}
                    />
                </button>
                {/* Center: Logo (Absolutely Centered — does NOT affect nav height) */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    <Link href="/" className="flex items-center pointer-events-auto" onClick={() => setMobileOpen(false)}>
                        <div
                            className="w-[180px] sm:w-[200px] h-[180px] transition-all duration-500"
                            style={{
                                backgroundColor: isMobileNavSolid ? '#446B4A' : '#ffffff',
                                WebkitMaskImage: 'url(/SUMMERHOUSE_LOGO_PROJECT_1.svg)',
                                WebkitMaskSize: 'contain',
                                WebkitMaskRepeat: 'no-repeat',
                                WebkitMaskPosition: 'center center',
                                maskImage: 'url(/SUMMERHOUSE_LOGO_PROJECT_1.svg)',
                                maskSize: 'contain',
                                maskRepeat: 'no-repeat',
                                maskPosition: 'center center',
                            }}
                            aria-label="Summerhouse Bali"
                        />
                    </Link>
                </div>

                {/* Right: Search Icon */}
                <div className="flex justify-end translate-x-[-20px] md:translate-x-[-10px] items-center w-[32px] h-[32px]">
                    <Link href="#book" onClick={() => setMobileOpen(false)} aria-label="Book Search" className="transition-transform active:scale-90">
                        <FiSearch
                            className={`w-[22px] h-[22px] transition-colors duration-500 ${isMobileNavSolid ? 'text-[#446B4A]' : 'text-white'}`}
                        />
                    </Link>
                </div>
            </nav >

            {/* ═══════════════════════════════════════════════════════════
                MOBILE FULLSCREEN MENU DRAWER
                Frosted Ivory Crystal glass, staggered links
            ═══════════════════════════════════════════════════════════ */}
            < div
                className={`lg:hidden fixed inset-0 z-100 flex flex-col items-center justify-center transition-all duration-700 ease-in-out
                    ${mobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
                `}
                style={{
                    backgroundColor: 'rgba(252, 250, 247, 0.95)',
                    backdropFilter: 'saturate(180%) blur(24px)',
                    WebkitBackdropFilter: 'saturate(180%) blur(24px)',
                }}
            >
                <div className="flex flex-col items-center justify-center gap-8 w-full px-6 text-center">
                    {desktopItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            onClick={() => setMobileOpen(false)}
                            className={`block text-[#446b4a] text-[36px] tracking-wide transition-all duration-700 ease-in-out
                                ${mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                            `}
                            style={{
                                fontFamily: "var(--font-playfair), serif",
                                transitionDelay: `${index * 75}ms`
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Minimal Footer */}
                <div
                    className={`absolute bottom-12 flex flex-col items-center transition-all duration-700 ease-in-out
                        ${mobileOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                    `}
                    style={{ transitionDelay: '350ms' }}
                >
                    <span
                        className="text-[10px] tracking-[0.2em] uppercase text-[#446b4a]/60 font-medium"
                        style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                    >
                        © 2026 SUMMERHOUSE BALI
                    </span>
                </div>
            </div >

            {/* ═══════════════════════════════════════════════════════════
                DESKTOP NAVBAR (≥ md) — FULL WIDTH BAR
            ═══════════════════════════════════════════════════════════ */}
            < nav
                className="hidden lg:flex fixed top-0 left-0 w-full z-100 transition-all duration-700 ease-in-out h-[80px] items-center"
                style={{
                    /* 
                       FROSTED IVORY CRYSTAL — Premium Navbar Glass
                       Saat di puncak: transparan murni (teks putih di atas Hero).
                       Saat scroll: kristal beku krem hangat dengan blur tinggi.
                    */
                    backgroundColor: isSolid
                        ? 'rgba(252, 250, 247, 0.78)'   /* Ivory hangat, bukan putih mentah */
                        : 'transparent',
                    backdropFilter: isSolid
                        ? 'saturate(80%) blur(4px)'    /* Blur kuat = kristal beku sejati */
                        : 'none',
                    WebkitBackdropFilter: isSolid
                        ? 'saturate(80%) blur(4px)'
                        : 'none',
                    borderBottom: isSolid
                        ? '0.5px solid rgba(0, 0, 0, 0.06)' /* Garis nyaris tak terlihat */
                        : '0.5px solid transparent',
                    boxShadow: isSolid
                        ? '0 1px 3px rgba(0, 0, 0, 0.03), 0 4px 12px rgba(0, 0, 0, 0.02)'  /* Bayangan super halus */
                        : 'none',
                    transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
            >
                <div className="w-full max-w-[1400px] mx-auto flex items-center justify-between px-6 md:px-12 lg:px-24">
                    {/* 1. LEFT PILLAR */}
                    <div className="flex-1 lg:flex-none lg:w-[280px] flex items-center justify-start">
                        <Link href="/" className="transform transition-transform hover:scale-105 active:scale-95">
                            <img
                                src="/SUMMERHOUSE_LOGO_PROJECT_1.svg"
                                alt="Summerhouse Bali"
                                className={`h-[44px] w-auto object-contain transition-all duration-700
                                    ${isSolid ? '' : 'brightness-0 invert opacity-90'}
                                `}
                            />
                        </Link>
                    </div>

                    {/* 2. CENTER PILLAR */}
                    <div className="hidden lg:flex flex-1 items-center justify-center gap-10">
                        {desktopItems.map((item, index) => {
                            if (item.label === "Villas") {
                                return <ShiftingDropDown key={index} scrolled={isSolid} />;
                            }
                            return (
                                <Link
                                    key={index}
                                    href={item.href}
                                    className={`text-[17px] font-normal tracking-wide transition-all duration-500 pb-1 border-b border-transparent
                                        ${isSolid ? 'hover:border-[#446b4a]/40' : 'hover:border-white/40'}
                                    `}
                                    style={{
                                        fontFamily: "var(--font-dm-sans), sans-serif",
                                        color: isSolid ? "#446B4A" : "#FFFFFF"
                                    }}
                                >
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>

                    {/* 3. RIGHT PILLAR */}
                    <div className="flex-1 lg:flex-none lg:w-[280px] flex items-center justify-end">
                        <Link
                            href="#book"
                            className={`group hidden md:flex items-center justify-center w-[170px] h-[48px] rounded-full transition-all duration-500
                                ${isSolid
                                    ? 'bg-[#446b4a] shadow-[0_4px_14px_0_rgba(68,107,74,0.39)] hover:shadow-[0_6px_20px_rgba(68,107,74,0.23)] hover:-translate-y-0.5'
                                    : 'bg-white/10 border border-white/20 backdrop-blur-md hover:bg-white/20'
                                }
                            `}
                        >
                            <span className="text-[14px] font-medium tracking-wider text-white group-hover:text-[#FAFAF9] transition-colors duration-300" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                                Book our Villas
                            </span>
                        </Link>
                    </div>
                </div>
            </nav >
        </>
    );
};

export default Navbar;
