"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { FiShield } from "react-icons/fi";
import { useAuth } from "@/components/providers/AuthProvider";
import OtpDigitInput from "./OtpDigitInput";
import CountdownRing from "./CountdownRing";
import AuthStatusBanner from "./AuthStatusBanner";
import PasswordInput from "./PasswordInput";

type Mode = "login" | "register";

type AuthFormProps = {
  mode: Mode;
};

type RegisterStep = "details" | "otp";

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, sendOtp, verifyOtp } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [registerStep, setRegisterStep] = useState<RegisterStep>("details");
  const [otpExpiresAt, setOtpExpiresAt] = useState<number | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingAction, setPendingAction] = useState<"sending-otp" | "verifying" | "logging-in" | null>(null);
  const [adminGate, setAdminGate] = useState<{ name: string; redirectUrl: string } | null>(null);
  const [otpHasError, setOtpHasError] = useState(false);

  const OTP_TOTAL_SECONDS = 600;

  // Resend cooldown ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  const adminUrl = process.env.NEXT_PUBLIC_CMS_ADMIN_URL || "http://localhost:8000/admin";
  const redirectTo = searchParams.get("redirect") || "/";

  const handleSendOtp = async () => {
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
      setRegisterStep("otp");
      setOtpCode("");
      setOtpHasError(false);
      setInfo(`Kode 6 digit terkirim ke ${email}. Cek inbox dan folder spam.`);
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } }).data;
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      setError(firstError || data?.message || (err as Error).message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
      setPendingAction(null);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        setPendingAction("logging-in");
        const user = await login(email, password);
        if (user.isAdmin) {
          setAdminGate({ name: user.name, redirectUrl: adminUrl });
        } else {
          router.push(redirectTo);
          router.refresh();
        }
      } else {
        // Register mode
        if (registerStep === "details") {
          await handleSendOtp();
        } else {
          // OTP verify step
          setPendingAction("verifying");
          const user = await verifyOtp(name, email, otpCode, password, passwordConfirmation);
          setInfo("Akun berhasil dibuat. Mengalihkan...");
          if (user.isAdmin) {
            setAdminGate({ name: user.name, redirectUrl: adminUrl });
          } else {
            router.push(redirectTo);
            router.refresh();
          }
        }
      }
    } catch (err: unknown) {
      const data = (err as { data?: { errors?: Record<string, string[]>; message?: string } }).data;
      const firstError = data?.errors ? Object.values(data.errors).flat()[0] : null;
      if (registerStep === "otp") {
        setOtpHasError(true);
        setTimeout(() => setOtpHasError(false), 400);
      }
      setError(firstError || data?.message || (err as Error).message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
      setPendingAction(null);
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
      <p className="auth-eyebrow">
        {mode === "login" ? "Sign in" : registerStep === "otp" ? "Verify email" : "New here"}
      </p>
      <h1 className="auth-heading">
        {mode === "login"
          ? "Welcome back to Bali."
          : registerStep === "otp"
            ? "Check your email"
            : "Begin your Bali story."}
      </h1>
      <p className="auth-subheading">
        {mode === "login"
          ? "Sign in to keep your saved villas synced, revisit your inquiries, and continue planning your next stay."
          : registerStep === "otp"
            ? `We sent a 6-digit code to ${email}. Enter it below to finish creating your account.`
            : "Create an account to save private villas, track your shortlist across devices, and book with a personal concierge."}
      </p>

      <form onSubmit={handleSubmit} className="auth-fields">
        {mode === "register" && registerStep === "details" && (
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

        {(mode === "login" || (mode === "register" && registerStep === "details")) && (
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
        )}

        {(mode === "login" || (mode === "register" && registerStep === "details")) && (
          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <PasswordInput
              id="auth-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder={mode === "register" ? "Minimum 8 characters" : "Enter your password"}
              required
              minLength={mode === "register" ? 8 : undefined}
            />
          </div>
        )}

        {mode === "register" && registerStep === "details" && (
          <div className="auth-field">
            <label htmlFor="auth-password-confirm">Confirm password</label>
            <PasswordInput
              id="auth-password-confirm"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              autoComplete="new-password"
              placeholder="Repeat your password"
              required
              minLength={8}
            />
          </div>
        )}

        {mode === "register" && registerStep === "otp" && (
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
                  onClick={handleSendOtp}
                  disabled={isSubmitting}
                  className="auth-resend-pill"
                >
                  Kirim ulang
                </button>
              )}
            </div>
          </div>
        )}

        {mode === "login" && (
          <div className="auth-field-row">
            <label className="auth-checkbox">
              <input type="checkbox" />
              <span>Keep me signed in</span>
            </label>
            <Link href="/forgot-password" className="auth-forgot">Forgot password?</Link>
          </div>
        )}

        {pendingAction === "sending-otp" && (
          <AuthStatusBanner variant="sending" message={`Mengirim kode ke ${email}...`} />
        )}
        {pendingAction === "verifying" && (
          <AuthStatusBanner variant="sending" message="Memverifikasi kode dan menyiapkan akun..." />
        )}
        {pendingAction === "logging-in" && (
          <AuthStatusBanner variant="sending" message="Masuk ke akun..." />
        )}
        {!pendingAction && error && <AuthStatusBanner variant="error" message={error} />}
        {!pendingAction && info && !error && <AuthStatusBanner variant="success" message={info} />}

        <button
          type="submit"
          className="auth-submit"
          disabled={isSubmitting}
          data-loading={isSubmitting ? "true" : undefined}
        >
          {mode === "login"
            ? "Sign in to your account"
            : registerStep === "details"
              ? "Send verification code"
              : "Verify and create account"}
        </button>

        {mode === "register" && registerStep === "otp" && (
          <button
            type="button"
            onClick={() => { setRegisterStep("details"); setOtpCode(""); setError(null); setInfo(null); }}
            className="auth-secondary"
            style={{ marginTop: "0.5rem" }}
          >
            Back to details
          </button>
        )}
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
