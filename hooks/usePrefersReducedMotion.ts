"use client";

import { useMotionSettings } from "@/components/providers/MotionPreferenceProvider";

/**
 * SSR-safe reduced-motion hook. Returns false during SSR/first paint, then
 * resolves the shared visitor preference against the device setting on mount.
 */
export function usePrefersReducedMotion(): boolean {
  return useMotionSettings().reduced;
}
