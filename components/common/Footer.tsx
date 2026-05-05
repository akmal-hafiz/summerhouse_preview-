import Link from "next/link";
import React from 'react';
import { FiInstagram } from 'react-icons/fi';
import { FaPinterestP, FaTiktok } from 'react-icons/fa';

const FOOTER_LINKS = {
  stay: [
    { label: "Short Stays", href: "/short-stays" },
    { label: "Extended Stays", href: "/extended-stays" },
    { label: "Featured Homes", href: "/featured-homes" },
  ],
  forVillaOwners: [
    { label: "Property Management", href: "/property-management" },
    { label: "List Your Property", href: "/list-your-property" },
  ],
  navigation: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
};

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.029 12.017.029z" />
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.87a8.18 8.18 0 004.79 1.53V7a4.85 4.85 0 01-1.02-.31z" />
  </svg>
);

const SocialButton = ({ children, hoverClass }: { children: React.ReactNode, hoverClass: string }) => (
  <button className={`w-10 h-10 rounded-full border border-black/20 flex items-center justify-center text-[#1a1a19] transition-all duration-300 hover:-translate-y-1 ${hoverClass}`}>
    {children}
  </button>
);

export default function Footer() {
  return (
    <>
      {/* ================================================= */}
      {/* MOBILE FOOTER (Light Version) */}
      {/* ================================================= */}
      <footer className="block md:hidden bg-[#F5F3F1] w-full pt-20 pb-10 overflow-hidden">
        <div className="w-full px-6">
          <div className="grid grid-cols-1 gap-14 pb-16 text-center">
            
            {/* Column 1: Stay */}
            <div className="flex flex-col items-center gap-6">
              <h3 className="text-[#ad8553] text-[11px] tracking-[0.2em] font-bold uppercase" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Stay</h3>
              <ul className="flex flex-col gap-4">
                {FOOTER_LINKS.stay.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[#5a5651] text-[14px] hover:text-[#1a1a19] transition-colors font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: For Villa Owners */}
            <div className="flex flex-col items-center gap-6">
              <h3 className="text-[#ad8553] text-[11px] tracking-[0.2em] font-bold uppercase" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>For Villa Owners</h3>
              <ul className="flex flex-col gap-4">
                {FOOTER_LINKS.forVillaOwners.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[#5a5651] text-[14px] hover:text-[#1a1a19] transition-colors font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Navigation */}
            <div className="flex flex-col items-center gap-6">
              <h3 className="text-[#ad8553] text-[11px] tracking-[0.2em] font-bold uppercase" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Navigation</h3>
              <ul className="flex flex-col gap-4">
                {FOOTER_LINKS.navigation.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-[#5a5651] text-[14px] hover:text-[#1a1a19] transition-colors font-light">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 4: Connect */}
            <div className="flex flex-col items-center gap-6">
              <h3 className="text-[#ad8553] text-[11px] tracking-[0.2em] font-bold uppercase" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>Connect</h3>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full border border-[#d7cfc5] flex items-center justify-center text-[#5a5651] hover:bg-[#1a1a19] hover:text-[#F5F3F1] transition-all duration-300"><FiInstagram className="w-4 h-4" /></a>
                <a href="#" className="w-10 h-10 rounded-full border border-[#d7cfc5] flex items-center justify-center text-[#5a5651] hover:bg-[#bd081c] hover:text-white transition-all duration-300"><FaPinterestP className="w-4 h-4" /></a>
                <a href="#" className="w-10 h-10 rounded-full border border-[#d7cfc5] flex items-center justify-center text-[#5a5651] hover:bg-[#010101] hover:text-white transition-all duration-300"><FaTiktok className="w-4 h-4" /></a>
              </div>
            </div>
          </div>

          {/* Bottom Copyright Bar */}
          <div className="flex flex-col items-center gap-6 pt-8 border-t border-black/10">
            <span className="text-[#8F8A84] text-[10px] tracking-[0.2em] font-medium uppercase text-center" style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}>
              © {new Date().getFullYear()} Summerhouse. All Rights Reserved.
            </span>
            <div className="flex items-center gap-6">
              <Link href="/privacy-policy" className="text-[#8F8A84] text-[10px] tracking-[0.2em] font-medium uppercase hover:text-[#1a1a19]">Privacy Policy</Link>
              <Link href="/terms-of-service" className="text-[#8F8A84] text-[10px] tracking-[0.2em] font-medium uppercase hover:text-[#1a1a19]">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ================================================= */}
      {/* DESKTOP & TABLET FOOTER (Light Theme - Quiet Luxury) */}
      {/* ================================================= */}
      <footer className="hidden md:flex bg-[#F5F3F1] text-[#1a1a19] w-full min-h-[520px] lg:min-h-[60vh] flex-col overflow-hidden">

        {/* ── MAIN CONTENT — Optically centered via flex-grow ── */}
        <div className="flex-grow flex items-center w-full">
          <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 py-16 lg:py-0">

            {/* Two-Zone Layout: Brand Left + Links Right */}
            <div className="flex flex-row items-start justify-between gap-12 md:gap-12 lg:gap-96">

              {/* ── LEFT ZONE: Brand Identity ── */}
              <div className="flex flex-col items-start gap-8 translate-x-[40px] max-w-[320px] lg:max-w-[380px] shrink-0">
                {/* Serif Tagline */}
                <h2
                  className="text-[#1a1a19] text-[28px] lg:text-[34px] leading-[1.2] font-light"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  Your stay begins<br />with Summerhouse
                </h2>

                {/* Subtitle */}
                <p
                  className="text-[#8F8A84] text-[14px] leading-[1.7] font-normal max-w-[320px]"
                  style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                >
                  Curated luxury villas across Bali&apos;s most
                  sought&#8209;after neighborhoods, designed for
                  unforgettable stays.
                </p>

                {/* Social Icons Row */}
                <div className="flex items-center gap-3 pt-2">
                  <SocialButton hoverClass="hover:bg-[#C7A58A] hover:text-white hover:border-[#C7A58A]">
                    <InstagramIcon />
                  </SocialButton>
                  <SocialButton hoverClass="hover:bg-[#bd081c] hover:text-white hover:border-[#bd081c]">
                    <PinterestIcon />
                  </SocialButton>
                  <SocialButton hoverClass="hover:bg-black hover:text-white hover:border-black">
                    <TikTokIcon />
                  </SocialButton>
                </div>
              </div>

              {/* ── RIGHT ZONE: Link Columns ── */}
              <div className="grid grid-cols-3 gap-x-10 lg:gap-x-16 gap-y-10 flex-1 lg:pt-1">

                {/* Stay */}
                <div className="flex flex-col gap-5">
                  <h3
                    className="text-[#1a1a19] text-[11px] tracking-[0.2em] font-bold uppercase"
                    style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                  >
                    Stay
                  </h3>
                  <ul className="flex flex-col gap-3.5">
                    {FOOTER_LINKS.stay.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-[#8F8A84] text-[14px] font-normal hover:text-[#1a1a19] transition-all duration-300 relative inline-block after:content-[''] after:absolute after:w-0 after:h-[0.5px] after:bg-[#1a1a19] after:left-0 after:-bottom-0.5 hover:after:w-full after:transition-all after:duration-300"
                          style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* For Villa Owners */}
                <div className="flex flex-col gap-5">
                  <h3
                    className="text-[#1a1a19] text-[11px] tracking-[0.2em] font-bold uppercase"
                    style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                  >
                    For Villa Owners
                  </h3>
                  <ul className="flex flex-col gap-3.5">
                    {FOOTER_LINKS.forVillaOwners.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-[#8F8A84] text-[14px] font-normal hover:text-[#1a1a19] transition-all duration-300 relative inline-block after:content-[''] after:absolute after:w-0 after:h-[0.5px] after:bg-[#1a1a19] after:left-0 after:-bottom-0.5 hover:after:w-full after:transition-all after:duration-300"
                          style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Navigation */}
                <div className="flex flex-col gap-5">
                  <h3
                    className="text-[#1a1a19] text-[11px] tracking-[0.2em] font-bold uppercase"
                    style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                  >
                    Navigation
                  </h3>
                  <ul className="flex flex-col gap-3.5">
                    {FOOTER_LINKS.navigation.map((link) => (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          className="text-[#8F8A84] text-[14px] font-normal hover:text-[#1a1a19] transition-all duration-300 relative inline-block after:content-[''] after:absolute after:w-0 after:h-[0.5px] after:bg-[#1a1a19] after:left-0 after:-bottom-0.5 hover:after:w-full after:transition-all after:duration-300"
                          style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* ── FOOTER BOTTOM BAR ── */}
        <div className="w-full max-w-[1400px] mx-auto px-6 md:px-12 lg:px-24 pb-10 lg:pb-12">
          <div className="border-t border-black/10 pt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <span
              className="text-[#8F8A84] text-[10px] tracking-[0.2em] font-medium uppercase text-center md:text-left"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              © {new Date().getFullYear()} Summerhouse. All rights reserved.
            </span>
            <div className="flex items-center gap-8">
              <Link
                href="/privacy-policy"
                className="text-[#8F8A84] text-[10px] tracking-[0.2em] font-medium uppercase hover:text-[#1a1a19] transition-colors duration-300"
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms-of-service"
                className="text-[#8F8A84] text-[10px] tracking-[0.2em] font-medium uppercase hover:text-[#1a1a19] transition-colors duration-300"
                style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
