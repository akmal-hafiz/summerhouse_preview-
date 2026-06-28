import "@/components/auth/auth-page.css";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: "Create account — Summerhouses Bali",
  description: "Create a Summerhouses account to save villas, plan your stay, and book with a personal concierge.",
};

export default function RegisterPage() {
  return (
    <div className="auth-shell">
      <aside className="auth-left">
        <div className="auth-topbar">
          <Link href="/" className="auth-brand auth-brand--logo" aria-label="Summerhouses Bali home">
            <img
              src="/SUMMERHOUSE_LOGO_PROJECT_1.svg"
              alt="Summerhouses Bali"
              className="auth-brand-logo-img"
            />
          </Link>
        </div>

        <div className="auth-form-wrap">
          <Suspense fallback={null}>
            <AuthForm mode="register" />
          </Suspense>
        </div>

        <p className="auth-legal">
          By creating an account you agree to our{" "}
          <Link href="/contact">Terms</Link> and{" "}
          <Link href="/contact">Privacy Policy</Link>.
        </p>
      </aside>

      <aside className="auth-right">
        <div className="auth-right-image">
          <Image
            src="/homepage_villa/curated-5-lounge.webp"
            alt="Summerhouses Bali villa lounge"
            fill
            sizes="(max-width: 960px) 100vw, 55vw"
            priority
          />
        </div>

        <div className="auth-right-content">
          <span className="auth-right-tagline">A slower kind of island stay</span>

          <div className="auth-right-quote">
            <h2>Save the homes that move you.</h2>
            <p>
              Build a private shortlist of villas you love, share it with your travel partners, and let our concierge
              hold the dates you&apos;re weighing.
            </p>
          </div>

          <div className="auth-right-trust">
            <div>
              <strong>43+</strong>
              <span>Private villas</span>
            </div>
            <div>
              <strong>8</strong>
              <span>Bali regions</span>
            </div>
            <div>
              <strong>5★</strong>
              <span>Guest rating</span>
            </div>
          </div>
        </div>

        <div className="auth-floating auth-floating--card1">
          <p className="auth-floating-eyebrow">Concierge</p>
          <p className="auth-floating-title">Personal trip planner</p>
          <p className="auth-floating-meta">Daily itineraries, dinner reservations, private drivers — handled.</p>
        </div>

        <div className="auth-floating auth-floating--card2">
          <p className="auth-floating-eyebrow">Why members join</p>
          <p className="auth-floating-title">Sync across devices</p>
          <p className="auth-floating-meta">Your shortlist follows you from phone to desktop, instantly.</p>
        </div>
      </aside>
    </div>
  );
}
