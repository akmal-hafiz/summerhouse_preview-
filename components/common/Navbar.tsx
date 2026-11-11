"use client";

import "./navbar-user.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { FiGrid, FiHeart, FiLogOut, FiMenu, FiShield, FiUser, FiX } from "react-icons/fi";
import { getSavedVillasCount, subscribeSavedVillas } from "@/components/villas/savedVillas";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { LiquidDropdownSurface } from "@/components/ui/liquid-dropdown-surface";
import { safeHttpHref } from "@/lib/safe-url";

const navbarNavItems = [
  { label: { en: "Stays", id: "Menginap" }, href: "/villas" },
  { label: { en: "Services", id: "Layanan" }, href: "/services" },
  { label: { en: "Gallery", id: "Galeri" }, href: "/gallery" },
  { label: { en: "About", id: "Tentang" }, href: "/about" },
  { label: { en: "Contact", id: "Kontak" }, href: "/contact" },
];
const desktopNavItems = navbarNavItems;

interface NavbarProps {
  alwaysSolid?: boolean;
}

type NavbarLanguage = "en" | "id";

type MobileNavigationMenuProps = {
  language: NavbarLanguage;
  toggleLanguage: () => void;
};

function MobileNavigationMenu({ language, toggleLanguage }: MobileNavigationMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const pathname = usePathname();
  const adminUrl = safeHttpHref(process.env.NEXT_PUBLIC_CMS_ADMIN_URL || "/admin", "/admin");

  useEffect(() => setMounted(true), []);

  const closeMenu = useCallback((restoreFocus = true) => {
    if (detailsRef.current) {
      detailsRef.current.open = false;
    }
    setOpen(false);

    if (restoreFocus) {
      window.requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        detailsRef.current &&
        !detailsRef.current.contains(target) &&
        !portalRef.current?.contains(target)
      ) {
        closeMenu();
      }
    };

    const handleResize = () => {
      if (window.matchMedia("(min-width: 1181px)").matches) closeMenu(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMenu();
        return;
      }

      if (event.key !== "Tab") {
        return;
      }

      const focusable = Array.from(
        portalRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((element) => !element.hasAttribute("disabled") && element.offsetParent !== null);

      if (!focusable.length) {
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    window.requestAnimationFrame(() => {
      document
        .getElementById("global-mobile-navigation-panel")
        ?.querySelector<HTMLElement>('a[href], button:not([disabled])')
        ?.focus();
    });

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [closeMenu, open]);

  return (
    <>
      <details
        ref={detailsRef}
        open={open}
        className="global-mobile-menu global-mobile-menu--standalone"
      >
        <summary
          ref={summaryRef}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-controls="global-mobile-navigation-panel"
          aria-expanded={open}
          onClick={(event) => {
            event.preventDefault();
            setOpen((current) => !current);
          }}
        >
          {open ? <FiX aria-hidden="true" /> : <FiMenu aria-hidden="true" />}
        </summary>
      </details>
      {mounted && open
        ? createPortal(
            <div ref={portalRef} className="global-mobile-menu__portal">
              <button
                type="button"
                className="global-mobile-menu__backdrop"
                aria-label="Close navigation menu"
                tabIndex={-1}
                onClick={() => closeMenu()}
              />
              <button
                type="button"
                className="global-mobile-menu__close"
                aria-label="Close navigation menu"
                onClick={() => closeMenu()}
              >
                <FiX aria-hidden="true" />
              </button>
              <LiquidDropdownSurface
                id="global-mobile-navigation-panel"
                className="summerhouse-liquid-glass summerhouse-liquid-glass--drawer global-mobile-menu__panel global-mobile-menu__panel--refined"
                variant="drawer"
                role="dialog"
                aria-modal="true"
                aria-label="Site navigation"
              >
                <InteractiveHoverButton
                  href="/#home-hero-search"
                  className="global-mobile-menu__cta"
                  arrow={null}
                  onClick={() => closeMenu(false)}
                >
                  {language === "id" ? "Pesan Menginap" : "Book Your Stay"}
                </InteractiveHoverButton>
                {navbarNavItems.map((item) => (
                  <Link
                    href={item.href}
                    key={`standalone-mobile-${item.href}`}
                    aria-current={pathname === item.href ? "page" : undefined}
                    onClick={() => closeMenu(false)}
                  >
                    {item.label[language]}
                  </Link>
                ))}
                <div className="global-mobile-menu__utilities">
                  <Link className="global-mobile-menu__saved-link" href="/saved-villas" onClick={() => closeMenu(false)}>
                    {language === "id" ? "Villa tersimpan" : "Saved villas"}
                  </Link>
                  {isAuthenticated && user ? (
                    <>
                      {!isAdmin && <Link href="/dashboard" onClick={() => closeMenu(false)}>
                        {language === "id" ? "Akun saya" : "My account"}
                      </Link>}
                      {isAdmin && <a href={adminUrl} onClick={() => closeMenu(false)}>{language === "id" ? "Dashboard admin" : "Admin dashboard"}</a>}
                      <button type="button" onClick={() => { closeMenu(false); void logout(); }}>
                        {language === "id" ? "Keluar" : "Sign out"}
                      </button>
                    </>
                  ) : (
                    <button type="button" onClick={() => { closeMenu(false); openAuth("login"); }}>
                      {language === "id" ? "Masuk / Daftar" : "Sign in / Create account"}
                    </button>
                  )}
                </div>
                <button
                  type="button"
                  className="global-language-toggle global-language-toggle--mobile"
                  onClick={toggleLanguage}
                >
                  {language === "id" ? "English" : "Bahasa Indonesia"}
                </button>
              </LiquidDropdownSurface>
            </div>,
            document.body,
          )
        : null}
    </>
  );
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

  useEffect(() => {
    let anchor = window.scrollY;
    const handleScroll = () => {
      const y = Math.max(0, window.scrollY);
      if (y < 48) setCompact(false);
      else if (Math.abs(y - anchor) > 12) {
        setCompact(y > 96 && y > anchor);
        anchor = y;
      }
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [pathname]);

  useEffect(() => {
    setSavedCount(getSavedVillasCount());
    setIsSavedCountReady(true);
    return subscribeSavedVillas(({ count }) => setSavedCount(count));
  }, []);

  return (
    <header data-compact={compact} className={`global-mini-header global-mini-header--refined global-mini-header--island ${isScrolled || alwaysSolid ? "is-scrolled" : ""}`}>
      <svg className="nav-prism-defs" aria-hidden="true" width="0" height="0"><defs><filter id="nav-prism-refraction" x="-10%" y="-40%" width="120%" height="180%" colorInterpolationFilters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.045" numOctaves="2" seed="8" result="water" /><feDisplacementMap in="SourceGraphic" in2="water" scale="18" xChannelSelector="R" yChannelSelector="G" /></filter></defs></svg>
      <span className="nav-prism-surface" aria-hidden="true" />
      <div className="global-mini-header__brand">
        <Link href="/" className="global-mini-logo" aria-label="Summerhouse Bali">
          <i className="global-mini-logo-mark" aria-hidden="true" />
        </Link>
      </div>

      <MobileNavigationMenu language={language} toggleLanguage={toggleLanguage} />

      <nav className="global-mini-nav" aria-label="Global navigation">
        {desktopNavItems.map((item) => (
          <Link href={item.href} key={item.href} aria-current={pathname === item.href ? "page" : undefined}>{item.label[language]}</Link>
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
