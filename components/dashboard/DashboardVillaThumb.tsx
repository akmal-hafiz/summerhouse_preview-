"use client";

import { useState } from "react";
import { FiImage } from "react-icons/fi";

type DashboardVillaThumbProps = {
  src?: string | null;
  alt: string;
};

export default function DashboardVillaThumb({ src, alt }: DashboardVillaThumbProps) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    <span className="dash-villa-thumb-fallback" aria-hidden="true">
      <FiImage />
    </span>
  );
}
