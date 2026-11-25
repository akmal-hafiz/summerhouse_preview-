"use client";

import "./mobile-nav.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { useAuth } from "@/components/providers/AuthProvider";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { InteractiveHoverButton } from "@/components/ui/interactive-hover-button";
import { LiquidDropdownSurface } from "@/components/ui/liquid-dropdown-surface";
import ModalLayer from "@/components/common/ModalLayer";
import { safeHttpHref } from "@/lib/safe-url";
import { navbarNavItems } from "@/components/common/nav-items";

type MobileNavMenuProps = {
  language: "en" | "id";
  toggleLanguage: () => void;
};

/** Three bars that turn into an X while `open`. */
function MenuIcon({ open }: { open: boolean }) {
  return (
    <span className="mobile-nav-icon" data-open={open ? "" : undefined} aria-hidden="true">
      <span />
      <span />
      <span />
    </span>
  );
}

export default function MobileNavMenu({ language, toggleLanguage }: MobileNavMenuProps) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  // The dialog's close button sits exactly over the trigger, which moves between the full bar and the capsule.
  const [closeBox, setCloseBox] = useState<CSSProperties>();
  const triggerRef = useRef<HTMLButtonElement>(null);
  // iOS does not focus a tapped button, so moving focus there afterwards draws a :focus-visible ring.
  // Only keyboard users get focus moved into the menu and handed back to the trigger.
  const openedByKeyboard = useRef(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { openAuth } = useAuthModal();
  const pathname = usePathname();
  const adminUrl = safeHttpHref(process.env.NEXT_PUBLIC_CMS_ADMIN_URL || "/admin", "/admin");

  useEffect(() => setMounted(true), []);

  const measureTrigger = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const box = trigger.getBoundingClientRect();
    // The X keeps the trigger's ink: porcelain on the dark bar, charcoal on the compact capsule.
    const { color } = getComputedStyle(trigger);
    setCloseBox({ top: box.top, left: box.left, width: box.width, height: box.height, color });
  }, []);

  const closeMenu = useCallback((restoreFocus = true) => {
    setOpen(false);
    if (restoreFocus && openedByKeyboard.current) {
      window.requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleResize = () => {
      if (window.matchMedia("(min-width: 1181px)").matches) closeMenu(false);
      else measureTrigger();
    };

    window.addEventListener("resize", handleResize);
    const frame = window.requestAnimationFrame(() => {
      const panel = document.getElementById("global-mobile-navigation-panel");
      const target = openedByKeyboard.current
        ? panel?.querySelector<HTMLElement>('a[href], button:not([disabled])')
        : panel;
      target?.focus();
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      window.cancelAnimationFrame(frame);
    };
  }, [closeMenu, measureTrigger, open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="mobile-nav-trigger"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-controls="global-mobile-navigation-panel"
        aria-expanded={open}
        onClick={(event) => {
          if (open) {
            closeMenu();
            return;
          }
          // A click from Enter or Space carries detail 0; a tap or mouse click counts at least 1.
          openedByKeyboard.current = event.detail === 0;
          measureTrigger();
          setOpen(true);
        }}
      >
        <MenuIcon open={open} />
      </button>
      {mounted && open
        ? createPortal(
            // ModalLayer (native dialog) owns Esc, focus containment and the inert page behind.
            <ModalLayer lockScroll onClose={() => closeMenu()} aria-label="Site navigation">
              <div className="global-mobile-menu__portal">
                <button
                  type="button"
                  className="global-mobile-menu__backdrop"
                  aria-label="Close navigation menu"
                  tabIndex={-1}
                  onClick={() => closeMenu()}
                />
                <button
                  type="button"
                  className="mobile-nav-close"
                  style={closeBox}
                  aria-label="Close navigation menu"
                  onClick={() => closeMenu()}
                >
                  <MenuIcon open />
                </button>
                <LiquidDropdownSurface
                  id="global-mobile-navigation-panel"
                  tabIndex={-1}
                  className="summerhouse-liquid-glass summerhouse-liquid-glass--drawer global-mobile-menu__panel global-mobile-menu__panel--refined"
                  variant="drawer"
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
              </div>
            </ModalLayer>,
            document.body,
          )
        : null}
    </>
  );
}
