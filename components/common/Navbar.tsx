"use client";

import "./navbar-user.css";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { FiHeart, FiLogOut, FiMenu, FiSearch, FiShield, FiUser } from "react-icons/fi";
import { getSavedVillasCount, subscribeSavedVillas } from "@/components/villas/savedVillas";
import { useAuth } from "@/components/providers/AuthProvider";

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const loginHref = (() => {
    if (!pathname || pathname === "/login" || pathname === "/register" || pathname === "/") {
      return "/login";
    }
    return `/login?redirect=${encodeURIComponent(pathname)}`;
  })();

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

  const adminUrl = process.env.NEXT_PUBLIC_CMS_ADMIN_URL || "http://localhost:8000/admin";

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
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
            <Link
              href={loginHref}
              className="global-icon-button"
              aria-label="Sign in or register"
            >
              <FiUser aria-hidden="true" />
            </Link>
          )}

          {isAuthenticated && userMenuOpen && user && (
            <div className="global-user-menu" role="menu">
              <div className="global-user-menu__header">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
                {isAdmin && <span className="global-user-menu__badge">Admin</span>}
              </div>
              <div className="global-user-menu__items">
                {isAdmin && (
                  <a href={adminUrl} role="menuitem">
                    <FiShield aria-hidden="true" />
                    <span>Admin dashboard</span>
                  </a>
                )}
                <Link href="/saved-villas" role="menuitem" onClick={() => setUserMenuOpen(false)}>
                  <FiHeart aria-hidden="true" />
                  <span>Saved villas</span>
                </Link>
                <button type="button" role="menuitem" onClick={handleLogout}>
                  <FiLogOut aria-hidden="true" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
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
