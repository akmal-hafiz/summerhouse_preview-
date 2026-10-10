"use client";

import { useEffect, useState } from "react";

type Props = { name: string; src?: string | null; className?: string };

export default function DashboardAvatar({ name, src, className = "" }: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0] || "").join("").toUpperCase() || "G";

  return (
    <span className={`dash-profile-avatar ${className}`} aria-label={`Profile photo for ${name}`}>
      {src && !failed ? <img src={src} alt="" onError={() => setFailed(true)} /> : initials}
    </span>
  );
}
