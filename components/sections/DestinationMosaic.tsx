"use client";

import Image, { getImageProps } from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiArrowUpRight } from "react-icons/fi";
import type { BaliCollectionItem } from "@/data/baliCollections";
import { destinationMosaicImages, nextCarouselIndex, safeDestinationHref } from "@/lib/destination-carousel";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import styles from "./DestinationMosaic.module.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);
const ROTATION_MS = 6000;
const FALLBACK_IMAGE = "/homepage_villa/curated-1-main.webp";
const IMAGE_SIZES = "(max-width: 700px) 50vw, (max-width: 1000px) 45vw, 33vw";
const WIDE_IMAGE_SIZES = "(max-width: 700px) 100vw, (max-width: 1000px) 45vw, 33vw";

function MosaicPhoto({ src, alt, incoming, sizes }: { src: string; alt: string; incoming: boolean; sizes: string }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  return <div className={styles.photoLayer} data-bento-incoming={incoming || undefined} aria-hidden={!incoming || undefined}>
    <Image src={failed ? FALLBACK_IMAGE : src} alt={incoming ? alt : ""} fill sizes={sizes} quality={75}
      className={styles.image} data-loaded={loaded} onLoad={() => setLoaded(true)}
      onError={() => { if (!failed) { setFailed(true); setLoaded(false); } }} />
  </div>;
}

