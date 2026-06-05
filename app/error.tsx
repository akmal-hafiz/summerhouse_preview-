"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app:error-boundary]", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <main className="app-error-shell">
      <section className="app-error-card">
        <p>Summerhouses Bali</p>
        <h1>Something paused for a moment.</h1>
        <span>
          We could not refresh this page properly. Please try again, or return to the villa collection.
        </span>
        <div>
          <button type="button" onClick={reset}>Try again</button>
          <Link href="/villas">View villas</Link>
        </div>
      </section>
    </main>
  );
}
