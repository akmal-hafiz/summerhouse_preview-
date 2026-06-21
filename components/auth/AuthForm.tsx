"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { FiShield } from "react-icons/fi";
import { useAuth } from "@/components/providers/AuthProvider";

type Mode = "login" | "register";

type AuthFormProps = {
  mode: Mode;
};

const CMS_API_URL = process.env.NEXT_PUBLIC_CMS_API_URL || "http://localhost:8000/api";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21.6 12.227c0-.71-.064-1.39-.182-2.045H12v3.868h5.382a4.6 4.6 0 0 1-1.995 3.018v2.51h3.232c1.89-1.74 2.98-4.305 2.98-7.351z" fill="#4285F4"/>
      <path d="M12 22c2.7 0 4.964-.895 6.618-2.422l-3.232-2.51c-.896.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.596-4.124H3.064v2.59A9.998 9.998 0 0 0 12 22z" fill="#34A853"/>
      <path d="M6.404 13.9a6.003 6.003 0 0 1 0-3.8V7.51H3.064a10 10 0 0 0 0 8.98l3.34-2.59z" fill="#FBBC05"/>
      <path d="M12 5.977c1.468 0 2.787.504 3.823 1.495l2.868-2.868C16.96 2.99 14.695 2 12 2 8.058 2 4.65 4.26 3.064 7.51l3.34 2.59C7.19 7.737 9.395 5.977 12 5.977z" fill="#EA4335"/>
    </svg>
  );
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adminGate, setAdminGate] = useState<{ name: string; redirectUrl: string } | null>(null);

  const adminUrl = process.env.NEXT_PUBLIC_CMS_ADMIN_URL || "http://localhost:8000/admin";
  const redirectTo = searchParams.get("redirect") || "/";
  const googleAuthUrl = `${CMS_API_URL}/v1/auth/google/redirect?redirect=${encodeURIComponent(redirectTo)}`;

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const user = mode === "login"
        ? await login(email, password)
        : await register(name, email, password, passwordConfirmation);

      if (user.isAdmin) {
        setAdminGate({ name: user.name, redirectUrl: adminUrl });
      } else {
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } }).data;
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      setError(firstError || data?.message || (err as Error).message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (adminGate) {
    return (
      <div className="auth-admin-gate">
        <div className="auth-admin-icon"><FiShield aria-hidden="true" /></div>
        <p className="auth-eyebrow">Welcome back</p>
        <h1 className="auth-heading">{adminGate.name}</h1>
        <p className="auth-subheading">
          Admin access detected. Continue to the CMS dashboard to manage your villas, content, and bookings.
        </p>
        <a className="auth-submit" href={adminGate.redirectUrl} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
          Open admin dashboard
        </a>
        <Link href="/" className="auth-secondary">Stay on site</Link>
      </div>
    );
  }

  const loginLink = `/login${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`;
  const registerLink = `/register${redirectTo !== "/" ? `?redirect=${encodeURIComponent(redirectTo)}` : ""}`;

  return (
    <div className="auth-form">
      <p className="auth-eyebrow">{mode === "login" ? "Sign in" : "New here"}</p>
      <h1 className="auth-heading">
        {mode === "login" ? "Welcome back to Bali." : "Begin your Bali story."}
      </h1>
      <p className="auth-subheading">
        {mode === "login"
          ? "Sign in to keep your saved villas synced, revisit your inquiries, and continue planning your next stay."
          : "Create an account to save private villas, track your shortlist across devices, and book with a personal concierge."}
      </p>

      <div className="auth-social">
        <a href={googleAuthUrl} className="auth-social-button">
          <GoogleIcon />
          <span>Continue with Google</span>
        </a>
      </div>

      <div className="auth-divider">or use your email</div>

      <form onSubmit={handleSubmit} className="auth-fields">
        {mode === "register" && (
          <div className="auth-field">
            <label htmlFor="auth-name">Full name</label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Amalia Wijaya"
              required
            />
          </div>
        )}

        <div className="auth-field">
          <label htmlFor="auth-email">Email address</label>
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <div className="auth-field">
          <label htmlFor="auth-password">Password</label>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={mode === "register" ? "Minimum 8 characters" : "Enter your password"}
            required
            minLength={mode === "register" ? 8 : undefined}
          />
        </div>

        {mode === "register" && (
          <div className="auth-field">
            <label htmlFor="auth-password-confirm">Confirm password</label>
            <input
              id="auth-password-confirm"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              autoComplete="new-password"
              placeholder="Repeat your password"
              required
              minLength={8}
            />
          </div>
        )}

        {mode === "login" && (
          <div className="auth-field-row">
            <label className="auth-checkbox">
              <input type="checkbox" />
              <span>Keep me signed in</span>
            </label>
            <Link href="/contact" className="auth-forgot">Forgot password?</Link>
          </div>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button type="submit" className="auth-submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Please wait..."
            : mode === "login"
              ? "Sign in to your account"
              : "Create my account"}
        </button>
      </form>

      <p className="auth-footer">
        {mode === "login" ? (
          <>
            Don&apos;t have an account yet?{" "}
            <Link href={registerLink}>Create one</Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href={loginLink}>Sign in</Link>
          </>
        )}
      </p>
    </div>
  );
}
