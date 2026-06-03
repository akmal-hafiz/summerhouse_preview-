"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import { FiHeart, FiMenu, FiSearch, FiUser } from "react-icons/fi";
import { getSavedVillasCount, subscribeSavedVillas } from "@/components/villas/savedVillas";

const navbarNavItems = [
  { label: "Villas", href: "/villas" },
  { label: "Gallery", href: "/gallery" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

interface NavbarProps {
  alwaysSolid?: boolean;
}

export default function Navbar({ alwaysSolid = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [isSavedCountReady, setIsSavedCountReady] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setSavedCount(getSavedVillasCount());
    setIsSavedCountReady(true);
    return subscribeSavedVillas(({ count }) => setSavedCount(count));
  }, []);

  return (
    <header className={`global-mini-header ${isScrolled || alwaysSolid ? "is-scrolled" : ""}`}>
      <div className="global-mini-header__brand">
        <Link href="/" className="global-mini-logo">SUMMERHOUSE</Link>
        <span>Bali private stays</span>
      </div>

      <details className="global-mobile-menu global-mobile-menu--standalone">
        <summary aria-label="Open navigation">
          <FiMenu aria-hidden="true" />
        </summary>
        <div className="global-mobile-menu__panel">
          {navbarNavItems.map((item) => (
            <Link href={item.href} key={`standalone-mobile-${item.href}`}>{item.label}</Link>
          ))}
          <Link href="/villas" style={{ fontWeight: 700, color: "#2e5c45" }}>Book our Villas</Link>
        </div>
      </details>

      <nav className="global-mini-nav" aria-label="Global navigation">
        {navbarNavItems.map((item) => (
          <Link href={item.href} key={item.href}>{item.label}</Link>
        ))}
      </nav>

      <div className="global-mini-actions">
        <Link href="/villas" className="global-mini-link">Book our Villas</Link>
        <button type="button" className="global-icon-button" aria-label="Search villas">
          <FiSearch aria-hidden="true" />
        </button>
        <Link
          href="/saved-villas"
          className={`global-icon-button global-icon-button--saved ${savedCount > 0 ? "has-saved-count" : ""}`}
          aria-label={savedCount > 0 ? `Saved villas, ${savedCount} selected` : "Saved villas"}
        >
          <FiHeart aria-hidden="true" />
          {isSavedCountReady && savedCount > 0 && (
            <span className="global-icon-button__badge" aria-hidden="true">{savedCount}</span>
          )}
        </Link>
        <button type="button" className="global-icon-button" aria-label="User profile">
          <FiUser aria-hidden="true" />
        </button>
        <details className="global-mobile-menu">
          <summary aria-label="Open navigation">
            <FiMenu aria-hidden="true" />
          </summary>
          <div className="global-mobile-menu__panel">
            {navbarNavItems.map((item) => (
              <Link href={item.href} key={`mobile-${item.href}`}>{item.label}</Link>
            ))}
            <Link href="/villas" style={{ fontWeight: 700, color: "#2e5c45" }}>Book our Villas</Link>
          </div>
        </details>
      </div>
    </header>
  );
}
