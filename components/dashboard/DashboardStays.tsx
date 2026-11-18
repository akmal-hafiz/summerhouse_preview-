"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { sessionFetch } from "@/lib/auth-client";
import { useAuthModal } from "@/components/providers/AuthModalProvider";
import DashboardVillaThumb from "./DashboardVillaThumb";

type Stay = {
  bookingId: string;
  propertyId: string;
  villaName: string | null;
  villaImage: string | null;
  arrival: string;
  departure: string;
  status: "Booked" | "Canceled";
  lastVerifiedAt: string;
};

type StaysResponse = {
  success: boolean;
  emailVerificationRequired: boolean;
  stays: Stay[];
};

function baliToday(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Makassar", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const read = (type: string) => parts.find((part) => part.type === type)?.value || "00";
  return `${read("year")}-${read("month")}-${read("day")}`;
}

function dateLabel(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function StayRow({ stay }: { stay: Stay }) {
  const name = stay.villaName || "Villa no longer in the current collection";
  return (
    <article className="dash-stay-row">
      <div className="dash-stay-image">
        <DashboardVillaThumb src={stay.villaImage} alt={stay.villaName || ""} />
      </div>
      <div className="dash-stay-details">
        <div className="dash-stay-heading">
          <h3>{name}</h3>
          <span className={stay.status === "Canceled" ? "dash-stay-status is-canceled" : "dash-stay-status"}>{stay.status}</span>
        </div>
        <p>{dateLabel(stay.arrival)} to {dateLabel(stay.departure)}</p>
        <small>Lodgify booking #{stay.bookingId}</small>
      </div>
      {stay.villaName && (
        <Link href={`/villas/${stay.propertyId}`} className="dash-stay-link">View villa</Link>
      )}
    </article>
  );
}

function StayGroup({ title, stays }: { title: string; stays: Stay[] }) {
  if (stays.length === 0) return null;
  return (
    <section className="dash-stay-group" aria-label={title}>
      <h2>{title}</h2>
      <div className="dash-stay-list">{stays.map((stay) => <StayRow key={stay.bookingId} stay={stay} />)}</div>
    </section>
  );
}

export default function DashboardStays() {
  const { openAuth } = useAuthModal();
  const [data, setData] = useState<StaysResponse | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error" | "expired" | "notReady">("loading");

  const load = useCallback(async (signal?: AbortSignal) => {
    setState("loading");
    try {
      const response = await sessionFetch("my-stays", { signal });
      if (signal?.aborted) return;
      if (response.status === 401) { setState("expired"); return; }
      // 404: the server has booking history switched off. This is calm, not a fault; 503 stays an error below.
      if (response.status === 404) { setState("notReady"); return; }
      if (!response.ok) throw new Error("My stays are unavailable");
      const payload = await response.json() as StaysResponse;
      if (!payload.success || !Array.isArray(payload.stays)) throw new Error("Invalid stays response");
      setData(payload);
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

  const today = baliToday();
  const stays = data?.stays || [];
  const upcoming = stays.filter((stay) => stay.status === "Booked" && stay.departure >= today)
    .sort((a, b) => a.arrival.localeCompare(b.arrival));
  const past = stays.filter((stay) => stay.status === "Booked" && stay.departure < today)
    .sort((a, b) => b.arrival.localeCompare(a.arrival));
  const canceled = stays.filter((stay) => stay.status === "Canceled")
    .sort((a, b) => b.arrival.localeCompare(a.arrival));

  return (
    <>
      <header className="dash-page-intro dash-page-intro--inner">
        <Link href="/dashboard" className="dash-back-link">Account overview</Link>
        <h1>My stays</h1>
        <p>Your stays with Summerhouses, past and upcoming.</p>
      </header>

      {state === "loading" && <div className="dash-inline-state" role="status">Checking your stays...</div>}
      {state === "error" && (
        <div className="dash-inline-state dash-inline-state--alert" role="alert">
          <p>We could not load your stays. Your bookings are not affected.</p>
          <button type="button" onClick={() => void load()}>Try again</button>
        </div>
      )}
      {state === "notReady" && (
        <div className="dash-empty-state dash-empty-state--wide">
          <p className="dash-empty-state-title">Your stays will appear here soon.</p>
          <Link href="/dashboard">Back to account overview</Link>
        </div>
      )}
      {state === "expired" && (
        <div className="dash-inline-state dash-inline-state--alert" role="alert">
          <p>Your session has ended. Sign in again to view your stays.</p>
          <button type="button" onClick={() => openAuth("login")}>Sign in</button>
        </div>
      )}
      {state === "ready" && data?.emailVerificationRequired && (
        <div className="dash-empty-state dash-empty-state--wide">
          <p className="dash-empty-state-title">Verify your email to see your stays.</p>
          <p>We show bookings only to the person who made them.</p>
          <Link href="/dashboard/settings">Go to account settings</Link>
        </div>
      )}
      {state === "ready" && !data?.emailVerificationRequired && stays.length === 0 && (
        <div className="dash-empty-state dash-empty-state--wide">
          <p className="dash-empty-state-title">No stays yet.</p>
          <p>Book directly on our website and your stay will show up here.</p>
          <Link href="/villas">Explore villas</Link>
        </div>
      )}
      {state === "ready" && !data?.emailVerificationRequired && stays.length > 0 && (
        <div className="dash-stay-groups">
          <StayGroup title="Upcoming" stays={upcoming} />
          <StayGroup title="Past" stays={past} />
          <StayGroup title="Canceled" stays={canceled} />
        </div>
      )}
    </>
  );
}