export default function DestinationMosaic({ collections }: { collections: BaliCollectionItem[] }) {
  const [slide, setSlide] = useState({ index: 0, previous: -1, revision: 0, manual: false });
  const [visible, setVisible] = useState(false);
  const [documentVisible, setDocumentVisible] = useState(true);
  const [interaction, setInteraction] = useState(0);
  const [keyboardFocused, setKeyboardFocused] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const selector = useRef<HTMLElement>(null);
  const tabs = useRef<Array<HTMLButtonElement | null>>([]);
  const settled = useRef(0);
  const hasIndicator = useRef(false);
  const pointer = useRef<{ id: number; x: number; y: number } | null>(null);
  const reduced = usePrefersReducedMotion();
  const index = Math.min(slide.index, Math.max(0, collections.length - 1));
  const active = collections[index];
  const previous = collections[slide.previous];
  const identity = collections.map(collection => collection.id).join("|");

  const select = useCallback((next: number, manual = true, keyboard = false) => {
    if (next < 0 || next >= collections.length) return;
    if (manual) setInteraction(current => current + 1);
    setSlide(current => next === current.index ? current : {
      index: next, previous: Math.min(settled.current, collections.length - 1), revision: current.revision + 1, manual,
    });
    if (keyboard) tabs.current[next]?.focus({ preventScroll: true });
  }, [collections.length]);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .15 });
    observer.observe(node);
    const update = () => setDocumentVisible(document.visibilityState === "visible");
    update(); document.addEventListener("visibilitychange", update);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", update); };
  }, [identity]);

  useEffect(() => {
    // Reading, hovering and selecting must not leave the carousel stopped.
    // Manual input restarts the six-second interval; hidden content waits.
    if (!visible || !documentVisible || keyboardFocused || collections.length < 2) return;
    const timer = window.setTimeout(() => select(nextCarouselIndex(index, 1, collections.length), false), ROTATION_MS);
    return () => window.clearTimeout(timer);
  }, [index, interaction, keyboardFocused, visible, documentVisible, select, collections.length, identity]);

  // Prime only the next destination, with the same responsive URLs as Next Image.
  useEffect(() => {
    if (!visible || !documentVisible || collections.length < 2) return;
    const next = collections[nextCarouselIndex(index, 1, collections.length)];
    const images = destinationMosaicImages(next).map((src, slot) => {
      const sizes = slot === 3 ? WIDE_IMAGE_SIZES : IMAGE_SIZES;
      const { props } = getImageProps({ src, alt: "", fill: true, sizes, quality: 75 });
      const image = new window.Image();
      image.sizes = sizes; image.srcset = props.srcSet ?? ""; image.src = props.src;
      return image;
    });
    return () => { images.forEach(image => { image.onload = null; image.onerror = null; }); };
  }, [index, visible, documentVisible, identity, collections]);

  // White label copies are clipped by the moving pill, keeping text legible
  // while the highlight travels between differently sized region names.
  useEffect(() => {
    const nav = selector.current;
    if (!nav || !tabs.current[index]) return;
    const measure = (animate: boolean) => {
      const tab = tabs.current[index];
      if (!tab) return;
      nav.querySelectorAll<HTMLElement>("[data-selector-copy]").forEach((copy, position) => {
        const original = tabs.current[position];
        if (original) Object.assign(copy.style, { left: `${original.offsetLeft}px`, top: `${original.offsetTop}px`, width: `${original.offsetWidth}px`, height: `${original.offsetHeight}px` });
      });
      gsap.to(nav, { "--tab-x": `${tab.offsetLeft}px`, "--tab-y": `${tab.offsetTop}px`, "--tab-w": `${tab.offsetWidth}px`, "--tab-h": `${tab.offsetHeight}px`, duration: animate && !reduced ? .65 : 0, ease: "power3.out", overwrite: true });
    };
    measure(hasIndicator.current); hasIndicator.current = true;
    let observing = false;
    const observer = new ResizeObserver(() => {
      if (!observing) { observing = true; return; }
      measure(false);
    });
    observer.observe(nav); tabs.current.forEach(tab => { if (tab) observer.observe(tab); });
    return () => { observer.disconnect(); gsap.killTweensOf(nav); };
  }, [index, identity, reduced]);

  useGSAP(() => {
    if (!root.current || !active) return;
    const incoming = root.current.querySelectorAll("[data-bento-incoming]");
    const copy = root.current.querySelector("[data-bento-copy]");
    if (!slide.revision || reduced) { gsap.set(incoming, { autoAlpha: 1, yPercent: 0, scale: 1 }); settled.current = index; return; }
    const timeline = gsap.timeline({ onComplete: () => { settled.current = index; } });
    timeline.fromTo(incoming, { autoAlpha: 0, yPercent: 3, scale: 1.035 }, { autoAlpha: 1, yPercent: 0, scale: 1, duration: .95, stagger: .06, ease: "power3.out" }, 0);
    if (copy) timeline.fromTo(copy, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .6, ease: "power3.out" }, .08);
  }, { scope: root, dependencies: [slide.revision, identity, reduced], revertOnUpdate: true });

  useGSAP(() => {
    if (reduced || !root.current) return;
    gsap.fromTo("[data-bento-cell]", { opacity: .7, y: 20 }, { opacity: 1, y: 0, duration: .85, stagger: .07, ease: "power3.out", scrollTrigger: { trigger: root.current, start: "top 86%", once: true } });
  }, { scope: root, dependencies: [reduced], revertOnUpdate: true });

  const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    let next: number | undefined;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = nextCarouselIndex(index, 1, collections.length);
    if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = nextCarouselIndex(index, -1, collections.length);
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = collections.length - 1;
    if (next === undefined || event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault(); setKeyboardFocused(true); select(next, true, true);
  };
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "touch" || pointer.current || (event.target as HTMLElement).closest("a,button")) return;
    pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  };
  const onPointerUp = (event: PointerEvent<HTMLDivElement>) => {
    const start = pointer.current;
    if (!start || start.id !== event.pointerId) return;
    pointer.current = null;
    const dx = event.clientX - start.x, dy = event.clientY - start.y;
    if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.5) select(nextCarouselIndex(index, dx < 0 ? 1 : -1, collections.length));
  };

  if (!active) return null;
  const images = destinationMosaicImages(active);
  const oldImages = previous ? destinationMosaicImages(previous) : [];
  return <div ref={root} className={styles.story} data-neighbourhood-carousel data-active-destination={active.id}
    onPointerDownCapture={() => setKeyboardFocused(false)}
    onFocusCapture={event => setKeyboardFocused((event.target as HTMLElement).matches(":focus-visible"))}
    onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setKeyboardFocused(false); }}>
    <div id="destination-panel" className={styles.mosaic} role="tabpanel" aria-labelledby={`destination-tab-${active.id}`} tabIndex={0}
      onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => { pointer.current = null; }}>
      <div className={styles.details} data-bento-cell>
        <div className={styles.copy} data-bento-copy aria-live={slide.manual ? "polite" : "off"} aria-atomic="true">
          <h3>{active.location}</h3><p>{active.description}</p>
        </div>
        <Link href={safeDestinationHref(active.href, active.location)} className={styles.explore} aria-label={`Explore villas in ${active.location}`}>
          Explore villas<FiArrowUpRight aria-hidden="true" />
        </Link>
      </div>
      {images.map((src, slot) => <div key={slot} className={`${styles.imageFrame} ${[styles.mainFrame, styles.topFrame, styles.leftFrame, styles.bottomFrame][slot]}`} data-bento-cell>
        {previous && previous.id !== active.id ? <MosaicPhoto key={`${previous.id}-${slot}-${oldImages[slot]}`} src={oldImages[slot]} alt="" incoming={false} sizes={slot === 3 ? WIDE_IMAGE_SIZES : IMAGE_SIZES} /> : null}
        <MosaicPhoto key={`${active.id}-${slot}-${src}`} src={src} alt={slot === 0 ? active.imageAlt || `A villa in ${active.location}` : ""} incoming sizes={slot === 3 ? WIDE_IMAGE_SIZES : IMAGE_SIZES} />
      </div>)}
    </div>
    <div className={styles.controls}>
      <nav ref={selector} className={styles.index} role="tablist" aria-label="Choose a Bali neighbourhood" onKeyDown={onKeyDown}>
        {collections.map((collection, itemIndex) => <button key={collection.id} ref={node => { tabs.current[itemIndex] = node; }}
          id={`destination-tab-${collection.id}`} type="button" role="tab" tabIndex={index === itemIndex ? 0 : -1} aria-selected={index === itemIndex}
          aria-controls="destination-panel" className={styles.indexItem} onClick={event => select(itemIndex, true, event.detail === 0)}>
          <span>{collection.location}</span>
        </button>)}
        <span className={styles.highlight} aria-hidden="true"><span className={styles.highlightLabels}>
          {collections.map(collection => <span key={collection.id} className={styles.highlightLabel} data-selector-copy>{collection.location}</span>)}
        </span></span>
      </nav>
    </div>
  </div>;
}
