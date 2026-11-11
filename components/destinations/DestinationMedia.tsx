"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type DestinationMediaProps = {
  type?: "image" | "video";
  image: string;
  video?: string | null;
  poster?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export default function DestinationMedia({
  type = "image",
  image,
  video,
  poster,
  alt,
  className,
  priority = false,
  sizes = "100vw",
}: DestinationMediaProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (prefersReducedMotion) {
      videoElement.pause();
      return;
    }

    void videoElement.play().catch(() => undefined);
  }, [prefersReducedMotion]);

  if (type === "video" && video && !prefersReducedMotion) {
    return (
      <video
        ref={videoRef}
        className={className}
        poster={poster || image}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={alt}
      >
        <source src={video} />
      </video>
    );
  }

  return (
    <Image
      src={poster || image}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
    />
  );
}
