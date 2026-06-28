"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiHome, FiHeart, FiSettings, FiLogOut } from "react-icons/fi";
import { useAuth } from "@/components/providers/AuthProvider";

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
  const { logout } = useAuth();

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
            >
              <span className="dash-nav-icon">{item.icon}</span>
              <span className="dash-nav-label">{item.label}</span>
              {isActive && <span className="dash-nav-dot" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>

      <div className="dash-sidebar-footer">
        <button type="button" onClick={handleLogout} className="dash-logout">
          <FiLogOut aria-hidden="true" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
