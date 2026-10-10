"use client";

import { useEffect, useId, useRef, useState } from "react";
import { resolveAccordionIndex, type ScrollDirection } from "@/lib/services/scrollAccordion";
import styles from "./ScrollDrivenAccordion.module.css";

export type ScrollAccordionItem = {
  title: string;
  text: string;
};

type ScrollDrivenAccordionProps = {
  items: ScrollAccordionItem[];
  label: string;
};

export default function ScrollDrivenAccordion({ items, label }: ScrollDrivenAccordionProps) {
  const baseId = useId().replaceAll(":", "");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndexRef = useRef(0);
  const directionRef = useRef<ScrollDirection>("down");
  const lastScrollYRef = useRef(0);
  const hasObservedRef = useRef(false);
  const manualAnchorYRef = useRef<number | null>(null);
  const keyboardFocusedRef = useRef(false);
  const lastInputRef = useRef<"keyboard" | "pointer">("pointer");
  const [activeIndex, setActiveIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    activeIndexRef.current = Math.min(activeIndex, Math.max(items.length - 1, 0));
  }, [activeIndex, items.length]);

  useEffect(() => {
    setActiveIndex((current) => Math.min(current, Math.max(items.length - 1, 0)));
  }, [items.length]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);
    updatePreference();
    mediaQuery.addEventListener("change", updatePreference);
    return () => mediaQuery.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    const markKeyboard = () => { lastInputRef.current = "keyboard"; };
    const markPointer = () => { lastInputRef.current = "pointer"; };
    document.addEventListener("keydown", markKeyboard, true);
    document.addEventListener("pointerdown", markPointer, true);
    return () => {
      document.removeEventListener("keydown", markKeyboard, true);
      document.removeEventListener("pointerdown", markPointer, true);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || items.length < 2) return;

    lastScrollYRef.current = window.scrollY;
    const updateDirection = () => {
      const nextScrollY = window.scrollY;
      if (Math.abs(nextScrollY - lastScrollYRef.current) > 2) {
        directionRef.current = nextScrollY > lastScrollYRef.current ? "down" : "up";
        lastScrollYRef.current = nextScrollY;
      }
    };
    window.addEventListener("scroll", updateDirection, { passive: true });

    const observer = new IntersectionObserver((entries) => {
      const candidates = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => ({
          index: Number((entry.target as HTMLElement).dataset.accordionIndex),
          distance: Math.abs(entry.boundingClientRect.top + entry.boundingClientRect.height / 2 - window.innerHeight * 0.5),
        }))
        .filter(({ index }) => Number.isInteger(index));

      if (!candidates.length) return;
      candidates.sort((a, b) => a.distance - b.distance);

      const nextIndex = resolveAccordionIndex({
        activeIndex: activeIndexRef.current,
        candidateIndex: candidates[0].index,
        direction: directionRef.current,
        hasObserved: hasObservedRef.current,
        keyboardFocused: keyboardFocusedRef.current,
        reducedMotion,
        manualAnchorY: manualAnchorYRef.current,
        currentScrollY: window.scrollY,
        itemCount: items.length,
      });

      hasObservedRef.current = true;
      if (manualAnchorYRef.current !== null && Math.abs(window.scrollY - manualAnchorYRef.current) >= 72) {
        manualAnchorYRef.current = null;
      }
      if (nextIndex !== activeIndexRef.current) {
        activeIndexRef.current = nextIndex;
        setActiveIndex(nextIndex);
      }
    }, { rootMargin: "-42% 0px -42% 0px", threshold: [0, 0.01, 0.5] });

    triggerRefs.current.forEach((trigger) => { if (trigger) observer.observe(trigger); });
    return () => {
      window.removeEventListener("scroll", updateDirection);
      observer.disconnect();
    };
  }, [items.length, reducedMotion]);

  const selectItem = (index: number) => {
    manualAnchorYRef.current = window.scrollY;
    activeIndexRef.current = index;
    setActiveIndex(index);
  };

  return (
    <div
      ref={rootRef}
      className={styles.accordion}
      aria-label={label}
      onFocusCapture={() => {
        keyboardFocusedRef.current = lastInputRef.current === "keyboard";
      }}
      onBlurCapture={(event) => {
        if (!rootRef.current?.contains(event.relatedTarget as Node | null)) keyboardFocusedRef.current = false;
      }}
    >
      {items.map((item, index) => {
        const isOpen = index === activeIndex;
        const triggerId = `${baseId}-trigger-${index}`;
        const panelId = `${baseId}-panel-${index}`;

        return (
          <article className={`${styles.item} ${isOpen ? styles.itemOpen : ""}`} key={`${item.title}-${index}`}>
            <button
              ref={(node) => { triggerRefs.current[index] = node; }}
              id={triggerId}
              type="button"
              className={styles.trigger}
              data-accordion-index={index}
              aria-expanded={isOpen}
              aria-controls={panelId}
              onClick={() => selectItem(index)}
            >
              <span className={styles.number} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.title}>{item.title}</span>
              <span className={styles.icon} aria-hidden="true" />
            </button>
            <div
              id={panelId}
              className={styles.panel}
              role="region"
              aria-labelledby={triggerId}
              aria-hidden={!isOpen}
              inert={!isOpen}
            >
              <div className={styles.panelInner}>
                <p className={styles.answer}>{item.text}</p>
                <div className={styles.progressTrack} aria-hidden="true">
                  <span className={styles.progressBar} />
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
