"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { FiArrowRight } from "react-icons/fi";
import { sessionFetch } from "@/lib/auth-client";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import { sortCoupons, type MemberCoupon } from "./dashboardFormat";
import OfferRow, { type CopyState } from "./OfferRow";
import DashboardSkeletonRows from "./DashboardSkeletonRows";
import { COPY_FAILED, copyCode } from "./copyCode";

type CouponsResponse = { success: boolean; coupons: MemberCoupon[] };

export default function DashboardCoupons() {
  const { openAuth } = useAuthModal();
  const [coupons, setCoupons] = useState<MemberCoupon[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error" | "expired">("loading");
  const [copyState, setCopyState] = useState<CopyState>(null);
  const [announcement, setAnnouncement] = useState("");
  const resetTimer = useRef<number | undefined>(undefined);
  const announceTimer = useRef<number | undefined>(undefined);
  const heading = useRef<HTMLHeadingElement>(null);
  // Try again leaves the page while the list reloads, so keyboard focus moves to the page heading first.
  const retry = () => { heading.current?.focus(); void load(); };

  const load = useCallback(async (signal?: AbortSignal) => {
    setState("loading");
    try {
      const response = await sessionFetch("coupons", { signal });
      if (signal?.aborted) return;
      if (response.status === 401) { setState("expired"); return; }
      if (!response.ok) throw new Error("Offers are unavailable");
      const payload = await response.json() as CouponsResponse;
      if (!payload.success || !Array.isArray(payload.coupons)) throw new Error("Invalid offers response");
      setCoupons(sortCoupons(payload.coupons));
      setState("ready");
    } catch {
      if (!signal?.aborted) setState("error");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => { controller.abort(); window.clearTimeout(resetTimer.current); window.clearTimeout(announceTimer.current); };
  }, [load]);

  // Empty the live region first and refill it on the next tick, so a repeated message is announced again.
  const announce = (message: string) => {
    window.clearTimeout(announceTimer.current);
    setAnnouncement("");
    announceTimer.current = window.setTimeout(() => setAnnouncement(message), 50);
  };

  const copy = async (code: string, codeNode: HTMLElement | null) => {
    window.clearTimeout(resetTimer.current);
    if (await copyCode(code, codeNode)) {
      setCopyState({ code, result: "copied" });
      announce("Code copied.");
      resetTimer.current = window.setTimeout(() => { setCopyState(null); setAnnouncement(""); }, 2400);
    } else {
      setCopyState({ code, result: "failed" });
      announce(COPY_FAILED);
    }
  };

  return (
    <>
      <header className="dash-page-intro dash-page-intro--inner">
        <Link href="/dashboard" className="dash-back-link">Account overview</Link>
        <h1 ref={heading} tabIndex={-1}>Offers for you</h1>
        <p>Codes available to members. Apply one when you check prices.</p>
      </header>

      <p className="dash-visually-hidden" aria-live="polite">{announcement}</p>

      {state === "loading" && <DashboardSkeletonRows label="Loading your offers" />}
      {state === "error" && (
        <div className="dash-inline-state dash-inline-state--alert" role="alert">
          <p>Your offers are temporarily unavailable. Please try again in a moment.</p>
          <button type="button" onClick={retry}>Try again</button>
        </div>
      )}
      {state === "expired" && (
        <div className="dash-inline-state dash-inline-state--alert" role="alert">
          <p>Your session has ended. Sign in again to view your offers.</p>
          <button type="button" onClick={() => openAuth("login")}>Sign in</button>
        </div>
      )}
      {state === "ready" && coupons.length === 0 && (
        <div className="dash-empty-state dash-empty-state--wide">
          <p className="dash-empty-state-title">No offers right now.</p>
          <p>When a new code is available it will appear here.</p>
          <Link href="/villas">Explore villas <FiArrowRight aria-hidden="true" /></Link>
        </div>
      )}
      {state === "ready" && coupons.length > 0 && (
        <section aria-label="Offers for you">
          <div className="dash-stay-list">
            {coupons.map((coupon) => <OfferRow key={coupon.code} coupon={coupon} copy={(code, node) => void copy(code, node)} copyState={copyState} />)}
          </div>
        </section>
      )}
    </>
  );
}
