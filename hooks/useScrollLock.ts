"use client";

import { useEffect } from "react";
import { useLenis } from "@studio-freight/react-lenis";

export function useScrollLock(isLocked: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!isLocked) return;

    if (lenis) {
      lenis.stop();
    }

    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    document.body.classList.add("is-scroll-locked");
    document.documentElement.classList.add("is-scroll-locked");

    return () => {
      if (lenis) {
        lenis.start();
      }
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.classList.remove("is-scroll-locked");
      document.documentElement.classList.remove("is-scroll-locked");
    };
  }, [isLocked, lenis]);
}
