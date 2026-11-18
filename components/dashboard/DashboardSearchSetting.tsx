"use client";

import { useEffect, useRef, useState } from "react";
import { sessionFetch } from "@/lib/auth-client";

type HistoryResponse = { enabled?: boolean; items?: unknown[] };

/** Account settings card: turn recent searches on or off, and clear them. The Overview list itself has no controls. */
export default function DashboardSearchSetting() {
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [count, setCount] = useState(0);
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [cleared, setCleared] = useState(false);
  const clearButton = useRef<HTMLButtonElement>(null);
  const keepButton = useRef<HTMLButtonElement>(null);
  const card = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    sessionFetch("search-history", { signal: controller.signal })
      .then(async (response) => (response.ok ? await response.json() as HistoryResponse : null))
      .then((payload) => {
        if (controller.signal.aborted || !payload) return;
        setEnabled(payload.enabled !== false);
        setCount(Array.isArray(payload.items) ? payload.items.length : 0);
      })
      .catch(() => { /* The card stays hidden. */ });
    return () => controller.abort();
  }, []);

  useEffect(() => { if (confirming) keepButton.current?.focus(); }, [confirming]);

  if (enabled === null) return null;

  const toggle = async (next: boolean) => {
    setError("");
    setBusy(true);
    try {
      const response = await sessionFetch("search-history/pause", { method: "POST", body: JSON.stringify({ enabled: next }) });
      if (!response.ok) throw new Error("Not changed");
      setEnabled(next);
    } catch {
      setError("This could not be changed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const clear = async () => {
    setError("");
    setBusy(true);
    try {
      const response = await sessionFetch("search-history", { method: "DELETE" });
      if (!response.ok) throw new Error("Not cleared");
      setCount(0);
      setConfirming(false);
      setCleared(true);
      card.current?.focus();
    } catch {
      setError("Your searches could not be removed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="dash-settings-card" aria-labelledby="settings-searches-title">
      <h3 id="settings-searches-title" ref={card} tabIndex={-1}>Recent searches</h3>
      <p className="dash-settings-copy">Your latest searches appear on your overview, so you can pick up where you left off.</p>

      <label className="dash-switch">
        {/* Not disabled while saving: disabling would drop keyboard focus. A change during that moment is ignored. */}
        <input type="checkbox" role="switch" checked={enabled} aria-busy={busy || undefined}
          onChange={(event) => { if (!busy) void toggle(event.target.checked); }} />
        <span className="dash-switch-track" aria-hidden="true" />
        <span>Remember my recent searches</span>
      </label>

      {count > 0 && !confirming && (
        <button type="button" ref={clearButton} className="dash-text-button" onClick={() => { setCleared(false); setConfirming(true); }}>
          Clear recent searches
        </button>
      )}
      {confirming && (
        <div className="dash-confirm" role="group" aria-labelledby="settings-clear-question"
          onKeyDown={(event) => { if (event.key === "Escape" && !busy) { event.preventDefault(); setConfirming(false); clearButton.current?.focus(); } }}>
          <p id="settings-clear-question">Remove all recent searches? This cannot be undone.</p>
          <div className="dash-confirm-actions">
            <button type="button" className="dash-pill dash-pill--danger" onClick={() => void clear()} disabled={busy}>{busy ? "Removing..." : "Remove"}</button>
            <button type="button" ref={keepButton} className="dash-pill dash-pill--quiet" disabled={busy}
              onClick={() => { setConfirming(false); requestAnimationFrame(() => clearButton.current?.focus()); }}>Keep</button>
          </div>
        </div>
      )}
      {cleared && <p className="dash-feedback dash-feedback--success" role="status">Your recent searches have been removed.</p>}
      {error && <p className="dash-feedback dash-feedback--error" role="alert">{error}</p>}
    </section>
  );
}
