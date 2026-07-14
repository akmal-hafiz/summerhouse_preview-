"use client";

import "./auth-page.css";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FiMail, FiShield } from "react-icons/fi";
import { useAuth } from "@/components/providers/AuthProvider";
import { useToast } from "@/components/providers/ToastProvider";
import {
  clearAuthHint,
  getAuthHint,
  lookupIdentifier,
  type AuthHint,
} from "@/lib/auth-client";
import OtpDigitInput from "./OtpDigitInput";
import CountdownRing from "./CountdownRing";
import AuthStatusBanner from "./AuthStatusBanner";
import PasswordInput from "./PasswordInput";
import { safeHttpHref } from "@/lib/safe-url";

type Mode = "login" | "register";

type AuthFormProps = {
  mode: Mode;
  /** When provided, called after successful auth instead of router.push(redirect). Used by modal. */
  onSuccess?: () => void;
  /** When provided, footer "Sign up / Log in" toggle calls this instead of <Link> navigation. Used by modal. */
  onSwitchMode?: (next: Mode) => void;
};

// Step machine — shared between /login and /register pages.
// "identify"     → enter email
// "welcome-back" → existing user (from server lookup OR hint cache) — enter password
// "new-account"  → new user — enter name + password + confirm
// "otp"          → 6-digit code step (registration only)
type Step = "identify" | "welcome-back" | "new-account" | "otp";

const OTP_TOTAL_SECONDS = 600;

function safeRedirectTarget(value: string | null): string {
  const candidate = value?.trim();
  if (!candidate || candidate === "/") return "/";
  if (!candidate.startsWith("/") || candidate.startsWith("//")) return "/";
  if (/[\u0000-\u001F\u007F]/.test(candidate)) return "/";

  try {
    const origin = typeof window === "undefined" ? "http://localhost" : window.location.origin;
    const parsed = new URL(candidate, origin);
    if (parsed.origin !== origin) return "/";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "/";
  }
}

