"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { sessionFetch } from "@/lib/auth-client";
import { historyDatesLine, historyTitle, searchAgainHref, type HistoryItem } from "./dashboardFormat";

// Matches HISTORY_LIMIT in lib/cms-pilot/search-history.ts (server only): the server keeps exactly 4 searches per member.
const SHOWN = 4;

/** The member's latest searches as one quiet list. Loading, an error or an empty history show nothing: the section is a shortcut, not a feature to explain. */
export default function DashboardRecentSearches({ villaNames }: { villaNames: ReadonlyMap<string, string> }) {
  const [items, setItems] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    sessionFetch("search-history", { signal: controller.signal })
      .then(async (response) => (response.ok ? await response.json() as { items?: HistoryItem[] } : null))
      // Only searches made in the search box; villa views are kept for the villa page's date prefill, not shown here.
      .then((payload) => { if (!controller.signal.aborted && Array.isArray(payload?.items)) setItems(payload.items.filter((item) => item.kind === "search").slice(0, SHOWN)); })
      .catch(() => { /* Hidden on failure. */ });
    return () => controller.abort();
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="dash-recent" aria-labelledby="dash-recent-title">
      <div className="dash-section-head">
        <h2 id="dash-recent-title">Recent searches</h2>
      </div>
      <ul className="dash-recent-list">
        {items.map((item, index) => {
          const title = historyTitle(item, villaNames);
          return (
            <li key={item.id} style={{ "--dash-i": index } as React.CSSProperties}>
              <Link href={searchAgainHref(item)} className="dash-recent-row">
                <span className="dash-recent-title">{title}</span>
                <span className="dash-recent-dates">{historyDatesLine(item)}</span>
                <FiArrowRight aria-hidden="true" />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
