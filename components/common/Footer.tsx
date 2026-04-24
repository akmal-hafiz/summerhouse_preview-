import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#F5F3F1] w-full py-20 md:py-24 lg:py-32">
      
      <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 pb-20 border-b border-black/5">
          
          {/* ================= LEFT SIDE (Brand Text) ================= */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <h2
              className="text-[#1a1a19] text-[22px] md:text-[26px] tracking-[0.3em] uppercase"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Summerhouse
            </h2>

            <p
              className="text-[#5a5651] text-[15px] leading-[1.8] max-w-[360px] font-light"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              A curated collection of private villas and apartments in Bali. We provide thoughtfully designed spaces that blend modern comfort with authentic island living.
            </p>

            <div className="flex gap-6 mt-4">
               {/* Social Icons Placeholder or Text Links */}
               <a href="#" className="text-[#ad8553] text-[12px] font-bold tracking-widest uppercase hover:text-[#1a1a19] transition-colors">Instagram</a>
               <a href="#" className="text-[#ad8553] text-[12px] font-bold tracking-widest uppercase hover:text-[#1a1a19] transition-colors">Pinterest</a>
            </div>
          </div>

          {/* ================= RIGHT SIDE (Navigation Links) ================= */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8">
            
            {/* Column 1: COLLECTION */}
            <div className="flex flex-col gap-8">
              <span
                className="text-[#ad8553] text-[11px] tracking-[0.2em] font-bold uppercase"
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                Collection
              </span>
              <ul className="flex flex-col gap-5">
                <li><a href="/villas" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">All Villas</a></li>
                <li><a href="/villas" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">Private Estates</a></li>
                <li><a href="/villas" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">Monthly Stays</a></li>
                <li><a href="/villas" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">New Additions</a></li>
              </ul>
            </div>

            {/* Column 2: EXPERIENCE */}
            <div className="flex flex-col gap-8">
              <span
                className="text-[#ad8553] text-[11px] tracking-[0.2em] font-bold uppercase"
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                Experience
              </span>
              <ul className="flex flex-col gap-5">
                <li><a href="/services" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">Concierge</a></li>
                <li><a href="/services" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">Wellness & Spa</a></li>
                <li><a href="/services" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">Private Dining</a></li>
                <li><a href="/about" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">The Journal</a></li>
              </ul>
            </div>

            {/* Column 3: COMPANY */}
            <div className="flex flex-col gap-8">
              <span
                className="text-[#ad8553] text-[11px] tracking-[0.2em] font-bold uppercase"
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                Company
              </span>
              <ul className="flex flex-col gap-5">
                <li><a href="/about" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">Our Story</a></li>
                <li><a href="/about" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">Sustainability</a></li>
                <li><a href="/contact" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">Careers</a></li>
                <li><a href="/contact" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">Contact Us</a></li>
              </ul>
            </div>

            {/* Column 4: SUPPORT */}
            <div className="flex flex-col gap-8">
              <span
                className="text-[#ad8553] text-[11px] tracking-[0.2em] font-bold uppercase"
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                Support
              </span>
              <ul className="flex flex-col gap-5">
                <li><a href="#" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">Help Center</a></li>
                <li><a href="#" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">Booking Guide</a></li>
                <li><a href="#" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">Privacy Policy</a></li>
                <li><a href="#" className="text-[#5a5651] text-[13px] hover:text-[#1a1a19] transition-colors block font-light">Terms of Use</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer (Copyright & Terms) */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12">
          <span
            className="text-[#8F8A84] text-[10px] tracking-[0.2em] font-medium uppercase text-center md:text-left"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            © 2026 Summerhouse. All Rights Reserved.
          </span>
          
          <div className="flex items-center gap-8 md:gap-12">
            <a
              href="#"
              className="text-[#8F8A84] text-[10px] tracking-[0.2em] font-medium uppercase hover:text-[#1a1a19] transition-colors"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[#8F8A84] text-[10px] tracking-[0.2em] font-medium uppercase hover:text-[#1a1a19] transition-colors"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
