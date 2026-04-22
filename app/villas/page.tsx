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
    <div className="w-full bg-[#FAFAF9] min-h-screen relative flex flex-col items-center overflow-x-hidden">
      <Navbar />
      
      {/* ─── 1. HERO SECTION (DNA: Playfair Staggered) ─── */}
      <section className="w-full h-[80vh] lg:h-[100vh] relative flex flex-col items-center">
        <div className="w-full max-w-[1400px] h-full px-6 lg:px-12 relative flex flex-col justify-center">
            {/* Title Block */}
            <div className="relative left-[-10px] lg:left-[50px] z-10">
                <span className="text-[10px] lg:text-[13px] font-bold tracking-[0.3em] uppercase text-[#1a1a19]/30 mb-8 block" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    The Selection
                </span>
                <h1 className="text-[62px] lg:text-[140px] text-[#4d6a52] leading-[0.85] tracking-tight mb-12" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                    The <br /> Collection
                </h1>
            </div>

            {/* Subtext Block */}
            <div className="relative mt-10 lg:mt-0 lg:absolute lg:top-[45%] lg:right-[150px] max-w-[450px] z-10">
                <p className="text-[14px] lg:text-[17px] text-[#5a5651] leading-[1.8] font-light" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                    A curated selection of private sanctuaries, each designed with a deep respect for Balinese heritage and modern minimalist luxury.
                </p>
                <div className="w-[40px] h-[1px] bg-[#C7A58A] mt-8" />
            </div>

            {/* Filter Links Block */}
            <div className="flex mt-16 lg:mt-0 lg:absolute lg:bottom-[10%] lg:right-[100px] gap-10 items-center z-10">
                <div className="flex gap-10 text-[11px] font-bold tracking-[0.25em] uppercase text-[#1a1a19]">
                    <span className="border-b-2 border-[#C7A58A] pb-2 cursor-pointer">All Villas</span>
                    <span className="opacity-30 hover:opacity-100 transition-all cursor-pointer">Available Now</span>
                </div>
            </div>
        </div>
      </section>

      {/* ─── 2. THE VILLAS GRID SECTION (DNA: VillaCollection Asymmetrical) ─── */}
      <section className="w-full relative pb-[300px]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative lg:right-[-137px]">
            {mappedVillas.length > 0 ? (
                <VillaGrid villas={mappedVillas} />
            ) : (
                <div className="flex flex-col items-center justify-center pt-60">
                    <p className="text-[24px] text-[#8F8A84] italic" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                        Preparing the collection...
                    </p>
                </div>
            )}
        </div>
      </section>

      {/* ─── 3. BOTTOM DECORATION ─── */}
      <section className="w-full py-60 flex flex-col items-center">
         <div className="w-[1px] h-[100px] bg-[#C7A58A]/30 mb-10" />
         <h3 className="text-[11px] tracking-[0.4em] font-bold text-[#C7A58A] uppercase">End of Collection</h3>
      </section>

      <Footer />
    </div>
  );
}
