"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FiArrowLeft, FiHeart, FiHome, FiLogOut, FiUser } from "react-icons/fi";
import { useAuth } from "@/components/providers/AuthProvider";
import DashboardAvatar from "./DashboardAvatar";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: FiHome },
  { href: "/dashboard/saved", label: "Saved villas", icon: FiHeart },
  { href: "/dashboard/settings", label: "Account settings", icon: FiUser },
] as const;

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <aside className="dash-sidebar" aria-label="Account navigation">
      <Link href="/" className="dash-brand" aria-label="Summerhouses Bali home">
        <span>SUMMERHOUSES</span>
        <small>BALI</small>
      </Link>
      <Link href="/dashboard/settings" className="dash-mobile-account" aria-label="Account settings">
        <DashboardAvatar name={user?.name || "Guest"} src={user?.avatarUrl} />
      </Link>
      <nav className="dash-nav" aria-label="Dashboard pages">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link href={href} key={href} className={`dash-nav-item${active ? " is-active" : ""}`} aria-current={active ? "page" : undefined}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="dash-sidebar-footer">
        <Link href="/"><FiArrowLeft aria-hidden="true" /><span>Back to site</span></Link>
        <button type="button" onClick={handleLogout}><FiLogOut aria-hidden="true" /><span>Sign out</span></button>
      </div>
    </aside>
  );
}
