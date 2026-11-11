"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { MotionConfig as ModernMotionConfig } from "motion/react";
import { initialMotionPreference, MOTION_STORAGE_KEY, parseMotionPreference, resolveReducedMotion, type MotionPreference } from "@/lib/motion-preference";

type MotionSettings = { preference: MotionPreference; reduced: boolean; ready: boolean; setPreference: (value: MotionPreference) => void };
const Context = createContext<MotionSettings>({ preference: "system", reduced: false, ready: false, setPreference: () => {} });
export const useMotionSettings = () => useContext(Context);

export function MotionPreferenceProvider({ children }: { children: ReactNode }) {
  const [preference, setChoice] = useState<MotionPreference>("system");
  const [systemReduced, setSystemReduced] = useState(false);
  const [ready, setReady] = useState(false);
  const reduced = resolveReducedMotion(preference, systemReduced);
  useEffect(() => {
    let stored: string | null = null;
    try { stored = localStorage.getItem(MOTION_STORAGE_KEY); } catch { /* Storage may be unavailable in private contexts. */ }
    const query = new URL(location.href).searchParams.get("motion");
    setChoice(initialMotionPreference(location.hostname, stored, query));
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setSystemReduced(media.matches);
    update(); setReady(true);
    media.addEventListener("change", update);
    const sync = (event: StorageEvent) => { if (event.key === MOTION_STORAGE_KEY) setChoice(parseMotionPreference(event.newValue) ?? initialMotionPreference(location.hostname, null, null)); };
    window.addEventListener("storage", sync);
    return () => { media.removeEventListener("change", update); window.removeEventListener("storage", sync); };
  }, []);
  useLayoutEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.motion = reduced ? "reduced" : "full";
    document.documentElement.dataset.motionPreference = preference;
  }, [reduced, preference, ready]);
  const setPreference = (value: MotionPreference) => {
    setChoice(value);
    try { localStorage.setItem(MOTION_STORAGE_KEY, value); } catch { /* The choice still works for this visit. */ }
    const url = new URL(location.href);
    if (url.searchParams.has("motion")) { url.searchParams.delete("motion"); history.replaceState(history.state, "", url); }
  };
  const config = ready ? (reduced ? "always" : "never") : "user";
  return <Context.Provider value={{ preference, reduced, ready, setPreference }}><MotionConfig reducedMotion={config}><ModernMotionConfig reducedMotion={config}>{children}</ModernMotionConfig></MotionConfig></Context.Provider>;
}
