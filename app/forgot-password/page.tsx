import "@/components/auth/auth-page.css";
import Link from "next/link";
import { Suspense } from "react";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

export const metadata = {
  title: "Reset password | Summerhouses Bali",
  description: "Reset your Summerhouses account password with a secure email code.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="auth-shell">
      <header className="auth-topbar">
        <Link href="/" className="auth-brand" aria-label="Summerhouses Bali home">
          <img
            src="/SUMMERHOUSE_LOGO_PROJECT_1.svg"
            alt="Summerhouses Bali"
            className="auth-brand-logo-img"
          />
        </Link>
      </header>

      <main className="auth-main">
        <div className="auth-card">
          <Suspense fallback={null}>
            <ForgotPasswordForm />
          </Suspense>

          <p className="auth-legal">
            By continuing you agree to our <Link href="/contact">Terms</Link> and{" "}
            <Link href="/contact">Privacy Policy</Link>.
          </p>
        </div>
      </main>
    </div>
  );
}
