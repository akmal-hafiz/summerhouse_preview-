import React from 'react';

export default function Footer() {
  return (
    // Background sudah Anda ubah menjadi #F5F3F1, mari kita atur ruang atas bawahnya saja (pt, pb)
    <footer className="bg-[#F5F3F1] w-full min-h-[90dvh] lg:min-h-[70dvh] h-auto mt-[150px] lg:mt-[300px] pt-[120px] pb-[80px]">
      
      {/* Container utama agar tetap di tengah */}
      <div className="w-full max-w-8xl mx-auto px-8 lg:px-12 relative bottom-[-90px] lg:bottom-[-150px] lg:right-[-40px]">
        <div className="flex flex-col lg:flex-row justify-between items-start gap-16 lg:gap-20">
          {/* ================= SISI KIRI (Teks Brand) ================= */}
          <div className="w-full lg:w-4/12 max-w-lg relative z-10 right-[-40px] top-[-20px] lg:top-[-0px] lg:right-[-40px] gap-10">
            <h2
              className="text-[#1a1a19] text-[22px] md:text-[26px] tracking-[0.3em] uppercase mb-8"
              style={{ fontFamily: "var(--font-playfair), serif" }}
            >
              Summerhouse
            </h2>

            <p
              className="text-[#5a5651] text-[13px] leading-[2] max-w-[320px] relative bottom-[-30px]"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              A curated collection of private villas and apartments in Bali. We provide thoughtfully designed spaces that blend modern comfort with authentic island living.
            </p>
          </div>

          {/* ================= SISI KANAN (4 Kolom List) ================= */}
          {/* w-full lg:w-6/12 membuat lebar container lebih kecil agar semua kolom navigasi berdekatan */}
          <div className="w-full lg:w-6/12 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-x-9 lg:gap-y-[10px] pt-5 relative lg:right-[100px]">
            
            {/* Kolom 1: STAY */}
            <div className="flex flex-col relative top-[-20px] lg:top-[-0px] right-[-40px] lg:right-[-0px]">
              <span
                className="block text-[#ad8553] text-[10px] tracking-[0.2em] font-bold uppercase mb-8"
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                Stay
              </span>
              <ul className="flex flex-col gap-[20px] relative bottom-[-30px]">
                <li>
                  <a href="#" className="text-[#5a5651] text-[12px] hover:text-[#1a1a19] transition-colors whitespace-nowrap block" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Short Stays
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#5a5651] text-[12px] hover:text-[#1a1a19] transition-colors whitespace-nowrap block" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Extended Stays
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#5a5651] text-[12px] hover:text-[#1a1a19] transition-colors whitespace-nowrap block" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Featured Homes
                  </a>
                </li>
              </ul>
            </div>

            {/* Kolom 2: FOR VILLA OWNERS */}
            <div className="flex flex-col relative top-[-20px] lg:top-[-0px] right-[-20px] lg:right-[-0px]">
              <span
                className="text-[#ad8553] text-[10px] tracking-[0.2em] font-bold uppercase mb-8"
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                For Villa Owners
              </span>
              <ul className="flex flex-col gap-[20px] relative bottom-[-30px]">
                <li>
                  <a href="#" className="text-[#5a5651] text-[12px] hover:text-[#1a1a19] transition-colors whitespace-nowrap block" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Property Management
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#5a5651] text-[12px] hover:text-[#1a1a19] transition-colors whitespace-nowrap block" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    List Your Property
                  </a>
                </li>
              </ul>
            </div>

            {/* Kolom 3: NAVIGATION */}
            <div className="flex flex-col relative bottom-[-30px] lg:bottom-[-0px] right-[-40px] lg:right-[-0px]">
              <span
                className="text-[#ad8553] text-[10px] tracking-[0.2em] font-bold uppercase mb-8"
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                Navigation
              </span>
              <ul className="flex flex-col gap-[20px] relative bottom-[-30px]">
                <li>
                  <a href="/about" className="text-[#5a5651] text-[12px] hover:text-[#1a1a19] transition-colors block" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    About
                  </a>
                </li>
                <li>
                  <a href="#contact" className="text-[#5a5651] text-[12px] hover:text-[#1a1a19] transition-colors block" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            {/* Kolom 4: CONNECT */}
            <div className="flex flex-col relative bottom-[-30px] lg:bottom-[-0px] right-[-20px] lg:right-[-0px]">
              <span
                className="text-[#ad8553] text-[10px] tracking-[0.2em] font-bold uppercase mb-8"
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                Connect
              </span>
              <ul className="flex flex-col gap-[20px] relative bottom-[-30px]">
                <li>
                  <a href="#" className="text-[#5a5651] text-[12px] hover:text-[#1a1a19] transition-colors block" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#5a5651] text-[12px] hover:text-[#1a1a19] transition-colors block" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    Pinteres  
                  </a>
                </li>
                <li>
                  <a href="#" className="text-[#5a5651] text-[12px] hover:text-[#1a1a19] transition-colors block" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
                    TikTok
                  </a>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </div>

      
      <div className="w-full max-w-7xl mx-auto px-8 lg:px-12 relative z-10 right-[-100px] lg:right-[-180px] bottom-[-100px] lg:bottom-[-380px]">
        {/* flex-row membelah copyright di kiri dan Terms di kanan */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <span
            className="text-[#8F8A84] relative left-[-100px] lg:left-[-113px] bottom-[-130px] lg:bottom-[-0px] text-[9px] tracking-[0.2em] font-bold uppercase"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            © 2026 Summerhouse. All Rights Reserved.
          </span>
          
          <div className="flex items-center gap-8 md:gap-13 relative left-[-39px] lg:left-[-39px] bottom-[-200px] lg:bottom-[-0px]">
            <a
              href="#"
              className="text-[#8F8A84] text-[9px] tracking-[0.2em] relative left-[-122px] lg:left-[-0px] font-bold uppercase hover:text-[#1a1a19] transition-colors"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-[#8F8A84] text-[9px] tracking-[0.2em] font-bold uppercase hover:text-[#1a1a19] transition-colors"
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
