import React from 'react';
import Image from 'next/image';
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import VillaCard from "@/components/villas/VillaCard";
import VillaGrid from "@/components/villas/VillaGrid";
import { getProperties } from "@/lib/lodgify";

export const metadata = {
  title: "Villa Collection | Summerhouse Bali",
  description: "Explore our curated collection of luxury villas in Bali.",
};

export default async function VillasPage() {
  const properties = await getProperties();
  
  // Mapping data Lodgify
  const mappedVillas = Array.isArray(properties) ? properties.map((p: any) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    imageUrl: p.image_url,
    bedrooms: p.rooms_count || 2, 
    bathrooms: p.bathrooms_count || 2,
    location: p.location?.name || p.city || "Bali",
    isFeatured: p.is_featured || false
  })) : [];

  return (
    <div className="w-full bg-[#FAFAF9] min-h-[100dvh] flex flex-col items-center overflow-x-hidden">
      <Navbar />
      
      {/* ─── 1. HERO SECTION ─── */}
      <section className="w-full py-24 md:py-32 lg:py-48 flex flex-col items-center">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-end">
                {/* Title Block */}
                <div className="lg:col-span-7">
                    <span className="text-[11px] lg:text-[13px] font-bold tracking-[0.3em] uppercase text-[#1a1a19]/30 mb-8 block" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                        The Selection
                    </span>
                    <h1 className="text-[56px] md:text-[80px] lg:text-[120px] text-[#4d6a52] leading-[0.9] tracking-tight" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        The <br /> Collection
                    </h1>
                </div>

                {/* Subtext Block */}
                <div className="lg:col-span-5 pb-4">
                    <p className="text-[16px] lg:text-[18px] text-[#5a5651] leading-[1.8] font-light max-w-[420px]" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                        A curated selection of private sanctuaries, each designed with a deep respect for Balinese heritage and modern minimalist luxury.
                    </p>
                    <div className="w-[40px] h-[1px] bg-[#C7A58A] mt-8" />
                </div>
            </div>

            {/* Filter Links Block */}
            <div className="flex mt-16 md:mt-24 items-center">
                <div className="flex gap-10 text-[11px] font-bold tracking-[0.25em] uppercase text-[#1a1a19]">
                    <span className="border-b-2 border-[#C7A58A] pb-2 cursor-pointer">All Villas</span>
                    <span className="opacity-30 hover:opacity-100 transition-all cursor-pointer">Available Now</span>
                </div>
            </div>
        </div>
      </section>

      {/* ─── 2. THE VILLAS GRID SECTION ─── */}
      <section className="w-full py-20 md:py-24 lg:py-32">
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
            {mappedVillas.length > 0 ? (
                <VillaGrid villas={mappedVillas} />
            ) : (
                <div className="flex flex-col items-center justify-center py-32">
                    <p className="text-[24px] text-[#8F8A84] italic" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Preparing the collection...
                    </p>
                </div>
            )}
        </div>
      </section>

      {/* ─── 3. BOTTOM DECORATION ─── */}
      <section className="w-full py-20 md:py-32 flex flex-col items-center">
         <div className="w-[1px] h-[80px] bg-[#C7A58A]/30 mb-8" />
         <h3 className="text-[11px] tracking-[0.4em] font-bold text-[#C7A58A] uppercase">End of Collection</h3>
      </section>

      <Footer />
    </div>
  );
}
