"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { useGesture } from "@use-gesture/react";
import { safeHttpHref } from "@/lib/safe-url";

type ImageItem =
  | string
  | {
      src: string;
      alt?: string;
      propertyId?: string | number;
      propertyName?: string;
      city?: string;
      href?: string;
    };

type DomeGalleryProps = {
  images?: ImageItem[];
  fit?: number;
  fitBasis?: "auto" | "min" | "max" | "width" | "height";
  minRadius?: number;
  maxRadius?: number;
  padFactor?: number;
  overlayBlurColor?: string;
  maxVerticalRotationDeg?: number;
  dragSensitivity?: number;
  enlargeTransitionMs?: number;
  segments?: number;
  dragDampening?: number;
  /** Max width of the selected-image viewer. Soft cap only — never forces the image's own aspect ratio. */
  viewerMaxWidth?: string;
  /** Max height of the selected-image viewer. Soft cap only — never forces the image's own aspect ratio. */
  viewerMaxHeight?: string;
  imageBorderRadius?: string;
  openedImageBorderRadius?: string;
  grayscale?: boolean;
};

type ItemDef = {
  src: string;
  alt: string;
  propertyId?: string | number;
  propertyName?: string;
  city?: string;
  href?: string;
  x: number;
  y: number;
  sizeX: number;
  sizeY: number;
};

const DEFAULT_IMAGES: ImageItem[] = [
  { src: "/homepage_villa/curated-1-main.webp", alt: "Summerhouses villa interior" },
  { src: "/homepage_villa/curated-4-view.webp", alt: "Summerhouses villa pool view" },
  { src: "/homepage_villa/curated-6-exterior.webp", alt: "Summerhouses villa exterior" },
  { src: "/homepage_villa/villaarta.webp", alt: "Summerhouses Bali villa" },
  { src: "/homepage_villa/CactusEstate.webp", alt: "Summerhouses Cactus Estate" },
  { src: "/homepage_villa/88east.webp", alt: "Summerhouses 88 East villa" },
];

const DEFAULTS = {
  maxVerticalRotationDeg: 5,
  dragSensitivity: 20,
  enlargeTransitionMs: 300,
  segments: 35,
};

const REDUCED_MOTION_TRANSITION_MS = 120;
const FALLBACK_MARK_SRC = "/SUMMERHOUSE_LOGO_PROJECT_1.svg";

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), max);
const normalizeAngle = (d: number) => ((d % 360) + 360) % 360;
const wrapAngleSigned = (deg: number) => {
  const a = (((deg + 180) % 360) + 360) % 360;
  return a - 180;
};
const getDataNumber = (el: HTMLElement, name: string, fallback: number) => {
  const attr = el.dataset[name] ?? el.getAttribute(`data-${name}`);
  const n = attr == null ? NaN : parseFloat(attr);
  return Number.isFinite(n) ? n : fallback;
};
const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function normalizeImageItem(image: ImageItem) {
  if (typeof image === "string") {
    return { src: image, alt: "", propertyId: undefined, propertyName: undefined, city: undefined, href: undefined };
  }
  return {
    src: image.src || "",
    alt: image.alt || "",
    propertyId: image.propertyId,
    propertyName: image.propertyName,
    city: image.city,
    href: image.href,
  };
}

function buildItems(pool: ImageItem[], seg: number): ItemDef[] {
  const xCols = Array.from({ length: seg }, (_, i) => -37 + i * 2);
  const evenYs = [-4, -2, 0, 2, 4];
  const oddYs = [-3, -1, 1, 3, 5];

  const coords = xCols.flatMap((x, c) => {
    const ys = c % 2 === 0 ? evenYs : oddYs;
    return ys.map((y) => ({ x, y, sizeX: 2, sizeY: 2 }));
  });

  const totalSlots = coords.length;
  if (pool.length === 0) {
    return coords.map((c) => ({ ...c, src: "", alt: "" }));
  }

  const normalizedImages = pool.map(normalizeImageItem);
  const usedImages = Array.from({ length: totalSlots }, (_, i) => normalizedImages[i % normalizedImages.length]);

  for (let i = 1; i < usedImages.length; i++) {
    if (usedImages[i].src === usedImages[i - 1].src) {
      for (let j = i + 1; j < usedImages.length; j++) {
        if (usedImages[j].src !== usedImages[i].src) {
          const tmp = usedImages[i];
          usedImages[i] = usedImages[j];
          usedImages[j] = tmp;
          break;
        }
      }
    }
  }

  return coords.map((c, i) => ({
    ...c,
    ...usedImages[i],
  }));
}

function computeItemBaseRotation(offsetX: number, offsetY: number, sizeX: number, sizeY: number, segments: number) {
  const unit = 360 / segments / 2;
  const rotateY = unit * (offsetX + (sizeX - 1) / 2);
  const rotateX = unit * (offsetY - (sizeY - 1) / 2);
  return { rotateX, rotateY };
}

