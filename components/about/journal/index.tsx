"use client";

import dynamic from "next/dynamic";

// Dynamic import with no SSR — required for WebGL/Three.js in Next.js
const JournalViewer = dynamic(
  () => import("./JournalViewer").then((m) => ({ default: m.JournalViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] rounded-[32px] bg-[var(--color-surface-dark)] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          <p
            className="text-white/40 text-[12px] tracking-[0.15em] uppercase"
            style={{ fontFamily: "var(--font-dm-sans), sans-serif" }}
          >
            Loading Journal...
          </p>
        </div>
      </div>
    ),
  }
);

export const JournalBookSection = () => {
  return <JournalViewer />;
};
