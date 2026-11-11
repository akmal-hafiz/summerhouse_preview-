"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, useState } from "react";
import { JournalExperience } from "./JournalExperience";
import { journalPages } from "./JournalData";

// ─── UI Overlay ────────────────────────────────────────────────
const JournalUI = ({
  page,
  setPage,
  totalPages,
}: {
  page: number;
  setPage: (n: number) => void;
  totalPages: number;
}) => {
  const currentArticle = journalPages[Math.max(0, page - 1)] ?? journalPages[0];
  const isCover = page === 0;
  const isLastPage = page >= totalPages;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between px-12 py-10">
      {/* Top: Article info */}
      <div className="flex items-start justify-between">
        <div className="pointer-events-auto">
          <p
            className="text-white/50 text-[11px] font-bold tracking-[0.2em] uppercase mb-2"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            {isCover ? "Summerhouse Bali" : currentArticle.category}
          </p>
          <h3
            className="text-white text-[22px] font-medium leading-[1.3] max-w-[280px] tracking-tight"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            {isCover ? "The Journal" : currentArticle.title}
          </h3>
          {!isCover && (
            <p
              className="text-white/60 text-[13px] mt-3 max-w-[260px] leading-[1.6]"
              style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
            >
              {currentArticle.excerpt}
            </p>
          )}
        </div>

        {/* Page indicator */}
        <div className="flex flex-col items-center gap-2">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={`w-[6px] rounded-full transition-all duration-300 pointer-events-auto ${
                i < page
                  ? "h-[6px] bg-white"
                  : i === page
                  ? "h-[16px] bg-white"
                  : "h-[6px] bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom: Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="pointer-events-auto flex items-center gap-3 group disabled:opacity-30 transition-opacity"
          style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white transform group-hover:-translate-x-1 transition-transform"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-white text-[12px] tracking-[0.12em] uppercase">Previous</span>
        </button>

        <span
          className="text-white/40 text-[11px] tracking-widest uppercase"
          style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          {page} / {totalPages - 1}
        </span>

        <button
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={isLastPage}
          className="pointer-events-auto flex items-center gap-3 group disabled:opacity-30 transition-opacity"
          style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
        >
          <span className="text-white text-[12px] tracking-[0.12em] uppercase">Next</span>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="text-white transform group-hover:translate-x-1 transition-transform"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ────────────────────────────────────────────
export const JournalViewer = () => {
  const [page, setPage] = useState(0);
  const totalPages = journalPages.length;

  const pages = journalPages.map((p) => ({ front: p.front, back: p.back }));

  return (
    <div className="relative w-full h-[600px] rounded-[32px] overflow-hidden bg-[var(--color-surface-dark)]">
      {/* Subtle ambient gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[rgba(68,107,74,0.34)] via-transparent to-[var(--color-surface-dark)] pointer-events-none z-[1]" />

      {/* 3D Canvas */}
      <Canvas
        shadows
        camera={{
          position: [-0.5, 1, 4],
          fov: 45,
        }}
      >
        <Suspense fallback={null}>
          <JournalExperience page={page} pages={pages} setPage={setPage} />
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      <JournalUI page={page} setPage={setPage} totalPages={totalPages} />
    </div>
  );
};