function DomeTile({ src, alt, priority }: { src: string; alt: string; priority: boolean }) {
  const [status, setStatus] = useState<"loading" | "loaded" | "error">(src ? "loading" : "error");

  return (
    <>
      {src && status !== "error" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          draggable={false}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className="pointer-events-none"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center",
            backfaceVisibility: "hidden",
            filter: "var(--image-filter, none)",
            opacity: status === "loaded" ? 1 : 0,
            transition: "opacity 420ms ease",
          }}
        />
      )}
      {status === "error" && (
        <div className="item__image-fallback" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={FALLBACK_MARK_SRC} alt="" draggable={false} className="item__image-fallback-mark" />
        </div>
      )}
    </>
  );
}

export default function DomeGallery({
  images = DEFAULT_IMAGES,
  fit = 0.5,
  fitBasis = "auto",
  minRadius = 600,
  maxRadius = Infinity,
  padFactor = 0.25,
  overlayBlurColor = "var(--color-surface-dark)",
  maxVerticalRotationDeg = DEFAULTS.maxVerticalRotationDeg,
  dragSensitivity = DEFAULTS.dragSensitivity,
  enlargeTransitionMs = DEFAULTS.enlargeTransitionMs,
  segments = DEFAULTS.segments,
  dragDampening = 2,
  viewerMaxWidth = "1200px",
  viewerMaxHeight = "820px",
  imageBorderRadius = "30px",
  openedImageBorderRadius = "24px",
  grayscale = true,
}: DomeGalleryProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mainRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const focusedElRef = useRef<HTMLElement | null>(null);
  const originalTilePositionRef = useRef<{ left: number; top: number; width: number; height: number } | null>(null);

  const rotationRef = useRef({ x: 0, y: 0 });
  const startRotRef = useRef({ x: 0, y: 0 });
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const draggingRef = useRef(false);
  const cancelTapRef = useRef(false);
  const movedRef = useRef(false);
  const inertiaRAF = useRef<number | null>(null);
  const pointerTypeRef = useRef<"mouse" | "pen" | "touch">("mouse");
  const tapTargetRef = useRef<HTMLElement | null>(null);
  const openingRef = useRef(false);
  const openStartedAtRef = useRef(0);
  const lastDragEndAt = useRef(0);
  const scrollLockedRef = useRef(false);
  const lockedRadiusRef = useRef<number | null>(null);

  const lockScroll = useCallback(() => {
    if (scrollLockedRef.current) return;
    scrollLockedRef.current = true;
    document.body.classList.add("dg-scroll-lock");
  }, []);

  const unlockScroll = useCallback(() => {
    if (!scrollLockedRef.current) return;
    if (rootRef.current?.getAttribute("data-enlarging") === "true") return;
    scrollLockedRef.current = false;
    document.body.classList.remove("dg-scroll-lock");
  }, []);

  const items = useMemo(() => buildItems(images, segments), [images, segments]);
  const priorityKeys = useMemo(() => {
    const keys = new Set<string>();
    items.forEach((item) => {
      if (Math.abs(item.x) <= 4 && Math.abs(item.y) <= 2) keys.add(`${item.x},${item.y}`);
    });
    return keys;
  }, [items]);

  const applyTransform = useCallback((xDeg: number, yDeg: number) => {
    const el = sphereRef.current;
    if (el) {
      el.style.transform = `translateZ(calc(var(--radius) * -1)) rotateX(${xDeg}deg) rotateY(${yDeg}deg)`;
    }
  }, []);

  const stopInertia = useCallback(() => {
    if (inertiaRAF.current) {
      cancelAnimationFrame(inertiaRAF.current);
      inertiaRAF.current = null;
    }
  }, []);

  const startInertia = useCallback(
    (vx: number, vy: number) => {
      const MAX_V = 1.4;
      let vX = clamp(vx, -MAX_V, MAX_V) * 80;
      let vY = clamp(vy, -MAX_V, MAX_V) * 80;
      let frames = 0;
      const d = clamp(dragDampening ?? 0.6, 0, 1);
      const frictionMul = 0.94 + 0.055 * d;
      const stopThreshold = 0.015 - 0.01 * d;
      const maxFrames = Math.round(90 + 270 * d);
      const step = () => {
        vX *= frictionMul;
        vY *= frictionMul;
        if (Math.abs(vX) < stopThreshold && Math.abs(vY) < stopThreshold) {
          inertiaRAF.current = null;
          return;
        }
        if (++frames > maxFrames) {
          inertiaRAF.current = null;
          return;
        }
        const nextX = clamp(rotationRef.current.x - vY / 200, -maxVerticalRotationDeg, maxVerticalRotationDeg);
        const nextY = wrapAngleSigned(rotationRef.current.y + vX / 200);
        rotationRef.current = { x: nextX, y: nextY };
        applyTransform(nextX, nextY);
        inertiaRAF.current = requestAnimationFrame(step);
      };
      stopInertia();
      inertiaRAF.current = requestAnimationFrame(step);
    },
    [applyTransform, dragDampening, maxVerticalRotationDeg, stopInertia],
  );

  const focusTrapHandlerRef = useRef<((e: KeyboardEvent) => void) | null>(null);

  const openItemFromElement = useCallback(
    (el: HTMLElement) => {
      if (openingRef.current) return;
      openingRef.current = true;
      openStartedAtRef.current = performance.now();
      lockScroll();
      const parent = el.parentElement as HTMLElement;
      focusedElRef.current = el;
      el.setAttribute("data-focused", "true");
      const offsetX = getDataNumber(parent, "offsetX", 0);
      const offsetY = getDataNumber(parent, "offsetY", 0);
      const sizeX = getDataNumber(parent, "sizeX", 2);
      const sizeY = getDataNumber(parent, "sizeY", 2);
      const parentRot = computeItemBaseRotation(offsetX, offsetY, sizeX, sizeY, segments);
      const parentY = normalizeAngle(parentRot.rotateY);
      const globalY = normalizeAngle(rotationRef.current.y);
      let rotY = -(parentY + globalY) % 360;
      if (rotY < -180) rotY += 360;
      const rotX = -parentRot.rotateX - rotationRef.current.x;
      parent.style.setProperty("--rot-y-delta", `${rotY}deg`);
      parent.style.setProperty("--rot-x-delta", `${rotX}deg`);

      const refDiv = document.createElement("div");
      refDiv.className = "item__image item__image--reference opacity-0";
      refDiv.style.transform = `rotateX(${-parentRot.rotateX}deg) rotateY(${-parentRot.rotateY}deg)`;
      parent.appendChild(refDiv);

      void refDiv.offsetHeight;

      const tileR = refDiv.getBoundingClientRect();
      const mainR = mainRef.current?.getBoundingClientRect();
      const frameR = frameRef.current?.getBoundingClientRect();

      if (!mainR || !frameR || tileR.width <= 0 || tileR.height <= 0) {
        openingRef.current = false;
        focusedElRef.current = null;
        parent.removeChild(refDiv);
        unlockScroll();
        return;
      }

      originalTilePositionRef.current = {
        left: tileR.left,
        top: tileR.top,
        width: tileR.width,
        height: tileR.height,
      };
      el.style.visibility = "hidden";
      el.style.zIndex = "0";

      const reducedMotion = prefersReducedMotion();
      const transitionMs = reducedMotion ? REDUCED_MOTION_TRANSITION_MS : enlargeTransitionMs;

      const overlay = document.createElement("div");
      overlay.className = "enlarge";
      overlay.style.cssText = `position:absolute; left:${frameR.left - mainR.left}px; top:${frameR.top - mainR.top}px; width:${frameR.width}px; height:${frameR.height}px; opacity:0; z-index:30; will-change:transform,opacity; transform-origin:top left; transition:transform ${transitionMs}ms cubic-bezier(0.22,1,0.36,1), opacity ${transitionMs}ms cubic-bezier(0.22,1,0.36,1); border-radius:${openedImageBorderRadius};`;

      const rawSrc = parent.dataset.src || (el.querySelector("img") as HTMLImageElement)?.src || "";
      const rawAlt = parent.dataset.alt || (el.querySelector("img") as HTMLImageElement)?.alt || "";
      const propertyName = parent.dataset.propertyName || "";
      const propertyCity = parent.dataset.city || "";
      const propertyHref = safeHttpHref(parent.dataset.href, "");

      const mediaWrap = document.createElement("div");
      mediaWrap.className = "enlarge__media";
      if (rawSrc) {
        const img = document.createElement("img");
        img.src = rawSrc;
        img.alt = rawAlt;
        img.className = "enlarge__img";
        img.style.filter = grayscale ? "grayscale(1)" : "none";
        mediaWrap.appendChild(img);
      }
      overlay.appendChild(mediaWrap);

      const displayTitle = propertyName || (rawAlt || "Summerhouse").replace(/^Summerhouses?\s*/i, "").trim() || "Summerhouse";
      const displayMeta = propertyCity ? `Summerhouse · ${propertyCity}` : "Summerhouse · Bali";

      const info = document.createElement("div");
      info.className = "enlarge__info";
      const infoText = document.createElement("div");
      infoText.className = "enlarge__info-text";
      const eyebrow = document.createElement("span");
      eyebrow.className = "enlarge__info-eyebrow";
      eyebrow.textContent = "Selected space";
      const title = document.createElement("span");
      title.className = "enlarge__info-title";
      title.textContent = displayTitle;
      const meta = document.createElement("span");
      meta.className = "enlarge__info-meta";
      meta.textContent = displayMeta;
      infoText.append(eyebrow, title, meta);
      info.appendChild(infoText);
      if (propertyHref) {
        const link = document.createElement("a");
        link.href = propertyHref;
        link.className = "enlarge__info-link";
        link.textContent = "View property";
        info.appendChild(link);
      }
      overlay.appendChild(info);

      const closeBtn = document.createElement("button");
      closeBtn.type = "button";
      closeBtn.setAttribute("aria-label", "Close selected property");
      closeBtn.className = "enlarge__close";
      closeBtn.textContent = "x";
      closeBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        scrimRef.current?.click();
      });
      overlay.appendChild(closeBtn);

      viewerRef.current?.appendChild(overlay);

      const focusableEls = Array.from(overlay.querySelectorAll<HTMLElement>("button, a[href]"));
      const trapHandler = (e: KeyboardEvent) => {
        if (e.key !== "Tab" || focusableEls.length === 0) return;
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      focusTrapHandlerRef.current = trapHandler;
      overlay.addEventListener("keydown", trapHandler);

      requestAnimationFrame(() => {
        info.style.opacity = "1";
        info.style.transform = "translateY(0)";
        closeBtn.style.opacity = "1";
        closeBtn.focus();
      });

      const tx0 = tileR.left - frameR.left;
      const ty0 = tileR.top - frameR.top;
      const sx0 = tileR.width / frameR.width;
      const sy0 = tileR.height / frameR.height;
      const validSx0 = Number.isFinite(sx0) && sx0 > 0 ? sx0 : 1;
      const validSy0 = Number.isFinite(sy0) && sy0 > 0 ? sy0 : 1;

      overlay.style.transform = `translate(${tx0}px, ${ty0}px) scale(${validSx0}, ${validSy0})`;
      setTimeout(() => {
        if (!overlay.parentElement) return;
        overlay.style.opacity = "1";
        overlay.style.transform = "translate(0px, 0px) scale(1, 1)";
        rootRef.current?.setAttribute("data-enlarging", "true");
      }, 16);
    },
    [enlargeTransitionMs, grayscale, lockScroll, openedImageBorderRadius, segments, unlockScroll],
  );

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      const w = Math.max(1, cr.width);
      const h = Math.max(1, cr.height);
      const minDim = Math.min(w, h);
      const maxDim = Math.max(w, h);
      const aspect = w / h;
      let basis: number;
      switch (fitBasis) {
        case "min":
          basis = minDim;
          break;
        case "max":
          basis = maxDim;
          break;
        case "width":
          basis = w;
          break;
        case "height":
          basis = h;
          break;
        default:
          basis = aspect >= 1.3 ? w : minDim;
      }
      let radius = basis * fit;
      const heightGuard = h * 1.35;
      radius = Math.min(radius, heightGuard);
      radius = clamp(radius, minRadius, maxRadius);
      lockedRadiusRef.current = Math.round(radius);

      const viewerPad = Math.max(8, Math.round(minDim * padFactor));
      root.style.setProperty("--radius", `${lockedRadiusRef.current}px`);
      root.style.setProperty("--viewer-pad", `${viewerPad}px`);
      root.style.setProperty("--overlay-blur-color", overlayBlurColor);
      root.style.setProperty("--tile-radius", imageBorderRadius);
      root.style.setProperty("--enlarge-radius", openedImageBorderRadius);
      root.style.setProperty("--viewer-max-w", viewerMaxWidth);
      root.style.setProperty("--viewer-max-h", viewerMaxHeight);
      root.style.setProperty("--image-filter", grayscale ? "grayscale(1)" : "none");
      applyTransform(rotationRef.current.x, rotationRef.current.y);

      const enlargedOverlay = viewerRef.current?.querySelector(".enlarge") as HTMLElement | null;
      if (enlargedOverlay && frameRef.current && mainRef.current) {
        const frameR = frameRef.current.getBoundingClientRect();
        const mainR = mainRef.current.getBoundingClientRect();
        enlargedOverlay.style.left = `${frameR.left - mainR.left}px`;
        enlargedOverlay.style.top = `${frameR.top - mainR.top}px`;
        enlargedOverlay.style.width = `${frameR.width}px`;
        enlargedOverlay.style.height = `${frameR.height}px`;
      }
    });
    ro.observe(root);
    return () => ro.disconnect();
  }, [
    applyTransform,
    fit,
    fitBasis,
    minRadius,
    maxRadius,
    padFactor,
    overlayBlurColor,
    grayscale,
    imageBorderRadius,
    openedImageBorderRadius,
    viewerMaxWidth,
    viewerMaxHeight,
  ]);

  useEffect(() => {
    applyTransform(rotationRef.current.x, rotationRef.current.y);
  }, [applyTransform]);

  useGesture(
    {
      onDragStart: ({ event }) => {
        if (focusedElRef.current) return;
        stopInertia();

        const evt = event as PointerEvent;
        pointerTypeRef.current = (evt.pointerType as "mouse" | "pen" | "touch") || "mouse";
        if (pointerTypeRef.current === "touch") evt.preventDefault();
        if (pointerTypeRef.current === "touch") lockScroll();
        draggingRef.current = true;
        cancelTapRef.current = false;
        movedRef.current = false;
        startRotRef.current = { ...rotationRef.current };
        startPosRef.current = { x: evt.clientX, y: evt.clientY };
        const potential = (evt.target as Element).closest?.(".item__image") as HTMLElement | null;
        tapTargetRef.current = potential || null;
        if (mainRef.current) mainRef.current.style.cursor = "grabbing";
      },
      onDrag: ({ event, last, velocity: velArr = [0, 0], direction: dirArr = [0, 0], movement }) => {
        if (focusedElRef.current || !draggingRef.current || !startPosRef.current) return;

        const evt = event as PointerEvent;
        if (pointerTypeRef.current === "touch") evt.preventDefault();

        const dxTotal = evt.clientX - startPosRef.current.x;
        const dyTotal = evt.clientY - startPosRef.current.y;

        if (!movedRef.current) {
          const dist2 = dxTotal * dxTotal + dyTotal * dyTotal;
          if (dist2 > 16) movedRef.current = true;
        }

        const nextX = clamp(startRotRef.current.x - dyTotal / dragSensitivity, -maxVerticalRotationDeg, maxVerticalRotationDeg);
        const nextY = startRotRef.current.y + dxTotal / dragSensitivity;

        const cur = rotationRef.current;
        if (cur.x !== nextX || cur.y !== nextY) {
          rotationRef.current = { x: nextX, y: nextY };
          applyTransform(nextX, nextY);
        }

        if (last) {
          draggingRef.current = false;
          if (mainRef.current) mainRef.current.style.cursor = "grab";
          let isTap = false;

          if (startPosRef.current) {
            const dx = evt.clientX - startPosRef.current.x;
            const dy = evt.clientY - startPosRef.current.y;
            const dist2 = dx * dx + dy * dy;
            const TAP_THRESH_PX = pointerTypeRef.current === "touch" ? 10 : 6;
            if (dist2 <= TAP_THRESH_PX * TAP_THRESH_PX) isTap = true;
          }

          let [vMagX, vMagY] = velArr;
          const [dirX, dirY] = dirArr;
          let vx = vMagX * dirX;
          let vy = vMagY * dirY;

          if (!isTap && Math.abs(vx) < 0.001 && Math.abs(vy) < 0.001 && Array.isArray(movement)) {
            const [mx, my] = movement;
            vx = (mx / dragSensitivity) * 0.02;
            vy = (my / dragSensitivity) * 0.02;
          }

          if (!isTap && !prefersReducedMotion() && (Math.abs(vx) > 0.005 || Math.abs(vy) > 0.005)) {
            startInertia(vx, vy);
          }
          startPosRef.current = null;
          cancelTapRef.current = !isTap;

          if (isTap && tapTargetRef.current && !focusedElRef.current) {
            openItemFromElement(tapTargetRef.current);
          }
          tapTargetRef.current = null;

          if (cancelTapRef.current) setTimeout(() => (cancelTapRef.current = false), 120);
          if (pointerTypeRef.current === "touch") unlockScroll();
          if (movedRef.current) lastDragEndAt.current = performance.now();
          movedRef.current = false;
        }
      },
    },
    { target: mainRef, eventOptions: { passive: false } },
  );

  useEffect(() => {
    const scrim = scrimRef.current;
    if (!scrim) return;

    const close = () => {
      if (performance.now() - openStartedAtRef.current < 250) return;
      const el = focusedElRef.current;
      if (!el) return;
      const parent = el.parentElement as HTMLElement;
      const overlay = viewerRef.current?.querySelector(".enlarge") as HTMLElement | null;
      if (!overlay) return;

      if (focusTrapHandlerRef.current) {
        overlay.removeEventListener("keydown", focusTrapHandlerRef.current);
        focusTrapHandlerRef.current = null;
      }

      const reducedMotion = prefersReducedMotion();
      const transitionMs = reducedMotion ? REDUCED_MOTION_TRANSITION_MS : enlargeTransitionMs;

      const refDiv = parent.querySelector(".item__image--reference") as HTMLElement | null;
      const originalPos = originalTilePositionRef.current;
      const restoreFocus = () => el.focus();

      if (!originalPos) {
        overlay.remove();
        refDiv?.remove();
        parent.style.setProperty("--rot-y-delta", "0deg");
        parent.style.setProperty("--rot-x-delta", "0deg");
        el.style.visibility = "";
        el.style.zIndex = "0";
        focusedElRef.current = null;
        rootRef.current?.removeAttribute("data-enlarging");
        openingRef.current = false;
        restoreFocus();
        return;
      }

      const currentRect = overlay.getBoundingClientRect();
      const rootRect = rootRef.current!.getBoundingClientRect();
      const originalPosRelativeToRoot = {
        left: originalPos.left - rootRect.left,
        top: originalPos.top - rootRect.top,
        width: originalPos.width,
        height: originalPos.height,
      };
      const overlayRelativeToRoot = {
        left: currentRect.left - rootRect.left,
        top: currentRect.top - rootRect.top,
        width: currentRect.width,
        height: currentRect.height,
      };

      const animatingOverlay = document.createElement("div");
      animatingOverlay.className = "enlarge-closing";
      animatingOverlay.style.cssText = `position:absolute; left:${overlayRelativeToRoot.left}px; top:${overlayRelativeToRoot.top}px; width:${overlayRelativeToRoot.width}px; height:${overlayRelativeToRoot.height}px; z-index:9999; border-radius:${openedImageBorderRadius}; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,.35); transition:all ${transitionMs}ms ease-out; pointer-events:none; margin:0; transform:none; filter:${grayscale ? "grayscale(1)" : "none"};`;

      const originalImg = overlay.querySelector(".enlarge__img");
      if (originalImg) {
        const img = originalImg.cloneNode() as HTMLImageElement;
        img.style.cssText = "width: 100%; height: 100%; object-fit: contain;";
        animatingOverlay.appendChild(img);
      }

      overlay.remove();
      rootRef.current!.appendChild(animatingOverlay);
      void animatingOverlay.getBoundingClientRect();

      requestAnimationFrame(() => {
        animatingOverlay.style.left = `${originalPosRelativeToRoot.left}px`;
        animatingOverlay.style.top = `${originalPosRelativeToRoot.top}px`;
        animatingOverlay.style.width = `${originalPosRelativeToRoot.width}px`;
        animatingOverlay.style.height = `${originalPosRelativeToRoot.height}px`;
        animatingOverlay.style.opacity = "0";
      });

      const cleanup = () => {
        animatingOverlay.remove();
        originalTilePositionRef.current = null;
        refDiv?.remove();
        parent.style.transition = "none";
        el.style.transition = "none";
        parent.style.setProperty("--rot-y-delta", "0deg");
        parent.style.setProperty("--rot-x-delta", "0deg");

        requestAnimationFrame(() => {
          el.style.visibility = "";
          el.style.opacity = "0";
          el.style.zIndex = "0";
          focusedElRef.current = null;
          rootRef.current?.removeAttribute("data-enlarging");

          requestAnimationFrame(() => {
            parent.style.transition = "";
            el.style.transition = "opacity 300ms ease-out";

            requestAnimationFrame(() => {
              el.style.opacity = "1";
              setTimeout(() => {
                el.style.transition = "";
                el.style.opacity = "";
                openingRef.current = false;
                if (!draggingRef.current && rootRef.current?.getAttribute("data-enlarging") !== "true") {
                  document.body.classList.remove("dg-scroll-lock");
                }
                restoreFocus();
              }, 300);
            });
          });
        });
      };

      animatingOverlay.addEventListener("transitionend", cleanup, { once: true });
    };

    scrim.addEventListener("click", close);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      scrim.removeEventListener("click", close);
      window.removeEventListener("keydown", onKey);
    };
  }, [enlargeTransitionMs, openedImageBorderRadius, grayscale]);

  useEffect(() => {
    return () => {
      document.body.classList.remove("dg-scroll-lock");
    };
  }, []);

  const cssStyles = `
    .sphere-root {
      --radius: 520px;
      --viewer-pad: 72px;
      --circ: calc(var(--radius) * 3.14);
      --rot-y: calc((360deg / var(--segments-x)) / 2);
      --rot-x: calc((360deg / var(--segments-y)) / 2);
      --item-width: calc(var(--circ) / var(--segments-x));
      --item-height: calc(var(--circ) / var(--segments-y));
    }
    .sphere-root * { box-sizing: border-box; }
    .sphere, .sphere-item, .item__image { transform-style: preserve-3d; }
    .stage {
      width: 100%;
      height: 100%;
      display: grid;
      place-items: center;
      position: absolute;
      inset: 0;
      margin: auto;
      perspective: calc(var(--radius) * 2);
      perspective-origin: 50% 50%;
    }
    .sphere {
      transform: translateZ(calc(var(--radius) * -1));
      will-change: transform;
      position: absolute;
    }
    .sphere-item {
      width: calc(var(--item-width) * var(--item-size-x));
      height: calc(var(--item-height) * var(--item-size-y));
      position: absolute;
      top: -999px;
      bottom: -999px;
      left: -999px;
      right: -999px;
      margin: auto;
      transform-origin: 50% 50%;
      backface-visibility: hidden;
      transition: transform 300ms;
      transform: rotateY(calc(var(--rot-y) * (var(--offset-x) + ((var(--item-size-x) - 1) / 2)) + var(--rot-y-delta, 0deg)))
        rotateX(calc(var(--rot-x) * (var(--offset-y) - ((var(--item-size-y) - 1) / 2)) + var(--rot-x-delta, 0deg)))
        translateZ(var(--radius));
    }
    .sphere-root[data-enlarging="true"] .scrim {
      opacity: 1 !important;
      pointer-events: all !important;
    }
    .item__image {
      position: absolute;
      inset: 10px;
      border-radius: var(--tile-radius, 12px);
      overflow: hidden;
      cursor: pointer;
      backface-visibility: hidden;
      -webkit-backface-visibility: hidden;
      transition: transform 380ms cubic-bezier(0.22, 1, 0.36, 1),
        box-shadow 380ms cubic-bezier(0.22, 1, 0.36, 1);
      pointer-events: auto;
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      background: var(--color-surface-warm);
      box-shadow: inset 0 0 0 1px rgba(23, 23, 21, 0.06);
    }
    .item__image::after {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      border-radius: inherit;
      box-shadow: inset 0 0 0 1px rgba(255, 254, 250, 0.35);
    }
    .item__image:hover {
      transform: translateZ(0) scale(1.04);
      box-shadow: inset 0 0 0 1px rgba(23, 23, 21, 0.08),
        0 18px 40px -22px rgba(23, 23, 21, 0.4);
    }
    .item__image:focus-visible {
      outline: none;
      box-shadow: inset 0 0 0 1px rgba(23, 23, 21, 0.08),
        0 0 0 3px var(--about-green, var(--color-brand)),
        0 18px 40px -22px rgba(23, 23, 21, 0.4);
    }
    .item__image--reference {
      position: absolute;
      inset: 10px;
      pointer-events: none;
    }
    .item__image-fallback {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--color-surface-warm);
    }
    .item__image-fallback-mark {
      width: 28%;
      max-width: 40px;
      height: auto;
      opacity: 0.32;
    }
    .enlarge {
      display: flex;
      flex-direction: column;
      background: rgba(246, 244, 239, 0.62);
      backdrop-filter: blur(20px) saturate(1.05);
      -webkit-backdrop-filter: blur(20px) saturate(1.05);
      box-shadow: 0 30px 70px -24px rgba(23, 23, 21, 0.4), 0 8px 20px -10px rgba(23, 23, 21, 0.18);
      overflow: hidden;
    }
    .enlarge__media {
      flex: 1 1 auto;
      min-height: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: clamp(14px, 2vw, 24px) clamp(14px, 2vw, 24px) 0;
    }
    .enlarge__img {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;
      border-radius: 12px;
      display: block;
    }
    .enlarge__info {
      flex: 0 0 auto;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 12px;
      padding: 14px clamp(16px, 2vw, 24px) clamp(14px, 2vw, 20px);
      opacity: 0;
      transform: translateY(6px);
      transition: opacity 320ms ease, transform 320ms ease;
    }
    .enlarge__info-text {
      display: flex;
      flex-direction: column;
      gap: 2px;
      min-width: 0;
    }
    .enlarge__info-eyebrow {
      font-family: var(--font-dm-sans, system-ui, sans-serif);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
      color: var(--about-green, var(--color-brand));
    }
    .enlarge__info-title {
      font-size: 1rem;
      font-weight: 600;
      color: var(--about-ink, var(--color-text));
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .enlarge__info-meta {
      font-family: var(--font-dm-sans, system-ui, sans-serif);
      font-size: 0.8rem;
      color: var(--about-muted, var(--color-text-muted));
    }
    .enlarge__info-link {
      flex-shrink: 0;
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      padding: 0 1rem;
      border-radius: 999px;
      background: var(--about-ink, var(--color-text));
      color: var(--color-text-on-dark);
      font-family: var(--font-dm-sans, system-ui, sans-serif);
      font-size: 0.82rem;
      font-weight: 600;
      text-decoration: none;
      white-space: nowrap;
    }
    .enlarge__info-link:focus-visible,
    .enlarge__close:focus-visible {
      outline: 2px solid var(--about-green, var(--color-brand));
      outline-offset: 2px;
    }
    .enlarge__close {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 44px;
      height: 44px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 0;
      border-radius: 999px;
      background: var(--color-glass-bg);
      color: var(--color-text);
      font-size: 14px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 320ms ease;
      box-shadow: 0 6px 18px -10px rgba(23, 23, 21, 0.4);
    }
    .viewer-frame {
      width: 100%;
      height: 100%;
      max-width: min(92vw, var(--viewer-max-w, 1200px));
      max-height: min(90svh, var(--viewer-max-h, 820px));
      margin: auto;
    }
    @media (max-width: 640px) {
      .enlarge__info {
        flex-direction: column;
        align-items: stretch;
      }
      .enlarge__info-link {
        justify-content: center;
      }
    }
    body.dg-scroll-lock {
      overflow: hidden !important;
      touch-action: none !important;
      overscroll-behavior: contain !important;
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cssStyles }} />
      <div
        ref={rootRef}
        className="sphere-root relative h-full w-full"
        style={
          {
            "--segments-x": segments,
            "--segments-y": segments,
            "--overlay-blur-color": overlayBlurColor,
            "--tile-radius": imageBorderRadius,
            "--enlarge-radius": openedImageBorderRadius,
            "--viewer-max-w": viewerMaxWidth,
            "--viewer-max-h": viewerMaxHeight,
            "--image-filter": grayscale ? "grayscale(1)" : "none",
          } as CSSProperties
        }
      >
        <main
          ref={mainRef}
          className="absolute inset-0 grid select-none place-items-center overflow-hidden bg-transparent"
          style={{
            touchAction: "none",
            WebkitUserSelect: "none",
            cursor: "grab",
          }}
        >
          <div className="stage">
            <div ref={sphereRef} className="sphere">
              {items.map((it, i) => {
                const isPriority = priorityKeys.has(`${it.x},${it.y}`);
                const ariaLabel = it.propertyName ? `Open ${it.propertyName}` : it.alt || "Open image";
                return (
                  <div
                    key={`${it.x},${it.y},${i}`}
                    className="sphere-item absolute m-auto"
                    data-src={it.src}
                    data-alt={it.alt}
                    data-property-name={it.propertyName || ""}
                    data-city={it.city || ""}
                    data-href={it.href || ""}
                    data-offset-x={it.x}
                    data-offset-y={it.y}
                    data-size-x={it.sizeX}
                    data-size-y={it.sizeY}
                    style={
                      {
                        "--offset-x": it.x,
                        "--offset-y": it.y,
                        "--item-size-x": it.sizeX,
                        "--item-size-y": it.sizeY,
                        top: "-999px",
                        bottom: "-999px",
                        left: "-999px",
                        right: "-999px",
                      } as CSSProperties
                    }
                  >
                    <div
                      className="item__image absolute block cursor-pointer overflow-hidden transition-transform duration-300"
                      role="button"
                      tabIndex={0}
                      aria-label={ariaLabel}
                      onClick={(e) => {
                        if (draggingRef.current) return;
                        if (movedRef.current) return;
                        if (performance.now() - lastDragEndAt.current < 80) return;
                        if (openingRef.current) return;
                        openItemFromElement(e.currentTarget as HTMLElement);
                      }}
                      onKeyDown={(e) => {
                        if (e.key !== "Enter" && e.key !== " ") return;
                        e.preventDefault();
                        openItemFromElement(e.currentTarget as HTMLElement);
                      }}
                      onPointerUp={(e) => {
                        if ((e.nativeEvent as PointerEvent).pointerType !== "touch") return;
                        if (draggingRef.current) return;
                        if (movedRef.current) return;
                        if (performance.now() - lastDragEndAt.current < 80) return;
                        if (openingRef.current) return;
                        openItemFromElement(e.currentTarget as HTMLElement);
                      }}
                    >
                      <DomeTile src={it.src} alt={it.alt} priority={isPriority} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div
            className="pointer-events-none absolute inset-0 z-[3] m-auto"
            style={{
              backgroundImage: `radial-gradient(rgba(235, 235, 235, 0) 65%, var(--overlay-blur-color, ${overlayBlurColor}) 100%)`,
            }}
          />

          <div
            className="pointer-events-none absolute inset-0 z-[3] m-auto"
            style={{
              WebkitMaskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
              maskImage: `radial-gradient(rgba(235, 235, 235, 0) 70%, var(--overlay-blur-color, ${overlayBlurColor}) 90%)`,
              backdropFilter: "blur(3px)",
            }}
          />

          <div
            className="pointer-events-none absolute left-0 right-0 top-0 z-[5] h-[120px] rotate-180"
            style={{ background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))` }}
          />
          <div
            className="pointer-events-none absolute bottom-0 left-0 right-0 z-[5] h-[120px]"
            style={{ background: `linear-gradient(to bottom, transparent, var(--overlay-blur-color, ${overlayBlurColor}))` }}
          />

          <div
            ref={viewerRef}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
            style={{ padding: "var(--viewer-pad)" }}
          >
            <div
              ref={scrimRef}
              className="scrim pointer-events-none absolute inset-0 z-10 opacity-0 transition-opacity duration-500"
              style={{
                background:
                  "radial-gradient(circle at 50% 40%, rgba(35, 32, 27, 0.28), rgba(23, 23, 21, 0.44) 78%)",
                backdropFilter: "blur(6px) saturate(0.9)",
                WebkitBackdropFilter: "blur(6px) saturate(0.9)",
              }}
            />
            <div ref={frameRef} className="viewer-frame flex" />
          </div>
        </main>
      </div>
    </>
  );
}
