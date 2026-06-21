import "@/components/auth/auth-page.css";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import AuthForm from "@/components/auth/AuthForm";

export const metadata = {
  title: "Sign in — Summerhouses Bali",
  description: "Sign in to your Summerhouses account to keep your saved villas synced across devices.",
};

export default function LoginPage() {
  return (
    <div className="auth-shell">
      <aside className="auth-left">
        <div className="auth-topbar">
          <Link href="/" className="auth-brand">
            <span className="auth-brand-mark">S</span>
            <span className="auth-brand-name">
              <strong>Summerhouses</strong>
              <span>Bali private stays</span>
            </span>
          </Link>
          <span className="auth-topbar-availability">Concierge online</span>
        </div>

        <div className="auth-form-wrap">
          <Suspense fallback={null}>
            <AuthForm mode="login" />
          </Suspense>
        </div>

        <p className="auth-legal">
          By continuing you agree to our{" "}
          <Link href="/contact">Terms</Link> and{" "}
          <Link href="/contact">Privacy Policy</Link>.
        </p>
      </aside>

      <aside className="auth-right">
        <div className="auth-right-image">
          <Image
            src="/homepage_villa/curated-6-exterior.webp"
            alt="Summerhouses Bali private villa"
            fill
            sizes="(max-width: 960px) 100vw, 55vw"
            priority
          />
        </div>

        <div className="auth-right-content">
          <span className="auth-right-tagline">Established in Bali</span>

          <div className="auth-right-quote">
            <h2>Private villas, tended like a second home.</h2>
            <p>
              Sign in to revisit the homes you saved, follow our concierge notes, and pick up your planning where
              you left off.
            </p>
          </div>

          <div className="auth-right-trust">
            <div>
              <strong>43+</strong>
              <span>Curated villas</span>
            </div>
            <div>
              <strong>4.9</strong>
              <span>Guest sentiment</span>
            </div>
            <div>
              <strong>24/7</strong>
              <span>Concierge desk</span>
            </div>
          </div>
        </div>

        <div className="auth-floating auth-floating--card1">
          <p className="auth-floating-eyebrow">Saved villa</p>
          <p className="auth-floating-title">Villa Padonan Pererenan</p>
          <p className="auth-floating-meta">3 bedrooms · Pool · Available Mar 14 – 21</p>
        </div>

        <div className="auth-floating auth-floating--card2">
          <p className="auth-floating-eyebrow">Recent review</p>
          <p className="auth-floating-title">&ldquo;Everything was handled.&rdquo;</p>
          <p className="auth-floating-meta">Sarah K. — stayed with us last month</p>
          <p className="auth-floating-stars">★ ★ ★ ★ ★</p>
        </div>
      </aside>
    </div>
  );
}
