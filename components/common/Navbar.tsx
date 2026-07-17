"use client";

import "./navbar-user.css";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { FiGrid, FiHeart, FiLogOut, FiMenu, FiSearch, FiShield, FiUser } from "react-icons/fi";
import { getSavedVillasCount, subscribeSavedVillas } from "@/components/villas/savedVillas";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { useLanguage } from "@/components/providers/LanguageProvider";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { LiquidDropdownSurface } from "@/components/ui/liquid-dropdown-surface";
import { safeHttpHref } from "@/lib/safe-url";

const navbarNavItems = [
  { label: { en: "Villas", id: "Vila" }, href: "/villas" },
  { label: { en: "Gallery", id: "Galeri" }, href: "/gallery" },
  { label: { en: "Services", id: "Layanan" }, href: "/services" },
  { label: { en: "About", id: "Tentang" }, href: "/about" },
  { label: { en: "Contact", id: "Kontak" }, href: "/contact" },
];

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
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const summaryRef = useRef<HTMLElement>(null);

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
      if (detailsRef.current && !detailsRef.current.contains(event.target as Node)) {
        closeMenu();
      }
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

      const panel = document.getElementById("global-mobile-navigation-panel");
      const focusable = Array.from(
        panel?.querySelectorAll<HTMLElement>(
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
    };
  }, [closeMenu, open]);

  return (
    <details
      ref={detailsRef}
      className="global-mobile-menu global-mobile-menu--standalone"
      onToggle={() => setOpen(Boolean(detailsRef.current?.open))}
    >
      <summary
        ref={summaryRef}
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-controls="global-mobile-navigation-panel"
        aria-expanded={open}
      >
        <FiMenu aria-hidden="true" />
      </summary>
      {open ? (
        <button
          type="button"
          className="global-mobile-menu__backdrop"
          aria-label="Close navigation menu"
          tabIndex={-1}
          onClick={() => closeMenu()}
        />
      ) : null}
      <LiquidDropdownSurface
        id="global-mobile-navigation-panel"
        className="summerhouse-liquid-glass summerhouse-liquid-glass--drawer global-mobile-menu__panel"
        variant="drawer"
      >
        {navbarNavItems.map((item) => (
          <Link
            href={item.href}
            key={`standalone-mobile-${item.href}`}
            onClick={() => closeMenu(false)}
          >
            {item.label[language]}
          </Link>
        ))}
        <InteractiveHoverButton
          href="/villas"
          className="global-mobile-menu__cta"
          arrow={null}
          onClick={() => closeMenu(false)}
        >
          {language === "id" ? "Pesan Vila" : "Book our Villas"}
        </InteractiveHoverButton>
        <button
          type="button"
          className="summerhouse-liquid-glass summerhouse-liquid-glass--language global-language-toggle global-language-toggle--mobile"
          onClick={toggleLanguage}
        >
          {language === "id" ? "Bahasa Indonesia" : "English"}
        </button>
      </LiquidDropdownSurface>
    </details>
  );
}

export default function Navbar({ alwaysSolid = false }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [isSavedCountReady, setIsSavedCountReady] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const { language, toggleLanguage } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!userMenuOpen) return;
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [userMenuOpen]);

  const adminUrl = safeHttpHref(process.env.NEXT_PUBLIC_CMS_ADMIN_URL || "http://localhost:8000/admin", "/dashboard");

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  const handleSearchClick = () => {
    const target = document.getElementById("home-hero-search");

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      window.setTimeout(() => {
        target.querySelector<HTMLButtonElement>(".villa-search-form__group--location button")?.focus();
      }, 420);
      return;
    }

    router.push(pathname === "/" ? "#home-hero-search" : "/#home-hero-search");
  };

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
        <Link href="/" className="global-mini-logo" aria-label="Summerhouse Bali">
          <i className="global-mini-logo-mark" aria-hidden="true" />
        </Link>
      </div>

      <MobileNavigationMenu language={language} toggleLanguage={toggleLanguage} />

      <nav className="global-mini-nav" aria-label="Global navigation">
        {navbarNavItems.map((item) => (
          <Link href={item.href} key={item.href}>{item.label[language]}</Link>
        ))}
      </nav>

      <div className="global-mini-actions">
        <InteractiveHoverButton href="/villas" className="global-mini-link" arrow={null}>
          {language === "id" ? "Pesan Vila" : "Book our Villas"}
        </InteractiveHoverButton>
        <button type="button" className="global-language-toggle" aria-label="Switch language" onClick={toggleLanguage}>
          {language === "id" ? "ID" : "EN"}
        </button>
        <button type="button" className="global-icon-button global-icon-button--search" aria-label="Search villas" onClick={handleSearchClick}>
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
        <div className="global-user-dropdown" ref={userMenuRef}>
          {isAuthenticated && user ? (
            <button
              type="button"
              className="global-icon-button is-authenticated"
              aria-label={`Account: ${user.name}`}
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
              aria-label="Sign in or register"
              onClick={() => openAuth("login")}
            >
              <FiUser aria-hidden="true" />
            </button>
          )}

          {isAuthenticated && userMenuOpen && user && (
            <LiquidDropdownSurface className="global-user-menu" variant="navigation" role="menu">
              <div className="global-user-menu__header">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                {isAdmin && <span className="global-user-menu__badge">Admin</span>}
              </div>
              <div className="global-user-menu__items">
                <Link href="/dashboard" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                  <FiGrid aria-hidden="true" />
                  <span>My dashboard</span>
                </Link>
                {isAdmin && (
                  <a href={adminUrl} role="menuitem">
                    <FiShield aria-hidden="true" />
                  <span>Admin dashboard</span>
                  </a>
                )}
                <Link href="/dashboard/saved" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                  <FiHeart aria-hidden="true" />
                  <span>Saved villas</span>
                </Link>
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
