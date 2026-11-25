"use client";

import "./navbar-user.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect, useRef } from "react";
import { nextNavState, type NavScrollState } from "@/lib/nav-scroll";
import { FiGrid, FiHeart, FiLogOut, FiShield, FiUser } from "react-icons/fi";
import { getSavedVillasCount, subscribeSavedVillas } from "@/components/villas/savedVillas";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { LiquidDropdownSurface } from "@/components/ui/liquid-dropdown-surface";
import MobileNavMenu from "@/components/common/MobileNavMenu";
import { navbarNavItems } from "@/components/common/nav-items";
import { safeHttpHref } from "@/lib/safe-url";

interface NavbarProps {
  alwaysSolid?: boolean;
}

export default function Navbar({ alwaysSolid = false }: NavbarProps) {
  const [compact, setCompact] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [isSavedCountReady, setIsSavedCountReady] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const userMenuTriggerRef = useRef<HTMLButtonElement>(null);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const { language, toggleLanguage } = useLanguage();
  const pathname = usePathname();

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setUserMenuOpen(false);
      window.requestAnimationFrame(() => userMenuTriggerRef.current?.focus());
    };
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [userMenuOpen]);

  const adminUrl = safeHttpHref(process.env.NEXT_PUBLIC_CMS_ADMIN_URL || "/admin", "/admin");

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  // Homepage: the bar is clean and transparent over the hero at the top, and the capsule forms as soon as you leave it.
  const isHome = pathname === "/";

  useEffect(() => {
    // React state may be stale after a route change, so the first run always writes both values.
    let state: NavScrollState = { compact: false, scrolled: false, anchor: window.scrollY };
    let synced = false;
    const handleScroll = () => {
      const maxY = document.documentElement.scrollHeight - window.innerHeight;
      const next = nextNavState(state, { y: window.scrollY, maxY, isHome });
      if (!synced || next.compact !== state.compact) setCompact(next.compact);
      if (!synced || next.scrolled !== state.scrolled) setIsScrolled(next.scrolled);
      synced = true;
      state = next;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname, isHome]);

  useEffect(() => {
    setSavedCount(getSavedVillasCount());
    setIsSavedCountReady(true);
    return subscribeSavedVillas(({ count }) => setSavedCount(count));
  }, []);

  return (
    <header data-compact={compact} data-over-hero={isHome && !compact && !alwaysSolid ? "true" : undefined} className={`global-mini-header global-mini-header--refined global-mini-header--island ${isScrolled || alwaysSolid ? "is-scrolled" : ""}`}>
      <svg className="nav-prism-defs" aria-hidden="true" width="0" height="0"><defs><filter id="nav-prism-refraction" x="-10%" y="-40%" width="120%" height="180%" colorInterpolationFilters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.045" numOctaves="2" seed="8" result="water" /><feDisplacementMap in="SourceGraphic" in2="water" scale="18" xChannelSelector="R" yChannelSelector="G" /></filter></defs></svg>
      <span className="nav-prism-surface" aria-hidden="true" />
      <div className="global-mini-header__brand">
        <Link href="/" className="global-mini-logo" aria-label="Summerhouse Bali">
          <i className="global-mini-logo-mark" aria-hidden="true" />
        </Link>
      </div>

      <MobileNavMenu language={language} toggleLanguage={toggleLanguage} />

      <nav className="global-mini-nav" aria-label="Global navigation">
        {navbarNavItems.map((item, index) => (
          <Link href={item.href} key={item.href} style={{ "--nav-i": index } as React.CSSProperties} aria-current={pathname === item.href ? "page" : undefined}>{item.label[language]}</Link>
        ))}
      </nav>

      <div className="global-mini-actions">
        <InteractiveHoverButton href="/#home-hero-search" className="global-mini-link" arrow={null}>
          {language === "id" ? "Pesan Menginap" : "Book Your Stay"}
        </InteractiveHoverButton>
        <button type="button" className="global-language-toggle" aria-label={language === "id" ? "Switch to English" : "Ganti ke Bahasa Indonesia"} onClick={toggleLanguage}>
          {language === "id" ? "ID" : "EN"}
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
        <div className="global-user-dropdown" ref={userMenuRef}>
          {isAuthenticated && user ? (
            <button
              ref={userMenuTriggerRef}
              type="button"
              className="global-icon-button is-authenticated"
              aria-label={`Account: ${user.name}`}
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
              aria-controls="global-user-account-menu"
              onClick={() => setUserMenuOpen((v) => !v)}
            >
              <span className="global-user-initial" aria-hidden="true">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </button>
          ) : (
            <button
              type="button"
              className="global-icon-button"
              aria-label="Sign in or create an account"
              onClick={() => openAuth("login")}
            >
              <FiUser aria-hidden="true" />
            </button>
          )}

          {isAuthenticated && userMenuOpen && user && (
            <LiquidDropdownSurface id="global-user-account-menu" className="global-user-menu global-user-menu--solid" variant="navigation" role="menu">
              <div className="global-user-menu__header">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                {isAdmin && <span className="global-user-menu__badge">Admin</span>}
              </div>
              <div className="global-user-menu__items">
                {!isAdmin && <Link href="/dashboard" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                  <FiGrid aria-hidden="true" />
                  <span>My dashboard</span>
                </Link>}
                {isAdmin && (
                  <a href={adminUrl} role="menuitem">
                    <FiShield aria-hidden="true" />
                  <span>Admin dashboard</span>
                  </a>
                )}
                {!isAdmin && <Link href="/dashboard/saved" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                  <FiHeart aria-hidden="true" />
                  <span>Saved villas</span>
                </Link>}
                <button type="button" role="menuitem" onClick={handleLogout}>
                  <FiLogOut aria-hidden="true" />
                  <span>{language === "id" ? "Keluar" : "Sign out"}</span>
                </button>
              </div>
            </LiquidDropdownSurface>
          )}
        </div>
      </div>

    </header>
  );
}