export default function AuthForm({ mode, onSuccess, onSwitchMode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, sendOtp, verifyOtp } = useAuth();
  const toast = useToast();

  const finishAuth = () => {
    if (onSuccess) {
      onSuccess();
      if (redirectTo && redirectTo !== "/") {
        router.push(redirectTo);
      } else {
        router.refresh();
      }
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  };

  const [step, setStep] = useState<Step>("identify");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [maskedEmail, setMaskedEmail] = useState<string | null>(null);
  const [welcomeName, setWelcomeName] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "looking-up" | "sending-otp" | "verifying" | "logging-in" | null
  >(null);
  const [adminGate, setAdminGate] = useState<{ name: string; redirectUrl: string } | null>(null);
  const [otpHasError, setOtpHasError] = useState(false);

  // Hydrate from hint cache — Airbnb's "Welcome back" without a network call.
  // Only applied to login page; register page always starts at "identify".
  useEffect(() => {
    if (mode !== "login") return;
    const hint: AuthHint | null = getAuthHint();
    if (hint) {
      setEmail(hint.email);
      setMaskedEmail(hint.maskedEmail);
      setWelcomeName(hint.name);
      setStep("welcome-back");
    }
  }, [mode]);

  

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const adminUrl = safeHttpHref(process.env.NEXT_PUBLIC_CMS_ADMIN_URL || "http://localhost:8000/admin", "/dashboard");
  const redirectTo = safeRedirectTarget(searchParams.get("redirect"));

  const resetToIdentify = () => {
    setStep("identify");
    setEmail("");
    setMaskedEmail(null);
    setWelcomeName(null);
    setPassword("");
    setPasswordConfirmation("");
    setName("");
    setOtpCode("");
    setError(null);
    setInfo(null);
    clearAuthHint();
  };

  const handleLookup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    setPendingAction("looking-up");
    try {
      const res = await lookupIdentifier(email);
      if (res.exists) {
        setWelcomeName(res.name || null);
        setMaskedEmail(res.masked_email || email);
        setStep("welcome-back");
      } else {
        // Register page or unknown email → collect signup details.
        setStep("new-account");
      }
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } }).data;
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      setError(firstError || data?.message || (err as Error).message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
      setPendingAction(null);
    }
  };

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    setPendingAction("logging-in");
    try {
      const user = await login(email, password);
      if (user.isAdmin) {
        setAdminGate({ name: user.name, redirectUrl: adminUrl });
      } else {
        toast.success({ title: "Welcome back", message: "Your Summerhouse account is ready." });
        finishAuth();
      }
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } }).data;
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      const message = firstError || data?.message || (err as Error).message || "Something went wrong";
      setError(message);
      toast.error({ title: "Could not log in", message });
    } finally {
      setIsSubmitting(false);
      setPendingAction(null);
    }
  };

  const handleSendOtp = async (e?: FormEvent<HTMLFormElement>) => {
    e?.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    setPendingAction("sending-otp");
    try {
      if (password !== passwordConfirmation) {
        throw new Error("Passwords do not match");
      }
      if (password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      const response = await sendOtp(email, name);
      if (!response.success) {
        throw new Error(response.message || "Failed to send OTP");
      }
      const expiresInSec = response.expires_in ?? OTP_TOTAL_SECONDS;
      setOtpExpiresAt(Date.now() + expiresInSec * 1000);
      setResendCooldown(60);
      setStep("otp");
      setOtpCode("");
      setOtpHasError(false);
      setInfo(`Kode verifikasi terkirim ke ${email}. Cek inbox dan folder spam.`);
      toast.info({ title: "Verification code sent", message: "Check your inbox and spam folder." });
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } }).data;
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      const message = firstError || data?.message || (err as Error).message || "Something went wrong";
      setError(message);
      toast.error({ title: "Could not send code", message });
    } finally {
      setIsSubmitting(false);
      setPendingAction(null);
    }
  };

  const handleVerifyOtp = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);
    setPendingAction("verifying");
    try {
      const user = await verifyOtp(name, email, otpCode, password, passwordConfirmation);
      setInfo("Akun berhasil dibuat. Mengalihkan...");
      if (user.isAdmin) {
        setAdminGate({ name: user.name, redirectUrl: adminUrl });
      } else {
        toast.success({ title: "Account created", message: "Welcome to Summerhouse Bali." });
        finishAuth();
      }
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } }).data;
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      setOtpHasError(true);
      setTimeout(() => setOtpHasError(false), 400);
      const message = firstError || data?.message || (err as Error).message || "Something went wrong";
      setError(message);
      toast.error({ title: "Code not accepted", message });
    } finally {
      setIsSubmitting(false);
      setPendingAction(null);
    }
  };

  if (adminGate) {
    return (
      <div className="auth-admin-gate">
        <div className="auth-admin-icon"><FiShield aria-hidden="true" /></div>
        <h1 className="auth-heading">{adminGate.name}</h1>
        <p className="auth-subheading">
          Admin access detected. Continue to the CMS dashboard to manage your villas, content, and bookings.
        </p>
        <a className="auth-submit" href={adminGate.redirectUrl}>
          Open admin dashboard
        </a>
        <Link href="/" className="auth-secondary">Stay on site</Link>
      </div>
    );
  }

  const switchLink = mode === "login" ? "/?auth=register" : "/?auth=login";
  const switchLabel = mode === "login" ? "Sign up" : "Log in";
  const switchTarget: Mode = mode === "login" ? "register" : "login";

  // ─── Render per step ──────────────────────────────────────

  if (step === "identify") {
    return (
      <div className="auth-form">
        <div className="auth-modal-brand" aria-hidden="true">
          <img src="/SUMMERHOUSE_LOGO_PROJECT_1.svg" alt="" />
        </div>
        <h1 className="auth-heading-airbnb">Log in or sign up</h1>

        <form onSubmit={handleLookup} className="auth-fields">
          <div className="auth-field">
            <label htmlFor="auth-email" className="sr-only">Email</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="Email"
              required
              autoFocus
            />
          </div>

          {pendingAction === "looking-up" && (
            <AuthStatusBanner variant="sending" message="Memeriksa email..." />
          )}
          {!pendingAction && error && <AuthStatusBanner variant="error" message={error} />}

          <button
            type="submit"
            className="auth-submit"
            disabled={isSubmitting}
            data-loading={isSubmitting ? "true" : undefined}
          >
            Continue
          </button>
        </form>

        <p className="auth-footer">
          {mode === "login" ? "Don't have an account?" : "Already have one?"}{" "}
          {onSwitchMode ? (
            <button type="button" className="auth-text-link auth-text-link--inline" onClick={() => onSwitchMode(switchTarget)}>
              {switchLabel}
            </button>
          ) : (
            <Link href={switchLink}>{switchLabel}</Link>
          )}
        </p>
      </div>
    );
  }

  if (step === "welcome-back") {
    const initial = (welcomeName || email || "?").trim().charAt(0).toUpperCase();
    return (
      <div className="auth-form">
        <div className="auth-avatar" aria-hidden="true">{initial}</div>
        <h1 className="auth-heading-airbnb">
          Welcome back{welcomeName ? `, ${welcomeName}` : ""}
        </h1>
        <div className="auth-masked-email">
          <FiMail aria-hidden="true" />
          <span>{maskedEmail || email}</span>
        </div>

        <form onSubmit={handleLogin} className="auth-fields auth-fields--tight">
          <div className="auth-field">
            <label htmlFor="auth-password" className="sr-only">Password</label>
            <PasswordInput
              id="auth-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Password"
              required
              autoFocus
            />
          </div>

          <div className="auth-field-row">
            <Link href="/forgot-password" className="auth-forgot">Forgot password?</Link>
          </div>

          {pendingAction === "logging-in" && (
            <AuthStatusBanner variant="sending" message="Masuk ke akun..." />
          )}
          {!pendingAction && error && <AuthStatusBanner variant="error" message={error} />}

          <button
            type="submit"
            className="auth-submit"
            disabled={isSubmitting}
            data-loading={isSubmitting ? "true" : undefined}
          >
            Log in
          </button>
        </form>

        <button type="button" onClick={resetToIdentify} className="auth-text-link">
          Not you?
        </button>
      </div>
    );
  }

  if (step === "new-account") {
    return (
      <div className="auth-form">
        <h1 className="auth-heading-airbnb">Finish signing up</h1>
        <p className="auth-subheading auth-subheading--center">
          We&apos;ll send a Summerhouse verification code to <strong>{email}</strong>.
        </p>

        <form onSubmit={handleSendOtp} className="auth-fields">
          <div className="auth-field">
            <label htmlFor="auth-name" className="sr-only">Full name</label>
            <input
              id="auth-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              placeholder="Full name"
              required
              autoFocus
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password" className="sr-only">Password</label>
            <PasswordInput
              id="auth-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Password, minimum 8 characters"
              required
              minLength={8}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password-confirm" className="sr-only">Confirm password</label>
            <PasswordInput
              id="auth-password-confirm"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              autoComplete="new-password"
              placeholder="Confirm password"
              required
              minLength={8}
            />
          </div>

          {pendingAction === "sending-otp" && (
            <AuthStatusBanner variant="sending" message={`Mengirim kode ke ${email}...`} />
          )}
          {!pendingAction && error && <AuthStatusBanner variant="error" message={error} />}

          <button
            type="submit"
            className="auth-submit"
            disabled={isSubmitting}
            data-loading={isSubmitting ? "true" : undefined}
          >
            Send verification code
          </button>
        </form>

        <button type="button" onClick={resetToIdentify} className="auth-text-link">
          Use a different email
        </button>
      </div>
    );
  }

  // step === "otp"
  return (
    <div className="auth-form">
      <h1 className="auth-heading-airbnb">Check your email</h1>
      <p className="auth-subheading auth-subheading--center">
        We sent a verification code to <strong>{email}</strong>. Enter it below.
      </p>

      <form onSubmit={handleVerifyOtp} className="auth-fields">
        <div className="auth-otp-cluster">
          <OtpDigitInput
            value={otpCode}
            onChange={(next) => { setOtpCode(next); if (otpHasError) setOtpHasError(false); }}
            disabled={isSubmitting}
            hasError={otpHasError}
          />

          <div className="auth-otp-meta-row">
            <CountdownRing
              expiresAt={otpExpiresAt}
              totalSeconds={OTP_TOTAL_SECONDS}
              label="left"
              expiredLabel="Expired"
            />
            <div className="auth-otp-meta-copy">
              <span className="auth-otp-meta-eyebrow">Kode dikirim ke</span>
              <span className="auth-otp-meta-title">{email}</span>
            </div>
            {resendCooldown > 0 ? (
              <span className="auth-resend-cooldown">{resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={() => handleSendOtp()}
                disabled={isSubmitting}
                className="auth-resend-pill"
              >
                Kirim ulang
              </button>
            )}
          </div>
        </div>

        {pendingAction === "verifying" && (
          <AuthStatusBanner variant="sending" message="Memverifikasi kode..." />
        )}
        {!pendingAction && error && <AuthStatusBanner variant="error" message={error} />}
        {!pendingAction && info && !error && <AuthStatusBanner variant="success" message={info} />}

        <button
          type="submit"
          className="auth-submit"
          disabled={isSubmitting}
          data-loading={isSubmitting ? "true" : undefined}
        >
          Verify and create account
        </button>
      </form>

      <button
        type="button"
        onClick={() => { setStep("new-account"); setOtpCode(""); setError(null); setInfo(null); }}
        className="auth-text-link"
      >
        Back
      </button>
    </div>
  );
}
