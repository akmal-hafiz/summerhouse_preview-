"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { FiChevronDown, FiHome } from "react-icons/fi";
import { AnimatePresence, motion } from "framer-motion";

interface ShiftingDropDownProps {
    scrolled?: boolean;
}

export const ShiftingDropDown = ({ scrolled }: ShiftingDropDownProps) => {
    return (
        <div className="flex h-full items-center justify-center">
            <Tabs scrolled={scrolled} />
        </div>
    );
};

const Tabs = ({ scrolled }: { scrolled?: boolean }) => {
    const [selected, setSelected] = useState<number | null>(null);
    const [dir, setDir] = useState<"l" | "r" | null>(null);

    const handleSetSelected = (val: number | null) => {
        if (typeof selected === "number" && typeof val === "number") {
            setDir(selected > val ? "r" : "l");
        } else if (val === null) {
            setDir(null);
        }

        setSelected(val);
    };

    return (
        <div
            onMouseLeave={() => handleSetSelected(null)}
            className="relative flex h-fit gap-2"
        >
            <Tab
                selected={selected}
                handleSetSelected={handleSetSelected}
                tab={1}
                scrolled={scrolled}
            >
                Villas
            </Tab>

            <AnimatePresence>
                {selected && <Content dir={dir} selected={selected} scrolled={scrolled} />}
            </AnimatePresence>
        </div>
    );
};

const Tab = ({ children, tab, handleSetSelected, selected, scrolled }: any) => {
    return (
        <button
            id={`shift-tab-${tab}`}
            onMouseEnter={() => handleSetSelected(tab)}
            onClick={() => handleSetSelected(tab)}
            className={`flex items-center gap-1.5 text-[17px] font-normal tracking-wide transition-all duration-500 pb-1 cursor-pointer border-b border-transparent ${scrolled ? "text-[#446b4a] hover:opacity-70" : "text-white hover:opacity-80"
                } ${selected === tab ? "opacity-100" : ""}`}
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
            <span>{children}</span>
            <FiChevronDown
                className={`transition-transform duration-300 transform ${selected === tab ? "rotate-180" : ""
                    }`}
            />
        </button>
    );
};

const Content = ({ selected, dir, scrolled }: any) => {
    return (
        <motion.div
            id="overlay-content"
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            className={`absolute left-1/2 -translate-x-1/2 top-[calc(100%+12px)] w-64 rounded-2xl border shadow-2xl backdrop-blur-2xl z-50 transition-all duration-500 ${scrolled
                ? "bg-[#fcfaf7]/85 border-[#446b4a]/10"
                : "bg-[#0f0f0f]/[0.55] border-white/20"
                }`}
        >
            <Bridge />
            <Nub selected={selected} scrolled={scrolled} />

            <div className="overflow-hidden p-3">
                {selected === 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                        <VillasContent scrolled={scrolled} />
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

const Bridge = () => (
    <div className="absolute -top-[24px] left-0 right-0 h-[24px]" />
);

const Nub = ({ selected, scrolled }: any) => {
    const [left, setLeft] = useState(0);

    useEffect(() => {
        moveNub();
    }, [selected]);

    const moveNub = () => {
        if (selected) {
            const hoveredTab = document.getElementById(`shift-tab-${selected}`);
            const overlayContent = document.getElementById("overlay-content");

            if (!hoveredTab || !overlayContent) return;

            const tabRect = hoveredTab.getBoundingClientRect();
            const { left: contentLeft } = overlayContent.getBoundingClientRect();

            const tabCenter = tabRect.left + tabRect.width / 2 - contentLeft;

            setLeft(tabCenter);
        }
    };

    return (
        <motion.span
            style={{
                clipPath: "polygon(0 0, 100% 0, 50% 50%, 0% 100%)",
            }}
            animate={{ left }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-t border-l transition-colors duration-500 ${scrolled ? "bg-[#fcfaf7] border-[#446b4a]/10" : "bg-[#0f0f0f] border-white/20"
                }`}
        />
    );
};

const VillasContent = ({ scrolled }: any) => {
    return (
        <div className="flex flex-col gap-1">
            <Link href="/villas" className={`flex items-center gap-3 p-2 rounded-xl transition-all duration-300 group ${scrolled ? "hover:bg-[#446b4a]/5" : "hover:bg-white/5"
                }`}>
                <div className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${scrolled
                    ? "bg-[#446b4a]/5 border-[#446b4a]/10 group-hover:bg-[#446b4a]"
                    : "bg-white/5 border-white/5 group-hover:bg-white/10"
                    }`}>
                    <FiHome className={`transition-colors ${scrolled
                        ? "text-[#446b4a] group-hover:text-white"
                        : "text-white/70 group-hover:text-white"
                        }`} />
                </div>
                <div>
                    <h4 className={`text-sm font-medium transition-colors ${scrolled ? "text-[#446b4a]" : "text-white/90"
                        }`}>Villa Collection</h4>
                    <p className={`text-xs transition-colors ${scrolled ? "text-[#446b4a]/60" : "text-white/50"
                        }`}>Explore our curated escapes</p>
                </div>
            </Link>
        </div>
    );
};

export default ShiftingDropDown;
