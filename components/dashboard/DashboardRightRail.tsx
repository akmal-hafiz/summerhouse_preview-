"use client";

import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import { useAuth } from "@/components/providers/AuthProvider";
import ConciergeCard from "./ConciergeCard";
import DashboardAvatar from "./DashboardAvatar";

export default function DashboardRightRail() {
  const { user } = useAuth();

  return (
    <aside className="dash-rail" aria-label="Account and concierge">
      <div className="dash-profile-card">
        <DashboardAvatar name={user?.name || "Guest"} src={user?.avatarUrl} />
        <div className="dash-profile-copy">
          <p className="dash-profile-name">{user?.name || "Guest"}</p>
          <p className="dash-profile-email">{user?.email || ""}</p>
          <Link href="/dashboard/settings">Edit profile <FiArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
      <ConciergeCard />
    </aside>
  );
}
