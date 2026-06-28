import "@/components/auth/auth-page.css";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Reset password — Summerhouses Bali",
  description: "Reset your Summerhouses account password with a secure email code.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="auth-shell">
      <aside className="auth-left">
        <div className="auth-topbar">
          <Link href="/" className="auth-brand auth-brand--logo">
            <img
              src="/SUMMERHOUSE_LOGO_PROJECT_1.svg"
              alt="Summerhouses Bali"
              className="auth-brand-logo-img"
            />
          </Link>
        </div>

        <div className="auth-form-wrap">
          <Suspense fallback={null}>
            <ForgotPasswordForm />
          </Suspense>
        </div>

        <p className="auth-legal">
          By continuing you agree to our <Link href="/contact">Terms</Link> and{" "}
          <Link href="/contact">Privacy Policy</Link>.
        </p>
      </aside>

      <aside className="auth-right">
        <div className="auth-right-image">
          <Image
            src="/homepage_villa/curated-4-pool.webp"
            alt="Summerhouses Bali villa pool"
            fill
            sizes="(max-width: 960px) 100vw, 55vw"
            priority
          />
        </div>

        <div className="auth-right-content">
          <span className="auth-right-tagline">Account recovery</span>
          <div className="auth-right-quote">
            <h2>Back to planning your Bali stay.</h2>
            <p>
              Reset your password with a one-time code, then continue where you left off —
              saved villas, concierge notes, and bookings still waiting.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
