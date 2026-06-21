"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { setStoredAuth, type AuthUser } from "@/lib/auth-client";
import { hydrateWishlistFromRemote } from "@/components/villas/savedVillas";

type Payload = {
  token: string;
  user: AuthUser;
};

export default function GoogleCompleteClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"working" | "error">("working");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const next = searchParams.get("next") || "/";
    const fragment = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
    const params = new URLSearchParams(fragment);
    const payloadRaw = params.get("payload");

    if (!payloadRaw) {
      setStatus("error");
      setErrorMsg("Missing Google sign-in payload.");
      return;
    }

    try {
      const decoded = atob(payloadRaw);
      const parsed = JSON.parse(decoded) as Payload;
      if (!parsed.token || !parsed.user) {
        throw new Error("Invalid payload");
      }
      setStoredAuth(parsed.token, parsed.user);

      // Strip fragment so token doesn't sit in the URL.
      window.history.replaceState(null, "", window.location.pathname);

      // Sync wishlist in background.
      hydrateWishlistFromRemote().catch(() => undefined);

      const safeNext = next.startsWith("/") ? next : "/";
      router.replace(safeNext);
      router.refresh();
    } catch (e) {
      setStatus("error");
      setErrorMsg((e as Error).message || "Failed to complete sign-in.");
    }
  }, [router, searchParams]);

  if (status === "error") {
    return (
      <div className="auth-form">
        <p className="auth-eyebrow">Sign-in</p>
        <h1 className="auth-heading">Sign-in could not be completed</h1>
        <p className="auth-subheading">{errorMsg || "Please try again."}</p>
        <a href="/login" className="auth-submit" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <div className="auth-form">
      <p className="auth-eyebrow">One moment</p>
      <h1 className="auth-heading">Completing your sign-in…</h1>
      <p className="auth-subheading">Hold on — we&apos;re bringing you back to where you left off.</p>
    </div>
  );
}
