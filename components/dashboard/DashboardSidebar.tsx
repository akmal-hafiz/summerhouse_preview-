"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiHome, FiHeart, FiSettings, FiLogOut, FiShield, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "@/components/providers/AuthProvider";
import { safeHttpHref } from "@/lib/safe-url";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Overview", icon: <FiHome aria-hidden="true" /> },
  { href: "/dashboard/saved", label: "Saved villas", icon: <FiHeart aria-hidden="true" /> },
  { href: "/dashboard/settings", label: "Settings", icon: <FiSettings aria-hidden="true" /> },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, logout } = useAuth();
  const adminUrl = safeHttpHref(process.env.NEXT_PUBLIC_CMS_ADMIN_URL || "http://localhost:8000/admin", "/dashboard");

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="dash-sidebar" aria-label="Account navigation">
      <Link href="/" className="dash-brand" aria-label="Summerhouses Bali home">
        <img
          src="/SUMMERHOUSE_LOGO_PROJECT_1.svg"
          alt="Summerhouses Bali"
          className="dash-brand-logo-img"
        />
      </Link>

      <nav className="dash-nav">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`dash-nav-item${isActive ? " is-active" : ""}`}
              aria-current={isActive ? "page" : undefined}
              title={item.label}
            >
              <span className="dash-nav-icon">{item.icon}</span>
              <span className="dash-nav-label">{item.label}</span>
              {isActive && <span className="dash-nav-dot" aria-hidden="true" />}
            </Link>
          );
        })}
        {isAdmin && (
          <a href={adminUrl} className="dash-nav-item dash-nav-item--admin" title="Open CMS dashboard">
            <span className="dash-nav-icon"><FiShield aria-hidden="true" /></span>
            <span className="dash-nav-label">CMS dashboard</span>
          </a>
        )}
      </nav>

      <div className="dash-sidebar-footer">
        <Link href="/" className="dash-sidebar-home" title="Back to public site">
          <FiArrowLeft aria-hidden="true" />
          <span>Public site</span>
        </Link>
        <button type="button" onClick={handleLogout} className="dash-logout" title="Sign out">
          <FiLogOut aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
