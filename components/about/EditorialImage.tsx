"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

/** Keep managed CMS images on Next Image and recover with the section's existing asset. */
export default function EditorialImage({ src, fallbackSrc, ...props }: ImageProps & { fallbackSrc: string }) {
  const [failedSource, setFailedSource] = useState<ImageProps["src"] | null>(null);
  return <Image {...props} src={failedSource === src ? fallbackSrc : src} onError={() => setFailedSource(src)} />;
}
