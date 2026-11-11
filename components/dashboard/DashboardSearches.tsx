"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FiArrowRight, FiX } from "react-icons/fi";
import { sessionFetch } from "@/lib/auth-client";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import {
  historyGroup, historyTitle, priceLabel, searchAgainHref, seenLabel, stayDatesLabel, stayDatesPassed,
  type HistoryGroup, type HistoryItem,
} from "./dashboardFormat";
import DashboardSkeletonRows from "./DashboardSkeletonRows";

type HistoryResponse = { success: boolean; enabled: boolean; items: HistoryItem[] };
type Props = { villaNames: [string, string][] };

const GROUPS: HistoryGroup[] = ["Today", "This week", "Earlier"];

function SearchRow({ item, title, busy, onRemove, removeRef }: {
  item: HistoryItem; title: string; busy: boolean; onRemove: () => void; removeRef: (node: HTMLButtonElement | null) => void;
}) {
  const dates = stayDatesLabel(item);
  const seen = seenLabel(item.seenAt);
  const hasPrice = item.quotedTotal !== undefined && item.currency;
  const action = item.kind === "view" ? "View villa" : "Search again";
  return (
    <article className="dash-list-row">
      <div className="dash-list-row-main">
        <h3>{title}</h3>
        <p>{stayDatesPassed(item) ? "Dates have passed" : dates ?? (item.kind === "view" ? "Villa you viewed" : "Any dates")}</p>
        <small>
          {hasPrice ? <><strong>{priceLabel(item.quotedTotal as number, item.currency as string)}</strong> seen {seen}</> : <>Seen {seen}</>}
        </small>
      </div>
      <div className="dash-list-row-actions">
        <Link href={searchAgainHref(item)} className="dash-pill dash-pill--quiet" aria-label={`${action}: ${title}${dates ? `, ${dates}` : ""}`}>
          {action}
        </Link>
        <button type="button" ref={removeRef} className="dash-icon-button" onClick={onRemove} disabled={busy}
          aria-label={`Remove ${title}${dates ? `, ${dates}` : ""} from recent searches`}>
          <FiX aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

export default function DashboardSearches({ villaNames }: Props) {
  const { openAuth } = useAuthModal();
  const names = useMemo(() => new Map(villaNames), [villaNames]);
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [state, setState] = useState<"loading" | "ready" | "error" | "expired">("loading");
  const [busyId, setBusyId] = useState<number | null>(null);
  const [pausePending, setPausePending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [actionError, setActionError] = useState("");
  const removeButtons = useRef(new Map<number, HTMLButtonElement>());
  const clearButton = useRef<HTMLButtonElement>(null);
  const keepButton = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    setState("loading");
    try {
      const response = await sessionFetch("search-history", { signal });
      if (signal?.aborted) return;
      if (response.status === 401) { setState("expired"); return; }
      if (!response.ok) throw new Error("Recent searches are unavailable");
      const payload = await response.json() as HistoryResponse;
      if (!payload.success || !Array.isArray(payload.items)) throw new Error("Invalid history response");
      setItems(payload.items);
      setEnabled(payload.enabled !== false);
      setState("ready");
    } catch {
      if (!signal?.aborted) setState("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  useEffect(() => { if (confirming) keepButton.current?.focus(); }, [confirming]);

  // Where keyboard focus goes after the next commit (a removed row or a closed confirmation leaves the DOM).
  // An effect runs after commit even in a background tab, where requestAnimationFrame is paused.
  const focusNext = useRef<(() => HTMLElement | null | undefined) | null>(null);
  useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current()?.focus();
    focusNext.current = null;
  });

  const remove = async (id: number) => {
    setActionError("");
    setBusyId(id);
    const index = items.findIndex((item) => item.id === id);
    try {
      const response = await sessionFetch(`search-history/${id}`, { method: "DELETE" });
      if (response.status === 401) { setState("expired"); return; }
      if (!response.ok) throw new Error("Not removed");
      const next = items.filter((item) => item.id !== id);
      setItems(next);
      // Keep keyboard focus in the list: the row that took this place, the one above it, or the page heading.
      const neighbour = next[index] ?? next[index - 1];
      focusNext.current = () => (neighbour ? removeButtons.current.get(neighbour.id) : heading.current);
    } catch {
      setActionError("This search could not be removed. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  const clearAll = async () => {
    setActionError("");
    setClearing(true);
    try {
      const response = await sessionFetch("search-history", { method: "DELETE" });
      if (response.status === 401) { setState("expired"); return; }
      if (!response.ok) throw new Error("Not cleared");
      setItems([]);
      setConfirming(false);
      focusNext.current = () => heading.current;
    } catch {
      setActionError("Your searches could not be removed. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  const keep = () => {
    focusNext.current = () => clearButton.current;
    setConfirming(false);
  };

  const togglePause = async (nextEnabled: boolean) => {
    setActionError("");
    setPausePending(true);
    try {
      const response = await sessionFetch("search-history/pause", { method: "POST", body: JSON.stringify({ enabled: nextEnabled }) });
      if (response.status === 401) { setState("expired"); return; }
      if (!response.ok) throw new Error("Not changed");
      setEnabled(nextEnabled);
    } catch {
      setActionError("Your saving choice could not be changed. Please try again.");
    } finally {
      setPausePending(false);
    }
  };

  const grouped = GROUPS.map((group) => ({ group, rows: items.filter((item) => historyGroup(item.seenAt) === group) }))
    .filter(({ rows }) => rows.length > 0);
  const count = items.length;

  return (
    <>
      <header className="dash-page-intro dash-page-intro--inner dash-page-intro--tight">
        <Link href="/dashboard" className="dash-back-link">Account overview</Link>
        <h1 ref={heading} tabIndex={-1}>Recent searches</h1>
        <p>Only you can see this. We keep up to 50 searches for 90 days.</p>
      </header>

      {state === "ready" && (
        <div className="dash-history-bar">
          <label className="dash-switch">
            {/* Not disabled while saving the choice: disabling would drop keyboard focus. A change during that moment is ignored. */}
            <input type="checkbox" role="switch" checked={!enabled} aria-busy={pausePending || undefined}
              onChange={(event) => { if (!pausePending) void togglePause(!event.target.checked); }} aria-describedby="dash-history-saving" />
            <span className="dash-switch-track" aria-hidden="true" />
            <span>Pause saving</span>
          </label>
          <span id="dash-history-saving" className="dash-switch-state" aria-live="polite">
            {enabled ? "Saving is on" : "Saving is paused"}
          </span>
          {count > 0 && !confirming && (
            <button type="button" ref={clearButton} className="dash-text-button" onClick={() => setConfirming(true)}>Clear all</button>
          )}
        </div>
      )}

      {state === "ready" && confirming && count > 0 && (
        <div className="dash-confirm" role="group" aria-labelledby="dash-clear-question"
          onKeyDown={(event) => { if (event.key === "Escape" && !clearing) { event.preventDefault(); keep(); } }}>
          <p id="dash-clear-question">Remove all {count} {count === 1 ? "search" : "searches"}? This cannot be undone.</p>
          <div className="dash-confirm-actions">
            <button type="button" className="dash-pill dash-pill--danger" onClick={() => void clearAll()} disabled={clearing}>
              {clearing ? "Removing..." : "Remove"}
            </button>
            <button type="button" ref={keepButton} className="dash-pill dash-pill--quiet" onClick={keep} disabled={clearing}>Keep</button>
          </div>
        </div>
      )}

      {actionError && <p className="dash-action-error" role="alert">{actionError}</p>}

      {state === "loading" && <DashboardSkeletonRows label="Loading your recent searches" />}
      {state === "error" && (
        <div className="dash-inline-state dash-inline-state--alert" role="alert">
          <p>Your recent searches are temporarily unavailable. Nothing has been removed.</p>
          {/* The button leaves the page while the list reloads, so keyboard focus moves to the page heading first. */}
          <button type="button" onClick={() => { heading.current?.focus(); void load(); }}>Try again</button>
        </div>
      )}
      {state === "expired" && (
        <div className="dash-inline-state dash-inline-state--alert" role="alert">
          <p>Your session has ended. Sign in again to view your recent searches.</p>
          <button type="button" onClick={() => openAuth("login")}>Sign in</button>
        </div>
      )}
      {state === "ready" && count === 0 && (
        <div className="dash-empty-state dash-empty-state--wide">
          <p className="dash-empty-state-title">
            {enabled ? "Searches you make while signed in will show up here." : "Saving is paused, so new searches are not recorded."}
          </p>
          <Link href="/villas">Explore villas <FiArrowRight aria-hidden="true" /></Link>
        </div>
      )}
      {state === "ready" && count > 0 && (
        <div className="dash-stay-groups">
          {grouped.map(({ group, rows }) => (
            <section className="dash-stay-group" aria-label={group} key={group}>
              <h2>{group}</h2>
              <div className="dash-stay-list">
                {rows.map((item) => (
                  <SearchRow key={item.id} item={item} title={historyTitle(item, names)} busy={busyId !== null || clearing}
                    onRemove={() => void remove(item.id)}
                    removeRef={(node) => { if (node) removeButtons.current.set(item.id, node); else removeButtons.current.delete(item.id); }} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
