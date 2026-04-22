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
        <div className="w-full bg-white min-h-screen relative flex flex-col items-center overflow-x-hidden pb-[100px]">
            <Navbar />

            {/* ─── 1. HERO SECTION (Rounded Image with View More) ─── */}
            <section className="w-full max-w-[1200px] mt-32 px-4 lg:px-0">
                <div className="w-full aspect-[16/9] lg:h-[600px] relative rounded-[15px] overflow-hidden group">
                    <Image 
                        src={mainImage}
                        alt={property.name || "Villa"}
                        fill
                        unoptimized={true}
                        className="object-cover"
                    />
                    {/* View More Button on Image */}
                    <button className="absolute bottom-6 right-6 bg-[#4d6a52] text-white px-6 py-3 rounded-full text-[11px] font-bold tracking-widest uppercase flex items-center gap-3 hover:bg-[#3d5541] transition-all z-20 shadow-lg">
                         <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                         VIEW MORE PICTURES
                    </button>
                </div>

                {/* ─── 2. TAB NAVIGATION ─── */}
                <div className="flex justify-center border-b border-gray-100 mt-10">
                    <div className="flex gap-8 lg:gap-12 text-[12px] font-medium text-gray-500 uppercase tracking-wider pb-4 overflow-x-auto no-scrollbar whitespace-nowrap">
                        <span className="text-[#4d6a52] border-b-2 border-[#4d6a52] pb-4 cursor-pointer">Description</span>
                        <span className="hover:text-[#4d6a52] cursor-pointer">Pictures</span>
                        <span className="hover:text-[#4d6a52] cursor-pointer">Amenities</span>
                        <span className="hover:text-[#4d6a52] cursor-pointer">Location</span>
                        <span className="hover:text-[#4d6a52] cursor-pointer">Rates</span>
                        <span className="hover:text-[#4d6a52] cursor-pointer">Availability</span>
                        <span className="hover:text-[#4d6a52] cursor-pointer">Reviews</span>
                    </div>
                </div>
            </section>

            {/* ─── 3. CONTENT AREA ─── */}
            <section className="w-full max-w-[1000px] px-6 lg:px-0 py-16">
                <span className="text-[12px] text-gray-400 mb-2 block">Vacation Home</span>
                <h1 className="text-[42px] lg:text-[56px] text-[#2d2d2d] font-bold leading-tight mb-8" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
                    {property.name}
                </h1>

                {/* Quick Icons */}
                <div className="flex gap-10 mb-12 py-6 border-y border-gray-50">
                    <div className="flex items-center gap-3 text-[14px] text-gray-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        {property.max_guests || 4} Guests
                    </div>
                    <div className="flex items-center gap-3 text-[14px] text-gray-600">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><path d="M9 22V12h6v10M2 12h20"/></svg>
                        {property.bathrooms || 1} Bathroom
                    </div>
                </div>

                {/* Description Text */}
                <div 
                    className="text-[16px] text-gray-600 leading-[1.8] mb-12"
                    dangerouslySetInnerHTML={{ __html: property.description || "" }}
                />

                {/* Highlights / Amenities Pill */}
                <div className="flex gap-4 mb-20">
                     <div className="flex items-center gap-3 px-6 py-3 border border-gray-200 rounded-full text-[13px] text-gray-700">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="2"/></svg>
                        Wireless Broadband Internet
                     </div>
                </div>

                {/* Pictures Grid */}
                <div className="mb-20">
                    <h2 className="text-[24px] font-bold mb-10">Pictures</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {displayImages.slice(0, 6).map((img: {url: string}, idx: number) => (
                            <div key={idx} className="relative aspect-[4/3] rounded-[10px] overflow-hidden">
                                <Image 
                                    src={img.url}
                                    alt={`Gallery ${idx}`}
                                    fill
                                    unoptimized={true}
                                    className="object-cover hover:scale-105 transition-transform duration-500"
                                />
                            </div>
                        ))}
                    </div>
                    <span className="text-[13px] text-[#4d6a52] font-semibold mt-6 inline-block cursor-pointer underline">Explore all pictures</span>
                </div>
            </section>

            {/* ─── 4. STICKY BOOKING FOOTER ─── */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-100 z-[100] py-4 px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-center lg:justify-between shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="max-w-[1200px] w-full flex flex-col lg:flex-row items-center justify-between gap-6">
                    {/* Left: Info */}
                    <div className="flex flex-col">
                        <span className="text-[16px] font-bold text-gray-800">{property.name}</span>
                        <div className="flex items-center gap-2 text-[12px] text-gray-500">
                             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                             {property.city}, Indonesia • from <span className="font-bold text-gray-900 ml-1">Rp{property.min_price || '4,395,000'}</span> per night
                        </div>
                    </div>

                    {/* Right: Form */}
                    <div className="flex flex-col lg:flex-row items-center gap-4 w-full lg:w-auto">
                        <div className="flex border border-gray-200 rounded-[8px] overflow-hidden h-[54px] w-full lg:w-auto">
                            <div className="px-6 border-r border-gray-200 flex flex-col justify-center min-w-[140px]">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Check-in</span>
                            </div>
                            <div className="px-6 flex flex-col justify-center min-w-[140px]">
                                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Check-out</span>
                            </div>
                        </div>
                        <div className="border border-gray-200 rounded-[8px] px-6 h-[54px] flex flex-col justify-center min-w-[160px] w-full lg:w-auto">
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Guests</span>
                            <span className="text-[13px] text-gray-800">1 adult</span>
                        </div>
                        <button className="bg-[#4d6a52] text-white px-10 h-[54px] rounded-[8px] font-bold text-[14px] hover:bg-[#3d5541] transition-all whitespace-nowrap w-full lg:w-auto">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
