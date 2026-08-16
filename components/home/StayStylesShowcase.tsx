"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { HomepageStayGroup } from "@/lib/lodgify/types";
import StayCollectionGrid from "./StayCollectionGrid";
import styles from "./StayStylesShowcase.module.css";

type StayStylesShowcaseProps = {
  groups: HomepageStayGroup[];
  content?: {
    heading?: string;
    is_visible?: boolean;
  };
};

export default function StayStylesShowcase({ groups, content }: StayStylesShowcaseProps) {
  const availableGroups = useMemo(() => groups.filter((group) => group.villas.length > 0), [groups]);
  const [activeGroupId, setActiveGroupId] = useState<string>(
    availableGroups[0]?.id || "short-stays",
  );
  const [isSectionVisible, setIsSectionVisible] = useState(false);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const [rotationKey, setRotationKey] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const activeGroup = availableGroups.find((group) => group.id === activeGroupId) || availableGroups[0];

  const selectGroup = useCallback((groupId: string) => {
    setActiveGroupId(groupId);
    setRotationKey((current) => current + 1);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsSectionVisible(entry.isIntersecting),
      { rootMargin: "-15% 0px -15%", threshold: 0.08 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const updateVisibility = () => setIsDocumentVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (
      reduceMotion ||
      availableGroups.length < 2 ||
      !isSectionVisible ||
      !isDocumentVisible ||
      isInteractionPaused
    ) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveGroupId((currentId) => {
        const currentIndex = availableGroups.findIndex((group) => group.id === currentId);
        return availableGroups[(currentIndex + 1) % availableGroups.length]?.id || currentId;
      });
    }, 6000);

    return () => window.clearInterval(interval);
  }, [
    availableGroups,
    isDocumentVisible,
    isInteractionPaused,
    isSectionVisible,
    reduceMotion,
    rotationKey,
  ]);

  if (!activeGroup || content?.is_visible === false) return null;

  const selectTabFromKeyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % availableGroups.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + availableGroups.length) % availableGroups.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = availableGroups.length - 1;
    else return;

    event.preventDefault();
    const nextGroup = availableGroups[nextIndex];
    selectGroup(nextGroup.id);
    window.requestAnimationFrame(() => document.getElementById(`stay-tab-${nextGroup.id}`)?.focus());
  };

  return (
    <section ref={sectionRef} className={styles.section} aria-labelledby="stay-styles-title">
      <div className={styles.shell}>
        <div className={styles.masthead}>
          <motion.header
            className={styles.header}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, transform: "translateY(24px)" }}
            whileInView={{ opacity: 1, transform: "translateY(0)" }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: reduceMotion ? 0.14 : 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h2 id="stay-styles-title">{content?.heading || "A home, not a hotel"}</h2>
          </motion.header>

          <div className={styles.navigation}>
            <div
              className={styles.tabs}
              role="tablist"
              aria-label="Choose stay style"
              onMouseEnter={() => setIsInteractionPaused(true)}
              onMouseLeave={() => setIsInteractionPaused(false)}
              onFocusCapture={() => setIsInteractionPaused(true)}
              onBlurCapture={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                  setIsInteractionPaused(false);
                }
              }}
            >
              {availableGroups.map((group, index) => {
                const isActive = group.id === activeGroup.id;
                return (
                  <button
                    type="button"
                    role="tab"
                    key={group.id}
                    id={`stay-tab-${group.id}`}
                    aria-controls={`stay-panel-${group.id}`}
                    aria-selected={isActive}
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => selectGroup(group.id)}
                    onKeyDown={(event) => selectTabFromKeyboard(event, index)}
                  >
                    {isActive ? (
                      <motion.span
                        className={styles.activeTab}
                        layoutId="stay-style-active-pill"
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: "spring", stiffness: 430, damping: 38, mass: 0.78 }
                        }
                      />
                    ) : null}
                    <span>{group.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className={styles.panel}
          role="tabpanel"
          id={`stay-panel-${activeGroup.id}`}
          aria-labelledby={`stay-tab-${activeGroup.id}`}
        >
          <AnimatePresence initial={false} mode="sync">
            <motion.div
              key={activeGroup.id}
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              transition={{ duration: reduceMotion ? 0.1 : 0.32, ease: [0.16, 1, 0.3, 1] }}
            >
              <StayCollectionGrid villas={activeGroup.villas} groupLabel={activeGroup.label} />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
