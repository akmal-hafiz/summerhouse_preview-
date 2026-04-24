import React from 'react';
import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import Image from "next/image";
import { getPropertyById, getPropertyImages } from "@/lib/lodgify";
import { notFound } from "next/navigation";

export default async function VillaDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const property = await getPropertyById(id);

    if (!property) {
        notFound();
    }

    // Extract all images from all rooms
    const allRoomImages = property.rooms?.flatMap((room: any) => room.images || []) || [];
    
    // Fallback if no room images, use the main image
    const rawImages = allRoomImages.length > 0 ? allRoomImages : [{ url: property.image_url }];

    const displayImages = rawImages.map((img: any) => ({
        ...img,
        url: img.url && img.url.startsWith('//') ? `https:${img.url}` : (img.url || "")
    })).filter((img: { url: string; }) => img.url);

    const mainImage = property.image_url && property.image_url.startsWith('//')
        ? `https:${property.image_url}`
        : property.image_url || "/homepage_villa/VillaZen.webp";

    return (
        <div className="w-full bg-[#FAFAF9] min-h-[100dvh] relative flex flex-col items-center overflow-x-hidden">
            <Navbar alwaysSolid={true} />

            <main className="w-full flex-1 pt-24 lg:pt-32">
                {/* ─── 1. HERO SECTION ─── */}
                <section className="w-full pt-20 md:pt-24 lg:pt-32 pb-10 md:pb-12 lg:pb-16">
                    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
                        <div className="w-full aspect-[16/9] lg:h-[700px] relative rounded-[32px] overflow-hidden shadow-2xl group">
                            <Image 
                                src={mainImage}
                                alt={property.name || "Villa"}
                                fill
                                unoptimized={true}
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* View More Button on Image */}
                            <button className="absolute bottom-8 right-8 bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full text-[11px] font-bold tracking-widest uppercase flex items-center gap-3 hover:bg-white/30 transition-all z-20 shadow-lg">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                                VIEW MORE PICTURES
                            </button>
                        </div>

                        {/* ─── 2. TAB NAVIGATION ─── */}
                        <div className="flex justify-center border-b border-gray-100 mt-16 overflow-x-auto no-scrollbar">
                            <div className="flex gap-10 lg:gap-16 text-[11px] font-bold text-gray-400 uppercase tracking-[0.2em] pb-6 whitespace-nowrap">
                                <span className="text-[#446B4A] border-b-2 border-[#446B4A] pb-6 cursor-pointer">Description</span>
                                <span className="hover:text-[#446B4A] transition-colors cursor-pointer">Pictures</span>
                                <span className="hover:text-[#446B4A] transition-colors cursor-pointer">Amenities</span>
                                <span className="hover:text-[#446B4A] transition-colors cursor-pointer">Location</span>
                                <span className="hover:text-[#446B4A] transition-colors cursor-pointer">Rates</span>
                                <span className="hover:text-[#446B4A] transition-colors cursor-pointer">Availability</span>
                                <span className="hover:text-[#446B4A] transition-colors cursor-pointer">Reviews</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ─── 3. CONTENT AREA ─── */}
                <section className="w-full py-20 md:py-24 lg:py-32">
                    <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
                        <div className="max-w-[900px]">
                            <span className="text-[12px] font-bold text-[#446B4A] uppercase tracking-[0.2em] mb-4 block">Private Vacation Home</span>
                            <h1 className="text-[48px] lg:text-[72px] text-[#1a1a19] font-medium leading-[1.1] mb-12" style={{ fontFamily: 'var(--font-playfair), serif' }}>
                                {property.name}
                            </h1>

                            {/* Quick Icons */}
                            <div className="flex flex-wrap gap-8 md:gap-12 mb-16 py-8 border-y border-gray-100">
                                <div className="flex items-center gap-4 text-[15px] text-[#65635e] font-light">
                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                    </div>
                                    {property.max_guests || 4} Guests
                                </div>
                                <div className="flex items-center gap-4 text-[15px] text-[#65635e] font-light">
                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M9 22V12h6v10M2 12h20"/></svg>
                                    </div>
                                    {property.bathrooms || 1} Bathroom
                                </div>
                            </div>

                            {/* Description Text */}
                            <div 
                                className="text-lg lg:text-xl text-[#65635e] font-light leading-[1.8] mb-16 villa-description"
                                dangerouslySetInnerHTML={{ __html: property.description || "" }}
                            />

                            {/* Amenities Highlights */}
                            <div className="flex flex-wrap gap-4 mb-24">
                                 <div className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-100 rounded-full text-[13px] text-[#1a1a19] shadow-sm font-medium">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="2"/></svg>
                                    High-Speed Fiber Wifi
                                 </div>
                                 <div className="flex items-center gap-3 px-8 py-4 bg-white border border-gray-100 rounded-full text-[13px] text-[#1a1a19] shadow-sm font-medium">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                                    Daily Breakfast Included
                                 </div>
                            </div>

                            {/* Pictures Grid */}
                            <div className="mb-24">
                                <div className="flex items-end justify-between mb-12">
                                    <h2 className="text-[32px] font-medium" style={{ fontFamily: 'var(--font-playfair), serif' }}>Gallery</h2>
                                    <span className="text-[12px] text-[#446B4A] font-bold uppercase tracking-widest cursor-pointer border-b border-[#446B4A]/20 pb-1 hover:border-[#446B4A] transition-all">Explore all pictures</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {displayImages.slice(0, 6).map((img: {url: string}, idx: number) => (
                                        <div key={idx} className="relative aspect-[4/3] rounded-[24px] overflow-hidden shadow-lg">
                                            <Image 
                                                src={img.url}
                                                alt={`Gallery ${idx}`}
                                                fill
                                                unoptimized={true}
                                                className="object-cover hover:scale-105 transition-transform duration-700"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* ─── 4. STICKY BOOKING FOOTER ─── */}
            <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-100 z-[100] py-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                        {/* Left: Info */}
                        <div className="flex flex-col">
                            <span className="text-xl font-medium text-[#1a1a19]" style={{ fontFamily: 'var(--font-playfair), serif' }}>{property.name}</span>
                            <div className="flex items-center gap-2 text-[13px] text-[#65635e] mt-1 font-light">
                                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                                 {property.city}, Bali • from <span className="font-bold text-[#1a1a19] ml-1">Rp{property.min_price || '4,395,000'}</span> per night
                            </div>
                        </div>

                        {/* Right: Form */}
                        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
                            <div className="flex border border-gray-100 rounded-full overflow-hidden h-14 w-full lg:w-auto bg-gray-50/50">
                                <div className="px-8 border-r border-gray-100 flex flex-col justify-center min-w-[150px]">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Check-in</span>
                                    <span className="text-[13px] text-[#1a1a19] font-medium">Add dates</span>
                                </div>
                                <div className="px-8 flex flex-col justify-center min-w-[150px]">
                                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Check-out</span>
                                    <span className="text-[13px] text-[#1a1a19] font-medium">Add dates</span>
                                </div>
                            </div>
                            <div className="border border-gray-100 rounded-full px-8 h-14 flex flex-col justify-center min-w-[160px] w-full lg:w-auto bg-gray-50/50">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Guests</span>
                                <span className="text-[13px] text-[#1a1a19] font-medium">1 adult</span>
                            </div>
                            <button className="bg-[#1a1a19] text-white px-12 h-14 rounded-full font-bold text-[14px] tracking-wider uppercase hover:bg-black transition-all shadow-xl hover:-translate-y-0.5 w-full lg:w-auto">
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
