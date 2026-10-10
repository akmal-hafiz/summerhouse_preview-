import "@/components/dashboard/dashboard.css";
import type { ReactNode } from "react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardRightRail from "@/components/dashboard/DashboardRightRail";
import DashboardGuard from "@/components/dashboard/DashboardGuard";

export const metadata = {
  title: "Dashboard | Summerhouses Bali",
  description: "Member area for saved villas, account settings, and concierge contact.",
};

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="dash-shell">
      <DashboardGuard>
        <div className="dash-layout">
          <DashboardSidebar />
          <main className="dash-main">{children}</main>
          <DashboardRightRail />
        </div>
      </DashboardGuard>
    </div>
  );
}
