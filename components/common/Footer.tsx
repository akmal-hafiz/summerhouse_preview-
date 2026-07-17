"use client";

import Link from "next/link";
import React from 'react';

const FOOTER_LINKS = {
  stay: [
    { label: "Short Stays", href: "/villas" },
    { label: "Extended Stays", href: "/villas" },
    { label: "Featured Homes", href: "#", disabled: true },
  ],
  forVillaOwners: [
    { label: "Property Management", href: "/services" },
    { label: "List Your Property", href: "/contact" },
  ],
  navigation: [
    { label: "About us", href: "/about" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact us", href: "/contact" },
  ],
};

export default function Footer() {
  return (
    <footer className="sh-footer" style={{ fontFamily: 'var(--font-dm-sans), sans-serif' }}>
      <div className="sh-footer-container">
        
        {/* ── TOP ZONE: Left (Brand & Newsletter) and Right (Columns & Socials) ── */}
        <div className="sh-footer-top">
          
          {/* Brand & Newsletter (Left Block) */}
          <div className="sh-footer-brand-newsletter">
            
            {/* Brand Logo */}
            <div className="sh-footer-brand-logo">
              <img 
                src="/SUMMERHOUSE_LOGO_PROJECT_1.svg" 
                alt="Summerhouse Bali Logo" 
                className="sh-footer-logo-img"
              />
            </div>

            {/* Newsletter Subscription */}
            <div className="sh-footer-newsletter">
              <h2 className="sh-footer-newsletter-title">Join Our Newsletter</h2>
              <p className="sh-footer-desc">
                Connect, share, and get thoughtful Bali notes from Summerhouse.
              </p>
              <form className="sh-footer-form" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="sh-footer-input"
                  aria-label="Email address"
                />
                <button type="submit" className="sh-footer-submit" aria-label="Subscribe">
                  <svg 
                    width="14" 
                    height="14" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    className="sh-footer-submit-icon"
                  >
                    <line x1="7" y1="17" x2="17" y2="7"></line>
                    <polyline points="7 7 17 7 17 17"></polyline>
                  </svg>
                </button>
              </form>
            </div>

          </div>

          {/* Columns & Socials (Right Block) */}
          <div className="sh-footer-right-block">
            
            {/* Sitemap Columns */}
            <div className="sh-footer-columns">
              
              {/* Column 1: Stay */}
              <div className="sh-footer-column">
                <h3 className="sh-footer-column-title">Stay</h3>
                <ul className="sh-footer-links-list">
                  {FOOTER_LINKS.stay.map((link) => (
                    <li key={link.label}>
                      {link.disabled ? (
                        <span className="sh-footer-link-disabled">
                          {link.label}
                        </span>
                      ) : (
                        <Link href={link.href} className="sh-footer-link">
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 2: For Villa Owners */}
              <div className="sh-footer-column">
                <h3 className="sh-footer-column-title">For Villa Owners</h3>
                <ul className="sh-footer-links-list">
                  {FOOTER_LINKS.forVillaOwners.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="sh-footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 3: Navigation */}
              <div className="sh-footer-column">
                <h3 className="sh-footer-column-title">Navigation</h3>
                <ul className="sh-footer-links-list">
                  {FOOTER_LINKS.navigation.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="sh-footer-link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Column 4: Inquiries */}
              <div className="sh-footer-column">
                <h3 className="sh-footer-column-title">Inquiries</h3>
                <ul className="sh-footer-inquiries-list">
                  <li>
                    <span className="sh-inquiry-label">Business</span>
                    <a href="mailto:info@summerhousebali.com" className="sh-inquiry-email">
                      info@summerhousebali.com
                    </a>
                  </li>
                  <li>
                    <span className="sh-inquiry-label">Reservations</span>
                    <a href="mailto:reservation.summerhouse@gmail.com" className="sh-inquiry-email">
                      reservation.summerhouse@gmail.com
                    </a>
                  </li>
                  <li>
                    <span className="sh-inquiry-label">WhatsApp</span>
                    <a href="https://wa.me/6281932387121" target="_blank" rel="noopener noreferrer" className="sh-inquiry-phone">
                      +62 819-3238-7121
                    </a>
                  </li>
                </ul>
              </div>

            </div>

            {/* Social Pill-Shaped Buttons */}
            <div className="sh-footer-socials">
              <a 
                href="https://www.instagram.com/summerhouse.bali/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="sh-footer-social-btn"
              >
                Instagram
              </a>
              <a 
                href="https://pin.it/3CgvbgIq5" 
                target="_blank" 
                rel="noopener noreferrer"
                className="sh-footer-social-btn"
              >
                Pinterest
              </a>
              <a 
                href="https://wa.me/6281932387121" 
                target="_blank" 
                rel="noopener noreferrer"
                className="sh-footer-social-btn"
              >
                WhatsApp
              </a>
            </div>

          </div>

        </div>

        {/* ── BOTTOM ZONE: Centered Copyright ── */}
        <div className="sh-footer-bottom">
          <span className="sh-footer-copyright">
            © {new Date().getFullYear()} SUMMERHOUSE / ALL RIGHTS RESERVED
          </span>
        </div>

      </div>
    </footer>
  );
}
