"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
    const cursorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const cursor = cursorRef.current;
        if (!cursor || !window.matchMedia("(pointer: fine) and (min-width: 1024px)").matches) {
            return;
        }

        const mouseMove = (e: MouseEvent) => {
            cursor.style.opacity = "1";
            cursor.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%) scale(${cursor.dataset.hovered === "true" ? 2 : 1})`;
        };

        const mouseOver = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const hovered = Boolean(
                target.tagName === "BUTTON" ||
                target.tagName === "A" ||
                target.closest("button") ||
                target.closest("a") ||
                target.classList.contains("cursor-pointer")
            );

            cursor.dataset.hovered = String(hovered);
            cursor.style.backgroundColor = hovered ? "rgba(68, 107, 74, 0.1)" : "rgba(68, 107, 74, 0)";
        };

        window.addEventListener("mousemove", mouseMove);
        window.addEventListener("mouseover", mouseOver);

        return () => {
            window.removeEventListener("mousemove", mouseMove);
            window.removeEventListener("mouseover", mouseOver);
        };
    }, []);

    return (
        <div
            ref={cursorRef}
            aria-hidden="true"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "2rem",
                height: "2rem",
                borderRadius: "9999px",
                border: "1px solid #446B4A",
                pointerEvents: "none",
                zIndex: 9999,
                opacity: 0,
                transition: "opacity 160ms ease, background-color 160ms ease",
                willChange: "transform",
            }}
        />
    );
}
